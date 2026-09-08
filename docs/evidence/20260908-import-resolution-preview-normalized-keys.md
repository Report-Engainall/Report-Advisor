# Import Resolution Preview — Normalized Source-Key Closure

## Implemented

`20260908252000_import_resolution_preview_normalized_keys.sql` replaces the tenant-scoped import preview implementation so candidate lookup normalizes incoming JSON object keys before matching canonical identity fields.

This closes a boundary mismatch where a source file could expose `SKU`, `Invoice Number`, `Code`, or `Name` while the resolver and database use canonical `sku`, `invoice_number`, `code`, and `name`.

## Security contract

- `SECURITY INVOKER` remains authoritative.
- `current_company_id()` is required.
- Only `products`, `customers`, and `sales_invoices` are accepted.
- Preview input is capped at 500 rows.
- Candidate queries are explicitly constrained by `company_id = current_company_id()`.
- `anon` has no execute permission; `authenticated` has execute permission.
- Customer matching remains code-first, with name fallback only when incoming code is absent.
- This function is candidate retrieval only; final write authorization remains in the canonical writer/server duplicate gate.

## Contract coverage

`scripts/import-resolution-preview-contract.mjs` checks the migration for tenant binding, source-key normalization, entity restrictions, row limits, identity fields, and grants.

## Verification boundary

The contract is static source verification only until the migration executes in the target Supabase project and an authenticated tenant session exercises the RPC. No authenticated E2E, Tenant A/B isolation PASS, or production certification is claimed here.

Frozen RC and production aliases were not modified.
