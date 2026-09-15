# Execution record — PR #468 — 2026-09-15

## Current candidate
- Branch: `candidate/950e-scenario-hardening`
- Current Exact HEAD: `67ea6dc76ebe228b95ae0b94a9aabd8409085547`
- Previous failed runtime: `34951477634` / job `104323214175` on `475780325e0148a998125ae0dc9b50e8317350c5` — never rerun.
- Earlier failed SHA `92acae52581c0fef9e901e3537cf035bd8c3` — never rerun.

## Duplicate RCA / fixes
- `475780...` established that the second identical import reaches terminal failed `import_jobs` in staging; the remaining failure was harness readback racing against the first-run `completed` row.
- `b0b79f...` bound duplicate acceptance to a new failed second-run DB row and `+1` import-job count delta.
- `c30c9...` rejected generic `completed` / `committed_and_rendered` as duplicate closure and added `job_type` to snapshot identity.
- `bc90d...` isolated the second-run terminal evidence predicate.
- `67ea6d...` centralized the allowed duplicate terminal policy in `DUPLICATE_TERMINAL_STATUSES`.

## Fresh runtime
No fresh runtime for `67ea...` is exposed by the available GitHub connector. The existing workflow is configured for `pull_request.synchronize` and includes the changed scenario-contract path, but the connector exposes inspection/rerun only and no workflow-dispatch action. No synthetic/no-op commit was used just to manufacture evidence.

Therefore:
- `67ea...` is **NOT PASS**.
- `67ea...` is **NOT declared FAILED** without runtime evidence.
- No `production-regression-results.json` final artifact exists.
- No 12/12 claim exists.
- Certification remains FAIL-CLOSED.

## Independent validation
`production-release-decision.mjs` passed negative preflight checks: invalid/missing artifact, zero results, and failed scenarios all return `blocked`; no static success path was found.

## Governance
- `main` unchanged.
- `docs/MASTER_EXECUTION_INDEX.md` unchanged.
- Historical PASS/evidence not transferred.
- No validator/RLS/auth bypass.
- No duplicate durable runner.
