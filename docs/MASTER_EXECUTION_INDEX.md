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
- Last code/workflow HEAD before this index commit: `5394d89205ebb5790c9a3c87d086922ea072569b`.
- This commit is the Index HEAD and therefore needs its own exact-head CI evidence.
- Exact CI status at last observation: **NOT OBSERVABLE** (`check_runs=0`, `combined_status=0`) for the current code ancestry. No PASS is claimed.
- PR merge ref is tracked separately and is not treated as code-head evidence.

## Failure Family — Dashboard / Reports / Inventory
### Root causes
- Dashboard legacy functions in `queries.ts` fetched complete transactional datasets and calculated business truth in the browser.
- Reports were secondary consumers of those functions.
- Inventory Report and Inventory entity page loaded complete balances before calculating totals/filter counts.
- Previous inventory RPC placed `OFFSET/LIMIT` after aggregation, so pagination was not actually applied to rows; this was corrected.

### Architecture now
`UI → canonical adapter → authoritative SECURITY INVOKER RPC → current_company_id() → database`.

Dashboard: `get_dashboard_snapshot(p_months,p_as_of)`.
Inventory: `get_inventory_report_snapshot(p_page,p_page_size,p_filter)`.

### Implemented
- Dashboard RPC and adapter already established.
- Reports sales/profitability/receivables migrated.
- Executive Command Center migrated from `fetchDashboardKPIs()` to `fetchDashboardSnapshot()` and its range control now matches the server contract in months.
- `queries.ts` dashboard aggregation implementations converted to explicit compatibility adapters; they no longer fetch/reduce invoice/item histories.
- App alert reads migrated to `fetchDashboardIntelligence()`.
- Inventory RPC corrected to real bounded row pagination and server-side filters.
- Inventory RPC now returns `totalRows`, `filteredRows`, `lowStock`, `outOfStock`, `unknownRows`, `totalValue`, and explicit `dataStatus`.
- Inventory entity page migrated from `fetchInventoryBalances()` + browser reduce/filter to server snapshot pagination/filtering.

## Failure Family — Analytics (RFM / ABC / Aging)
### Findings
`src/pages/AnalyticsPage.tsx` contained three independent browser aggregation engines:
- RFM fetched all sales invoices and calculated recency/frequency/monetary plus scores in the browser.
- ABC fetched all sale items and calculated revenue ranking/cumulative thresholds in the browser.
- Aging fetched all invoices and calculated aging buckets in the browser.

These were unbounded reads, duplicated business truth, and had client-side date/status semantics.

### Root cause
The pages were using Supabase table reads as an aggregation API instead of an authoritative domain contract.

### Canonical implementation
Added migration:
`supabase/migrations/20260826062000_analytics_authoritative_aggregation.sql`

Authoritative RPCs:
- `get_rfm_snapshot(p_as_of,p_limit)`
- `get_abc_snapshot(p_limit)`
- `get_aging_snapshot(p_as_of)`

All are `SECURITY INVOKER`, derive tenant from `current_company_id()`, exclude `cancelled/void`, bound result sizes, and expose incomplete-data status rather than silently converting missing values to zero.

Canonical adapter functions:
- `fetchRFMSnapshot()`
- `fetchABCSnapshot()`
- `fetchAgingSnapshot()`

Analytics pages now consume only these adapters. Browser calculations are limited to presentation-only distribution counts.

## Regression evidence
Canonical behavioral regression:
`scripts/dashboard-canonical-regression.mjs`

It now gates:
- 21 records vs page-size-20 aggregate semantics;
- cancelled/void exclusion;
- NULL required-cost fail-closed semantics;
- server-derived tenant authority;
- Dashboard/Reports/Executive Command Center canonical consumption;
- zero non-compatibility consumers of migrated legacy dashboard function names;
- legacy query dashboard functions are adapters, not aggregators;
- inventory server pagination/filtering and independent totals;
- inventory unknown-cost valuation remains unavailable rather than zero;
- InventoryPage and InventoryReportPage no longer consume unbounded inventory balances;
- RFM/ABC/Aging authoritative RPC existence, tenant authority and status contracts;
- AnalyticsPage has no direct transactional Supabase reads and consumes only canonical adapters;
- explicit `INSUFFICIENT_DATA` / `UNDATED` behavior.

This is behavioral/contract regression plus consumer proof, not a scanner-only gate.

## Classification
### IMPLEMENTED
- Dashboard canonical aggregation: PASS by code inspection.
- Reports migration: PASS by consumer inspection.
- Inventory canonical aggregation: IMPLEMENTED; exact CI pending.
- Analytics RFM/ABC/Aging canonical aggregation: IMPLEMENTED; exact CI pending.
- `queries.ts` dashboard legacy functions: intentionally retained as compatibility adapters.

### TESTED
Regression is wired into canonical `quality.yml` under the existing behavioral regression gate.

### GATED
Pending exact-head CI for the newest HEAD.

### CONSUMER VERIFIED
- Dashboard
- Reports
- Executive Command Center
- Inventory Report
- Inventory entity page
- Analytics RFM
- Analytics ABC
- Analytics Aging

### RUNTIME VERIFIED
NO CLAIM.

### LIVE VERIFIED
NO.

### PRODUCTION CERTIFIED
NO.

## Remaining P0/P1 families
1. `fetchInventoryBalances()` remains in `queries.ts` as an unbounded compatibility/query path; find all consumers and migrate them before removal.
2. `queries-compat.ts` broadly re-exports `queries.ts`; classify every remaining consumer and narrow compatibility exports only after zero-consumer proof.
3. Other client-side business engines outside `queries.ts`: BI, decision metrics, forecasts, demand velocity, inventory intelligence, recommendations/outcomes and exports.
4. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions.
5. Product-page margin calculation is presentation of stored product values but still requires contract review for NULL/zero semantics.
6. Data-quality page performs client-side quality aggregation; determine whether it is diagnostic presentation or authoritative business quality metric and migrate if authoritative.

## Performance evidence
- Dashboard business totals no longer require browser-wide invoice/item transfer.
- Inventory display rows are bounded to 1–100 and totals are server-derived.
- RFM/ABC result limits are bounded to 500.
- Analytics no longer downloads complete invoice/item histories for aggregation.

Production-scale query-plan timing, load and latency remain **LIVE REQUIRED**.

## Security / tenant
Canonical RPCs use `current_company_id()` and `SECURITY INVOKER`.
Runtime A/B tenant tests across DB/Storage/Realtime/AI/vector/worker/notification remain LIVE REQUIRED.

## Exact-head evidence ledger
- Previous observed exact-head state: `888b4643...` had no observable check-runs.
- Subsequent code heads were not promoted from historical PASS.
- Current code before this Index commit: `5394d89205ebb5790c9a3c87d086922ea072569b`.
- Current Index commit: this document's resulting commit SHA is distinct and will itself require fresh CI evidence.
- CI status for current code at last check: NOT OBSERVABLE; no PASS claimed.

## LIVE REQUIRED
1. Supabase A/B DB tenant isolation.
2. Storage isolation.
3. Realtime authorization.
4. AI/vector isolation.
5. Authenticated browser E2E.
6. Real document/OCR corpus.
7. Worker crash/recovery/DLQ/duplicate-side-effect drill.
8. Native watcher.
9. Real backup restore + integrity + rollback + measured RPO/RTO.
10. Production telemetry + PII-redaction verification.
11. Production load/canary/rollback.
12. Production query plans and scale evidence.

## Next autonomous execution
- Exact-head CI verification for the new Index HEAD.
- Continue `queries.ts` / `queries-compat.ts` function-by-function inventory, beginning with `fetchInventoryBalances` consumers.
- Sweep remaining client-side aggregation in BI/Decision/Export/Forecast/Demand Velocity/Inventory Intelligence.
- Build cross-surface behavioral equivalence invariants using identical tenant/date/status/as-of inputs.
- Continue tenant/security sibling sweep and prepare LIVE evidence without mislabeling static proof as LIVE.

Production certification remains blocked until real LIVE evidence exists.
