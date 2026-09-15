# Execution record — PR #468 — 2026-09-15

## Current candidate
- Branch: `candidate/950e-scenario-hardening`
- Current Exact HEAD: `c30c9aafd7db47c7f976522207037834964c7769`
- Previous failed runtime SHA: `475780325e0148a998125ae0dc9b50e8317350c5` — never rerun.
- Previous failed runtime: `34951477634` / job `104323214175` — `DUPLICATE_NON_TERMINAL` at Step 15.
- Earlier failed SHA `92acae52581c0fef9e901e3537cf035bd8c3fcc3` remains permanently excluded.
- No historical PASS/evidence is transferred to the current SHA.

## Duplicate RCA
The `475780...` runtime established a terminal duplicate state in staging: the first import was `completed`; the second identical `sourceHash` import became terminal `failed`. The remaining failure was the scenario harness readback race: `terminalImport(sourceHash)` could return the first-run `completed` job before the second-run terminal job was observed.

## Surgical contract repair
`b0b79f0683898e7b805d14282257e6d6b47a7c6b` bound duplicate acceptance to real second-run DB evidence: exactly one new failed `import_jobs` row and count delta `+1` when the second run reports `DUPLICATE_SECOND_RUN_MUST_TERMINATE`.

`c30c9aafd7db47c7f976522207037834964c7769` further hardens the contract so a duplicate second run cannot be declared terminal through generic `completed` or `committed_and_rendered` states. Accepted duplicate terminals are `rejected`, `reviewed`, or `rejected_or_reviewed`, or the explicit second-run DB evidence path above. Import-job snapshot identity now also includes `job_type`.

## Runtime status
- A fresh runtime for `c30c9...` is not currently exposed through the available GitHub connector.
- The Full Product Browser E2E workflow is configured for `pull_request.synchronize` and includes `scripts/production-scenario-contract.mjs` in its path filter.
- The available GitHub connector exposes workflow-run inspection/rerun but no workflow-dispatch action. No synthetic/no-op commit was created solely to manufacture a run.
- Therefore no PASS/12-of-12 claim is made for `c30c9...`.

## Known proven history (not current evidence)
- `ddf3aadd...`: Auth/tenant/browser 28/28 and dashboard financial readback passed; Step 15 failed duplicate contract.
- `475780...`: Auth/tenant/browser and Steps 1–14 passed; Step 15 failed duplicate contract; staging showed second duplicate import terminal failure.

## Release chain
Final `production-regression-results.json` is not created until a fresh 12/12 runtime on the same exact SHA. `production-release-decision.mjs` is fail-closed and requires exact SHA, authenticated runtime, tenant, runtime window, evidence references, and artifact hash.

## Governance
- `main` not mutated.
- `docs/MASTER_EXECUTION_INDEX.md` not mutated.
- Certification remains FAIL-CLOSED until current exact-head evidence and governed authority transition are satisfied.
- No validator bypass, historical authority transfer, fake session/JWT, service-role browser bypass, RLS bypass, timeout inflation, or duplicate durable runner.
