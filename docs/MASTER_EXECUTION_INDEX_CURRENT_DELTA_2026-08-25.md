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

### Runtime harness investigation — current delta

#### FIND
The required authenticated surface execution artifact cannot currently be produced by the repository's existing test infrastructure.

#### ROOT CAUSE
The current repository contains static E2E/runtime contract gates and service/worker runtime infrastructure, but no reusable authenticated browser/session harness that executes the real Dashboard, Reports, Executive Decision and Export surfaces and captures their numeric results. No existing Playwright/Puppeteer/Cypress/browser-storage-state harness was identified in the current branch inspection.

#### Classification
`RUNTIME BLOCKED — AUTHENTICATED SURFACE HARNESS ABSENT`

This is an evidence/infrastructure blocker. It is not a product PASS and does not close Gross Profit Truth.

#### Existing infrastructure deliberately not misclassified

`scripts/check-report-execution-e2e-contract.mjs` validates report-execution contracts/components (execution gate, queue, renderers, download, durable worker adapter and ledger). It does not establish an authenticated browser session or surface-level KPI execution.

#### Required future artifact

The runtime harness must capture, independently of the fixture reference:

```text
surface, tenant, date_from, date_to,
revenue, cost, gross_profit, quantity, status,
source/query identity, execution timestamp
```

Export must additionally capture `exported_rows` and `presentation_page_size`, with `25 > 20`.

### Current classifications
- Independent reference truth: PROVEN.
- Dashboard source wiring: PROVEN; runtime NOT PROVEN.
- Reports source wiring: PROVEN; runtime NOT PROVEN.
- Executive Decision source wiring: PROVEN; runtime NOT PROVEN.
- Export source path: PROVEN full-dataset at source level; runtime completeness NOT PROVEN.
- Analytics GP consumer: NOT ESTABLISHED; no PASS claim.
- BI GP consumer: NOT ESTABLISHED; no PASS claim.
- Tenant A/B runtime isolation: NOT PROVEN.
- Date-boundary runtime equivalence: NOT PROVEN.
- Missing/NULL-cost runtime equivalence: NOT PROVEN.
- Gross Profit Cross-Surface Truth: OPEN / NOT PROVEN.

### Planning-only capability work
A separate research-only `docs/FEATURE_GAP_CAPABILITY_MATRIX_2026-08-26.md` was added. It contains capability/value/integration/dependency/priority classification only and authorizes no implementation. It does not alter the Core Closure priority.

### Current branch HEAD
The latest branch HEAD after the runtime-blocker and planning-only documentation commits is `36b4eb190699f01dcce33ea2744bf99af7762f0a`.

This SHA has no exact-head CI certification yet.

### Next execution gate
`Authenticated real surface execution -> independent numeric comparison -> tenant A/B isolation -> NULL/date/export checks -> regression -> exact-head CI`.

No Discounts, Tax, Returns, Currency, Worker, Runtime, or Feature Creep closure is being claimed from this delta.
