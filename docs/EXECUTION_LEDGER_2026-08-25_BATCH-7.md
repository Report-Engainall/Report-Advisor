# Execution Ledger — 2026-08-25 — Batch 7

## Objective
Continue the current P0 tenant-convergence stage, close an independent P1 truthfulness issue, and complete the owner profile-control slice without creating duplicate architecture.

## Pre-change discovery
- `src/lib/supabase.ts` already uses persistent Supabase sessions and has no demo-company fallback.
- `src/components/AuthGate.tsx` and `src/App.tsx` already provide the authenticated application boundary.
- `supabase/migrations/20260822200000_canonical_tenant_membership.sql` already defines `company_memberships` and `public.current_company_id()` as the database tenant authority.
- `src/lib/queries.ts` still imported a removed/static `COMPANY_ID` surface and applied frontend tenant filters. This was a real convergence gap because the database is authoritative.
- `src/components/Header.tsx` displayed `النظام يعمل` unconditionally, which was a truthfulness/observability gap.
- `src/pages/EntityPages.tsx` still contains a legacy `COMPANY_ID` dependency in its Data Quality page and remains open for the next source-level convergence fix.

## Changes
### 1. Dashboard query tenant convergence
Commit: `cc8550b273da48dc1914aa5380c488882676f0cb`

Changed `src/lib/queries.ts` so canonical dashboard reads no longer depend on a frontend `COMPANY_ID`. Tenant authorization/filtering is delegated to authenticated RLS/current_company_id at the database boundary. `sale_items` remains indirectly scoped through its parent `sales_invoices` IDs.

### 2. Truthful Header health state
Commit: `5393c87616b57d9697d9b16c290e37faee15a201`

Changed `src/components/Header.tsx` to perform a real authenticated session check and database round-trip through `current_company_id()` every 60 seconds. UI states are now checking/healthy/degraded/offline instead of unconditional success.

### 3. Owner-editable profile/display name
Commit: `a418b38bd364992a5e17784f2353e68b10d8861d`

Added `src/pages/ProfileSettingsPage.tsx`. The page reads the authenticated user and updates `user_metadata.full_name` through `supabase.auth.updateUser`. No hard-coded email is introduced; the email remains sourced from the authenticated account.

### 4. Profile route/navigation
Commits:
- `5fe6312dcda49e609e7d7895126966fe113a3397` — `/settings/profile` route and lazy import.
- `89cecdaccf8e75911c4db41ce8edd34b1e5712fc` — Sidebar navigation entry.

### 5. Regression coverage
Commit: `2253cd2fba29e79d1790b6764d0eec6384474d10`

Extended `scripts/check-auth-tenant-convergence.mjs` to require the profile route, authenticated metadata update, truthful health probe/states, and canonical dashboard queries without `COMPANY_ID` filtering.

## Reference update
Commit: `91482cad013bdd85667db0fc74520f55e688e64e`

Updated `docs/MASTER_EXECUTION_INDEX_LATEST_STATUS_2026-08-25.md` with tenant query convergence and truthful health status. A subsequent index update is required to include the profile-control commits from this continuation.

## Evidence status
No production/runtime certification is claimed from these commits alone. Current commit status has no reported checks, and prior CI failures were pre-step runner/bootstrap failures. Live tenant-isolation proof remains open.

## Remaining in this branch of work
1. Remove the remaining legacy `COMPANY_ID` consumer(s), starting with Data Quality in `EntityPages.tsx`.
2. Add runtime tests for the health-state semantics.
3. Prove authenticated tenant isolation end-to-end.
4. Continue database dependency mapping and critical UI flow tracing.
5. Return to J/K/L/M and E/F/H/I runtime evidence after independent gaps are closed.
