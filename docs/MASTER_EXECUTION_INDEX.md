# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### EXACT CANDIDATE
- **CURRENT CODE/TEST CANDIDATE:** `69f14e75597f5a710bb415d0d905f0d0c18854f7`
- `bac68777cc7014c1558e4b05cc8b98f3215e7cb3` was the prior executable candidate.
- Terminal approval concurrency hardening is canonical and live; its adversarial test-of-test is wired into Quality.
- `6dff142...` corrected continuous-trust checker/schema drift (`incident_regression_links` vs stale `incident_regressions`).
- `d956eb7...` / `205f0bf...` / `bac68777...` corrected execution-enforcement candidate parsing. The exact failure sequence was consumed fail-closed; no stale evidence was promoted.
- `837a177...` and `838f965...` split the oversized enforcement adversarial suite into bounded protocol and governance/index modules; `69f14e...` restores the canonical entrypoint wrapper. The wrapper now executes both bounded suites, including canonical Markdown candidate parsing and exact-SHA/index-only adversarial checks.
- Main may receive governance/index descendants after the candidate; certification must resolve the candidate from this index and enforce ancestry/allowlisted-path rules.

### CERTIFICATION BOUNDARY
- Exact candidate checkout + HEAD equality required for candidate execution.
- Governance-only descendants require ancestry and explicit allowlisted paths.
- Provenance must bind push/PR/manual trigger to the tested SHA; synthetic PR merge SHAs are rejected.
- `final-certification-gate.yml` and `execution-enforcement-contract.yml` enforce the boundary.
- Fresh Quality and Certification are mandatory for `69f14e...`.

### FRESH FAILURE-DRIVEN REPAIR CHAIN
- Quality `33822486064` on `6dff142...` = **SUCCESS** across all 63 workflow steps.
- Quality `33822505850` on governance `52b077...` = **SUCCESS** across all 63 steps.
- Final Execution Batch `33822505852` on governance `52b077...` = **SUCCESS** with 30 deterministic gates.
- Final Certification `33822505843` failed correctly on stale execution-enforcement parser assumptions; no evidence was promoted.
- Execution Enforcement `33822639380` on `205f0bf...` failed because that exact SHA still indexed `6dff142...`; correct fail-closed.
- Execution Enforcement `33822656409` on governance `5439c7...` failed because the parser did not recognize the colon inside Markdown emphasis; `bac68777...` repaired this exact grammar.
- Execution Enforcement `33822761438` on `a9d6c929...` passed boundary + enforcement contract but its adversarial harness exposed a stale synthetic fixture (`Exact code/test head entering this sweep`). That fixture is now replaced by the canonical candidate wording and split bounded suites.
- The latest main-side enforcement run before the split therefore remains **superseded**, not PASS. Fresh exact-candidate evidence is mandatory.

### APPROVAL / AUTHORITY
- Live memberships: 2 active, both `role=member`; no canonical approver/permission authority table found.
- `decide_approval()` is tenant-scoped, row-locking, PENDING-only, rejects self-approval, and updates only the same-tenant proposed decision.
- `request_decision_approval()` now guards ordinary and conflict-path terminal resurrection; terminal rows fail closed even after a concurrent wait.
- Direct authenticated DML on audited approval mutation surfaces is not granted.
- Distinct business approver authority remains **PRODUCT DECISION REQUIRED** only if a separate authority class is intended; no business rule is invented.

### SECURITY DEFINER
- Fresh live inventory: 33 public SECURITY DEFINER functions; 19 executable by `authenticated`, 0 by `anon`.
- No audited dynamic SQL and no missing `SET search_path` marker were found.
- Authenticated callable functions resolve company context through `current_company_id()` or controlled user context.
- Advisor WARNs remain `REQUIRED / EXCESS / UNKNOWN`; no blanket revoke.
- `auth_leaked_password_protection` remains an external Auth control-plane requirement.
- **EXECUTING:** continue semantic authority review.

### WORKER / QUEUE
- State domain: `queued|leased|processing|completed|blocked|failed|dead_letter`.
- Claim/heartbeat/checkpoint/complete/fail/retry are tenant/lease/fence guarded and privileged-only.
- DB lifecycle and dead-letter behavior are verified; full deployed runtime worker proof remains unproven.
- Runtime contract covers checkpoint monotonicity, source-hash binding, tenant/idempotency identity and lease/dead-letter SQL invariants.

### IMPORT / COMPATIBILITY
- `queries-compat.ts` delegates legacy reads to canonical query paths.
- Import history is bounded to 500 with deterministic ordering and overflow rejection.
- Canonical export adapters are tenant-scoped and bounded to 10,000.
- **EXECUTING:** repository-wide caller/legacy/RPC/response/null/error parity sweep.

### WATCHED FILE ENGINE
- Recorder validates tenant context, folder ownership, identity, non-negative size and state domain with tenant-scoped upsert identity.
- Canonical direct-DML migration is applied to live Staging: authenticated INSERT/UPDATE/DELETE on `watched_report_files` are false; recorder RPC EXECUTE is true.
- Test-of-test rejects a deliberately weakened direct-DML boundary.
- Browser watcher derives relative paths from selected directory; native Electron reads resolve + realpath + containment and stable-file checks.
- **EXECUTING:** exact-head native evidence and environment-only filesystem proof.

### OCR / DOCUMENTS
- Golden scope: Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, timeout, duplicate fingerprint, confidence/provenance and page/line references.
- **EXECUTING:** corpus/test evidence where environment permits. Runtime PASS requires actual execution evidence.

### REPORTS / EXPORT
- Required chain: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
- Report execution E2E contract adversarially tests source-snapshot and quarantine guard removal; durable adapter requires lifecycle RPCs.
- **EXECUTING:** tenant/period leakage, stale truth, duplicates, NULL/unknown semantics, pagination/bounds, aggregate drift, PDF/RTL, Excel, CSV and artifact-integrity adversarial evidence.

### STORAGE / REALTIME / AI
- Live Staging storage bucket inventory is empty; storage policies are tenant/owner-aware. Requirement status remains classification-dependent, not PASS.
- Realtime has no published application tables and no repository consumer found; requirement status remains classification-dependent, not PASS.
- AI/vector architecture exists but live database has no vector/embedding/semantic table surfaced; runtime retrieval authorization, tenant isolation and provenance remain unproven.
- **EXECUTING:** formal required/out-of-scope classification and close locally actionable contract gaps.

### PERFORMANCE
- 43 unused-index INFO notices are `NON-BLOCKING / OPTIMIZATION` pending workload evidence.
- Tiny-data EXPLAIN samples are not production-scale proof.
- **EXECUTING:** scale, bounds, pagination, contention, timeout and concurrency evidence.

### DESKTOP / PR RECONCILIATION
- Electron evidence must use exact current candidate.
- PR #305 is open/diverged; its terminal-approval implementation is superseded by canonical current-main lineage; no wholesale merge.
- PR #307 is open/diverged; its useful fixture/test ideas were selectively reproduced; no blind merge.
- PR #308 is open/draft/diverged; autonomy work remains separate until a unique missing behavior is proven.
- **EXECUTING:** only remaining unique deltas that are absent from main.

### LIVE / RESILIENCE
- Historical READY deployment `dpl_d7dkae3DeHwfJjyrjXyc7GrYTHQs` at `bc1218ed...` is not the current candidate and is not production certification.
- Backup/restore, RPO/RTO, rollback/forward recovery and current production binding remain unproven.

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
| Certification provenance | YES | YES | **PENDING fresh `69f14e...`** | N/A | NO |

### EXECUTION DEBT
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Active local execution: compatibility caller/legacy sweep; watched filesystem exact-head proof; OCR corpus; report/export adversarial evidence; performance scale; Electron exact-head verification; PR unique-delta reconciliation; migration lineage; SECURITY DEFINER semantic review; worker adversarial lifecycle; storage/realtime/AI scope classification; and fresh exact-candidate Quality/Certification evidence.

Owner-only: authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.

### TRUE STOP
Only when local actionable debt is zero, all required security/DB/RPC/compat/import/worker/file/document/report/performance/desktop/certification work is evidenced on the exact candidate, and only Owner/External/Product Decision items remain.
