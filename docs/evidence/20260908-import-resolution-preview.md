# Import Resolution Preview — 2026-09-08

## Scope

The canonical import UI now performs a read-only, tenant-scoped resolution preview before exposing the write action.

## Implementation

- `public.import_resolution_preview(text,jsonb)` was added to Staging.
- The function is `SECURITY INVOKER`, requires `current_company_id()`, accepts only the three canonical import entities, and caps preview payloads at 500 rows.
- `anon` execution is revoked; `authenticated` execution is granted.
- Candidate rows are selected from the current tenant using normalized import identity keys. Customers additionally use normalized name fallback.
- `CanonicalImportPage` calls the preview RPC and feeds the returned existing rows into the deterministic `resolveRows()` engine.
- `ImportResolutionReviewPanel` is now integrated into the canonical import preview.
- The commit button is disabled while resolution is running or whenever any row is not `new`.
- The existing server-side governed writer remains authoritative and independently rejects non-new resolutions and normalized duplicate identities.

## Exact changes

- `b711e2b85897fdf00e74cc2dc3a5b109a92bac3d` — Staging migration persisted in Git.
- `1770309a7cba8358672c0230c72ba5cb821757e4` — Canonical Import UI integration.
- `33870e825ca2617a129bec1c66da7220ff57faf3` — Resolution review component.

## Staging verification

Observed directly in Staging:

- `security_definer = false`;
- `anon_execute = false`;
- `authenticated_execute = true`;
- function definition is tenant-bound through `current_company_id()`.

## Boundary

This is a source/UI and database-contract closure. It is **not** a claim of authenticated browser E2E, Tenant A/B live adversarial certification, Production runtime certification, or browser visual PASS.
