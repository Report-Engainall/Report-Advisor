# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `data-quality-authoritative-snapshot`  
Base: `b4897b8d456d10736642745b097de2aea89b27c5`  
PR: `#43`

## Permanent execution policy
`DISCOVER → INVENTORY → CONSUMER DISCOVERY → ROOT CAUSE → CORRECT ARCHITECTURE → IMPLEMENT → REGRESSION → EXACT CI → CONSUMER VERIFY → INDEX → NEXT FAILURE FAMILY`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Current application/code HEAD before this Index update: `2d6b9f289dfac6674bd6aa950396201e331ddecb`.
- PR merge ref is separate evidence and is not treated as application HEAD.
- Latest observed quality run on prior exact application HEAD `69f0c6c32e96cf44e379b03c7ba9fa8a305a320d`: run `32926144627`, job `98049328242`.
- Failure observed: `Data Quality projection contract` step failed. The job then continued under `if: always()`.
- Failure log endpoint was not retrievable (BlobNotFound), so no fabricated error text is recorded.
- Repository reproduction isolated a regression-guard matcher defect: the scanner's direct-read regex was over-escaped and did not represent the intended contract. Corrected to `/supabase\.from\(/` in source.
- New exact-head CI for `2d6b9f...` was not yet observable at the index update; no PASS is claimed.
- `quality.yml` remains canonical.

## P0 — Data Quality
Root cause: browser reducer owned business-quality aggregation.

Fix:
- `get_data_quality_snapshot()` authoritative server-side aggregation with `current_company_id()` tenant authority.
- `src/lib/data-quality-snapshot.ts` adapter.
- `/data-quality` → `DataQualitySnapshotPage`.
- Removed `src/lib/data-quality-queries.ts` after consumer search.
- Removed legacy `DataQualityPage` from `EntityPages.tsx` after route migration proof.
- Reworked `scripts/check-data-quality-projections.mjs` into a behavioral/contract regression guard; corrected its direct-read matcher after CI exposed the defect.

Regression:
- `src/lib/data-quality-snapshot.test.ts`
- `src/lib/data-quality-snapshot.contract.test.ts`
- `scripts/check-data-quality-projections.mjs`

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF IN REPOSITORY → REGRESSION`; exact-head CI/database/runtime pending.

## P1 — Dashboard Intelligence tenant boundary
Direct browser reads of `recommendations`/`alerts` were replaced with `get_dashboard_intelligence(p_limit)` using `current_company_id()`, `SECURITY INVOKER`, fixed search_path, explicit tenant predicates and bounded output.

Regression: `src/lib/dashboard-canonical.intelligence.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/live runtime pending.

## P1 — Forecast read boundary
Direct `forecasts` table read was replaced with `get_forecast_snapshot(p_limit)`, tenant-authoritative, bounded, explicitly projected and deterministically ordered.

Regression: `src/lib/queries.forecast.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime pending.

## DB-only legacy candidate — get_sales_secondary_metrics
`supabase/migrations/20260826003000_sales_secondary_canonical_analytics.sql` still defines it. Repository consumer search found no source consumer, but external/database consumers cannot be excluded by repository search. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

## Remaining P0/P1
1. Exact-head CI for `2d6b9f...`; fix every new failure at root cause.
2. `queries-compat.ts` function-by-function consumer graph and migration.
3. Cross-surface equivalence Dashboard/Reports/Analytics/BI/Exports/Decisions.
4. NULL/UNKNOWN/INSUFFICIENT_DATA sweep across all business metrics.
5. Forecast/Demand Velocity/Inventory Intelligence semantic equivalence.
6. Export truth, limits and truncation proof.
7. Tenant/security sibling sweep: RPC, Storage, Realtime, AI/vector, workers, notifications, generated files.
8. Performance and reliability sweeps.
9. Runtime/LIVE evidence.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- REGRESSION: implemented for current fixes; one CI regression defect was found and corrected.
- GATED: NO CLAIM for current HEAD.
- CONSUMER VERIFIED: Data Quality legacy repository path removed; Dashboard Intelligence and Forecast consumers migrated.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Observe exact-head CI for the corrected guard. Then continue `queries-compat.ts` consumer graph and BI → Decision → Export → Demand Velocity → Inventory Intelligence, while continuing tenant/security sibling discovery in parallel.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
