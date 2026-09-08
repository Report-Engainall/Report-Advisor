# Invoice Identity Uniqueness — 2026-09-08

## Closure

The governed import boundary treats `sales_invoices.invoice_number` as the deterministic identity key. The Staging database previously had no tenant-scoped unique index for that identity.

## Actions

- Audited existing Staging invoice identities before enforcement.
- Duplicate groups found: `0`.
- Duplicate rows found: `0`.
- Applied tenant-scoped unique index:
  `uq_sales_invoices_company_normalized_invoice_number`
- Verified the index exists with the expected normalized-key definition.
- Added the same migration to the repository so database state and source-of-truth migrations remain aligned.

## Security boundary

The uniqueness is scoped by `company_id`, so one tenant cannot collide with another tenant's invoice number. The governed RPC still performs its authenticated tenant and server-side duplicate checks before delegating to the lineage-aware writer.

## Non-claims

This closes the database identity constraint; it does not certify authenticated browser E2E, Tenant A/B adversarial isolation, Production runtime, backup/restore, or rollback.
