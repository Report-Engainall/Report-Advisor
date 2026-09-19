from __future__ import annotations

import importlib
import sys
import types
import unittest
from io import BytesIO
from unittest.mock import patch

from PIL import Image


class FakePageResult:
    def __init__(self, payload: dict):
        self.json = payload


def image_bytes() -> bytes:
    image = Image.new("RGB", (8, 8), "white")
    stream = BytesIO()
    image.save(stream, format="PNG")
    return stream.getvalue()


class OcrRuntimeTests(unittest.TestCase):
    def load_main(self, predict):
        fake_module = types.ModuleType("paddleocr")

        class FakePaddleOCR:
            def __init__(self, **kwargs):
                self.kwargs = kwargs

            def predict(self, image):
                return predict(image)

        fake_module.PaddleOCR = FakePaddleOCR
        # The production adapter imports PaddleOCR when parse_with_ocr() is called,
        # not when main is imported. Keep the fake module installed for the full
        # lifetime of this test case instead of restoring sys.modules immediately
        # after import.
        self._paddleocr_patch = patch.dict(sys.modules, {"paddleocr": fake_module})
        self._paddleocr_patch.start()
        self.addCleanup(self._paddleocr_patch.stop)

        sys.modules.pop("main", None)
        if "services.document-intelligence.app.main" in sys.modules:
            sys.modules.pop("services.document-intelligence.app.main")
        sys.path.insert(0, "services/document-intelligence/app")
        try:
            return importlib.import_module("main")
        finally:
            sys.path.pop(0)

    def test_uses_first_finite_score_without_mutating_valid_confidence(self):
        main = self.load_main(
            lambda image: [
                FakePageResult({"res": {"rec_texts": ["فاتورة", "123"], "rec_scores": [0.91, 0.74]}})
            ]
        )
        result = main.parse_with_ocr(image_bytes(), "invoice.png", "image/png")
        blocks = result["document"]["pages"][0]["blocks"]
        self.assertEqual([block["confidence"] for block in blocks], [0.91, 0.74])
        self.assertEqual(result["warnings"], [])

    def test_low_score_warns(self):
        main = self.load_main(
            lambda image: [FakePageResult({"res": {"rec_texts": ["فاتورة"], "rec_scores": [0.69]}})]
        )
        result = main.parse_with_ocr(image_bytes(), "invoice.png", "image/png")
        self.assertEqual(result["document"]["pages"][0]["blocks"][0]["confidence"], 0.69)
        self.assertIn("OCR confidence is below the usable threshold", result["warnings"][0])

    def test_missing_invalid_or_nonfinite_score_fails_closed(self):
        cases = [
            [0.91, None],
            [True],
            [float("nan")],
            [float("inf")],
            [1.1],
            [-0.1],
        ]
        expected_warning = "OCR confidence contains invalid or missing values; affected blocks are fail-closed and require review."
        for scores in cases:
            with self.subTest(scores=scores):
                main = self.load_main(
                    lambda image, scores=scores: [
                        FakePageResult({"res": {"rec_texts": ["فاتورة", "123"][: len(scores)], "rec_scores": scores}})
                    ]
                )
                result = main.parse_with_ocr(image_bytes(), "invoice.png", "image/png")
                blocks = result["document"]["pages"][0]["blocks"]
                self.assertEqual(blocks[-1]["confidence"], 0.0)
                self.assertEqual(result["warnings"][0], expected_warning)

    def test_empty_result_is_incomplete(self):
        main = self.load_main(lambda image: [FakePageResult({"res": {"rec_texts": [], "rec_scores": []}})])
        result = main.parse_with_ocr(image_bytes(), "invoice.png", "image/png")
        self.assertEqual(result["document"]["pages"], [])
        self.assertIn("OCR backend returned no reliable text", result["warnings"][0])

    def test_execution_failure_is_incomplete(self):
        def fail(image):
            raise RuntimeError("synthetic OCR failure")

        main = self.load_main(fail)
        result = main.parse_with_ocr(image_bytes(), "invoice.png", "image/png")
        self.assertEqual(result["engine"], "paddleocr")
        self.assertIn("OCR execution failed; document is not considered successfully extracted", result["warnings"][0])
        self.assertEqual(result["document"]["state"], "quarantined")
        self.assertEqual(result["document"]["pages"], [])



    def test_pdf_is_rasterized_before_ocr(self):
        import fitz

        pdf = fitz.open()
        page = pdf.new_page(width=144, height=144)
        page.insert_text((20, 60), "Invoice 123")
        pdf_bytes = pdf.tobytes()
        pdf.close()

        seen_sizes = []
        main = self.load_main(
            lambda image: (
                seen_sizes.append(image.size)
                or [FakePageResult({"res": {"rec_texts": ["فاتورة"], "rec_scores": [0.92]}})]
            )
        )
        result = main.parse_with_ocr(pdf_bytes, "invoice.pdf", "application/pdf")
        self.assertTrue(seen_sizes)
        self.assertGreaterEqual(seen_sizes[0][0], 100)
        self.assertGreaterEqual(seen_sizes[0][1], 100)
        self.assertEqual(result["document"]["pages"][0]["number"], 1)

    def test_pdf_signature_is_validated_before_parser(self):
        main = self.load_main(lambda image: [])
        with self.assertRaises(ValueError):
            main.validate_file_content(b"not a pdf", "invoice.pdf", "application/pdf")

    def test_docling_runtime_failure_uses_guarded_ocr_fallback(self):
        import asyncio
        import types
        import fitz

        pdf = fitz.open()
        pdf.new_page(width=144, height=144)
        pdf_bytes = pdf.tobytes()
        pdf.close()

        main = self.load_main(
            lambda image: [FakePageResult({"res": {"rec_texts": ["فاتورة"], "rec_scores": [0.94]}})]
        )

        failing_docling = types.ModuleType("docling.document_converter")

        class FailingDocumentConverter:
            def convert(self, path):
                raise RuntimeError("conversion failed")

        failing_docling.DocumentConverter = FailingDocumentConverter

        class FakeUpload:
            content_type = "application/pdf"
            filename = "invoice.pdf"

            async def read(self, limit):
                return pdf_bytes

        with patch.dict(sys.modules, {
            "docling": types.ModuleType("docling"),
            "docling.document_converter": failing_docling,
        }):
            result = asyncio.run(main.parse_document(FakeUpload()))

        self.assertEqual(result["engine"], "paddleocr")
        self.assertTrue(any("guarded OCR fallback used" in warning for warning in result["warnings"]))
        self.assertEqual(result["document"]["pages"][0]["blocks"][0]["confidence"], 0.94)

if __name__ == "__main__":
    unittest.main()
