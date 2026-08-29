# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30
Repository: `Report-Engainall/Report-Advisor`
Branch: `parallel/20-stage-release-readiness`
Current branch HEAD at this update: `57dd0d19cedb2951708a87da2f5fbeb0f6c730fb`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Baseline
- Protected certification candidate: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- This branch is a justified release-readiness orchestration track from the current watched-folder hardening line.
- Certification remains blocked until exact-head CI, deployment, runtime and live evidence are proven.

## Current execution cycle — 2026-08-30
### 20-stage parallel release-readiness gate
Added `scripts/check-20-stage-release-readiness.mjs` and exposed it as `npm run test:20-stage-readiness`.

The gate executes twenty existing repository-native contracts with bounded parallelism (default 5 workers), records each stage independently, preserves stage output on failure, and fails closed when any stage fails.

Stages:
1. Build/typecheck
2. Lint
3. Architecture contracts
4. Auth/tenant convergence
5. Global tenant RLS
6. Migration schema audit
7. Migration dependency analysis
8. Import direct-write security
9. Import transaction contract
10. Import runtime governance
11. File-engine capability
12. Schema intelligence
13. Document intelligence closure
14. Data-quality projections
15. Consolidated business intelligence
16. Decision intelligence closure
17. Cross-platform watched-folder capability
18. Production readiness
19. Production scale
20. Production release blockers

Implementation commit: `ec220f7e3e205f8f37a992e2a1c79ad27947cebc`.
Package script exposure commit: `57dd0d19cedb2951708a87da2f5fbeb0f6c730fb`.

Disposition: `IMPLEMENTED → EXACT-HEAD CI REQUIRED → RUNTIME/LIVE EVIDENCE STILL REQUIRED`.

### Prior watched-folder hardening retained
- Persistent browser folder-handle store added with IndexedDB.
- Native Windows watcher path authority, relative-path IPC, realpath containment and partial-write stability guard remain in force.
- Renderer hook dependency hardening remains recorded from `854ba26032a23b353cbdcd59654fd56de5b7360a`.

## Evidence from preceding exact-head CI
Run `33274307097` failed at Typecheck and Build on the previous watched-folder merge-ref because `@/lib/import/folder-handle-store` was absent; downstream performance budget failure was caused by missing build output. Broad security, tenant, intelligence, import and production contract gates passed.

This is historical evidence only and is not promoted to the new branch/head.

## 20-stage execution policy
- Parallelism is bounded to avoid saturating the runner.
- Each command is an existing repository-native contract; the orchestrator does not invent business assertions.
- A stage is `PASS` only when its process exits zero on the exact invocation.
- Any non-zero stage causes overall `NOT PROVEN` and preserves the tail of its output for diagnosis.
- The orchestrator does not mutate production data, secrets, migrations, auth configuration or tenant state.
- Runtime/LIVE requirements remain separate from static/contract execution.

## Parallel remaining fronts
### Front A — Canonical Data Truth
Full compatibility consumer graph; NULL/UNKNOWN semantics; date/status/as-of consistency; browser aggregation elimination.

### Front B — Consumer + Legacy Closure
Zero-consumer proof; duplicate business engines; DB-only legacy candidates.

### Front C — BI / Decision / Export
Cross-surface equivalence; forecast/demand velocity/inventory intelligence; export metric/date/status/as-of/filter equivalence.

### Front D — Security / Tenant
RPC grants/search_path/RLS; Storage/Realtime/AI-vector; workers/notifications/generated files.

### Front E — Performance
Unbounded reads; query plans/indexes; N+1; payload bounds.

### Front F — Reliability
Worker/watcher/queue/retry/idempotency/DLQ/recovery; backup/restore/RPO/RTO.

### Front G — Runtime/LIVE
Authenticated E2E; Supabase A/B isolation; OCR corpus; native watcher; telemetry; load/canary/rollback.

## Current exact status
- 20-stage orchestration: `IMPLEMENTED`.
- 20-stage exact-head execution on this new branch: `NOT PROVEN`.
- Exact-head CI for previous watched-folder head: `FAIL` (historical, not promoted).
- Windows installer: `NOT PROVEN`.
- Real Windows install/run: `NOT PROVEN`.
- Real Onyx/export → watched folder → import → DB → analytics → UI: `NOT PROVEN`.
- Independent real-data reconciliation: `NOT PROVEN`.
- Production certification: `NO`.

## Required next cycle
1. Execute the new 20-stage gate on the exact branch/head.
2. Triage every failing stage by root cause, not symptom.
3. Apply only evidence-justified canonical fixes.
4. Re-run the affected stage and the full 20-stage gate.
5. Verify Windows artifact and real runtime separately.
6. Continue security, data truth, BI/export, reliability and runtime evidence in parallel.
7. Update this index after every material cycle.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
