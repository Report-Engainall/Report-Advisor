# Autonomous Execution Enforcement Protocol — v3.2

This contract strengthens `docs/MASTER_EXECUTION_INDEX.md` without deleting or rewriting historical ledger entries.

## Mandatory enforcement rules

### E-01 — Parallelism before reporting
If an independent safe executable front exists while another front is waiting on CI or an external dependency, execute the independent front before returning a report.

### E-02 — NEXT+1 / NEXT+2 consumption
When NEXT+1 or NEXT+2 is deterministic and actionable in the same execution context, execute it in the same continuous mission. A completed NEXT item is not a reporting boundary.

### E-03 — Blocker isolation
An external blocker is scoped only to the capability that actually requires it. It MUST NOT stop unrelated local security, database/RPC, tests, evidence, release preparation, or handoff work.

### E-04 — Discovery is not closure
A finding is not closed by discovery or documentation. Where actionable, closure requires RCA → FIX → targeted test → test-of-test where applicable → adversarial regression → regression → rescan.

### E-05 — Gate integrity
Checker drift must be classified as STALE CONTRACT versus REAL PRODUCT DEFECT. Stale contracts are aligned to canonical implementation without weakening assertions; canonical-path and decoy/bypass tests are mandatory.

### E-06 — Exact-SHA evidence boundary
Every mutation creates a new evidence boundary. PASS, artifacts, runtime evidence, and certification claims from an older SHA MUST NOT be promoted to a newer SHA.

### E-07 — Runtime truth separation
Static, mocked, deterministic, and source-level capability evidence MUST NOT be represented as live runtime proof. Backup, restore, RPO, RTO, rollback, DR, authenticated E2E, and live tenant isolation remain unproven until their real operational evidence exists.

### E-08 — Test-of-test requirement
For security- and certification-critical checks, verify both the canonical valid path and at least one decoy/bypass/malformed path that the checker must reject.

### E-09 — Remaining-work accounting
Execution progress is measured by resolved capability/evidence/certification gaps, not commit count, line count, or index updates.

### E-10 — Index governance
The master index remains append-only historical ledger + live state map + execution contract. Current-state edits must preserve historical SHA/RCA/evidence/blocker records.

### E-11 — True-stop gate
`TRUE STOP` is allowed only after safe local work, parallel work, NEXT/NEXT+1/NEXT+2, adversarial checks, regression, rescan, exact-head verification, index update, execution-debt review, external blocker isolation, executable handoff preparation, and waiting-window exhaustion are exhausted.

### E-12 — Automatic protocol evolution
When execution exposes a repeatable under-execution pattern, add a stronger enforcement rule, preserve the prior history, test the new enforcement path where practical, and apply it immediately.

### E-13 — Behavioral enforcement matrix
The contract must explicitly reject execution behavior that stops early even when work remains. The following cases are mandatory and are executable test inputs, not prose-only examples:

CASE A: CI waiting + independent task exists → MUST NOT stop.
CASE B: NEXT complete + NEXT+1 executable → MUST NOT stop.
CASE C: NEXT+1 complete + NEXT+2 executable → MUST NOT stop.
CASE D: one external blocker + unrelated local work exists → MUST NOT stop unrelated work.
CASE E: discovery made + executable fix exists → MUST NOT report discovery-only closure.
CASE F: mutation made + adversarial test missing → MUST NOT declare closure.
CASE G: new SHA + old evidence → MUST reject evidence transfer.
CASE H: index updated + no capability progress → MUST NOT count as execution closure.

### E-14 — Execution Debt zero-gate
`EXECUTION DEBT` records actionable but not executed work, skipped parallel work, skipped NEXT+1/NEXT+2, deferred adversarial/test-of-test work, and known executable follow-ups. `EXECUTION DEBT = 0` is mandatory for TRUE STOP when the debt is locally executable. External blockers do not erase execution debt for unrelated local work.

### E-15 — Release Velocity truth metric
`RELEASE VELOCITY` measures closure movement across `Built`, `Integrated`, `Verified`, `Runtime Proven`, and `Production Certified`. Commits, lines changed, documentation updates, and report count are not velocity. A cycle that does not reduce Remaining Work or increase valid evidence/certification readiness must expose zero closure velocity.

### E-TIME — Waiting-Time Parallelization
When any asynchronous operation is running, including CI, Quality, Final Batch, build, deployment, workflow, test, API request, external verification, or similar operation, elapsed time is an execution window. If independent actionable work exists, it MUST be executed before returning or waiting for the asynchronous result. `waiting for CI`, `waiting for test`, `waiting for deployment`, and `waiting for workflow` MUST NOT be stop conditions while independent actionable work exists. When the asynchronous operation completes, its result MUST be consumed immediately and execution MUST continue.

### E-MAX — Maximum Safe Parallelism
At every execution point, schedule the maximum number of independent safe actionable tasks without creating conflicting mutations, races, unsafe shared-file writes, or ambiguous evidence lineage. Tasks sharing a mutation chain or exact-head dependency MUST run sequentially. Independent tasks MUST be treated as parallel-ready.

### E-SCHED — Dependency-Aware Scheduling
The execution scheduler MUST track each task as `TASK`, `DEPENDENCY`, `STATE`, `PARALLEL?`, `BLOCKER`, `CAN START NOW?`, and `EXPECTED UNLOCK`. `READY + INDEPENDENT = EXECUTE NOW`. External blockers isolate only the dependent task; preparation and independent validation remain executable.

### E-INDEX-HEAD — Current-Head Index Gate
If the live index current exact HEAD differs from the repository current exact HEAD, the state is `INDEX DRIFT`. The index MUST be refreshed while preserving all historical ledger entries. `INDEX DRIFT` forbids TRUE STOP and certification readiness until reconciled and verified.

### E-DEBT — Actionable vs External Debt
Execution debt MUST distinguish `ACTIONABLE DEBT` from `EXTERNAL DEBT`. Actionable debt MUST be executed. External debt MUST be isolated, prepared where possible, and documented; it MUST NOT suppress unrelated actionable work.

### E-UTIL — Execution Utilization
Release Velocity accounting MUST expose async operations running, parallel work executed, parallel work available, execution debt closed, and remaining work reduced. Waiting time with available independent work but zero execution is an under-utilization condition, not progress.

### E-EVOLVE — Automatic Protocol Evolution
When execution reveals a repeatable protocol weakness, the agent MUST `OBSERVE → RCA → DEFINE NEW RULE → UPDATE INDEX → ADD ENFORCEMENT → ADD TEST → ADD TEST-OF-TEST → ADVERSARIAL → REGRESSION → RESCAN`, then apply the rule immediately. This rule is itself permanent v3.x behavior.

## Current application

The 2026-09-02 execution sweep identified that asynchronous runtime can conceal unused execution capacity. v3.2 therefore makes waiting-time parallelization, maximum safe parallelism, dependency-aware scheduling, index-current-head enforcement, actionable/external debt separation, utilization accounting, and automatic protocol evolution explicit mandatory controls. The live master index remains the authoritative execution map; this file is the durable enforcement contract it references.
