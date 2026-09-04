# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Historical records remain in Git history and dated evidence. Evidence never crosses an exact-SHA boundary.

### EXECUTION SCOPE / BRANCH
- **Repository:** `Report-Engainall/Report-Advisor`
- **Current execution branch:** `main`
- **Current main:** `da1d44719662f62c61c4fb484f5218a9a26a43d6`
- **Current code/test candidate:** `da1d44719662f62c61c4fb484f5218a9a26a43d6`
- Previous executable candidate: `d362b2294ca9797cc1a36171173538af881fb18a`.
- `43d56fb...` was governance/index-only after the previous executable candidate and did not replace it.
- Execution scope: P0 certification/test integrity; P0 security/database/RPC/RLS/tenant isolation; P1 compatibility/legacy; worker/filesystem/OCR/documents; P2 reports/export/performance; PR/desktop reconciliation; final evidence/certification.
- Independent fronts run in parallel; Owner intervention is deferred until locally actionable work is exhausted.

### EXACT CANDIDATE
- **CURRENT CODE/TEST CANDIDATE:** `da1d44719662f62c61c4fb484f5218a9a26a43d6`
- `da1d447...` hardens the continuous-trust test-of-test to validate the canonical SQL bridge across migration lineage.
- `d362b229...` added the decision-approval TOCTOU contract/test-of-test after live DB hardening of `request_decision_approval()`.
- `18b634c...` repaired the continuous-trust checker so SQL bridge validation follows migration lineage instead of requiring a production literal in the base migration.
- `24b7579...` was the prior executable candidate and added continuous-trust persistence/RPC/SQL-bridge adversarial coverage.
- Certification evidence is valid only for this exact candidate or an explicitly governed ancestry of it.

### BATCH 1 — CERTIFICATION / TEST INTEGRITY
- Quality `#3854` on `18b634c...`: PASS, all 63 workflow steps.
- Final Execution Batch `#430` on `18b634c...`: PASS, 30 deterministic gates.
- Final Certification `#665` on `d362b229...`: boundary passed only after index governance, then certification contracts failed because the old test-of-test still expected the SQL bridge in the base migration; failure was consumed and RCA completed.
- Continuous-trust checker RCA: canonical runtime bridge is `autonomy_runtime_gate` calling `is_continuous_trust_healthy('production')`; checker now validates runtime RPC + migration-lineage SQL instead of a wrong base-file literal assumption.
- Continuous-trust test-of-test RCA: old test supplied only the base migration to the strengthened checker; fixed to aggregate migration lineage and adversarially remove the canonical trust-health call.
- Decision-approval RCA: `request_decision_approval()` had a request/decision TOCTOU window; fixed live and persisted in migration by locking the decision row before checking `PROPOSED`.
- Fresh exact-candidate CI for `da1d447...` is required before Batch 1 closure.

### CERTIFICATION BOUNDARY
- Exact candidate checkout + HEAD equality required for candidate execution.
- Governance-only descendants require ancestry and explicit allowlisted paths.
- Provenance binds the trigger to the tested SHA; synthetic PR merge SHAs are rejected.
- `final-certification-gate.yml` and `execution-enforcement-contract.yml` enforce the boundary.

### BATCH 2 — SECURITY / DATABASE / RPC / RLS
- Live Staging: `autonomy_runtime_gate(text)` is SECURITY DEFINER, authenticated-executable, anon-denied; it calls `is_continuous_trust_healthy('production')` and evaluates critical drift.
- `is_continuous_trust_healthy(text)` is SECURITY DEFINER with `search_path=pg_catalog`; anon and authenticated direct EXECUTE are denied; privileged runtime call remains controlled through the definer gate.
- `decide_approval()` is tenant-scoped, row-locking, PENDING-only, rejects self-approval, and updates only the same-tenant PROPOSED decision.
- `request_decision_approval()` is tenant-scoped and decision-lock-before-check, with terminal APPROVED/REJECTED/CANCELLED fail-closed behavior and conflict-path protection.
- Live public SECURITY DEFINER inventory remains 33; 19 authenticated-executable, 0 anon-executable; all 33 have explicit search_path; no dynamic SQL detected by current semantic sweep.
- Approval and decision tables have RLS enabled; authenticated direct INSERT/UPDATE/DELETE is denied; tenant policies scope by `current_company_id()`.
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
| OWNER-AUTH-01 | Authenticated Tenant A/B E2E | Interactive authenticated browser session | Matrix + exact candidate | A/B authenticated E2E + adversarial isolation | OWNER REQUIRED |
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

Active local execution: Batch 1 fresh exact-candidate certification/test integrity; repository-wide compatibility consumer sweep; watched filesystem proof; OCR corpus; report/export adversarial evidence; performance scale; Electron exact-head verification; PR reconciliation; migration lineage; SECURITY DEFINER semantic review; worker adversarial lifecycle; storage/realtime/AI scope classification.

Owner-only: authenticated browser sessions, protected Auth/recovery/deployment controls, and unavoidable native Windows operations.

### TRUE STOP
Only when local actionable debt is zero, all required security/DB/RPC/compat/import/worker/file/document/report/performance/desktop/certification work is evidenced on the exact candidate, and only Owner/External/Product Decision items remain.
