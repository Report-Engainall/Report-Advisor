# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### EXECUTION SCOPE / BRANCH
- **Repository:** `Report-Engainall/Report-Advisor`
- **Current execution branch:** `main`
- **Current main:** `24b7579a85dfe8154f096fa514fd8ce676944107`
- **Current code/test candidate:** `24b7579a85dfe8154f096fa514fd8ce676944107`
- `24b7579...` is the latest executable test-contract repair; subsequent index-only descendants are governance-only and do not replace the candidate.
- Execution scope: P0 certification/test integrity; P0 security/database/RPC; compatibility; worker/file-system/OCR/document intelligence; report/export; performance; PR/desktop reconciliation; final evidence/certification.
- Parallel execution is mandatory where fronts are independent. Owner intervention is deferred until all locally actionable work is exhausted.

### EXACT CANDIDATE
- **CURRENT CODE/TEST CANDIDATE:** `24b7579a85dfe8154f096fa514fd8ce676944107`
- `69f14e75597f5a710bb415d0d905f0d0c18854f7` was the prior executable candidate.
- Terminal approval concurrency hardening is canonical and live; its adversarial test-of-test is wired into Quality.
- `6dff142...` corrected continuous-trust checker/schema drift (`incident_regression_links` vs stale `incident_regressions`).
- `d956eb7...` / `205f0bf...` / `bac68777...` corrected execution-enforcement candidate parsing. The exact failure sequence was consumed fail-closed; no stale evidence was promoted.
- `837a177...` and `838f965...` split the oversized enforcement adversarial suite into bounded protocol and governance/index modules; `69f14e...` restored the canonical entrypoint wrapper.
- `a0b09f8...` repaired the continuous-trust runtime checker: it now validates the real application-to-`autonomy_runtime_gate` bridge and the SQL-side `is_continuous_trust_healthy('production')` linkage rather than incorrectly requiring a database function name inside the TypeScript client.
- `24b7579...` added test-of-test coverage for persistence identifier drift, runtime RPC bridge weakening, and SQL bridge weakening.
- Main may receive governance/index descendants after the candidate; certification must resolve the candidate from this index and enforce ancestry/allowlisted-path rules.

### BATCH 1 — INSTRUCTIONS
1. Consume Final Certification Gate, Final Execution Batch, Quality and Desktop Windows results as they complete.
2. Sweep certification/test surfaces for stale identifiers, fixtures, SHA assumptions, parser weaknesses, candidate/index drift, weak/existence-only assertions, failure-path gaps, bypass paths and hardcoded expectations.
3. For every actionable defect: FIX → TEST → TEST THE TEST → BYPASS SEARCH → REGRESSION → VERIFY → EVIDENCE.
4. Never promote stale evidence or weaken a checker to obtain PASS.
5. Keep independent fronts running while CI is pending.

### BATCH 1 — STOP CONDITIONS
- No certification/test defect remains in the inspected surface that is locally actionable.
- Every completed CI result has been consumed.
- No PASS depends on stale evidence.
- Candidate, index and exact-SHA lineage are consistent.

### CERTIFICATION BOUNDARY
- Exact candidate checkout + HEAD equality required for candidate execution.
- Governance-only descendants require ancestry and explicit allowlisted paths.
- Provenance must bind push/PR/manual trigger to the tested SHA; synthetic PR merge SHAs are rejected.
- `final-certification-gate.yml` and `execution-enforcement-contract.yml` enforce the boundary.
- Fresh Quality and Certification are mandatory for `24b7579...`.

### BATCH 2 — INSTRUCTIONS
- Audit SECURITY DEFINER, grants/exposure, RLS, tenant isolation, approval authorization, terminal-state protection, concurrency/resurrection, self-approval, cross-tenant paths, migration lineage and RPC/frontend parity.
- Treat `request_decision_approval()` and `decide_approval()` as primary surfaces.
- Do not invent a Business Rule; isolate any missing approver authority definition as Product Decision.

### BATCH 2 — STOP CONDITIONS
- No known locally actionable Security/DB/RPC defect remains.
- Migration lineage matches actual behavior.
- No unhandled cross-tenant or privilege-escalation path remains.
- All fixes have regression and bypass evidence.
- Remaining uncertainty is Owner / Product Decision / External only.

### APPROVAL / AUTHORITY
- Live memberships: 2 active, both `role=member`; no canonical approver/permission authority table found.
- `decide_approval()` is tenant-scoped, row-locking, PENDING-only, rejects self-approval, and updates only the same-tenant proposed decision.
- `request_decision_approval()` guards ordinary and conflict-path terminal resurrection; terminal rows fail closed even after a concurrent wait.
- Direct authenticated DML on audited approval mutation surfaces is not granted.
- Distinct business approver authority remains **PRODUCT DECISION REQUIRED** only if a separate authority class is intended; no business rule is invented.

### SECURITY DEFINER
- Fresh live inventory: 33 public SECURITY DEFINER functions; 19 executable by `authenticated`, 0 by `anon`.
- No audited dynamic SQL and no missing `SET search_path` marker were found.
- Authenticated callable functions resolve company context through `current_company_id()` or controlled user context.
- Advisor WARNs remain `REQUIRED / EXCESS / UNKNOWN`; no blanket revoke.
- `auth_leaked_password_protection` remains an external Auth control-plane requirement.
- **EXECUTING:** continue semantic authority review.

### BATCH 3 — INSTRUCTIONS
- Sweep `@/lib/queries`, `queries-compat`, legacy adapters, deprecated RPCs, fallback paths, RPC consumers and direct DB consumers.
- Verify signatures, arguments, return shape, NULL/error behavior, tenant behavior, authorization, pagination and limits.
- Fix actionable mismatch and perform regression plus rescan.

### BATCH 3 — STOP CONDITIONS
- Full consumer sweep complete.
- No actionable legacy/compatibility mismatch or unjustified duplicate implementation remains.
- Regression and rescan confirm closure.

### IMPORT / COMPATIBILITY
- `queries-compat.ts` delegates legacy reads to canonical query paths.
- Import history is bounded to 500 with deterministic ordering and overflow rejection.
- Canonical export adapters are tenant-scoped and bounded to 10,000.
- **EXECUTING:** repository-wide caller/legacy/RPC/response/null/error parity sweep.

### BATCH 4 — INSTRUCTIONS
- Worker: lease, heartbeat, expiry, retry, fencing, duplicate/stale worker, crash recovery, resurrection, DLQ, replay and concurrency.
- Filesystem: absolute/relative paths, `..`, encoded traversal, symlink, rename/delete, duplicate/concurrent events, partial file, restart/rescan.
- OCR/documents: Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, fingerprint, confidence, provenance and page/line references.
- Separate DB-proven from runtime-proven; repair every locally actionable defect.

### BATCH 4 — STOP CONDITIONS
- Every locally executable worker/filesystem/OCR/document proof is exhausted.
- All locally actionable defects are fixed and tested.
- DB Proven and Runtime Proven are explicitly separated.
- Runtime/browser/environment dependencies are precise Owner/External blockers.

### WORKER / QUEUE
- State domain: `queued|leased|processing|completed|blocked|failed|dead_letter`.
- Claim/heartbeat/checkpoint/complete/fail/retry are tenant/lease/fence guarded and privileged-only.
- DB lifecycle and dead-letter behavior are verified; full deployed runtime worker proof remains unproven.

### WATCHED FILE ENGINE
- Recorder validates tenant context, folder ownership, identity, non-negative size and state domain with tenant-scoped upsert identity.
- Canonical direct-DML migration is applied to live Staging: authenticated INSERT/UPDATE/DELETE on `watched_report_files` are false; recorder RPC EXECUTE is true.
- Test-of-test rejects a deliberately weakened direct-DML boundary.
- Browser watcher derives relative paths from selected directory; native Electron reads resolve + realpath + containment and stable-file checks.
- **EXECUTING:** exact-head native evidence and environment-only filesystem proof.

### OCR / DOCUMENTS
- Golden scope: Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, timeout, duplicate fingerprint, confidence/provenance and page/line references.
- **EXECUTING:** corpus/test evidence where environment permits. Runtime PASS requires actual execution evidence.

### BATCH 5 — INSTRUCTIONS
- Reports/export: verify canonical truth → calculation → report → artifact → SHA-256 → provenance → export under wrong-period, stale-truth, duplicate, tenant, NULL, pagination and unbounded-query adversarial inputs; cover PDF/RTL, CSV and Excel.
- Performance: inspect EXPLAIN, bounds, pagination, index use, large tenant/import/report load, worker concurrency, contention, timeouts and memory.
- Never remove an index solely because current data is small or usage is low.

### BATCH 5 — STOP CONDITIONS
- No locally actionable report/export provenance defect remains.
- No performance blocker remains that is locally repairable.
- Optimizations are separately classified and do not masquerade as certification closure.

### REPORTS / EXPORT
- Required chain: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
- **EXECUTING:** tenant/period leakage, stale truth, duplicates, NULL/unknown semantics, pagination/bounds, aggregate drift, PDF/RTL, Excel, CSV and artifact-integrity adversarial evidence.

### PERFORMANCE
- 43 unused-index INFO notices are `NON-BLOCKING / OPTIMIZATION` pending workload evidence.
- Tiny-data EXPLAIN samples are not production-scale proof.
- **EXECUTING:** scale, bounds, pagination, contention, timeout and concurrency evidence.

### BATCH 6 — INSTRUCTIONS
- For PR #305, #307 and #308, reconcile unique commits/files and security/migration/test impact against current main.
- Select MERGE / REBASE / CHERRY-PICK / SUPERSEDE / CLOSE only after forensic comparison; never wholesale merge.
- Desktop: execute what the available environment can prove; native-only operations remain Owner/External.

### BATCH 6 — STOP CONDITIONS
- No necessary PR delta remains undecided.
- No duplicate/superseded work remains without a decision.
- All executable Desktop work is complete; only genuine native/Owner/External dependencies remain.

### DESKTOP / PR RECONCILIATION
- Electron evidence must use exact current candidate.
- PR #305 terminal-approval implementation is superseded by canonical current-main lineage; no wholesale merge.
- PR #307 useful fixture/test ideas were selectively reproduced; no blind merge.
- PR #308 autonomy work remains separate until a unique missing behavior is proven.
- **EXECUTING:** remaining unique deltas absent from main.

### BATCH 7 — INSTRUCTIONS
- Full project rescan, then full certification rescan.
- Revalidate every Evidence item for exact SHA, environment, timestamp, check/test, actual result, artifact and provenance.
- Invalidate and recollect any Evidence tied to a prior candidate.

### BATCH 7 — STOP CONDITIONS
- All locally actionable execution debt is exhausted.
- No new locally executable gap remains untreated.
- Candidate/HEAD/Index/Evidence lineage is consistent.
- No stale Evidence remains.
- Certification blockers are precisely classified.

### STORAGE / REALTIME / AI
- Live Staging storage bucket inventory is empty; storage policies are tenant/owner-aware. Requirement status remains classification-dependent, not PASS.
- Realtime has no published application tables and no repository consumer found; requirement status remains classification-dependent, not PASS.
- AI/vector architecture exists but live database has no vector/embedding/semantic table surfaced; runtime retrieval authorization, tenant isolation and provenance remain unproven.
- **EXECUTING:** formal required/out-of-scope classification and close locally actionable contract gaps.

### LIVE / RESILIENCE
- Historical READY deployment `dpl_d7dkae3DeHwfJjyrjXyc7GrYTHQs` at `bc1218ed...` is not the current candidate and is not production certification.
- Backup/restore, RPO/RTO, rollback/forward recovery and current production binding remain unproven.

### BATCH 8 — INSTRUCTIONS
- Prepare only genuine Owner/External blockers after local execution debt is exhausted.
- Minimize intervention; never request credentials or sensitive secrets.
- Bundle the maximum number of tests behind each single Owner action.
- After Owner action, execute all newly-unblocked verification immediately.

### BATCH 8 — STOP CONDITIONS
- `LOCAL ACTIONABLE EXECUTION DEBT = 0`.
- Only Owner Required / Product Decision Required / External Blocker / genuinely non-local Runtime-Production proof remains.

### OWNER UNBLOCK QUEUE
| ID | Operation | Real blocker | Prepared | Evidence required | Status |
|---|---|---|---|---|---|
| OWNER-AUTH-01 | Authenticated Tenant A/B E2E | Interactive authenticated session | Matrix + exact candidate | A/B authenticated E2E + adversarial isolation | OWNER REQUIRED |
| OWNER-AUTH-02 | Leaked-password protection | Auth control plane | Setting identified | Non-secret enabled state | CONDITIONAL |
| OWNER-DR-01 | Backup + isolated restore | Protected recovery access | Safety/validation | Backup/restore/hash/timing/RPO/RTO | CONDITIONAL |
| OWNER-DR-02 | Rollback + forward recovery | Protected deployment access | Drill/evidence contract | Deployment/health/recovery proof | CONDITIONAL |
| OWNER-WIN-01 | Native Windows smoke | Native environment if CI unavailable | Exact command packet | Exact-head logs/artifact | CONDITIONAL |

### STATE MATRIX
| Front | BUILT | INTEGRATED | VERIFIED | RUNTIME PROVEN | PRODUCTION CERTIFIED |
|---|---|---|---|---|---|
| Approval/RBAC | YES | YES | DB + concurrency regression | NO | NO |
| Worker | YES | YES | DB + regression | NO full runtime | NO |
| Tenant isolation | YES | YES | DB adversarial | NO current A/B browser | NO |
| Import/compat | YES | YES | Partial | NO | NO |
| OCR | YES/architecture | PARTIAL | Partial | NO | NO |
| Reports/export | YES | PARTIAL | Partial | NO | NO |
| Storage | YES/policies | NO contract | Policy | NO | NO |
| Realtime | Client capability | NO publication | NO | NO | NO |
| AI/vector | Architecture | PARTIAL | Architecture | NO | NO |
| Certification provenance | YES | YES | **PENDING fresh `24b7579...`** | N/A | NO |

### EXECUTION DEBT
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Active local execution: Batch 1 certification/test integrity; compatibility caller/legacy sweep; watched filesystem exact-head proof; OCR corpus; report/export adversarial evidence; performance scale; Electron exact-head verification; PR unique-delta reconciliation; migration lineage; SECURITY DEFINER semantic review; worker adversarial lifecycle; storage/realtime/AI scope classification; and fresh exact-candidate Quality/Certification evidence.

Owner-only: authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.

### TRUE STOP
Only when local actionable debt is zero, all required security/DB/RPC/compat/import/worker/file/document/report/performance/desktop/certification work is evidenced on the exact candidate, and only Owner/External/Product Decision items remain.
