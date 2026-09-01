# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current branch: `codex/p0-hardening-integration-20260901`
- Execution head immediately before this index update: `737cfc5d869e66c1f4d167737b0cd96e577dbc6e`
- This index update itself advances the branch; therefore the next exact-head CI target is the commit produced by this update.
- Exact-head CI is required after every source/workflow mutation; no final PASS is claimed until that exact SHA is verified.

### Latest certification finding and repair
- Exact-head certification on `c53278730a28edf96518880fa9489fcb8d6207e0` passed the 20-stage readiness matrix, 30-stage final execution batch, P0 13/13, and P1 8/8 before `check-phase-k-runtime-closure.mjs` failed.
- Root cause: the Phase-K checker required stale API vocabulary even though the canonical production coordinator bridge uses the current runtime APIs.
- Repair: Phase-K checker now accepts the canonical runtime APIs while retaining backward-compatible alternatives and sourceHash identity.
- The repair requires fresh exact-head CI; no certification is inferred from historical PASS.

### Worker lifecycle hardening
- Worker lifecycle regression suite covers heartbeat, checkpoint, completion, failure, retry, lease expiry, service-role authority, tenant isolation, terminal-state guards, search_path, lease floor, null payloads, lease clearance, grants, checkpoint monotonicity, retry eligibility, terminality, tenant boundary, RPC signatures, return semantics, updated_at, active-state restrictions, and completion evidence.
- `.github/workflows/worker-hardening-contract.yml` executes the repository-backed worker contract suite.
- An invalid nonexistent claim-migration reference was removed; no unsupported guard remains.

### New completed work — certification evidence decision hardening
1. Added `check-certification-evidence-order-contract.mjs` to lock canonical mandatory evidence order: tenant, backup, rollback, artifact, security.
2. Added `check-certification-score-contract.mjs` to require score derivation from the canonical mandatory evidence set.
3. Added `check-certification-fail-closed-contract.mjs` to require blockers empty, score >= 0.95, and complete evidence before certification.
4. Added `check-certification-duplicate-contract.mjs` for duplicate mandatory-evidence rejection.
5. Added `check-certification-missing-failed-contract.mjs` for missing/failed mandatory evidence rejection.

### New completed work — certification adversarial expansion
6. Added `check-certification-key-uniqueness-contract.mjs` to prevent duplicate canonical evidence keys.
7. Added `check-certification-unknown-key-contract.mjs` to ensure scoring remains bound to canonical evidence keys.
8. Added `check-certification-blocker-propagation-contract.mjs` to preserve non-passing BLOCKER semantics.
9. Added `check-certification-warning-separation-contract.mjs` to keep WARNING evidence separate from blockers.
10. Added `check-certification-evidence-preservation-contract.mjs` to preserve the supplied evidence array and deduplicate returned blockers.
11. Added `check-certification-set-membership-contract.mjs` to bind mandatory-key membership to the canonical Set.
12. Added `check-certification-adversarial-coverage-contract.mjs` to enforce runtime adversarial cases: missing, failed, duplicate, unrelated, complete.
13. Added `check-certification-writer-table-coverage-contract.mjs` to protect all four certification proof tables.
14. Added `check-certification-runtime-test-wiring-contract.mjs` to require the runtime certification harness in both boundary and integrity paths.
15. Added `check-certification-boundary-workflow-coverage.mjs` to detect dropped certification guard steps; expanded it to cover the workflow's new integrity guards.
16. Extended `.github/workflows/certification-evidence-boundary.yml` to execute the expanded certification guard suite plus workflow security, trigger, referenced-file, coverage, writer/completeness/queue boundaries.
17. Added `check-certification-workflow-referenced-files.mjs` to fail closed when a workflow-referenced Node guard is missing.
18. Added `check-certification-workflow-security-contract.mjs` to protect read-only permissions, shallow checkout, and credential persistence settings.
19. Added `check-certification-workflow-trigger-contract.mjs` to protect PR-to-main and manual workflow triggers plus read-only permissions.
20. These changes are repository-executable evidence only; they do not certify live production or external operational evidence.

### Repository hardening already completed
- Release-evidence SHA validation requires exactly 40 hexadecimal characters with adversarial short/long/alphabet cases.
- Watched-folder import remains bound to canonical `commitImportBatch` persistence/governance.
- K/L evidence validation is aligned with canonical runtime APIs and tenant/lease invariants.
- Intelligence foundation fixtures use canonical `aggregateAlternativeGroup` and `buildExecutiveScorecard` APIs.
- Final certification PR workflow separates PR contract checks from release-only operational evidence.
- Parallel-runtime fixtures cover same-tenant allow, cross-tenant deny, and terminal duplicate-transition rejection.
- Phase-H continuous-trust validation consumes canonical migration primitives.
- Phase-K runtime closure validation consumes canonical production-coordinator bridge APIs.

### Current dependency/security observation
- `npm ci` reports **19 dependency vulnerabilities (2 low, 4 moderate, 13 high)**. No blind `npm audit fix` is authorized.
- Current direct dependency review confirms `pdfjs-dist@6.2.108` is already on the patched line for the current 2026 PDF.js advisory.
- `xlsx@0.18.5` remains a separate unresolved high-severity direct dependency decision; no false PASS or blind replacement has been made.

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
- **T1** Exact-head CI reconciliation.
- **T2** Release evidence adversarial validation.
- **T3** Folder import adversarial validation.
- **T4** Workflow coverage/regression audit.
- **T5** Security-definer classification.
- **T6** Canonical truth adversarial corpus.
- **T7** Worker lifecycle security regression — extended with twenty executable guards/contracts.
- **T8** Document/OCR evidence readiness.
- **T9** Performance readiness.
- **T10** UX/PWA acceptance preparation.
- **T11** Dependency vulnerability triage — pdfjs patched; xlsx remains unresolved.
- **T12** Release-only evidence boundary verification.
- **T13** Current-head CI reproof.
- **T14** PR/branch synchronization audit.
- **T15** Parallel-runtime adversarial regression.
- **T16** Phase-H canonical migration alignment.
- **T17** Phase-K canonical runtime alignment.

## RECOVERY BOUNDARY REGISTER
- **P1-H — Backup / Restore / DR** remains an explicit certification boundary.
- RPO/RTO are operational evidence requirements, not source-level claims.
- Backup, restore, migration parity, artifact integrity, rollback, and security audit evidence are required before production certification.

## CERTIFICATION TRUTH
The expanded source guards strengthen the decision boundary but do not close Production Runtime, Authenticated E2E, Tenant A/B, Backup/Restore, Rollback, or other external operational certification gates. Historical PASS is never promoted to the new head.
