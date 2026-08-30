# Master Execution Index — Append 2026-08-30 — Phase 2 Security Closure

## Exact execution context
- Base HEAD: `3a0dc196a3d82144a61782ea1da55cedb33717c0`
- Branch: `phase-2-security-companies-closure`
- Purpose: Phase 2 tenant/security closure without rewriting historical index state.

## Finding
Live Supabase security inspection found `public.companies` had RLS enabled but **zero policies** and client roles retained broad table privileges. This left the tenant registry without an explicit row-authorization contract and exposed unnecessary client mutation privileges.

## First implementation attack and correction
The first policy draft used `public.current_company_id()` directly inside the RLS predicate. An authenticated-role runtime test correctly rejected that design because `current_company_id()` itself was not executable by `authenticated`.

This was treated as a real test-discovered defect, not suppressed.

The policy was corrected to use the already-protected membership boundary directly:

`EXISTS (SELECT 1 FROM public.company_memberships membership WHERE membership.company_id = companies.id AND membership.user_id = auth.uid())`

## Second discovery: canonical tenant helper was itself under-granted
A live catalog scan found multiple authenticated functions call `public.current_company_id()`, while the helper had `EXECUTE=false` for `authenticated`. This would break the Phase-1 browser tenant resolver and authenticated reporting/import functions at runtime.

Implemented migration:
`supabase/migrations/20260830172000_current_company_id_execute_contract.sql`

- `anon EXECUTE = false`
- `authenticated EXECUTE = true`

This restores the intended canonical tenant authority without exposing it anonymously.

## Final companies fix
Migration: `supabase/migrations/20260830170000_companies_tenant_boundary_hardening.sql`

- RLS remains enabled.
- `anon`: all table privileges revoked.
- `authenticated`: INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER revoked.
- `authenticated`: SELECT granted only through the membership-backed RLS policy `companies_select_current_tenant`.
- No anonymous policy and no client mutation policy are created.
- The RLS policy does not depend on EXECUTE privilege for `current_company_id()`.

## Live verification
Applied to authoritative Supabase project `fnqbvfuwbdpwvhcgzksl`.

Verified:
- `anon_select = false`
- `auth_select = true`
- `auth_insert = false`
- `auth_update = false`
- `auth_delete = false`
- `current_company_id(): anon_exec=false, auth_exec=true`
- authenticated user sees exactly one company, its membership company.

## Adversarial cross-tenant attacks
1. Inside a transaction, a synthetic foreign company row was inserted, the session switched to `authenticated`, and the JWT subject was bound to an existing test membership.
   - `foreign_rows_visible = 0`
   - `visible_total = 1`
   - transaction rolled back.

2. An authenticated call to `cash_liquidity_snapshot()` with a foreign company id was attempted.
   - Result: `TENANT_CONTEXT_MISMATCH`
   - No cross-tenant data returned.
   - transaction rolled back.

3. After the tenant helper grant, an authenticated call to `current_company_id()` resolved the expected membership company, and `cash_liquidity_snapshot()` executed successfully for the authorized tenant.

## SECURITY DEFINER surface
A live catalog scan found all `SECURITY DEFINER` functions have fixed `search_path=public`, no anonymous EXECUTE, and every authenticated-executable privileged function is bound to `current_company_id()` or `auth.uid()`.

## All public-table baseline
Live catalog query returned no public table with RLS disabled or with zero policies.

## Test hardening
Added:
- `scripts/check-phase2-security-closure.mjs`
- `scripts/check-phase2-security-definer-surface.mjs`
- `.github/workflows/phase-2-security-closure.yml`

The tests strip SQL comments and include adversarial decoy checks so commented-out grants/policies cannot satisfy the gate.

## Status
`PHASE-2 SECURITY IMPLEMENTATION + LIVE RUNTIME/ADVERSARIAL VERIFICATION COMPLETE / FRESH CI PENDING`

Phase 1 tenant-authority runtime defect discovered during this cycle is fixed in the same controlled branch. Production certification is not claimed until fresh CI is green on the final SHA.

Vercel rate-limit remains parked and is not treated as a product/security proof.
