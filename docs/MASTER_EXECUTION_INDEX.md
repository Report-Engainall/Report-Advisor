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
- Current reliability batch HEAD before this Index update: `84aebe3369c4fc2baf72ed427e699c5d0cc617f5`.
- PR #61 is open/draft and not merged.
- Exact-head CI is **NOT OBSERVABLE until a workflow run/check for the exact batch HEAD is returned**. No PASS claimed.

## Batch — report execution lease fencing
Finding: report queue lifecycle transitions were authorized by `workerId` and lease expiry, but the real worker adapter did not carry a unique lease identity. A stale worker retaining the same worker identity could therefore pass ownership checks after a retry/reclaim if the lifecycle boundary were reached through the old contract.

Classification: `P1 RELIABILITY / CONCURRENCY / STALE-WORKER SAFETY`

Root cause: lease ownership was represented as mutable owner identity plus expiry, without a per-claim fencing token propagated to every mutating lifecycle operation.

Fix:
- `src/lib/report-execution/queue.ts` now issues a `leaseToken` on every claim/reclaim.
- `heartbeat`, `complete`, `cancel`, and `fail` require the exact token and worker identity.
- Expired leases are rejected for heartbeat.
- Retry/reclaim produces a different token.
- Terminal/failure transitions clear owner, token and expiry.
- `src/lib/report-execution/worker-adapter.ts` now exposes and forwards the token across the real adapter boundary.

Consumer state: repository search found the worker adapter and durable runner as the relevant lifecycle surfaces; no additional direct `.claim()`/`.heartbeat()` consumers were returned by the repository search. The adapter contract is therefore migrated, but runtime execution through the durable runner remains to be proven.

Regression:
- `scripts/report-execution-lease-fencing.test.ts` covers claim token issuance, stale heartbeat rejection, retry token rotation, stale-worker completion rejection and terminal token clearing.
- Package script: `test:report-execution-lease-fencing`.

Status: `IMPLEMENTED → REGRESSION ADDED → PARTIAL`; exact-head CI and runtime crash/recovery evidence pending.

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
- current batch: lease fencing token propagation is implemented and regression-gated, but runtime crash/recovery is pending.

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
Continue all independent fronts without waiting for CI: `queries-compat.ts` consumer graph, cross-surface BI/Decision/Export truth, NULL semantics, tenant/security sibling discovery, and runtime reliability harness preparation. Exact-head CI is a certification barrier for each batch, not a reason to pause independent work.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
