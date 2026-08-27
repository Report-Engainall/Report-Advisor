# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Repository: `Report-Engainall/Report-Advisor`
Branch: `wave/reliability-lease-fencing`
Base: `c7b21db4d68e396fa6ceefe3f6fdc15b1a8b8d4c`
PR: `#61`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Latest code/index HEAD: `f544dafb788aaeac79914a057c42eddb8262f734`.
- PR #61 is open/draft and not merged.
- Exact-head quality run `33098685009` executed against PR merge ref `39a49f9151dbc84aaf4e45e45de4c63c682dd1c2` and verified `PR_HEAD_SHA=89a1b4a36cc41f2affc5a98018649c9d3c50e00f`.
- That run failed at Typecheck because `InventoryPageCanonical.tsx` referenced unsupported `InventoryReportRow.last_movement_date`; build, lint, performance and all later `always()` gates passed, while downstream behavioral steps ordered after Typecheck were skipped.
- The consumer defect was fixed in `ee13e90245dc007ac8f147bc9c32dd580f465b8d`; the lease regression was then strengthened in `f544dafb788aaeac79914a057c42eddb8262f734` with deterministic expired-heartbeat coverage.
- No exact-head CI run has yet been observed for `f544dafb788aaeac79914a057c42eddb8262f734`; therefore no current-head PASS is claimed.

## Batch — report execution lease fencing
Finding: report queue lifecycle transitions were authorized by `workerId` and lease expiry, but the real worker adapter did not carry a unique lease identity. A stale worker retaining the same worker identity could therefore pass ownership checks after a retry/reclaim if the lifecycle boundary were reached through the old contract.

Classification: `P1 RELIABILITY / CONCURRENCY / STALE-WORKER SAFETY`

Root cause: lease ownership was represented as mutable owner identity plus expiry, without a per-claim fencing token propagated to every mutating lifecycle operation.

Fix:
- `src/lib/report-execution/queue.ts` issues a `leaseToken` on every claim/reclaim.
- `heartbeat`, `complete`, `cancel`, and `fail` require the exact token and worker identity.
- Expired leases are rejected for heartbeat.
- Retry/reclaim produces a different token.
- Terminal/failure transitions clear owner, token and expiry.
- `src/lib/report-execution/worker-adapter.ts` exposes and forwards the token across the real adapter boundary.
- `src/pages/InventoryPageCanonical.tsx` consumes only fields defined by the canonical inventory snapshot contract; unsupported legacy field usage was removed without reintroducing client business calculations.

Consumer state: repository search identified the worker adapter/durable runner as lifecycle surfaces. Adapter propagation is implemented. Runtime execution through durable runner crash/recovery remains unproven.

Regression:
- `scripts/report-execution-lease-fencing.test.ts` covers claim token issuance, stale heartbeat rejection, deterministic expired-heartbeat rejection, retry token rotation, stale-worker completion rejection and terminal token clearing.
- Package script: `test:report-execution-lease-fencing`.

Status: `IMPLEMENTED → REGRESSION HARDENED → PARTIAL`; exact-head CI after `f544dafb788aaeac79914a057c42eddb8262f734` and runtime crash/recovery evidence pending.

## P0 — Data Quality
Browser business-quality aggregation was migrated to `get_data_quality_snapshot()` with tenant authority from `current_company_id()`. The legacy bridge and page were removed after repository consumer proof. Regression guard checks canonical RPC consumption and legacy absence.

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
- current batch: lease fencing token propagation and expiry regression are implemented, but exact-head re-run and runtime crash/recovery remain pending.

### Front G — Runtime/LIVE
- authenticated E2E.
- Supabase A/B isolation.
- OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository behavioral/contract evidence exists.
- GATED: **NO CLAIM** for `f544dafb788aaeac79914a057c42eddb8262f734` until exact-head CI evidence exists.
- CONSUMER VERIFIED: only where consumer evidence is explicit.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue all independent fronts without waiting for CI: `queries-compat.ts` consumer graph, cross-surface BI/Decision/Export truth, NULL semantics, tenant/security sibling discovery, and runtime reliability harness preparation. Exact-head CI is a certification barrier for each batch, not a reason to pause independent work.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
