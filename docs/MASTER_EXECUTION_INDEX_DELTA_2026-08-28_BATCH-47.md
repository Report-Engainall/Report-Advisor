# Master Execution Index Delta — Batch #47

Snapshot: 2026-08-28
Repository: `Report-Engainall/Report-Advisor`
Branch: `fix/inventory-report-truth`

## Batch #47 — Explicit child-table tenant RLS enablement + gate wiring

### Finding
The canonical tenant hardening migration defined tenant policies for `sale_items`, `purchase_items`, `import_rows`, and `import_job_rows`, but the executable RLS enablement for those four child tables was not represented by an explicit follow-up migration. Policy presence alone must not be treated as proof that RLS is active.

### Root cause
The hardening migration combined dynamic RLS enablement for direct company-owned tables with separately declared parent-scoped child policies. The regression gate verified policy text and the direct-table array, but did not require an explicit executable RLS enablement contract for the child tables.

### Canonical fix
Added `supabase/migrations/20260828000000_tenant_child_rls_enablement.sql` with explicit:
- `ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE import_rows ENABLE ROW LEVEL SECURITY;`
- `ALTER TABLE import_job_rows ENABLE ROW LEVEL SECURITY;`

The existing parent-scoped policies remain the authorization contract; this migration closes the enablement-proof gap without rewriting an already-applied migration.

### Regression / gate fix
Updated `scripts/check-global-tenant-rls.mjs` to require the child-RLS migration and verify all four executable `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` statements.

### CI integration
Updated `.github/workflows/quality.yml` to execute `node scripts/check-global-tenant-rls.mjs` before typecheck/lint/build.

### Commits
- Child RLS migration: `3038ac900867628e2e4eda64aece92c59bcbf536`
- Security gate: `76f5a63afb9dc699d01fd113a8292f75c5048116`
- CI wiring: `1535bc83f25390e7803893128a10c68ba9a43793`

### Exact-head evidence
Current code HEAD: `1535bc83f25390e7803893128a10c68ba9a43793`.

GitHub check-runs for this exact SHA: `0` observed. Therefore **NO CI PASS is claimed**.

### Regression execution
Not executed locally in this environment. The gate is committed and CI-ready. **No PASS claim.**

### Consumer / security verification
Repository-level SQL contract is strengthened. Real adversarial Tenant A/B runtime isolation remains **NOT VERIFIED** and requires a live authenticated Supabase environment.

### Certification state
`IMPLEMENTED → REGRESSION-WIRED → EXACT-HEAD CI PENDING → CONSUMER/RUNTIME VERIFIED PENDING`

### Batch state
`PARTIAL`

### Remaining LIVE evidence
- authenticated Tenant A/B SELECT/INSERT/UPDATE/DELETE adversarial tests;
- child-table isolation across invoices/imports;
- Storage isolation;
- Realtime authorization;
- AI/vector metadata isolation.

## Index integrity note
`docs/MASTER_EXECUTION_INDEX.md` is the canonical historical index. Its current retrieval surface is truncated by the available GitHub content response, so this immutable delta records Batch #47 without reconstructing or overwriting unseen historical content. No historical evidence is removed or rewritten.
