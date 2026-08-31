from __future__ import annotations

import hashlib
import os
import tempfile
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile

from intermediate_model import Block, DocumentEnvelope, Page, Provenance
from pipeline import build_processing_snapshot, process_with_parser

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


def parse_fallback(data: bytes, filename: str, mime: str) -> dict[str, Any]:
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
    try:
        snapshot = build_processing_snapshot(data, filename, file.content_type, structured_available=True)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    def parser(payload: bytes, name: str, mime: str) -> DocumentEnvelope:
        result = parse_with_docling(payload, name, mime)
        if result:
            envelope = DocumentEnvelope.from_dict(result["document"])
            return envelope
        return DocumentEnvelope.from_dict(parse_fallback(payload, name, mime)["document"])

    document, _ = process_with_parser(data, filename, file.content_type, parser)
    route = snapshot["route"]
    return {
        "document": document.to_dict(),
        "engine": document.engine,
        "warnings": document.warnings,
        "route": route,
        "source_sha256": snapshot["source_sha256"],
        "contract_version": snapshot["contract_version"],
    }
