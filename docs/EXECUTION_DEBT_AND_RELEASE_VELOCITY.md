# Execution Debt & Release Velocity — 2026-09-02

## Purpose
This is the live supplemental accounting contract for the autonomous execution protocol. The master execution index remains the authoritative ledger; this file prevents execution debt, release velocity, and time-utilization state from being silently omitted while the index is refreshed safely.

## EXECUTION DEBT

### Current debt
- `INDEX-CURRENT-HEAD-REFRESH`: actionable documentation debt; the master index must always be refreshed after the final mutation in an execution window while preserving historical ledger content.
- `CI-REVALIDATION`: current exact-head Quality/Final Batch results must be consumed on the exact SHA; historical PASS is never promoted.

### ACTIONABLE DEBT
- local security/DB/RPC/evidence/test-of-test findings exposed by the current rescan;
- local E1–E8 preparation and evidence-schema validation;
- exact-head index synchronization after the mutation batch;
- immediate consumption and re-scheduling of asynchronous results.

### EXTERNAL DEBT
- exact-head live deployment authorization/rate-limit access;
- authenticated runtime credentials;
- live Tenant A/B runtime;
- real backup/restore/RPO/RTO environment;
- staging rollback/forward-recovery authorization;
- approved DR environment.

Rule: `ACTIONABLE DEBT → MUST EXECUTE`; `EXTERNAL DEBT → ISOLATE + PREPARE + DOCUMENT`. External debt never clears unrelated actionable debt.

## WAITING WINDOWS

An asynchronous operation creates a `WAITING WINDOW` with:
- operation;
- status;
- parallel window state;
- available independent work;
- work actually executed;
- result-consumption state.

A waiting window closes only when `result received AND result consumed AND new work evaluated`.

## EXECUTION SCHEDULER

Each task is tracked as:
`TASK | DEPENDENCY | STATE | PARALLEL? | BLOCKER | CAN START NOW? | EXPECTED UNLOCK`.

`READY + INDEPENDENT = EXECUTE NOW`.

Tasks sharing a mutation chain, file write, exact-SHA evidence boundary, or unsafe external side effect remain sequential. Independent read-only audits, harnesses, contract validation, and preparation work are parallel-ready.

## RELEASE VELOCITY

Velocity is measured only by capability/evidence closure movement across:

`Built → Integrated → Verified → Runtime Proven → Production Certified`

No commit count, line count, documentation volume, elapsed waiting time, or report count is release velocity.

## EXECUTION UTILIZATION

Track:
- `Async Operations Running`
- `Parallel Work Available`
- `Parallel Work Executed`
- `Execution Debt Closed`
- `Remaining Work Reduced`

If asynchronous work is running while independent actionable work is available and zero independent work is executed, classify the interval as `UNDER-UTILIZATION`, not progress.

## TRUE STOP IMPACT

`EXECUTION DEBT = 0` is required before TRUE STOP for locally executable debt. TRUE STOP is forbidden while a waiting window has independent actionable work, while INDEX DRIFT exists, or while E1–E8 has unprepared local work.
