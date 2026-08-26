# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + current PR #41 exact-head candidate

## Execution policy
- FIND → ROOT CAUSE → FIX → REGRESSION → CI → EXACT-HEAD PROOF → INDEX → NEXT FAILURE.
- No historical PASS promotion, scanner-only closure, skip/whitelist, fake runtime/LIVE evidence, or production certification without live evidence.
- UNKNOWN/NULL/MISSING/INSUFFICIENT_DATA never becomes ZERO unless zero is a proven business value.

## Current exact state
- Previous code HEAD: `8fe63337bf8ade11d64edeff02616a090b78569d`.
- Current code HEAD before index update: `8fe63337bf8ade11d64edeff02616a090b78569d`.
- Index commit produced by this update is intentionally separate and must be recorded after GitHub returns its SHA.
- Branch: `wave-final-exact-ci-16`.
- PR: #41.
- PR base: `main` at `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Exact-head CI for `8fe63337bf8ade11d64edeff02616a090b78569d`: NOT OBSERVABLE at index-write time (`check_runs.total_count=0`). No PASS is claimed.

## Wave — Canonical dashboard aggregation migration
### Objective
Remove dashboard business aggregation from the browser and move the dashboard metric family behind one authoritative, tenant-bound server aggregation boundary while retaining display pagination as a separate concern.

### Consumer inventory
The repository-wide search identified `DashboardPage.tsx` as the direct consumer of the legacy dashboard functions in `src/lib/queries.ts`: `fetchDashboardKPIs`, `fetchMonthlyTrend`, `fetchTopCustomers`, `fetchTopProducts`, `fetchCategoryBreakdown`, and `fetchAgingBuckets`. Other query helpers remain intentionally retained until their individual consumer families reach zero-consumer proof.

### Findings
1. `fetchDashboardKPIs` fetched all sales invoices, all related sale items, all inventory balances and all purchase invoices into the browser before reducing them.
2. `fetchMonthlyTrend` fetched all invoices and all sale items and reconstructed month/cost aggregates client-side.
3. `fetchTopCustomers` aggregated all sales invoices client-side.
4. `fetchTopProducts` first fetched all invoice IDs and then all matching sale items before ranking client-side.
5. `fetchCategoryBreakdown` fetched all invoice IDs, all matching sale items and category metadata before client-side grouping.
6. `fetchAgingBuckets` fetched all sales invoices and computed age buckets in the browser.
7. The legacy KPI family did not exclude `cancelled`/`void` rows and could not distinguish incomplete required numeric data from a valid zero.
8. Display pagination and business aggregation were structurally separate only by convention; the canonical replacement now makes aggregation server-side and bounded by the RPC contract.

### Root cause
Business truth was implemented in a browser query module rather than one authoritative database aggregation boundary. This created unbounded reads, duplicate aggregation logic, page/data-set drift risk, status drift and weak NULL semantics.

### Canonical design
`UI → dashboard-canonical adapter → get_dashboard_snapshot RPC → current_company_id() → database aggregates`.

The new RPC accepts only `p_months` and `p_as_of`; tenant identity is never caller-selected. It excludes `cancelled`/`void`, clamps the trend window to 1–24 months, aggregates on the server, and returns explicit `INSUFFICIENT_DATA` when required numeric fields are incomplete rather than manufacturing zeros.

### Fixes
- Added `supabase/migrations/20260826052000_dashboard_canonical_aggregation.sql` with authoritative `get_dashboard_snapshot(integer,date)`.
- Added `src/lib/dashboard-canonical.ts` as the consumer adapter and strict response boundary.
- Migrated `DashboardPage.tsx` to `fetchDashboardSnapshot` + bounded intelligence reads; legacy dashboard aggregation functions are no longer direct DashboardPage consumers.
- Kept legacy `queries.ts` implementations intentionally for compatibility until repository-wide zero-consumer proof is complete; no destructive deletion was performed.

### Regression
Added `scripts/dashboard-canonical-regression.mjs` and wired it into the existing `Behavioral regressions` step of `.github/workflows/quality.yml`.

The regression verifies semantics, not merely symbol presence:
- 21 authoritative invoices remain 21 even when a display page contains 20.
- cancelled rows do not contribute to aggregates.
- missing required cost data produces an insufficient-data condition rather than zero.
- tenant authority is server-derived from `current_company_id()`.
- DashboardPage no longer consumes the six legacy dashboard aggregation functions.
- legacy implementations remain retained pending zero-consumer proof.

### Performance evidence
IMPLEMENTED: the six dashboard business aggregation paths now have a single server-side aggregation RPC with bounded month input and no browser-wide invoice/item aggregation. Local static evidence proves bounded RPC input and removal of the dashboard consumer path. Production latency, database query-plan timing and load behavior remain LIVE REQUIRED.

### Exact-head evidence
- Previous topology-hardened code HEAD: `0834e891e335594c8c16de49f61b64e18a7c40a1`.
- Migration commit: `b9454a9fbd17cd0b963dbdce27311c11e6bf6751`.
- Adapter commit: `2778b8ab8fd5bc82019f226a41a3882d59367a36`.
- Dashboard consumer migration: `68e6b30867b22e3ac1c14d1f288aa1035b67f4d7`.
- Regression: `dfb78f4fbd942799511abcd387a3fa6f628cc9f4`.
- Workflow gate: `8fe63337bf8ade11d64edeff02616a090b78569d`.
- Exact-head CI: NOT OBSERVABLE yet for `8fe63337bf8ade11d64edeff02616a090b78569d`; `check-runs` currently returns zero runs. Historical PASS is not promoted.

## Definition-of-done status for this family
- FOUNDATION: PASS.
- IMPLEMENTED: PASS.
- TESTED: PASS by semantic regression contract.
- REGRESSION VERIFIED: PASS locally by contract construction; exact CI pending.
- GATED: IMPLEMENTED in canonical `quality.yml`; exact CI pending.
- INTEGRATED: PASS on PR #41 branch.
- CONSUMER VERIFIED: DashboardPage migrated; repository-wide zero-consumer proof for legacy query implementations is NOT complete.
- RUNTIME VERIFIED: NOT CLAIMED.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## New remaining failure families discovered
1. `src/lib/queries.ts` still contains the six legacy dashboard implementations and other business-query families; safe removal is blocked until repository-wide consumer proof for each function.
2. `recommendations` and `alerts` remain direct bounded table reads in the new dashboard adapter; they are not aggregation-heavy, but cross-surface tenant/date/status semantics still require sibling verification.
3. The canonical dashboard RPC itself needs deployed Supabase runtime evidence for query-plan/index behavior and A/B tenant isolation.
4. Full Dashboard = Reports = Exports = Analytics = Decisions equivalence remains incomplete for non-dashboard surfaces.

## Previous closure chain
1. Secondary consumer drift → canonical sales secondary RPC/adapters → fixed and regressed.
2. Purchase page-total drift → server-side purchase summary → fixed and regressed.
3. Inventory UNKNOWN→ZERO → nullable valuation + INSUFFICIENT_DATA → fixed and regressed.
4. Export page/PDF truncation → canonical export RPCs + bounded fail-closed export + multi-page PDF → fixed and regressed.
5. Decision missing impact/accuracy → nullable metrics and unknown gate → fixed and regressed.
6. Typecheck drift → explicit nullable/status typing and Promise-safe boundary → fixed and regressed.
7. Outcome regression browser/Supabase coupling → pure outcome core → fixed and regressed.
8. File-security regression Vite alias coupling → pure file-identity core → fixed and regressed.
9. Batch workflow concurrency contract → concurrency group includes workflow identity → fixed; exact Run `32921316509` PASS.
10. Quality document-resilience command contract → missing npm script → fixed in `c025259e5046e4e097312e697fe66e7c18234f57`.
11. Production boundary certification command contract → fixed in `c025259e5046e4e097312e697fe66e7c18234f57`.
12. Production boundary trigger contract → fixed in `2caeed6cbb6e8447d7b717394fddaca11f7e635d`.
13. CI topology classification drift → fixed in `ce155390f42a6ea96b3e01b1395596d163b7170a` and regression-hardened in `0834e891e335594c8c16de49f61b64e18a7c40a1`.
14. Dashboard browser aggregation drift → authoritative snapshot RPC + adapter + semantic regression → current wave, exact CI pending.

## Security / tenant
- Dashboard aggregation derives tenant from `current_company_id()` and does not accept caller-selected tenant identity.
- Global tenant RLS, import tenant-context and adversarial tenant contracts remain CI-gated.
- Supabase A/B DB/Storage/Realtime/AI/vector/worker/notification runtime isolation remains LIVE REQUIRED.

## Cross-surface truth
- Dashboard secondary aggregation now has one authoritative snapshot source.
- Dashboard = Reports = Exports = BI/KPIs = Decisions is not yet fully proven across all surfaces.
- Date/status/null/as-of semantics must remain canonical; display pagination cannot define business totals.

## Production certification
- IMPLEMENTED: substantial deep closure.
- TESTED: extensive local/regression suite.
- GATED: canonical quality workflow plus security/resilience gates.
- INTEGRATED: PR #41.
- CONSUMER VERIFIED: dashboard consumer migration completed; legacy zero-consumer proof pending.
- RUNTIME VERIFIED: not claimed.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
1. Supabase A/B tenant isolation across DB/Storage/Realtime/AI/vector/import/report/export/decision/worker/notification paths.
2. Authenticated browser E2E with real tenant data.
3. Real PDF/OCR/XLSX/CSV corpus execution and measured extraction quality.
4. Native watched-folder proof on Windows/Android and iOS capability proof.
5. Deployed worker crash/restart/duplicate/stale-lease/DLQ/resume drill.
6. Real backup restore + integrity + rollback + measured RPO/RTO.
7. Production telemetry trace and PII-redaction verification.
8. Production load/canary/rollback evidence.
9. Browser/native Web Crypto availability matrix.
10. Supabase query-plan/index evidence for `get_dashboard_snapshot` under representative production-scale data.

## Next execution wave
- First: exact-head CI for `8fe63337bf8ade11d64edeff02616a090b78569d`.
- Then: repository-wide zero-consumer inventory for every remaining business aggregation in `src/lib/queries.ts` and `queries-compat.ts`.
- Then: migrate Reports/Analytics/Exports/Decisions sibling metrics to the same canonical sources and establish cross-surface invariants.
- In parallel: tenant authority sibling sweep across Storage/Realtime/AI/vector/notifications/workers and runtime-only blockers.

Production certification remains explicitly blocked until LIVE evidence exists.
