# Current-HEAD Tenant RLS Boundary — Wave 07

Date: 2026-09-02
Database: Supabase `fnqbvfuwbdpwvhcgzksl`
Source boundary: `3fa9e9c839b1ef3d7d71c06f93b7a29c76de43d4`

## Live database checks

- Public base tables: **78**.
- Public base tables with RLS enabled: **78/78 (100%)**.
- Public RLS policies: **147**.
- Policies explicitly scoped through `company_id`: **145**.
- The two non-`company_id` policies were inspected individually and are intentional boundary cases:
  - `company_memberships_select_self`: restricts reads to `user_id = auth.uid()`.
  - `authenticated_read_synonym_dictionary`: global authenticated read (`USING true`) for the shared synonym dictionary.

## Tenant predicate coverage

The tenant-scoped policy corpus uses `current_company_id()` for direct company-owned records and relationship-based `EXISTS` checks for child tables such as import rows, purchase items, and sale items. UPDATE policies inspected in the live corpus carry both tenant `USING` and tenant `WITH CHECK` predicates where mutation is permitted.

## Closure result

The database-wide RLS inventory has no public base table outside RLS. The apparent 2-policy gap from a naive `company_id` string scan is explained by explicit self-identity and intentionally global reference-data access, not an unscoped tenant-data policy.

This is database security evidence only. It does not certify live adversarial Tenant A/B browser isolation until two authenticated runtime identities are exercised against the deployed exact release.
