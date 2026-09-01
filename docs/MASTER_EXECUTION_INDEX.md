# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current branch: `codex/p0-hardening-integration-20260901`
- Execution head immediately before this index update: `2e4b69248a5cee6dcf1e5094723f18c681943b33`
- This index update itself advances the branch; therefore the next exact-head CI target is the commit produced by this update.
- Exact-head CI is required after every source/workflow mutation; no final PASS is claimed until that exact SHA is verified.

### Latest certification finding and repair
- Exact-head certification on `c53278730a28edf96518880fa9489fcb8d6207e0` passed the 20-stage readiness matrix, 30-stage final execution batch, P0 13/13, and P1 8/8 before `check-phase-k-runtime-closure.mjs` failed.
- Root cause: the Phase-K checker required stale API vocabulary even though the canonical production coordinator bridge uses the current runtime APIs.
- Repair: Phase-K checker now accepts the canonical runtime APIs while retaining backward-compatible alternatives and sourceHash identity.
- The repair requires fresh exact-head CI; no certification is inferred from historical PASS.

### New completed work — worker lifecycle regression suite
1. Added `check-worker-lifecycle-guards.mjs` covering heartbeat, checkpoint, completion, failure, and retry invariants.
2. Added `check-worker-lease-expiry.mjs` to prevent heartbeat from accepting expired leases.
3. Added `check-worker-service-role-boundary.mjs` covering security-definer and execution-grant boundaries for all lifecycle RPCs.
4. Added `check-worker-tenant-isolation.mjs` requiring `current_company_id()` tenant scope across lifecycle RPCs.
5. Added `check-worker-terminal-state-guards.mjs` covering active-state completion/failure and failed-state bounded retry transitions.
6. Wired the complete worker lifecycle regression suite into `package.json` as runnable npm scripts.
7. Updated this index to record the exact execution head and these completed items.

### New completed work — worker contract hardening extension
1. Added `check-worker-search-path-contract.mjs` covering fixed `search_path = public` on every lifecycle SECURITY DEFINER RPC.
2. Added `check-worker-lease-floor-contract.mjs` covering the minimum 30-second heartbeat lease extension.
3. Added `check-worker-null-payload-contract.mjs` covering deterministic `{}` JSON fallbacks for checkpoint/evidence/error payloads.
4. Added `check-worker-lease-clearance-contract.mjs` covering terminal/retry lease-owner and lease-expiry clearance.
5. Added `check-worker-execution-grants-contract.mjs` covering fail-closed `public/anon` revocation and `service_role` execution grants.
6. Added `.github/workflows/worker-hardening-contract.yml` to execute the complete worker lifecycle/contract guard set on relevant source changes.
7. Current exact-head workflow state is **not yet certified PASS**; queued/pending/in-progress runs are not promoted to PASS.

### New completed work — worker lifecycle transition extension
1. Added `check-worker-checkpoint-monotonicity-contract.mjs` covering checkpoint transition/resume gates and regression coverage.
2. Added `check-worker-retry-eligibility-contract.mjs` covering failed-only retry, bounded attempts, queue re-entry, and lease clearance.
3. Added `check-worker-terminality-contract.mjs` covering explicit completion/failure terminal transitions and rejection of lifecycle mutation against completed state.
4. Added `check-worker-tenant-boundary-contract.mjs` requiring `current_company_id()` enforcement in every lifecycle RPC.
5. Corrected the workflow to remove an invalid claim-migration reference and retained only guards backed by canonical repository files.
6. Extended `.github/workflows/worker-hardening-contract.yml` with five additional executable contracts: RPC signatures, boolean/affected-row return semantics, `updated_at` mutation, active-state restrictions, and completion evidence persistence.
7. Current exact-head workflow state is **not yet certified PASS**; the index update itself creates a new exact-head CI target.

These are source-level regression guards. They improve repository-executable evidence but do **not** close live production, authenticated E2E, tenant A/B, backup/restore, rollback, or other external operational certification boundaries.

### Repository hardening already completed
- Release-evidence SHA validation requires exactly 40 hexadecimal characters with adversarial short/long/alphabet cases.
- Watched-folder import remains bound to canonical `commitImportBatch` persistence/governance.
- K/L evidence validation is aligned with canonical runtime APIs and tenant/lease invariants.
- Intelligence foundation fixtures use canonical `aggregateAlternativeGroup` and `buildExecutiveScorecard` APIs.
- Final certification PR workflow separates PR contract checks from release-only operational evidence.
- Parallel-runtime fixtures explicitly cover same-tenant allow, cross-tenant deny, and terminal duplicate-transition rejection.
- Phase-H continuous-trust validation consumes the canonical migration surface instead of a stale migration name.
- Phase-K runtime closure validation now consumes the canonical production-coordinator bridge API vocabulary.

### Current dependency/security observation
- `npm ci` reports **19 dependency vulnerabilities (2 low, 4 moderate, 13 high)**. No blind `npm audit fix` is authorized. Package-level triage is required before release certification.

## PARALLEL CLOSURE TRACKS
- **P0-A Authenticated Runtime:** real login/session/browser E2E and authenticated operation matrix.
- **P0-B Tenant A/B:** real cross-tenant adversarial runtime verification with zero leakage.
- **P1-C Production Runtime:** deployment identity, runtime health, Supabase connectivity, smoke, and source-SHA binding.
- **P1-D Recovery:** real backup, restore, migration parity, integrity, RPO/RTO evidence, and rollback drill.
- **P1-E Documents/OCR:** real Arabic Golden Corpus execution and evidence comparison.
- **P1-F Import/Reconciliation:** realistic Excel/import/reconciliation/conflict/canonical-truth business dataset drill.
- **P1-G Workers:** real queue/claim/heartbeat/checkpoint/retry/dead-letter/resume and tenant isolation drill.
- **P2-H Performance:** production-like concurrency, P95 read/write/preview and large-import behavior.
- **P2-I Operations/UX:** observability, PWA/mobile/RTL/slow-network/offline/installability and recovery UX sweep.
- **P2-J Acceptance:** independent business acceptance and final evidence completeness.

Repository-executable fronts continue even when operational fronts are blocked by external access.

## ENGINEERING TASK BOARD — OPEN IN PARALLEL
- **T1 Exact-head CI reconciliation:** count only results whose checkout equals current PR head.
- **T2 Release evidence adversarial validation:** malformed SHA, wrong artifact identity, mismatched manifest/certification SHA, missing run identity, stale evidence.
- **T3 Folder import adversarial validation:** canonical commit, duplicate detection, traversal/security, parse failure, malformed workbook, cross-tenant attempt.
- **T4 Workflow coverage/regression audit:** compare package scripts with Quality/Certification/Release workflows and detect dropped coverage.
- **T5 Security-definer classification:** classify privilege, caller, search_path, grants, tenant guards, exploitability; harden only demonstrated excessive privilege.
- **T6 Canonical truth adversarial corpus:** missing cost/sale items, invalid numerics, duplicate SKU, currency mismatch, UNKNOWN/INSUFFICIENT_DATA, forecast confidence.
- **T7 Worker lifecycle security regression:** service-role authority, tenant scope, lease, retry, checkpoint, dead-letter, resume. **Extended with twenty executable repository guards/contracts.**
- **T8 Document/OCR evidence readiness:** hashes, confidence, normalized output, provenance, duplicate/unknown handling, Golden Corpus scoring.
- **T9 Performance readiness:** repository-level P95/bounded reads/concurrency; defer live load evidence until runtime.
- **T10 UX/PWA acceptance preparation:** authenticated mobile/RTL/slow-network/offline/installability evidence cases.
- **T11 Dependency vulnerability triage:** map all 19 findings to direct/transitive package, code path, exploitability, fixed version, compatibility, and safe remediation.
- **T12 Release-only evidence boundary verification:** confirm release-certification is sole producer of run-bound manifest/certification evidence.
- **T13 Current-head CI reproof:** after each mutation, run and inspect all exact-head gates; repair only real failures.
- **T14 PR/branch synchronization audit:** ensure PR metadata, branch ref, index, and CI checkout all agree before promoting evidence.
- **T15 Parallel-runtime adversarial regression:** keep same-tenant allow and cross-tenant deny fixtures explicit; ensure terminal duplicate transitions are rejected without tautological assertions.
- **T16 Phase-H canonical migration alignment:** keep Phase-H checker vocabulary bound to canonical migration primitives and prevent stale migration-name regressions.
- **T17 Phase-K canonical runtime alignment:** keep Phase-K checker vocabulary bound to canonical production-coordinator APIs and prevent stale API-name regressions.

## RECOVERY BOUNDARY REGISTER
- **P1-H — Backup / Restore / DR** remains an explicit certification boundary.
- RPO/RTO are operational evidence requirements, not source-level claims.
- Backup, restore, migration parity, artifact integrity, rollback, and security audit evidence are required before production certification.
