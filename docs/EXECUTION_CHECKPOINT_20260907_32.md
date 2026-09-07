# Execution Checkpoint — 2026-09-07 Batch 32

## Objective

Advance the durable report-execution boundary without inventing a business caller. Trace the real report UI/runtime boundary, harden the durable entrypoint's adversarial contract, and preserve exact evidence boundaries.

## Exact state

- Branch: `fix/runtime-provenance-20260906`.
- Previous checkpoint: Batch 31 (`docs/EXECUTION_CHECKPOINT_20260907_31.md`).
- Batch 32 mutation commit: `e3438fc0600dc05889464275ff90678de5dcefe3`.
- Frozen RCs and production aliases were not mutated.

## Findings

1. `src/pages/ReportsPage.tsx` uses direct report query/export helpers and `downloadReportArtifact(...)` for sales, purchases, inventory, and receivables exports. It does not constitute a legitimate durable-worker caller.
2. `src/pages/ExecutiveReportPage.tsx` builds the executive view from canonical dashboard snapshot/intelligence and browser `window.print()`; it likewise is not a durable job creation boundary.
3. `src/lib/report-execution/execution-ledger.ts` still owns an in-memory `ReportExecutionCoordinator`/`InMemoryReportQueue`; this is a separate legacy/in-process execution abstraction and was not silently replaced because doing so without a real caller would create speculative architecture.
4. `src/server` currently exposes only the resilience runtime module in the inspected branch; no report-generation server action/handler was found there.
5. GitHub code-search for the durable runner/generation symbols returned no reliable result, so no caller was inferred from an incomplete search result.

## Implemented

Hardened `scripts/check-report-execution-durable-entrypoint-contract.mjs`.

The contract checker now has executable test-of-test coverage for two concrete regressions:

- deleting the canonical `assertReportExecutionReady(...)` invocation must be rejected;
- moving that gate invocation after the durable enqueue side effect must be rejected.

This upgrades Batch 31's previous ordering assertion from a passive source check to an adversarial checker of the checker itself.

## Verification boundary

- The updated contract checker was re-read from exact commit `e3438fc0600dc05889464275ff90678de5dcefe3` and contains both adversarial tests.
- This is repository/static verification only; it is not a runtime E2E PASS.
- No synthetic durable job was inserted.
- No production alias or frozen RC was changed.
- No claim of authenticated E2E, worker lifecycle PASS, or production certification is made.

## Current durable execution truth

The guarded path remains:

`business execution gate → durable enqueue RPC → tenant-scoped durable job → atomic claim + lease token → fenced lifecycle`

The remaining missing link is not the queue primitive itself; it is the legitimate application/business trigger that should invoke the guarded entrypoint with a real source snapshot/path/hash.

## Highest-value next move

Trace report-generation triggers outside the inspected page/server surfaces (routes, import/report orchestration, scheduled/worker adapters, and any backend function boundary). Wire only the first verified real business side-effect boundary to `enqueueDurableReportExecution(...)`; then run the smallest legitimate tenant-scoped lifecycle in Staging.

## Resource/safety note

No test fixtures, Storage uploads, synthetic queue rows, or unnecessary CI reruns were created in this batch.
