# CYCLE-016 — Receivables export tenant-authority closure

Date: 2026-08-30

## Start head
`a705f9c5b8b161418337d932a27b3029071d39f2`

## Finding
Live `public.get_receivables_export_rows(uuid, integer)` accepted a caller-supplied `p_company_id` but did not assert it matched `current_company_id()`. The function still derived its actual rows from the authenticated tenant, so the observed issue was an authorization-contract inconsistency rather than confirmed cross-tenant data disclosure; it nevertheless violated the fail-closed caller boundary required for canonical exports.

## Fix
- Added `20260830202000_harden_receivables_export_tenant_authority.sql`.
- Added `p_company_id IS DISTINCT FROM v_company_id` guard with `TENANT_CONTEXT_MISMATCH`.
- Preserved `SECURITY INVOKER`, fixed `search_path`, anonymous revoke, and authenticated grant.
- Strengthened the export tenant contract regression to cover receivables specifically.
- Added focused CI verification.

## Live action
The repository fix is prepared on `cycle-016/receivables-export-tenant-guard`. Live mutation is intentionally deferred until the repository migration has fresh exact-head CI evidence; no unverified production mutation is claimed for this front.

## Status
IMPLEMENTED → focused verification pending → live mutation pending exact-head evidence.
