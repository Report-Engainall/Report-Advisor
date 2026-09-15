# Execution Record — 2026-09-15 — Exact SHA `823e09617f913612ca18d7cb437aef4ea428cce4`

## Purpose

This record documents the current execution wave and its exact-HEAD evidence boundary. It is documentation only; it does not certify the candidate.

## Exact HEAD

`823e09617f913612ca18d7cb437aef4ea428cce4`

Commit message: `fix: use terminal state in duplicate scenario observer`

Parent: `17c8975c89151ffd12c599c8905563e27d3c213d`

## Fresh Runtime Result

The fresh GitHub Actions Product Browser workflow `Full Product Browser E2E #603` reached the real 12-scenario runtime and ended **FAILURE**.

First failing layer:

`Step 15 → excel-standard → DUPLICATE_NON_TERMINAL`

This is not a certification PASS and must not be promoted to release evidence.

## RCA Direction

The failure is in the scenario observer/ordering path. The duplicate assertion can receive a non-final/undefined status before the observer's terminal state has been normalized. The real duplicate import path is required to remain fail-closed and must continue proving tenant, sourceHash, terminal import state, and zero unintended business mutation.

The current contract intentionally accepts only terminal business statuses for duplicate idempotency:

- `reviewed`
- `rejected`
- `completed`
- `committed_and_rendered`
- `rejected_or_reviewed`

The raw `import_jobs.status = failed` state must be normalized by the observer into the appropriate terminal business result before the assertion; the contract must not be weakened merely to accept `failed`.

## Required Next Execution

1. Do not rerun SHA `823e09617f913612ca18d7cb437aef4ea428cce4`.
2. Inspect and minimally repair `scripts/production-scenario-runtime-e2e.mjs` observer/ordering so terminal state is established before `assertDuplicateIdempotency` consumes it.
3. Preserve real DB observations: tenant, sourceHash, terminal import status, and zero unintended mutation.
4. Run a focused duplicate observer test.
5. Create a new exact SHA only after the fix is proven.
6. Run a fresh 12-scenario runtime from zero on the new SHA.
7. If another first failure appears: RCA → minimal fix → focused test → new SHA → fresh runtime.
8. Only after 12/12 terminal results are proven: generate fresh `release-evidence/production-regression-results.json`.
9. Validate artifact integrity and exact SHA binding.
10. Run release decision and final certification only from the fresh artifact.

## Evidence Rules

- No historical evidence transfer between SHAs.
- `FIXED` is not `PASS`.
- `IN_PROGRESS` is not `PASS`.
- No fake sessions, JWTs, actors, role bypasses, service-role bypasses, or RLS weakening.
- No weakening of scenario assertions or validators to manufacture PASS.
- No second durable runner.
- No `main` mutation.
- No `MASTER_EXECUTION_INDEX.md` mutation.
- Closed independent gates are not rerun without a dependency change.
- Temporary logs/traces/videos/build artifacts should be minimized and cleaned after evidence extraction.

## Gates Already Proven on This Execution Chain

The current execution chain reported successful completion of Browser, business Persistence, Import API Boundary, and Dashboard Financial Readback before the Step 15 failure. Those results remain exact-SHA-bound and do not substitute for the failed 12-scenario runtime.

## Vercel Note

A prior deployment-limit/free-tier message was observed alongside a later Ready deployment state. It is not classified as a product failure without independent evidence and is not used as certification evidence.

## Certification State

**FAIL-CLOSED.**

No release certification is claimed from this record. The next certification boundary is a new exact SHA produced by the minimal observer fix and freshly verified through the complete runtime/artifact/validator/release chain.
