# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### CURRENT CODE/TEST CANDIDATE
- **`2fe267d7e0d745aeb1fdcf8cb0da114ed2ac63df`**
- This SHA is the executable certification-boundary parser hardening that followed the forensic reconciliation of `c346e23... → f89dbc...`.
- `c346e23...` is stale and must not receive current evidence.
- `f89dbc...` is superseded by the real parser fix at `2fe267...`.
- Forensic 36-commit classification: `docs/EVIDENCE/2026-09-04_CANDIDATE_RECONCILIATION_c346-to-f89.md`.

### CERTIFICATION BOUNDARY — CURRENT TRUTH
- `check-certification-boundary-integrity.mjs` now recognizes the canonical `CURRENT_CODE_TEST_CANDIDATE` token as well as established historical wording.
- The checker requires the candidate to be an ancestor of a governance-only descendant and rejects any non-allowlisted changed path.
- `check-certification-boundary-integrity.test.mjs`: exact candidate + ancestry + source-mutation + ancestry-spoof adversarial coverage.
- `final-certification-provenance.test.mjs`: trigger-specific SHA binding + checkout/HEAD equality + synthetic PR merge-SHA rejection.
- `final-certification-gate.yml`: resolves certification SHA, checks out exact SHA, verifies HEAD and records provenance.
- `execution-enforcement-contract.yml`: invokes the boundary before execution enforcement.
- Run `33820282175`: FAIL CLOSED — parser wording mismatch; this exposed a real checker defect.
- Run `33820413365`: FAIL CLOSED — stale candidate was not accepted.
- Run `33821108053`: FAIL CLOSED — canonical candidate token was not recognized; parser fix produced `2fe267...`.
- Fresh certification must consume `2fe267...`; no historical PASS is promoted.

### APPROVAL / AUTHORITY
- Live memberships: 2 active memberships, both `role=member`; no canonical approver/permission table found.
- `decide_approval()` resolves authenticated tenant, locks the approval row, requires PENDING, rejects self-approval, and updates only the same-tenant PROPOSED decision.
- Direct authenticated table DML on the audited approval mutation surface is not granted.
- **Business approver role:** `PRODUCT DECISION REQUIRED` only if the product requires a distinct authority class. No rule invented.

### SECURITY DEFINER
- Live public SECURITY DEFINER inventory: 30 functions; 18 currently executable by `authenticated`; 12 restricted to privileged roles. `anon` execution was not found in the audited surface.
- All audited definitions use locked `pg_catalog` search path with explicitly qualified application relations.
- Authenticated-callable RPCs have tenant/auth checks or are controlled read/owned-resource operations. Worker mutation RPCs remain privileged-only.
- Supabase advisor WARNs are therefore not blanket-revoke instructions. Current classification is `REQUIRED` where frontend contract is proven, `EXCESS` not proven, `UNKNOWN` only where business authority/scope cannot be established.
- Leaked-password protection remains protected Auth control-plane work.

### WORKER / QUEUE
- Live state domain: `queued|leased|processing|completed|blocked|failed|dead_letter`.
- Claim/heartbeat/checkpoint/complete/fail/retry are tenant-scoped, lease/fence guarded, SECURITY DEFINER, and privileged-only.
- Dead-letter transition is live and rollback-safe tested; full deployed runtime worker proof remains unproven.

### IMPORT / COMPATIBILITY
- `src/lib/queries-compat.ts` is a compatibility facade over canonical query functions.
- Import history is bounded to 500 rows with deterministic ordering and overflow rejection.
- Canonical export adapters are tenant-scoped and bounded to 10,000 rows.
- Remaining action: repository-wide caller/legacy/RPC/response/null/error parity sweep on current candidate.

### WATCHED FILE ENGINE
- DB RPC validates tenant context, folder tenant ownership, identity, non-negative size and state domain, with tenant-scoped upsert identity.
- `relative_path` itself is not currently rejected for traversal tokens at the DB boundary. Filesystem/node/Windows path resolution must prove normalization/containment before end-to-end safety can be certified.

### STORAGE / REALTIME / AI
- Storage policies are tenant/owner-aware; live application bucket count is 0. **Requirement decision required** if Storage is release-critical.
- Realtime has no published application tables and no repository consumer found. **Requirement decision required**; not PASS.
- AI/vector architecture is not runtime proof; retrieval authorization, tenant isolation and provenance remain unproven.

### OCR / DOCUMENTS
- Golden evidence scope: Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, timeout, duplicate fingerprint, confidence/provenance and page/line references.
- Runtime PASS requires actual execution evidence.

### REPORTS / EXPORT
- Required chain: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
- Adversarial scope includes tenant/period leakage, stale truth, duplicate rows, NULL/unknown semantics, pagination/bounds, aggregate drift, PDF/RTL, Excel, CSV and artifact integrity.

### PERFORMANCE
- Fresh performance advisor reports 43 unused-index notices, all INFO.
- Current classification: **NON-BLOCKING / OPTIMIZATION**, pending workload/EXPLAIN evidence. No blanket index deletion.

### DESKTOP / PRs
- Electron 44 evidence must use `2fe267...` or a later exact candidate, never historical SHA evidence.
- PR #305: open, 18 commits/13 files, head `243da9...`; no blind merge.
- PR #307: open, 3 commits/2 files, head `35722f...`; test-only scope.
- PR #308: open draft, 24 commits/10 files, head `18b067...`; contains autonomy migrations/workflows/checkers. No wholesale merge; current main already contains overlapping certification hardening, while live migration history does not contain PR #308's two exact migration versions.

### LIVE / RESILIENCE
- Observed READY Vercel deployment: `dpl_d7dkae3DeHwfJjyrjXyc7GrYTHQs`, HEAD `bc1218ed...`; HTTP 200 and no selected-window runtime errors.
- This deployment is not the current candidate. Production certification is therefore not implied.
- Backup/restore, RPO/RTO, rollback/forward recovery and current production binding remain unproven.

### OWNER UNBLOCK QUEUE
| ID | Operation | Real blocker | Prepared by assistant | Evidence required | Status |
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
| Certification provenance | YES | YES | **PENDING fresh `2fe267...`** | N/A | NO |

### TRUE STOP
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Remaining local work: fresh exact-candidate CI; compatibility caller sweep; watched-file path-resolution audit; OCR corpus execution; report/export adversarial evidence; performance EXPLAIN/scale evidence; Electron/Windows exact-head verification; PR forensic reconciliation; migration-lineage reconciliation; certification evidence consumption.

Owner-only work remains isolated to real authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.
