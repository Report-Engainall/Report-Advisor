# Execution Checkpoint — 2026-09-07 Batch 15

## Exact source boundary

- Branch: `fix/runtime-provenance-20260906`
- Starting exact HEAD: `7ed8b1dc25d108ea5d3480ef91dd93db021091e1`
- Mutation commits in this batch:
  - `af188053fae3434abacd2880643e1429486cd70b` — make durable claim return the claimed row directly from SQL `UPDATE ... RETURNING`.
  - `85a00dfdc8697fcf93ed89b76f157fd5cf761275` — strengthen the foundation regression guard for the atomic SQL return contract.

## Real hardening completed

The durable-worker claim path no longer performs a second SQL read to construct the claimed row. The canonical migration now returns the complete claimed job identity, including the generated fencing token, directly from the atomic `UPDATE ... RETURNING jsonb_build_object(...)` statement. This removes an unnecessary post-claim read and makes the atomic ownership/token contract explicit in source.

The regression guard now requires the `returning jsonb_build_object` contract in addition to the adapter checks that consume the returned `lease_token`, validate tenant/worker ownership, and prohibit a post-claim table read inside `claim()`.

## Evidence boundary

- This is source-level hardening plus a static regression guard; it is **not** runtime certification.
- The forward migration `20260907000000_harden_report_execution_claim_token.sql` still needs application to the live Supabase environment and real worker exercise.
- CI remains non-diagnostic where GitHub exposes failed jobs with zero executable steps and unavailable log blobs. No code defect is inferred from those records.
- Frozen RCs and production aliases remain untouched.

## Next execution point

Continue from the exact new HEAD after this checkpoint. Prioritize live migration application/runtime exercise and authenticated A/B operational evidence when the connected environment permits; otherwise continue the highest-value independent P0/P1 source/runtime contract fronts without reopening closed work.
