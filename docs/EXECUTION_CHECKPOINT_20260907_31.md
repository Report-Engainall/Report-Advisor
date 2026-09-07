# Execution Checkpoint — 2026-09-07 Batch 31

## Objective

Advance directly from Batch 30 by converting the newly-created durable enqueue primitive into a single guarded application integration boundary, while preserving fail-closed behavior and avoiding speculative wiring into an unknown business caller.

## Exact state

- Branch: `fix/runtime-provenance-20260906`.
- Batch 30 checkpoint HEAD: `4d08ddd876253017de7698c60d0a78554bce74da`.
- Batch 31 commits before this checkpoint:
  - `22533a655ffd9c4f0bbf79e99669335a28900f80` — initial durable execution entrypoint.
  - `168838ee8badfa82f4dfe01fadadea8b5c8cc08b` — removed unused source fingerprint.
  - `2f501d5fc322612e27f23af686e3d122a910e361` — made the execution gate single-pass.
  - `3343995871668533e08c14febf8b32ef3d335cd5` — durable entrypoint contract test.
- Frozen RCs and production aliases were not mutated.

## Implemented

Added `src/lib/report-execution/durable-execution-entrypoint.ts`.

This is intentionally a narrow integration boundary, not a speculative UI/server wiring:

1. Requires the canonical report execution request and governed route plan.
2. Runs `assertReportExecutionReady(...)` before any durable queue side effect.
3. Verifies requested source snapshot identity matches the execution snapshot.
4. Requires non-empty source path and source hash.
5. Derives a tenant + idempotency + source-snapshot scoped durable job key.
6. Delegates only to `SupabaseReportExecutionStore.enqueue(...)`.

Added `scripts/check-report-execution-durable-entrypoint-contract.mjs` to enforce the ordering and required identity/source fields.

## Important architectural result

The durable path now has a clean sequence:

`business execution gate → guarded durable enqueue → tenant-scoped durable job → claim → lease fencing → checkpoint progression → complete/fail/retry`

The business caller is still deliberately not invented. The entrypoint gives the eventual real caller one canonical place to enter the durable queue.

## Verification boundary

Repository-level inspection confirms the entrypoint is fail-closed and delegates to the service-role-only durable enqueue RPC introduced in Batch 30. The actual runtime caller and full live lifecycle remain open because no legitimate report-generation trigger has yet been identified.

No synthetic job was inserted and no fabricated worker PASS was claimed.

## Remaining highest-value blockers

1. Identify and wire the actual report-generation business caller to this guarded entrypoint.
2. Execute a smallest legitimate tenant-scoped durable lifecycle in Staging.
3. Verify exact-head Vercel deployment and authenticated Chromium E2E when the connected Vercel authorization boundary permits it.
4. Obtain observable CI execution rather than empty-step/non-diagnostic failures.
5. Continue production, backup/restore, rollback, OCR golden corpus, watched-folder, and final release certification work in parallel where independent.

## Method improvement

Do not force the durable queue into a UI route merely because an entrypoint now exists. First trace the actual report-generation side effect boundary; then make that caller invoke this gate. This avoids creating a second, divergent execution path.
