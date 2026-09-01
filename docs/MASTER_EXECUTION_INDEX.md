# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current PR head: `91f41c477ca0d1dd973673021265501ecb6754a4`
- Current branch: `codex/p0-hardening-integration-20260901`
- Exact-head CI is required after the certification-workflow boundary repair; no final PASS is claimed yet.

### Latest certification finding and repair
- Exact-head Final Certification run `33521293190` checked out `b51d10225b96b5d5ff2f88a4b168aa90695a6310` exactly.
- The 20-stage release-readiness matrix passed **20/20**.
- The Final Execution Batch passed **30/30**.
- The certification sweep reached `check-live-production-evidence-boundary.mjs`, which correctly requires real release-certification run/artifact identity unavailable in PR contract runs.
- PR certification now skips only the release-only operational evidence consumers `check-evidence-freshness.mjs` and `check-live-production-evidence-boundary.mjs`.
- The dedicated release-certification workflow remains responsible for producing run-bound manifest/certification evidence and live production evidence remains fail-closed.

### Latest repository hardening
- Release-evidence SHA validation requires exactly 40 hexadecimal characters with adversarial short/long/alphabet cases.
- Watched-folder import remains bound to canonical `commitImportBatch` persistence/governance.
- K/L evidence validation is aligned with canonical runtime APIs and tenant/lease invariants.
- Intelligence foundation fixtures use canonical `aggregateAlternativeGroup` and `buildExecutiveScorecard` APIs.
- Final certification PR workflow now cleanly separates PR contract checks from release-only operational evidence.
- The branch was fast-forwarded to `91f41c477ca0d1dd973673021265501ecb6754a4`; this SHA has not yet earned a new CI PASS.

### Verified exact-head historical results
- 20/20 Release Readiness: PASS on the immediately preceding exact-head cycle.
- 30/30 Final Execution Batch: PASS on the immediately preceding exact-head cycle.
- A0 hardening: PASS.
- Auth/Tenant convergence and authenticated E2E contract matrices: PASS.
- Global tenant RLS: PASS (22 tenant tables; 139 migrations).
- Import security/transaction/runtime and canonical mapping: PASS.
- Document Intelligence hardening: 20/20 PASS.
- DR source-level contracts/readiness: PASS.
- Evidence lineage/provenance/regression: PASS.
- Governance Runtime: PASS.
- Decision authorization/DML/work-item/outcome: PASS.
- K/L and K→S runtime/evidence chains: PASS.
- Production Scale: PASS.
- Certification immutability/manifest: PASS.
- Golden dataset/evidence/intelligence/score identity: PASS.
- Windows contract and Storage tenant isolation: PASS.
- Static TODO/FIXME/HACK sweep: no indexed matches in the searched repository surface.

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

## NEW ENGINEERING TASK BOARD — OPEN IN PARALLEL
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
- **T13 Current-head CI reproof:** after workflow repair, run and inspect all exact-head gates; repair only real failures.
- **T14 PR/branch synchronization audit:** ensure PR metadata, branch ref, index, and CI checkout all agree before promoting evidence.

## RECOVERY BOUNDARY REGISTER
- **P1-H — Backup / Restore / DR** remains an explicit certification boundary.
- RPO/RTO are operational evidence requirements, not source-level claims.
- Backup, restore, migration parity, artifact integrity, rollback, and security audit evidence are required before production certification.
- Source-level Phase 10 validation must never convert a missing live restore drill into PASS.

## NON-NEGOTIABLE CERTIFICATION BLOCKERS
- Production authenticated runtime.
- Real Actor A/B tenant isolation.
- Real backup + restore drill.
- Real rollback drill.
- Live Vercel deployment/runtime bound to the certified SHA.
- Real browser authenticated E2E with valid credentials.
- Live OCR/Golden Corpus execution where backend/device capability is required.
- Independent business acceptance.
- Dependency vulnerability triage/remediation decision for the current lockfile.

## EXECUTION PROTOCOL
`OPEN INDEX → SELECT INDEPENDENT FRONTS → INSPECT MINIMUM → IMPLEMENT → TARGETED TEST → ADVERSARIAL TEST → REGRESSION → EXACT SHA → VERIFY → CONTINUE`

Do not rebuild closed work. Do not promote historical PASS. Do not mutate the frozen release candidate or production alias without certification evidence. If one operational front is blocked, continue all repository-executable fronts.

## RELEASE EQUATION
`ONE EXACT SHA + build/typecheck/lint + quality/security + canonical truth + authenticated E2E + tenant A/B + deployment/runtime + OCR/document + workers/recovery + backup/restore + rollback + performance + observability + UX + business acceptance + complete evidence = PRODUCTION CERTIFIED / SELLABLE`
