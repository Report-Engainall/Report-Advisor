# Governed Import Writer Closure — 2026-09-08

## Scope
Close the application-side canonical import writer boundary so canonical writes no longer call the legacy direct commit RPC.

## Implemented
- `src/lib/import/canonical-commit.ts` now calls `import_commit_batch_governed` for every non-empty canonical batch.
- The writer preserves the existing authenticated tenant resolution and `assertCanonicalBoundary` checks.
- Source rows retain raw source data, mapped data, target table, and provenance/lineage metadata.
- The governed payload includes one explicit resolution per canonical row and only permits `new → write_new` at this write boundary.
- The DB gate remains the final authorization boundary and rejects non-new or unauthorized resolution payloads before delegating to the existing lineage writer.
- Added `scripts/check-governed-import-writer-contract.mjs` to prevent regression to the legacy direct writer and to ensure the universal resolution vocabulary remains present.

## Exact evidence
- Writer integration commit: `18cf3cf1bce882c00307c7c7c3b3cdd2cd3a5408`
- Contract guard commit: `3bb62673abf6ec9862892d73554d2805ff46c737`
- Existing governed DB gate migration commit: `6e38fb34c65e2cdbbf0b703c312094e0705aa747`
- Existing universal intelligence implementation: `e534e545c493fb75d6c86e00ac50cc5cf8158bac`

## Boundary
This closes the application writer's RPC route, but it does **not** claim authenticated browser E2E, production certification, or live Tenant A/B isolation. The current writer constructs `new → write_new` decisions from its already-reconciled batch; a future interactive review path must supply explicit user decisions for candidate duplicates/conflicts rather than bypassing the gate.

## Verification contract
Run:

```bash
node scripts/check-governed-import-writer-contract.mjs
```

Expected output:

```text
GOVERNED_IMPORT_WRITER_CONTRACT: PASS
```

This is a static contract check, not an authenticated runtime certification.
