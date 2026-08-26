# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + PR #41 exact-head candidate

## Execution policy
- FIND → ROOT CAUSE → FIX → REGRESSION → CI → EXACT-HEAD PROOF → INDEX → NEXT FAILURE.
- No historical PASS promotion, scanner-only closure, fake runtime/LIVE evidence, or production certification without live evidence.
- UNKNOWN/NULL/MISSING/INSUFFICIENT_DATA never becomes ZERO unless zero is proven business truth.

## Current exact state
- Current code/workflow HEAD before this index commit: `888b4643cdddd96a633edd63c9f055155f31c621`.
- This index commit is separate from the code changes; its returned SHA is the new branch HEAD and therefore requires fresh exact-head CI evidence.
- Branch: `wave-final-exact-ci-16`.
- PR: #41.
- Base: `main @ 4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Exact checks for `888b4643cdddd96a633edd63c9f055155f31c621`: NOT OBSERVABLE when checked (`check_runs.total_count=0`). No PASS is claimed.

## Wave — Dashboard + Reports canonical aggregation
### Objective
Remove browser-wide business aggregation, eliminate page/subset drift, and establish authoritative server aggregation for Dashboard and high-risk Reports surfaces.

### Root causes found
- `src/lib/queries.ts` dashboard functions fetched complete invoice/item datasets and reduced them in the browser.
- Reports consumed those same legacy aggregators directly, duplicating business truth across Dashboard and Reports.
- Inventory Reports fetched all inventory balances and then computed low-stock/out-of-stock counts from the client dataset, while a DataTable provided only display pagination after the full fetch.
- Legacy KPI semantics did not consistently exclude cancelled/void rows and could not preserve missing required numeric data as unavailable.

### Canonical design
`UI → canonical adapter → authoritative RPC → current_company_id() → database`.

Dashboard:
`get_dashboard_snapshot(p_months,p_as_of)`.

Inventory:
`get_inventory_report_snapshot(p_page,p_page_size)`.

Business totals/counts are server-derived; display rows are bounded independently. Caller-selected tenant identity is never the authority.

### Implemented
- `b9454a9fbd17cd0b963dbdce27311c11e6bf6751`: dashboard aggregation RPC.
- `2778b8ab8fd5bc82019f226a41a3882d59367a36`: dashboard adapter.
- `68e6b30867b22e3ac1c14d1f288aa1035b67f4d7`: DashboardPage migration.
- `34f0035f954cbca672641d9ff4980e46b00c6970`: Reports sales/profitability/receivables migration.
- `1acb53493558669eac4771685482cf4ffef1469f`: bounded inventory RPC plus supporting indexes.
- `4f43b64eeab41a936e68cf9523372218acea133c`: inventory canonical adapter.
- `eb981c4a406ef6a3b6b6244c7aff98f1ca34589d`: InventoryReportPage migration to bounded authoritative snapshot.
- `888b4643cdddd96a633edd63c9f055155f31c621`: semantic regression extended for inventory and repository-wide legacy dashboard consumer proof.

### Regression / consumer proof
Existing `Behavioral regressions` in `quality.yml` executes `scripts/dashboard-canonical-regression.mjs`.
It proves:
- full dataset aggregate remains independent of display pagination;
- cancelled/void rows are excluded;
- required NULL data does not become zero;
- tenant authority is server-derived;
- Dashboard and Reports use canonical dashboard aggregation;
- no non-compatibility source consumes the six legacy dashboard aggregation names;
- inventory totals/low-stock/out-of-stock are server-derived while rows are bounded to the requested page;
- InventoryReportPage no longer consumes the unbounded `fetchInventoryBalances()` path.

This is a semantic contract plus consumer proof, not an audit-only scanner.

### Performance evidence
IMPLEMENTED: dashboard aggregation and migrated report aggregation no longer transfer full invoice/item histories for business totals. Inventory report rows are bounded to 1–100 per RPC call, while totalRows/lowStock/outOfStock/unknownRows are calculated server-side. Indexes were added for inventory tenant/update ordering and product tenant/activity lookup.

Production query-plan timing, production-scale latency and load evidence remain LIVE REQUIRED.

## Exact-head evidence
- Topology predecessor: `0834e891e335594c8c16de49f61b64e18a7c40a1`.
- Previous workflow/code commit: `8fe63337bf8ade11d64edeff02616a090b78569d` had Run `32922363407` / verify job `98038279898` IN_PROGRESS when checked; no PASS promoted.
- Later code commits were followed by additional changes before a stable exact-head check was observable.
- Current code/workflow before this index: `888b4643cdddd96a633edd63c9f055155f31c621`.
- Current exact CI: NOT OBSERVABLE at check time; zero check-runs for that exact SHA.

## Definition of Done
- FOUNDATION: PASS.
- IMPLEMENTED: PASS.
- TESTED: semantic regression implemented and workflow-gated.
- REGRESSION VERIFIED: exact CI pending.
- GATED: workflow wiring PASS by inspection; exact run pending.
- CONSUMER VERIFIED: Dashboard + Reports migrated; legacy dashboard family has zero non-compatibility source consumers under the regression contract.
- RUNTIME VERIFIED: NOT CLAIMED.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## Remaining failure families
1. `queries.ts` still contains legacy implementations and other business-query families; deletion requires function-by-function zero-consumer proof.
2. `queries-compat.ts` still re-exports legacy functions; remaining compatibility consumers need independent migration proof.
3. Cross-surface Dashboard = Reports = Exports = Analytics = BI = Decisions equivalence is incomplete.
4. Inventory report pagination must be extended to all UI pagination controls; current migrated report proves bounded first-page consumption and server totals.
5. Canonical RPCs need deployed Supabase query-plan/index evidence and A/B tenant runtime isolation.
6. Recommendations/alerts require sibling cross-surface tenant/date/status verification.

## Security / tenant
- Dashboard and inventory RPCs derive tenant from `current_company_id()`.
- Global RLS, import tenant-context and adversarial tenant contracts remain CI-gated.
- DB/Storage/Realtime/AI/vector/worker/notification runtime isolation remains LIVE REQUIRED.

## Cross-surface truth
- Dashboard, Sales Report, Profitability Report and Receivables aging now consume the same dashboard snapshot semantics.
- Inventory report business counts are server-authoritative and independent of page size.
- Full equivalence with Exports, Analytics, BI and Decisions remains open.

## Production certification
- IMPLEMENTED: substantial deep closure.
- TESTED: extensive local/regression suite.
- GATED: canonical quality workflow plus security/resilience gates.
- INTEGRATED: PR #41.
- CONSUMER VERIFIED: migrated dashboard/report aggregation families.
- RUNTIME VERIFIED: not claimed.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
1. Supabase A/B tenant isolation across DB/Storage/Realtime/AI/vector/import/report/export/decision/worker/notification.
2. Authenticated browser E2E with real tenant data.
3. Real document corpus accuracy.
4. Native watcher proof.
5. Worker crash/restart/duplicate/stale-lease/DLQ/resume drill.
6. Real backup restore, integrity, rollback and measured RPO/RTO.
7. Production telemetry and PII-redaction verification.
8. Production load/canary/rollback evidence.
9. Browser/native Web Crypto matrix.
10. Production-scale query-plan/index evidence for canonical dashboard/inventory RPCs.

## Next autonomous wave
- First: exact-head CI for the new index HEAD.
- Then: function-by-function inventory of remaining `queries.ts` / `queries-compat.ts` business aggregations.
- Next highest-risk family: remaining Analytics/Decision/Export metrics that still aggregate client-side or read unbounded datasets.
- Add cross-surface behavioral invariants with identical tenant/date/status/as-of inputs.
- Continue tenant authority sibling sweep and LIVE-required preparation in parallel.

Production certification remains blocked until LIVE evidence exists.
