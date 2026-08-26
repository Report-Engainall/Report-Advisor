# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + PR #41 exact-head candidate

## Execution policy
- FIND → ROOT CAUSE → FIX → REGRESSION → CI → EXACT-HEAD PROOF → INDEX → NEXT FAILURE.
- No historical PASS promotion, scanner-only closure, fake runtime/LIVE evidence, or production certification without live evidence.
- UNKNOWN/NULL/MISSING/INSUFFICIENT_DATA never becomes ZERO unless zero is proven business truth.

## Current exact state
- Current code/workflow HEAD before this index commit: `f27e12aebb4b6ebd58afb19dc40f68b112fc3e4b`.
- This index update is a separate commit; its returned SHA is the new branch HEAD and therefore requires its own exact-head CI evidence.
- Branch: `wave-final-exact-ci-16`.
- PR: #41.
- Base: `main @ 4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- At index-write time, exact checks for `f27e12aebb4b6ebd58afb19dc40f68b112fc3e4b` were not yet observable. No PASS is claimed.

## Wave — Canonical dashboard aggregation
### Objective
Move dashboard business truth from browser-wide reads/reductions to one authoritative tenant-bound server aggregation while keeping display pagination separate.

### Consumer inventory
The legacy family in `src/lib/queries.ts` consisted of `fetchDashboardKPIs`, `fetchMonthlyTrend`, `fetchTopCustomers`, `fetchTopProducts`, `fetchCategoryBreakdown`, and `fetchAgingBuckets`. Initial direct consumers were Dashboard and Reports. Both are now migrated to the canonical snapshot adapter.

### Findings / root cause
- KPI path fetched all invoices, sale items, balances and purchases and reduced them in the browser.
- Trend path fetched all invoice/item history and grouped months in the browser.
- Customer/product/category ranking paths fetched complete datasets before aggregation.
- Aging fetched complete invoice history and bucketed client-side.
- Legacy semantics did not consistently exclude cancelled/void rows and could not distinguish missing required numeric data from valid zero.
- Root cause: business truth was duplicated in a browser query layer instead of an authoritative aggregate boundary.

### Canonical design
`UI → src/lib/dashboard-canonical.ts → get_dashboard_snapshot(integer,date) → current_company_id() → database`.

The RPC has no tenant parameter, clamps months to 1–24, excludes cancelled/void sales, separates business aggregation from display pagination, and returns nullable metric fields with `INSUFFICIENT_DATA` when required inputs are incomplete.

### Implemented fixes
- `b9454a9fbd17cd0b963dbdce27311c11e6bf6751`: authoritative dashboard aggregation migration.
- `2778b8ab8fd5bc82019f226a41a3882d59367a36`: canonical dashboard adapter.
- `68e6b30867b22e3ac1c14d1f288aa1035b67f4d7`: DashboardPage migration.
- `34f0035f954cbca672641d9ff4980e46b00c6970`: ReportsPage migration; Sales/Profitability/Receivables now consume the canonical snapshot while paginated invoice rows remain display-only.
- `f27e12aebb4b6ebd58afb19dc40f68b112fc3e4b`: strengthened repository-wide legacy consumer proof.

### Regression
`dashboard-canonical-regression.mjs` is wired into the existing `Behavioral regressions` step of `quality.yml`.
It verifies:
- 21-row business aggregate remains 21 despite 20-row display pagination.
- cancelled/void rows do not contribute.
- missing required cost is not converted to zero.
- tenant authority derives from `current_company_id()`.
- DashboardPage and ReportsPage use `fetchDashboardSnapshot`.
- repository-wide source scan fails if any non-compatibility source consumes the six legacy dashboard aggregation names.
- legacy implementations are retained intentionally until safe removal.

This is a semantic regression plus consumer proof, not a documentation-only scanner.

### Performance evidence
IMPLEMENTED: browser-wide aggregation for Dashboard and the migrated Reports sales/profitability/receivables paths has been removed. Server aggregation is bounded by RPC input; display invoices remain separately paginated. Production latency, query plans and production-scale load remain LIVE REQUIRED.

### Exact evidence chain
- Topology-hardened predecessor: `0834e891e335594c8c16de49f61b64e18a7c40a1`.
- Current code/workflow before index: `f27e12aebb4b6ebd58afb19dc40f68b112fc3e4b`.
- Exact CI for the previous code-only workflow commit `8fe63337bf8ade11d64edeff02616a090b78569d`: Run `32922363407` / job `98038279898` was **IN_PROGRESS** when checked; therefore no PASS was promoted.
- After the index commit, the branch HEAD changes again and must receive fresh exact-head evidence.

## Definition of Done
- FOUNDATION: PASS.
- IMPLEMENTED: PASS.
- TESTED: regression implemented.
- REGRESSION VERIFIED: exact CI pending.
- GATED: PASS in workflow wiring; exact run pending.
- CONSUMER VERIFIED: Dashboard + Reports migrated; six legacy dashboard functions have zero non-compatibility source consumers under the current repository tree.
- RUNTIME VERIFIED: NOT CLAIMED.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## Remaining failure families
1. `src/lib/queries.ts` still contains legacy dashboard implementations and other business aggregations; they can only be deleted after function-by-function zero-consumer proof and safe compatibility removal.
2. `queries-compat.ts` still re-exports legacy functions for compatibility; its remaining named consumers require independent migration proof.
3. Cross-surface equivalence across Dashboard, Reports, Analytics, Exports, BI, Decisions is incomplete.
4. Canonical dashboard RPC needs deployed Supabase query-plan/index evidence and A/B tenant runtime isolation.
5. Recommendations/alerts are bounded reads but require sibling cross-surface tenant/status/date verification.

## Security / tenant
- Dashboard RPC uses `current_company_id()` and does not accept caller-selected tenant identity.
- Global tenant RLS, import tenant context and adversarial contracts remain CI-gated.
- Supabase A/B DB/Storage/Realtime/AI/vector/worker/notification isolation remains LIVE REQUIRED.

## Cross-surface truth
- Dashboard and migrated Reports sales/profitability/receivables aggregate from one canonical snapshot.
- Display pagination remains separate from business totals.
- Date/as-of/status/null semantics are defined at the canonical RPC boundary.
- Full Dashboard = Reports = Exports = Analytics = BI/KPIs = Decisions is not yet fully proven.

## Production certification
- IMPLEMENTED: substantial deep closure.
- TESTED: extensive local/regression suite.
- GATED: canonical quality workflow plus security/resilience gates.
- INTEGRATED: PR #41.
- CONSUMER VERIFIED: migrated dashboard/report aggregation consumers.
- RUNTIME VERIFIED: not claimed.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
1. Supabase A/B tenant isolation across DB/Storage/Realtime/AI/vector/import/report/export/decision/worker/notification.
2. Authenticated browser E2E with real tenant data.
3. Real PDF/OCR/XLSX/CSV corpus accuracy.
4. Native watcher proof on Windows/Android and iOS capability proof.
5. Worker crash/restart/duplicate/stale-lease/DLQ/resume drill.
6. Real backup restore, integrity, rollback and measured RPO/RTO.
7. Production telemetry and PII-redaction verification.
8. Production load/canary/rollback evidence.
9. Browser/native Web Crypto matrix.
10. Production-scale query-plan/index evidence for `get_dashboard_snapshot`.

## Next autonomous wave
- First: exact-head CI for the new index HEAD.
- Then: enumerate every remaining business aggregation in `queries.ts` and `queries-compat.ts` function-by-function.
- Migrate the next highest-risk Reports/Analytics/Export/Decision metric family to canonical authoritative sources.
- Add cross-surface behavioral invariants for identical tenant/date/status/as-of inputs.
- Continue tenant authority sibling sweep and independent LIVE-required preparation.

Production certification remains blocked until LIVE evidence exists.
