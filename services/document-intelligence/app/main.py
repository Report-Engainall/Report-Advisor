from __future__ import annotations

import io
import os
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile

app = FastAPI(title="Report Advisor Document Intelligence", version="0.1.0")

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


def parse_with_docling(data: bytes, filename: str, mime: str) -> dict[str, Any] | None:
    """Optional backend. Import lazily so the service still starts without Docling."""
    try:
        from docling.document_converter import DocumentConverter
    except Exception:
        return None

    # Docling expects a path/URI for many formats. Keep this adapter deliberately
    # isolated; a production deployment should use a bounded temporary directory.
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1], delete=True) as tmp:
        tmp.write(data)
        tmp.flush()
        result = DocumentConverter().convert(tmp.name)
        document = result.document
        return {
            "document": {
                "mimeType": mime,
                "pages": [],
                "blocks": [],
                "tables": [],
                "images": [],
                "metadata": {"markdown": document.export_to_markdown()},
            },
            "engine": "docling",
            "warnings": [],
        }


def parse_fallback(data: bytes, filename: str, mime: str) -> dict[str, Any]:
    text = ""
    if mime.startswith("text/"):
        text = data.decode("utf-8", errors="replace")
    return {
        "document": {
            "mimeType": mime,
            "pages": [],
            "blocks": [{"type": "text", "text": text}] if text else [],
            "tables": [],
            "images": [],
            "metadata": {"filename": filename},
        },
        "engine": "fallback",
        "warnings": ["No optional structured document backend was available."],
    }


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "document-intelligence"}


@app.post("/v1/parse")
async def parse_document(file: UploadFile = File(...)) -> dict[str, Any]:
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=415, detail="Unsupported document type")

    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Document exceeds configured size limit")

    result = parse_with_docling(data, file.filename or "document", file.content_type)
    return result or parse_fallback(data, file.filename or "document", file.content_type)
