from __future__ import annotations

import hashlib
import os
import tempfile
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile

from intermediate_model import Block, DocumentEnvelope, Page, Provenance

app = FastAPI(title="Report Advisor Document Intelligence", version="0.2.0")

MAX_BYTES = int(os.getenv("DOCUMENT_MAX_BYTES", str(50 * 1024 * 1024)))
ALLOWED_MIME = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "text/plain",
    "image/png",
    "image/jpeg",
    "image/tiff",
    "image/webp",
}


def _envelope(data: bytes, filename: str, mime: str, engine: str, warnings: list[str]) -> DocumentEnvelope:
    return DocumentEnvelope(
        schema_version="document-intelligence.v1",
        filename=filename,
        mime_type=mime,
        source_sha256=hashlib.sha256(data).hexdigest(),
        engine=engine,
        status="EXTRACTED",
        metadata={"byte_size": len(data)},
        warnings=warnings,
    )


def parse_with_docling(data: bytes, filename: str, mime: str) -> dict[str, Any] | None:
    """Optional adapter. The canonical intermediate model remains provider-neutral."""
    try:
        from docling.document_converter import DocumentConverter
    except Exception:
        return None

    with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1], delete=True) as tmp:
        tmp.write(data)
        tmp.flush()
        result = DocumentConverter().convert(tmp.name)
        document = result.document
        envelope = _envelope(data, filename, mime, "docling", [])
        envelope.metadata["markdown"] = document.export_to_markdown()
        envelope.pages.append(
            Page(
                number=1,
                blocks=[
                    Block(
                        type="document_markdown",
                        text=envelope.metadata["markdown"],
                        confidence=1.0,
                        provenance=Provenance(
                            source_file=filename,
                            source_sha256=envelope.source_sha256,
                            page=1,
                            parser="docling",
                        ),
                    )
                ],
            )
        )
        return {"document": envelope.to_dict(), "engine": "docling", "warnings": []}


def parse_with_ocr(data: bytes, filename: str, mime: str) -> dict[str, Any] | None:
    """Optional OCR adapter. Never silently converts an unavailable OCR path into success."""
    try:
        from paddleocr import PaddleOCR
    except Exception:
        return None

    try:
        from PIL import Image
        import io
        image = Image.open(io.BytesIO(data))
        result = PaddleOCR(use_doc_orientation_classify=True, use_doc_unwarping=False, use_textline_orientation=True, lang="arabic").predict(image)
        envelope = _envelope(data, filename, mime, "paddleocr", [])
        text_parts: list[str] = []
        for page_result in result:
            payload = getattr(page_result, "json", None)
            payload = payload() if callable(payload) else payload
            if isinstance(payload, dict):
                for text in payload.get("res", {}).get("rec_texts", []) or []:
                    if isinstance(text, str) and text.strip():
                        text_parts.append(text.strip())
        if text_parts:
            envelope.pages.append(Page(number=1, blocks=[Block(
                type="ocr_text",
                text="\\n".join(text_parts),
                confidence=0.0,
                provenance=Provenance(
                    source_file=filename,
                    source_sha256=envelope.source_sha256,
                    page=1,
                    parser="paddleocr",
                ),
            )]))
        else:
            envelope.warnings.append("OCR backend returned no reliable text; document requires review.")
        return {"document": envelope.to_dict(), "engine": "paddleocr", "warnings": envelope.warnings}
    except Exception as exc:
        return {"document": _envelope(data, filename, mime, "paddleocr", [f"OCR execution failed: {type(exc).__name__}"]).to_dict(),
                "engine": "paddleocr", "warnings": ["OCR execution failed; document is not considered successfully extracted."]}


def parse_fallback(data: bytes, filename: str, mime: str, *, ocr_required: bool = False) -> dict[str, Any]:
    text = data.decode("utf-8", errors="replace") if mime.startswith("text/") else ""
    warnings = ["No optional structured document backend was available."]
    if ocr_required:
        warnings = ["OCR is required for this document but no OCR backend is available; extraction is incomplete and requires review."]
    envelope = _envelope(data, filename, mime, "fallback", warnings)
    if text:
        envelope.pages.append(Page(number=1, blocks=[Block(
            type="text",
            text=text,
            provenance=Provenance(source_file=filename, source_sha256=envelope.source_sha256, page=1, parser="fallback"),
        )]))
    return {"document": envelope.to_dict(), "engine": "fallback", "warnings": envelope.warnings}


def _legacy_fallback_marker():
    pass


    text = data.decode("utf-8", errors="replace") if mime.startswith("text/") else ""
    envelope = _envelope(
        data,
        filename,
        mime,
        "fallback",
        ["No optional structured document backend was available."],
    )
    if text:
        envelope.pages.append(
            Page(
                number=1,
                blocks=[
                    Block(
                        type="text",
                        text=text,
                        provenance=Provenance(
                            source_file=filename,
                            source_sha256=envelope.source_sha256,
                            page=1,
                            parser="fallback",
                        ),
                    )
                ],
            )
        )
    return {"document": envelope.to_dict(), "engine": "fallback", "warnings": envelope.warnings}


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "document-intelligence", "model": "document-intelligence.v1"}


@app.post("/v1/parse")
async def parse_document(file: UploadFile = File(...)) -> dict[str, Any]:
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=415, detail="Unsupported document type")

    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Document exceeds configured size limit")

    filename = file.filename or "document"
    result = parse_with_docling(data, filename, file.content_type)
    if result:
        return result
    if file.content_type.startswith("image/"):
        return parse_with_ocr(data, filename, file.content_type) or parse_fallback(data, filename, file.content_type, ocr_required=True)
    if file.content_type == "application/pdf":
        return parse_with_ocr(data, filename, file.content_type) or parse_fallback(data, filename, file.content_type, ocr_required=True)
    return parse_fallback(data, filename, file.content_type)
