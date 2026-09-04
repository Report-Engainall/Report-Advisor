# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### EXACT CANDIDATE
- **CURRENT CODE/TEST CANDIDATE:** `294b43f19e637b4639474f8c1db14d2ba7be1a81`
- `a8e58002df1667ed7fa90f452e61f18c249b6592` was the previous executable checker candidate; Quality run `33821408442` passed on that exact SHA.
- `294b43f...` is a newer executable DB-lineage repair: it restores the canonical migration for the terminal approval reopen boundary already present in live Staging.
- Main may receive governance/index descendants after the candidate; certification must resolve the candidate from this index and enforce ancestry/allowlisted-path rules.

### CERTIFICATION BOUNDARY
- Exact candidate checkout + HEAD equality required.
- Governance-only descendants require ancestry and explicit allowlisted paths.
- Provenance must bind push/PR/manual trigger to the tested SHA; synthetic PR merge SHAs are rejected.
- `final-certification-gate.yml` and `execution-enforcement-contract.yml` enforce the boundary.
- Fresh Quality and Certification are mandatory for `294b43f...`.

### FRESH FAILURE-DRIVEN REPAIR CHAIN
- Quality `33821408442` on `a8e580...` = **SUCCESS**.
- The autonomy checker was repaired because it was stale against canonical `autonomyGate()` / `autonomy_runtime_gate`; weakened-bridge test-of-test was added.
- Live forensic reconciliation then found a migration-lineage gap: `request_decision_approval()` was hardened in live Staging, but the canonical migration was absent from current main.
- PR #305 contained the historical equivalent, but its branch diverged. No wholesale merge was performed.
- The behavior was selectively reconciled into migration `20260904003000_close_terminal_approval_reopen_boundary.sql`, applied to live Staging, and committed at `294b43f...`.

### APPROVAL / AUTHORITY
- Live memberships: 2 active, both `role=member`; no canonical approver/permission authority table found.
- `decide_approval()` is tenant-scoped, row-locking, PENDING-only, rejects self-approval, and updates only the same-tenant proposed decision.
- `request_decision_approval()` now has canonical terminal-state lineage: APPROVED/REJECTED/CANCELLED cannot reopen to PENDING.
- Direct authenticated DML on audited approval mutation surfaces is not granted.
- Distinct business approver authority remains **PRODUCT DECISION REQUIRED** only if a separate authority class is intended; no business rule is invented.

### SECURITY DEFINER
- Live public SECURITY DEFINER inventory: 30 functions; 18 executable by `authenticated`, 12 restricted; no `anon` execution found in the audited surface.
- Audited definitions use locked `pg_catalog` search paths and schema-qualified application relations.
- Worker mutation RPCs remain privileged-only; authenticated RPCs have tenant/auth or controlled ownership/read semantics.
- Advisor WARNs remain classified `REQUIRED / EXCESS / UNKNOWN`; no blanket revoke.

### WORKER / QUEUE
- State domain: `queued|leased|processing|completed|blocked|failed|dead_letter`.
- Claim/heartbeat/checkpoint/complete/fail/retry are tenant/lease/fence guarded and privileged-only.
- DB lifecycle and dead-letter behavior are verified; full deployed runtime worker proof remains unproven.

### IMPORT / COMPATIBILITY
- `queries-compat.ts` delegates legacy reads to canonical query paths.
- Import history is bounded to 500 with deterministic ordering and overflow rejection.
- Canonical export adapters are tenant-scoped and bounded to 10,000.
- **EXECUTING:** repository-wide caller/legacy/RPC/response/null/error parity sweep.

### WATCHED FILE ENGINE
- Recorder validates tenant context, folder ownership, identity, non-negative size and state domain with tenant-scoped upsert identity.
- Canonical direct-DML migration is applied to live Staging: authenticated INSERT/UPDATE/DELETE on `watched_report_files` are false; recorder RPC EXECUTE is true.
- **EXECUTING:** filesystem normalization/containment proof including traversal, symlink, rename/delete, duplicate/concurrent and restart/rescan behavior.

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

### PERFORMANCE
- 43 unused-index INFO notices are classified `NON-BLOCKING / OPTIMIZATION` pending workload evidence.
- Tiny-data EXPLAIN samples are not production-scale proof.
- **EXECUTING:** scale, bounds, pagination, contention, timeout and concurrency evidence.

### DESKTOP / PR RECONCILIATION
- Electron evidence must use the exact current candidate.
- PR #305 is open and diverged; its terminal-approval migration was selectively reconciled, with no wholesale merge.
- PR #307 watched-boundary changes remain selective candidates.
- PR #308 autonomy changes remain separate until canonical reconciliation.
- **EXECUTING:** forensic unique-delta decisions and migration-lineage sweep.

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
| Approval/RBAC | YES | YES | DB + lineage | NO | NO |
| Worker | YES | YES | DB + regression | NO full runtime | NO |
| Tenant isolation | YES | YES | DB adversarial | NO current A/B browser | NO |
| Import/compat | YES | YES | Partial | NO | NO |
| OCR | YES/architecture | PARTIAL | Partial | NO | NO |
| Reports/export | YES | PARTIAL | Partial | NO | NO |
| Storage | YES/policies | NO contract | Policy | NO | NO |
| Realtime | Client capability | NO publication | NO | NO | NO |
| AI/vector | Architecture | PARTIAL | Architecture | NO | NO |
| Certification provenance | YES | YES | **PENDING fresh `294b43f...`** | N/A | NO |

### EXECUTION DEBT
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Active local execution: compatibility sweep; watched filesystem proof; OCR corpus; reports/export adversarial evidence; performance scale; Electron exact-head verification; PR forensic reconciliation; migration lineage; and fresh exact-candidate certification evidence.

Owner-only: authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.

### TRUE STOP
Only when local actionable debt is zero, all required security/DB/RPC/compat/import/worker/file/document/report/performance/desktop/certification work is evidenced on the exact candidate, and only Owner/External/Product Decision items remain.
