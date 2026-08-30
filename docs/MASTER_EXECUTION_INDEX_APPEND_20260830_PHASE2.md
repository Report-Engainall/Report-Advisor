# Master Execution Index — Append 2026-08-30 — Phase 2 Security Closure

## Exact execution context
- Base HEAD: `3a0dc196a3d82144a61782ea1da55cedb33717c0`
- Branch: `phase-2-security-companies-closure`
- Purpose: Phase 2 tenant/security closure without rewriting historical index state.

## Finding
Live Supabase security inspection found `public.companies` had RLS enabled but **zero policies** and client roles retained broad table privileges. This left the tenant registry without an explicit row-authorization contract and exposed unnecessary client mutation privileges.

## First implementation attack and correction
The first policy draft used `public.current_company_id()` directly inside the RLS predicate. An authenticated-role runtime test correctly rejected that design because `current_company_id()` itself is not executable by `authenticated`.

This was treated as a real test-discovered defect, not suppressed.

The policy was corrected to use the already-protected membership boundary directly:

`EXISTS (SELECT 1 FROM public.company_memberships membership WHERE membership.company_id = companies.id AND membership.user_id = auth.uid())`

This avoids expanding EXECUTE privileges on the privileged helper while preserving tenant authority.

## Final fix
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
- authenticated user sees exactly one company, its membership company.

## Adversarial cross-tenant attack
Inside a transaction, a synthetic foreign company row was inserted, the session switched to `authenticated`, and the JWT subject was bound to an existing test membership.

Result:
- `foreign_rows_visible = 0`
- `visible_total = 1`

The transaction was rolled back; no fixture data was retained.

## SECURITY DEFINER surface
A live catalog scan found all `SECURITY DEFINER` functions have fixed `search_path=public`, no anonymous EXECUTE, and every authenticated-executable privileged function is bound to `current_company_id()` or `auth.uid()`.

## Test hardening
Added:
- `scripts/check-phase2-security-closure.mjs`
- `scripts/check-phase2-security-definer-surface.mjs`
- `.github/workflows/phase-2-security-closure.yml`

The tests strip SQL comments and include adversarial decoy checks so commented-out grants/policies cannot satisfy the gate.

## Status
`IMPLEMENTED + LIVE VERIFIED + ADVERSARIAL VERIFIED / FRESH CI PENDING`

Vercel reports a rate-limit failure independently of this branch; it is parked and is not treated as product/security proof. CodeRabbit is green. Fresh Phase 2 CI must bind to the final PR SHA before merge.
