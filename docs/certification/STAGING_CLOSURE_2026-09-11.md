# STAGING CLOSURE — 2026-09-11

## Exact execution head
- Branch: `desktop/remediation-electron44-electron`
- Previous owner-supplied verified head: `181803088163fe78f57587448912dbe6f38d5226`
- Validation-alignment commit: `eea5c8dd3c84731eb6fb65e0dbb4a28b339fc117`
- Folder-import atomicity commit: `799fbd9e0062c4363e227497fd716c0daee806a7`
- Production certification: **NO**

## P0 — Validation alignment
`CanonicalImportPage.tsx` now validates exactly the fields required by `canonical-commit.ts` for all three supported canonical entities:
- `products`: sku, name, unit, cost_price, selling_price, min_stock, reorder_point, is_active
- `customers`: name, segment, credit_limit, payment_terms_days
- `sales_invoices`: invoice_number, invoice_date, subtotal, tax_amount, total, paid_amount, status

The direct UI path remains:
`CanonicalImportPage → commitImportBatch → import_commit_batch → PostgreSQL transaction → canonical target`

## P0 — Database atomic boundary evidence
Staging project: `fnqbvfuwbdpwvhcgzksl`

`public.import_commit_batch(uuid,text,jsonb,text)` was inspected directly. It:
- resolves server tenant authority through `public.current_company_id()`;
- rejects missing tenant context;
- rejects caller/tenant mismatch;
- validates entity type and JSON-array input;
- iterates the payload inside one PostgreSQL function invocation;
- raises on missing target IDs;
- returns committed count and IDs.

No separate transaction/commit is issued between rows by the function. The function invocation is therefore the DB transaction boundary for the complete payload.

## P0 — Staging data state before first field import
Current counts observed:
- `public.imports`: 0
- `public.products`: 6
- `public.customers`: 3
- `public.sales_invoices`: 3

RLS is enabled on all four inspected tables.

The existing business rows are not treated as evidence of a real import because `public.imports` is empty.

## P1 — Folder/watched-file path hardening
`src/lib/import/batch-folder.ts` was audited and found to use 500-row commit chunks. That violated the required file-level atomic boundary.

The path was minimally corrected to:
- resolve tenant once;
- perform duplicate detection with tenant context;
- use the same canonical required-field contract as the direct UI path;
- create one import record;
- send the complete valid file payload through one `commitImportBatch()` call;
- finalize import status only after the atomic commit succeeds;
- mark the import failed on commit error where an import record exists.

This closes the code-level atomicity mismatch for folder processing. It does **not** prove durable crash/resume runtime behavior.

## Runtime gate status
### BLOCKED / PENDING — first real field file
No real business file has been supplied to this execution turn, and the Staging `imports` table is still empty. Therefore:
- Real File → Security Scan: NOT EXECUTED
- Real File → Parse: NOT EXECUTED
- Real File → Validation: NOT EXECUTED
- Real File → Atomic Commit: NOT EXECUTED
- Real File → Dashboard/Evidence reconciliation: NOT EXECUTED

No PASS is declared for field import.

## Next required evidence
1. Supply one real business file for the first Staging import.
2. Execute it through `CanonicalImportPage`.
3. Capture import record ID, status, timestamps, total/valid/invalid rows and canonical DB counts.
4. Reconcile Dashboard/KPI/Evidence against the imported canonical rows.
5. Execute tenant A/B adversarial isolation before promoting P0.
6. Then attack durable crash/resume and rollback with controlled runtime interruption.
