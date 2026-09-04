# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### EXACT CANDIDATE
- **CURRENT CODE/TEST CANDIDATE:** `6dff14241e16a8d845b568ac6e3f6db82136fa7a`
- `58cafcc2ca4bbad3996f47183f5b11e294d53aa0` was the prior executable candidate.
- `9308e5c4...` added the live + canonical terminal-approval concurrency guard; `f106f047...` added its adversarial test-of-test; `58cafcc...` wired that regression into Quality.
- `e83dc8b...` corrected execution-enforcement checker drift against the canonical candidate wording.
- `6dff142...` corrected a real continuous-trust checker/schema drift: the canonical migration defines `incident_regression_links`, while the checker incorrectly searched for stale `incident_regressions`. It now validates the canonical identifier and rejects a deliberately stale identifier in test-of-test.
- Main may receive governance/index descendants after the candidate; certification must resolve the candidate from this index and enforce ancestry/allowlisted-path rules.

### CERTIFICATION BOUNDARY
- Exact candidate checkout + HEAD equality required for candidate execution.
- Governance-only descendants require ancestry and explicit allowlisted paths.
- Provenance must bind push/PR/manual trigger to the tested SHA; synthetic PR merge SHAs are rejected.
- `final-certification-gate.yml` and `execution-enforcement-contract.yml` enforce the boundary.
- Fresh Quality and Certification are mandatory for `6dff142...`.

### FRESH FAILURE-DRIVEN REPAIR CHAIN
- Final Execution Batch `33822348808` on `58cafcc...` = **SUCCESS**, with all 30 deterministic gates passing.
- Final Certification `33822348727` on `58cafcc...` failed correctly because the index still pointed to `e560f651...`; this was stale-index fail-closed behavior, not a product failure. The subsequent governance index reconciliation moved the candidate to `58cafcc...`.
- Final Certification `33822372502` on governance HEAD `4437ab...` passed its boundary check but then failed in certification-contract sweep because `check-continuous-trust-runtime-chain.mjs` used stale `incident_regressions`; the canonical migration uses `incident_regression_links`.
- `6dff142...` repairs that checker and adds adversarial stale-identifier test-of-test. Fresh certification is required again.
- Quality `33822372660` on `4437ab...` is the fresh post-index run; it reached the 20-stage gate and broad checker sweep, then correctly failed at the stale continuous-trust checker. It is superseded by `6dff142...` repair.

### APPROVAL / AUTHORITY
- Live memberships: 2 active, both `role=member`; no canonical approver/permission authority table found.
- `decide_approval()` is tenant-scoped, row-locking, PENDING-only, rejects self-approval, and updates only the same-tenant proposed decision.
- `request_decision_approval()` now guards both ordinary and conflict-path terminal resurrection; terminal rows fail closed even after a concurrent wait.
- Direct authenticated DML on audited approval mutation surfaces is not granted.
- Distinct business approver authority remains **PRODUCT DECISION REQUIRED** only if a separate authority class is intended; no business rule is invented.

### SECURITY DEFINER
- Fresh live inventory: 33 public SECURITY DEFINER functions; 19 executable by `authenticated`, 0 by `anon`.
- No audited dynamic SQL and no missing `SET search_path` marker were found.
- Authenticated callable functions consistently resolve company context through `current_company_id()` or controlled user context.
- Advisor WARNs remain `REQUIRED / EXCESS / UNKNOWN`; no blanket revoke.
- `auth_leaked_password_protection` remains an external Auth control-plane requirement.
- **EXECUTING:** continue semantic authority review; no security PASS is inferred solely from linter status.

### WORKER / QUEUE
- State domain: `queued|leased|processing|completed|blocked|failed|dead_letter`.
- Claim/heartbeat/checkpoint/complete/fail/retry are tenant/lease/fence guarded and privileged-only.
- DB lifecycle and dead-letter behavior are verified; full deployed runtime worker proof remains unproven.
- `scripts/report-execution-runtime.test.ts` covers checkpoint monotonicity, source-hash binding, tenant/idempotency identity and lease/dead-letter SQL invariants, but deployed worker execution is still not proven.

### IMPORT / COMPATIBILITY
- `queries-compat.ts` delegates legacy reads to canonical query paths.
- Import history is bounded to 500 with deterministic ordering and overflow rejection.
- Canonical export adapters are tenant-scoped and bounded to 10,000.
- **EXECUTING:** repository-wide caller/legacy/RPC/response/null/error parity sweep.

### WATCHED FILE ENGINE
- Recorder validates tenant context, folder ownership, identity, non-negative size and state domain with tenant-scoped upsert identity.
- Canonical direct-DML migration is applied to live Staging: authenticated INSERT/UPDATE/DELETE on `watched_report_files` are false; recorder RPC EXECUTE is true.
- Test-of-test rejects a deliberately weakened direct-DML boundary.
- Browser watcher derives relative paths from the selected directory; native Electron path reads resolve + realpath + containment and stable-file checks. Native smoke contract includes persistence, event, dedupe, changed-file, partial-file stabilization, rapid files, traversal rejection, deletion, recursive scan and concurrent rescan checks.
- **EXECUTING:** exact-head native evidence and any remaining environment-only filesystem proof.

### OCR / DOCUMENTS
- Golden scope: Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, timeout, duplicate fingerprint, confidence/provenance and page/line references.
- **EXECUTING:** corpus/test evidence where environment permits. Runtime PASS requires actual execution evidence.

### REPORTS / EXPORT
- Required chain: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
- Report execution E2E contract already adversarially tests source-snapshot and quarantine guard removal; durable adapter requires claim/heartbeat/checkpoint/complete/fail/retry RPCs.
- **EXECUTING:** tenant/period leakage, stale truth, duplicates, NULL/unknown semantics, pagination/bounds, aggregate drift, PDF/RTL, Excel, CSV and artifact-integrity adversarial evidence.

### STORAGE / REALTIME / AI
- Storage policies are tenant/owner-aware; live application bucket count is 0. Requirement status must be classified, not inferred as PASS.
- Realtime has no published application tables and no repository consumer found; requirement status must be classified, not inferred as PASS.
- AI/vector architecture exists but runtime retrieval authorization, tenant isolation and provenance remain unproven.
- **EXECUTING:** formal required/out-of-scope classification and close any locally actionable contract gaps.

### PERFORMANCE
- 43 unused-index INFO notices are `NON-BLOCKING / OPTIMIZATION` pending workload evidence.
- Tiny-data EXPLAIN samples are not production-scale proof.
- **EXECUTING:** scale, bounds, pagination, contention, timeout and concurrency evidence.

### DESKTOP / PR RECONCILIATION
- Electron evidence must use the exact current candidate.
- PR #305 is open/diverged; terminal-approval fixes were selectively reconciled; no wholesale merge.
- PR #307 is open/diverged; its unique test improvements were reviewed and selectively reproduced where correct; no blind merge.
- PR #308 is open/draft/diverged; autonomy changes remain separate until canonical reconciliation.
- **EXECUTING:** remaining unique-delta decisions only where they contain behavior absent from main.

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
| Certification provenance | YES | YES | **PENDING fresh `6dff142...`** | N/A | NO |

### EXECUTION DEBT
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Active local execution remains: compatibility caller/legacy sweep; watched filesystem exact-head proof; OCR corpus; report/export adversarial evidence; performance scale; Electron exact-head verification; PR unique-delta reconciliation; migration lineage; SECURITY DEFINER semantic review; worker adversarial lifecycle; storage/realtime/AI scope classification; and fresh exact-candidate Quality/Certification evidence.

Owner-only: authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.

### TRUE STOP
Only when local actionable debt is zero, all required security/DB/RPC/compat/import/worker/file/document/report/performance/desktop/certification work is evidenced on the exact candidate, and only Owner/External/Product Decision items remain.
