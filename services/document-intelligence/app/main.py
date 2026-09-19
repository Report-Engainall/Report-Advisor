from __future__ import annotations

import hashlib
import importlib
import io
import math
import os
import tempfile
from pathlib import PurePosixPath
from typing import Any
from zipfile import BadZipFile, ZipFile

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image

try:
    from .contracts import Block, DocumentEnvelope, Page, ProcessingState, Provenance
except ImportError:  # supports direct uvicorn main:app execution
    from contracts import Block, DocumentEnvelope, Page, ProcessingState, Provenance

app = FastAPI(title="Report Advisor Document Intelligence", version="0.3.0")

MAX_BYTES = int(os.getenv("DOCUMENT_MAX_BYTES", str(50 * 1024 * 1024)))
MAX_ARCHIVE_MEMBERS = int(os.getenv("DOCUMENT_MAX_ARCHIVE_MEMBERS", "1000"))
MAX_ARCHIVE_UNCOMPRESSED_BYTES = int(os.getenv("DOCUMENT_MAX_ARCHIVE_UNCOMPRESSED_BYTES", str(100 * 1024 * 1024)))
MAX_ARCHIVE_MEMBER_BYTES = int(os.getenv("DOCUMENT_MAX_ARCHIVE_MEMBER_BYTES", str(25 * 1024 * 1024)))
MAX_PDF_PAGES = int(os.getenv("DOCUMENT_MAX_PDF_PAGES", "100"))
PDF_RENDER_SCALE = float(os.getenv("DOCUMENT_PDF_RENDER_SCALE", "2"))

MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
MIME_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
ALLOWED_MIME = {
    "application/pdf",
    MIME_DOCX,
    MIME_XLSX,
    "text/csv",
    "text/plain",
    "image/png",
    "image/jpeg",
    "image/tiff",
    "image/webp",
}


def _envelope(data: bytes, filename: str, mime: str, engine: str, warnings: list[str], state: ProcessingState = ProcessingState.EXTRACTED) -> DocumentEnvelope:
    return DocumentEnvelope(
        schema_version="document-intelligence.v1",
        filename=filename,
        mime_type=mime,
        source_sha256=hashlib.sha256(data).hexdigest(),
        engine=engine,
        state=state,
        metadata={"byte_size": len(data)},
        warnings=list(warnings),
    )


def _extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def _assert_zip_container(data: bytes, filename: str, mime: str) -> None:
    if not data.startswith(b"PK"):
        raise ValueError("archive_signature_invalid")
    try:
        with ZipFile(io.BytesIO(data)) as archive:
            infos = archive.infolist()
            if len(infos) > MAX_ARCHIVE_MEMBERS:
                raise ValueError("archive_member_limit_exceeded")
            total_uncompressed = 0
            names: set[str] = set()
            for info in infos:
                normalized = info.filename.replace("\\", "/")
                parts = PurePosixPath(normalized).parts
                if normalized.startswith("/") or ".." in parts:
                    raise ValueError("archive_path_traversal")
                if info.file_size > MAX_ARCHIVE_MEMBER_BYTES:
                    raise ValueError("archive_member_size_exceeded")
                total_uncompressed += info.file_size
                if total_uncompressed > MAX_ARCHIVE_UNCOMPRESSED_BYTES:
                    raise ValueError("archive_uncompressed_limit_exceeded")
                if normalized.lower().endswith((".zip", ".rar", ".7z", ".tar", ".gz")):
                    raise ValueError("nested_archive_rejected")
                names.add(normalized)
            required = {"word/document.xml"} if mime == MIME_DOCX else {"xl/workbook.xml"}
            if not required.issubset(names):
                raise ValueError("office_document_structure_invalid")
    except BadZipFile as exc:
        raise ValueError("archive_signature_invalid") from exc


def validate_file_content(data: bytes, filename: str, mime: str) -> None:
    if len(data) > MAX_BYTES:
        raise ValueError("document_size_limit_exceeded")
    extension = _extension(filename)
    expected_by_extension = {
        ".pdf": "application/pdf",
        ".docx": MIME_DOCX,
        ".xlsx": MIME_XLSX,
        ".csv": "text/csv",
        ".txt": "text/plain",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".tif": "image/tiff",
        ".tiff": "image/tiff",
        ".webp": "image/webp",
    }
    expected = expected_by_extension.get("." + extension) if extension else None
    if expected and expected != mime:
        raise ValueError("mime_extension_mismatch")

    if mime == "application/pdf":
        if not data.startswith(b"%PDF-"):
            raise ValueError("pdf_signature_invalid")
        return
    if mime in {MIME_DOCX, MIME_XLSX}:
        _assert_zip_container(data, filename, mime)
        return
    if mime == "image/png" and not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("png_signature_invalid")
    if mime == "image/jpeg" and not data.startswith(b"\xff\xd8\xff"):
        raise ValueError("jpeg_signature_invalid")
    if mime == "image/tiff" and not (data.startswith(b"II*\x00") or data.startswith(b"MM\x00*")):
        raise ValueError("tiff_signature_invalid")
    if mime == "image/webp" and not (data.startswith(b"RIFF") and len(data) >= 12 and data[8:12] == b"WEBP"):
        raise ValueError("webp_signature_invalid")


def parse_with_docling(data: bytes, filename: str, mime: str) -> dict[str, Any] | None:
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
        markdown = document.export_to_markdown()
        envelope.metadata["markdown"] = markdown
        envelope.pages.append(Page(
            number=1,
            blocks=[Block(
                type="document_markdown",
                text=markdown,
                confidence=1.0,
                provenance=Provenance(source_file_id=filename, source_hash=envelope.source_sha256, page=1, parser="docling"),
            )],
        ))
        return {"document": envelope.to_dict(), "engine": "docling", "warnings": []}


def _paddle_payload(page_result: Any) -> dict[str, Any] | None:
    payload = getattr(page_result, "json", None)
    payload = payload() if callable(payload) else payload
    if isinstance(payload, str):
        try:
            import json
            payload = json.loads(payload)
        except Exception:
            return None
    if isinstance(payload, dict):
        return payload
    if isinstance(page_result, dict):
        return page_result
    return None


def _paddle_text_and_scores(response: Any) -> tuple[list[str], list[Any]]:
    if not isinstance(response, dict):
        return [], []
    texts = response.get("rec_texts")
    scores = response.get("rec_scores")
    return (list(texts) if isinstance(texts, (list, tuple)) else [],
            list(scores) if isinstance(scores, (list, tuple)) else [])


def _iter_ocr_images(data: bytes, mime: str):
    if mime == "application/pdf":
        try:
            import fitz
        except Exception as exc:
            raise RuntimeError("pdf_rasterizer_unavailable") from exc
        with fitz.open(stream=data, filetype="pdf") as pdf:
            if pdf.page_count > MAX_PDF_PAGES:
                raise ValueError("pdf_page_limit_exceeded")
            matrix = fitz.Matrix(PDF_RENDER_SCALE, PDF_RENDER_SCALE)
            for page in pdf:
                pixmap = page.get_pixmap(matrix=matrix, alpha=False)
                yield Image.open(io.BytesIO(pixmap.tobytes("png"))).convert("RGB")
        return
    yield Image.open(io.BytesIO(data)).convert("RGB")


def parse_with_ocr(data: bytes, filename: str, mime: str) -> dict[str, Any]:
    try:
        paddleocr_module = importlib.import_module("paddleocr")
        PaddleOCR = getattr(paddleocr_module, "PaddleOCR")
        if not callable(PaddleOCR):
            raise ImportError("paddleocr.PaddleOCR is not callable")
    except Exception as exc:
        envelope = _envelope(data, filename, mime, "paddleocr", ["OCR backend is unavailable; extraction is incomplete and requires review."], ProcessingState.QUARANTINED)
        envelope.metadata["error_type"] = type(exc).__name__
        envelope.metadata["error_message"] = str(exc)[:512]
        return {"document": envelope.to_dict(), "engine": "paddleocr", "warnings": envelope.warnings}

    try:
        import numpy as np

        ocr = PaddleOCR(use_doc_orientation_classify=True, use_doc_unwarping=False, use_textline_orientation=True, lang="ar", enable_mkldnn=False)
        envelope = _envelope(data, filename, mime, "paddleocr", [])
        invalid_confidence = False
        unreadable_pages: list[int] = []
        page_models: list[Page] = []

        for page_number, image in enumerate(_iter_ocr_images(data, mime), start=1):
            result = ocr.predict(np.asarray(image))
            if result is None:
                result = []
            elif isinstance(result, dict):
                result = [result]
            elif not isinstance(result, (list, tuple)):
                try:
                    result = list(result)
                except TypeError:
                    result = []

            page_blocks: list[Block] = []
            for page_result in result:
                payload = _paddle_payload(page_result)
                if payload is None:
                    continue
                response = payload.get("res") if isinstance(payload.get("res"), dict) else payload
                texts, scores = _paddle_text_and_scores(response)
                for index, text in enumerate(texts):
                    if not isinstance(text, str) or not text.strip():
                        continue
                    score = scores[index] if index < len(scores) else None
                    if isinstance(score, bool) or not isinstance(score, (int, float)):
                        invalid_confidence = True
                        confidence = 0.0
                    else:
                        numeric = float(score)
                        if not math.isfinite(numeric) or not 0.0 <= numeric <= 1.0:
                            invalid_confidence = True
                            confidence = 0.0
                        else:
                            confidence = numeric
                    page_blocks.append(Block(
                        type="ocr_text",
                        text=text.strip(),
                        confidence=confidence,
                        provenance=Provenance(source_file_id=filename, source_hash=envelope.source_sha256, page=page_number, parser="paddleocr"),
                    ))
            if page_blocks:
                page_models.append(Page(number=page_number, blocks=page_blocks))
            else:
                unreadable_pages.append(page_number)

        envelope.pages.extend(page_models)
        all_blocks = [block for page in page_models for block in page.blocks]
        if not all_blocks:
            envelope.warnings.append("OCR backend returned no reliable text; document requires review.")
            envelope.state = ProcessingState.QUARANTINED
        elif invalid_confidence:
            envelope.warnings.append("OCR confidence contains invalid or missing values; affected blocks are fail-closed and require review.")
            envelope.state = ProcessingState.QUARANTINED
        elif unreadable_pages:
            envelope.warnings.append(f"OCR returned no reliable text for page(s): {unreadable_pages}; document requires review.")
            envelope.state = ProcessingState.REVIEW
        else:
            minimum = min(block.confidence for block in all_blocks if block.confidence is not None)
            if minimum < 0.7:
                envelope.warnings.append("OCR confidence is below the usable threshold; document requires review.")
                envelope.state = ProcessingState.REVIEW

        return {"document": envelope.to_dict(), "engine": "paddleocr", "warnings": envelope.warnings}
    except Exception as exc:
        envelope = _envelope(data, filename, mime, "paddleocr", ["OCR execution failed; document is not considered successfully extracted."], ProcessingState.QUARANTINED)
        envelope.metadata["error_type"] = type(exc).__name__
        envelope.metadata["error_message"] = str(exc)[:512]
        return {"document": envelope.to_dict(), "engine": "paddleocr", "warnings": envelope.warnings}


def parse_fallback(data: bytes, filename: str, mime: str, *, ocr_required: bool = False, extra_warnings: list[str] | None = None) -> dict[str, Any]:
    text = data.decode("utf-8", errors="replace") if mime.startswith("text/") else ""
    warnings = list(extra_warnings or [])
    warnings.append("No optional structured document backend was available.")
    if ocr_required:
        warnings.append("OCR is required for this document but no OCR backend is available; extraction is incomplete and requires review.")
    envelope = _envelope(data, filename, mime, "fallback", warnings, ProcessingState.QUARANTINED if ocr_required else ProcessingState.EXTRACTED)
    if text:
        envelope.pages.append(Page(number=1, blocks=[Block(type="text", text=text, provenance=Provenance(source_file_id=filename, source_hash=envelope.source_sha256, page=1, parser="fallback"))]))
    return {"document": envelope.to_dict(), "engine": "fallback", "warnings": envelope.warnings}


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "document-intelligence", "model": "document-intelligence.v1"}


@app.post("/v1/parse")
async def parse_document(file: UploadFile = File(...)) -> dict[str, Any]:
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=415, detail="Unsupported document type")
    data = await file.read(MAX_BYTES + 1)
    filename = file.filename or "document"
    try:
        validate_file_content(data, filename, file.content_type)
    except ValueError as exc:
        message = str(exc)
        status = 413 if message in {"document_size_limit_exceeded", "archive_uncompressed_limit_exceeded"} else 415
        raise HTTPException(status_code=status, detail=message) from exc

    docling_warning: str | None = None
    try:
        result = parse_with_docling(data, filename, file.content_type)
    except Exception as exc:
        result = None
        docling_warning = f"Structured parsing failed at runtime; guarded OCR fallback used: {type(exc).__name__}"

    if result:
        return result

    if file.content_type.startswith("image/") or file.content_type == "application/pdf":
        result = parse_with_ocr(data, filename, file.content_type)
        if docling_warning:
            result["document"]["warnings"] = [docling_warning, *result["document"].get("warnings", [])]
            result["warnings"] = result["document"]["warnings"]
        return result

    return parse_fallback(data, filename, file.content_type, extra_warnings=[docling_warning] if docling_warning else None)
