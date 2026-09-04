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


def _envelope(data: bytes, filename: str, mime: str, engine: str, warnings: list[str], *, status: str = "EXTRACTED") -> DocumentEnvelope:
    return DocumentEnvelope(
        schema_version="document-intelligence.v1",
        filename=filename,
        mime_type=mime,
        source_sha256=hashlib.sha256(data).hexdigest(),
        engine=engine,
        status=status,
        metadata={"byte_size": len(data)},
        warnings=warnings,
    )


def _parser_failure(data: bytes, filename: str, mime: str, engine: str, *, retryable: bool, code: str) -> dict[str, Any]:
    warning = "Document conversion failed; no extracted content was produced and the document requires review."
    envelope = _envelope(data, filename, mime, engine, [warning], status="FAILED")
    envelope.metadata.update({"error_code": code, "retryable": retryable})
    return {
        "document": envelope.to_dict(),
        "engine": engine,
        "status": "FAILED",
        "retryable": retryable,
        "error_code": code,
        "warnings": envelope.warnings,
    }


def parse_with_docling(data: bytes, filename: str, mime: str) -> dict[str, Any] | None:
    """Optional adapter with a closed exception boundary and explicit failure semantics."""
    try:
        from docling.document_converter import DocumentConverter
    except Exception:
        return None

    try:
        with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1], delete=True) as tmp:
            tmp.write(data)
            tmp.flush()
            result = DocumentConverter().convert(tmp.name)
            document = result.document
            markdown = document.export_to_markdown()
    except (ValueError, TypeError, IndexError, KeyError) as exc:
        return _parser_failure(data, filename, mime, "docling", retryable=False, code="DOCLING_INVALID_DOCUMENT")
    except Exception:
        return _parser_failure(data, filename, mime, "docling", retryable=True, code="DOCLING_CONVERSION_FAILED")

    envelope = _envelope(data, filename, mime, "docling", [])
    envelope.metadata["markdown"] = markdown
    envelope.pages.append(
        Page(
            number=1,
            blocks=[
                Block(
                    type="document_markdown",
                    text=markdown,
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
    return {"document": envelope.to_dict(), "engine": "docling", "status": "EXTRACTED", "retryable": False, "warnings": []}


def parse_with_ocr(data: bytes, filename: str, mime: str) -> dict[str, Any] | None:
    """Optional OCR adapter. Conversion failures never return an EXTRACTED false-success."""
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
                text="\n".join(text_parts),
                confidence=0.0,
                provenance=Provenance(
                    source_file=filename,
                    source_sha256=envelope.source_sha256,
                    page=1,
                    parser="paddleocr",
                ),
            )]))
            return {"document": envelope.to_dict(), "engine": "paddleocr", "status": "EXTRACTED", "retryable": False, "warnings": []}
        return _parser_failure(data, filename, mime, "paddleocr", retryable=False, code="OCR_NO_RELIABLE_TEXT")
    except (ValueError, TypeError) as exc:
        return _parser_failure(data, filename, mime, "paddleocr", retryable=False, code="OCR_INVALID_DOCUMENT")
    except Exception:
        return _parser_failure(data, filename, mime, "paddleocr", retryable=True, code="OCR_EXECUTION_FAILED")


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
    return {"document": envelope.to_dict(), "engine": "fallback", "status": "EXTRACTED" if text else "REVIEW", "retryable": False, "warnings": envelope.warnings}


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "document-intelligence", "model": "document-intelligence.v1"}


@app.post("/v1/parse")
async def parse_document(file: UploadFile = File(...)) -> dict[str, Any]:
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=415, detail={"code": "UNSUPPORTED_DOCUMENT_TYPE", "message": "Unsupported document type"})

    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail={"code": "DOCUMENT_TOO_LARGE", "message": "Document exceeds configured size limit"})

    filename = file.filename or "document"
    result = parse_with_docling(data, filename, file.content_type)
    if result:
        if result.get("status") == "FAILED":
            raise HTTPException(status_code=503 if result.get("retryable") else 422, detail={"code": result["error_code"], "retryable": result["retryable"], "message": result["warnings"][0]})
        return result

    if file.content_type.startswith("image/") or file.content_type == "application/pdf":
        result = parse_with_ocr(data, filename, file.content_type)
        if result:
            if result.get("status") == "FAILED":
                raise HTTPException(status_code=503 if result.get("retryable") else 422, detail={"code": result["error_code"], "retryable": result["retryable"], "message": result["warnings"][0]})
            return result
        return parse_fallback(data, filename, file.content_type, ocr_required=True)

    return parse_fallback(data, filename, file.content_type)
