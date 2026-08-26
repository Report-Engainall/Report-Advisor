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
- Current code/test HEAD before this Index update: `c0ff863d4155b564d7fa260deb4668d4ac139b0f`.
- Previous Index HEAD: `c7c7f75700e2cad4bae86af6df670b3727d1b329`.
- This Index update records the code/test HEAD but intentionally does not self-reference its own future commit SHA.
- Exact CI for `c0ff863d4155b564d7fa260deb4668d4ac139b0f`: **NOT OBSERVABLE** at index-update time; no PASS is claimed.
- `quality.yml` remains the canonical quality gate and distinguishes workflow checkout SHA from `pull_request.head.sha`.

## P0 — Canonical aggregation closure
### Dashboard / Reports
- Browser-wide dashboard invoice/item aggregation migrated to `get_dashboard_snapshot()`.
- Sales, profitability and receivables report metrics consume the canonical dashboard snapshot.
- Executive Command Center consumes `fetchDashboardSnapshot()`.
- `queries.ts` dashboard functions are compatibility adapters, not aggregation engines.

### Inventory
Root cause found: the first authoritative inventory RPC placed `OFFSET/LIMIT` after aggregation, so it did not actually bound display rows.

Fix implemented as `base → paged → jsonb_agg` and the replacement migration explicitly drops BOTH historical signatures before creating the authoritative inventory contract.

Authoritative outputs include:
- `totalRows`
- `filteredRows`
- `lowStock`
- `outOfStock`
- `unknownRows`
- `totalValue`
- `dataStatus`

Tenant is derived from `current_company_id()`.

Inventory display rows are bounded independently from business aggregates.

### Inventory valuation consumer migration
Finding: `ReportsPage.tsx` retained a second business-truth path through `fetchInventoryValuation()` while already consuming `fetchInventoryReportSnapshot()`.

Fix:
- Removed the duplicate valuation request/state.
- The valuation card now consumes `snapshot.totalValue` and `snapshot.dataStatus`.
- The existing `unknownRows` warning remains the explicit incomplete-data signal.

Regression: `scripts/dashboard-canonical-regression.mjs` proves the consumer migration and zero non-compatibility consumers of the legacy valuation symbol.

Status: `IMPLEMENTED → REGRESSION → CONSUMER VERIFIED`; exact-head CI is not claimed until independently observed.

### Inventory balance query removal
Finding: `fetchInventoryBalances()` in `queries.ts` was an unbounded browser read of `inventory_balances`.

Consumer inventory found no remaining non-compatibility consumers after Inventory Report and Entity inventory pages moved to `fetchInventoryReportSnapshot()`.

Fix:
- Removed `fetchInventoryBalances()` from `queries.ts`.
- Added repository-wide regression proof that no `src` consumer references it outside compatibility infrastructure and that the query is absent.

Status: `IMPLEMENTED → REGRESSION → CONSUMER VERIFIED`; exact-head CI not claimed.

### Analytics
`AnalyticsPage.tsx` contained three real unbounded business aggregation engines:
- RFM: invoices → customer aggregation/scoring.
- ABC: sale items → product revenue/cumulative classification.
- Aging: invoices → date arithmetic/buckets.

Authoritative RPCs:
- `get_rfm_snapshot(p_as_of,p_limit)`
- `get_abc_snapshot(p_limit)`
- `get_aging_snapshot(p_as_of)`

Properties:
- `SECURITY INVOKER`
- `current_company_id()` tenant authority
- cancelled/void exclusion
- bounded results
- explicit incomplete-data states
- deterministic as-of
- no silent NULL→zero fabrication.

Canonical adapters:
- `fetchRFMSnapshot()`
- `fetchABCSnapshot()`
- `fetchAgingSnapshot()`

## P0 — queries-compat canonical migration
Finding: `queries-compat.ts` contained a second analytics business-truth engine around `get_sales_secondary_metrics`, duplicating the same monthly trend, top customer/product, category and aging metrics already owned by `queries.ts → dashboard-canonical.ts`.

Root cause: the compatibility layer had become an accidental aggregation owner. Its category and aging semantics were also capable of drifting from the dashboard canonical implementation.

Consumer/contract decision:
- Preserve the historical function names for compatibility consumers.
- Remove the secondary aggregation loader from the compatibility layer.
- Delegate `fetchMonthlyTrend`, `fetchTopCustomers`, `fetchTopProducts`, `fetchCategoryBreakdown`, and `fetchAgingBuckets` directly to the canonical `queries.ts` functions.
- Retain unrelated compatibility infrastructure (imports, tenant-scoped mutations, import records, purchase summary, inventory valuation and canonical exports) intentionally.

Fix committed at code/test HEAD `c0ff863d4155b564d7fa260deb4668d4ac139b0f`.

Regression `scripts/check-secondary-consumer-canonical.mjs` now proves:
- all five compatibility symbols remain available;
- canonical counterparts exist in `queries.ts`;
- compatibility contains no `get_sales_secondary_metrics` call;
- compatibility contains no `loadSecondaryMetrics` loader;
- compatibility analytics do not query sales tables directly;
- all five wrappers delegate to canonical functions;
- server-side secondary RPC security/date/status/limit invariants remain protected;
- pagination cannot become the business aggregate.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI is currently `NOT OBSERVABLE` for `c0ff863d...` and therefore not promoted to GATED/PASS.

The SQL function `get_sales_secondary_metrics` remains intentionally retained until a repository-wide consumer sweep proves whether it has any legitimate non-compatibility consumers. It is not deleted merely because the compatibility layer stopped using it.

## Regression
`scripts/dashboard-canonical-regression.mjs` remains wired into the existing `quality.yml` Behavioral regressions gate.

The secondary analytics regression is also wired through the existing quality-gate command path and now protects the compatibility/canonical boundary rather than protecting a duplicate browser-side adapter.

Current behavioral coverage includes:
- page size cannot define business aggregate;
- cancelled/void exclusion;
- NULL required data remains unavailable;
- tenant authority is server-derived;
- Dashboard/Reports/Executive canonical consumption;
- legacy dashboard functions are adapters;
- inventory server pagination/filtering;
- inventory valuation fail-closed behavior;
- ReportsPage canonical valuation consumer;
- repository-wide zero non-compatibility consumers for legacy inventory valuation;
- zero consumers before inventory balance query removal;
- bounded inventory consumers;
- RFM/ABC/Aging tenant/status contracts;
- AnalyticsPage absence of direct transactional reads;
- `INSUFFICIENT_DATA` / `UNDATED` preservation;
- compatibility analytics cannot reintroduce the secondary aggregation engine;
- compatibility functions must delegate to canonical dashboard functions;
- canonical secondary SQL retains tenant/date/status/limit controls.

A prior CI failure exposed the inventory RPC signature mismatch. Root cause was migration cleanup dropping only the older 2-argument signature while the branch had a 3-argument authoritative contract. This was fixed by explicitly dropping both `(integer,integer,text)` and `(integer,integer)` before replacement.

## Remaining P0/P1
1. Repository-wide consumer inventory for `get_sales_secondary_metrics`; retain/remove only after proof.
2. Classify remaining `queries-compat.ts` exports function-by-function.
3. Sweep BI, Decision Metrics, Exports, Forecasts, Demand Velocity and Inventory Intelligence for browser business truth.
4. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions.
5. Product-page margin NULL/zero contract review.
6. Data-quality aggregation classification.
7. Tenant runtime isolation across DB/Storage/Realtime/AI/vector/worker/notification.
8. Repository-wide direct Supabase/business-calculation sibling sweep outside migrated inventory/dashboard/analytics families.

## Performance evidence
- Dashboard business aggregates server-side.
- Inventory rows bounded 1–100 and independent of business totals.
- Inventory valuation is sourced from the same canonical snapshot as inventory totals/status.
- The unbounded `fetchInventoryBalances()` query is removed.
- RFM/ABC bounded.
- Analytics no longer transfers full transactional histories.
- `queries-compat.ts` no longer transfers/aggregates secondary analytics payloads itself.
- Production-scale query plans, latency, load and capacity remain LIVE REQUIRED.

## Definition of Done
- FOUNDATION: PASS by prior evidence.
- IMPLEMENTED: PASS for migrated families including the compatibility canonical delegation fix.
- REGRESSION: implemented and workflow-gated by repository configuration; exact current-head execution remains to be observed.
- GATED: **NO CLAIM for current code HEAD** until exact-head CI is observable.
- CONSUMER VERIFIED: inventory balance removal, valuation migration and compatibility canonical delegation have repository-level proof; broader secondary-RPC zero-consumer proof remains open.
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
- First: repository-wide consumer search for `get_sales_secondary_metrics` and all remaining `queries-compat.ts` exports.
- In parallel: BI/Decision/Export/Forecast/Demand Velocity/Inventory Intelligence business-aggregation sweep.
- Add cross-surface behavioral equivalence invariants using identical tenant/date/status/as-of inputs.
- Continue tenant/security sibling and runtime-preparation work without waiting for CI.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
