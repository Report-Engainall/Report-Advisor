# Report Advisor — Master Execution & Truth Index

## CURRENT RESUME EXECUTION MAP — 2026-09-03 — v4.25 / OWNER-LAST-MILE EXECUTION MATRIX

> This file is the authoritative current execution index. Historical execution records remain preserved in Git history and dated execution/evidence documents. No evidence crosses an exact-SHA boundary.
>
> **Operating objective:** minimize owner/device work. The assistant must execute every repository, database, security, contract, evidence-preparation, CI, and code task that is executable through connected tooling before requesting any owner action. Owner/device work is reserved only for operations that inherently require the owner's credentials, real interactive authentication, protected production/recovery control-plane access, or an unavailable external control-plane setting.

### CURRENT PROJECT STATE
- Repository: `Report-Engainall/Report-Advisor`.
- Current repository index boundary head: `addadd47968d8801d810c12ec577243206833534` (documentation/evidence-only commit after the worker fix).
- Current code/test candidate: `0d0ad3d07a62132c4ee411894869c743c3fceafa`.
- The repository may advance through governed documentation/evidence-only synchronization commits; product code/test candidate remains `0d0ad3...` unless a later real code/test mutation is proven.
- Prior security defect: five SECURITY DEFINER trust/governance helpers used `SET search_path TO 'pg_catalog'` while referencing application relations without schema qualification, producing runtime `42P01 relation-not-found` failures. Fixed in `5dbf20...`.
- Current worker defect: `fail_report_execution_job` unconditionally wrote `status='failed'` even when `attempt >= max_attempts`, preventing durable DB `dead_letter` state. Fixed in `0d0ad3...` and applied live.
- Exact-head CI must be consumed only for the current code/test candidate or a verified index-only boundary.

### 2026-09-02 SECURITY DEFINER SEARCH-PATH CLOSURE WAVE
- Live audit confirmed all public SECURITY DEFINER functions use locked `pg_catalog` search paths; five trust/governance helpers had unqualified application relations.
- Applied migration: `supabase/migrations/20260902231600_reconcile_security_definer_search_path_qualification.sql`.
- Commit: `5dbf20f4f376896a58f9e8110b9fc813b5069967`.
- Historical exact-candidate Quality `33678527913` passed; repository/index synchronization runs `33678779951`, `33678779980`, `33678779994`, `33678780020` passed on the then-governed boundary.
- These older runs do not certify the current worker-fix candidate.

### 2026-09-03 WORKER DURABLE DEAD-LETTER CLOSURE
- Live `public.report_execution_jobs` contains explicit `dead_letter` status support, `attempt`/`max_attempts` checks, tenant FK, unique `(company_id, job_key)`, and a ready-job index.
- Live worker RPCs include claim, heartbeat, checkpoint, complete, fail, and retry operations.
- Root cause: later lifecycle migration `20260901005857_report_execution_worker_lifecycle.sql` replaced the hardened failure transition with unconditional `status='failed'` behavior.
- Forward fix: `supabase/migrations/20260903160000_restore_report_execution_dead_letter_terminal_transition.sql`.
- Fix preserves structured error evidence, rejects null/non-object errors, writes `dead_letter` at `attempt >= max_attempts`, clears lease ownership, retains locked `pg_catalog` search_path, and restricts execution to `service_role`.
- Live rollback-safe test: `max_attempts=1` claim→fail produced `dead_letter`; retry returned false.
- Live rollback-safe test: `max_attempts=2` claim→fail produced `failed`; retry returned true and restored `queued`; null error payload was rejected.
- Repository regression: `scripts/report-execution-worker-db-contract.test.ts` guards the terminal transition, evidence preservation, search_path, and privilege boundary.
- Existing in-memory adversarial regression covers idempotency, lease exclusivity, fencing, expiry, token rotation, retry counts, and dead-letter non-reclaimability.
- Evidence: `docs/EVIDENCE/2026-09-03_WORKER_LIFECYCLE_CLOSURE_BATCH.md`.

### EXACT-HEAD CI RECONCILIATION
- Worker-fix code/test head: `0d0ad3d07a62132c4ee411894869c743c3fceafa`.
- Enforcement run `33695209255` checked out exact worker-fix head but failed only because the index still referenced `5dbf20...`; this was index drift, not a product regression.
- Evidence synchronization commit `9959aa...` followed the worker fix; the index then tracked that repository boundary while preserving the code/test candidate `0d0ad3...`.
- Fresh index-only boundary CI on `ab4f25c63f4f8c63504f9692927a701192a49349`: Quality run `33695341291` **SUCCESS**; Final Execution Batch run `33695341243` **SUCCESS**.
- Quality verification completed all release-readiness, worker lifecycle, production certification evidence-integrity, operational resilience, typecheck, regressions, lint, build, performance-budget, scale, and intelligence/production contract steps successfully at the governed index boundary.
- The successful CI boundary does not upgrade live authenticated runtime, production binding, backup/restore, rollback, or DR evidence.
- Windows Desktop exact-head evidence remains separately tracked.

### LIVE DATABASE / SECURITY TRUTH
- Live Staging: 78/78 public tables have RLS; 147 policies; 0 policies targeting `anon`; 0 policies targeting `PUBLIC`; no broad anonymous EXECUTE exposure in the audited SECURITY DEFINER surface.
- Live worker terminal failure lifecycle is now runtime-proven at the DB boundary.
- Storage has tenant-path/owner-aware authenticated policies; runtime remains UNPROVEN and no canonical bucket contract was found, so no speculative bucket was created.
- Prior Auth evidence does not equal authenticated E2E certification.
- Leaked-password protection remains an owner/control-plane item because connected tooling cannot mutate that setting.

### RESILIENCE / DEPLOYMENT TRUTH
- Backup/restore contracts enforce safe non-production targets, HTTPS-only transport, no URL credentials, no redirects, bounded timeout, private-target rejection, and fail-closed DNS resolution.
- Rollback readiness validates exact ownership/READY state and forbids production drills.
- Previous production deployment `dpl_5quRUVs6BZwSRTbhcvZQySGGm8mG` was READY on old candidate `5dbf20...`; it is now stale relative to `0d0ad3...`.
- Production binding is **STALE / NOT CERTIFIED** until current-candidate deployment evidence is established.
- Backup, restore, RPO/RTO, rollback, and forward recovery/DR remain UNPROVEN until real exact-candidate operational evidence exists.

### EXACT-SHA / EVIDENCE RULES
- Exact SHA is mandatory for certification evidence.
- CI PASS proves repository gates only; it does not prove live authenticated runtime, Tenant A/B isolation, backup/restore, RPO/RTO, rollback, DR, or Production binding.
- `UNPROVEN` remains `UNPROVEN` until real operational evidence is captured and consumed.
- No mocks, fixtures, static checks, or documentation are promoted to LIVE evidence.
- No production alias mutation, restore, rollback, or secret fabrication is permitted merely to close a gate.
- An index-only synchronization commit never changes the code/test candidate and never inherits or upgrades runtime/production evidence.

# OWNER-LAST-MILE EXECUTION MATRIX — MANDATORY HANDOFF

## A. Rule: assistant does everything executable first
1. Repository/code inspection, sibling-consumer sweeps, root-cause analysis, safe fixes, tests, regressions, migrations, evidence preparation.
2. GitHub branch/PR/CI inspection, exact-head comparisons, workflow/log/artifact consumption, governed index synchronization.
3. Supabase schema/RPC/RLS/security-definer/storage/database inspection and safe mutations.
4. Vercel deployment/configuration/log/runtime inspection and safe authorized mutations.
5. Runtime plans, scripts, datasets, evidence collectors, exact-SHA packaging.
6. Backup/restore/rollback readiness that does not require protected production credentials.
7. Classify remaining blockers as INTERNAL ACTIONABLE, OWNER REQUIRED, or EXTERNAL OPERATIONAL BLOCKER.

## B. OWNER DEVICE ACTIONS — ONLY THESE ARE EXPECTED
### B1. Authenticated E2E / Tenant A-B
- Real authorized Tenant A/B credentials and isolated browser sessions.
- Preserve evidence IDs; never paste secrets.
- Required proof: authenticated session + A/B adversarial matrix + exact deployed SHA.

### B2. Supabase Auth control-plane
- Open correct project → Auth/security → enable leaked-password protection → save → return non-secret state.

### B3. Backup / Restore / DR
- Create approved backup, restore only to isolated non-production, capture artifact/hash/timings/integrity/RPO/RTO, never overwrite production.

### B4. Rollback / Forward Recovery
- Only under approved controlled drill; capture exact deployment IDs, timestamps, READY/health state and forward-recovery result; no unapproved alias mutation.

### B5. Windows Desktop evidence
- Only if exact-head Windows evidence cannot be consumed: checkout exact SHA, run documented verification, no dependency changes, return logs/artifact.

### B6. Protected production/deployment authorization
- Authenticate locally and approve only the exact operation named by the assistant; return non-secret IDs/status.

## C. ASSISTANT EXECUTION — MUST BE DONE WITHOUT OWNER
- Read protocol/index; rescan; FIND → CLASSIFY → RCA → FIX → TEST → REGRESSION → EXACT-HEAD CI → RUNTIME → LIVE EVIDENCE → INDEX UPDATE → RESCAN.
- Sweep NULL/UNKNOWN/MISSING/EMPTY/ZERO/INSUFFICIENT_DATA/BLOCKED/LOW/PASS/FAIL semantics.
- Continue worker/queue, watched folder, canonical/RPC parity, UI/export parity, OCR, performance, product acceptance, Electron/Windows and production readiness.
- Continue RLS/SECURITY DEFINER/storage/realtime/AI-vector checks.
- Prove worker start→lease→heartbeat→crash→expiry→retry→duplicate→fencing→checkpoint→DLQ→recovery where executable.
- Verify bounded queries, EXPLAIN plans, pagination, N+1, large-tenant behavior, concurrency and report generation.
- Prepare backup/restore/rollback evidence without claiming certification before real evidence.
- Keep CI, regression, runtime, and production certification separate.

## D. OWNER HANDOFF GATE
- Exact requirement identified.
- Assistant-executable work exhausted.
- Remaining operation genuinely needs owner credentials, interactive browser auth, protected control plane, or unavailable setting.
- Exact action sequence, expected evidence, and abort/rollback condition are known.
- One bounded owner batch only.

## E. OWNER BATCH ORDER
### O1 — Authentication + Auth control plane
- Real Tenant A/B sessions and leaked-password control.
### O2 — Runtime evidence
- Authenticated E2E, Tenant A→B adversarial matrix, Storage/Realtime browser checks if contractually required.
### O3 — Resilience
- Backup, isolated restore, integrity, RPO/RTO, authorized rollback/forward recovery if separately approved.
### O4 — Desktop / protected deployment
- Windows exact-head verification and unavoidable protected authorization.

## F. CURRENT OWNER ACTION QUEUE
| ID | Owner action | Why owner is required | Assistant prerequisite | Evidence returned | State |
|---|---|---|---|---|---|
| OWNER-AUTH-01 | Real authenticated Tenant A/B sessions | Interactive real credentials/session | Harness + exact target ready | Authenticated E2E + A/B evidence | **OWNER REQUIRED** |
| OWNER-AUTH-02 | Enable leaked-password protection | Auth control-plane unavailable to tools | Correct project/control identified | Non-secret enabled state | **OWNER REQUIRED** |
| OWNER-RUN-01 | Authenticated E2E + tenant adversarial matrix | Real browser session | Test plan + target ready | Run/evidence artifact | **OWNER REQUIRED** |
| OWNER-DR-01 | Backup + isolated restore | Protected recovery operation | Safety contract ready | Backup/restore/integrity/RPO/RTO | **OWNER REQUIRED / CONDITIONAL** |
| OWNER-DR-02 | Rollback + forward recovery | Protected deployment authorization | Drill contract ready | Deployment IDs + health + timings | **OWNER REQUIRED / CONDITIONAL** |
| OWNER-WIN-01 | Windows exact-head verification | May require local Windows runtime | Exact SHA + command ready | Exact-SHA logs/artifact | **OWNER REQUIRED / CONDITIONAL** |
| OWNER-PROD-01 | Unavoidable protected production authorization | Platform permission boundary | Exact safe operation identified | Non-secret result | **OWNER REQUIRED / CONDITIONAL** |

## G. CURRENT ASSISTANT-FIRST QUEUE
1. Consume fresh exact-head CI for `0d0ad3...` after index synchronization.
2. Consume/locate fresh Windows Desktop evidence.
3. Continue RPC/signature/security-definer/sibling-consumer audit.
4. Continue production runtime forensic checks and stale deployment evidence handling.
5. Continue Authenticated E2E and Tenant A/B evidence preparation.
6. Continue storage/realtime/AI-vector executable tests.
7. Continue worker/queue recovery closure.
8. Continue semantic truth and cross-surface equivalence sweeps.
9. Continue performance/scale verification.
10. Continue resilience evidence preparation.
11. Continue OCR/document golden-corpus/source closure.
12. Continue UI/export parity/product acceptance.
13. Continue production readiness checks.
14. Rescan after every closure.

## H. CERTIFICATION STATES — FAIL CLOSED
- **PASS** = directly proven at stated boundary.
- **IMPLEMENTED** = exists, not necessarily runtime-proven.
- **REGRESSION-PROVEN** = automated regression only.
- **RUNTIME-PROVEN** = real runtime at exact relevant SHA/environment.
- **PRODUCTION-PROVEN** = real production evidence at exact relevant SHA/environment.
- **UNPROVEN** = required evidence absent.
- **OWNER REQUIRED** = genuinely needs owner/device capability.
- **EXTERNAL BLOCKER** = external dependency; independent work continues.
- **NOT CERTIFIED** = certification threshold not met.

## CERTIFICATION STATUS — FAIL CLOSED
| Gate | State | Reason |
|---|---|---|
| Repository quality | **PASS — EXACT INDEX BOUNDARY** | Quality run `33695341291` succeeded on `ab4f25...` |
| Release deterministic gates | **PASS — EXACT INDEX BOUNDARY** | Final Execution Batch `33695341243` succeeded on `ab4f25...` |
| Execution enforcement contract | **PASS — EXACT INDEX BOUNDARY** | Fresh Quality run succeeded after index synchronization |
| Storage tenant isolation contract | **PASS — EXACT INDEX BOUNDARY** | Covered by fresh Quality run |
| Worker durable dead-letter lifecycle | **LIVE-RUNTIME-PROVEN** | Terminal + retryable branches tested in live rollback-safe transactions |
| Windows desktop | **PENDING CONSUMPTION** | Exact-head evidence not consumed |
| Work Item Actionability Guard | **PASS — EXACT INDEX BOUNDARY** | Fresh Quality run succeeded |
| Production runtime | **STALE / REQUIRES CURRENT-CANDIDATE DEPLOYMENT** | Old deployment is `5dbf20...` |
| Authenticated E2E | **UNPROVEN / OWNER REQUIRED** | Real browser evidence required |
| Live Tenant A/B isolation | **UNPROVEN / OWNER REQUIRED** | Real two-tenant runtime evidence required |
| Backup | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Real artifact required |
| Restore | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Real non-production restore required |
| RPO / RTO | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Real timings required |
| Rollback | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Authorized real drill required |
| Forward recovery / DR | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Real operational environment required |
| Production binding | **STALE / NOT CERTIFIED** | Current candidate differs from prior deployment |
| Auth leaked-password protection | **OPEN — OWNER REQUIRED / PRO PLAN** | Control-plane setting unavailable; user verified Pro requirement |
| Final certification | **BLOCKED** | Live operational evidence and protected owner actions remain |

## I. EXECUTION PROTOCOL — ALWAYS ROTATE
`READ PROTOCOL → READ INDEX → READ CURRENT EXACT STATE → RESCAN → FIND → CLASSIFY → ROOT CAUSE → FIX → TEST → REGRESSION → EXACT-HEAD CI → RUNTIME → LIVE EVIDENCE → INDEX UPDATE → RESCAN`

- `PENDING ≠ DONE`.
- `REPORT ≠ COMPLETION`.
- `CI PASS ≠ Runtime`.
- `Runtime ≠ Production Certification`.
- `Production deployment ≠ Production certification`.
- Work first, report last.

### NEXT EXECUTION FRONT
1. Consume/verify Windows Desktop evidence where accessible.
2. Continue Supabase RPC/security-definer and sibling-consumer audit.
3. Continue current-candidate production/runtime readiness.
4. Continue Authenticated E2E/Tenant A-B owner prerequisite hardening.
5. Continue storage/realtime/AI-vector executable checks.
6. Continue resilience, OCR, UI/export, semantic truth, performance/scale, and product acceptance fronts.
7. Rescan after every closure.
