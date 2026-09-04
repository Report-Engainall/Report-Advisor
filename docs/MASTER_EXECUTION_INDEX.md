# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### EXACT CANDIDATE
- **CURRENT CODE/TEST CANDIDATE:** `58cafcc2ca4bbad3996f47183f5b11e294d53aa0`
- `e560f651864b99dad71cf1f39bcebc99f6e5038a` was the prior executable candidate.
- `9308e5c4...` added the live + canonical terminal-approval concurrency guard; `f106f047...` added its adversarial test-of-test; `58cafcc...` wired that regression into the canonical Quality workflow.
- `e83dc8b...` corrected a real execution-enforcement checker drift: the current index uses `CURRENT CODE/TEST CANDIDATE`, while the checker only recognized obsolete wording.
- Main may receive governance/index descendants after the candidate; certification must resolve the candidate from this index and enforce ancestry/allowlisted-path rules.

### CERTIFICATION BOUNDARY
- Exact candidate checkout + HEAD equality required for candidate execution.
- Governance-only descendants require ancestry and explicit allowlisted paths.
- Provenance must bind push/PR/manual trigger to the tested SHA; synthetic PR merge SHAs are rejected.
- `final-certification-gate.yml` and `execution-enforcement-contract.yml` enforce the boundary.
- Fresh Quality and Certification are mandatory for `58cafcc...`.

### FRESH FAILURE-DRIVEN REPAIR CHAIN
- Quality `33821408442` on `a8e580...` = SUCCESS.
- The autonomy checker was repaired because it was stale against canonical `autonomyGate()` / `autonomy_runtime_gate`; weakened-bridge test-of-test was added.
- Live forensic reconciliation found a migration-lineage gap: `request_decision_approval()` was hardened in live Staging, but the canonical migration was absent from current main. The terminal lifecycle migration was added at `294b43f...`.
- A deeper concurrency review found the preflight lock was insufficient when no approval row existed: a waiting `ON CONFLICT DO UPDATE` could otherwise reopen a terminal row. The live canonical fix is `20260904004000_harden_terminal_approval_concurrency.sql`, applied to Staging.
- `f106f047...` adds test-of-test for that conflict-path guard; `58cafcc...` makes Quality execute it.
- PR #307 forensic comparison exposed the canonical-intelligence test fixture defect and watched-boundary test weakness; both were repaired without wholesale PR merge.
- Execution-enforcement run `33822124077` correctly FAIL CLOSED because its index parser was stale; `e83dc8b...` repaired the checker to recognize the canonical candidate wording.

### APPROVAL / AUTHORITY
- Live memberships: 2 active, both `role=member`; no canonical approver/permission authority table found.
- `decide_approval()` is tenant-scoped, row-locking, PENDING-only, rejects self-approval, and updates only the same-tenant proposed decision.
- `request_decision_approval()` now guards both ordinary and conflict-path terminal resurrection; terminal rows fail closed even after a concurrent wait.
- Direct authenticated DML on audited approval mutation surfaces is not granted.
- Distinct business approver authority remains **PRODUCT DECISION REQUIRED** only if a separate authority class is intended; no business rule is invented.

### SECURITY DEFINER
- Live public SECURITY DEFINER inventory: 30 functions; 18 executable by `authenticated`, 12 restricted; no `anon` execution found in the audited surface.
- Audited definitions use locked `pg_catalog` search paths and schema-qualified application relations.
- Worker mutation RPCs remain privileged-only; authenticated RPCs have tenant/auth or controlled ownership/read semantics.
- Advisor WARNs remain `REQUIRED / EXCESS / UNKNOWN`; no blanket revoke.
- **EXECUTING:** continue function-by-function semantic classification and adversarial input/authority review.

### WORKER / QUEUE
- State domain: `queued|leased|processing|completed|blocked|failed|dead_letter`.
- Claim/heartbeat/checkpoint/complete/fail/retry are tenant/lease/fence guarded and privileged-only.
- DB lifecycle and dead-letter behavior are verified; full deployed runtime worker proof remains unproven.
- **EXECUTING:** stale-worker, expiry, duplicate worker, replay, crash and concurrency contract/test sweep.

### IMPORT / COMPATIBILITY
- `queries-compat.ts` delegates legacy reads to canonical query paths.
- Import history is bounded to 500 with deterministic ordering and overflow rejection.
- Canonical export adapters are tenant-scoped and bounded to 10,000.
- **EXECUTING:** repository-wide caller/legacy/RPC/response/null/error parity sweep.

### WATCHED FILE ENGINE
- Recorder validates tenant context, folder ownership, identity, non-negative size and state domain with tenant-scoped upsert identity.
- Canonical direct-DML migration is applied to live Staging: authenticated INSERT/UPDATE/DELETE on `watched_report_files` are false; recorder RPC EXECUTE is true.
- Test-of-test rejects a deliberately weakened direct-DML boundary.
- Browser watcher derives relative paths from the selected directory; native Electron path reads resolve + realpath + containment and stable-file checks.
- **EXECUTING:** filesystem adversarial proof including traversal, encoded paths, symlink, rename/delete, duplicate/concurrent events, partial writes, restart/rescan and exact-head native evidence.

### OCR / DOCUMENTS
- Golden scope: Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, timeout, duplicate fingerprint, confidence/provenance and page/line references.
- **EXECUTING:** corpus/test evidence where environment permits. Runtime PASS requires actual execution evidence.

### REPORTS / EXPORT
- Required chain: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
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
- **EXECUTING:** remaining unique-delta and migration-lineage decisions.

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
| Certification provenance | YES | YES | **PENDING fresh `58cafcc...`** | N/A | NO |

### EXECUTION DEBT
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Active local execution: compatibility caller/legacy sweep; watched filesystem proof; OCR corpus; report/export adversarial evidence; performance scale; Electron exact-head verification; PR forensic reconciliation; migration lineage; SECURITY DEFINER semantic review; worker adversarial lifecycle; and fresh exact-candidate Quality/Certification evidence.

Owner-only: authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.

### TRUE STOP
Only when local actionable debt is zero, all required security/DB/RPC/compat/import/worker/file/document/report/performance/desktop/certification work is evidenced on the exact candidate, and only Owner/External/Product Decision items remain.
