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
- Latest code HEAD: `d106e10e14d0711afa5cc0cbe42fcfd005168f2a`.
- Latest index commit after this update: pending this write; the index content records the code HEAD explicitly.
- PR #61 is open/draft and not merged.
- Exact-head quality run `33099441103` was triggered from code HEAD `31708d7bb308b1067427c0fe73a5b633ae2ed499` and checked PR head equality before executing the quality gates.
- Run `33099441103` failed at Behavioral regressions, while Typecheck, Lint, Build, Performance and the preceding contract gates passed. The failure was a regression-contract mismatch, not a type/build failure.

## Batch — Forecast bounded compatibility contract
Finding: the dashboard canonical regression required a named `MAX_FORECAST_ROWS=500` guard and explicit fail-closed behavior for forecast collection, but `queries.ts` used an inline literal `500` and returned the payload without a postcondition.

Classification: `P1 DATA TRUTH / BOUNDED READS / COMPATIBILITY CONTRACT`

Root cause: the forecast compatibility boundary had the bounded RPC request but lacked a named invariant and explicit truncation postcondition, leaving the consumer contract weaker than the regression specification.

Fix:
- Added `const MAX_FORECAST_ROWS = 500`.
- `fetchForecasts()` now passes the named bound to `get_forecast_snapshot`.
- The returned array is checked against the same bound and fails closed with `REPORT_QUERY_LIMIT_EXCEEDED` if exceeded.

Consumer state: `fetchForecasts()` remains a compatibility boundary delegating to the canonical forecast RPC; no direct forecast table read was introduced.

Regression: `scripts/dashboard-canonical-regression.mjs` already enforces the named constant, exact bound, deterministic ordering/count expectations and fail-closed truncation contract.

Status: `IMPLEMENTED → REGRESSION TARGET FIXED → PARTIAL`; exact-head CI for `d106e10e14d0711afa5cc0cbe42fcfd005168f2a` pending.

## Batch — report execution lease fencing
Finding: report queue lifecycle transitions were authorized by `workerId` and lease expiry, but the real worker adapter did not carry a unique lease identity.

Root cause: lease ownership lacked a per-claim fencing token propagated to every mutating lifecycle operation.

Fix:
- `src/lib/report-execution/queue.ts` issues a `leaseToken` on every claim/reclaim.
- `heartbeat`, `complete`, `cancel`, and `fail` require the exact token and worker identity.
- Expired leases are rejected for heartbeat.
- Retry/reclaim produces a different token.
- Terminal/failure transitions clear owner, token and expiry.
- Worker adapter propagates the token.

Regression covers stale heartbeat, retry token rotation, stale completion rejection and terminal clearing.

Status: `IMPLEMENTED → REGRESSION HARDENED → PARTIAL`; exact-head CI and runtime crash/recovery evidence pending.

## P0 — Data Quality
Browser business-quality aggregation was migrated to `get_data_quality_snapshot()` with tenant authority from `current_company_id()`. Legacy bridge/page removal has repository consumer proof and regression protection.

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF → REGRESSION`; exact-head database/runtime evidence pending.

## P1 — Dashboard Intelligence tenant boundary
Direct browser reads of recommendations/alerts were replaced by `get_dashboard_intelligence(p_limit)`, deriving tenant authority from `current_company_id()` with bounded output and authenticated execution.

Status: `IMPLEMENTED → REGRESSION`; exact-head/live runtime pending.

## P1 — Forecast read boundary
Direct `forecasts` table reads were replaced by `get_forecast_snapshot(p_limit)`, tenant-authoritative, explicitly projected, bounded and deterministic. The compatibility boundary is now additionally guarded by `MAX_FORECAST_ROWS=500` and fail-closed truncation semantics.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime pending.

## P1 — Export tenant authority hardening
Inventory export now fails closed on `TENANT_CONTEXT_MISMATCH` and derives data from `current_company_id()`. Sibling export RPCs received fixed search_path, anonymous revocation and authenticated grants.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI and live A/B export isolation pending.

## DB-only legacy candidate — get_sales_secondary_metrics
Repository consumer search found no source consumer, but external/database consumers cannot be excluded. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

## Parallel remaining fronts
### Front A — Canonical Data Truth
- `queries-compat.ts` complete function/consumer graph.
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
- lease fencing implementation/regression is present; durable runtime crash/recovery remains LIVE evidence.

### Front G — Runtime/LIVE
- authenticated E2E.
- Supabase A/B isolation.
- OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository behavioral/contract evidence exists.
- GATED: **NO CLAIM** for `d106e10e14d0711afa5cc0cbe42fcfd005168f2a` until exact-head CI evidence exists.
- CONSUMER VERIFIED: only where explicit consumer proof exists.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue independent fronts without waiting for CI: cross-surface BI/Decision/Export truth, NULL semantics, tenant/security sibling discovery, compatibility consumer graph, and reliability runtime harness preparation. Exact-head CI remains a certification barrier, not a work queue.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
