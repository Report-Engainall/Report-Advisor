# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Repository: `Report-Engainall/Report-Advisor`
Branch: `wave/runtime-reliability-closure-20260827`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Current batch code/test HEAD before this index update: `82e530644d4279769263c783416e2201ca4f090c`.
- Exact-head CI for this batch: `NOT OBSERVABLE` at indexing time; no PASS claimed.
- Runtime/LIVE/production certification: `NOT VERIFIED`.

## Batch — Report queue lease fencing / reliability closure
Finding: queue ownership was previously bound only to `workerId`, allowing stale executions from successive leases for the same worker identity to race.

Fix:
- `src/lib/report-execution/queue.ts` issues a unique `leaseToken` per claim and requires it for lifecycle mutations.
- Regression contract covers idempotency, stale leases, retry, DLQ and fencing.
- Runtime caller migration remains open until all durable worker consumers are verified.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime/live pending.

## Batch — Compatibility consumer truth boundary
Finding: `queries-compat.ts` is intentionally a compatibility layer, but its role must remain mechanically enforced so legacy imports cannot regain business aggregation or independent truth.

Fix:
- Added `scripts/check-compatibility-consumer-closure.mjs`.
- The contract requires all canonical query delegates to remain pure delegates, forbids `reduce/sort/filter` business calculations in the compatibility layer, and enforces the bounded canonical export path.
- Added `test:compatibility-consumer-closure` to `package.json` without removing existing commands.
- Added `.github/workflows/consumer-closure.yml` with exact-SHA verification, compatibility closure and queue reliability gates.

Consumer state: canonical query consumers remain behind the shared boundary; zero legacy consumers and external DB consumers still require explicit proof before destructive removal.

Status: `IMPLEMENTED → REGRESSION → CI-WIRED`; exact-head CI pending.

## P0/P1 existing closures
- Data Quality: canonical `get_data_quality_snapshot()` with tenant authority; repository zero-legacy proof recorded; DB/runtime pending.
- Dashboard Intelligence: canonical `get_dashboard_intelligence()`; regression exists; live runtime pending.
- Forecast: canonical `get_forecast_snapshot()`; regression exists; runtime pending.
- Export tenant authority: four export RPCs hardened with server tenant authority, fixed search path and revoked anonymous execution; A/B runtime pending.

## Parallel remaining fronts
### P0 Security
RPC grants/search_path/RLS; Storage; Realtime; AI/vector; workers; notifications; generated files.

### P1 Truth / Consumers
Cross-surface BI/Decision/Export equivalence; NULL semantics; remaining browser aggregation; compatibility consumer graph; legacy zero-consumer proof.

### P1 Reliability
Queue callers; durable worker crash/restart; stale lease recovery; duplicate worker; retry/DLQ; idempotent side effects; watcher recovery.

### P2 Performance
Unbounded reads, query plans/indexes, N+1, payload bounds and concurrency pressure.

### P2 Documents / Decisions
Real corpus extraction → evidence → confidence → canonical data → KPI/report; Decision → Action → Outcome → Feedback.

### P3 LIVE
Authenticated E2E, Supabase A/B isolation, Storage/Realtime/AI-vector isolation, native watcher, backup/restore/RPO/RTO, production telemetry, load/canary/rollback.

## Status ladder
`IMPLEMENTED → REGRESSION → GATED → INTEGRATED → CONSUMER VERIFIED → RUNTIME VERIFIED → LIVE VERIFIED → PRODUCTION CERTIFIED`

No capability advances without its corresponding evidence. Current batch has no exact-head CI PASS claim.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
