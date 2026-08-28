# Report-Advisor — Final Deep Verification Execution Index

## Certification rule

No completion percentage is used as evidence. A requirement is Production-complete only when its implementation, integration, regression, exact-HEAD CI, runtime evidence, live verification, and production certification evidence exist as applicable.

## Exact verification point

- Verification branch: `runtime-evidence/p0-2a-readiness`
- Base SHA: `137facaf513652dd9ec38fc2db03d734dd8c7313`
- Current P0-2A branch HEAD: `326d41d0d2a839f5eb5b0821c34551247d73862f`
- PR: #69 (draft/open/unmerged)
- Base branch: `main`
- Exact-HEAD CI for `326d41d0d2a839f5eb5b0821c34551247d73862f`: RUNNING; no PASS claimed yet.

## P0 status

| Requirement | Static/contract | Self-validation | Live runtime | Status |
|---|---|---|---|---|
| P0-2A Runtime Evidence Infrastructure | READY | RUNNING on exact HEAD | NOT RUN | **READY + SELF-VALIDATION PENDING** |
| P0-2 Tenant A/B database isolation | READY HARNESS | NOT LIVE-EXECUTED | BLOCKED — no safe authenticated staging/test DB supplied | **BLOCKED** |
| P0-1 Browser authenticated runtime | CONTRACT/PARTIAL | NOT LIVE-EXECUTED | BLOCKED — no browser runtime | **BLOCKED** |

## P0-2A validation controls now enforced

- `scripts/check-p0-2a-readiness.mjs`: readiness gate; never emits a live verification claim.
- `scripts/test-p0-2a-self-validation.mjs`: controlled negative tests for environment, authenticated context, evidence completeness, forged PASS, secret redaction, seed abort, harness fail-closed semantics, schema matrix consistency, RPC/function surface consistency, and certification separation.
- `scripts/runtime-evidence-matrix.mjs`: tenant table matrix aligned to the canonical tenant-RLS migration; RPC matrix is derived from the repository SQL function surface rather than hand-written aliases.
- `scripts/p0-2-live-isolation-harness.mjs`: query errors become `NOT VERIFIED`, cross-tenant rows become `FAIL`, and either condition exits non-zero; a real FAIL cannot be converted to PASS.
- `scripts/runtime-evidence-record.mjs`: required evidence fields, result validation, and secret-like field redaction.
- `scripts/runtime-evidence-seed.mjs`: privileged seed remains environment-guarded and cannot run without `staging`/`test`.
- `.github/workflows/p0-2a-self-validation.yml`: exact-HEAD readiness/self-validation workflow.
- `.github/workflows/quality.yml`: exact-HEAD readiness and self-validation are explicit gates; live P0-2 harness is not executed by CI without a supplied safe runtime.

## Validation findings and fixes

### Finding 1 — harness could misclassify operational errors
- FINDING: an underlying SELECT error could have been represented as zero rows and therefore PASS.
- ROOT CAUSE: probe error path did not distinguish `verified=false` from `rows=0`.
- FIX: query errors now produce `NOT VERIFIED` and fail the process; only a successfully executed zero-row isolation probe can PASS.
- REGRESSION TEST: `test-p0-2a-self-validation.mjs` asserts the error path and terminal exit semantics.
- CI: exact-HEAD run pending.

### Finding 2 — matrix drift
- FINDING: the old matrix contained stale table names and omitted the canonical tenant-RLS surface.
- ROOT CAUSE: hand-maintained matrix diverged from `20260823000000_tenant_rls_global_hardening.sql`.
- FIX: matrix now contains the canonical direct tenant tables plus `companies` and all four child tables; RPC coverage is repository-derived.
- REGRESSION TEST: self-validation independently compares the matrix with the canonical SQL migration and independently discovers SQL functions.
- CI: exact-HEAD run pending.

### Finding 3 — CI harness self-test syntax failure on prior run
- FINDING: run `33129898899` failed the new self-validation gate because the first implementation had a JavaScript syntax error; lint also failed on the same syntax error.
- ROOT CAUSE: malformed `for ... matchAll(...)` loop in the first self-validation implementation.
- FIX: corrected loop syntax and consolidated validation into `test-p0-2a-self-validation.mjs`.
- REGRESSION TEST: Node execution + lint on the new exact HEAD.
- CI: exact-HEAD run pending.

### Finding 4 — unrelated document-intelligence CI import failure
- FINDING: run `33129898899` also failed `python -m unittest` with `ModuleNotFoundError: No module named 'app'`.
- ROOT CAUSE: service package root was not present in `PYTHONPATH` in the CI command.
- FIX: quality workflow now runs the same tests with `PYTHONPATH=services/document-intelligence`.
- REGRESSION TEST: exact-HEAD CI.

### Finding 5 — privileged seed classification
- FINDING: the original exact-head run `33128334365` on `943d9090a5e2366f904cf498b497c3b03223e4b9` failed tenant legacy-consumer scanning on the controlled privileged seed.
- ROOT CAUSE: scanner did not distinguish the environment-guarded runtime-evidence seed from application tenant consumers.
- FIX: seed is explicitly classified as privileged runtime-evidence infrastructure; application scanning remains enforced.
- REGRESSION TEST: tenant legacy-consumer boundary + seed self-validation.

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
- Cross-tenant leak => `FAIL` and non-zero exit.
- Operational runtime query error => `NOT VERIFIED` and non-zero exit.

## Matrix ↔ repository truth

Canonical tenant-RLS migration explicitly defines 22 direct tenant-scoped tables; child policies cover `sale_items`, `purchase_items`, `import_rows`, and `import_job_rows`. The runtime matrix is now generated/checked against that canonical surface rather than treated as independent truth.

## Certification separation

`P0-2A = READY` does **not** mean `P0-2 = LIVE VERIFIED`.

`P0-2 = BLOCKED` until a safe authenticated staging/test database is available and the Tenant A/B runtime harness executes against it.

`P0-1 = BLOCKED` until authenticated browser runtime evidence exists.

**PRODUCTION-CERTIFIED: NO.**
