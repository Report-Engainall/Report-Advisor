# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### CURRENT CODE/TEST CANDIDATE
- **`ea780aca45b9f9d23c8cffed83269eca6e85952c`**.
- Prior candidate `48d7cf...` added the canonical watched-report direct-DML migration and was applied successfully to live Staging.
- `ea780aca...` is a real executable CI-topology checker fix: it recognizes `final-certification-gate.yml` as a governed broad-push certification workflow rather than incorrectly rejecting it.
- `c346e23...` and all earlier historical candidates receive no current evidence.
- Full `c346e23... → f89dbc...` classification: `docs/EVIDENCE/2026-09-04_CANDIDATE_RECONCILIATION_c346-to-f89.md`.

### CERTIFICATION BOUNDARY
- Exact candidate is resolved from this Index, checked out, and compared with `git rev-parse HEAD`.
- Governance-only descendants require candidate ancestry and an explicit allowlisted file surface.
- `check-certification-boundary-integrity.mjs` recognizes canonical and historical candidate wording.
- `check-certification-boundary-integrity.test.mjs` covers exact candidate, ancestry, source mutation and ancestry spoof.
- `final-certification-provenance.test.mjs` covers trigger-specific SHA binding, checkout/HEAD equality and synthetic PR merge-SHA rejection.
- `final-certification-gate.yml` resolves, checks out and verifies exact certification SHA.
- `execution-enforcement-contract.yml` invokes the boundary before execution enforcement.
- `33820282175`, `33820413365`, `33821108053` are historical FAIL-CLOSED runs; none is certification evidence.
- `33821331629` reached boundary verification after candidate reconciliation; current candidate changed again at `ea780...`, so a fresh run is mandatory.

### CI TOPOLOGY FINDING — FIXED
- Fresh Quality run `33821249248` on `ec1ee9e...` executed 20-stage readiness, lint, build, performance budget and production-scale contracts successfully, but failed at `check-ci-execution-topology.mjs` because `final-certification-gate.yml` was incorrectly classified as an unauthorized broad push workflow.
- Root cause: checker allowlist contained `execution-enforcement-contract.yml` but omitted the intentionally broad exact-certification workflow.
- Fixed at `ea780aca...` by adding `final-certification-gate.yml` to the governed broad-push set and enforcing its presence.
- No suppression and no CI skip was used.

### APPROVAL / AUTHORITY
- Live memberships: 2 active, both `role=member`; no canonical approver/permission authority table found.
- `decide_approval()` resolves authenticated tenant, locks approval, requires PENDING, rejects self-approval and updates only the same-tenant proposed decision.
- Direct authenticated table DML on audited approval mutation surfaces is not granted.
- **Distinct business approver role:** `PRODUCT DECISION REQUIRED` only if product semantics require it. No invented role.

### SECURITY DEFINER
- Live public SECURITY DEFINER inventory: 30 functions; 18 executable by `authenticated`, 12 restricted to privileged roles; no `anon` execution found in audited public surface.
- All audited definitions use locked `pg_catalog` search paths and schema-qualified application relations.
- Authenticated-callable functions have tenant/auth checks or controlled read/owned-resource semantics; worker mutation RPCs remain privileged-only.
- Advisor WARNs are classified rather than blanket-revoked: `REQUIRED / EXCESS / UNKNOWN`.
- Prior search-path defect fixed at `5dbf20...`.

### WORKER / QUEUE
- Live state domain: `queued|leased|processing|completed|blocked|failed|dead_letter`.
- Claim/heartbeat/checkpoint/complete/fail/retry are tenant/lease/fence guarded, SECURITY DEFINER and privileged-only.
- Dead-letter transition is live and rollback-safe tested; deployed runtime worker certification remains unproven.

### IMPORT / COMPATIBILITY
- `src/lib/queries-compat.ts` delegates to canonical query paths.
- Import history is bounded to 500 with deterministic ordering and overflow rejection.
- Canonical export adapters are tenant-scoped and bounded to 10,000.
- Remaining action: repository-wide caller/legacy/RPC/response/null/error parity sweep on `ea780...`.

### WATCHED FILE ENGINE
- DB recorder validates tenant context, folder tenant ownership, identity, non-negative size and state domain with tenant-scoped upsert identity.
- Repository lineage gap fixed by `20260904002000_close_watched_report_file_direct_dml_boundary.sql` at `48d7cf...` and applied to live Staging.
- Live verification: authenticated INSERT/UPDATE/DELETE on `watched_report_files` are false; recorder RPC EXECUTE is true.
- End-to-end filesystem normalization/containment remains unproven for `relative_path`.

### STORAGE / REALTIME / AI
- Storage policies are tenant/owner-aware; live application bucket count is 0. Requirement decision required if release-critical.
- Realtime has no published application tables and no repository consumer found. Requirement decision required; not PASS.
- AI/vector architecture is not runtime proof; retrieval authorization, tenant isolation and provenance remain unproven.

### OCR / DOCUMENTS
- Golden scope: Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, timeout, duplicate fingerprint, confidence/provenance and page/line references.
- Runtime PASS requires actual execution evidence.

### REPORTS / EXPORT
- Required chain: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
- Adversarial scope: tenant/period leakage, stale truth, duplicates, NULL/unknown semantics, pagination/bounds, aggregate drift, PDF/RTL, Excel, CSV and artifact integrity.

### PERFORMANCE
- Fresh advisor: 43 unused-index INFO notices.
- Classification: `NON-BLOCKING / OPTIMIZATION` pending workload/EXPLAIN evidence; no blanket deletion.
- Live EXPLAIN samples: import-history query used `idx_import_jobs_company_status`, 0 rows, ~0.20 ms execution; receivables sample used seq scan on a 3-row table, ~0.92 ms execution. Current dataset is too small for production-scale certification.

### DESKTOP / PRs
- Electron 44 evidence must use current exact candidate, never historical SHA evidence.
- PR #305: open, 18 commits/13 files, head `243da9...`; no blind merge. Its watched security implementation overlaps canonical `security.ts`; its direct-DML boundary is now represented by canonical `20260904002000...` rather than wholesale merge.
- PR #307: open, 3 commits/2 files, head `35722f...`; contains stronger watched-boundary test-of-test logic. No blind merge.
- PR #308: open draft, 24 commits/10 files, head `18b067...`; autonomy migrations/workflows/checkers remain separate until canonical reconciliation. No wholesale merge.

### LIVE / RESILIENCE
- Observed READY Vercel deployment `dpl_d7dkae3DeHwfJjyrjXyc7GrYTHQs`, HEAD `bc1218ed...`; HTTP 200 and no selected-window runtime errors.
- It is not current candidate `ea780...`; production certification is not implied.
- Backup/restore, RPO/RTO, rollback/forward recovery and current production binding remain unproven.

### OWNER UNBLOCK QUEUE
| ID | Operation | Real blocker | Prepared | Evidence required | Status |
|---|---|---|---|---|---|
| OWNER-AUTH-01 | Authenticated Tenant A/B E2E | Real interactive credentials/session | Matrix + exact candidate | Authenticated E2E + A/B adversarial proof | OWNER REQUIRED |
| OWNER-AUTH-02 | Leaked-password protection | Auth control-plane | Setting identified | Non-secret enabled state | CONDITIONAL |
| OWNER-DR-01 | Backup + isolated restore | Protected recovery access | Safety/validation procedure | Backup/restore/hash/timing/RPO/RTO | CONDITIONAL |
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
| Certification provenance | YES | YES | **PENDING fresh `ea780...`** | N/A | NO |

### TRUE STOP
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Remaining actionable work: fresh exact-candidate Quality/Certification CI; compatibility caller sweep; watched-file path-resolution proof; OCR golden corpus execution; report/export adversarial evidence; performance scale evidence; Electron/Windows exact-head verification; PR forensic reconciliation; migration-lineage reconciliation; and consumption of fresh evidence.

Owner-only work remains isolated to authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.
