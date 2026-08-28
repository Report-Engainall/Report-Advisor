# Report-Advisor — Final Deep Verification Execution Index

## Certification rule

No completion percentage is used as evidence. A requirement is Production-complete only when its implementation, integration, regression, exact-HEAD CI, runtime evidence, live verification, and production certification evidence exist as applicable.

## Exact verification point

- Verification branch: `runtime-evidence/p0-2a-readiness`
- Base SHA: `137facaf513652dd9ec38fc2db03d734dd8c7313`
- Current P0-2A branch HEAD: `2dc5684308a1990f840f42ec358495c40cc1a47a`
- PR: #69 (draft/open/unmerged)
- Base branch: `main`
- Exact-HEAD CI for `2dc5684308a1990f840f42ec358495c40cc1a47a`: queued/pending; no PASS claimed.
- Exact-HEAD quality run: `33130680352` (queued).
- Exact-HEAD P0-2A self-validation run: `33130680365` (queued).
- Exact-HEAD repository-forensics run: `33130680381` (in progress).

## P0 status

| Requirement | Static/contract | Self-validation | Live runtime | Status |
|---|---|---|---|---|
| P0-2A Runtime Evidence Infrastructure | IMPLEMENTED | CI PENDING | NOT RUN | **CI-VERIFICATION PENDING** |
| P0-2 Tenant A/B database isolation | HARNESS IMPLEMENTED | NOT LIVE-EXECUTED | BLOCKED — no safe authenticated staging/test DB supplied | **BLOCKED** |
| P0-1 Browser authenticated runtime | CONTRACT/PARTIAL | NOT LIVE-EXECUTED | BLOCKED — no browser runtime | **BLOCKED** |

## P0-2A validation controls now enforced

- `scripts/check-p0-2a-readiness.mjs`: readiness gate; never emits a live verification claim.
- `scripts/test-p0-2a-self-validation.mjs`: controlled negative tests for environment, authenticated context, evidence completeness, forged PASS, secret redaction, seed abort, harness fail-closed semantics, schema matrix consistency, RPC/function surface consistency, and certification separation.
- `scripts/runtime-evidence-matrix.mjs`: tenant table matrix aligned to the canonical tenant-RLS migration; RPC inventory is repository-derived and now classified against the application trust boundary.
- `scripts/p0-2-live-isolation-harness.mjs`: current executor proves SELECT fail-closed semantics; broader mutation/child/storage/realtime/inference execution remains runtime-gated and is not claimed as executed.
- `scripts/runtime-evidence-record.mjs`: required evidence fields, result validation, and secret-like field redaction.
- `scripts/runtime-evidence-seed.mjs`: privileged seed is environment-guarded and now refuses ambiguous User A/B membership before membership/data seeding.
- `.github/workflows/p0-2a-self-validation.yml`: exact-HEAD readiness/self-validation workflow.
- `.github/workflows/quality.yml`: exact-HEAD readiness and self-validation are explicit gates; live P0-2 harness is not executed without a supplied safe runtime.
- `.github/workflows/repository-forensics.yml`: repository identity, starter-artifact, compatibility-boundary, and P0-2A regression guards.

## Validation findings and fixes

### Finding 1 — harness could misclassify operational errors
- FINDING: an underlying SELECT error could have been represented as zero rows and therefore PASS.
- ROOT CAUSE: probe error path did not distinguish `verified=false` from `rows=0`.
- FIX: query errors now produce `NOT VERIFIED` and fail the process; only a successfully executed zero-row isolation probe can PASS.
- REGRESSION TEST: `test-p0-2a-self-validation.mjs` asserts the error path and terminal exit semantics.
- CI: prior exact-head regression passed the relevant gates; final current-head CI pending.
- STATUS: FIXED / REGRESSION-PROTECTED.

### Finding 2 — matrix drift
- FINDING: the old matrix contained stale table names and omitted the canonical tenant-RLS surface.
- ROOT CAUSE: hand-maintained matrix diverged from `20260823000000_tenant_rls_global_hardening.sql`.
- FIX: matrix now contains the canonical direct tenant tables plus `companies` and all four child tables; RPC coverage is repository-derived.
- REGRESSION TEST: self-validation independently compares the matrix with canonical SQL and independently discovers SQL functions.
- CI: current-head pending.
- STATUS: FIXED / REGRESSION-PROTECTED.

### Finding 3 — CI harness self-test syntax failure on prior run
- FINDING: run `33129898899` failed the new self-validation gate because the first implementation had a JavaScript syntax error; lint also failed on the same syntax error.
- ROOT CAUSE: malformed `for ... matchAll(...)` loop in the first self-validation implementation.
- FIX: corrected loop syntax and consolidated validation into `test-p0-2a-self-validation.mjs`.
- REGRESSION TEST: Node execution + lint.
- CI: prior corrected run passed self-validation; current-head CI pending.
- STATUS: FIXED.

### Finding 4 — unrelated document-intelligence CI import failure
- FINDING: run `33129898899` failed `python -m unittest` with `ModuleNotFoundError: No module named 'app'`.
- ROOT CAUSE: service package root was not present in `PYTHONPATH` in the CI command.
- FIX: quality workflow now runs the same tests with `PYTHONPATH=services/document-intelligence`.
- REGRESSION TEST: exact-head CI.
- STATUS: FIXED / CI-PROTECTED.

### Finding 5 — privileged seed classification
- FINDING: original run `33128334365` on `943d9090a5e2366f904cf498b497c3b03223e4b9` failed tenant legacy-consumer scanning on the controlled privileged seed.
- ROOT CAUSE: scanner did not distinguish the environment-guarded runtime-evidence seed from application tenant consumers.
- FIX: seed explicitly classified as privileged runtime-evidence infrastructure; application scanning remains enforced.
- REGRESSION TEST: tenant legacy-consumer boundary + seed self-validation.
- STATUS: FIXED / CI-PROTECTED.

### Finding 6 — Master Index assertion mismatch
- FINDING: self-validation expected an outdated P0-2A wording in the Master Index.
- ROOT CAUSE: the validator and index status vocabulary drifted.
- FIX: validator was aligned to the canonical index status wording.
- REGRESSION TEST: P0-2A self-validation.
- STATUS: FIXED.

### Finding 7 — privileged seed tenant-membership ambiguity
- FINDING: seed did not explicitly prove User A/B exclusivity before adding memberships/data.
- ROOT CAUSE: seed assumed the configured identities were tenant-exclusive.
- FIX: `assertTenantExclusivity()` now aborts when identities are shared or have unauthorized/ambiguous memberships, before membership/product seeding.
- REGRESSION TEST: seed safety/static guard plus future staging execution.
- STATUS: FIXED / RUNTIME-REQUIRED FOR FINAL PROOF.

### Finding 8 — repository identity contained legacy Bolt/starter artifacts
- FINDING: `.bolt/config.json` and `.bolt/prompt` were present; `index.html` contained starter/Bolt metadata and referenced a broken Vite favicon.
- ROOT CAUSE: historical project bootstrap artifacts survived into the current production tree.
- FIX: removed `.bolt/*`; replaced public identity metadata; added first-party `/favicon.svg`; added repository-forensics CI guard.
- REGRESSION TEST: `repository-forensics` workflow.
- CI: `33130680381` in progress.
- STATUS: FIXED / VERIFICATION PENDING.

### Finding 9 — package-lock root metadata drift
- FINDING: current `package.json` is `report-advisor@1.0.0`, while `package-lock.json` root metadata remains from the previous package identity/version.
- ROOT CAUSE: package identity was corrected without regenerating the lockfile root metadata.
- IMPACT: repository hygiene/integrity finding; not treated as a tenant-security proof.
- FIX PLAN: regenerate `package-lock.json` from the canonical `package.json` with the repository's pinned dependency graph; do not hand-edit dependency resolutions.
- REGRESSION TEST: `npm ci` plus explicit package/lock identity guard.
- STATUS: OPEN — P1 REPOSITORY HYGIENE.

### Finding 10 — P0-2 harness coverage was narrower than the full runtime matrix
- FINDING: the current live harness executes SELECT probes over the parent-table surface and does not yet execute the full requested A→A/B→B/A→B/B→A mutation, child-table, inference, storage, realtime, worker, and import/export matrix.
- ROOT CAUSE: live staging runtime is unavailable and the current executor was intentionally scoped to avoid inventing unsafe generic mutation payloads.
- FIX STATUS: NOT A BUG; executor expansion is required before P0-2 can become runtime-ready for the full matrix.
- ACTION: build explicit operation-specific executors and mark unsupported operations `NOT IMPLEMENTED`, never `PASS`.
- STATUS: OPEN — P0 RUNTIME COVERAGE GAP.

## Required negative-test contract

- Missing/empty/unknown/production-like environment => `ABORT`.
- Missing actor => `NOT VERIFIED`.
- Missing authorized tenant => `NOT VERIFIED`.
- Missing target tenant => `NOT VERIFIED`.
- Missing release => `NOT VERIFIED`.
- Missing commit SHA => `NOT VERIFIED`.
- Missing evidence fields => `NOT VERIFIED`.
- `RESULT=PASS` without complete required evidence/row counts => `REJECTED` / `NOT VERIFIED`.
- Fake password/token/service-role/authorization/cookie values => redacted and absent from serialized evidence.
- Seed without safe environment => abort before privileged client construction.
- Production seed => abort.
- Ambiguous tenant membership => abort.
- Cross-tenant leak => `FAIL` and non-zero exit.
- Operational runtime query error => `NOT VERIFIED` and non-zero exit.

## Matrix ↔ repository truth

Canonical tenant-RLS migration explicitly defines the direct tenant-scoped surface; child policies cover `sale_items`, `purchase_items`, `import_rows`, and `import_job_rows`. The runtime matrix is checked against canonical SQL rather than treated as independent truth.

RPC inventory now records, where statically discoverable:

```text
function name
signature
security mode
caller classification
application trust boundary
tenant sensitivity
expected denial
migration source
```

Only `APPLICATION RPC` entries are candidates for P0-2 runtime RPC execution; trigger/internal/utility/unknown functions are not falsely treated as browser trust-boundary RPCs.

## Compatibility boundary

`src/lib/queries-compat.ts` remains an intentional compatibility surface for legacy consumers. The existing guard verifies canonical delegation, authoritative tenant resolution, bounded export behavior, and rejection of legacy secondary analytics RPC usage. Current consumer evidence includes `src/App.tsx` using `markAlertRead`; this remains `INTENTIONAL COMPATIBILITY` until a canonical consumer migration is safe and regression-protected.

## Certification separation

`P0-2A = CI-VERIFIED` only after the current exact-HEAD gates succeed.

`P0-2 = BLOCKED` until a safe authenticated staging/test database is available and the Tenant A/B runtime harness executes against it.

`P0-1 = BLOCKED` until authenticated browser runtime evidence exists.

**PRODUCTION-CERTIFIED: NO.**
