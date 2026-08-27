# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Repository: `Report-Engainall/Report-Advisor`
Branch: `data-quality-authoritative-snapshot`
PR: `#43`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Current code/test HEAD: `bd9e4cd2aaa3acfc502e66e4f4ca728a499a1b54`.
- Exact-head check-runs: not yet observed for this latest SHA; therefore **NO PASS CLAIM**.
- Runtime/LIVE/production certification: **NOT CLAIMED**.

## Batch — Demand Velocity canonical truth / bounded read closure
Finding: `fetchProductDemandSeries()` performed browser-side invoice/item reads followed by business aggregation; real consumers include `DemandVelocityPage.tsx` and `InventoryIntelligencePage.tsx`. The prior scanner asserted the direct reads instead of preventing them.

Root cause: no dedicated authoritative demand snapshot boundary, causing potentially large invoice/item payloads and duplicate business calculations in the browser.

Fix:
- Added `supabase/migrations/20260827150000_demand_velocity_canonical_snapshot.sql`.
- Added `get_demand_velocity_snapshot(p_days, p_as_of)` with `current_company_id()` tenant authority, fixed `search_path`, authenticated-only execution, bounded 1..365-day input and database-side product/day aggregation.
- Migrated `src/lib/free-toolbox/sales-demand-series.ts` to the canonical RPC while preserving the existing consumer API; both known consumers automatically use the canonical adapter.
- Replaced the weak scanner with `scripts/check-demand-velocity.mjs`, asserting RPC use and forbidding direct `sales_invoices`/`sale_items` reads in the adapter.

Consumer state: `DemandVelocityPage.tsx` and `InventoryIntelligencePage.tsx` consume `fetchProductDemandSeries()`; repository search found no consumer of `fetchSalesVelocityEvents()`.

Legacy closure: repository-wide consumer search showed `demand-series-utils.ts` had zero consumers and duplicated browser-side aggregation semantics. It was removed after zero-consumer proof. `sales-velocity-data.ts` remains a separate legacy candidate pending compatibility/deletion proof; `get_sales_secondary_metrics` remains DB-defined because external/database consumers cannot be excluded.

Regression: canonical-boundary script added/updated; deletion itself must be covered by exact-head typecheck/build/quality evidence.

Exact-head CI: **NOT OBSERVABLE / NO PASS CLAIM** for `bd9e4cd2aaa3acfc502e66e4f4ca728a499a1b54`.

Remaining LIVE evidence: authenticated DB execution, tenant A/B isolation, performance on large corpus, runtime UI behavior, and production-scale query-plan evidence.

Certification state: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-CONSUMER LEGACY REMOVAL → REGRESSION`; exact-head CI/runtime/live pending.

## Existing partial families
### Invoice page-read tenant/security closure
Tenant resolution, explicit company predicates, bounded page sizes and deterministic ordering implemented; adversarial regression exists. Exact-head/runtime/live pending.

### P0 Data Quality
Canonical tenant-authoritative snapshot implemented; legacy browser bridge removed after repository consumer proof. Exact-head/database/runtime pending.

### Dashboard Intelligence tenant boundary
Tenant-authoritative dashboard intelligence RPC and regression implemented; exact-head/live pending.

### Forecast read boundary
Bounded tenant-authoritative forecast snapshot implemented; exact-head/runtime pending.

### Export tenant authority hardening
All four canonical export RPCs have tenant authority checks, fixed search_path, anonymous execution revoked and authenticated execution granted; live A/B isolation pending.

### Export completeness
Canonical export adapters and regression guard prevent page-only export and silently truncated oversized exports; exact-head certification remains per current SHA.

### DB-only legacy candidate — get_sales_secondary_metrics
Still defined in migration; no repository consumer found, but external/database consumers cannot be excluded. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

## Parallel remaining fronts
- Canonical Data Truth: `queries-compat.ts` consumer graph, NULL/UNKNOWN semantics, date/status/as-of consistency, remaining browser aggregation.
- Consumer/Legacy Closure: zero-consumer proof, duplicate engines, DB-only legacy risk.
- BI/Decision/Export: cross-surface equivalence and filter/date/as-of equivalence.
- Security/Tenant: RPC grants/search_path/RLS, Storage, Realtime, AI/vector, workers, notifications and generated files.
- Performance: unbounded reads, query plans/indexes, N+1 and payload bounds.
- Reliability: worker/watcher/queue/retry/idempotency/DLQ/recovery, backup/restore/RPO/RTO.
- Runtime/LIVE: authenticated E2E, Supabase A/B isolation, OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository behavioral/contract evidence exists.
- GATED: no claim for current HEAD until exact-head CI evidence exists.
- CONSUMER VERIFIED: only where consumer evidence is explicit.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue independent fronts without waiting for CI: `queries-compat.ts` consumer graph, NULL/UNKNOWN semantics, cross-surface BI/Decision/Export equivalence, tenant/security sibling discovery, reliability drills, and performance bottleneck discovery. Exact-head CI is a certification barrier, not a reason to pause independent work.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
