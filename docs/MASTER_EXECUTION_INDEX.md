# Report Advisor — Master Execution & Truth Index

## Current Truth — 2026-09-02

- Current canonical `main` / exact HEAD: **`e8970401d2ba0d298749abb9b2dd321a573c588c`**.
- Actual parent: `35ff36b5b5f6b253af002cff0afbb5084cb8aed7`.
- Execution resumed from owner-designated exact HEAD `9f364068bf2b678c330f2665f4ac75a2c21e0aba`; actual main matched that starting point before this execution cycle.
- This cycle introduced backup/restore evidence-integrity hardening and a dedicated executable contract check; no historical PASS was transferred to the new SHA.
- Backup/Restore operational truth remains: `RPO = UNPROVEN`, `RTO = UNPROVEN`, `RESTORE = UNPROVEN`, `DR = UNPROVEN`.
- Vercel/live runtime remains externally dependent; no substitute runtime evidence is accepted.
- MERGE / RELEASE / CERTIFICATION remain **STOPPED** until exact-HEAD operational evidence and required gates are satisfied.

## Execution Cycle — backup/restore evidence integrity hardening

### RCA
The backup/restore verifier accepted two evidence inputs without sufficiently strict integrity semantics: `RESILIENCE_MAX_RPO_SECONDS` could parse to `NaN` and bypass the RPO comparison, and completed backup records with malformed timestamps or missing IDs could become invalid evidence candidates. More importantly, the restore verifier's self-reported `rto_seconds` was previously allowed to replace the server-measured elapsed restore time, which could make RTO evidence non-measurement-derived.

### Implemented
- `api/backup-restore-verify.mjs`: fail-closed validation of maximum RPO configuration; require a 64-hex expected artifact SHA-256; reject completed backup candidates without a valid timestamp or non-empty backup ID; use the server-measured restore elapsed time as authoritative `rto_seconds`; preserve verifier-reported RTO only as supplemental evidence.
- `scripts/check-backup-restore-evidence-integrity.mjs`: executable contract regression covering all newly enforced evidence-integrity invariants and explicitly rejecting the old untrusted-RTO expression.
- `package.json`: wired the new check into `test:operational-resilience`, so the existing Quality operational-resilience gate executes it automatically.

### Verification State
- GitHub `Final Execution Batch` and `quality` workflows were automatically triggered by the mutation and are tied to exact HEAD `35ff36b5...` for the intermediate commit and will be superseded by the final exact HEAD `e8970401...` after the package wiring mutation.
- No local repository checkout exists in the execution container, so no local full-suite PASS is claimed.
- Fresh CI for final exact HEAD must be evaluated by exact SHA; no earlier run is promoted.

## Rescan — rollback recovery-path isolation

### RCA
The full rescan found a real second-order security defect in `api/rollback-drill.mjs`: the catch-path recovery used the raw configured `RESILIENCE_ROLLBACK_FORWARD_DEPLOYMENT` identifier directly. If deployment validation failed before both deployments were validated, the catch block could attempt an alias mutation against an unvalidated deployment ID. This bypassed the project-ownership boundary.

### Minimal Safe Fix
- `api/rollback-drill.mjs`: retain `validatedForwardDeployment` only after both `deploymentReady()` calls succeed; recovery aliasing now occurs only when that validated metadata object exists, and uses its validated `id`.
- No production target is permitted; no production rollback is automatic.

### Adversarial Regression
`scripts/resilience-runtime.test.mjs` now asserts that a validation failure involving an invalid/foreign FORWARD target produces failure without any alias call. Existing coverage remains for same-project, foreign-project, mixed pair, nonexistent, not-ready, API/network failure, missing project, missing deployment ID, identical targets, production environment, and production-domain guards.

### Executed Focused Verification
A Node 22 focused harness was executed against the current fetched rollback/runtime implementation. Result: **PASS** for the executable core security assertions, including the no-unvalidated-recovery-alias invariant. The full repository test file was not claimed as a full-repository PASS because the execution container has no mounted repository checkout; four non-core syntax targets were represented by syntax-equivalent stubs in the local harness.

## Security Hardening Cycle — ROLLBACK TARGET ISOLATION

### RCA
The rollback drill previously relied on Vercel authorization, readiness, and production-domain guards without independently proving that the FROM and FORWARD deployment IDs belonged to the configured `VERCEL_PROJECT_ID`. That was a real server-side cross-project isolation gap.

### Decision
Use server-side Vercel deployment metadata as the ownership boundary. Both deployment IDs must resolve successfully, report the exact configured `projectId`, and be `READY` before any alias operation. Production environment and production-domain guards remain fail-closed. FROM and FORWARD must also be different deployments so a drill cannot falsely exercise a no-op transition.

### Implemented
- `api/rollback-drill.mjs`: requires `VERCEL_PROJECT_ID`; rejects missing deployment IDs; fetches deployment metadata; requires exact `deployment.projectId === VERCEL_PROJECT_ID`; validates both FROM and FORWARD before alias mutation; rejects identical FROM/FORWARD IDs; preserves production and READY guards; uses validated metadata IDs for alias operations.
- `scripts/resilience-runtime.test.mjs`: adversarial coverage for same-project, foreign-project, mixed pair, nonexistent, not-ready, API/network failure, missing project, missing deployment ID, identical rollback targets, production environment, production-domain guards, and unvalidated recovery-alias prevention.

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
- `b5b0e727f59390798b7b9783a7a69ea1ab9caad4` — replaced stale historical recovery checker logic with canonical Phase-F checker execution.

## Recovery Checker Drift Audit

### RCA
`scripts/check-recovery-contract.mjs` was stale: it only looked for three historical script names and failed with `found 0/3`, while the implemented architecture had moved to canonical Phase-F operational resilience contracts.

### Fix
The checker now executes, fail-closed, all four canonical contracts:
- `check-phase-f-runtime-closure.mjs`
- `check-operational-resilience-contract.mjs`
- `check-release-resilience-manifest.mjs`
- `check-continuous-trust-contract.mjs`

No compatibility wrappers were created. No gate was weakened. Missing or failing canonical checks propagate as failure. This removes the stale false-fail without creating a false-pass path.

### Checker Regression
A local executable orchestration harness verified both conditions: all four canonical check processes present → PASS; one canonical check missing → non-zero failure. This was a focused checker-orchestration test, not a full repository CI run.

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

## CI / Deployment Truth

- Fresh Final Execution Batch for the current exact HEAD: **PENDING**; the push-triggered workflow must be checked against `e8970401d2ba0d298749abb9b2dd321a573c588c`.
- Fresh Quality for the current exact HEAD: **PENDING**; the push-triggered workflow must be checked against `e8970401d2ba0d298749abb9b2dd321a573c588c`.
- No historical CI result is promoted to the new exact HEAD.
- Live Health / Tenant Canary / Backup / Restore / Rollback / DR remain **UNPROVEN** until an exact-HEAD deployment and real operational evidence exist.

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