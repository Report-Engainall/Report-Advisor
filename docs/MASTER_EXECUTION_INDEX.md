# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current PR head verified by GitHub: `b51d10225b96b5d5ff2f88a4b168aa90695a6310`
- Current branch: `codex/p0-hardening-integration-20260901`
- Exact-head CI is required after the latest certification-workflow boundary repair; no final PASS is claimed yet.

### Latest certification finding and repair
- Exact-head Final Certification run `33521293190` checked out the exact PR head `b51d10225b96b5d5ff2f88a4b168aa90695a6310` successfully.
- The 20-stage release-readiness matrix passed **20/20**.
- The Final Execution Batch passed **30/30**.
- The certification contract sweep passed through the repository-executable checks until `check-live-production-evidence-boundary.mjs`.
- That checker requires a real `RELEASE_CERTIFICATION_RUN_ID` and release artifact identity. Those values intentionally do not exist in PR contract runs; they are produced by the dedicated `release-certification.yml` workflow after a real release-certification run.
- Updated `.github/workflows/final-certification-gate.yml` so PR certification skips only the two release-only operational evidence consumers: `check-evidence-freshness.mjs` and `check-live-production-evidence-boundary.mjs`.
- This is not a certification bypass: the dedicated release-certification workflow remains responsible for generating the manifest/certification decision and running freshness validation, while live production evidence remains fail-closed.

### Verified exact-head results on the current PR head
- 20/20 Release Readiness: PASS.
- 30/30 Final Execution Batch: PASS.
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
- `npm ci` on the current exact-head CI reports **19 dependency vulnerabilities (2 low, 4 moderate, 13 high)**. No blind `npm audit fix` is authorized. These require package-level triage for exploitability, runtime exposure, transitive source, and safe lockfile remediation before release certification.

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

Repository-executable fronts must continue even when operational fronts are blocked by external access.

## NEW ENGINEERING TASK BOARD — OPEN IN PARALLEL

### T1 — Exact-head CI reconciliation
- Verify every current workflow result against the GitHub-verified PR head.
- Count only exact-head results; stale SHA, merge-ref, skipped, or absent results are not PASS.

### T2 — Release evidence adversarial validation
- Exercise malformed SHA, wrong artifact identity, mismatched manifest/certification SHA, missing run identity, and stale evidence.
- Ensure all fail closed without weakening production evidence boundaries.

### T3 — Folder import adversarial validation
- Verify canonical commit path, duplicate detection, traversal/security scan, parse failure, malformed workbook, and cross-tenant attempt behavior.
- Ensure no direct persistence path bypasses canonical import transaction/governance.

### T4 — Workflow coverage / regression audit
- Compare `package.json` gate inventory against Quality, Final Certification, Release Certification, and dedicated workflows.
- Detect silently dropped regression coverage or duplicated checks.
- Do not add aliases solely to satisfy text checks.

### T5 — Security-definer classification
- Enumerate flagged SECURITY DEFINER functions and classify caller, search_path, grants, tenant/user guards, underlying RLS, intended runtime caller, and exploitability.
- Retain intentional functions only with explicit justification and tests; harden/revoke only where excessive privilege is demonstrated.

### T6 — Canonical truth adversarial corpus
- Expand negative cases for missing cost, missing sale items, invalid numeric values, duplicate SKU, currency mismatch, UNKNOWN/INSUFFICIENT_DATA, and forecast confidence.
- Verify UI/RPC/export semantics remain aligned.

### T7 — Worker lifecycle security regression
- Verify service-role-only lifecycle authority, tenant scope, lease owner/expiry, retry limits, checkpoint integrity, dead-letter, and resume behavior.
- Confirm authenticated users cannot directly mutate lifecycle state.

### T8 — Document/OCR evidence readiness
- Validate file hashes, OCR confidence, normalized output, provenance, duplicate/unknown handling, and Golden Corpus scoring before live execution.

### T9 — Performance readiness
- Validate declared P95 budgets and bounded reads/concurrency through repository-level checks; defer live load evidence until runtime is available.

### T10 — UX/PWA acceptance preparation
- Prepare deterministic authenticated mobile/RTL/slow-network/offline/installability cases and evidence IDs so the live acceptance run is execution-ready.

### T11 — Dependency vulnerability triage
- Inventory the 19 vulnerabilities reported by `npm ci`.
- Map each to direct/transitive dependency, affected code path, severity/exploitability, fixed version, compatibility impact, and whether remediation can be safely applied.
- Do not run blanket `npm audit fix`.

### T12 — Release-only evidence boundary verification
- Confirm the dedicated `release-certification.yml` workflow is the sole producer of run-bound manifest/certification evidence.
- Verify artifact naming, source SHA, manifest fingerprint, certification decision, freshness, and consumption proof remain exact and fail-closed.

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
