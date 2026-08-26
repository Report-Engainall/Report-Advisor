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
- Last code/workflow HEAD before this Index commit: `9a0bc8c4f48884a43c31aff8f60689906e4673b5`.
- This Index commit is a separate HEAD and therefore needs its own exact-head CI evidence.
- At last check, exact branch-head check-runs were **NOT OBSERVABLE** (`0`) and combined status was **empty**. No PASS is claimed.
- PR #41 currently reports `mergeable=false`; this is tracked separately and is not interpreted as a CI result.
- The quality workflow now explicitly verifies PR `head.sha` independently from the GitHub PR merge ref, preventing merge-ref PASS from being misrepresented as branch-head PASS.

## Closed/advanced failure families
### Dashboard / Reports
- Dashboard browser-wide invoice/item aggregation replaced by `get_dashboard_snapshot()`.
- Reports sales/profitability/receivables migrated to canonical snapshot.
- Executive Command Center migrated to `fetchDashboardSnapshot()`.
- `queries.ts` dashboard legacy functions are compatibility adapters delegating to canonical server aggregation.

### Inventory
Root cause included a real SQL pagination defect: `OFFSET/LIMIT` had been attached after an aggregate, so it did not bound the aggregated rows. The RPC was corrected with a `base → paged → jsonb_agg` structure.

Canonical contract:
`get_inventory_report_snapshot(p_page,p_page_size,p_filter)`

It now server-derives:
- totalRows
- filteredRows
- lowStock
- outOfStock
- unknownRows
- totalValue
- dataStatus

Inventory Report and Inventory entity page no longer fetch all inventory balances and reduce/filter them in the browser.

### Analytics — RFM / ABC / Aging
Finding: `src/pages/AnalyticsPage.tsx` contained three independent unbounded aggregation engines:
- RFM: all sales invoices → customer maps → recency/frequency/monetary → scores.
- ABC: all sale items → product aggregation → cumulative revenue classification.
- Aging: all invoices → date arithmetic → aging buckets.

Root cause: browser table reads were incorrectly used as the business aggregation API.

Implemented authoritative RPCs in:
`supabase/migrations/20260826062000_analytics_authoritative_aggregation.sql`

- `get_rfm_snapshot(p_as_of,p_limit)`
- `get_abc_snapshot(p_limit)`
- `get_aging_snapshot(p_as_of)`

Properties:
- `SECURITY INVOKER`
- tenant from `current_company_id()`
- cancelled/void excluded
- bounded result sets
- explicit incomplete-data state
- no silent NULL→zero fabrication
- deterministic as-of supplied by server adapter

Canonical adapters:
- `fetchRFMSnapshot()`
- `fetchABCSnapshot()`
- `fetchAgingSnapshot()`

Analytics pages now consume only those adapters. Presentation-only distribution counts remain client-side and do not define business truth.

## Regression / consumer proof
`scripts/dashboard-canonical-regression.mjs` is wired into the existing `quality.yml` Behavioral regressions gate.

It verifies:
- display page size cannot define business aggregate;
- cancelled/void exclusion;
- NULL required data remains unavailable;
- tenant authority is server-derived;
- Dashboard/Reports/Executive Command Center canonical consumption;
- zero non-compatibility consumers for migrated dashboard function names;
- legacy dashboard query functions are adapters, not aggregators;
- inventory pagination/filtering is server-side;
- inventory valuation fails closed on incomplete cost data;
- InventoryPage/InventoryReportPage no longer consume unbounded inventory balances;
- RFM/ABC/Aging RPC contracts, tenant authority and status semantics;
- AnalyticsPage has no direct transactional Supabase reads;
- `INSUFFICIENT_DATA` / `UNDATED` are preserved.

## CI integrity
`.github/workflows/quality.yml` remains the canonical quality workflow.
Its Diagnostics step now proves both:
1. workflow checkout HEAD = `GITHUB_SHA` (PR merge-ref integrity), and
2. PR branch ref SHA = event `pull_request.head.sha` (exact code-head integrity).

This distinction is intentional: a green merge ref cannot be promoted to a code-head PASS unless the actual branch-head SHA is verified too.

## Definition of Done
- FOUNDATION: PASS by prior evidence.
- IMPLEMENTED: PASS for the migrated families.
- TESTED: regression code present and workflow-gated.
- GATED: exact current-head CI pending/not observable.
- CONSUMER VERIFIED: migrated Dashboard/Reports/Executive/Inventory/Analytics consumers verified by source and regression contracts.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## Remaining P0/P1
1. `fetchInventoryBalances()` remains as an unbounded compatibility/query path; inventory all consumers and migrate before removal.
2. `queries-compat.ts` broadly re-exports `queries.ts`; classify/narrow only after consumer/dependency proof.
3. Remaining client-side business aggregation in BI, Decision Metrics, Exports, Forecasts, Demand Velocity and Inventory Intelligence.
4. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions.
5. Product-page margin NULL/zero contract review.
6. Data-quality page aggregation classification and authoritative migration if required.
7. Tenant runtime isolation across DB/Storage/Realtime/AI/vector/worker/notification.

## Performance evidence
- Dashboard business aggregates are server-side.
- Inventory rows bounded 1–100; totals independent of display pagination.
- RFM/ABC bounded to 500 rows.
- Analytics no longer transfers full transactional histories.

Production-scale query-plan timing, load and latency remain **LIVE REQUIRED**.

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
- Verify exact-head CI for the new Index HEAD.
- Continue function-by-function `queries.ts` / `queries-compat.ts`, beginning with `fetchInventoryBalances` consumers.
- Sweep BI/Decision/Export/Forecast/Demand Velocity/Inventory Intelligence for remaining browser business truth.
- Add cross-surface behavioral equivalence invariants with identical tenant/date/status/as-of inputs.
- Continue security/runtime preparation in parallel.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
