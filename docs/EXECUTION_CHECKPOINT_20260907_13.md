# Execution Checkpoint — 2026-09-07 Batch 13

## Exact source boundary

- Branch: `fix/runtime-provenance-20260906`
- Starting HEAD: `55997fcb51070bc9b161fd7636f7b0900aabadfa`
- Batch mutation commits:
  - `57165631e4a418b0fbe812c8c75d1af96d61a895` — initial durable adapter claim-token hardening
  - `c71e062369f41b3d6e051dd30500f1f060eff243` — final adapter contract: consume atomic claim RPC result
  - `5f562d4a974591d8c77eca120db298dc05506392` — forward migration returning atomic lease token and dead-lettering expired exhausted claims
  - `f4089d004eb29c87e6c5ee46d52d23a470e1a807` — foundation regression guard aligned with the new claim contract
- This checkpoint commit is the next exact source boundary.

## Real defect closed in source

A prior review finding was revalidated against current HEAD rather than blindly copied:

1. `claim_report_execution_job(...)` generated a lease token but returned only boolean success. The adapter then re-read the database row to obtain the token, leaving a race window between ownership acquisition and token consumption.
2. An expired leased/processing job at `attempt >= max_attempts` could remain non-terminal in the database claim path instead of being converged to `dead_letter`.
3. The checkpoint evidence-key validation was already NULL-safe on the current tenant-bound migration (`IS DISTINCT FROM 'array'`), so no duplicate change was made there.

## Remediation

### Durable claim RPC

New forward migration:

`supabase/migrations/20260907000000_harden_report_execution_claim_token.sql`

- Replaces the tenant-bound claim function with a `jsonb` result containing the claimed job identity and exact generated `lease_token`.
- Performs expired-final-attempt `dead_letter` convergence before normal claim filtering.
- Preserves explicit `p_company_id` tenant binding.
- Preserves service-role-only execution grants.
- Keeps lease generation and returned token in the same transaction.

### Durable adapter

`src/lib/report-execution/durable-worker-adapter.ts`

- `claim()` now requires an object RPC result.
- Extracts and validates the exact `lease_token` returned by the claim RPC.
- Validates returned company and worker identity.
- Does not perform a post-claim database read to obtain the fencing token.
- Retains the token in the returned `DurableExecutionJob` identity for heartbeat/checkpoint/completion/failure fencing.

### Regression guard

`scripts/check-report-execution-foundation.mjs`

- Now requires the new forward migration.
- Verifies the JSON claim result and atomic token consumption contract.

## Verification performed

- Re-read the mutated adapter on the resulting commit and verified the atomic claim-token path is present.
- Re-read `package.json`; `test:report-execution-foundation` is already registered, so no script registration mutation was necessary.
- Existing in-memory lease-fencing regression already covers stale-token rejection and final-attempt dead-letter convergence; this batch closes the corresponding durable SQL/adapter gap.
- No local runtime execution is claimed because this session has repository connector access rather than the user's local Node/Supabase environment.

## Release safety

- No frozen RC was mutated.
- No production alias was changed.
- No reset, rebase, merge, or forced ref movement was performed.
- Production certification remains fail-closed until observable CI and required authenticated/operational evidence exist.

## Next execution point

1. Verify the resulting branch HEAD exactly.
2. Inspect the fresh CI runs triggered by these source changes. If GitHub exposes real executable steps/logs, use them immediately to validate or fix any actual failing assertion; do not infer failure from status alone.
3. Re-check exact-head Vercel deployment/build.
4. Continue remaining independent P0/P1 operational closure fronts without reopening already-closed contracts.
