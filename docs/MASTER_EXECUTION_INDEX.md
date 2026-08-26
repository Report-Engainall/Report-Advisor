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
- Current code/test HEAD before this Index update: `103de2860c6eda314bee435c9ab8d04cb93438f1`.
- Previous Index HEAD: `9e9ddde503574a62593c552072f76342731881ed`.
- This Index update intentionally does not self-reference its future commit SHA.
- Exact CI for the current code/test HEAD: **NOT OBSERVABLE** at index-update time; no PASS is claimed.
- `quality.yml` remains the canonical quality gate and distinguishes workflow checkout SHA from `pull_request.head.sha`.

## P0 — Canonical aggregation closure
- Dashboard/Reports/Executive use canonical server-side dashboard snapshot.
- Inventory display paging/filtering is server-side and independent from business aggregates.
- Inventory valuation is sourced from the canonical snapshot and remains explicit on incomplete cost data.
- RFM/ABC/Aging use bounded authoritative RPCs with tenant-derived authority and explicit incomplete-data states.

## P0 — queries-compat canonical migration
`queries-compat.ts` previously contained a second analytics business-truth engine around `get_sales_secondary_metrics`.

Root cause: compatibility code had accidentally become an aggregation owner, duplicating dashboard truth and creating semantic-drift risk.

Fix:
- Preserve historical analytics function names.
- Remove the secondary analytics loader/RPC from compatibility.
- Delegate monthly trend, top customer/product, category and aging functions to canonical `queries.ts` implementations.
- Retain unrelated compatibility infrastructure intentionally.

Regression: `scripts/check-secondary-consumer-canonical.mjs` proves canonical delegation and absence of the duplicate browser-side analytics engine.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI not claimed.

`get_sales_secondary_metrics` remains intentionally retained until repository-wide consumer/dependency proof determines whether it can be safely removed.

## P0 — Forecast bounded collection
Finding: `fetchForecasts()` was an unbounded tenant-scoped collection read.

Fix:
- maximum 500 rows;
- exact count;
- deterministic `period ASC, id ASC` ordering;
- `REPORT_QUERY_LIMIT_EXCEEDED` when the dataset exceeds the bound;
- compatibility delegates to the bounded canonical implementation.

This is bounded collection, not business aggregation and not fake pagination.

Regression protects the bound, ordering, fail-closed contract and compatibility delegation.

## P0 — Customer/Product bounded collections
Finding: `fetchCustomers()` and `fetchProducts()` were unbounded tenant-scoped `select('*')` reads, and Entity pages downloaded the full collection before browser filtering.

Root cause: display collections had no payload boundary, creating network/browser-growth risk and allowing consumers to assume completeness without proof.

Safe bridge fix:
- shared `MAX_ENTITY_ROWS = 500`;
- exact count;
- deterministic `name ASC, id ASC` ordering;
- fail-closed `REPORT_QUERY_LIMIT_EXCEEDED` when more than 500 rows exist;
- compatibility reads now delegate to the bounded implementations.

This is **not claimed as full UI pagination migration**. Tenants exceeding the bound fail closed rather than silently receiving incomplete data. True server-side search/pagination remains a follow-up.

Regression protects the bound, ordering, fail-closed behavior and compatibility delegation.

## P0 — Data Quality bounded boundary
Finding: `fetchDataQualityDatasets()` performed four broad collection reads for customers, products, sales invoices and inventory balances, then `DataQualityPage` calculated quality metrics in the browser. The query boundary had no explicit row cap.

Root cause: data-quality analysis could become a partial-data metric if the reads were later bounded or platform payload limits truncated them; it also had no protection against unbounded tenant dataset growth.

Fix:
- explicit projections remain intact;
- `MAX_QUALITY_ROWS = 500`;
- exact count for every collection;
- range bounded to 500 rows;
- any dataset above the bound throws `REPORT_QUERY_LIMIT_EXCEEDED` rather than producing a partial quality score.

Important: this is a **safe fail-closed bridge**, not final closure of Data Quality business aggregation. The next step is a server-side `get_data_quality_snapshot` contract that computes the same issue counts authoritatively, so the browser no longer scans source rows at all.

Regression: `scripts/check-data-quality-projections.mjs` now enforces the explicit projections, four exact counts, four bounds and fail-closed contract.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI not claimed.

## Remaining P0/P1
1. Repository-wide consumer/dependency proof for `get_sales_secondary_metrics`; remove only after zero consumers.
2. Complete `queries-compat.ts` function-by-function classification.
3. Finalize Customers/Products true server-side search/pagination if 500-row bridge is insufficient for tenant scale.
4. Build authoritative `get_data_quality_snapshot` and migrate `DataQualityPage` from browser scans to canonical issue-count metrics.
5. BI / Decision Metrics / Exports / Demand Velocity / Inventory Intelligence business-truth sweep.
6. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions.
7. Product-page margin NULL/zero contract review.
8. Tenant runtime isolation across DB/Storage/Realtime/AI/vector/worker/notification.
9. Repository-wide direct Supabase/business-calculation sibling sweep.

## Regression / CI
Canonical `quality.yml` remains the quality gate. No duplicate quality workflow was created.

Behavioral gates cover canonical dashboard/inventory/analytics semantics, inventory zero-consumer/removal, compatibility canonical delegation, bounded forecast/customer/product collections, and the data-quality bounded fail-closed boundary.

Exact-head CI status is **NOT OBSERVABLE** for current code HEAD. No historical PASS is promoted.

## Performance evidence
- Dashboard aggregates server-side.
- Inventory display rows bounded independently from business totals.
- RFM/ABC bounded.
- Analytics no longer transfers full transactional histories.
- Compatibility analytics no longer owns aggregation.
- Forecast/customer/product collections are bounded and fail-closed.
- Data Quality collections are bounded and fail-closed pending full server-side snapshot migration.
- Production query plans, latency, load and capacity remain LIVE REQUIRED.

## Status ladder
- FOUNDATION: PASS by prior evidence.
- IMPLEMENTED: PASS for the migrated families above.
- REGRESSION: implemented and wired into the canonical quality gate.
- GATED: **NO CLAIM for current HEAD until exact-head CI is observable**.
- CONSUMER VERIFIED: inventory removal, valuation migration, compatibility delegation, forecast/customer/product delegation and Data Quality boundary have repository-level proof; final server-side Data Quality equivalence remains open.
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
- First: implement the authoritative Data Quality snapshot and migrate its only real consumer from row scans to server-side issue counts.
- In parallel: secondary-RPC zero-consumer sweep, BI/Decision/Export/Demand/Inventory Intelligence truth sweep, and tenant/security sibling sweep.
- Then: true server-side search/pagination for Customers/Products where required.
- Continue runtime/LIVE preparation without waiting for CI.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
