# Master Execution Index — Current Delta — 2026-08-25

Append-only supplement to `docs/MASTER_EXECUTION_INDEX.md`.

## Historical baseline

The earlier entries in this file are retained unchanged as historical evidence. The following is a new append-only execution delta for the current Gross Profit Truth closure.

## Gross Profit Cross-Surface Truth — current delta — 2026-08-26

### Starting HEAD
- Execution started from the user-designated HEAD `f23b506ea3ab821dd707cc7ad9ffb8d020f77e69`.
- No earlier SHA is being used as certification for the current proof state.

### FIND
The existing cross-surface fixture was not independent: it computed `truth(completeA)` and then projected that same reference result onto every named surface. That could pass even if a production surface diverged.

### ROOT CAUSE
The fixture mixed **reference truth generation** with **surface result generation**. It therefore proved the reference formula but did not execute real Dashboard/Reports/Analytics/BI/Decision/Export consumers.

### ARCHITECTURAL FIX
`gross-profit-cross-surface-fixture.mjs` was changed to:
- keep the business reference completely independent from production consumers;
- require real surface-result JSON from an external production/browser execution harness;
- compare every supplied surface result independently against the reference;
- require both Tenant A and Tenant B result sets;
- require export `rowCount = 25` and `rowCount > 20`;
- fail closed when real surface evidence is absent;
- prohibit synthetic projection of canonical results onto surfaces.

Commit: `24c776d0b0a5c6ce7934b9e86079431b9b79fcb9`.

### Evidence document
`docs/GROSS_PROFIT_CROSS_SURFACE_EVIDENCE_2026-08-26.md` was updated with the current consumer sweep, the invalidated synthetic-projection method, the independent fixture reference values, and explicit NOT PROVEN classifications.

Commit: `5760ca09c0993a3dac7227a462b764bffb3b75e1`.

### Current classifications
- Independent reference truth: PROVEN.
- Dashboard wiring to canonical consumer: PROVEN at source level; numeric cross-surface execution NOT PROVEN.
- Reports migrated wiring: PROVEN at source level; numeric cross-surface execution NOT PROVEN.
- Executive Decision canonical wiring: PROVEN at source level; numeric cross-surface execution NOT PROVEN.
- Analytics Gross Profit consumer: NOT ESTABLISHED; current Analytics surfaces inspected are RFM/ABC/Aging.
- BI independent Gross Profit consumer: UNKNOWN / NOT PROVEN.
- Export source path: `fetchAllSalesInvoicesForReportExport` is full-dataset and independent of presentation page pagination at source level; actual 25-row runtime result NOT PROVEN.
- Tenant A/B isolation: NOT PROVEN at runtime.
- Date-boundary runtime equivalence: NOT PROVEN.
- Missing/NULL-cost cross-surface equivalence: NOT PROVEN.
- Gross Profit Cross-Surface Truth: OPEN / NOT PROVEN.

### Important evidence rule
A fixture PASS cannot be upgraded to `TRUTH-PROVEN` unless actual production consumers generate the recorded surface results. Wiring/source inspection and canonical-query tests are not substitutes for surface execution.

### Current HEAD after proof-hardening commits
The latest branch HEAD after this delta is the SHA returned by the append-only documentation commit. It is not certified until a fresh exact-head CI run covers that SHA.

### Next execution gate
`Independent fixture → real authenticated surface execution → numeric comparison → export completeness → tenant isolation → regression → exact-head CI`.

No Discounts, Tax, Returns, Currency, Worker, Runtime, or Feature Creep closure is being claimed from this delta.
