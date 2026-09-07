# Execution Checkpoint — Import Runtime Parity — Batch 42 — 2026-09-07

## Scope
This checkpoint records a read-only comparison between the current Staging import RPC contract and the replayable `main` migration chain. It does not mutate Staging and does not certify runtime behavior.

## Verified findings
1. Staging exposes `import_create_job(p_company_id uuid, p_entity_type text, p_total_rows integer)`.
2. Staging exposes `import_update_job_progress(p_job_id uuid, p_processed_rows integer, p_valid_rows integer, p_invalid_rows integer, p_duplicate_rows integer, p_status text)`.
3. Staging exposes `import_finish_job(p_job_id uuid, p_status text, p_result_summary jsonb, p_error_message text)`.
4. Staging exposes `import_upsert_product` with the current 10-argument contract.
5. Staging exposes `import_upsert_customer` with the current 9-argument contract.
6. Staging exposes `import_upsert_sales_invoice` with the current 10-argument contract.
7. All six import RPCs are `SECURITY INVOKER` rather than `SECURITY DEFINER`.
8. All six grant EXECUTE to `authenticated`.
9. None grant EXECUTE to `anon`.
10. `import_create_job` binds `p_company_id` to `current_company_id()`.
11. `import_update_job_progress` derives tenant context from `current_company_id()` and locks the tenant-owned job row.
12. `import_finish_job` derives tenant context from `current_company_id()` and locks the job before terminal transition.
13. Product import is fail-closed for required insert fields and rejects fabricated business defaults.
14. Customer import in the live Staging definition still uses `coalesce(p_segment,'regular')`, `coalesce(p_credit_limit,0)`, and `coalesce(p_payment_terms_days,30)` for inserts.
15. Sales-invoice import in the live Staging definition still uses `coalesce(p_status,'confirmed')` and zero defaults for monetary insert fields.
16. The replayable `main` source already contains `supabase/migrations/20260825161500_import_entity_rpc_truth.sql` with fail-closed customer/invoice insert contracts.
17. That canonical source migration requires customer segment, credit limit, and payment terms on insert.
18. It requires invoice subtotal, tax, total, paid amount, and status on insert.
19. It adds invoice customer-name resolution and a tenant check for the resolved customer.
20. The current Staging migration ledger does not contain the original `20260825161500` version; the baseline was replayed under a later migration timestamp, so provenance cannot be inferred from the original timestamp alone.
21. Later Staging migrations include `reconcile_missing_import_customer_invoice_rpcs`, confirming that the import entity RPC surface was independently reconciled in the Staging lineage.
22. The live function definitions were therefore treated as authoritative for runtime truth, and the source migration as authoritative for replay truth; they currently do not match on customer/invoice fail-closed semantics.

## Decision
This is a real **source/runtime parity finding**, not a reason to mutate Staging manually. The existing canonical source migration must be traced against the later Staging reconciliation migration before any new forward migration is authored. No duplicate repair was created in this batch.

## Safety boundary
- Staging was read-only.
- No import job, customer, invoice, or product fixture was inserted.
- No migration was applied to Staging.
- No historical migration was rewritten.
- No production alias or frozen RC was changed.
- The Worker provenance PR remains isolated from this Import parity finding.
