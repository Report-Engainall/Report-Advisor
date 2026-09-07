# Execution Checkpoint — Worker Provenance Reconciliation — Batch 41 — 2026-09-07

## Starting boundary
- Authoritative main HEAD: `5b083100d463aae4a4cf22ebbbff7e1470749b1f`.
- No frozen RC, production alias, or Staging data was mutated.
- Staging project: `fnqbvfuwbdpwvhcgzksl`.

## Verified findings
1. Staging has the durable `report_execution_jobs` ledger.
2. Staging has 17 columns on that ledger, including `lease_token`.
3. Staging has six structural constraints: primary key, tenant FK, unique `(company_id, job_key)`, status check, attempt bounds, and lease-token integrity.
4. Staging has RLS enabled on the ledger.
5. The ledger has an authenticated tenant policy using `current_company_id()` for both visibility and writes.
6. Effective authenticated table grants remain SELECT-only; service_role owns the mutation surface.
7. Staging has exactly eight worker lifecycle RPCs.
8. All eight are `SECURITY DEFINER`.
9. All eight grant EXECUTE to `service_role`.
10. None of the eight grant EXECUTE to `authenticated`.
11. None of the eight grant EXECUTE to `anon`.
12. Worker lifecycle mutation uses explicit `p_company_id` rather than relying on an end-user JWT tenant helper.
13. Lease-fenced operations require worker identity and lease token where applicable.
14. Checkpoint progression is source-hash stable and ordered across the canonical nine-stage state machine.
15. Completion requires the `rendered` checkpoint stage and a live matching lease.
16. Failure transitions to `failed` or `dead_letter` according to the attempt budget.
17. Recovery uses tenant scope, expiry, attempt exhaustion, and `FOR UPDATE SKIP LOCKED`.
18. Retry is tenant-scoped and blocked after the maximum attempt budget.
19. Enqueue is idempotent on `(company_id, job_key)` and rejects source identity drift.
20. Main contains the original worker lifecycle migration but not the later tenant-bound replay migration.
21. Historical commit `c515b112bd9df4b4d39f92dfe1d16b867cb90cd7` introduced a 232-line canonical worker migration.
22. Historical commit `407ea26d92b0bdc46d0ae8e2a21b36872f4f0030` explicitly reverted that migration from main.
23. Historical worker tenant binding was subsequently implemented in `20260906200000_bind_report_execution_worker_tenant_context.sql` on the dedicated worker-contract branch.
24. The latest worker-contract test explicitly expects the tenant-bound signatures and retirement of the legacy signatures.
25. The current main adapter was still using the legacy RPC signatures; this is a real source/runtime contract defect, not merely an evidence gap.

## Forward repair prepared
- Created branch: `fix/report-execution-provenance-20260907` from exact main HEAD.
- Added `supabase/migrations/20260907193000_reconcile_report_execution_worker_provenance.sql`.
- Added `scripts/report-execution-worker-provenance.test.mjs`.
- Aligned `src/lib/report-execution/durable-worker-adapter.ts` with the verified tenant-bound contract and lease-token fencing.
- Added this checkpoint document.

## Safety boundary
- Staging was read-only during this batch.
- No migration ledger row was changed.
- No synthetic worker job or fixture was inserted.
- No historical Git commit was rewritten.
- No frozen RC was changed.
- No production alias was changed.
- The repair is isolated in a reviewable branch and has not been merged.

## CI boundary
The repository's GitHub Actions execution layer is currently exhibiting the previously verified no-step/no-log failure mode on unrelated workflows. Therefore CI success/failure will not be interpreted as product certification until the Actions execution boundary itself is healthy.

## Next closure condition
Review the forward migration against the exact Staging contract, then let the PR gates evaluate it. Merge only after the migration replay/source-parity proof is green and no unrelated CI infrastructure failure masks the result. Staging runtime certification still requires real worker execution evidence; this source repair does not claim that runtime certification.
