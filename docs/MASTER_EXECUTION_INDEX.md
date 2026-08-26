# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `data-quality-authoritative-snapshot`  
Base: `b4897b8d456d10736642745b097de2aea89b27c5`

## Permanent execution policy
`DISCOVER → INVENTORY → CONSUMER DISCOVERY → ROOT CAUSE → CORRECT ARCHITECTURE → IMPLEMENT → REGRESSION → EXACT CI → CONSUMER VERIFY → INDEX → NEXT FAILURE FAMILY`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Current code HEAD before this Index update: `bf44581767671ccab4d67f836bdb7001bbe4d17f`.
- Starting exact HEAD: `b4897b8d456d10736642745b097de2aea89b27c5`.
- Exact-head CI: **NOT OBSERVABLE**. No PASS is claimed.
- `quality.yml` remains the canonical quality gate. No duplicate quality workflow was introduced.

## P0 — Data Quality
Root cause: business-quality truth was computed in a browser reducer over bounded source collections.

Fix:
- `get_data_quality_snapshot()` is authoritative and derives tenant authority from `current_company_id()`.
- `src/lib/data-quality-snapshot.ts` is the browser adapter.
- `/data-quality` uses `DataQualitySnapshotPage`.
- Legacy `src/lib/data-quality-queries.ts` was removed after repository consumer search.
- Legacy `DataQualityPage` was removed from `EntityPages.tsx` after route migration proof.
- `scripts/check-data-quality-projections.mjs` now guards canonical snapshot consumption and legacy removal.

Regression:
- `src/lib/data-quality-snapshot.test.ts`
- `src/lib/data-quality-snapshot.contract.test.ts`
- `scripts/check-data-quality-projections.mjs`

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF IN REPOSITORY → REGRESSION`; exact-head CI/database/runtime remain unverified.

## P1 — Dashboard Intelligence tenant boundary
Finding: `fetchDashboardIntelligence()` directly read `recommendations` and `alerts` from the browser.

Root cause: intelligence data bypassed the canonical RPC/domain boundary.

Fix:
- Added `supabase/migrations/20260826070000_dashboard_intelligence_canonical.sql`.
- Added tenant-authoritative `get_dashboard_intelligence(p_limit)`.
- Tenant identity comes from `current_company_id()`; no client tenant parameter is accepted.
- RPC is `SECURITY INVOKER`, fixed `search_path`, bounded to 500, PUBLIC/anon revoked, authenticated granted.
- `fetchDashboardIntelligence()` now consumes only the canonical RPC.

Regression:
- `src/lib/dashboard-canonical.intelligence.contract.test.ts` protects RPC-only consumption, tenant authority, grants, search_path and tenant predicates.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI and live cross-tenant runtime evidence remain pending.

## DB-only legacy candidate — get_sales_secondary_metrics
`supabase/migrations/20260826003000_sales_secondary_canonical_analytics.sql` still defines the function.
Repository consumer search for the exact function name returned no source consumer.
This is **not** external-consumer proof; an authenticated database/external consumer cannot be excluded by repository search alone.

Status: `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`. Do not destructively drop until that boundary is proven.

## Remaining P0/P1
1. Exact-head CI; fix compiler/test/migration failures at root cause.
2. `queries-compat.ts` function-by-function consumer graph and migration.
3. Cross-surface equivalence: Dashboard/Reports/Analytics/BI/Exports/Decisions.
4. NULL/UNKNOWN/INSUFFICIENT_DATA sweep across all business metrics.
5. Forecast/Demand Velocity and Inventory Intelligence canonical sweep.
6. Export truth, limits and truncation proof.
7. Tenant/security sweep: RPC, Storage, Realtime, AI/vector, workers, notifications and generated files.
8. Performance: unbounded reads, N+1, duplicate RPCs, query plans and indexes.
9. Reliability: worker/watchers/retry/idempotency/DLQ/recovery.
10. Runtime/LIVE evidence preparation.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- REGRESSION: implemented for current fixes.
- GATED: NO CLAIM until exact current SHA has observable quality evidence.
- CONSUMER VERIFIED: Data Quality legacy repository path removed; Dashboard Intelligence migrated.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Observe/fix exact-head CI when observable, then continue `queries-compat.ts` consumer graph and BI → Decision → Export → Forecast/Demand → Inventory Intelligence, with tenant/security sibling sweep in parallel. Keep `get_sales_secondary_metrics` as legacy candidate until external/database dependency risk is resolved.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
