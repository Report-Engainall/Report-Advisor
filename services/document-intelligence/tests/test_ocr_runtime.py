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
        with patch.dict(sys.modules, {"paddleocr": fake_module}):
            sys.modules.pop("main", None)
            if "services.document-intelligence.app.main" in sys.modules:
                sys.modules.pop("services.document-intelligence.app.main")
            sys.path.insert(0, "services/document-intelligence/app")
            try:
                return importlib.import_module("main")
            finally:
                sys.path.pop(0)

    def test_uses_minimum_finite_score(self):
        main = self.load_main(
            lambda image: [
                FakePageResult({"res": {"rec_texts": ["فاتورة", "123"], "rec_scores": [0.91, 0.74]}})
            ]
        )
        result = main.parse_with_ocr(image_bytes(), "invoice.png", "image/png")
        block = result["document"]["pages"][0]["blocks"][0]
        self.assertEqual(block["confidence"], 0.74)
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
        for scores in cases:
            with self.subTest(scores=scores):
                main = self.load_main(
                    lambda image, scores=scores: [
                        FakePageResult({"res": {"rec_texts": ["فاتورة", "123"][: len(scores)], "rec_scores": scores}})
                    ]
                )
                result = main.parse_with_ocr(image_bytes(), "invoice.png", "image/png")
                block = result["document"]["pages"][0]["blocks"][0]
                self.assertEqual(block["confidence"], 0.0)
                self.assertIn("OCR confidence is below the usable threshold", result["warnings"][0])

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
        self.assertEqual(result["document"]["status"], "EXTRACTED")
        self.assertEqual(result["document"]["pages"], [])


if __name__ == "__main__":
    unittest.main()
