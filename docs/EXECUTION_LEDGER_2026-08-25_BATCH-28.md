# Execution Ledger — 2026-08-25 — Batch 28

## Goal
Harden Metric Single Source of Truth checks so the project cannot regress into tenant-unsafe KPI calculation or fabricated certainty.

## Work completed
- Added `scripts/check-metric-ssot-contract.mjs`.
- Validates the canonical metric vocabulary currently defined by the Metric SSOT migration.
- Validates required metric governance metadata.
- Validates explicit `current_company_id()` tenant binding markers for canonical source queries.
- Validates anonymous execution is revoked for the canonical metric RPC.
- Validates the presence of `UNKNOWN` semantics.
- Rejects a conservative pattern that could collapse missing evidence into a confirmed metric state.

## Existing implementation reused
The existing Metric SSOT migration and tenant resolver were inspected first. No new metric engine, query engine, or tenant resolver was created.

## Verification status
The script itself is committed and ready for CI execution. This edit is not claimed as runtime PASS until GitHub Actions executes it.

Expected command:
`node scripts/check-metric-ssot-contract.mjs`

## Classification
Metric SSOT guard = GATED / LIVE REQUIRED for runtime proof.

## Next exact action
Run the new contract together with the existing metric tenant-binding contract in the consolidated Quality path, then perform real authenticated cross-tenant RPC tests in a live Supabase environment.
