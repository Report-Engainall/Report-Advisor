# Report Advisor — Master Execution & Truth Index

## CURRENT RESUME EXECUTION MAP — 2026-09-03 — v4.27 / PARALLEL CLOSURE EXECUTION

> This file is the authoritative current execution index. Historical execution records remain preserved in Git history and dated execution/evidence documents. No evidence crosses an exact-SHA boundary.
>
> **Operating objective:** minimize owner/device work. The assistant must execute every repository, database, security, contract, evidence-preparation, CI, and code task that is executable through connected tooling before requesting any owner action. Owner/device work is reserved only for operations that inherently require the owner's credentials, real interactive authentication, protected production/recovery control-plane access, or an unavailable external control-plane setting.

### CURRENT PROJECT STATE
- Repository: `Report-Engainall/Report-Advisor`.
- Current repository index boundary head: `c346e23a64d96125264fae849964b60b0f96c15f` (latest governed main boundary; the candidate includes the canonical frozen-index governance enforcement hardening).
- Current code/test candidate: `c346e23a64d96125264fae849964b60b0f96c15f`.
- The repository may advance through governed documentation/evidence-only synchronization commits. Latest real code/test mutation is the governance enforcement hardening at `c346e23a64d96125264fae849964b60b0f96c15f`; subsequent index-only commits must not inherit runtime/production evidence.
- Prior security defect: five SECURITY DEFINER trust/governance helpers used `SET search_path TO 'pg_catalog'` while referencing application relations without schema qualification, producing runtime `42P01 relation-not-found` failures. Fixed in `5dbf20...`.
- Worker defect: `fail_report_execution_job` unconditionally wrote `status='failed'` even when `attempt >= max_attempts`, preventing durable DB `dead_letter` state. Fixed in `0d0ad3...` and applied live.
- Import defect: progress counters could regress under stale/replayed worker updates. Fixed by monotonic `GREATEST` semantics in `20260903190000_harden_import_progress_monotonicity.sql` and verified by rollback-safe regression testing.
- Decision/Recommendation defect: singular bidirectional links lacked one-to-one DB enforcement and overwrite/race guards. Fixed in `20260903200500_harden_decision_recommendation_one_to_one_atomic_link.sql` and applied live.
- Approval defect: `CANCELLED` was in the status domain but excluded by `approval_status_consistency`, making the declared terminal state impossible to represent. Fixed in `20260903201500_reconcile_decision_approval_cancelled_consistency.sql` and applied live.
- Exact-head CI must be consumed only for the current code/test candidate or a verified index-only boundary.

### 2026-09-02 SECURITY DEFINER SEARCH-PATH CLOSURE WAVE
- Live audit confirmed all public SECURITY DEFINER functions use locked `pg_catalog` search paths; five trust/governance helpers had unqualified application relations.
- Applied migration: `supabase/migrations/20260902231600_reconcile_security_definer_search_path_qualification.sql`.
- Commit: `5dbf20f4f376896a58f9e8110b9fc813b5069967`.
- Historical exact-candidate Quality `33678527913` passed; repository/index synchronization runs `33678779951`, `33678779980`, `33678779994`, `33678780020` passed on the then-governed boundary.
- These older runs do not certify the current candidate.

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

### 2026-09-03 DECISION / RECOMMENDATION CARDINALITY CLOSURE
- Canonical schema shape is singular on both sides: `recommendations.decision_id` and `business_intelligence_decisions.recommendation_id`, with same-tenant composite foreign keys and a bidirectional link RPC.
- Pre-fix live audit found no unique constraint on either nullable link and demonstrated that the RPC could overwrite an existing recommendation→decision relationship.
- Live duplicate scan was clean before hardening: 0 duplicate `(company_id,decision_id)` groups and 0 duplicate `(company_id,recommendation_id)` groups.
- Forward fix: `supabase/migrations/20260903200500_harden_decision_recommendation_one_to_one_atomic_link.sql`.
- Fix adds partial unique indexes on both nullable link columns, locks both target rows, rejects conflicting existing links, preserves tenant scoping, and updates both directions atomically.
- Live transactional adversarial probe: same-pair replay succeeds idempotently; attempting to move an already-linked recommendation to a different decision is rejected with `RECOMMENDATION_ALREADY_LINKED` and the transaction is rolled back.
- No persistent synthetic fixture remains.

### 2026-09-03 APPROVAL CANCELLED CONSISTENCY CLOSURE
- Live status domain explicitly contained `PENDING|APPROVED|REJECTED|CANCELLED` while the consistency check only permitted `PENDING|APPROVED|REJECTED`.
- No public cancellation RPC exists; therefore no new cancellation authority was invented.
- Forward fix: `supabase/migrations/20260903201500_reconcile_decision_approval_cancelled_consistency.sql`.
- `CANCELLED` is now treated as terminal and requires `decided_at` + `decided_by`, matching terminal provenance semantics.
- Live rollback-safe probe successfully represented the existing Tenant B approval as `CANCELLED` with provenance, then rolled back with no persistent mutation.
- Authority/RBAC remains a contract question: `decide_approval()` has self-approval protection but no explicit role/authority check, and canonical role authority has not been proven. No speculative RBAC mutation was made.

### 2026-09-03 CONTINUOUS-TRUST / IMPORT TERMINAL-RESURRECTION TEST HARDENING
- Added adversarial test-of-test coverage for continuous-trust runtime persistence: canonical `tenant_isolation_canary_runs` is accepted and a deliberately weakened/missing table reference is rejected.
- Commits: `cbebc6a6c6cda2f26b9132f938578db7283aa93c` and `f20c4d3555ced5d831421f7e92aa5ca3f292fb77`.
- Hardened import lifecycle regression coverage against terminal-job progress resurrection; canonical terminal guards are now locked into the regression contract. Commits: `7404809a9915207b4d148e951b00f7b226d50e4f`, `da8fd13346fa40e8d2572b2cf4d5cafb39071c13`, `8ff964c1cbd9971c46e591f65435d9ba99a74d73`, `ecfb8b9619a66a236ac81211c867f5b3280fe048`.
- Governance enforcement was then corrected so the frozen Index boundary is validated by ancestry rather than requiring equality with the candidate. Commit: `c346e23a64d96125264fae849964b60b0f96c15f`.
- This closes governance/index false-blocking without upgrading any runtime or production evidence.

### 2026-09-03 LIVE STAGING RESCAN — CURRENT FACTS
- Direct live schema inspection of `Report-Advisor-P0-2-Staging` confirms the certification/recovery tables exist and RLS is enabled on the audited public tables.
- Direct count probe: `public.companies = 2`; `production_certification_bundles = 0`; `production_rollback_drills = 0`; `backup_verification_runs = 0`; `tenant_isolation_canary_runs = 0`.
- Therefore certification evidence rows are not present yet; Backup/Restore, Rollback, and persisted tenant-isolation canary evidence remain unproven at the live-evidence layer.
- This does not invalidate previously completed tenant-isolation contract/adversarial tests; it distinguishes contract/runtime proof from persisted certification evidence.

### EXACT-HEAD CI RECONCILIATION
- Current real code/test candidate: `c346e23a64d96125264fae849964b60b0f96c15f`.
- The earlier enforcement failure was governance/index drift; the canonical frozen-index lifecycle has now been hardened to accept an indexed ancestor boundary rather than requiring candidate equality.
- Final Execution Batch run `33702718971` succeeded on exact `35722f35...` (historical candidate evidence; not current-candidate certification).
- Storage tenant isolation run `33702718911` succeeded on exact `61e8af9...` (historical candidate evidence; not current-candidate certification).
- Fresh Quality for current `c346e23a...` has not been consumed; therefore Repository Quality is **NOT CERTIFIED** for the current candidate.
- Index synchronization is intentionally separate from the code/test candidate and must not inherit runtime/production evidence.

### TENANT ISOLATION TRUTH — DO NOT REGRESS TO 'UNPROVEN' GENERICALLY
- Tenant isolation has already been proven at the contract/DB adversarial boundary in the prior closure work; do not reopen the completed isolation implementation as a generic blocker.
- Remaining gap is specifically **live authenticated browser / persisted certification evidence at the current deployed SHA**, not rebuilding RLS or repeating already-closed DB isolation work.

### LIVE DATABASE / SECURITY TRUTH
- Live Staging: 78/78 public tables have RLS; 147 policies; 0 policies targeting `anon`; 0 policies targeting `PUBLIC`; no broad anonymous EXECUTE exposure in the audited SECURITY DEFINER surface.
- Live worker terminal failure lifecycle is runtime-proven at the DB boundary.
- Import progress is monotonic and row-locked; terminal finish is row-locked and rejects terminal replay.
- Decision/Recommendation link uniqueness and overwrite protection are now live.
- Approval `CANCELLED` consistency is now live.
- Storage has tenant-path/owner-aware authenticated policies; runtime remains UNPROVEN and no canonical bucket contract was found, so no speculative bucket was created.
- Prior Auth evidence does not equal authenticated E2E certification.
- Leaked-password protection remains an owner/control-plane item because connected tooling cannot mutate that setting.

### RESILIENCE / DEPLOYMENT TRUTH
- Backup/restore contracts enforce safe non-production targets, HTTPS-only transport, no URL credentials, no redirects, bounded timeout, private-target rejection, and fail-closed DNS resolution.
- Rollback readiness validates exact ownership/READY state and forbids production drills.
- Deployment `dpl_65UFrrkVWzprvKddupoHPbQBnp9b` is READY for the prior candidate `0cd6f5...`; it is stale relative to current `35722f35...`.
- Production binding is **STALE / NOT CERTIFIED** until a current-candidate deployment is established and verified.
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
1. Repository/code inspection, sibling-consumer sweeps, root-cause analysis, safe fixes, tests, regressions, migrations, evidence preparation, CI, and governed index synchronization.
2. GitHub branch/PR/CI inspection, exact-head comparisons, workflow/log/artifact consumption.
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
1. Consume fresh exact-head Quality/CI for `61e8af9...` after governed index synchronization.
2. Consume/locate fresh Windows Desktop evidence.
3. Continue RPC/signature/security-definer/sibling-consumer audit.
4. Continue production runtime forensic checks and current-candidate deployment evidence.
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
| Repository quality | **NOT CERTIFIED** | Fresh Quality run for current `c346e23a...` not yet consumed |
| Release deterministic gates | **HISTORICAL PASS** | Final Execution Batch `33702718971` succeeded on prior `35722f35...`; current candidate still needs fresh exact-head consumption |
| Execution enforcement contract | **IMPLEMENTED / CURRENT CANDIDATE** | Frozen-index ancestry validation hardened at `c346e23a...`; fresh CI consumption still required |
| Storage tenant isolation contract | **PASS — HISTORICAL EXACT HEAD** | Run `33702718911` succeeded on `61e8af9...`; re-consumption at current candidate not yet certified |
| Worker durable dead-letter lifecycle | **LIVE-RUNTIME-PROVEN** | Terminal + retryable branches tested in live rollback-safe transactions |
| Decision/Recommendation one-to-one link | **LIVE-RUNTIME-PROVEN** | Unique indexes live; conflicting reassignment rejected in transactional adversarial probe |
| Approval CANCELLED consistency | **LIVE-RUNTIME-PROVEN** | Terminal state with provenance accepted in rollback-safe probe |
| Windows desktop | **PENDING CONSUMPTION** | Exact-head evidence not consumed |
| Production runtime | **STALE / REQUIRES CURRENT-CANDIDATE DEPLOYMENT** | Existing READY deployment is for an older candidate; current `c346e23a...` is not yet production-certified |
| Authenticated E2E | **UNPROVEN / OWNER REQUIRED** | Real browser evidence required at current deployed SHA |
| Live Tenant A/B isolation | **CONTRACT-PROVEN / LIVE BROWSER UNPROVEN** | DB/contract isolation is closed; remaining proof is authenticated browser/persisted certification at current deployed SHA |
| Backup | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Real artifact required |
| Restore | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Real non-production restore required |
| RPO / RTO | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Real timings required |
| Rollback | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Authorized real drill required |
| Forward recovery / DR | **UNPROVEN / OWNER REQUIRED-CONDITIONAL** | Real operational environment required |
| Production binding | **STALE / NOT CERTIFIED** | Current candidate differs from prior deployment |
| Auth leaked-password protection | **OPEN — OWNER REQUIRED / PRO PLAN** | Control-plane setting unavailable; user verified Pro requirement |
| Final certification | **BLOCKED** | Live operational evidence, fresh current-head quality, and protected owner actions remain |

## I. EXECUTION PROTOCOL — ALWAYS ROTATE
`READ PROTOCOL → READ INDEX → READ CURRENT EXACT STATE → RESCAN → FIND → CLASSIFY → ROOT CAUSE → FIX → TEST → REGRESSION → EXACT-HEAD CI → RUNTIME → LIVE EVIDENCE → INDEX UPDATE → RESCAN`

- `PENDING ≠ DONE`.
- `REPORT ≠ COMPLETION`.
- `CI PASS ≠ Runtime`.
- `Runtime ≠ Production Certification`.
- `Production deployment ≠ Production certification`.
- Work first, report last.

### NEXT EXECUTION FRONT
1. Consume fresh exact-head Quality and enforcement evidence for `c346e23a64d96125264fae849964b60b0f96c15f`.
2. Continue Supabase RPC/security-definer and sibling-consumer audit.
3. Continue current-candidate production/runtime readiness without alias mutation.
4. Continue Authenticated E2E/Tenant A-B owner prerequisite hardening.
5. Continue storage/realtime/AI-vector executable checks.
6. Continue resilience, OCR, UI/export, semantic truth, performance/scale, and product acceptance fronts.
7. Rescan after every closure.
