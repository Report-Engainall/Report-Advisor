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
- Last code/workflow HEAD before this Index commit: `0569d747db6c4de2c458cc4cd2806313e9b08584`.
- This Index commit is separate from the code/test fix and therefore needs its own exact-head CI evidence.
- Exact CI for the current code HEAD is **NOT CLAIMED** until independently observable.
- Current branch-head PASS is **NOT CLAIMED**.
- `quality.yml` explicitly distinguishes workflow checkout SHA from `pull_request.head.sha`, preventing merge-ref evidence from being promoted to branch-head evidence.

## P0 — Canonical aggregation closure
### Dashboard / Reports
- Browser-wide dashboard invoice/item aggregation migrated to `get_dashboard_snapshot()`.
- Sales, profitability and receivables report metrics consume the canonical dashboard snapshot.
- Executive Command Center consumes `fetchDashboardSnapshot()`.
- `queries.ts` dashboard legacy functions are compatibility adapters, not aggregation engines.

### Inventory
Root cause found: the first authoritative inventory RPC placed `OFFSET/LIMIT` after aggregation, so it did not actually bound display rows.

Fix implemented as `base → paged → jsonb_agg` and the replacement migration explicitly drops BOTH historical signatures before creating:

`get_inventory_report_snapshot(p_page,p_page_size,p_filter)`

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

Root cause: the report page had been partially migrated; the valuation card still called the legacy valuation query rather than consuming the canonical snapshot-owned aggregate.

Fix:
- Removed `fetchInventoryValuation()` from `ReportsPage.tsx`.
- Removed the duplicate valuation request/state.
- The valuation card now consumes `snapshot.totalValue` and `snapshot.dataStatus`.
- The existing canonical `unknownRows` warning remains the explicit incomplete-data signal.

Regression:
`scripts/dashboard-canonical-regression.mjs` now proves:
- `ReportsPage` consumes `snapshot.totalValue`.
- `ReportsPage` does not consume `fetchInventoryValuation()`.
- repository-wide source scan finds zero non-compatibility consumers of `fetchInventoryValuation()`.
- the inventory migration drops both historical overloaded signatures.

Status: `IMPLEMENTED → REGRESSION → CONSUMER VERIFIED`; exact-head CI still pending/not observable.

### Analytics
`AnalyticsPage.tsx` contained three real unbounded business aggregation engines:
- RFM: invoices → customer aggregation/scoring.
- ABC: sale items → product revenue/cumulative classification.
- Aging: invoices → date arithmetic/buckets.

Authoritative RPCs implemented:
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

## Regression
`scripts/dashboard-canonical-regression.mjs` is wired into the existing `quality.yml` Behavioral regressions gate.

The regression contract covers:
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
- bounded inventory consumers;
- RFM/ABC/Aging tenant/status contracts;
- AnalyticsPage absence of direct transactional reads;
- `INSUFFICIENT_DATA` / `UNDATED` preservation.

A prior CI failure exposed the inventory RPC signature mismatch. Root cause was migration cleanup dropping only the older 2-argument signature while the branch had a 3-argument authoritative contract. This was fixed by explicitly dropping both `(integer,integer,text)` and `(integer,integer)` before replacement.

## Remaining P0/P1
1. Inventory all consumers of `fetchInventoryBalances()` before any removal.
2. Classify/narrow `queries-compat.ts` only after consumer/dependency proof.
3. Sweep BI, Decision Metrics, Exports, Forecasts, Demand Velocity and Inventory Intelligence for browser business truth.
4. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions.
5. Product-page margin NULL/zero contract review.
6. Data-quality aggregation classification.
7. Tenant runtime isolation across DB/Storage/Realtime/AI/vector/worker/notification.

## Performance evidence
- Dashboard business aggregates server-side.
- Inventory rows bounded 1–100 and independent of business totals.
- Inventory valuation is now sourced from the same canonical snapshot as inventory totals/status.
- RFM/ABC bounded.
- Analytics no longer transfers full transactional histories.
- Production-scale query plans, latency, load and capacity remain LIVE REQUIRED.

## Definition of Done
- FOUNDATION: PASS by prior evidence.
- IMPLEMENTED: PASS for migrated families.
- REGRESSION: implemented and workflow-gated.
- GATED: exact current HEAD must be independently verified.
- CONSUMER VERIFIED: inventory valuation consumer migration verified by repository-wide regression; broader inventory family remains open.
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
- First: inventory `fetchInventoryBalances()` consumers repository-wide and migrate each real business consumer before considering removal.
- Then: classify remaining `queries-compat.ts` exports function-by-function.
- Then: sweep BI → Decisions → Exports → Forecast/Demand Velocity → Inventory Intelligence.
- Add cross-surface behavioral equivalence invariants using identical tenant/date/status/as-of inputs.
- Continue security/runtime preparation in parallel.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
