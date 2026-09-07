# Execution Checkpoint — 2026-09-07 Batch 20

## Exact execution boundary

- Branch: `fix/runtime-provenance-20260906`
- Source baseline audited: `6a1320533f66649dfb7be2fa942103f679cd4315`
- Historical frozen RCs and production aliases were not mutated.

## Work executed

### 1. Live import contract audit

Against Staging project `fnqbvfuwbdpwvhcgzksl`, re-read the live definitions of:

- `import_create_job(p_company_id, p_entity_type, p_total_rows)`
- `import_update_job_progress(...)`
- `import_finish_job(...)`
- `import_commit_batch(p_company_id, p_entity_type, p_rows, p_null_policy)`
- `import_upsert_customer(...)`
- `import_upsert_product(...)`
- `import_upsert_sales_invoice(...)`

Verified live controls include:

- tenant context is resolved through `current_company_id()`;
- supplied company IDs are rejected when they do not match the authenticated default company;
- import entity types are explicitly limited to `products`, `customers`, and `sales_invoices` in `import_commit_batch`;
- rows must be a JSON array;
- product/customer/invoice upserts enforce tenant ownership;
- sales invoices reject customer IDs belonging to another company;
- progress counters are non-negative, bounded, and monotonic;
- terminal import states cannot be overwritten;
- `completed` requires all rows to have been processed;
- anonymous execution is disabled for the import job/upsert/commit RPCs.

### 2. Full SECURITY DEFINER authenticated surface audit

Enumerated all public `SECURITY DEFINER` functions currently executable by `authenticated` in Staging.

Result: 16 functions are authenticated-callable. All inspected definitions reference tenant/company context (`current_company_id()` and/or company-scoped checks). No anonymous execution was present on this surface.

The worker/recovery functions remain service-role-only, including claim, heartbeat, checkpoint, complete, fail, retry, and recovery operations.

### 3. Data reality check

Current Staging relation estimates include:

- `customers`: 3
- `products`: 4
- `sales_invoices`: 3
- `report_execution_jobs`: 0

No synthetic business rows or worker jobs were inserted merely to manufacture evidence.

## Findings

- No new live import security defect was justified by this audit.
- The previously identified Auth leaked-password-protection control remains an external Supabase Auth control-plane blocker and was not bypassed through SQL.
- Authenticated import/business runtime and adversarial tenant testing remain required for certification; static/live contract evidence does not replace browser-level proof.
- Worker lifecycle remains uncertified because the live queue has no legitimate business job to execute end-to-end.
- Migration naming/provenance reconciliation remains open and is not silently promoted to PASS.

## Net result

This batch materially increased the evidence surface: import runtime contracts, tenant enforcement, progress state machine, invoice customer ownership, and the complete authenticated SECURITY DEFINER boundary were independently re-audited against the live Staging database.

## Next execution point

Continue on the highest-value release gates: authenticated business/import runtime and tenant A/B adversarial evidence where operational access permits; otherwise attack remaining source/live migration parity, OCR golden corpus, worker lifecycle admission, Windows watcher, backup/restore/rollback, and observability contracts without manufacturing evidence.
