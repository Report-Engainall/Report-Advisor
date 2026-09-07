# Execution Checkpoint — Import Runtime Parity — Batch 42 — 2026-09-07

## Scope
This checkpoint records the Import source/runtime contract audit and the subsequent forward repairs. It does not certify authenticated E2E behavior.

## Verified findings
1. Staging exposes the import job lifecycle RPCs `import_create_job`, `import_update_job_progress`, and `import_finish_job`.
2. Staging exposes the batch wrapper `import_commit_batch(uuid,text,jsonb,text)`.
3. Staging exposes tenant-bound `import_upsert_product` with the current 10-argument contract.
4. Staging exposes tenant-bound `import_upsert_customer` with the current 9-argument contract.
5. Staging now exposes tenant-bound `import_upsert_sales_invoice` with the canonical 11-argument contract including `p_customer_name`.
6. The canonical main migration `supabase/migrations/20260825161500_import_entity_rpc_truth.sql` defines the same 11-argument invoice contract and fail-closed insert requirements.
7. `import_commit_batch` originally called `import_upsert_sales_invoice` using the obsolete 10-argument order, omitting `customer_name`; this was a real runtime contract defect.
8. The first forward repair updated `import_commit_batch` to pass `v_row->>'customer_name'` and the canonical invoice argument order.
9. A second live-contract check exposed a deeper parity defect: Staging's invoice RPC still had only the legacy 10-argument signature, so the repaired wrapper would have failed at runtime.
10. Staging was repaired forward-only to the canonical 11-argument invoice RPC, including tenant-bound customer resolution and fail-closed financial/status requirements.
11. The repaired invoice RPC is `SECURITY INVOKER`, denies `anon` EXECUTE, and grants EXECUTE to `authenticated`.
12. Supabase Security Advisor then exposed one independent hardening issue on that RPC: mutable function `search_path`.
13. The invoice RPC search path was pinned to `public, pg_catalog`; Advisor no longer reports the `function_search_path_mutable` warning for that function.
14. All inspected import RPCs now have `anon` EXECUTE disabled; the invoice RPC has an explicit pinned search path.
15. No import data fixture was fabricated and no authenticated runtime certification was claimed.

## Source/replay repair
- Added `supabase/migrations/20260907194500_reconcile_import_commit_batch_invoice_contract.sql` to the worker provenance PR.
- Added `supabase/migrations/20260907165000_harden_import_sales_invoice_search_path.sql` to preserve the live security hardening in replayable source.
- Extended `scripts/report-execution-worker-provenance.test.mjs` to assert the invoice search-path hardening and grants.

## Staging evidence
- The three forward repairs were applied successfully to Staging.
- Staging migration ledger records the invoice wrapper repair, canonical invoice contract repair, and search-path hardening as later-versioned migrations.
- Current invoice signature and privileges were re-read after each repair.

## Safety boundary
- No historical migration was rewritten.
- No frozen RC or Production alias was changed.
- No synthetic customer, invoice, product, import job, or worker job was inserted.
- Runtime E2E remains un-certified until authenticated execution produces actual persistence/readback and Tenant A/B isolation evidence.
