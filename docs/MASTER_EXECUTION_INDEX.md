# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26  
Repository: `Report-Engainall/Report-Advisor`  
PR: #41  
Branch: `data-quality-authoritative-snapshot`  
Base: `b4897b8d456d10736642745b097de2aea89b27c5`

## Permanent execution policy
`DISCOVER → INVENTORY → CONSUMER DISCOVERY → ROOT CAUSE → CORRECT ARCHITECTURE → IMPLEMENT → REGRESSION → EXACT CI → CONSUMER VERIFY → INDEX → NEXT FAILURE FAMILY`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Current code HEAD before this Index update: `ec95b344c1f95d3b04bd4eff2c1229ea2cdf86b2`.
- Starting exact HEAD: `b4897b8d456d10736642745b097de2aea89b27c5`.
- Current exact-head CI: **NOT OBSERVABLE**; workflow-run lookup returned zero runs for `ec95b344c1f95d3b04bd4eff2c1229ea2cdf86b2`. No PASS is claimed.
- `quality.yml` remains the canonical quality gate. No duplicate quality workflow was introduced.

## P0 — Data Quality authoritative closure
Finding: `DataQualityPage` consumed `fetchDataQualityDatasets()` and calculated four business-quality scores in the browser. The existing bridge was bounded/fail-closed but still transferred source rows and kept the browser as the aggregation owner.

Root cause: business-quality truth was computed in a client-side reducer over bounded collections rather than by an authoritative server snapshot.

Fix implemented:
- Added `get_data_quality_snapshot()` as a tenant-derived `SECURITY DEFINER` RPC with fixed `search_path` and no tenant parameter.
- Explicit tenant authority comes from `current_company_id()`; missing tenant context fails closed with `TENANT_CONTEXT_MISMATCH`.
- RPC grants are restricted to `authenticated`; PUBLIC and anon execution are revoked.
- The snapshot computes customer/product/invoice/inventory issue counts server-side.
- Numeric NULLs remain UNKNOWN: missing numeric values are not converted to zero for quality findings.
- Added `src/lib/data-quality-snapshot.ts` as the only browser adapter for the snapshot.
- Added `DataQualitySnapshotPage` and changed `/data-quality` to consume the canonical snapshot instead of `fetchDataQualityDatasets()`.
- Existing `DataQualityPage` in `EntityPages.tsx` is now a legacy implementation and has NOT been removed yet; zero-consumer proof/removal remains a required next step.

Regression / contract evidence:
- `src/lib/data-quality-snapshot.test.ts` verifies the adapter calls exactly `get_data_quality_snapshot` and fails closed on an invalid payload.
- `src/lib/data-quality-snapshot.contract.test.ts` verifies tenant-derived RPC shape, restricted grants, absence of browser table reads in the adapter, and route migration.
- Existing `scripts/check-data-quality-projections.mjs` remains relevant to the legacy bounded bridge until that bridge is removed.

Status: `IMPLEMENTED → REGRESSION → CONSUMER MIGRATION COMPLETE AT ROUTE LEVEL`; exact-head CI and runtime are not yet verified.

## Data Truth note
The server snapshot intentionally preserves the pre-migration quality formulas for non-null numeric values while correcting the architecture boundary. It does not treat NULL/missing numeric fields as zero. Semantic equivalence must still be proven against a real fixture/corpus before this finding is marked fully closed.

## Remaining P0/P1
1. Prove zero consumers of `fetchDataQualityDatasets()` and the legacy `DataQualityPage`; then remove both only after regression.
2. Run exact-head CI and fix any compile/type/migration failures rather than weakening tests.
3. Repository-wide consumer/dependency proof for `get_sales_secondary_metrics`; remove only after zero consumers.
4. Complete `queries-compat.ts` function-by-function classification.
5. BI / Decision Metrics / Exports / Demand Velocity / Inventory Intelligence business-truth sweep.
6. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions under identical tenant/date/status/as-of/filter contracts.
7. Product-page margin NULL/zero contract review.
8. Tenant runtime isolation across DB/Storage/Realtime/AI/vector/worker/notification.
9. Repository-wide direct Supabase/business-calculation sibling sweep.

## Regression / CI
Canonical `quality.yml` remains the quality gate. No duplicate quality workflow was created.

Exact-head CI status is **NOT OBSERVABLE** for `ec95b344c1f95d3b04bd4eff2c1229ea2cdf86b2`.

## Status ladder
- FOUNDATION: PASS by prior evidence.
- IMPLEMENTED: PASS for the Data Quality route migration at code level.
- REGRESSION: implemented; exact-head CI not yet observable.
- GATED: NO CLAIM for current HEAD.
- CONSUMER VERIFIED: route consumer migrated; zero-consumer proof for legacy path remains open.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
1. Supabase A/B tenant isolation.
2. Storage isolation.
3. Realtime authorization.
4. AI/vector isolation.
5. Authenticated browser E2E.
6. Real document/OCR corpus.
7. Worker crash/recovery/DLQ/duplicate-side-effect drill.
8. Native watcher.
9. Real backup restore + integrity + rollback + RPO/RTO.
10. Production telemetry + PII redaction.
11. Production load/canary/rollback.
12. Production query-plan/scale evidence.

## Next execution
- First: exact-head CI for the Data Quality migration; treat every failure as evidence and fix root cause.
- Then: zero-consumer proof/removal of the legacy Data Quality dataset path and page implementation.
- In parallel: `get_sales_secondary_metrics` zero-consumer sweep, BI/Decision/Export/Demand/Inventory Intelligence truth sweep, and tenant/security sibling sweep.
- Continue runtime/LIVE preparation without waiting passively for CI.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
