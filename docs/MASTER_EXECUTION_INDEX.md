# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `data-quality-authoritative-snapshot`  
Base: `b4897b8d456d10736642745b097de2aea89b27c5`  
PR: `#43`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Current code/test HEAD before this Index update: `923323cce876760b32635b9ccaaa189aa7e4404a`.
- PR merge ref remains separate from application HEAD.
- Prior observed quality run `32926144627` on `69f0c6c...` failed at `Data Quality projection contract`; its log endpoint was unavailable, so no fabricated error was recorded.
- The identified regression-guard defect was corrected in `2d6b9f...` and carried forward.
- Exact-head CI for the current batch remains **NOT OBSERVABLE**; no PASS claimed.

## Batch — invoice page-read tenant/security closure
Finding: `fetchSalesInvoices()` and `fetchPurchaseInvoices()` were bounded paginated display reads but did not explicitly bind their query predicates to the authoritative client-resolved tenant context, unlike sibling reads.

Classification: `SECURITY/TENANT ISSUE + PERFORMANCE/DETERMINISM`

Root cause: invoice list reads relied on downstream RLS alone while the compatibility/query boundary lacked an explicit fail-closed tenant context and deterministic tie-break ordering.

Fix:
- `src/lib/queries.ts` now requires `resolveCurrentCompanyId()` before either invoice read.
- Both queries explicitly constrain `company_id` to the resolved tenant.
- Both retain hard page-size bounds (1..500).
- Both use deterministic `invoice_date DESC, id ASC` ordering before range pagination.

Regression:
- Added `src/lib/queries.invoice-tenant.contract.test.ts`.
- Regression asserts tenant requirement, explicit company predicate, bounded pagination and deterministic ordering for both invoice surfaces.

Consumer state: existing `ReportsPage.tsx` consumers remain on the same public query API; no consumer migration was required because the fix strengthens the shared boundary without changing the business contract.

Legacy state: no legacy invoice engine introduced or removed in this batch.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime/live pending.

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

## Parallel remaining fronts
### Front A — Canonical Data Truth
- `queries-compat.ts` full function/consumer graph.
- NULL/UNKNOWN/INSUFFICIENT_DATA semantics.
- date/status/as-of consistency.
- remaining browser business aggregation.

### Front B — Consumer + Legacy Closure
- zero-consumer proof for compatibility functions.
- duplicate business engines.
- DB-only legacy candidates with external-consumer risk.

### Front C — BI / Decision / Export
- cross-surface equivalence.
- Forecast/Demand Velocity/Inventory Intelligence.
- export metric/date/status/as-of/filter equivalence.

### Front D — Security / Tenant
- RPC grants/search_path/RLS.
- Storage/Realtime/AI-vector.
- workers, notifications and generated files.

### Front E — Performance
- unbounded reads.
- query plans/indexes.
- N+1 and payload bounds.

### Front F — Reliability
- worker/watcher/queue/retry/idempotency/DLQ/recovery.
- backup/restore/RPO/RTO.

### Front G — Runtime/LIVE
- authenticated E2E.
- Supabase A/B isolation.
- OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository behavioral/contract evidence exists.
- GATED: **NO CLAIM** for current HEAD until exact-head CI evidence exists.
- CONSUMER VERIFIED: only where consumer evidence is explicit.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue all independent fronts without waiting for CI: `queries-compat.ts` consumer graph, cross-surface BI/Decision/Export truth, NULL semantics, and tenant/security sibling discovery. Exact-head CI is a certification barrier for the batch, not a reason to pause independent work.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
