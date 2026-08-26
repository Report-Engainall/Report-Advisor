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
- Current code/test HEAD before this Index update: `ca53c865ed12e4c40c8577858809ae27231eb589`.
- Previous Index HEAD: `bae99204fc05bfe26da6a1609c717ef331f0df04`.
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

Fix: preserve historical analytics names while delegating them to canonical `queries.ts` implementations; remove the secondary loader/RPC from compatibility; retain unrelated compatibility infrastructure intentionally.

Regression: `scripts/check-secondary-consumer-canonical.mjs` proves canonical delegation and absence of the duplicate browser-side analytics engine.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI not claimed.

`get_sales_secondary_metrics` remains intentionally retained until repository-wide consumer/dependency proof determines whether it can be safely removed.

## P0 — Forecast bounded collection
`fetchForecasts()` now has a 500-row exact-count bound, deterministic `period ASC, id ASC` ordering and fail-closed `REPORT_QUERY_LIMIT_EXCEEDED` behavior. Compatibility delegates to it. This is bounded collection, not business aggregation or fake pagination.

## P0 — Customer/Product bounded collections
`fetchCustomers()` and `fetchProducts()` no longer perform unbounded `select('*')` reads. They use a shared 500-row exact-count bound, deterministic `name ASC, id ASC` ordering and fail closed when the collection exceeds the bound. Compatibility delegates to the canonical implementations.

This is a safe bridge, not final UI pagination closure. Explicit server-side search/pagination remains required if tenant scale exceeds the bound.

## P0 — Data Quality bounded boundary
Finding: `fetchDataQualityDatasets()` read four broad collections for browser-side quality scoring.

Root cause: unbounded collection growth could create network/browser risk and, if truncated by a platform limit, could turn a quality score into a partial-data metric.

Fix:
- explicit projections;
- `MAX_QUALITY_ROWS = 500`;
- exact count for all four collections;
- `range(0, MAX_QUALITY_ROWS - 1)` for all four;
- `REPORT_QUERY_LIMIT_EXCEEDED` on oversized datasets;
- RLS/current tenant context is explicitly documented as the authorization boundary; no client tenant identifier is accepted.

Important: this is a **safe fail-closed bridge**, not final Data Quality closure. The final architecture is an authoritative `get_data_quality_snapshot` server contract that computes the same issue counts without transferring source rows to the browser.

Regression: `scripts/check-data-quality-projections.mjs` now enforces projections, four exact counts, four bounds and fail-closed behavior.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI not claimed.

## Remaining P0/P1
1. Repository-wide consumer/dependency proof for `get_sales_secondary_metrics`; remove only after zero consumers.
2. Complete `queries-compat.ts` function-by-function classification.
3. Finalize Customers/Products true server-side search/pagination where required by tenant scale.
4. Implement authoritative `get_data_quality_snapshot` and migrate `DataQualityPage` from browser scans to server-side issue counts, then add equivalence regression against the existing formulas.
5. BI / Decision Metrics / Exports / Demand Velocity / Inventory Intelligence business-truth sweep.
6. Cross-surface equivalence: Dashboard = Reports = Analytics = BI = Exports = Decisions.
7. Product-page margin NULL/zero contract review.
8. Tenant runtime isolation across DB/Storage/Realtime/AI/vector/worker/notification.
9. Repository-wide direct Supabase/business-calculation sibling sweep.

## Regression / CI
Canonical `quality.yml` remains the quality gate. No duplicate quality workflow was created.

Behavioral gates cover canonical dashboard/inventory/analytics semantics, inventory zero-consumer/removal, compatibility canonical delegation, bounded forecast/customer/product collections and the Data Quality bounded fail-closed boundary.

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
- First: implement authoritative Data Quality snapshot and migrate its only real consumer from row scans to server-side issue counts with semantic equivalence regression.
- In parallel: secondary-RPC zero-consumer sweep, BI/Decision/Export/Demand/Inventory Intelligence truth sweep, and tenant/security sibling sweep.
- Then: true server-side search/pagination for Customers/Products where required.
- Continue runtime/LIVE preparation without waiting for CI.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
