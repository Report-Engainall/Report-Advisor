# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current branch: `codex/p0-hardening-integration-20260901`
- Current execution head after Phase-K checker repair: `6c07206082c1ae7091e9874ccfedaeb5bab4c140`
- Exact-head CI is required after every source/workflow mutation; no final PASS is claimed until that exact SHA is verified.

### Latest certification finding and repair
- Exact-head certification on `c53278730a28edf96518880fa9489fcb8d6207e0` passed the 20-stage readiness matrix, 30-stage final execution batch, P0 13/13, and P1 8/8 before `check-phase-k-runtime-closure.mjs` failed.
- Root cause: the Phase-K checker required stale API vocabulary (`buildRowLineage`, `consolidateChronologically`, `selectBoundedScenario`, `rankDecisionPortfolio`, `evaluateAutonomy`) even though the canonical production coordinator bridge uses `diffRows`, `consolidateRuntime`, `chooseScenario`, `prioritizeDecisions`, and `canAutonomouslyExecute`.
- Repair: Phase-K checker now accepts the canonical runtime APIs while retaining backward-compatible alternatives, and continues requiring the sourceHash identity.
- This is a checker repair, not a production-certification claim; the new head `6c072060...` requires fresh exact-head CI.

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
- **T7 Worker lifecycle security regression:** service-role authority, tenant scope, lease, retry, checkpoint, dead-letter, resume.
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
