# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence documents. Evidence never crosses an exact-SHA boundary.

### CURRENT CODE/TEST CANDIDATE
- **`48d7cf61afc2a0f40371595d735d67a858b21f08`**.
- `2fe267d7e0d745aeb1fdcf8cb0da114ed2ac63df` was the prior executable certification-boundary parser candidate.
- `48d7cf...` is a real migration mutation: it codifies the already-proven live watched-report direct-DML security boundary into repository migration lineage.
- `c346e23...` and `f89dbc...` are historical candidates only and receive no current evidence.
- 36-commit forensic classification: `docs/EVIDENCE/2026-09-04_CANDIDATE_RECONCILIATION_c346-to-f89.md`.

### CERTIFICATION BOUNDARY
- `check-certification-boundary-integrity.mjs` recognizes `CURRENT_CODE_TEST_CANDIDATE` and historical candidate wording.
- Governance-only descendants must be candidate ancestors and may contain only the explicit governance/evidence allowlist.
- `check-certification-boundary-integrity.test.mjs` covers exact candidate, ancestry, source mutation and ancestry spoof.
- `final-certification-provenance.test.mjs` covers trigger-specific SHA binding, checkout/HEAD equality and synthetic PR merge-SHA rejection.
- `final-certification-gate.yml` resolves, checks out and verifies the exact certification SHA.
- `execution-enforcement-contract.yml` runs the boundary before execution enforcement.
- `33820282175`, `33820413365`, `33821108053` all failed closed on real boundary defects; none is a certification PASS.
- Fresh certification must consume `48d7cf...`; no historical PASS is promoted.

### APPROVAL / AUTHORITY
- Live memberships: 2 active, both `role=member`; no canonical approver/permission authority table found.
- `decide_approval()` resolves authenticated tenant, locks the approval row, requires PENDING, rejects self-approval and updates only the same-tenant PROPOSED decision.
- Direct authenticated table DML on the audited approval mutation surface is not granted.
- **Business approver role:** `PRODUCT DECISION REQUIRED` only if a distinct authority class is required. No speculative rule was added.

### SECURITY DEFINER
- Live public SECURITY DEFINER inventory: 30 functions; 18 executable by `authenticated`, 12 restricted to privileged roles; no `anon` execution found in the audited public surface.
- All audited definitions use locked `pg_catalog` search paths and schema-qualified application relations.
- Authenticated-callable RPCs have tenant/auth checks or are controlled read/owned-resource operations; worker mutation RPCs remain privileged-only.
- Advisor WARNs are not treated as blanket revoke instructions. Classification: `REQUIRED` where frontend contract is proven; `EXCESS` not currently proven; `UNKNOWN` only where business authority/scope cannot be established.
- Leaked-password protection remains protected Auth control-plane work.

### WORKER / QUEUE
- Live state domain: `queued|leased|processing|completed|blocked|failed|dead_letter`.
- Claim/heartbeat/checkpoint/complete/fail/retry are tenant/lease/fence guarded, SECURITY DEFINER and privileged-only.
- Dead-letter transition is live and rollback-safe tested; full deployed runtime worker proof remains unproven.

### IMPORT / COMPATIBILITY
- `src/lib/queries-compat.ts` is a compatibility facade over canonical queries.
- `fetchImportRecords()` is bounded to 500 rows with deterministic ordering and overflow rejection.
- Canonical export adapters are tenant-scoped and bounded to 10,000 rows.
- Remaining action: repository-wide caller/legacy/RPC/response/null/error parity sweep on `48d7cf...`.

### WATCHED FILE ENGINE
- `record_watched_report_file()` validates tenant context, folder tenant ownership, identity, non-negative size and state domain, with tenant-scoped upsert identity.
- Repository lineage gap found: original `20260825110000_watched_report_folders.sql` granted the RPC but did not codify the direct-DML revoke.
- **Fixed:** `20260904002000_close_watched_report_file_direct_dml_boundary.sql` at candidate `48d7cf...`; applied successfully to live Staging.
- Live verification: `authenticated` has `INSERT=false`, `UPDATE=false`, `DELETE=false` on `watched_report_files`, while RPC `EXECUTE=true`.
- `relative_path` still requires end-to-end filesystem normalization/containment proof; no speculative DB rule was added.

### STORAGE / REALTIME / AI
- Storage policies are tenant/owner-aware; live application bucket count is 0. Requirement decision required if Storage is release-critical.
- Realtime has no published application tables and no repository consumer found. Requirement decision required; not PASS.
- AI/vector architecture is not runtime proof; retrieval authorization, tenant isolation and provenance remain unproven.

### OCR / DOCUMENTS
- Golden scope: Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, timeout, duplicate fingerprint, confidence/provenance and page/line references.
- Runtime PASS requires actual execution evidence.

### REPORTS / EXPORT
- Required chain: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
- Adversarial scope: tenant/period leakage, stale truth, duplicates, NULL/unknown semantics, pagination/bounds, aggregate drift, PDF/RTL, Excel, CSV and artifact integrity.

### PERFORMANCE
- Fresh performance advisor: 43 unused-index INFO notices.
- Current classification: `NON-BLOCKING / OPTIMIZATION`, pending workload/EXPLAIN evidence. No blanket deletion.

### DESKTOP / PRs
- Electron 44 evidence must use `48d7cf...` or a later exact candidate, never historical SHA evidence.
- PR #305: open, 18 commits/13 files, head `243da9...`; no blind merge. Its watched security code overlaps current `security.ts`, and its direct-DML migration is now represented by the canonical `20260904002000...` migration rather than merged wholesale.
- PR #307: open, 3 commits/2 files, head `35722f...`; contains stronger watched-boundary test-of-test logic, but no blind merge.
- PR #308: open draft, 24 commits/10 files, head `18b067...`; contains autonomy migrations/workflows/checkers. No wholesale merge; current main overlaps certification hardening and live migration history does not contain its two exact migration versions.

### LIVE / RESILIENCE
- Observed READY Vercel deployment: `dpl_d7dkae3DeHwfJjyrjXyc7GrYTHQs`, HEAD `bc1218ed...`; HTTP 200 and no selected-window runtime errors.
- Deployment is not candidate `48d7cf...`; production certification is not implied.
- Backup/restore, RPO/RTO, rollback/forward recovery and current production binding remain unproven.

### OWNER UNBLOCK QUEUE
| ID | Operation | Real blocker | Assistant preparation | Evidence required | Status |
|---|---|---|---|---|---|
| OWNER-AUTH-01 | Authenticated Tenant A/B E2E | Real interactive credentials/session | Matrix + exact candidate boundary | Authenticated E2E + A/B adversarial proof | OWNER REQUIRED |
| OWNER-AUTH-02 | Leaked-password protection | Auth control-plane | Exact setting identified | Non-secret enabled state | OWNER REQUIRED / CONDITIONAL |
| OWNER-DR-01 | Backup + isolated restore | Protected recovery access | Safety/validation procedure | Backup/restore/hash/timing/RPO/RTO | OWNER REQUIRED / CONDITIONAL |
| OWNER-DR-02 | Rollback + forward recovery | Protected deployment access | Drill/evidence contract | Deployment + health + recovery proof | OWNER REQUIRED / CONDITIONAL |
| OWNER-WIN-01 | Native Windows smoke | Physical/native environment if CI unavailable | Exact command packet | Exact-head logs/artifact | OWNER REQUIRED / CONDITIONAL |

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
| Certification provenance | YES | YES | **PENDING fresh `48d7cf...`** | N/A | NO |

### TRUE STOP
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Remaining local work: fresh exact-candidate CI; compatibility caller sweep; watched-file path-resolution audit; OCR corpus execution; report/export adversarial evidence; performance EXPLAIN/scale evidence; Electron/Windows exact-head verification; PR forensic reconciliation; migration-lineage reconciliation; certification evidence consumption.

Owner-only work remains isolated to real authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.
