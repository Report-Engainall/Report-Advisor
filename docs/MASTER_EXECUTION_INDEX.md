# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### EXECUTION SCOPE / BRANCH
- **Repository:** `Report-Engainall/Report-Advisor`
- **Current execution branch:** `main`
- **Current main:** `8e532b4ff0484a86f95e9b536997459d94e0c77c`
- **Current code/test candidate:** `8e532b4ff0484a86f95e9b536997459d94e0c77c`
- Previous executable candidate: `1df662ae114505be2a6df1a2d5230d38d3d1ab3f`.
- E2E wave commits: `396086781a4723c23a90a8486b8b4cf81936bec9`, `aa155ffdfce7a0addd17b337677e4b5c3039376d`, `38394120323da4f73bd2765b1f754b27e100111b`, `262fda100fcad7429ddd4928af96c8c3e14e05ff`, `4f34d33a8a3724fde55355763c4174639b42274b`, `95cf68908f5fb57de5712c90dd6ed297cfd5f65a`, `dcbcbdbcc621cce23786d945e82005af94bcd05f`, `1c0011188346f1543353fdc8d517a1021bc25743`, `8e532b4ff0484a86f95e9b536997459d94e0c77c`.
- Execution scope: P0 certification/test integrity; P0 security/database/RPC/RLS/tenant isolation; P1 compatibility/legacy; worker/filesystem/OCR/documents; P2 reports/export/performance; PR/desktop reconciliation; final evidence/certification.
- Independent fronts run in parallel; Owner intervention is deferred until locally actionable work is exhausted.

### EXACT CANDIDATE
- **CURRENT CODE/TEST CANDIDATE:** `8e532b4ff0484a86f95e9b536997459d94e0c77c`
- Browser E2E uses real Chromium against the exact-head build, real Supabase password authentication when credentials are supplied, and the browser-held access token for `current_company_id`; service-role and mocked sessions are prohibited.
- Browser workflow is scoped to the canonical CI topology and now accepts both Tenant A and Tenant B credentials from Actions secrets.
- Browser harness records route actions/inputs/links, requests, console/page errors, screenshots, tenant context, refresh persistence and logout state.
- The Golden E2E corpus contract explicitly enforces expected disposition for all 7 named cases, including `inventory-excel`.
- Certification evidence is valid only for this exact candidate or explicitly governed ancestry.

### E2E WAVE — FULL PRODUCT DISCOVERY
- Baseline: `083225068f1e2d390f6e1d50e8b178a1e8e1bacb`.
- Harness: `396086781a4723c23a90a8486b8b4cf81936bec9`.
- Browser CI: `aa155ffdfce7a0addd17b337677e4b5c3039376d`.
- Golden corpus repair: `38394120323da4f73bd2765b1f754b27e100111b`.
- Failure ledger: `262fda100fcad7429ddd4928af96c8c3e14e05ff`.
- Tenant-context verification: `4f34d33a8a3724fde55355763c4174639b42274b`.
- CI topology repair: `95cf68908f5fb57de5712c90dd6ed297cfd5f65a`.
- Browser forensic-depth repair: `dcbcbdbcc621cce23786d945e82005af94bcd05f`.
- Product gap ledger: `1c0011188346f1543353fdc8d517a1021bc25743`.
- Current workflow binding: `8e532b4ff0484a86f95e9b536997459d94e0c77c`.
- Historical run `33843075245` executed against `1df662...` and was still in progress when the current-head hardening wave began; it is not evidence for the current candidate.
- Historical certification-contract run `33843075238` exposed a real CI governance defect: broad browser-workflow push trigger. This was repaired and must be re-proven on current head.

### E2E DISCOVERY STATUS
| Area | Status | Evidence boundary |
|---|---|---|
| Browser framework | BUILT | Real Chromium harness |
| App exact-head runtime | BUILT/CI-EXECUTABLE | CI builds checked-out exact SHA |
| Authenticated Browser Login | NOT PROVEN | Current-head run pending |
| Browser session existence | NOT PROVEN | Current-head run pending |
| Tenant A context | NOT PROVEN | Current-head browser proof pending |
| Tenant B context | NOT PROVEN | Requires B secret and runtime login |
| Tenant A/B Browser isolation | NOT PROVEN | Requires cross-record browser adversarial operations |
| Core route reachability | NOT PROVEN | Current-head authenticated browser run pending |
| CRUD persistence | NOT PROVEN | No browser CRUD proof yet |
| Import browser flow | NOT PROVEN | Real fixture execution pending |
| OCR/document browser flow | NOT PROVEN | Real runtime corpus pending |
| Evidence/decision browser flow | NOT PROVEN | Existing API E2E is not browser proof |
| Realtime/worker recovery | NOT PROVEN | Executable runtime proof pending |
| Negative/adversarial browser flow | PARTIAL | DB/API adversarial evidence exists; browser proof pending |
| Real report source→output truth | NOT PROVEN | Full source/parse/DB/RPC/analytics/UI/output comparison pending |

### BATCH 1 — CERTIFICATION / TEST INTEGRITY
- Golden corpus has explicit expected-disposition coverage for all 7 named cases; this is contract evidence, not runtime PASS.
- `E2E_PRODUCT_GAP_LEDGER.md` records current product proof gaps separately from failures.
- Any BLOCKED/NOT PROVEN state remains uncertified.

### BATCH 2 — SECURITY / DATABASE / RPC / RLS
- Live Staging project `fnqbvfuwbdpwvhcgzksl` is `ACTIVE_HEALTHY`.
- All public tables currently have RLS enabled.
- Core authenticated policies use `current_company_id()`; child resources use parent-company predicates.
- No `anon` table grants were found for the core business tables checked.
- Two runtime evidence tenants exist in Staging, each with one active member.
- Rolled-back DB adversarial probes: Tenant A saw only its 3 products with zero cross-tenant rows; Tenant B saw only its 1 product with zero cross-tenant rows; cross-tenant UPDATE affected 0 rows; attempted company reassignment was rejected by RLS.
- Live SECURITY DEFINER inventory is hardened with `search_path=pg_catalog`; advisor still reports authenticated exposure of multiple public helpers. Major mutation helpers inspected contain `auth.uid()` and tenant checks. No exploit was proven; no blind revoke performed.
- Supabase Auth security advisor reports leaked-password protection disabled; this is an external control-plane hardening item.

### BATCH 3 — COMPATIBILITY / LEGACY
- `queries-compat.ts` delegates to canonical query paths.
- Import history bounded to 500 with deterministic ordering/overflow rejection.
- Export adapters tenant-scoped and bounded to 10,000.
- Repository-wide caller/legacy/RPC/response/null/error parity sweep remains active.

### BATCH 4 — WORKER / FILESYSTEM / OCR / DOCUMENTS
- Worker DB lifecycle/dead-letter/lease/fence contracts are verified; full deployed runtime worker proof remains unproven.
- Watched-report direct authenticated DML is blocked live; recorder RPC remains the approved write path.
- OCR/document scope covers Arabic/RTL, mixed Arabic-English, scanned/rotated/low-quality pages, tables, malformed/empty OCR, partial extraction, duplicate fingerprint, confidence/provenance and page/line references.
- Runtime/Windows proof is never inferred from static contracts.

### BATCH 5 — REPORTS / EXPORT / PERFORMANCE
- Required lineage: canonical truth → calculation → report → artifact → SHA-256 → provenance → export.
- Adversarial coverage required for wrong period, stale truth, duplicates, tenant leakage, NULL/unknown semantics, pagination/bounds, PDF/RTL, CSV and Excel.
- 43 unused-index advisor INFO notices remain non-blocking optimization work pending realistic workload evidence.
- Small-data EXPLAIN is not production-scale proof.

### STORAGE / REALTIME / AI
- Live Staging storage bucket inventory is empty; policies are tenant/owner-aware. Requirement status remains classification-dependent.
- Realtime has no published application tables and no repository consumer found; requirement status remains classification-dependent.
- AI/vector architecture exists; live retrieval authorization, tenant isolation and provenance remain unproven.

### LIVE / RESILIENCE
- Backup/restore, RPO/RTO, rollback/forward recovery and current production alias binding remain unproven.
- Historical deployments or prior RC evidence do not certify the current candidate.

### OWNER UNBLOCK QUEUE
| ID | Operation | Real blocker | Prepared | Evidence required | Status |
|---|---|---|---|---|---|
| OWNER-AUTH-01 | Authenticated Tenant A/B E2E | Interactive authenticated browser session | Browser harness + exact candidate | A/B authenticated E2E + adversarial isolation | OWNER/ENV REQUIRED |
| OWNER-AUTH-02 | Leaked-password protection | Auth control plane | Setting identified | Non-secret enabled state | EXTERNAL CONFIG |
| OWNER-DR-01 | Backup + isolated restore | Protected recovery access | Safety/validation contract | Backup/restore/hash/timing/RPO/RTO | EXTERNAL |
| OWNER-DR-02 | Rollback + forward recovery | Protected deployment access | Drill/evidence contract | Deployment/health/recovery proof | EXTERNAL |
| OWNER-WIN-01 | Native Windows smoke | Native environment if CI unavailable | Exact command packet | Exact-head logs/artifact | EXTERNAL |

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
| Certification provenance | YES | YES | Current-head retest pending | N/A | NO |

### EXECUTION DEBT
`LOCAL ACTIONABLE EXECUTION DEBT = NOT ZERO`.

Active local execution: current-head browser E2E; full authenticated business-flow proof; repository-wide compatibility consumer sweep; watched filesystem proof; OCR corpus; report/export adversarial evidence; performance scale; Electron exact-head verification; PR reconciliation; migration lineage; SECURITY DEFINER semantic review; worker adversarial lifecycle; storage/realtime/AI scope classification; final certification.

Owner/external: authenticated browser sessions, protected Auth/recovery/deployment controls, backup/restore, rollback, and unavoidable native Windows operations.

### TRUE STOP
Only when local actionable debt is zero, all required security/DB/RPC/compat/import/worker/file/document/report/performance/desktop/certification work is evidenced on the exact candidate, and only Owner/External/Product Decision items remain.
