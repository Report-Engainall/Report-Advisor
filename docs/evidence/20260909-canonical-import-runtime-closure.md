# Canonical Import Runtime Closure — 2026-09-09

## Scope

Closed two concrete runtime gaps in `CanonicalImportPage`:

1. Row validation now uses the canonical mapped-field contract instead of assuming source headers equal database field names.
2. Once an import job is created, the UI now finalizes the job through `import_finish_job` on both success and failure paths, preventing a UI exception from leaving the job in `processing`.

## Implementation

- `src/pages/CanonicalImportPage.tsx`
  - uses `validateMappedRow(entityType, data, dataset.columns)`
  - identity requirements are aligned with canonical validation:
    - sales invoices: `invoice_number`
    - products: `sku` + `name`
    - customers: `code` or `name`
  - captures `importId` immediately after job creation
  - calls `import_finish_job(... completed ...)` after all batches succeed
  - calls `import_finish_job(... failed ...)` from the catch path when a job exists
  - failure finalization errors are logged without masking the original import failure
- `scripts/canonical-import-runtime-contract.mjs`
  - static contract coverage for mapped validation and terminal lifecycle calls

## Database boundary

The existing `public.import_finish_job(uuid,text,jsonb,text)` remains the authoritative terminalization boundary. It is SECURITY INVOKER, tenant-bound through `current_company_id()`, restricted to terminal statuses, and executable by `authenticated` only. The lifecycle trigger also prevents direct UPDATE-based resurrection/mutation outside the governed lifecycle.

## Verification

Repository source inspection confirms the expected implementation tokens and lifecycle contract are present.

The new contract script is committed but was **not executed by a local runtime in this turn**; therefore this document does not claim a runtime PASS.

No frozen RC or Production alias was modified.
