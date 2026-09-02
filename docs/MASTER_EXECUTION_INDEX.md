# Report Advisor — Master Execution & Truth Index

## Current Truth — 2026-09-02

- Current canonical `main` / exact HEAD: **`a5bdfa8a32a6ace477a1c0ef6e8f6d5132395788`**.
- Previous exact verification target: `1eede4439b1cc32a597c81158a0d93ad07138923`.
- Fresh Final Execution Batch `#33578760739` proved J runtime = PASS on exact `1eede443...`; **J has not been mutated in the operational-layer work below**.
- Fresh Quality `#33578760766` proved Phase 10 remains blocked by missing actual recovery evidence on exact `1eede443...`.
- The new operational-runtime commits below are descendants of that exact head and therefore require fresh CI/exact-SHA verification before any PASS is claimed.
- Backup/Restore operational truth remains: `RPO = UNPROVEN`, `RTO = UNPROVEN`, `RESTORE = UNPROVEN`, `DR = UNPROVEN`.
- Vercel remains `BLOCKED — External Deployment Rate Limit`; no substitute production/runtime evidence is accepted.
- MERGE / RELEASE / CERTIFICATION = **STOPPED**.

## Operational Runtime Layer — IMPLEMENTED BOUNDARY

### Architecture Decision

**Vercel Node.js serverless functions** are the smallest safe in-application runtime layer for bounded operational HTTP surfaces. They keep privileged credentials server-side and are not exposed through the SPA client. Database/runtime checks use Supabase server APIs; deployment rollback uses the Vercel API only for an explicitly non-production drill domain. Long-lived or privileged restore execution remains an external operational dependency because the current platform APIs do not provide a safe cross-project restore target primitive inside this application runtime.

### Implemented

- `src/server/resilience-runtime.mjs` — fail-closed operational auth, server-side Supabase/Management API helpers, evidence persistence, integrity hashing, production guard.
- `api/health.mjs` — real DB-backed readiness/health probe and `operational_health_snapshots` evidence persistence.
- `api/tenant-canary.mjs` — authenticated tenant isolation canary. It requires a seeded foreign-tenant sentinel and proves the authenticated tenant can read its own evidence while receiving zero foreign rows.
- `api/backup-restore-verify.mjs` — real backup inventory via Supabase Management API, RPO measurement, real artifact SHA-256 verification, and orchestration to a separately controlled restore verifier. It fails closed unless an actual artifact, expected hash, and restore verifier are configured and the verifier explicitly proves `restored=true` and `integrity_verified=true`.
- `api/rollback-drill.mjs` — real non-production Vercel rollback → probe → forward recovery drill with deployment readiness checks, alias reassignment, measured recovery time, evidence persistence, and hard rejection of production targets.
- `vercel.json` — filesystem-first routing so `/api/*` functions are not swallowed by the SPA fallback.
- `.github/workflows/phase-f-live-resilience.yml` — runs local runtime syntax/guard tests, static resilience contracts, then authenticated fail-closed live probes.
- `scripts/phase-f-live-resilience-probes.mjs` — now requires operational auth plus an authenticated canary token and sends them server-side; fail-closed behavior is unchanged.
- `scripts/resilience-runtime.test.mjs` — local syntax/guard coverage for the operational layer.

### Security / Failure Behavior

- No secrets are committed to Git.
- Operational endpoints require `x-resilience-token`.
- Tenant canary separately requires an authenticated Supabase bearer token.
- Restore/rollback endpoints do not silently downgrade to PASS when configuration or evidence is missing.
- Production rollback drills are explicitly rejected by the runtime.
- No production backup/restore/rollback is automatically executed by CI.
- Existing J runtime was not touched.
- `check-recovery-contract.mjs` was intentionally not modified.

### External Dependency Remaining

A real restore verifier still requires a safe restore target and credentials/permissions to restore the real backup artifact into that target. The application layer is now capable of consuming and persisting that proof, but it cannot safely invent or substitute the restore target. Therefore `RESTORE/RTO/DR` remain **UNPROVEN** until a real operational verifier is configured and exercised.

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
