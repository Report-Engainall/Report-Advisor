# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### EXECUTION SCOPE / BRANCH
- **Repository:** `Report-Engainall/Report-Advisor`
- **Current execution branch:** `main`
- **Current main:** `4f34d33a8a3724fde55355763c4174639b42274b`
- **Current code/test candidate:** `4f34d33a8a3724fde55355763c4174639b42274b`
- Previous executable candidate: `b44a823b22653aded1408d36c6e5a109e4df4c3d`.
- Previous governance/test additions in this wave: `396086781a4723c23a90a8486b8b4cf81936bec9`, `aa155ffdfce7a0addd17b337677e4b5c3039376d`, `38394120323da4f73bd2765b1f754b27e100111b`, `262fda100fcad7429ddd4928af96c8c3e14e05ff`, `4f34d33a8a3724fde55355763c4174639b42274b`.
- Execution scope: P0 certification/test integrity; P0 security/database/RPC/RLS/tenant isolation; P1 compatibility/legacy; worker/filesystem/OCR/documents; P2 reports/export/performance; PR/desktop reconciliation; final evidence/certification.
- Independent fronts run in parallel; Owner intervention is deferred until locally actionable work is exhausted.

### EXACT CANDIDATE
- **CURRENT CODE/TEST CANDIDATE:** `4f34d33a8a3724fde55355763c4174639b42274b`
- Browser E2E now verifies the browser-held Supabase session and calls the canonical `current_company_id` RPC through the real authenticated browser context; it does not use service-role credentials.
- The Golden E2E corpus contract explicitly enforces an expected disposition for all 7 corpus cases, including `inventory-excel`.
- Certification evidence is valid only for this exact candidate or an explicitly governed ancestry of it.

### E2E WAVE — FULL PRODUCT BROWSER DISCOVERY
- Baseline before mutation: `083225068f1e2d390f6e1d50e8b178a1e8e1bacb`.
- Browser harness initial implementation: `396086781a4723c23a90a8486b8b4cf81936bec9`.
- Browser CI workflow: `aa155ffdfce7a0addd17b337677e4b5c3039376d`.
- Golden corpus expected-disposition coverage repaired at `38394120323da4f73bd2765b1f754b27e100111b`.
- Evidence ledger: `262fda100fcad7429ddd4928af96c8c3e14e05ff`.
- Browser tenant-context verification: `4f34d33a8a3724fde55355763c4174639b42274b`.
- The browser harness builds the exact checked-out commit, starts that build locally in CI, launches real Chromium, captures screenshots/console/request failures, attempts real Supabase password authentication, verifies a browser-held session token exists, calls the canonical tenant resolver with that browser session, attempts a second authenticated tenant context when credentials exist, traverses application routes, and verifies logout state.
- Browser harness does not mock authentication and does not use service-role credentials.
- Fresh runtime result on the current head is **PENDING** until the latest GitHub Actions workflow executes against this exact head.

### E2E DISCOVERY STATUS
| Area | Status | Evidence boundary |
|---|---|---|
| Browser framework | BUILT | Real Chromium harness |
| App exact-head runtime | BUILT/CI-EXECUTABLE | CI builds checked-out exact SHA |
| Authenticated Browser Login | NOT PROVEN | Fresh run pending |
| Browser session existence | NOT PROVEN | Fresh run pending |
| Tenant A context | NOT PROVEN | Fresh run pending |
| Tenant B context | NOT PROVEN | Fresh run pending; requires B credentials |
| Tenant A/B Browser isolation | NOT PROVEN | Requires two authenticated tenant actors plus cross-record adversarial operations |
| Core route reachability | NOT PROVEN | Fresh authenticated browser run pending |
| CRUD persistence | NOT PROVEN | Business CRUD assertions still require implementation/runtime evidence |
| Import browser flow | NOT PROVEN | Requires real import fixture execution |
| OCR/document browser flow | NOT PROVEN | Requires real runtime corpus execution |
| Evidence/decision browser flow | NOT PROVEN | Existing API E2E is not browser proof |
| Realtime/worker recovery | NOT PROVEN | Requires executable runtime evidence |
| Negative/adversarial browser flow | PARTIAL | Existing API-level adversarial coverage exists; browser layer remains pending |

### BATCH 1 — CERTIFICATION / TEST INTEGRITY
- Historical certification repairs through `b44a823...` remain recorded in Git history.
- Fresh exact-candidate certification is required for the current candidate after this E2E wave.
- Golden corpus now has a complete explicit expected-disposition map covering all 7 cases; this is a test-contract repair, not a runtime PASS.
- A previous exact-head enforcement run failed because the index still referenced `b44a823...` while the checked-out head had advanced; the index has now been reconciled to the current execution head.

### BATCH 2 — SECURITY / DATABASE / RPC / RLS
- Live Staging: `autonomy_runtime_gate(text)` is SECURITY DEFINER, authenticated-executable, anon-denied; it calls `is_continuous_trust_healthy('production')` and evaluates critical drift.
- `is_continuous_trust_healthy(text)` is SECURITY DEFINER with `search_path=pg_catalog`; anon and authenticated direct EXECUTE are denied.
- `decide_approval()` is tenant-scoped, decision-lock-before-approval, PENDING-only, rejects self-approval, and updates only the same-tenant PROPOSED decision.
- `request_decision_approval()` is tenant-scoped and decision-lock-before-check, with terminal APPROVED/REJECTED/CANCELLED fail-closed behavior and conflict-path protection.
- Live public SECURITY DEFINER inventory remains 33; 19 authenticated-executable, 0 anon-executable; all 33 have explicit search_path; no dynamic SQL detected by current semantic sweep.
- Approval and decision tables have RLS enabled; authenticated direct INSERT/UPDATE/DELETE is denied; tenant policies scope by `current_company_id()`.
- Live adversarial rollback tests: self-approval rejected; cross-tenant approval rejected; terminal approval resurrection rejected; request-on-proposed decision succeeds transactionally and rolls back in smoke.
- Approver authority remains **PRODUCT DECISION REQUIRED** only if a distinct business authority class is intended.

### BATCH 3 — COMPATIBILITY / LEGACY
- `queries-compat.ts` delegates to canonical query paths.
- Import history bounded to 500 with deterministic ordering/overflow rejection.
- Export adapters tenant-scoped and bounded to 10,000.
- Repository-wide caller/legacy/RPC/response/null/error parity sweep remains active; actionable mismatches must be fixed and rescanned.

### BATCH 4 — WORKER / FILESYSTEM / OCR / DOCUMENTS
- Worker DB lifecycle/dead-letter/lease/fence contracts are verified; full deployed runtime worker proof remains unproven.
- Watched-report direct authenticated DML is blocked live; recorder RPC remains the approved write path. Native path resolution includes resolve/realpath/containment and stable-file protections.
- OCR/document scope covers Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, duplicate fingerprint, confidence/provenance and page/line references.
- Runtime/Windows proof is never inferred from static contracts.

### BATCH 5 — REPORTS / EXPORT / PERFORMANCE
- Required lineage: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
- Adversarial coverage required for wrong period, stale truth, duplicates, tenant leakage, NULL/unknown semantics, pagination/bounds, PDF/RTL, CSV and Excel.
- 43 unused-index advisor INFO notices remain NON-BLOCKING/OPTIMIZATION pending realistic workload evidence.
- Small-data EXPLAIN is not production-scale proof.

### BATCH 6 — PR / DESKTOP
- PR #305 terminal-approval implementation is superseded by current-main lineage; no wholesale merge.
- PR #307 fixture/test ideas were selectively reproduced; no blind merge.
- PR #308 autonomy changes remain separate until a unique missing behavior is proven.
- Native Windows smoke remains Owner/External only if CI cannot produce exact-head evidence.

### STORAGE / REALTIME / AI
- Live Staging storage bucket inventory is empty; policies are tenant/owner-aware. Requirement status remains classification-dependent, not PASS.
- Realtime has no published application tables and no repository consumer found; requirement status remains classification-dependent, not PASS.
- AI/vector architecture exists; live retrieval authorization, tenant isolation and provenance remain unproven.

### LIVE / RESILIENCE
- Backup/restore, RPO/RTO, rollback/forward recovery and current production alias binding remain unproven.
- Historical deployments or prior RC evidence do not certify the current candidate.

### OWNER UNBLOCK QUEUE
| ID | Operation | Real blocker | Prepared | Evidence required | Status |
|---|---|---|---|---|---|
| OWNER-AUTH-01 | Authenticated Tenant A/B E2E | Interactive authenticated browser session | Browser harness + exact candidate | A/B authenticated E2E + adversarial isolation | OWNER REQUIRED |
| OWNER-AUTH-02 | Leaked-password protection | Auth control plane | Setting identified | Non-secret enabled state | CONDITIONAL |
| OWNER-DR-01 | Backup + isolated restore | Protected recovery access | Safety/validation contract | Backup/restore/hash/timing/RPO/RTO | CONDITIONAL |
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
| Certification provenance | YES | YES | PENDING fresh exact candidate | N/A | NO |

### EXECUTION DEBT
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Active local execution: fresh exact-candidate certification/test integrity; full authenticated browser E2E; repository-wide compatibility consumer sweep; watched filesystem proof; OCR corpus; report/export adversarial evidence; performance scale; Electron exact-head verification; PR reconciliation; migration lineage; SECURITY DEFINER semantic review; worker adversarial lifecycle; storage/realtime/AI scope classification.

Owner-only: authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.

### TRUE STOP
Only when local actionable debt is zero, all required security/DB/RPC/compat/import/worker/file/document/report/performance/desktop/certification work is evidenced on the exact candidate, and only Owner/External/Product Decision items remain.
