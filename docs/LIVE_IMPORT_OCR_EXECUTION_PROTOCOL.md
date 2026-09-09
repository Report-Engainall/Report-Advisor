# LIVE Import/OCR Execution Protocol

## Purpose
This document defines the evidence contract for real PDF/Excel/CSV ingestion. It does not seed synthetic business data and it does not convert UI success into an import PASS.

## Required lifecycle
Upload → SHA-256 → Analyze → Schema discovery → Mapping → Normalization → Validation → DQS → Approval (when required) → Commit → Canonical data → KPI → Evidence → Report.

## Truth rules
- The client-provided file is the source artifact.
- SHA-256 is the idempotency/duplicate identity; a repeated hash must never create duplicate canonical rows.
- Business keys (item/customer/supplier codes) are preferred over internal IDs for cross-document reconciliation.
- OCR/extraction values require provenance: document, page/row/cell/region where available, confidence, and validation state.
- UNKNOWN, BLOCKED, ERROR and EMPTY remain distinct from numeric zero.
- LLM output may explain or classify, but it must not calculate canonical KPIs.
- A report may only claim a metric when SOURCE → FORMULA → PERIOD → TENANT → AS-OF → FRESHNESS → EVIDENCE → RESULT is available.

## DQS policy
- < 50: reject.
- 50–74: approval required.
- ≥ 75: eligible for commit, subject to validation and tenant authorization.
- Thresholds are governance rules; they do not override failed structural validation.

## Live evidence checklist
1. Record exact source filename, SHA-256, MIME type, byte size and ingestion timestamp.
2. Record extraction mode (native PDF text, table extraction, OCR, Excel/CSV parser).
3. Capture discovered columns/fields and mapping decisions.
4. Capture rejected/fixable rows with reasons without silently coercing bad values.
5. Record DQS score and decision.
6. Verify duplicate replay using the same SHA-256 produces no duplicate canonical facts.
7. Verify crash/resume does not double-commit rows.
8. Verify rollback leaves canonical data unchanged when a commit fails.
9. Verify every committed fact is attributable to the source document and tenant.
10. Recompute at least one canonical KPI from the committed facts and compare it with the report result.
11. Run Tenant A/B authorization checks against the resulting records and direct RPCs.
12. Preserve evidence references for the final certification index.

## Acceptance
A live import is PASS only when the full lifecycle and its evidence are observed on a real user-supplied document. Static code inspection, a page rendering, a fabricated row, or a successful upload alone is insufficient.
