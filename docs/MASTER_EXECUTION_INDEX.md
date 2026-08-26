# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26  
Repository: `Report-Engainall/Report-Advisor`  
PR: #41  
Branch: `wave-final-exact-ci-16`  
Base: `main @ 4095e0f0d427652eb705ba3955389ae978d7b5bf`

## Permanent execution policy
`DISCOVER → INVENTORY → ROOT CAUSE → CORRECT ARCHITECTURE → IMPLEMENT → REAL CONSUMER MIGRATION → REGRESSION → CI GATE → EXACT-HEAD VERIFICATION → INDEX → NEXT FAILURE FAMILY`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Current code/test HEAD before this Index update: `016b23986523b46bbda241d8d7e9dc881f7086af`.
- Previous Index HEAD: `3b9bcd2d37e6e5620f12d42aa961ec462a0506f3`.
- This Index update intentionally does not self-reference its future commit SHA.
- Exact CI for the current code/test HEAD: **NOT OBSERVABLE** at index-update time; no PASS is claimed.
- `quality.yml` remains the canonical quality gate and explicitly distinguishes workflow checkout SHA from `pull_request.head.sha`.

## P0 — Canonical aggregation closure
### Dashboard / Reports
- Dashboard business aggregation is server-side through `get_dashboard_snapshot()`.
- Sales, profitability and receivables report metrics consume the canonical dashboard snapshot.
- Executive Command Center consumes `fetchDashboardSnapshot()`.
- `queries.ts` dashboard functions are compatibility adapters, not aggregation engines.

### Inventory
The authoritative inventory RPC now separates display paging from business aggregation and derives tenant authority from `current_company_id()`.

Outputs include `totalRows`, `filteredRows`, `lowStock`, `outOfStock`, `unknownRows`, `totalValue`, and `dataStatus`.

### Inventory valuation consumer migration
`ReportsPage.tsx` no longer issues the duplicate `fetchInventoryValuation()` request; it consumes `snapshot.totalValue` and `snapshot.dataStatus` from the canonical inventory snapshot.

### Inventory balance query removal
`fetchInventoryBalances()` was proven to have no remaining non-compatibility consumers and was removed from `queries.ts`. Behavioral regression protects the zero-consumer/removal state.

### Analytics
RFM, ABC and Aging were migrated from browser-side transactional aggregation to bounded authoritative RPCs with tenant-derived authority, status exclusion and explicit incomplete-data semantics.

## P0 — queries-compat canonical migration
Finding: `queries-compat.ts` contained a second analytics business-truth engine around `get_sales_secondary_metrics`.

Root cause: the compatibility boundary had accidentally become an aggregation owner, duplicating monthly trend, top customer/product, category and aging logic already owned by `queries.ts → dashboard-canonical.ts`, with semantic drift risk.

Fix:
- Preserve the five historical analytics function names for compatibility.
- Remove `loadSecondaryMetrics` and all direct secondary-RPC use from the compatibility layer.
- Delegate `fetchMonthlyTrend`, `fetchTopCustomers`, `fetchTopProducts`, `fetchCategoryBreakdown`, and `fetchAgingBuckets` directly to canonical `queries.ts` functions.
- Keep unrelated compatibility infrastructure intentionally.

Regression: `scripts/check-secondary-consumer-canonical.mjs` now proves canonical delegation, absence of the secondary loader/RPC in the compatibility layer, absence of direct sales-table reads, and server-side tenant/date/status/limit invariants in the retained SQL function.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI not claimed.

The SQL function `get_sales_secondary_metrics` remains intentionally retained until repository-wide consumer proof determines whether any legitimate non-compatibility consumer exists. It is not deleted merely because one adapter stopped using it.

## P0 — Forecast collection hardening
Finding: `fetchForecasts()` in `queries.ts` performed an unbounded tenant-scoped `select('*')`, while `IntelligencePage` and `ForecastsPage` consume the entire returned collection.

Root cause: this was a display collection with no explicit bound, allowing browser payload growth and accidental dependence on an unbounded dataset.

Fix:
- Introduced a deterministic hard bound of 500 rows.
- Added exact row count to distinguish a complete bounded result from truncation.
- Added deterministic `period ASC, id ASC` ordering.
- Fail closed with `REPORT_QUERY_LIMIT_EXCEEDED` when more than 500 forecasts exist instead of silently truncating.
- Made `queries-compat.ts` delegate `fetchForecasts()` to the canonical bounded implementation rather than retaining a second unbounded read.

This is intentionally **bounded collection**, not business aggregation and not fake pagination.

Regression: `scripts/dashboard-canonical-regression.mjs` now asserts the bound, exact count, deterministic ordering, fail-closed behavior, and compatibility delegation.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI not claimed.

## Regression / CI wiring
The existing canonical `quality.yml` contains the `Secondary consumer canonical data truth` gate and the `Behavioral regressions` gate. No duplicate quality workflow was created.

Current behavioral contracts cover:
- page size cannot define business aggregate;
- cancelled/void exclusion;
- required NULL data remains unavailable;
- server-derived tenant authority;
- canonical Dashboard/Reports/Executive consumption;
- inventory server pagination/filtering independent of business totals;
- inventory valuation incomplete-data handling;
- zero non-compatibility consumers for removed inventory paths;
- RFM/ABC/Aging server-side authority and explicit data states;
- compatibility analytics delegation with no secondary browser aggregation;
- bounded deterministic forecast collection with fail-closed truncation handling.

## Remaining P0/P1
1. Repository-wide consumer inventory for `get_sales_secondary_metrics`; retain/remove only after proof.
2. Classify all remaining `queries-compat.ts` exports function-by-function.
3. `fetchCustomers()` and `fetchProducts()` unbounded collection paths: inventory consumers, required display semantics, then bounded/paginated migration where appropriate.
4. BI / Decision Metrics / Exports / Forecast / Demand Velocity / Inventory Intelligence browser truth sweep.
5. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions.
6. Product-page margin NULL/zero contract review.
7. Tenant runtime isolation across DB/Storage/Realtime/AI/vector/worker/notification.
8. Repository-wide direct Supabase/business-calculation sibling sweep.

## Performance evidence
- Dashboard aggregates server-side.
- Inventory display rows bounded independently from business totals.
- RFM/ABC bounded.
- Analytics no longer transfers full transactional histories.
- `queries-compat.ts` no longer owns secondary analytics aggregation.
- Forecast collection is bounded and fail-closed rather than silently truncated.
- Production query plans, latency, load and capacity remain LIVE REQUIRED.

## Status ladder
- FOUNDATION: PASS by prior evidence.
- IMPLEMENTED: PASS for the migrated families above.
- REGRESSION: implemented and wired into the canonical quality gate.
- GATED: **NO CLAIM for current HEAD until exact-head CI is observable**.
- CONSUMER VERIFIED: inventory removal, valuation migration, compatibility analytics delegation and forecast compatibility delegation have repository-level proof; broader secondary-RPC zero-consumer proof remains open.
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
- First: repository-wide consumer search for `get_sales_secondary_metrics` and remaining `queries-compat.ts` exports.
- Next: `fetchCustomers()` / `fetchProducts()` consumer-by-consumer classification and safe bounded migration.
- In parallel: BI/Decision/Export/Forecast/Demand Velocity/Inventory Intelligence business-aggregation sweep and cross-surface equivalence invariants.
- Continue tenant/security sibling and runtime-preparation work without waiting for CI.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
