# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative current execution index. Historical evidence remains preserved in Git history and dated evidence documents. Evidence never crosses an exact-SHA boundary.

### CURRENT PROJECT STATE
- Repository: `Report-Engainall/Report-Advisor`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2fe267d7e0d745aeb1fdcf8cb0da114ed2ac63df`.
- Previous candidate `f89dbc05e9e392ee2d549fec15108add55708392` was superseded by a real executable certification-boundary parser fix in `2fe267...`; it is not used for current certification.
- `c346e23... → f89dbc...` forensic reconciliation is preserved in `docs/EVIDENCE/2026-09-04_CANDIDATE_RECONCILIATION_c346-to-f89.md`.
- Exact-head certification is fail-closed: stale, missing, synthetic merge, decoy, skipped, or weakened evidence is not accepted.

### CANDIDATE RECONCILIATION
- `f89dbc...` was proven to be the latest executable candidate at the start of this cycle.
- Fresh certification execution on an index-only descendant exposed a checker/parser mismatch: the index used canonical `CURRENT_CODE_TEST_CANDIDATE` wording while the checker accepted older wording only.
- This was a genuine checker defect. It was repaired at `2fe267d7e0d745aeb1fdcf8cb0da114ed2ac63df`.
- Because the repair is executable certification code, `2fe267...` is now the current code/test candidate.

### CERTIFICATION BOUNDARY
- `check-certification-boundary-integrity.mjs` accepts the canonical candidate wording and still rejects non-governance deltas, non-ancestor candidates, and invalid HEADs.
- Governance-only descendants may contain only explicitly allowlisted certification/index/evidence paths and must preserve candidate ancestry.
- `check-certification-boundary-integrity.test.mjs` covers exact candidate, governed ancestry, source mutation rejection, and ancestry spoof rejection.
- `final-certification-provenance.test.mjs` covers trigger-specific SHA binding, checkout-to-certification equality, and synthetic PR merge-SHA rejection.
- `.github/workflows/final-certification-gate.yml` resolves the certification SHA, checks it out, verifies `git rev-parse HEAD`, and emits exact provenance evidence.
- `.github/workflows/execution-enforcement-contract.yml` invokes the certification boundary before execution-enforcement checks.
- Run `33820282175`: correctly failed closed on an earlier parser mismatch.
- Run `33820413365`: correctly failed closed because the stale index candidate could not be resolved by the checker.
- Run `33821108053`: correctly failed closed and exposed the canonical candidate-token parser defect on the newly synchronized index. No certification PASS was inferred.
- A fresh run on `2fe267...` is required; no historical run is promoted.

### APPROVAL / AUTHORITY
- Live `company_memberships`: 2 active memberships, both `role=member`; no separate approver/permission authority model was found.
- `decide_approval()` resolves authenticated tenant, requires PENDING state, row-locks the approval, rejects self-approval, and updates the same-tenant proposed decision atomically.
- Approval mutation tables are not directly writable by `authenticated` in the audited grant surface.
- Cross-tenant and forged-ID protection is enforced by current-company scoping and row lookup.
- **Status:** DB/security boundary proven; explicit business approver-role semantics are **PRODUCT DECISION REQUIRED** if a distinct approver authority is intended. No speculative role was invented.

### SECURITY DEFINER — CURRENT LIVE AUDIT
- Live public SECURITY DEFINER inventory contains 30 functions; 18 are intentionally executable by `authenticated`, 12 are restricted to privileged roles in the current ACL audit. No `anon` execution was found in the audited public surface.
- The authenticated-callable functions all resolve tenant context or operate as controlled read/owned-resource mutation paths; worker mutation functions remain service-role-only.
- `current_company_id`, approval/work-item/outcome/report read/write RPCs, and autonomy read gates are callable by authenticated users by design; this is **REQUIRED** only where the frontend contract needs the RPC. The advisor WARN alone is not treated as excess privilege.
- `is_trust_certificate_valid`, `is_continuous_trust_healthy`, `can_execute_bi_decision`, `can_execute_control_plane_run`, `can_certify_autonomous_domain`, `can_release_production_certification`, worker lifecycle mutation RPCs, audit trigger, and `update_recommendation_status` are restricted from authenticated in the current ACL audit.
- All audited public SECURITY DEFINER functions use `SET search_path TO 'pg_catalog'`; application relations are explicitly schema-qualified in the live definitions.
- Prior search-path defect was fixed by `20260902231600_reconcile_security_definer_search_path_qualification.sql` at `5dbf20...`.
- **Security classification:** REQUIRED where authenticated RPC is a proven frontend contract; EXCESS not currently proven; UNKNOWN only where business authority/product scope cannot be established from repository+DB evidence.
- Leaked-password protection remains a protected Auth control-plane item, not a code mutation.

### WORKER / QUEUE
- Live lifecycle supports `queued|leased|processing|completed|blocked|failed|dead_letter` with attempt/max-attempt constraints, unique `(company_id,job_key)`, tenant FK and ready-job indexing.
- Claim/heartbeat/checkpoint/complete/fail/retry are SECURITY DEFINER with locked search path and restricted execution.
- Dead-letter terminal transition fixed in `20260903160000_restore_report_execution_dead_letter_terminal_transition.sql`.
- Live rollback-safe tests proved max-attempt dead-lettering, retry restoration for non-terminal failure, null-error rejection, and terminal non-retry.
- Existing adversarial regression covers stale lease, fencing, idempotency, expiry, retry counts and terminal resurrection.
- **Status:** DB boundary proven; full deployed runtime worker certification remains unproven.

### IMPORT / COMPATIBILITY
- `src/lib/queries-compat.ts` is a compatibility facade over canonical query functions plus bounded import/report adapters.
- `fetchImportRecords()` is bounded to 500 rows and rejects overflow instead of silently truncating; deterministic ordering is by `created_at DESC, id ASC`.
- Export adapters use canonical tenant-scoped RPCs with an explicit 10,000-row bound.
- Import terminal progress and terminal-job resurrection are guarded.
- Remaining closure: repository-wide caller inventory and canonical-vs-legacy response/NULL/error semantics regression must still be consumed on the current candidate.

### DECISION / RECOMMENDATION
- One-to-one bidirectional relationship hardening is live: partial unique indexes, row locks, conflicting-link rejection and atomic same-tenant linking.
- `CANCELLED` approval consistency is live and requires terminal provenance.

### TENANT / SECURITY TRUTH
- Live Staging audit: 78/78 public tables have RLS; 147 policies; 0 policies target `anon`; 0 policies target `PUBLIC`.
- Tenant isolation has prior DB/adversarial contract proof. Current authenticated browser A/B proof remains runtime-unproven and must not be inferred from contract tests.

### WATCHED FILE / FILE ENGINE
- Live `record_watched_report_file()` enforces authenticated tenant context, folder ownership by tenant, non-null identity, non-negative size and bounded state domain, with tenant-scoped upsert identity.
- Current function does not itself reject path traversal tokens in `relative_path`; therefore filesystem safety must be proven in the node/desktop path-resolution layer before this RPC input is considered safe end-to-end.
- **Status:** DB boundary proven; filesystem/runtime path-safety proof remains active.

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
- **Status:** `UNPROVEN`.

### REPORTS / EXPORT
- Required chain: canonical truth → calculation → report query → artifact → SHA-256 → provenance → export.
- Required adversarial checks: tenant/period leakage, stale truth, duplicates, NULL/unknown semantics, pagination, bounds, aggregate drift, PDF/RTL, Excel, CSV and artifact integrity.
- `get_receivables_report_page()` enforces tenant scope and page-size max 100.
- **Status:** active evidence front; production certification not inferred from static code.

### PERFORMANCE / SCALE
- Fresh Supabase performance advisor reports **43 unused-index notices**, all `INFO`, not P0 findings.
- Current classification: **NON-BLOCKING / OPTIMIZATION** pending workload evidence. No index is dropped merely to silence the advisor.
- Important bounded surfaces include import history max 500, canonical export max 10,000, receivables page max 100 and worker ready/lease indexes.
- Next evidence: EXPLAIN and controlled large-tenant/import/report measurements.

### DESKTOP / ELECTRON
- Electron 44 remediation must be evaluated against `CURRENT_CODE_TEST_CANDIDATE` `2fe267...`, not historical SHAs.
- Required: dependency tree/audit, typecheck/build, native smoke where available, and exact-head Windows evidence when CI cannot supply it.

### PR #305 / #307 / #308
- PR #305: open, 18 commits, 13 files, base `ecfb8b...`, head `243da9...`; not blindly merged.
- PR #307: open, 3 commits, 2 files, base `243da9...`, head `35722f...`; test-only according to its declared scope.
- PR #308: open draft, 24 commits, 10 files, base `c346e23...`, head `18b067...`; includes autonomy runtime migrations/workflows/checkers not yet present in live migration history under their exact versions. No wholesale merge performed.
- Canonical main is preferred; unique PR deltas must be reconciled against current candidate before any merge/cherry-pick.

### LIVE DEPLOYMENT / RESILIENCE
- Observed READY Vercel deployment: `dpl_d7dkae3DeHwfJjyrjXyc7GrYTHQs`, HEAD `bc1218ed...`.
- Production HTML returned HTTP 200; selected recent runtime-error inspection returned no runtime errors.
- Deployment is not current candidate `2fe267...`; therefore it cannot certify current production state.
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

Remaining actionable fronts: fresh exact-candidate CI, compatibility caller sweep, watched-file path-safety end-to-end review, OCR corpus execution, report/export adversarial verification, performance EXPLAIN/scale evidence, Electron/Windows exact-head verification, PR forensic reconciliation, migration-lineage reconciliation and certification evidence consumption.

Owner-only work is isolated to real authenticated browser sessions, Auth control-plane settings, protected backup/restore/rollback, and unavoidable native Windows/protected deployment operations.
