# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative current execution index. Historical evidence remains preserved in Git history and dated evidence documents. Evidence never crosses an exact-SHA boundary.

### CURRENT PROJECT STATE
- Repository: `Report-Engainall/Report-Advisor`.
- **CURRENT_CODE_TEST_CANDIDATE:** `f89dbc05e9e392ee2d549fec15108add55708392`.
- `c346e23a64d96125264fae849964b60b0f96c15f` is no longer the current code/test candidate. Forensic comparison proves the interval `c346e23... → f89dbc...` contains 36 commits including real security, migration, compatibility, test, workflow, and certification mutations.
- A later documentation/evidence-only synchronization SHA may exist and must not inherit runtime or production evidence from `f89dbc...` unless the certification boundary explicitly resolves and checks out `f89dbc...`.
- Exact-head certification is fail-closed: stale, missing, synthetic merge, decoy, skipped, or weakened evidence is not accepted.

### EXACT CANDIDATE RECONCILIATION
- Base: `c346e23a64d96125264fae849964b60b0f96c15f`.
- Reconciled head: `f89dbc05e9e392ee2d549fec15108add55708392`.
- Ancestry comparison: `f89dbc...` is 36 commits ahead of `c346e23...`.
- Classification and commit-by-commit evidence: `docs/EVIDENCE/2026-09-04_CANDIDATE_RECONCILIATION_c346-to-f89.md`.
- Determination: `f89dbc...` is the correct current code/test candidate because it contains the complete executable product/test/certification-boundary state; the final commit itself modifies executable certification-boundary parsing.

### CERTIFICATION BOUNDARY
- `check-certification-boundary-integrity.mjs` rejects a newer indexed head when the indexed candidate is not an ancestor or when the newer delta contains non-governance paths.
- `check-certification-boundary-integrity.test.mjs` covers exact candidate, governed ancestry, source mutation rejection, and ancestry spoof rejection.
- `final-certification-provenance.test.mjs` covers trigger-specific SHA binding, checkout-to-certification equality, and synthetic PR merge-SHA rejection.
- `.github/workflows/final-certification-gate.yml` resolves the certification SHA, checks it out, verifies `git rev-parse HEAD`, and emits exact provenance evidence.
- `.github/workflows/execution-enforcement-contract.yml` invokes the certification boundary before execution-enforcement checks.
- Historical run `33820282175` correctly failed closed because the established Index wording did not match the initial parser. The parser was repaired in `f89dbc...`.
- Run `33820413365` then executed against the current boundary and remained non-certified; no PASS was recorded from it.

### APPROVAL / AUTHORITY
- Live `company_memberships`: 2 active memberships, both `role=member`; no separate approver/permission authority model was found.
- `decide_approval()` resolves authenticated tenant, requires PENDING state, and rejects self-approval.
- Approval mutation tables are not directly writable by `authenticated` in the audited grant surface.
- **Status:** DB/security boundary proven; explicit business approver-role semantics are **PRODUCT DECISION REQUIRED** if a distinct approver authority is intended. No speculative role was invented.

### SECURITY DEFINER
- Public SECURITY DEFINER surface was audited for owner, locked `pg_catalog` search path, EXECUTE grants, tenant enforcement, authorization, dynamic SQL, validation, RLS interaction, direct table access, and business authority.
- Five trust/governance helpers previously failed because application relations were unqualified under `pg_catalog`; fixed by `20260902231600_reconcile_security_definer_search_path_qualification.sql` at `5dbf20f4f376896a58f9e8110b9fc813b5069967`.
- Worker mutation RPCs are constrained to the service-role boundary in the audited live surface.
- No blanket revoke is permitted. Privileges are classified `REQUIRED / EXCESS / UNKNOWN`; unresolved business authority remains a decision, not a guessed mutation.

### WORKER / QUEUE
- Live worker lifecycle supports `queued|leased|processing|completed|blocked|failed|dead_letter` with attempt/max-attempt constraints, unique `(company_id,job_key)`, tenant FK and ready-job indexing.
- Claim/heartbeat/checkpoint/complete/fail/retry are SECURITY DEFINER with locked search path and restricted execution.
- Dead-letter terminal transition fixed in `20260903160000_restore_report_execution_dead_letter_terminal_transition.sql`.
- Live rollback-safe tests proved max-attempt dead-lettering, retry restoration for non-terminal failure, null-error rejection, and terminal non-retry.
- Additional adversarial lifecycle coverage includes stale lease, fencing, idempotency, expiry, retry counts and terminal resurrection guards.
- **Status:** DB boundary proven; full deployed runtime worker certification remains unproven.

### IMPORT / COMPATIBILITY
- Compatibility hardening fixed bounded `import_jobs` history reads and added regression coverage.
- Required sweep remains caller → adapter → RPC/query → DB, including canonical/legacy parity, tenant scope, limits, pagination, NULL/error semantics and response shape.
- Terminal import progress is monotonic and terminal-job resurrection is guarded.

### DECISION / RECOMMENDATION
- One-to-one bidirectional relationship hardening is live: partial unique indexes, row locks, conflicting-link rejection and atomic same-tenant linking.
- `CANCELLED` approval consistency is live and requires terminal provenance.

### TENANT / SECURITY TRUTH
- Live Staging audit: 78/78 public tables have RLS; 147 policies; 0 policies target `anon`; 0 policies target `PUBLIC`.
- Tenant isolation has prior DB/adversarial contract proof. Current authenticated browser A/B proof remains runtime-unproven and must not be inferred from contract tests.

### STORAGE
- Live object policies are tenant/owner-aware.
- Live bucket query returned 0 application buckets; no bucket requirement was invented.
- **Status:** `REQUIREMENT DECISION REQUIRED` if Storage is part of release contract; otherwise formally scope it out. Runtime object-access proof is not certified.

### REALTIME
- `supabase_realtime` has no published application tables and repository scan found no application consumer.
- **Status:** `REQUIREMENT DECISION REQUIRED` until product scope explicitly proves required or records out-of-scope.

### AI / VECTOR
- Architecture exists, but no dedicated public embedding store/runtime evidence was proven.
- Required checks remain tenant isolation, retrieval authorization, provenance, metadata, stale embedding handling, wrong-tenant retrieval and source linkage.
- **Status:** `UNPROVEN`.

### OCR / DOCUMENT INTELLIGENCE
- Required evidence surface: Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, timeout, duplicate fingerprint, provenance/confidence and page/line references.
- Golden-corpus preparation is actionable locally; runtime PASS requires actual execution evidence.
- **Status:** `UNPROVEN` until runtime evidence exists.

### REPORTS / EXPORT
- Required chain: canonical truth → calculation → report query → artifact → SHA-256 → provenance → export.
- Required adversarial checks: tenant/period leakage, stale truth, duplicates, NULL/unknown semantics, pagination, bounds, aggregate drift, PDF/RTL, Excel, CSV and artifact integrity.
- **Status:** active execution front; no production certification inferred from static code.

### WATCHED FOLDER / FILE ENGINE
- Required lifecycle: event → stability → discovery → security scan → fingerprint → dedupe → ingestion → job → worker → result.
- Required adversarial cases: partial file, duplicate event, rename/delete/replay, traversal/symlink, archive/oversize abuse, MIME/extension spoofing, duplicate fingerprint, concurrent ingestion and crash/restart.
- **Status:** active execution front.

### PERFORMANCE / SCALE
- Evidence target: bounded queries, EXPLAIN, indexes, deterministic pagination, large-tenant behavior, large imports, report generation, worker contention/concurrency, timeout and memory behavior.
- Historical unused-index notices must be classified `BLOCKING / NON-BLOCKING / OPTIMIZATION`; they are not P0 by default.
- **Status:** active evidence front.

### DESKTOP / ELECTRON
- Electron 44 remediation must be evaluated against `CURRENT_CODE_TEST_CANDIDATE`, not historical `bc0af2c...` or another stale SHA.
- Required: dependency tree/audit, typecheck/build, native smoke where available, and exact-head Windows evidence when CI cannot supply it.
- **Status:** exact-head verification required before certification.

### PR #305 / #307 / #308
- Blind merge is prohibited.
- Forensic comparison must consider ancestry, ahead/behind, changed files, duplicate/superseded/unique changes, conflicts, security, tests, workflows and migrations.
- Current comparisons are recorded against `f89dbc...`; any useful unique delta must be reconciled against canonical main rather than merged wholesale.

### LIVE DEPLOYMENT / RESILIENCE
- Current observed READY Vercel deployment: `dpl_d7dkae3DeHwfJjyrjXyc7GrYTHQs`, HEAD `bc1218edbd5444fe5626ff86cb255bbfb872481f`.
- Production HTML returned HTTP 200; selected recent runtime-error inspection returned no runtime errors.
- This deployment is not the current code/test candidate and therefore cannot certify current production state.
- Backup/restore, RPO/RTO, rollback, forward recovery and production binding remain unproven until protected exact-candidate operational evidence exists.

### OWNER UNBLOCK QUEUE
| ID | Blocked operation | Real blocker | Assistant preparation | Required returned evidence | Status |
|---|---|---|---|---|---|
| OWNER-AUTH-01 | Authenticated Tenant A/B browser proof | Real interactive credentials/session | Test matrix + exact candidate boundary | Authenticated E2E + A/B evidence | OWNER REQUIRED |
| OWNER-AUTH-02 | Leaked-password protection | Auth control-plane access | Setting identified; no secret requested | Non-secret enabled state | OWNER REQUIRED if release policy requires |
| OWNER-DR-01 | Backup + isolated restore | Protected recovery operation | Safety contract + validation procedure | Backup/restore/hash/timing/RPO/RTO | OWNER REQUIRED / CONDITIONAL |
| OWNER-DR-02 | Rollback + forward recovery | Protected deployment authorization | Drill contract + evidence schema | Deployment IDs + health + recovery evidence | OWNER REQUIRED / CONDITIONAL |
| OWNER-WIN-01 | Native Windows smoke | Physical/native environment if CI unavailable | Exact command packet | Logs/artifact from exact candidate | OWNER REQUIRED / CONDITIONAL |

### CURRENT CERTIFICATION STATES
| Front | BUILT | INTEGRATED | VERIFIED | RUNTIME PROVEN | PRODUCTION CERTIFIED |
|---|---|---|---|---|---|
| Approval/RBAC | YES | YES | DB boundary | NO | NO |
| Worker | YES | YES | DB + regression | NO full deployed runtime | NO |
| Tenant isolation | YES | YES | DB adversarial contract | NO current A/B browser proof | NO |
| Compatibility/import | YES | YES | Partial regression | NO full runtime | NO |
| OCR | YES/architecture | PARTIAL | Corpus/tests partial | NO | NO |
| Reports/export | YES | PARTIAL | Partial | NO | NO |
| Storage | YES/policies | NO bucket contract | Policy | NO | NO |
| Realtime | Client capability | NO consumer/publication | NO | NO | NO |
| AI/vector | Architecture | PARTIAL | Architecture only | NO | NO |
| Certification provenance | YES | YES | Fresh exact-candidate CI pending | N/A | NO |

### TRUE STOP
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Independent actionable work remains in compatibility parity, worker runtime evidence, watched-folder lifecycle, OCR golden corpus, report/export adversarial verification, performance evidence, Electron/Windows exact-head verification, PR #305/#307/#308 forensic reconciliation, migration lineage and fresh exact-candidate CI consumption.

Owner-only blockers are isolated to real authenticated browser sessions, Auth control-plane settings, protected backup/restore/rollback, and unavoidable native Windows/protected deployment operations.
