import sys
import types
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import parse_with_docling


def install_fake_docling(monkeypatch, error):
    class Converter:
        def convert(self, _path):
            raise error

    package = types.ModuleType("docling")
    converter_module = types.ModuleType("docling.document_converter")
    converter_module.DocumentConverter = Converter
    monkeypatch.setitem(sys.modules, "docling", package)
    monkeypatch.setitem(sys.modules, "docling.document_converter", converter_module)


def test_malformed_conversion_failure_is_translated_and_not_success(monkeypatch):
    install_fake_docling(monkeypatch, ValueError("malformed input"))
    result = parse_with_docling(b"bad", "broken.pdf", "application/pdf")
    assert result is not None
    assert result["status"] == "FAILED"
    assert result["retryable"] is False
    assert result["error_code"] == "DOCLING_INVALID_DOCUMENT"
    assert result["document"]["status"] == "FAILED"
    assert result["document"]["pages"] == []


def test_unexpected_conversion_failure_is_retryable_and_not_raw_exception(monkeypatch):
    install_fake_docling(monkeypatch, RuntimeError("converter exploded"))
    result = parse_with_docling(b"input", "broken.pdf", "application/pdf")
    assert result is not None
    assert result["status"] == "FAILED"
    assert result["retryable"] is True
    assert result["error_code"] == "DOCLING_CONVERSION_FAILED"
    assert result["document"]["status"] == "FAILED"
    assert "converter exploded" not in str(result)


def test_docling_success_returns_extracted_document(monkeypatch):
    class Converted:
        def export_to_markdown(self):
            return "# Arabic تقرير"

    class Converter:
        def convert(self, _path):
            return types.SimpleNamespace(document=Converted())

    package = types.ModuleType("docling")
    converter_module = types.ModuleType("docling.document_converter")
    converter_module.DocumentConverter = Converter
    monkeypatch.setitem(sys.modules, "docling", package)
    monkeypatch.setitem(sys.modules, "docling.document_converter", converter_module)

    result = parse_with_docling(b"input", "ok.pdf", "application/pdf")
    assert result is not None
    assert result["status"] == "EXTRACTED"
    assert result["document"]["status"] == "EXTRACTED"
    assert result["document"]["metadata"]["markdown"] == "# Arabic تقرير"
