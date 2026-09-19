from io import BytesIO
from zipfile import ZipFile

import unittest

from app.main import MIME_DOCX, MIME_XLSX, validate_file_content


class FileValidationContractTests(unittest.TestCase):
    def office_zip(self, mime: str, extra: list[str] | None = None) -> bytes:
        stream = BytesIO()
        with ZipFile(stream, "w") as archive:
            archive.writestr("[Content_Types].xml", "<Types/>")
            archive.writestr("word/document.xml" if mime == MIME_DOCX else "xl/workbook.xml", "<root/>")
            for name in extra or []:
                archive.writestr(name, "nested")
        return stream.getvalue()

    def test_valid_docx_signature_and_structure(self):
        data = self.office_zip(MIME_DOCX)
        validate_file_content(data, "invoice.docx", MIME_DOCX)

    def test_valid_xlsx_signature_and_structure(self):
        data = self.office_zip(MIME_XLSX)
        validate_file_content(data, "sales.xlsx", MIME_XLSX)

    def test_extension_and_mime_must_match(self):
        data = self.office_zip(MIME_DOCX)
        with self.assertRaisesRegex(ValueError, "mime_extension_mismatch"):
            validate_file_content(data, "invoice.xlsx", MIME_DOCX)

    def test_archive_path_traversal_is_rejected(self):
        data = self.office_zip(MIME_DOCX, ["../evil.txt"])
        with self.assertRaisesRegex(ValueError, "archive_path_traversal"):
            validate_file_content(data, "invoice.docx", MIME_DOCX)

    def test_nested_archive_is_rejected(self):
        data = self.office_zip(MIME_DOCX, ["payload.zip"])
        with self.assertRaisesRegex(ValueError, "nested_archive_rejected"):
            validate_file_content(data, "invoice.docx", MIME_DOCX)

    def test_invalid_pdf_signature_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "pdf_signature_invalid"):
            validate_file_content(b"PKnot-a-pdf", "invoice.pdf", "application/pdf")


if __name__ == "__main__":
    unittest.main()
