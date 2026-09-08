# Current-company context grant reconciliation — 2026-09-08

## Exact source
`d0ddda19a21a341bc77931d14c2358545c6fd328`

## Live Staging observation
Project: `fnqbvfuwbdpwvhcgzksl`

The live `public.current_company_id()` function is `SECURITY DEFINER`, `STABLE`, pinned to `pg_catalog`, and derives the default active company from `auth.uid()` through `company_memberships`.

Observed live privilege boundary:
- `anon`: EXECUTE denied
- `authenticated`: EXECUTE allowed
- `service_role`: EXECUTE allowed

## Reconciliation
The repository migration chain did not contain the live migration named `grant_current_company_id_authenticated_execute` (version `20260907234117`). A forward-only migration restores the explicit privilege boundary for fresh environments without rewriting historical migrations.

## Safety
No production alias mutation. No historical migration rewrite. No data mutation. This evidence is a source/reproducibility reconciliation, not a production certification claim.
