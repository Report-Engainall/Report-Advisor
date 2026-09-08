# Governed Import Write Closure — 2026-09-08

## Scope
Closed the UI → canonical writer → tenant-scoped RPC → database gate boundary for the canonical import path.

## Source boundary
- `CanonicalImportPage` does not directly insert into `products`, `customers`, or `sales_invoices`.
- It routes writes through `commitImportBatch`.
- `commitImportBatch` resolves the authenticated tenant, re-fetches tenant-scoped existing rows, re-runs `resolveRows`, blocks every non-`new` resolution, and invokes `import_commit_batch_governed`.
- The review panel exposes `new`, `skip_exact`, `candidate_duplicate`, and `conflict`; it explicitly states that duplicate/conflict rows are not silently deleted or updated.

## Staging database verification
Supabase Staging project `fnqbvfuwbdpwvhcgzksl` was queried directly.

Observed for `public.import_resolution_preview(text,jsonb)`:
- `SECURITY INVOKER` (`prosecdef=false`)
- `anon` execute = false
- `authenticated` execute = true

Observed for `public.import_commit_batch_with_lineage(uuid,text,jsonb,jsonb,text)`:
- `SECURITY INVOKER` (`prosecdef=false`)
- `anon` execute = false
- `authenticated` execute = true

Observed for `public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text)`:
- `SECURITY INVOKER` (`prosecdef=false`)
- `anon` execute = false
- `authenticated` execute = true
- verifies `current_company_id()` equals supplied tenant
- rejects non-`new` resolutions
- requires `write_new=true` for every committed row
- rejects duplicate identities already present in the tenant
- rejects duplicate identities within the incoming batch
- delegates actual persistence to `import_commit_batch_with_lineage`

## Verification boundary
This is a source-contract and live-Staging database verification closure. It is **not** an authenticated browser E2E PASS and does not certify Production runtime behavior.

The new static contract script is:
`scripts/import-governed-write-contract.mjs`

The frozen RC and Production aliases were not modified.
