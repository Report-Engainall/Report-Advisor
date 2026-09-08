# Import — Complete Source Field Preservation

Date: 2026-09-08

## Finding

The canonical import UI accepted arbitrary source columns through the file engine, but the canonical commit boundary normalized each row into a small fixed payload. This meant source columns that had no canonical destination could be silently discarded from the business write path.

## Corrective implementation

- Added `import_commit_batch_with_lineage(...)` as a transactional database boundary.
- The function calls the existing canonical importer and, in the same transaction, stores the complete original row in `import_job_rows.source_data`.
- `mapped_data` remains available for the normalized representation.
- `lineage` records the complete existing provenance object.
- Tenant context is enforced through `current_company_id()` and the existing tenant RLS policy on `import_job_rows`.
- Anonymous RPC execution is explicitly revoked; authenticated execution is explicitly granted.
- `commitImportBatch()` binds canonical imports to the actual import job id, so every canonical batch uses the lineage-preserving RPC.
- Canonical optional fields no longer cause rich source rows to fail merely because a source file does not contain every optional business attribute.
- The canonical preview now renders **every detected source column**, rather than truncating the visible source schema to six columns.
- Added `check-import-source-field-preservation.mjs` to guard the job binding, complete source payload, provenance, lineage RPC, target-id binding, and non-truncated preview contract.

## Resulting product contract

For sales invoices, products, and customers, normalized canonical fields remain available to the application while **all source fields are retained for analysis, audit, lineage, future mapping, and custom-field use**. An unmapped source column is no longer equivalent to a discarded source column.

This does not yet mean every source field is promoted into a typed canonical database column. Promotion remains a mapping/schema decision; preservation is now independent of that decision.

## Verification status

Source inspection confirms the preservation path, complete-field preview, and repository guard are present in the branch. A local clone/build was not available in this execution environment because outbound DNS access to GitHub was unavailable, so no build or runtime PASS is claimed here.
