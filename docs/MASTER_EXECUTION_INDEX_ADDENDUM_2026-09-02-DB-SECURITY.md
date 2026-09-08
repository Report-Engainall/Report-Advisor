# DB Security Repair Addendum — 2026-09-02

## Boundary
- Source code/test base: `ec6eb4cce7803af8e94697adfa6d9308f69a9ee2`
- Repair branch: `fix/db-security-search-path-20260902`
- Repair commits: `8d8232606952a2a3adf36a97196400cf6ba18034` → `1771e840e2a089d56505c2145f618e9597990608` → `eda175bc8f31f5c1e75a6ea258c734c926fde1c9`
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
- `PROVEN`: migration provenance corrected after the Supabase migration application assigned live version `20260902091759`.

## Mutation
Canonical source migration:
- `supabase/migrations/20260902091759_harden_public_security_definer_search_path.sql`

Applied to Staging as migration:
- `version=20260902091759`
- `name=harden_public_security_definer_search_path`

The initially created source filename `20260902100000_...` was removed because it did not match the actual applied migration version. No second database migration was applied.

No data rows were deleted or restored. No Production mutation was performed.

## Verification
- Public SECURITY DEFINER functions with non-`pg_catalog` search_path: `0`.
- Trigger-only helper EXECUTE leaks to `anon`/`authenticated`: `0`.
- `current_company_id()` authenticated identity/tenant resolution test: `PASS` for all Auth users present in Staging; transaction rolled back.
- `metric_governance` trigger runtime smoke test: `PASS`; transaction rolled back.
- Public constraints: `396`, all validated (`unvalidated=0`).
- Cross-tenant reference mismatch audit across sales items, purchase items, sales customers, purchase suppliers, inventory products, and payment→invoice references: all `0`.
- Initial orphan-audit harness attempt failed due test SQL syntax; no database mutation occurred from that attempt. The subsequent constraint validation audit showed all 396 public constraints validated.

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
Fresh exact-head CI for the repair branch is not yet verified. Historical CI evidence is not transferred across this new SHA boundary.
