# Report Advisor — Master Execution & Truth Index

## Current Truth — 2026-09-02

- Current canonical `main` / exact HEAD: **`175b74b9c8c0c068f37370a80453c51726073b75`**.
- Previous exact HEAD: `3230a452ee86fe2332d66a4a40f767fdf6fc9cf5`.
- Security-fix parent: `cfe23fbb9968d8c1f019aa1b359f595e25ebdbcf5`.
- Previous accepted operational-layer baseline: `a5bdfa8a32a6ace477a1c0ef6e8f6d5132395788`.
- Earlier operational-layer implementation boundary `76baf8b1b5e7f2b812bb1e4e17057a7d5ee7f126` is historical only and is not evidence for the current HEAD.
- Fresh Final Execution Batch `#33578760739` and Fresh Quality `#33578760766` are historical evidence for `1eede4439b1cc32a597c81158a0d93ad07138923`; they do not transfer to the current HEAD.
- J runtime was PASS on `1eede443...` and has not been mutated in the operational-layer work.
- Backup/Restore operational truth remains: `RPO = UNPROVEN`, `RTO = UNPROVEN`, `RESTORE = UNPROVEN`, `DR = UNPROVEN`.
- Vercel remains `BLOCKED — External Deployment Rate Limit`; no substitute production/runtime evidence is accepted.
- MERGE / RELEASE / CERTIFICATION = **STOPPED**.

## Operational Runtime Layer — IMPLEMENTED / VERIFICATION IN PROGRESS

### RCA
The rollback drill trusted Vercel API authorization, production-domain guards, and readiness state but did not independently prove that either deployment ID belonged to the configured `VERCEL_PROJECT_ID`. This was a real server-side isolation gap.

### Architecture Decision
**Vercel Node.js serverless functions** remain the smallest safe in-application runtime layer for bounded operational HTTP surfaces. Privileged credentials remain server-side. Database/runtime checks use Supabase server APIs; deployment rollback uses the Vercel API only for an explicitly non-production drill domain. Long-lived or privileged restore execution remains an external operational dependency because the application runtime cannot safely invent a cross-project restore target.

### Security Fix
`api/rollback-drill.mjs` now:
- requires `VERCEL_PROJECT_ID` before any deployment lookup;
- rejects missing deployment IDs;
- fetches deployment metadata from the Vercel API server-side;
- requires exact `deployment.projectId === VERCEL_PROJECT_ID`;
- applies the check independently to FROM and FORWARD deployments before any alias mutation;
- preserves READY, target-environment, and production-domain fail-closed guards;
- uses the validated metadata IDs for alias operations.

### Files Changed in This Cycle
- `api/rollback-drill.mjs` — same-project deployment enforcement.
- `scripts/resilience-runtime.test.mjs` — adversarial project-isolation test coverage.
- `docs/MASTER_EXECUTION_INDEX.md` — exact-head/security/evidence ledger update.

### Tests Added / Intended Adversarial Coverage
The resilience test covers:
- valid same-project FROM deployment;
- valid same-project FORWARD deployment;
- foreign-project deployment;
- nonexistent deployment;
- non-READY deployment;
- Vercel API/network failure;
- missing deployment ID;
- mixed same-project + foreign-project pair;
- missing `VERCEL_PROJECT_ID`;
- production-environment guard;
- syntax checks for all operational runtime files.

These tests are **not claimed PASS** until executed by a runtime/CI environment.

### Exact-SHA Chain
- Previous exact HEAD: `a5bdfa8a32a6ace477a1c0ef6e8f6d5132395788`.
- Security-fix commit: `cfe23fbb9968d8c1f019aa1b359f595e25ebdbcf5`.
- Adversarial-test commit: `3230a452ee86fe2332d66a4a40f767fdf6fc9cf5`.
- Current index-update HEAD: **`175b74b9c8c0c068f37370a80453c51726073b75`**.
- Parent of current HEAD: `3230a452ee86fe2332d66a4a40f767fdf6fc9cf5`.

### Verification Truth
- Local execution: **EXECUTION BLOCKED** — no repository checkout is mounted in the current execution container; therefore `scripts/resilience-runtime.test.mjs` was not executed locally and no local PASS is claimed.
- Static source inspection: completed against the current HEAD; not equivalent to runtime PASS.
- Fresh Final Execution Batch: **NOT RUN** in this connector session; no Run ID invented.
- Fresh Quality: **NOT RUN** in this connector session; no Run ID invented.
- Live Health: UNPROVEN.
- Live Tenant Canary: UNPROVEN.
- Backup artifact verification: UNPROVEN.
- Restore: UNPROVEN.
- RPO: UNPROVEN.
- RTO: UNPROVEN.
- Rollback: UNPROVEN.
- DR: UNPROVEN.

### Security / Failure Behavior
- No secrets are committed to Git.
- Operational endpoints require `x-resilience-token`.
- Tenant canary separately requires an authenticated Supabase bearer token.
- Restore/rollback endpoints do not silently downgrade to PASS when configuration or evidence is missing.
- Production rollback drills are explicitly rejected by the runtime.
- Cross-project deployment IDs are now explicitly rejected before alias mutation.
- No production backup/restore/rollback is automatically executed by CI.
- Existing J runtime was not touched.
- `check-recovery-contract.mjs` was intentionally not modified.

### External Dependency Remaining
A real restore verifier still requires a safe restore target and credentials/permissions to restore the real backup artifact into that target. Vercel deployment access is also externally blocked by the deployment rate limit. Therefore no live runtime, restore, RPO/RTO, rollback, or DR PASS is currently certified.

## Operational Boundaries

### Workers / Queue / Watched Folder
Execute success/failure/retry/lock/idempotency/duplicate/crash/restart/recovery/DLQ and watched-folder detect → parse → validate → import → reconcile → canonical → evidence.

### Backup / Restore / DR
`R16 — backup / restore / DR`

Current status: **UNPROVEN / external restore-target dependency remains.**

Required runtime evidence: actual backup artifact, integrity verification, safe restore execution, measured RPO, measured RTO, restore result, rollback/DR evidence, timestamp/run identity, and exact source/environment identity.

### Vercel / Production Runtime
**BLOCKED — External Deployment Rate Limit.** No bypass and no substitute production evidence.

## SHA / Evidence Rules

1. Historical PASS is not current candidate PASS.
2. Every PASS must identify the exact tested SHA.
3. Certification requires all required evidence to converge on ONE release SHA.
4. A migration or test file existing is not runtime proof.
5. `UNPROVEN` must never be silently promoted to PASS.
6. Every mutation records OLD SHA → NEW SHA, RCA, files, tests, and exact-head evidence.

## Final Definition of Done

`ONE EXACT RELEASE SHA + full CI + security + canonical truth + authenticated runtime + tenant isolation + production runtime + OCR + workers/recovery + backup/restore + rollback + performance + observability + UX + business acceptance + complete evidence pack = PRODUCTION CERTIFIED / SELLABLE`.

**Evidence → RCA → Execute → Verify → Exact-Head Evidence → Document → Continue → Certify**
