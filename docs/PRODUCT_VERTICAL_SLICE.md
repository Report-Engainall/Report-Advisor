# Product Integration Sprint — Sales / Inventory / Purchasing

## Repository-side status

The first vertical slice is implemented as a single deterministic product chain:

`canonical fixture → validation → reconciliation → semantic metrics → evidence → insight → recommendation → decision → approval → workforce task → executive report → PDF projection → outcome`

### Capability classification

| Capability | Classification | Status |
|---|---|---|
| Sales + Inventory + Purchasing vertical slice | MOAT | IMPLEMENTED + INTEGRATED + TESTED (repository contract) |
| Metric → Evidence → Insight | MOAT | IMPLEMENTED + INTEGRATED |
| Recommendation → Decision | MOAT | IMPLEMENTED + INTEGRATED |
| Decision → Approval | MOAT | IMPLEMENTED + INTEGRATED; policy is deterministic |
| Approval → Department Task | MOAT | IMPLEMENTED + INTEGRATED; owner stays `UNRESOLVED` without real assignment |
| Executive Report → PDF projection | MOAT | IMPLEMENTED + INTEGRATED; print-safe RTL HTML projection, browser PDF still pending |
| Expected → Actual Outcome | MOAT | Contracted; remains BLOCKED until an actual outcome is evidenced |
| Demo Fixture separation | SUPPORTING | Explicit benchmark fixture, isolated from production business truth |
| Evidence Graph Runtime W2.2 | DEFERRED | Intentionally blocked by W2.1 security/migration/quality/consumer/E2E prerequisites |

## Source truth

`product-vertical-slice-fixture.mjs` reuses the existing `golden-realistic-fixtures.mjs` inventory fixture for SKU, quantity and cost identity. The benchmark-only sales/purchasing facts are explicit fixture fields, not production records and not used to claim runtime readiness.

## Acceptance boundary

`npm run test:product-vertical-slice` protects the chain from metric to report/PDF projection. `actualOutcome` is nullable by design and is never fabricated, so the final outcome edge remains BLOCKED until runtime evidence exists.

This document does not promote W2.2, staging, production, PR #75, or certification.
