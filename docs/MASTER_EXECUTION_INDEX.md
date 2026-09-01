# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current branch: `codex/p0-hardening-integration-20260901`
- Latest source/workflow hardening commits include bounded Worker and Certification workflows plus their coverage guards.
- Latest source/workflow mutation before this index update: `42f535b5e844c9fa994309915ccdb10bcdf75b1a`.
- This index update itself advances the branch; the resulting commit is the next exact-head CI target.
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

### Certification evidence boundary hardening
- Canonical mandatory evidence order is tenant, backup, rollback, artifact, security.
- Score derivation, fail-closed behavior, duplicate/missing/failed evidence, key uniqueness, unknown keys, blocker propagation, warning separation, evidence preservation, set membership, adversarial coverage, writer-table coverage, runtime-test wiring, workflow trigger/security, and referenced-file integrity are guarded.
- Certification workflow currently has an explicit 10-minute job timeout, read-only contents permission, shallow checkout, credential persistence disabled, and explicit action-major contract (`checkout@v7`, `setup-node@v7`, Node 22).

### New completed work — worker workflow closure
1. Added Worker workflow security contract for read-only permissions, shallow checkout, disabled credential persistence, checkout/setup actions, and Node 22.
2. Added Worker workflow trigger contract covering lifecycle migration, runtime authority migration, coordinator/runtime source, guard scripts, runtime test, and workflow changes on push/PR.
3. Added Worker referenced-file integrity guard.
4. Added Worker workflow coverage guard for the full contract suite and its meta-guards.
5. Added Worker runtime-authority contract protecting service-role grants and authenticated direct-table write revocation.
6. Added explicit 10-minute Worker workflow timeout and a guard for it.
7. Expanded Worker workflow coverage to include all meta/security/authority/timeout guards.

### New completed work — certification workflow bounded execution
8. Added Certification workflow action contract to lock the currently deployed action majors and Node 22.
9. Added Certification workflow timeout contract for the existing 10-minute bound.
10. Wired both new certification guards into the certification workflow.
11. Expanded certification workflow coverage guard to include action and timeout contracts.
12. These are repository-executable safety controls only; they do not certify live production or external operational evidence.

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
