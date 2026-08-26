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
- Current code HEAD before this Index update: `102903e21510ec80cc29876468d438fbc25ec576`.
- Starting exact HEAD: `b4897b8d456d10736642745b097de2aea89b27c5`.
- Current exact-head CI: **NOT OBSERVABLE**; workflow-run lookup returned zero runs for the pre-cleanup HEAD and the branch has not produced an observable run for the current cleanup head. No PASS is claimed.
- `quality.yml` remains the canonical quality gate. No duplicate quality workflow was introduced.

## P0 — Data Quality authoritative closure
Finding: `DataQualityPage` consumed `fetchDataQualityDatasets()` and calculated four business-quality scores in the browser. The existing bridge was bounded/fail-closed but still transferred source rows and kept the browser as the aggregation owner.

Root cause: business-quality truth was computed in a client-side reducer over bounded collections rather than by an authoritative server snapshot.

Fix implemented:
- Added a single final migration `supabase/migrations/20260826043000_data_quality_snapshot_compile_fix.sql` defining `get_data_quality_snapshot()`.
- Tenant authority comes from `current_company_id()`; the RPC accepts no tenant identifier and missing tenant context fails closed with `TENANT_CONTEXT_MISMATCH`.
- The RPC is `SECURITY DEFINER` with fixed `search_path`; PUBLIC and anon execution are revoked and authenticated execution is granted.
- Customer/product/invoice/inventory issue counts are computed server-side.
- NULL numeric values remain UNKNOWN and are not converted to zero for quality findings.
- Added `src/lib/data-quality-snapshot.ts` as the browser adapter.
- Added `DataQualitySnapshotPage` and changed `/data-quality` to consume the canonical snapshot instead of `fetchDataQualityDatasets()`.
- Superseded draft migrations were removed before CI: only the final migration remains.
- Existing `DataQualityPage` in `EntityPages.tsx` is now legacy and has NOT been removed yet; zero-consumer proof/removal remains open.

Regression / contract evidence:
- `src/lib/data-quality-snapshot.test.ts` verifies the adapter calls exactly `get_data_quality_snapshot` and fails closed on an invalid payload.
- `src/lib/data-quality-snapshot.contract.test.ts` verifies tenant-derived RPC shape, restricted grants, absence of browser table reads in the adapter, and route migration.
- Existing `scripts/check-data-quality-projections.mjs` still protects the legacy bounded bridge until that bridge is removed.

Status: `IMPLEMENTED → REGRESSION → ROUTE CONSUMER MIGRATED`; exact-head CI, database execution and runtime remain unverified.

## Data Truth note
The final server snapshot preserves the existing quality formulas for non-null numeric values while explicitly avoiding NULL→ZERO conversion. Semantic equivalence still requires fixture/corpus execution before this finding can be marked fully closed.

## Remaining P0/P1
1. Prove zero consumers of `fetchDataQualityDatasets()` and the legacy `DataQualityPage`; then remove both only after regression.
2. Run exact-head CI and fix every compile/type/migration failure at root cause.
3. Prove whether `get_sales_secondary_metrics` still exists as a DB-only legacy function; remove only after migration/dependency/consumer proof.
4. Complete `queries-compat.ts` function-by-function classification.
5. BI / Decision Metrics / Exports / Demand Velocity / Inventory Intelligence business-truth sweep.
6. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions under identical tenant/date/status/as-of/filter contracts.
7. Product-page margin NULL/zero contract review.
8. Tenant runtime isolation across DB/Storage/Realtime/AI/vector/worker/notification.
9. Repository-wide direct Supabase/business-calculation sibling sweep.

## Regression / CI
Canonical `quality.yml` remains the quality gate. No duplicate quality workflow was created.

Exact-head CI status is **NOT OBSERVABLE** for current cleanup HEAD. No historical PASS is promoted.

## Status ladder
- FOUNDATION: PASS by prior evidence.
- IMPLEMENTED: PASS for the Data Quality route migration at code level.
- REGRESSION: implemented; exact-head CI not yet observable.
- GATED: NO CLAIM for current HEAD.
- CONSUMER VERIFIED: route consumer migrated; legacy zero-consumer proof remains open.
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
- First: exact-head CI observation/fix for the Data Quality migration.
- Then: zero-consumer proof/removal of the legacy Data Quality dataset path and page implementation.
- In parallel: DB-only `get_sales_secondary_metrics` dependency proof, BI/Decision/Export/Demand/Inventory Intelligence truth sweep, and tenant/security sibling sweep.
- Continue runtime/LIVE preparation without waiting passively for CI.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
