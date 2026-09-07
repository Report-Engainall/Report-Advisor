# Provenance Index Repair Runbook

1. Apply the migration `20260907200000_add_canonical_text_provenance_tenant_fk_indexes`.
2. Verify both composite indexes exist in `pg_indexes`.
3. Run Performance Advisor.
4. Confirm the two composite-FK unindexed findings are absent.
5. Do not remove unused indexes solely from zero/low usage without workload evidence.
6. Bind certification to the exact candidate SHA after replay and runtime evidence.
