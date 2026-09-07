# Execution Checkpoint — Worker Privilege/Search-Path Hardening — Batch 43 — 2026-09-07

## Execution boundary
- Parent repair PR: #396 (`fix/report-execution-provenance-20260907`).
- Base remains main `5b083100d463aae4a4cf22ebbbff7e1470749b1f`.
- No frozen RC, production alias, or Staging data was mutated in this batch.

## New verified source guard
1. Extended `scripts/report-execution-worker-provenance.test.mjs` to verify that all eight durable worker RPCs have no `authenticated` EXECUTE grant.
2. Added an exact count assertion requiring all eight worker `SECURITY DEFINER` RPCs to pin `search_path` to `pg_catalog`.
3. Preserved the existing assertions for tenant-bound signatures, legacy-signature retirement, lease-token fencing, replay-safe checkpoints, schema parity, import invoice contract, and import search-path hardening.
4. The guard remains repository-native and does not require fabricated runtime fixtures.

## Security rationale
- Worker RPCs are an internal `service_role` mutation surface, not an end-user RPC surface.
- Explicitly testing the absence of authenticated EXECUTE prevents a future migration from accidentally reopening the worker mutation boundary.
- Pinning the search path on every worker `SECURITY DEFINER` function closes a class of mutable-search-path regressions at the source level.

## Safety boundary
- No runtime certification claimed.
- No Staging fixture inserted.
- No historical migration rewritten.
- No frozen RC or production alias changed.
