# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current execution head: `4a87de57813bd8161b3fb20f569f25016cac774a`
- Current branch: `codex/p0-hardening-integration-20260901`
- Exact-head CI is required after the latest release-evidence and folder-import hardening; no final PASS is claimed yet.

### Latest executed hardening batch
- Hardened release-evidence SHA validation to require exactly 40 hexadecimal characters, including adversarial tests for invalid alphabet, short, and long SHAs.
- Restored an explicit watched-folder import security guard so the folder importer cannot bypass the canonical `commitImportBatch` path.
- Added concise executable documentation to both hardened contracts.
- These changes are source-level hardening only and do not manufacture runtime/production evidence.

### Verified historical execution
- Exact-head certification on `71936266efb39d0c2be68292cc15fe0e6cb71101` passed the **20/20 release-readiness matrix** and reached **30/30 Final Execution Batch** before the K/L evidence-chain checker failure.
- K/L checker repair aligned validation with canonical runtime APIs: `buildLineage/diffRows`, `consolidateByPrecedence/consolidateRuntime`, `selectBoundedScenario/chooseScenario`, `rankPortfolio/prioritizeDecisions`, `RuntimeEvidence/recordEvidenceEdge/recordExecutiveEvidenceEdge`, `controlPlaneHealth/recordHealth/recordControlPlaneHealth`, and `evaluateAutonomyGate/canAutonomouslyExecute/autonomyRuntimeGate`.
- Governance checker was aligned with canonical governance migrations rather than a nonexistent migration name.
- Intelligence foundation fixtures were aligned with the canonical `aggregateAlternativeGroup` and `buildExecutiveScorecard` APIs.
- Exact-head workflow identity was hardened to compare checked-out `git rev-parse HEAD` against the PR head SHA.
- Production Scale is an explicit Quality gate.

### Verification and audit sweep
- 20-stage release readiness: **20/20 PASS** on the immediately preceding exact-head cycle.
- Final execution batch: **30/30 PASS** before the K/L evidence-chain failure.
- A0 hardening, Auth/Tenant convergence, authenticated E2E contract matrices, autonomy safety: PASS historically; current SHA must be re-proven.
- Global tenant RLS: PASS historically (22 tenant tables; 139 migrations).
- Import security/transaction/runtime, canonical mapping and tenant context: PASS historically.
- Document Intelligence: **20/20 PASS** historically.
- DR source-level contracts/readiness: PASS historically.
- Evidence lineage/provenance/regression: PASS historically.
- Governance Runtime: PASS historically.
- Decision authorization/DML/work-item/outcome: PASS historically.
- Production Scale: PASS historically.
- Certification immutability/manifest: PASS historically.
- Golden dataset/evidence/intelligence/score identity: PASS historically.
- Windows contract and Storage tenant isolation: PASS historically.
- Static repository sweep previously found no indexed `TODO`, `FIXME`, `HACK`, `XXX`, or debug `console.log` matches in the searchable repository surface.

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
- Verify every current workflow result against `4a87de57813bd8161b3fb20f569f25016cac774a`.
- Count only exact-head results; `IN_PROGRESS`, `SKIPPED`, stale SHA, and merge-ref results are not PASS.
- First actionable failure becomes the next minimal repair target.

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
- Validate file hashes, OCR confidence, normalized output, provenance, duplicate/unknown case handling, and Golden Corpus scoring before live execution.

### T9 — Performance readiness
- Validate declared P95 budgets and bounded reads/concurrency through repository-level checks; defer live load evidence until a suitable runtime is available.

### T10 — UX/PWA acceptance preparation
- Prepare deterministic authenticated mobile/RTL/slow-network/offline/installability cases and evidence IDs so the live acceptance run is execution-ready.

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

## EXECUTION PROTOCOL
`OPEN INDEX → SELECT INDEPENDENT FRONTS → INSPECT MINIMUM → IMPLEMENT → TARGETED TEST → ADVERSARIAL TEST → REGRESSION → EXACT SHA → VERIFY → CONTINUE`

Do not rebuild closed work. Do not promote historical PASS. Do not mutate the frozen release candidate or production alias without certification evidence. If one operational front is blocked, continue all repository-executable fronts.

## RELEASE EQUATION
`ONE EXACT SHA + build/typecheck/lint + quality/security + canonical truth + authenticated E2E + tenant A/B + deployment/runtime + OCR/document + workers/recovery + backup/restore + rollback + performance + observability + UX + business acceptance + complete evidence = PRODUCTION CERTIFIED / SELLABLE`
