# Product Intelligence Gap Audit — 2026-09-08

This audit records the capabilities required for the intended Report-Advisor product and prevents declaring completion merely because individual screens exist.

## Required end-to-end contract

`SOURCE → SECURITY → FINGERPRINT → FORMAT → EXTRACTION/OCR → HEADER/COLUMN DETECTION → TYPE DETECTION → REPORT TYPE CLASSIFICATION → MAPPING → DUPLICATE/CONFLICT POLICY → QUALITY → RELATIONS → CANONICAL/RAW/LINEAGE → REPORT READ MODEL → SMART INSIGHTS → FORECAST → RECOMMENDATION → DECISION → OUTCOME → EVIDENCE`

## Current known gap classes

- Unified import exists as an architecture direction, but all source types are not yet equally capable and some parsers remain unavailable.
- Column detection and synonym mapping exist, but semantic classification needs stronger evidence and a deterministic fallback to general report.
- File-level SHA duplicate detection exists; row/entity duplicate and conflict policy needs a single product-wide contract.
- OCR exists for supported image/scanned PDF paths, but generic visual semantics require a configured vision backend.
- Source Analysis Workspace exists, but the entire dashboard/report/recommendation/forecast/assistant surface must consume the same durable read models.
- Existing specialized report pages must be audited for fake/independent data paths and redirected to authoritative source-backed analytics.
- Forecasts and assistant responses must expose provenance/confidence and remain tenant-safe.

## Non-negotiable acceptance

A report is not considered processed merely because parsing succeeded. It is processed when the user can inspect how it was understood, where it was routed, what was retained, what quality issues exist, what intelligence was derived, and which decisions/actions follow from evidence.

A report that cannot be confidently classified must remain usable as a general report. No fabricated business entity or number is allowed.
