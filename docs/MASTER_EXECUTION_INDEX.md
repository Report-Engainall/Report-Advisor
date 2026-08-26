# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth for this wave: PR #45 successor wave based on exact PR head `d9228ea0c823216ea0e12af85497992290ded1dc` (base `4095e0f0d427652eb705ba3955389ae978d7b5bf`). Current wave code HEAD: `7926e75b77bbd00c078446ca93a335363589dbe4`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- PR #45 parent head: `d9228ea0c823216ea0e12af85497992290ded1dc`.
- Current active wave HEAD: `7926e75b77bbd00c078446ca93a335363589dbe4`, descended from the PR head.
- Exact-head CI for `7926e75b77bbd00c078446ca93a335363589dbe4` is **PENDING / NOT YET OBSERVABLE**. No PASS is claimed.
- Historical PASS evidence is not promoted to the current SHA.

## Active batch — Financial Truth / NULL-to-ZERO sibling closure
### FIND
- `buildFinancialIntelligence()` converted missing `costOfSales` (`null`) to `0` before calling canonical `cashConversionCycle()`.
- `buildCanonicalIntelligence()` independently repeated the same semantic conversion with `input.costOfSales ?? 0`.
- This exposed a sibling failure family: nullable financial evidence was being collapsed to a numeric sentinel at more than one producer boundary.

### ROOT CAUSE
- The canonical CCC engine accepted only a numeric cost input, while producer adapters had nullable financial inputs. Instead of preserving absence through the contract, producers coerced missing evidence to zero.
- The problem was architectural/pattern-level, not isolated to one function.

### FIX
- `cashConversionCycle()` now accepts `costOfSales: number | null` and returns `dio=null`, `ccc=null`, `status='INSUFFICIENT_DATA'` when cost is unavailable.
- `buildFinancialIntelligence()` passes nullable cost unchanged.
- `buildCanonicalIntelligence()` passes nullable cost unchanged through the same canonical CCC contract.
- No production claim is made beyond these code paths; full profitability/cross-surface equivalence remains open.

### REGRESSION
- `scripts/business-intelligence-regressions.test.ts` covers:
  - direct CCC incomplete-data behavior;
  - Financial Intelligence missing vs complete cost;
  - Canonical Intelligence missing cost;
  - existing invalid numeric, aging, trend and what-if invariants.
- Canonical Intelligence regression requires `INSUFFICIENT_DATA`, `dio=null`, `ccc=null`, and the explicit missing-cost warning.

### CONSUMER FAMILY
- `buildFinancialIntelligence()` — migrated.
- `buildCanonicalIntelligence()` — migrated.
- `cashConversionCycle()` — canonical contract widened to preserve missing evidence.
- Other financial/BI/Decision/Export consumers are not yet certified equivalent.

## Existing closure families retained
- Canonical query / inventory / receivables / worker lifecycle closure is inherited from PR #45 parent `d9228ea0c823216ea0e12af85497992290ded1dc`; it is not re-certified by this wave until current exact-head CI passes.
- `queries-compat.ts` was removed; legacy Inventory and Receivables implementations remain candidates for explicit zero-consumer cleanup.

## Data Truth
- Aging missing/invalid due dates remain `UNDATED`, not `0-30`.
- CCC now preserves missing cost as `INSUFFICIENT_DATA` instead of numeric zero.
- Missing impact/accuracy remain null where evidence is insufficient.
- **Open sibling sweep:** all repository conversions between `NULL`, `UNKNOWN`, `MISSING`, `EMPTY`, `ZERO`, `INSUFFICIENT_DATA`, `BLOCKED`, `LOW`, `PASS`, `FAIL`.

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
- Missing cost no longer becomes numeric zero in both identified financial-intelligence producers feeding canonical CCC.
- Full contract still open for revenue/cost/quantity/discount/return/cancelled/void/date/tenant/currency/rounding and cross-surface equivalence.
- Runtime/live/production financial evidence does not exist.

## Worker / Watched Folder
- Folder watcher computes SHA-256 before duplicate detection and fails closed if unavailable.
- Folder job ledger rejects duplicate starts and terminal resurrection; regression is wired into quality CI on the parent PR head.
- Deployed concurrency/lease/recovery behavior remains LIVE REQUIRED.

## Cross-Surface Equivalence
**PARTIAL / OPEN.**
- Inventory and Receivables are anchored to server-side snapshot truth.
- Financial Intelligence and Canonical Intelligence now share the same nullable CCC contract.
- Complete BI ↔ Decision ↔ Analytics ↔ Export equivalence remains unproven.
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
**NOT PRODUCTION-CERTIFIED.** Current batch contains a concrete sibling-family fix and regression, but exact-head CI is not yet observable; full semantic sibling sweep, cross-surface equivalence, tenant sibling verification, worker deployed recovery, storage/realtime/vector isolation and runtime/live/production evidence remain outstanding.
