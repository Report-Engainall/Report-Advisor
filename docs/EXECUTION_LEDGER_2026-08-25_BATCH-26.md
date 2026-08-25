# Execution Ledger — 2026-08-25 — Batch 26

## Goal
Harden the Phase 8/9 Metric Single Source of Truth boundary so the canonical metric snapshot cannot be used with an arbitrary client-supplied tenant identifier.

## Status before
- Metric SSOT: GATED / implementation present, live Supabase proof pending.
- Canonical tenant resolver: present in `public.current_company_id()`.
- Phase 8/9 PR #17: open and mergeable; not production certified.

## Changes
- Hardened `supabase/migrations/20260825010000_metric_single_source_of_truth.sql`.
- Canonical metric source CTEs now explicitly bind source rows to both `public.current_company_id()` and the requested `p_company_id`.
- Removed anonymous EXECUTE permission from `get_canonical_metric_snapshot(uuid,date,date)`.
- Kept EXECUTE permission for authenticated users.
- Added explicit tenant-bound marker and function comment.
- Added `scripts/check-metric-tenant-binding.mjs`.
- Registered `npm run test:metric-tenant-binding` in `package.json`.

## Why
The tenant resolver already derives the canonical company from the authenticated identity. Metric truth must not merely rely on downstream RLS side effects; the metric RPC itself should visibly and deterministically bind its requested tenant to the authenticated tenant context.

## Verification status
- Static implementation reviewed against `current_company_id()` resolver.
- Regression guard registered in the executable package script.
- CI/runtime execution has **not** been run in this chat execution pass; therefore this batch is **GATED**, not COMPLETE.
- Live Supabase adversarial tenant evidence is still required.

## Remaining
1. Run the canonical quality workflow with the new metric tenant-binding guard.
2. Execute the metric RPC against two authenticated tenants and prove A cannot request B's snapshot.
3. Confirm anonymous execution is rejected.
4. Confirm Dashboard/Report/ChatBI consumers use canonical metric snapshots rather than competing client-side financial truth.

## Next exact action
Continue Phase 8/9 integration by tracing every authoritative KPI consumer to the canonical metric snapshot and identifying/removing only competing truth paths, while preserving presentation-only client calculations.
