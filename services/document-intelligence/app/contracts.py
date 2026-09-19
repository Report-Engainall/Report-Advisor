from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import StrEnum
from typing import Any, Protocol, Sequence


class ProcessingState(StrEnum):
    RAW = "raw"
    EXTRACTED = "extracted"
    STAGING = "staging"
    VALIDATED = "validated"
    RECONCILED = "reconciled"
    APPROVED = "approved"
    REVIEW = "review"
    QUARANTINED = "quarantined"
    PRODUCTION = "production"


class ConfidenceLevel(StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass(frozen=True)
class Provenance:
    source_file_id: str
    source_document_id: str | None = None
    page: int | None = None
    sheet: str | None = None
    table: int | None = None
    row: int | None = None
    column: int | None = None
    cell: str | None = None
    bounding_box: tuple[float, float, float, float] | None = None
    source_text: str | None = None
    source_hash: str | None = None
    parser: str | None = None
    parser_version: str | None = None
    processing_version: str = "1"


@dataclass
class Cell:
    value: Any = None
    source_text: str | None = None
    normalized_value: Any = None
    confidence: float | None = None
    status: str = "UNKNOWN"
    provenance: Provenance | None = None


@dataclass
class Row:
    cells: list[Cell] = field(default_factory=list)
    provenance: Provenance | None = None


@dataclass
class Table:
    index: int
    headers: list[str] = field(default_factory=list)
    rows: list[Row] = field(default_factory=list)
    provenance: Provenance | None = None


@dataclass
class Block:
    type: str
    text: str | None = None
    confidence: float | None = None
    provenance: Provenance | None = None


@dataclass
class Page:
    number: int
    blocks: list[Block] = field(default_factory=list)
    tables: list[Table] = field(default_factory=list)


@dataclass
class ExtractedField:
    canonical_field: str | None
    original_value: Any
    normalized_value: Any = None
    derived_value: Any = None
    status: str = "UNKNOWN"
    confidence: float = 0.0
    criticality: str = "OPTIONAL"
    provenance: list[Provenance] = field(default_factory=list)
    evidence: list[str] = field(default_factory=list)


@dataclass
class DocumentEnvelope:
    schema_version: str = "document-intelligence.v1"
    filename: str = ""
    mime_type: str = ""
    source_sha256: str = ""
    engine: str = ""
    pages: list[Page] = field(default_factory=list)
    blocks: list[Block] = field(default_factory=list)
    tables: list[Table] = field(default_factory=list)
    images: list[dict[str, Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    fields: list[ExtractedField] = field(default_factory=list)
    state: ProcessingState = ProcessingState.RAW

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


ALLOWED_TRANSITIONS: dict[ProcessingState, set[ProcessingState]] = {
    ProcessingState.RAW: {ProcessingState.EXTRACTED, ProcessingState.FAILED} if hasattr(ProcessingState, "FAILED") else {ProcessingState.EXTRACTED},
    ProcessingState.EXTRACTED: {ProcessingState.STAGING, ProcessingState.QUARANTINED},
    ProcessingState.STAGING: {ProcessingState.VALIDATED, ProcessingState.QUARANTINED},
    ProcessingState.VALIDATED: {ProcessingState.RECONCILED, ProcessingState.QUARANTINED},
    ProcessingState.RECONCILED: {ProcessingState.APPROVED, ProcessingState.REVIEW, ProcessingState.QUARANTINED},
    ProcessingState.REVIEW: {ProcessingState.APPROVED, ProcessingState.QUARANTINED},
    ProcessingState.APPROVED: {ProcessingState.PRODUCTION},
    ProcessingState.QUARANTINED: {ProcessingState.EXTRACTED, ProcessingState.STAGING},
    ProcessingState.PRODUCTION: set(),
}


def can_transition(current: ProcessingState | str, target: ProcessingState | str) -> bool:
    current_state = current if isinstance(current, ProcessingState) else ProcessingState(str(current).lower())
    target_state = target if isinstance(target, ProcessingState) else ProcessingState(str(target).lower())
    return target_state in ALLOWED_TRANSITIONS.get(current_state, set())


class DocumentParser(Protocol):
    name: str
    def can_handle(self, mime_type: str, filename: str) -> bool: ...
    def parse(self, data: bytes, filename: str, mime_type: str) -> DocumentEnvelope: ...


class OCRProvider(Protocol):
    name: str
    def supports(self, mime_type: str) -> bool: ...
    def extract(self, data: bytes) -> DocumentEnvelope: ...


class TableExtractor(Protocol):
    name: str
    def supports(self, document: DocumentEnvelope) -> bool: ...
    def extract(self, document: DocumentEnvelope) -> DocumentEnvelope: ...


class EntityResolver(Protocol):
    name: str
    def resolve(self, field: ExtractedField, candidates: Sequence[dict[str, Any]]) -> ExtractedField: ...


class ValidationEngine(Protocol):
    name: str
    def validate(self, document: DocumentEnvelope) -> DocumentEnvelope: ...


class RoutingEngine(Protocol):
    name: str
    def route(self, document: DocumentEnvelope) -> dict[str, Any]: ...
