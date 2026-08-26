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
- Last code/workflow HEAD before this Index commit: `ffdc5a66a83d2ec93f47a26f836626bacf20cc3c`.
- This Index commit is separate from the code fix and therefore needs its own exact-head CI evidence.
- Exact CI for the preceding code HEAD was not promoted until independently observable.
- Current branch-head PASS is NOT CLAIMED.
- `quality.yml` explicitly distinguishes workflow checkout SHA from `pull_request.head.sha`, preventing merge-ref evidence from being promoted to branch-head evidence.

## P0 — Canonical aggregation closure
### Dashboard / Reports
- Browser-wide dashboard invoice/item aggregation migrated to `get_dashboard_snapshot()`.
- Sales, profitability and receivables report metrics consume the canonical dashboard snapshot.
- Executive Command Center consumes `fetchDashboardSnapshot()`.
- `queries.ts` dashboard legacy functions are compatibility adapters, not aggregation engines.

### Inventory
Root cause found: the first authoritative inventory RPC placed `OFFSET/LIMIT` after aggregation, so it did not actually bound display rows.

Fix implemented as `base → paged → jsonb_agg` and the replacement migration now explicitly drops BOTH historical signatures before creating:

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
- bounded inventory consumers;
- RFM/ABC/Aging tenant/status contracts;
- AnalyticsPage absence of direct transactional reads;
- `INSUFFICIENT_DATA` / `UNDATED` preservation.

A CI failure exposed the inventory RPC signature mismatch. Root cause was migration cleanup dropping only the older 2-argument signature while the branch had a 3-argument authoritative contract. This was fixed by explicitly dropping both `(integer,integer,text)` and `(integer,integer)` before replacement.

## Newly discovered sibling consumer — NOT CLOSED
`ReportsPage.tsx` still imports and calls `fetchInventoryValuation()` alongside `fetchInventoryReportSnapshot()`.

This is a genuine cross-surface business-truth duplicate:
`ReportsPage → legacy valuation RPC/query` while the canonical inventory snapshot already owns `totalValue`, `unknownRows` and `dataStatus`.

Status: `FOUND → ROOT CAUSE IDENTIFIED → MIGRATION REQUIRED`.

Do NOT mark Inventory failure family fully closed until this consumer is migrated and regression proves zero remaining business consumers of the legacy valuation path.

## Remaining P0/P1
1. Migrate `ReportsPage` inventory valuation to canonical inventory snapshot; then prove zero real consumers of `fetchInventoryValuation()`.
2. Inventory all consumers of `fetchInventoryBalances()` before any removal.
3. Classify/narrow `queries-compat.ts` only after consumer/dependency proof.
4. Sweep BI, Decision Metrics, Exports, Forecasts, Demand Velocity and Inventory Intelligence for browser business truth.
5. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions.
6. Product-page margin NULL/zero contract review.
7. Data-quality aggregation classification.
8. Tenant runtime isolation across DB/Storage/Realtime/AI/vector/worker/notification.

## Performance evidence
- Dashboard business aggregates server-side.
- Inventory rows bounded 1–100 and independent of business totals.
- RFM/ABC bounded.
- Analytics no longer transfers full transactional histories.
- Production-scale query plans, latency, load and capacity remain LIVE REQUIRED.

## Definition of Done
- FOUNDATION: PASS by prior evidence.
- IMPLEMENTED: PASS for migrated families.
- REGRESSION: implemented and workflow-gated.
- GATED: exact current HEAD must be independently verified.
- CONSUMER VERIFIED: only for consumers explicitly migrated/proven.
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
- First: migrate `ReportsPage` away from `fetchInventoryValuation()` and add semantic consumer regression.
- Then: `fetchInventoryBalances()` consumer-by-consumer.
- Then: remaining `queries-compat.ts` exports.
- Then: BI → Decisions → Exports → Forecast/Demand Velocity → Inventory Intelligence.
- Add cross-surface behavioral equivalence invariants using identical tenant/date/status/as-of inputs.
- Continue security/runtime preparation in parallel.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
