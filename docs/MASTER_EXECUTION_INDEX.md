# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### CURRENT CODE/TEST CANDIDATE
- **`a8e58002df1667ed7fa90f452e61f18c249b6592`**.
- Prior executable candidates: `ea780aca...` (CI topology checker) → `48d7cf...` (watched direct-DML migration) → `2fe267...` (certification parser).
- `a8e580...` is a real executable test/checker repair: `check-autonomy-safety-chain.mjs` was aligned to the canonical runtime method `autonomyGate()` and now includes an adversarial weakened-bridge test-of-test.
- No historical evidence is promoted across these candidate boundaries.
- Full `c346e23... → f89dbc...` classification is preserved in `docs/EVIDENCE/2026-09-04_CANDIDATE_RECONCILIATION_c346-to-f89.md`.

### CERTIFICATION BOUNDARY
- Candidate is resolved from this Index, checked out, and exact HEAD is verified.
- Governance-only descendants require candidate ancestry and explicit allowlisted paths.
- Boundary checker recognizes canonical and historical candidate wording and rejects source mutation/ancestry spoofing.
- Provenance checker binds push/PR/manual trigger to the tested SHA and rejects synthetic PR merge SHA as evidence.
- `final-certification-gate.yml` performs checkout + HEAD equality + provenance.
- `execution-enforcement-contract.yml` invokes the boundary before enforcement.
- Historical runs `33820282175`, `33820413365`, `33821108053`, `33821331629` failed closed on genuine defects; none is certification PASS.
- Fresh certification is mandatory for `a8e580...`.

### QUALITY FAILURE-DRIVEN REPAIR CHAIN
- `33821249248` on `ec1ee9e...`: 20-stage readiness, lint, build, performance budget and production-scale contracts passed; CI topology failed because `final-certification-gate.yml` was missing from the governed broad-push allowlist.
- `ea780aca...` fixed that checker defect.
- A subsequent certification sweep on the prior boundary found `check-autonomy-safety-chain.mjs` required obsolete `canAutonomouslyExecute` text while the canonical runtime exposes `autonomyGate()` and calls `autonomy_runtime_gate`.
- `a8e580...` repaired that mismatch and added test-of-test rejection of a weakened runtime bridge.
- These are genuine checker/test defects found by running the checks; they were not suppressed.

### APPROVAL / AUTHORITY
- Live memberships: 2 active, both `role=member`; no canonical approver/permission table found.
- `decide_approval()` resolves authenticated tenant, locks approval, requires PENDING, rejects self-approval and updates only the same-tenant proposed decision.
- Direct authenticated DML on audited approval mutation surfaces is not granted.
- Distinct business approver authority remains `PRODUCT DECISION REQUIRED` only if the product intends a separate authority class. No rule invented.

### SECURITY DEFINER
- Live public SECURITY DEFINER inventory: 30 functions; 18 executable by `authenticated`, 12 restricted; no `anon` execution found in audited surface.
- All audited definitions use locked `pg_catalog` search paths and schema-qualified application relations.
- Authenticated RPCs have tenant/auth checks or controlled read/owned-resource semantics; worker mutation RPCs remain privileged-only.
- Advisor WARNs are classified `REQUIRED / EXCESS / UNKNOWN`; no blanket revoke.
- Prior search-path defect fixed at `5dbf20...`.

### WORKER / QUEUE
- State domain: `queued|leased|processing|completed|blocked|failed|dead_letter`.
- Claim/heartbeat/checkpoint/complete/fail/retry are tenant/lease/fence guarded, SECURITY DEFINER and privileged-only.
- Dead-letter transition is live and rollback-safe tested. Full deployed runtime worker proof remains unproven.

### IMPORT / COMPATIBILITY
- `src/lib/queries-compat.ts` delegates to canonical query paths.
- Import history bounded to 500 with deterministic ordering and overflow rejection.
- Canonical export adapters tenant-scoped and bounded to 10,000.
- Remaining action: repository-wide caller/legacy/RPC/response/null/error parity sweep on current candidate.

### WATCHED FILE ENGINE
- DB recorder validates tenant context, folder tenant ownership, identity, non-negative size and state domain with tenant-scoped upsert identity.
- Repository lineage gap fixed by `20260904002000_close_watched_report_file_direct_dml_boundary.sql` at `48d7cf...`; applied successfully to live Staging.
- Live authenticated INSERT/UPDATE/DELETE on `watched_report_files` are false; recorder RPC EXECUTE is true.
- `relative_path` still needs end-to-end filesystem normalization/containment proof.

### STORAGE / REALTIME / AI
- Storage policies tenant/owner-aware; live application bucket count 0. Requirement decision required if release-critical.
- Realtime has no published application tables and no repository consumer found. Requirement decision required; not PASS.
- AI/vector architecture is not runtime proof; retrieval authorization, tenant isolation and provenance remain unproven.

### OCR / DOCUMENTS
- Golden scope: Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, timeout, duplicate fingerprint, confidence/provenance and page/line references.
- Runtime PASS requires actual execution evidence.

### REPORTS / EXPORT
- Required chain: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
- Adversarial scope: tenant/period leakage, stale truth, duplicates, NULL/unknown semantics, pagination/bounds, aggregate drift, PDF/RTL, Excel, CSV and artifact integrity.

### PERFORMANCE
- Fresh advisor: 43 unused-index INFO notices; classification `NON-BLOCKING / OPTIMIZATION` pending workload evidence.
- Live EXPLAIN samples were sub-millisecond on tiny current data; import history used `idx_import_jobs_company_status`. This is not production-scale proof.

### DESKTOP / PRs
- Electron 44 evidence must use current exact candidate, never historical SHA.
- PR #305: open, 18 commits/13 files, head `243da9...`; watched security code overlaps canonical `security.ts`; direct-DML boundary is now represented by canonical migration, so no wholesale merge.
- PR #307: open, 3 commits/2 files, head `35722f...`; stronger watched-boundary test-of-test remains a selective candidate, not a blind merge.
- PR #308: open draft, 24 commits/10 files, head `18b067...`; autonomy migrations/workflows/checkers remain separate until canonical reconciliation. No wholesale merge.

### LIVE / RESILIENCE
- Observed READY Vercel deployment `dpl_d7dkae3DeHwfJjyrjXyc7GrYTHQs`, HEAD `bc1218ed...`; HTTP 200 and no selected-window runtime errors.
- Deployment is not candidate `a8e580...`; production certification is not implied.
- Backup/restore, RPO/RTO, rollback/forward recovery and current production binding remain unproven.

### OWNER UNBLOCK QUEUE
| ID | Operation | Real blocker | Prepared | Evidence required | Status |
|---|---|---|---|---|---|
| OWNER-AUTH-01 | Authenticated Tenant A/B E2E | Real interactive credentials/session | Matrix + exact candidate | Authenticated E2E + A/B adversarial proof | OWNER REQUIRED |
| OWNER-AUTH-02 | Leaked-password protection | Auth control-plane | Setting identified | Non-secret enabled state | CONDITIONAL |
| OWNER-DR-01 | Backup + isolated restore | Protected recovery access | Safety/validation | Backup/restore/hash/timing/RPO/RTO | CONDITIONAL |
| OWNER-DR-02 | Rollback + forward recovery | Protected deployment access | Drill/evidence contract | Deployment/health/recovery proof | CONDITIONAL |
| OWNER-WIN-01 | Native Windows smoke | Physical/native environment if CI unavailable | Exact command packet | Exact-head logs/artifact | CONDITIONAL |

### STATE MATRIX
| Front | BUILT | INTEGRATED | VERIFIED | RUNTIME PROVEN | PRODUCTION CERTIFIED |
|---|---|---|---|---|---|
| Approval/RBAC | YES | YES | DB boundary | NO | NO |
| Worker | YES | YES | DB + regression | NO full runtime | NO |
| Tenant isolation | YES | YES | DB adversarial | NO current A/B browser | NO |
| Import/compat | YES | YES | Partial regression | NO | NO |
| OCR | YES/architecture | PARTIAL | Partial | NO | NO |
| Reports/export | YES | PARTIAL | Partial | NO | NO |
| Storage | YES/policies | NO bucket contract | Policy | NO | NO |
| Realtime | Client capability | NO consumer/publication | NO | NO | NO |
| AI/vector | Architecture | PARTIAL | Architecture only | NO | NO |
| Certification provenance | YES | YES | **PENDING fresh `a8e580...`** | N/A | NO |

### TRUE STOP
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Independent local work remains: fresh exact-candidate Quality/Certification CI; compatibility caller/legacy sweep; watched-file path-resolution proof; OCR golden corpus execution; report/export adversarial evidence; performance scale evidence; Electron/Windows exact-head verification; PR forensic reconciliation; migration-lineage reconciliation; and fresh evidence consumption.

Owner-only work remains isolated to authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.
