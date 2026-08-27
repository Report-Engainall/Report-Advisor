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
- Latest code before this index write: `40cbb28bfdac60e1a410474ccf3ffdaa7b2dce31`.
- PR #61 is open/draft and not merged.
- Quality run `33099834858` exposed a real CI race: the workflow was triggered for PR head `d106e10e14d0711afa5cc0cbe42fcfd005168f2a`, but a subsequent index commit advanced the branch before Diagnostics executed. The old diagnostic compared the event's immutable PR head to the branch's mutable current remote head and failed before installation.
- Root cause: exact-head diagnostic used a mutable remote branch lookup instead of validating the immutable PR event head against the checked-out merge ref.
- Fix in `40cbb28bfdac60e1a410474ccf3ffdaa7b2dce31`: PR diagnostics now read `pull_request.head.sha` from the event and require that SHA to be a parent of the checked-out merge ref; the mutable `git ls-remote` comparison was removed. This preserves exact-head discipline while eliminating false failures caused by legitimate subsequent pushes.
- Run `33099834858` also showed that when Diagnostics failed, `Install` was skipped, while `always()` later allowed several static gates to run and pass. The failure therefore remains a CI-infrastructure failure, not a product regression.

## Batch — Forecast bounded compatibility contract
Finding: `dashboard-canonical-regression.mjs` required a named `MAX_FORECAST_ROWS=500` invariant and explicit fail-closed truncation, while `queries.ts` used an inline literal and returned rows without the postcondition.

Classification: `P1 DATA TRUTH / BOUNDED READS / COMPATIBILITY CONTRACT`

Root cause: compatibility boundary was weaker than its regression contract.

Fix:
- Added `const MAX_FORECAST_ROWS = 500`.
- `fetchForecasts()` passes the named bound to `get_forecast_snapshot`.
- Returned rows are checked against the same bound and fail closed on overflow.

Regression: `scripts/dashboard-canonical-regression.mjs` enforces the named constant, bound, deterministic ordering/count expectations and fail-closed truncation contract.

Status: `IMPLEMENTED → REGRESSION TARGET FIXED → PARTIAL`; exact-head certification is pending because the subsequent CI run was blocked by the diagnostic race described above.

## Batch — report execution lease fencing
Finding: report queue lifecycle transitions lacked a unique per-claim fencing identity.

Root cause: ownership was based on mutable worker identity plus expiry without a token propagated through mutations.

Fix:
- `leaseToken` issued on claim/reclaim.
- Exact token + worker required for heartbeat/complete/cancel/fail.
- Expired heartbeat rejected.
- Retry rotates token.
- Terminal/failure clears ownership/token/expiry.
- Worker adapter propagates token.

Regression covers stale heartbeat, expiry, retry token rotation, stale completion rejection and terminal clearing.

Status: `IMPLEMENTED → REGRESSION HARDENED → PARTIAL`; exact-head CI and durable runtime crash/recovery evidence pending.

## P0 — Data Quality
Browser business-quality aggregation uses `get_data_quality_snapshot()` with tenant authority from `current_company_id()`. Legacy bridge/page removal has repository consumer proof and regression protection.

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF → REGRESSION`; exact-head database/runtime evidence pending.

## P1 — Dashboard Intelligence tenant boundary
Recommendations/alerts use `get_dashboard_intelligence(p_limit)` with server-derived tenant authority, bounded output and authenticated execution.

Status: `IMPLEMENTED → REGRESSION`; exact-head/live runtime pending.

## P1 — Forecast read boundary
Forecast reads use `get_forecast_snapshot(p_limit)`, tenant-authoritative, explicitly projected, bounded and deterministic. Compatibility layer now has a named 500-row guard and fail-closed truncation.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime pending.

## P1 — Export tenant authority hardening
Inventory export fails closed on `TENANT_CONTEXT_MISMATCH` and derives data from `current_company_id()`. Sibling export RPCs received fixed search_path, anonymous revocation and authenticated grants.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI and live A/B export isolation pending.

## DB-only legacy candidate — get_sales_secondary_metrics
No repository source consumer found, but external/database consumers cannot be excluded. Keep `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; no destructive drop.

## Parallel remaining fronts
### Front A — Canonical Data Truth
`queries-compat.ts` graph; NULL/UNKNOWN/INSUFFICIENT_DATA; date/status/as-of; remaining browser aggregation.

### Front B — Consumer + Legacy Closure
Compatibility zero-consumer proof; duplicate engines; DB-only legacy candidates.

### Front C — BI / Decision / Export
Cross-surface equivalence; Forecast/Demand Velocity/Inventory Intelligence; export metric/date/status/as-of/filter equivalence.

### Front D — Security / Tenant
RPC grants/search_path/RLS; Storage/Realtime/AI-vector; workers/notifications/generated files.

### Front E — Performance
Unbounded reads; query plans/indexes; N+1/payload bounds.

### Front F — Reliability
Worker/watcher/queue/retry/idempotency/DLQ/recovery; backup/restore/RPO/RTO; lease fencing remains runtime-pending.

### Front G — Runtime/LIVE
Authenticated E2E; Supabase A/B isolation; OCR corpus; native watcher; telemetry; load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository behavioral/contract evidence exists.
- GATED: **NO CLAIM** for current HEAD until a quality run reaches the relevant gates on the same event head.
- CONSUMER VERIFIED: only with explicit consumer proof.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue independent work immediately. Highest current CI-family item is the exact-head diagnostic race hardening; then resume the quality run and continue with cross-surface BI/Decision/Export truth, NULL semantics, tenant/security sibling discovery and reliability runtime harness preparation.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
