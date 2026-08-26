# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth for this wave: PR #45 successor wave based on exact PR head `d9228ea0c823216ea0e12af85497992290ded1dc` (base `4095e0f0d427652eb705ba3955389ae978d7b5bf`). Current wave code HEAD: `5bd96d3dbbe8c19e8b522a76c26976d8ad069279`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- PR #45 currently points to `d9228ea0c823216ea0e12af85497992290ded1dc`; `724e93c1724bdd85eeb8cc6b15677ac4b922a688` is its parent, not the PR head. No evidence from either SHA is reused as certification for `5bd96d3dbbe8c19e8b522a76c26976d8ad069279`.
- Current wave HEAD `5bd96d3dbbe8c19e8b522a76c26976d8ad069279` contains the financial semantic fix and regression below.
- Exact-head CI for the current wave is **PENDING / NOT YET OBSERVABLE**. No PASS is claimed.
- Historical CI runs remain historical only.

## Active batch — Financial Truth / NULL-to-ZERO sibling closure
### FIND
- `buildFinancialIntelligence()` converted missing `costOfSales` (`null`) to `0` before calling the canonical `cashConversionCycle()` engine.
- This contradicted its own `PROFIT_UNAVAILABLE` state and could make CCC's DIO appear as a valid null/zero-derived path instead of preserving missing financial evidence.

### ROOT CAUSE
- The financial adapter treated a nullable financial input as an implementation convenience and coerced it to a numeric sentinel before crossing the canonical BI boundary.
- The canonical CCC contract itself accepted only `number`, making the adapter's coercion the only way to represent missing cost and therefore hiding the semantic distinction at the engine boundary.

### FIX
- `cashConversionCycle()` now accepts `costOfSales: number | null` and preserves missing cost as `dio=null`, `ccc=null`, `status='INSUFFICIENT_DATA'`.
- `buildFinancialIntelligence()` passes the nullable cost through unchanged; no `?? 0` sentinel remains at this boundary.

### REGRESSION
- `scripts/business-intelligence-regressions.test.ts` now exercises both missing-cost and complete-cost financial intelligence.
- Missing cost must produce `PROFIT_UNAVAILABLE`, `grossProfit=null`, `ccc.status=INSUFFICIENT_DATA`, `ccc.dio=null`, and `ccc.ccc=null`.
- Complete cost must still produce `PROFIT READY` and `CCC READY` with a non-null CCC.

### CONSUMER STATE
- Direct consumer `buildFinancialIntelligence()` migrated to the nullable canonical contract.
- No claim yet that every profitability/CCC surface in the repository is semantically equivalent; BI/Decision/Analytics/Export equivalence remains open.

## Existing closure families retained
- Canonical query / inventory / receivables / worker lifecycle closure is inherited from PR #45 parent `d9228ea0c823216ea0e12af85497992290ded1dc`; it is not re-certified by this wave until exact-head CI passes.
- `queries-compat.ts` was removed; legacy Inventory and Receivables implementations remain candidates for explicit zero-consumer cleanup.

## Data Truth
- Aging missing/invalid due dates remain `UNDATED`, not `0-30`.
- BI rejects non-finite/negative invalid financial inputs and malformed what-if changes.
- CCC now preserves missing cost as `INSUFFICIENT_DATA` instead of a numeric sentinel.
- Missing impact/accuracy remain null where evidence is insufficient.
- Global semantic sweep remains open for all NULL/UNKNOWN/MISSING/EMPTY/ZERO/INSUFFICIENT_DATA/LOW/PASS/FAIL conversions.

## Tenant / Security
- Canonical browser resolver remains `resolveCurrentCompanyId()`.
- Canonical import RPC wrapper verifies caller tenant context before entity RPCs.
- Storage, Realtime, AI/vector, export/download, notification/log, cache and worker indirect paths remain open for adversarial verification.
- Static RLS is not runtime cross-tenant proof.

## Receivables
**IMPLEMENTED + REGRESSION-ENFORCED + ROUTE-CONSUMER-MIGRATED; EXACT-HEAD CI NOT VERIFIED.**
- Tenant authority from `current_company_id()`.
- Cancelled/canceled/void invoices excluded.
- Missing due date remains `UNDATED`.
- Business metrics computed before display pagination; page size bounded to 500.
- Full export equivalence and runtime large-dataset evidence remain open.

## Profitability
**PARTIALLY CLOSED / REGRESSION-ENFORCED ON CURRENT WAVE; CI PENDING.**
- Missing cost no longer becomes numeric zero at the financial-intelligence → CCC boundary.
- Profitability still requires full financial truth contract coverage: revenue/cost/quantity/discount/return/cancelled/void/date/tenant/currency/rounding and cross-surface equivalence.
- Runtime/live/production financial evidence does not exist yet.

## Worker / Watched Folder
- Folder watcher computes SHA-256 before duplicate detection and fails closed if unavailable.
- Folder job ledger rejects duplicate starts and terminal resurrection; regression is wired into quality CI on the parent PR head.
- Deployed concurrency/lease/recovery behavior remains LIVE REQUIRED.

## Cross-Surface Equivalence
**PARTIAL / OPEN.**
- Inventory and Receivables are anchored to server-side snapshot truth.
- Financial intelligence now preserves missing-cost semantics at its canonical BI boundary.
- Complete BI ↔ Decision ↔ Analytics ↔ Export equivalence remains unproven across domains.
- Required equality dimensions: tenant, as-of/date, status/cancelled/void, records, totals, counts, NULL/UNKNOWN semantics, currency, aggregation semantics.

## Storage / Realtime / AI / Vector
**STATIC GATES ONLY / LIVE REQUIRED.** Need tenant object/channel/payload isolation, vector metadata filtering, retrieval-cache isolation and deletion consistency. DB RLS alone is insufficient proof.

## Performance
- Inventory and Receivables separate display pagination from business aggregation.
- Repository-wide unbounded business-read, browser aggregation, N+1, duplicate-RPC, index/query-plan and failure-closed work remains open.

## LIVE REQUIRED
1. Authenticated browser E2E with real tenant data.
2. Inventory dataset > page size with total invariants across pages.
3. Receivables dataset > page size with aging/total invariants across pages.
4. Tenant A/B adversarial DB/Storage/Realtime/AI/vector/export/worker drill.
5. Real worker crash/restart/duplicate/stale-lease/DLQ/resume drill.
6. Real backup restore + measured RPO/RTO + rollback.
7. Real OCR/PDF/XLSX/CSV corpus execution.
8. Production telemetry trace and load/canary/rollback.
9. Browser/native Web Crypto availability matrix.

## Capability status ladder
IMPLEMENTED → REGRESSION-ENFORCED → CONSUMER-VERIFIED → GATED → INTEGRATED → RUNTIME-EVIDENCED → LIVE-VERIFIED → PRODUCTION-CERTIFIED.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current wave has a concrete semantic fix plus regression, but exact-head CI is not yet observable; cross-surface equivalence, full tenant sibling verification, worker deployed recovery, storage/realtime/vector isolation and runtime/live/production evidence remain outstanding.
