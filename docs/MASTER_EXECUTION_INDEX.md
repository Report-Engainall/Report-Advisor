# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `data-quality-authoritative-snapshot`  
Base: `b4897b8d456d10736642745b097de2aea89b27c5`

## Permanent execution policy
`DISCOVER → INVENTORY → CONSUMER DISCOVERY → ROOT CAUSE → CORRECT ARCHITECTURE → IMPLEMENT → REGRESSION → EXACT CI → CONSUMER VERIFY → INDEX → NEXT FAILURE FAMILY`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Current code HEAD before this Index update: `18aa8ff1c940ddad4dfa7c65a2077ef096ea1d1b`.
- Starting exact HEAD: `b4897b8d456d10736642745b097de2aea89b27c5`.
- PR: `#43` — current branch, base `main`, head is not merged.
- Current exact-head CI for `18aa8ff1c940ddad4dfa7c65a2077ef096ea1d1b`: **NOT OBSERVABLE** at index time. No PASS is claimed.
- Prior exact-head quality run `32926072255` was observed on `468c713...` and was still `IN_PROGRESS`; it is not evidence for the newer HEAD.
- `quality.yml` remains the canonical quality gate.

## P0 — Data Quality
Root cause: business-quality truth was computed in a browser reducer over bounded source collections.

Fix:
- `get_data_quality_snapshot()` is authoritative and derives tenant authority from `current_company_id()`.
- `src/lib/data-quality-snapshot.ts` is the browser adapter.
- `/data-quality` uses `DataQualitySnapshotPage`.
- Legacy `src/lib/data-quality-queries.ts` removed after repository consumer search.
- Legacy `DataQualityPage` removed from `EntityPages.tsx` after route migration proof.
- `scripts/check-data-quality-projections.mjs` now guards canonical snapshot consumption and legacy removal.

Regression:
- `src/lib/data-quality-snapshot.test.ts`
- `src/lib/data-quality-snapshot.contract.test.ts`
- `scripts/check-data-quality-projections.mjs`

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF IN REPOSITORY → REGRESSION`; exact-head CI/database/runtime remain unverified.

## P1 — Dashboard Intelligence tenant boundary
Root cause: browser code directly read `recommendations` and `alerts` instead of consuming a canonical tenant-authoritative domain contract.

Fix:
- `get_dashboard_intelligence(p_limit)` added in `20260826070000_dashboard_intelligence_canonical.sql`.
- Tenant identity derives from `current_company_id()`.
- RPC is `SECURITY INVOKER`, fixed `search_path`, bounded to 500, PUBLIC/anon revoked, authenticated granted.
- `fetchDashboardIntelligence()` now consumes only the RPC.

Regression:
- `src/lib/dashboard-canonical.intelligence.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/live cross-tenant runtime pending.

## P1 — Forecast read boundary
Finding: `fetchForecasts()` used a direct client table read with a 500-row cap. Although tenant-filtered, the application still owned the read contract.

Fix:
- Added `get_forecast_snapshot(p_limit)` in `20260826073000_forecast_canonical_snapshot.sql`.
- Server derives tenant authority from `current_company_id()`.
- Explicit field projection, deterministic order, bounded limit, `SECURITY INVOKER`, fixed `search_path`, authenticated-only execution.
- `fetchForecasts()` now consumes only the canonical RPC.

Regression:
- `src/lib/queries.forecast.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime pending.

## DB-only legacy candidate — get_sales_secondary_metrics
`supabase/migrations/20260826003000_sales_secondary_canonical_analytics.sql` still defines the function.
Repository consumer search for the exact function name returned no source consumer. This is not external/database consumer proof.

Status: `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`. Do not destructively drop until the external/database dependency boundary is proven.

## Remaining P0/P1
1. Exact-head CI for current HEAD; fix every failure at root cause.
2. `queries-compat.ts` function-by-function consumer graph and migration.
3. Cross-surface equivalence: Dashboard/Reports/Analytics/BI/Exports/Decisions.
4. NULL/UNKNOWN/INSUFFICIENT_DATA sweep across all business metrics.
5. Forecast/Demand Velocity/Inventory Intelligence semantic equivalence beyond the read boundary.
6. Export truth, limits and truncation proof.
7. Tenant/security sibling sweep: RPC, Storage, Realtime, AI/vector, workers, notifications and generated files.
8. Performance: unbounded reads, N+1, duplicate RPCs, query plans and indexes.
9. Reliability: worker/watchers/retry/idempotency/DLQ/recovery.
10. Runtime/LIVE evidence preparation.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- REGRESSION: implemented for current fixes.
- GATED: NO CLAIM for current HEAD.
- CONSUMER VERIFIED: Data Quality legacy repository path removed; Dashboard Intelligence and Forecast consumers migrated.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue `queries-compat.ts` consumer graph and BI → Decision → Export → Demand Velocity → Inventory Intelligence. In parallel continue tenant/security sibling sweep and inspect NULL/UNKNOWN semantics. Observe and fix exact-head CI as evidence becomes available. Keep `get_sales_secondary_metrics` as a legacy candidate until external/database dependency risk is resolved.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
