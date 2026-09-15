# Execution record — PR #468 — 2026-09-15

## Current candidate
- Branch: `candidate/950e-scenario-hardening`
- Current Exact HEAD: `bc90d9381717142d53ae8a1b6ec825baeca8a4e3`
- Previous failed runtime SHA: `475780325e0148a998125ae0dc9b50e8317350c5` — never rerun.
- Earlier failed SHA: `92acae52581c0fef9e901e3537cf035bd8c3` — never rerun.

## Duplicate RCA
Runtime `34951477634` on `475780...` proved the second identical import reaches a terminal failed `import_jobs` state in staging. The remaining failure was the scenario harness readback race: `terminalImport(sourceHash)` could return the first-run `completed` job before the second-run terminal job was observed.

## Surgical fixes
- `b0b79f0683898e7b805d14282257e6d6b47a7c6b`: bind duplicate acceptance to new second-run DB evidence.
- `c30c9aafd7db47c7f976522207037834964c7769`: reject generic `completed` / `committed_and_rendered` as duplicate closure and include `job_type` in import-job snapshot identity.
- `bc90d9381717142d53ae8a1b6ec825baeca8a4e3`: isolate the second-run terminal DB evidence predicate into `assertDuplicateSecondRunTerminal()`; same fail-closed semantics, clearer provenance boundary.

## Runtime status
The Full Product Browser E2E workflow is configured for `pull_request.synchronize` and includes the modified scenario-contract path. The available GitHub connector currently exposes workflow inspection/rerun but not `workflow_dispatch`; no synthetic/no-op commit was created solely to manufacture evidence. Therefore **no PASS/12-of-12 claim** is made for `bc90...`.

## Release / certification
Final `production-regression-results.json` remains uncreated until a fresh 12/12 exact-SHA runtime. Release Decision and Certification Boundary remain fail-closed.

## Governance
- `main` unchanged.
- `docs/MASTER_EXECUTION_INDEX.md` unchanged.
- No historical evidence transfer.
- No fake session/JWT/fixtures.
- No RLS/service-role bypass.
- No validator weakening.
- No duplicate durable runner.
