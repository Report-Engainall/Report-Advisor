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
- Current code/test HEAD before this Index update: `649415db0a764003e14e1dfec6c0e2f242f073f8`.
- Previous Index HEAD: `7aa4b49dfce0f078df0fa5c959adcc25a739fea0`.
- This Index update intentionally does not self-reference its future commit SHA.
- Exact CI for the current code/test HEAD: **NOT OBSERVABLE** at index-update time; no PASS is claimed.
- `quality.yml` remains the canonical quality gate and distinguishes workflow checkout SHA from `pull_request.head.sha`.

## P0 — Canonical aggregation closure
### Dashboard / Reports
Dashboard business aggregation is server-side through `get_dashboard_snapshot()`. Reports and Executive Command Center consume the canonical snapshot; `queries.ts` dashboard functions are adapters.

### Inventory
Inventory display paging/filtering is server-side and independent from business aggregates. Tenant authority is derived from `current_company_id()`, and incomplete inventory valuation remains explicit via `unknownRows`/`dataStatus`.

### Analytics
RFM, ABC and Aging use bounded authoritative RPCs with tenant-derived authority, cancelled/void exclusion and explicit incomplete-data states.

## P0 — queries-compat canonical migration
`queries-compat.ts` previously contained a second analytics business-truth engine around `get_sales_secondary_metrics`.

Root cause: compatibility code had accidentally become an aggregation owner, duplicating dashboard truth and creating semantic-drift risk.

Fix:
- Preserve historical analytics function names.
- Remove the secondary analytics loader/RPC from compatibility.
- Delegate five analytics functions to canonical `queries.ts` implementations.
- Retain unrelated compatibility infrastructure intentionally.

Regression `scripts/check-secondary-consumer-canonical.mjs` proves canonical delegation and absence of the duplicate browser-side aggregation path.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI not claimed.

The SQL `get_sales_secondary_metrics` is intentionally retained until repository-wide consumer proof determines whether it can be safely removed.

## P0 — Forecast bounded collection
Finding: `fetchForecasts()` was an unbounded tenant-scoped `select('*')` used by Intelligence/Forecast pages.

Root cause: a display collection had no explicit payload bound and no protection against silent truncation.

Fix:
- maximum 500 rows;
- exact count requested;
- deterministic `period ASC, id ASC` ordering;
- `REPORT_QUERY_LIMIT_EXCEEDED` when the dataset exceeds the bound;
- compatibility layer delegates to this canonical bounded implementation.

This is bounded collection, not business aggregation and not fake pagination.

Regression protects the bound, ordering, fail-closed contract and compatibility delegation.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI not claimed.

## P0 — Customer/Product bounded collections
Finding: `fetchCustomers()` and `fetchProducts()` were also unbounded tenant-scoped `select('*')` reads, while the entity pages downloaded the full collection and filtered it in the browser.

Root cause: display collections had no hard payload boundary, making growth a browser-memory/network risk and leaving future consumers vulnerable to treating the collection as complete without proof.

Safe bridge fix:
- Introduced a shared `MAX_ENTITY_ROWS = 500` bound.
- Added exact count and deterministic `name ASC, id ASC` ordering.
- Added fail-closed `REPORT_QUERY_LIMIT_EXCEEDED` if more than 500 rows exist.
- Removed the duplicate compat reads; `queries-compat.ts` delegates both functions to `queries.ts`.

Important semantic boundary: this is **not claimed as full pagination migration**. If a tenant exceeds 500 customers/products, the UI fails closed rather than showing a silently incomplete collection. True server-side search/pagination remains a follow-up consumer migration.

Regression `scripts/dashboard-canonical-regression.mjs` now protects the bound, deterministic ordering, fail-closed behavior and compatibility delegation.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI not claimed.

## Remaining P0/P1
1. Repository-wide consumer inventory for `get_sales_secondary_metrics`; remove only after zero-consumer/dependency proof.
2. Complete `queries-compat.ts` function-by-function classification.
3. Migrate Customers/Products UI from fail-closed collection to explicit server-side search/pagination if datasets can exceed the 500-row contract.
4. `DataQualityPage` currently consumes `fetchDataQualityDatasets()` and performs browser-side quality aggregation; this is a separate high-value business/data-truth family requiring consumer/source/semantic migration.
5. BI / Decision Metrics / Exports / Demand Velocity / Inventory Intelligence browser truth sweep.
6. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions.
7. Product-page margin NULL/zero contract review.
8. Tenant runtime isolation across DB/Storage/Realtime/AI/vector/worker/notification.
9. Repository-wide direct Supabase/business-calculation sibling sweep.

## Performance evidence
- Dashboard aggregates server-side.
- Inventory display rows bounded independently from business totals.
- RFM/ABC bounded.
- Analytics no longer transfers full transactional histories.
- Compatibility analytics no longer owns aggregation.
- Forecast, customer and product collections are bounded and fail-closed instead of silently truncated.
- Production query plans, latency, load and capacity remain LIVE REQUIRED.

## Status ladder
- FOUNDATION: PASS by prior evidence.
- IMPLEMENTED: PASS for the migrated families above.
- REGRESSION: implemented and wired into the canonical quality gate.
- GATED: **NO CLAIM for current HEAD until exact-head CI is observable**.
- CONSUMER VERIFIED: inventory removal, valuation migration, compatibility analytics delegation, forecast delegation and customer/product compatibility delegation have repository-level proof; full UI pagination equivalence remains open.
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
- First: `DataQualityPage` / `fetchDataQualityDatasets()` consumer and source inventory because it is now the clearest remaining browser-side data-quality aggregation path.
- In parallel: secondary RPC zero-consumer sweep, BI/Decision/Export/Demand/Inventory Intelligence business-truth sweep, and tenant/security sibling sweep.
- Then: true server-side search/pagination for Customers/Products if the bounded bridge is insufficient for expected tenant scale.
- Continue runtime/LIVE preparation without waiting for CI.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
