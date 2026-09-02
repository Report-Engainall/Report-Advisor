# Report Advisor — Master Execution & Truth Index

## Current Truth — 2026-09-02

- Current canonical `main` / exact HEAD: **`afe4b8497afa72527011fac28705f7f14195877f`**.
- Actual parent of current exact HEAD: `4ca82e5f5e9f12f86ebbb2a569301fe6e998b86c`.
- Previous candidate HEAD at start of this audit: `84ae478671e74de550e501ee29b33b119fe2d19c`.
- Previous starting HEAD for the ancestry audit: `0bc5700ef14409eaef873e81b7d9fb54e04250af`.
- Ancestry result: `0bc5700...` is an ancestor of `84ae478...`; GitHub compare reports `ahead_by=4`, `behind_by=0`, `merge_base=0bc5700...`.
- Current `main` ref resolves exactly to `84ae478...` before the latest security mutation, with actual parent `9de410...`; the latest security mutation advanced `main` to `4ca82e5...`, and the adversarial-test mutation advanced it to `afe4b849...`.
- The lineage is linear across the audited segment; no merge/rebase/cherry-pick is indicated by the current parent chain. The four commits after `0bc5700...` are `82d33b8...` → `16bda78...` → `9de410b...` → `84ae478...`.
- Security hardening lineage before this rescan: `a5bdfa8...` → `cfe23fb...` → `3230a45...` → `175b74b...` → `0bc5700...` → `82d33b8...` → `16bda78...` → `9de410b...` → `84ae478...`.
- Earlier operational-layer boundary `76baf8b1b5e7f2b812bb1e4e17057a7d5ee7f126` is historical only and is not evidence for current verification.
- Fresh Final Execution Batch `#33578760739` and Fresh Quality `#33578760766` remain historical evidence for `1eede4439b1cc32a597c81158a0d93ad07138923`; they do not transfer to this exact HEAD.
- J runtime remains historically PASS on `1eede443...` and was not mutated in this resilience cycle.
- Backup/Restore operational truth remains: `RPO = UNPROVEN`, `RTO = UNPROVEN`, `RESTORE = UNPROVEN`, `DR = UNPROVEN`.
- Vercel remains externally blocked by deployment rate limiting; no substitute runtime evidence is accepted.
- MERGE / RELEASE / CERTIFICATION = **STOPPED**.

## Rescan — rollback recovery-path isolation

### RCA
The full rescan found a real second-order security defect in `api/rollback-drill.mjs`: the catch-path recovery used the raw configured `RESILIENCE_ROLLBACK_FORWARD_DEPLOYMENT` identifier directly. If deployment validation failed before both deployments were validated (for example, FROM failed while FORWARD was foreign-project), the catch block could attempt an alias mutation against an unvalidated deployment ID. This bypassed the newly established project-ownership boundary.

### Minimal Safe Fix
- `api/rollback-drill.mjs`: retain `validatedForwardDeployment` only after both `deploymentReady()` calls succeed; recovery aliasing now occurs only when that validated metadata object exists, and uses its validated `id`.
- No production target is permitted; no production rollback is automatic.

### Adversarial Regression
`scripts/resilience-runtime.test.mjs` was extended to assert that a validation failure involving an invalid/foreign FORWARD target produces failure without any alias call. Existing coverage remains for same-project, foreign-project, mixed pair, nonexistent, not-ready, API/network failure, missing project, missing deployment ID, identical targets, production environment, and production-domain guards.

### Executed Focused Verification
A Node 22 focused harness was executed against the current fetched rollback/runtime implementation. Result: **PASS** for the executable core security assertions, including the new no-unvalidated-recovery-alias invariant. The full repository test file was not claimed as a full-repository PASS because the execution container still has no mounted repository checkout; four non-core syntax targets were represented by syntax-equivalent stubs in the local harness.

## Security Hardening Cycle — ROLLBACK TARGET ISOLATION

### RCA
The rollback drill previously relied on Vercel authorization, readiness, and production-domain guards without independently proving that the FROM and FORWARD deployment IDs belonged to the configured `VERCEL_PROJECT_ID`. That was a real server-side cross-project isolation gap.

### Decision
Use server-side Vercel deployment metadata as the ownership boundary. Both deployment IDs must resolve successfully, report the exact configured `projectId`, and be `READY` before any alias operation. Production environment and production-domain guards remain fail-closed. FROM and FORWARD must also be different deployments so a drill cannot falsely exercise a no-op transition.

### Implemented
- `api/rollback-drill.mjs`: requires `VERCEL_PROJECT_ID`; rejects missing deployment IDs; fetches deployment metadata; requires exact `deployment.projectId === VERCEL_PROJECT_ID`; validates both FROM and FORWARD before alias mutation; rejects identical FROM/FORWARD IDs; preserves production and READY guards; uses validated metadata IDs for alias operations.
- `scripts/resilience-runtime.test.mjs`: adversarial coverage for same-project, foreign-project, mixed pair, nonexistent, not-ready, API/network failure, missing project, missing deployment ID, identical rollback targets, production environment, and production-domain guards.

### Exact-SHA Mutations
- `cfe23fbb9968d8c1f019aa1b359f595e25ebdbcf` — security enforcement of deployment project ownership.
- `3230a452ee86fe2332d66a4a40f767fdf6fc9cf5` — adversarial test coverage.
- `175b74b9c8c0c068f37370a80453c51726073b75` — documentation of security verification truth.
- `0bc5700ef14409eaef873e81b7d9fb54e04250af` — exact-head ledger correction.
- `82d33b88a5ea046827b62861ad427ec4d6eb9b2b` — fixed test-harness Vercel token configuration using a non-secret test value.
- `16bda78b65b830433d8393978f8f050a52ddc8d6` — rejected identical rollback deployment pair.
- `9de410b537292f247d3ece7ab05a8328dab84a85` — expanded adversarial test coverage for identical target, production target, and production domain.
- `4ca82e5f5e9f12f86ebbb2a569301fe6e998b86c` — prevented unvalidated rollback recovery aliasing.
- `afe4b8497afa72527011fac28705f7f14195877f` — added adversarial regression proving no alias on unvalidated recovery path.

## Runtime / Recovery Truth

- Health: **UNPROVEN** — no live exact-HEAD endpoint evidence.
- Tenant Canary: **UNPROVEN** — no authenticated live exact-HEAD evidence.
- Backup: **UNPROVEN** — no real exact-HEAD backup artifact evidence.
- Restore: **UNPROVEN** — no real safe-target restore execution/verifier proof.
- RPO: **UNPROVEN**.
- RTO: **UNPROVEN**.
- Rollback: **UNPROVEN** — security path is implemented and locally exercised at focused harness level, but no real staging deployment drill has executed.
- DR: **UNPROVEN**.

Required operational proof remains: real artifact + SHA-256, safe non-production restore, actual restore, `restored=true`, `integrity_verified=true`, measured RPO/RTO, persisted evidence, timestamp/run identity, exact source/environment identity, and staging rollback → verification → forward recovery → measured RTO.

## Recovery Checker Drift Audit

- `scripts/check-recovery-contract.mjs` was inspected and remains intentionally unchanged.
- It still checks only the historical candidate filenames `scripts/check-backup-integrity.mjs`, `scripts/check-restore-integrity.mjs`, and `scripts/check-disaster-recovery.mjs`, requiring at least two plus the text tokens `backup`, `restore`, and `rollback`.
- Current repository architecture instead exposes canonical Phase-F recovery/runtime contracts through `check-operational-resilience-contract.mjs`, `check-phase-f-runtime-closure.mjs`, `check-release-resilience-manifest.mjs`, `check-continuous-trust-contract.mjs`, the live resilience probes, the operational endpoints, and the resilience migrations.
- The historical checker therefore remains a stale/legacy naming checker and is the source of the prior `found 0/3` failure. It is not evidence that the canonical operational resilience capability is absent.
- No compatibility wrappers were created and no gate was weakened. A future checker repair must consume canonical contracts directly and preserve fail-closed behavior; this cycle does not mutate it because the user-directed condition for repair requires canonical capability proof and a dedicated checker mutation can be performed without obscuring the current operational truth.

## CI / Deployment Truth

- Fresh Final Execution Batch for the current exact HEAD: **NOT RUN**; no Run ID invented.
- Fresh Quality for the current exact HEAD: **NOT RUN**; no Run ID invented.
- Current Vercel status remains an external deployment-rate-limit failure; old deployments are not used as current evidence.
- Live Health / Tenant Canary / Backup / Restore / Rollback / DR remain **UNPROVEN** until an exact-HEAD deployment and real operational evidence exist.
- `check-recovery-contract.mjs` remains untouched; no synthetic compatibility scripts were created.

## Historical Integrity Rules

1. Historical PASS never transfers to a new SHA.
2. Every PASS must identify the exact tested SHA and execution source.
3. Static inspection is not runtime proof.
4. Endpoint existence is not operational proof.
5. UNPROVEN never silently becomes PASS.
6. No production restore or production rollback is automatic.
7. Historical evidence is retained; no prior history is deleted or rewritten.
8. Every mutation records OLD SHA → NEW SHA, actual parent, RCA, files, tests, adversarial coverage, and resulting verification truth.

**Evidence → RCA → Execute → Verify → Exact-Head Evidence → Document → Continue → Certify**
