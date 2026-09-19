from __future__ import annotations

import asyncio
import io
import os
import sys
from pathlib import Path

import fitz
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from starlette.datastructures import Headers, UploadFile

sys.path.insert(0, str(Path("services/document-intelligence/app").resolve()))
import main  # noqa: E402


def build_fixture_pdf() -> bytes:
    font_path = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    if not font_path.exists():
        raise RuntimeError("ARABIC_FONT_MISSING")

    # Build scan-like Arabic pages as raster images with deterministic RTL shaping.
    # The production path under test is still PDF -> PyMuPDF rasterization -> PaddleOCR.
    if not ImageFont or not hasattr(ImageFont, "truetype"):
        raise RuntimeError("PIL_FONT_RUNTIME_UNAVAILABLE")

    font = ImageFont.truetype(str(font_path), 64)
    document = fitz.open()
    for text, numbers in [
        ("فاتورة المبيعات", "123 450"),
        ("الصفحة الثانية إجمالي", "789"),
    ]:
        canvas = Image.new("RGB", (1400, 1800), "white")
        draw = ImageDraw.Draw(canvas)
        draw.text(
            (1270, 420),
            text,
            font=font,
            fill="black",
            direction="rtl",
            anchor="ra",
        )
        draw.text(
            (1270, 540),
            numbers,
            font=font,
            fill="black",
            direction="rtl",
            anchor="ra",
        )
        png = io.BytesIO()
        canvas.save(png, format="PNG")

        page = document.new_page(width=595, height=842)
        page.insert_image(fitz.Rect(30, 30, 565, 812), stream=png.getvalue())

    # An intentionally unreadable page. The extractor must not silently promote
    # a multi-page document when one page produces no reliable OCR blocks.
    unreadable = document.new_page(width=595, height=842)
    noise = np.zeros((32, 32, 3), dtype=np.uint8)
    noise[::2, ::2] = 255
    png = io.BytesIO()
    Image.fromarray(noise).save(png, format="PNG")
    unreadable.insert_image(fitz.Rect(250, 400, 282, 432), stream=png.getvalue())

    data = document.tobytes()
    document.close()
    return data


async def parse_via_endpoint(data: bytes) -> dict:
    upload = UploadFile(
        file=io.BytesIO(data),
        filename="arabic-multipage.pdf",
        headers=Headers({"content-type": "application/pdf"}),
    )
    return await main.parse_document(upload)


pdf_bytes = build_fixture_pdf()
result = asyncio.run(parse_via_endpoint(pdf_bytes))

if result.get("engine") != "paddleocr":
    raise AssertionError(f"REAL_OCR_ENGINE_EXPECTED:{result.get('engine')}")

document = result["document"]
pages = document.get("pages", [])
if len(pages) < 2:
    raise AssertionError(f"REAL_OCR_MULTIPAGE_EXTRACTION_FAILED: pages={len(pages)}")

blocks = [block for page in pages for block in page.get("blocks", [])]
joined = " ".join(block.get("text", "") for block in blocks)
if not any("؀" <= ch <= "ۿ" for ch in joined):
    raise AssertionError(f"REAL_ARABIC_EXTRACTION_FAILED:text={joined!r}")

if not any(ch.isdigit() for ch in joined):
    raise AssertionError(f"REAL_DIGIT_EXTRACTION_FAILED:text={joined!r}")

for block in blocks:
    confidence = block.get("confidence")
    if not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
        raise AssertionError(f"REAL_CONFIDENCE_INVALID:{confidence!r}")
    provenance = block.get("provenance") or {}
    if provenance.get("source_hash") != document.get("source_sha256"):
        raise AssertionError("REAL_SOURCE_HASH_PROVENANCE_MISMATCH")

warnings = document.get("warnings") or []
if document.get("state") not in {"REVIEW", "QUARANTINED"}:
    raise AssertionError(f"UNREADABLE_PAGE_NOT_FAIL_CLOSED:{document.get('state')}")
if not any("page(s)" in warning for warning in warnings):
    raise AssertionError(f"UNREADABLE_PAGE_WARNING_MISSING:{warnings!r}")

try:
    main.validate_file_content(b"not a pdf", "malformed.pdf", "application/pdf")
except ValueError:
    pass
else:
    raise AssertionError("MALFORMED_PDF_NOT_REJECTED")

print({
    "status": "PASS",
    "real_backend": "PaddleOCR",
    "language": "ar",
    "pages_with_text": len(pages),
    "arabic_extracted": True,
    "confidence_range_valid": True,
    "source_hash_provenance": True,
    "unreadable_page_fail_closed": True,
    "malformed_pdf_rejected": True,
})
