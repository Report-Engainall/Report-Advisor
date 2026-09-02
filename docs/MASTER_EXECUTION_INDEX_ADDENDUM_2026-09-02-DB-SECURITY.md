# DB Security Repair Addendum — 2026-09-02

## Boundary
- Source code/test base: `ec6eb4cce7803af8e94697adfa6d9308f69a9ee2`
- Repair branch: `fix/db-security-search-path-20260902`
- Repair commit: `8d8232606952a2a3adf36a97196400cf6ba18034`
- Environment mutated: Staging only — `Report-Advisor-P0-2-Staging` (`fnqbvfuwbdpwvhcgzksl`)
- Production binding: untouched.

## Finding
- Live public schema contained 21 `SECURITY DEFINER` functions using `search_path=public`.
- Two function bodies (`current_company_id`, `claim_report_execution_job`) also depended on unqualified application-table names.
- Seven trigger-only helper functions were directly executable by `PUBLIC`/`anon`/`authenticated`.

## Classification
- `PROVEN`: live function definitions, privileges, and search_path were inspected directly.
- `FIXED`: search_path hardened to `pg_catalog`; application relations in the two affected bodies are explicitly schema-qualified.
- `FIXED`: trigger-only helper EXECUTE grants revoked from `PUBLIC`, `anon`, and `authenticated`.

## Mutation
Migration added:
- `supabase/migrations/20260902100000_harden_public_security_definer_search_path.sql`

Applied to Staging as migration:
- `harden_public_security_definer_search_path`

No data rows were deleted or restored. No Production mutation was performed.

## Verification
- Public SECURITY DEFINER functions with non-`pg_catalog` search_path: `0`.
- Trigger-only helper EXECUTE leaks to `anon`/`authenticated`: `0`.
- `current_company_id()` authenticated identity/tenant resolution test: `PASS` for all Auth users present in Staging; transaction rolled back.
- `metric_governance` trigger runtime smoke test: `PASS`; transaction rolled back.
- Public constraints: `396`, all validated (`unvalidated=0`).
- Cross-tenant reference mismatch audit across sales items, purchase items, sales customers, purchase suppliers, inventory products, and payment→invoice references: all `0`.
- Initial orphan-audit harness attempt failed due test SQL syntax; corrected harness then used the validated-FK state as the integrity signal. No production data mutation occurred.

## Runtime/CERTIFICATION boundary
This repair is Staging database evidence only. It does not certify:
- Production Supabase target
- Production binding
- Authenticated browser E2E
- Live Tenant A/B runtime isolation
- Storage runtime isolation
- Realtime runtime isolation
- AI/retrieval runtime isolation
- Backup/Restore
- RPO/RTO
- Rollback/Forward Recovery
- DR

## Remaining blocker
Fresh exact-head CI for repair commit is not yet verified. Historical CI evidence is not transferred across this new SHA boundary.
