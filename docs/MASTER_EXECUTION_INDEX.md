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
- Current application/code HEAD before this Index update: `8fd04c521bdf8ba75a7c4b01fb41e9a9fd2839fc`.
- PR merge ref remains separate from application HEAD.
- Prior observed quality run `32926144627` on `69f0c6c...` failed at `Data Quality projection contract`; its log endpoint was unavailable, so no fabricated error was recorded.
- The identified regression-guard defect was corrected in `2d6b9f...` and carried forward.
- Exact-head CI for `8fd04c...` is currently **NOT OBSERVABLE**; no PASS claimed.

## P0 — Data Quality
Browser business-quality aggregation was migrated to `get_data_quality_snapshot()` with tenant authority from `current_company_id()`. The legacy bridge and page were removed after repository consumer proof. Regression guard now checks canonical RPC consumption and legacy absence.

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF IN REPOSITORY → REGRESSION`; exact-head CI/database/runtime pending.

## P1 — Dashboard Intelligence tenant boundary
Direct browser reads of recommendations/alerts were replaced by `get_dashboard_intelligence(p_limit)`, deriving tenant authority from `current_company_id()`, using fixed search_path, bounded output and authenticated-only execution.

Regression: `src/lib/dashboard-canonical.intelligence.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/live runtime pending.

## P1 — Forecast read boundary
Direct `forecasts` table read was replaced by `get_forecast_snapshot(p_limit)`, tenant-authoritative, explicitly projected, bounded and deterministic.

Regression: `src/lib/queries.forecast.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime pending.

## P1 — Export tenant authority hardening
Finding: `get_inventory_export_rows(p_company_id, ...)` did not assert the caller-supplied company id matched server tenant authority, unlike sibling export functions. Export RPCs also lacked consistent anonymous revocation/search_path hardening.

Root cause: inconsistent security contract across sibling canonical export functions.

Fix:
- Added `supabase/migrations/20260826080000_export_tenant_authority_hardening.sql`.
- Inventory export now fails closed on `TENANT_CONTEXT_MISMATCH` and derives all data from `current_company_id()`.
- All four export RPCs have fixed `search_path`, anonymous execution revoked, and authenticated execution explicitly granted.

Regression: `src/lib/export-tenant-authority.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI and live A/B export isolation pending.

## DB-only legacy candidate — get_sales_secondary_metrics
`supabase/migrations/20260826003000_sales_secondary_canonical_analytics.sql` still defines it. Repository consumer search found no source consumer, but external/database consumers cannot be excluded. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

## Remaining P0/P1
1. Exact-head CI and root-cause all failures.
2. `queries-compat.ts` function-by-function consumer graph and migration.
3. Cross-surface equivalence Dashboard/Reports/Analytics/BI/Exports/Decisions.
4. NULL/UNKNOWN/INSUFFICIENT_DATA sweep across all business metrics.
5. Forecast/Demand Velocity/Inventory Intelligence semantic equivalence.
6. Export truth, date/status/as-of/filter equivalence and truncation proof.
7. Tenant/security sibling sweep: RPC, Storage, Realtime, AI/vector, workers, notifications and generated files.
8. Performance and reliability sweeps.
9. Runtime/LIVE evidence.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- REGRESSION: implemented for current fixes.
- GATED: NO CLAIM for current HEAD.
- CONSUMER VERIFIED: Data Quality legacy repository path removed; Dashboard Intelligence, Forecast and export tenant boundaries migrated.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue `queries-compat.ts` consumer graph, cross-surface BI/Decision/Export truth, NULL semantics, and tenant/security sibling discovery. Observe exact-head CI as soon as available and fix every failure at root cause.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
