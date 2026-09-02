# Current-HEAD Security Boundary — Wave 06

Date: 2026-09-02
Source code boundary: `3fa9e9c839b1ef3d7d71c06f93b7a29c76de43d4`
Supabase project: `fnqbvfuwbdpwvhcgzksl`

## Executed checks

1. Public tables: every `public` table currently has PostgreSQL RLS enabled.
2. `anon` EXECUTE: zero `public` SECURITY DEFINER functions are executable by `anon`.
3. `PUBLIC` EXECUTE: zero `public` SECURITY DEFINER functions are executable by `PUBLIC`.
4. Public SECURITY DEFINER functions: all 30 currently have an explicit `search_path` configuration.
5. Public SECURITY DEFINER ownership: zero are owned by a non-`postgres` role.
6. Public views: no current public view was found lacking `security_invoker`.
7. Authenticated business RPCs with tenant authorization were inspected: `link_recommendation_to_decision`, `mark_alert_read`, and `get_receivables_report_page` derive tenant context through `public.current_company_id()`.
8. `current_company_id()` itself is SECURITY DEFINER, executable by `authenticated` but not `anon`, and resolves company membership using `auth.uid()`, active membership, and default-membership state.
9. Repository search found no source occurrence of `SUPABASE_SERVICE_ROLE_KEY`, `service_role`, or deprecated `auth.role()`.

## Boundary interpretation

The three inspected RPCs do not contain a literal `auth.uid()` call because tenant identity is centralized in `current_company_id()`. This is not treated as an authorization defect: the transitive authorization path was inspected directly.

No blanket `REVOKE EXECUTE FROM authenticated` was applied because these RPCs are authenticated business endpoints and removing their execution grant would break legitimate application paths without improving tenant authorization.

## Certification status

This wave establishes current database security-boundary evidence. It does **not** certify production deployment, authenticated browser E2E, adversarial Tenant A/B runtime isolation, backup/restore, RPO/RTO/DR, or rollback. Those remain operationally unproven until exact-HEAD runtime evidence exists.
