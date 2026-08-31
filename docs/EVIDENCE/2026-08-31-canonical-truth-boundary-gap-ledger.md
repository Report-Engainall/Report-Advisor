# Canonical Truth Boundary — Owner-Level Gap Ledger

Baseline scope intentionally excludes previously closed fronts: ZIP traversal, document extraction security, Security/RLS, CI topology, and decision authorization. Revisit only on new finding, affected SHA, environment change, or regression.

## Chain reviewed

`Evidence → Lineage → Import → Reconciliation → Canonical Record → Server-side Aggregation → KPI → Report`

## Findings

### G1 — Import crossed directly into canonical write
- Root cause: `processFolderFiles()` validated required fields and then called `commitImportBatch()` without a reconciliation state or provenance contract.
- Risk: successful ingestion could become canonical truth without explicit reconciliation.
- Fix: `reconcileForCanonical()` is now mandatory before `commitImportBatch()`.
- Regression: conflicting same-identity rows are rejected.
- Status: CLOSED on this front.

### G2 — Partial/failed extraction could still continue into canonical import
- Root cause: extraction result was used only as a warning; the import path continued for `partial` and `failed` extraction.
- Risk: canonical records could be created without complete extraction evidence.
- Fix: canonical import is fail-closed unless extraction status is `succeeded`.
- Regression: canonical import path rejects partial/unavailable extraction.
- Status: CLOSED on this front.

### G3 — Canonical commit accepted unproven rows
- Root cause: `commitImportBatch()` accepted a plain `CanonicalImportRow` with no runtime provenance or reconciliation proof.
- Risk: callers could bypass the intended evidence/reconciliation boundary.
- Fix: commit now accepts `ReconciledCanonicalImportRow` and performs runtime tenant/provenance/reconciliation assertions.
- Regression: missing provenance and tenant mismatch fail closed.
- Status: CLOSED on this front.

### G4 — Conflicting evidence had no canonical import conflict gate
- Root cause: duplicate canonical identities inside one import chunk were not reconciled before write.
- Risk: last-write/iteration order could silently determine truth.
- Fix: same canonical identity + different critical payload is rejected as `CONFLICTING_EVIDENCE_FOR_SAME_CANONICAL_IDENTITY`.
- Regression: adversarial conflicting product rows.
- Status: CLOSED on this front.

### G5 — Provenance/lineage was not attached to the canonical import contract
- Root cause: import rows carried data only.
- Risk: canonical writes could not be proven back to tenant, source, source hash, evidence identity, and lineage at the application boundary.
- Fix: every reconciled row carries tenant/source/sourceHash/sourceDocumentId/evidenceId/lineageId and the commit boundary validates all of them.
- Status: CLOSED on this front.

## Verified downstream boundary

- Dashboard KPIs are retrieved through `get_dashboard_snapshot` rather than browser-side aggregation.
- Profitability report retrieves `get_profitability_snapshot` and renders the server snapshot directly.
- Existing dashboard/report code therefore remains a server-side aggregation path; no client-array reconstruction finding was opened in this pass.

## Remaining next front

The next capability front is **Canonical Aggregation → KPI → Report semantic closure**, specifically adversarial verification that every KPI/report field preserves `UNKNOWN` / `INSUFFICIENT_DATA` semantics and that no aggregation branch converts unavailable source truth to a misleading numeric zero.

This ledger is a closure record, not an invitation to re-audit the closed findings above.
