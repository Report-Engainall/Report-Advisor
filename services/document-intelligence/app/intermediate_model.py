"""Compatibility exports for the canonical Document Intelligence model.

The canonical model lives only in app.contracts. This module intentionally owns no
parallel dataclasses or lifecycle semantics.
"""
from .contracts import (
    ALLOWED_TRANSITIONS,
    Block,
    Cell,
    DocumentEnvelope,
    ExtractedField,
    Page,
    ProcessingState,
    Provenance,
    Row,
    Table,
    can_transition,
)

__all__ = [
    "ALLOWED_TRANSITIONS",
    "Block",
    "Cell",
    "DocumentEnvelope",
    "ExtractedField",
    "Page",
    "ProcessingState",
    "Provenance",
    "Row",
    "Table",
    "can_transition",
]
