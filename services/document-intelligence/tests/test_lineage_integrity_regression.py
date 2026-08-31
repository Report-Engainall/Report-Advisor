import hashlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.contracts import DocumentEnvelope, ProcessingState
from app.pipeline import advance, process_with_parser


def test_lineage_hash_is_immutable_across_parser_output() -> None:
    payload = b"SKU,qty\nA-1,3\n"
    expected = hashlib.sha256(payload).hexdigest()

    def parser(data: bytes, filename: str, mime: str) -> DocumentEnvelope:
        return DocumentEnvelope(
            filename=filename,
            mime_type=mime,
            source_sha256=expected,
            metadata={"parser": "deterministic-test"},
            state=ProcessingState.RAW,
        )

    document, snapshot = process_with_parser(payload, "sales.csv", "text/csv", parser)
    assert snapshot["source_sha256"] == expected
    assert document.metadata["source_sha256"] == expected
    assert document.metadata["pipeline_contract"] == "document-pipeline.v1"
    assert document.state == ProcessingState.EXTRACTED


def test_lineage_rejects_parser_claim_for_different_source() -> None:
    payload = b"source-A"

    def parser(data: bytes, filename: str, mime: str) -> DocumentEnvelope:
        return DocumentEnvelope(
            filename=filename,
            mime_type=mime,
            source_sha256=hashlib.sha256(b"source-B").hexdigest(),
            state=ProcessingState.RAW,
        )

    try:
        process_with_parser(payload, "report.txt", "text/plain", parser)
    except ValueError as exc:
        assert "source hash" in str(exc)
    else:
        raise AssertionError("parser cannot overwrite source lineage with a different hash")


def test_production_is_terminal_for_lineage_lifecycle() -> None:
    document = DocumentEnvelope(mime_type="text/plain", state=ProcessingState.PRODUCTION)
    for target in (ProcessingState.RAW, ProcessingState.EXTRACTED, ProcessingState.APPROVED):
        try:
            advance(document, target)
        except ValueError:
            continue
        raise AssertionError(f"terminal production state accepted transition to {target}")
