# Master Execution Index — Append 2026-08-30 — Phase 2 Security Closure

## Exact execution context
- Base HEAD: `3a0dc196a3d82144a61782ea1da55cedb33717c0`
- Branch: `phase-2-security-companies-closure`
- Purpose: Phase 2 tenant/security closure without rewriting historical index state.

## Finding
Live Supabase security inspection found `public.companies` had RLS enabled but **zero policies** and client roles retained broad table privileges. This left the tenant registry without an explicit row-authorization contract and exposed unnecessary client mutation privileges.

## Fix
Migration: `supabase/migrations/20260830170000_companies_tenant_boundary_hardening.sql`

- RLS remains enabled.
- `anon`: all table privileges revoked.
- `authenticated`: INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER revoked.
- `authenticated`: SELECT granted only through the RLS policy `companies_select_current_tenant`.
- Policy predicate: `id = public.current_company_id()`.
- No anonymous policy and no client mutation policy are created.

## Live verification
Applied to authoritative Supabase project `fnqbvfuwbdpwvhcgzksl` using the migration API.

Verified live:
- `anon_select = false`
- `auth_select = true`
- `auth_insert = false`
- `auth_update = false`
- `auth_delete = false`
- policy `companies_select_current_tenant` exists with `id = current_company_id()`.

## Test hardening
Added `scripts/check-phase2-security-closure.mjs`.

The test strips SQL comments before matching security markers and includes an adversarial comment-decoy check so commented-out GRANT/POLICY text cannot satisfy the gate.

Added `.github/workflows/phase-2-security-closure.yml` with exact-HEAD binding.

## Status
`IMPLEMENTED + LIVE VERIFIED / FRESH CI PENDING`

No production certification claim is made from this append. Fresh CI and PR verification must bind to the resulting exact HEAD before merge.
