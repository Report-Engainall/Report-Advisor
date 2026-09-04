# 2026-09-04 Parallel Owner-Level Execution Addendum

## Provenance boundary

- Repository: `Report-Engainall/Report-Advisor`
- Frozen failed boundary: `21b15503871f3fca8c9d811ee4c65eabfc81befc`
- Failed Run: `33832425645`
- Windows Job: `100898036005`
- Linux Job: `100898035866`
- FIRST FAILURE: Windows `Filesystem guard test-of-test` — `mutation was not detected: no-follow guard`.
- The failed boundary is historical and immutable for certification. No retry/rerun/repair was applied to `21b155...`.

## Track A — harness repair

### Repair 1
- Parent: `21b15503871f3fca8c9d811ee4c65eabfc81befc`
- Commit: `efd85c3e6d58f87c89c3d60b24e21712c4d4424d`
- File: `scripts/p1-filesystem-windows-test-of-test.mjs`
- RCA: `source.includes('fs.constants.O_NOFOLLOW')` collides with the mutation `fs.constants.O_NOFOLLOW_REMOVED`.
- Repair: token-boundary regex for `fs.constants.O_NOFOLLOW`.
- Production files unchanged by this commit; `desktop/main.cjs`, archive security, workflow, and fixtures were not edited.

### Repair 2 — same detector/root cause discovered by the sweep
- Parent: `efd85c3e6d58f87c89c3d60b24e21712c4d4424d`
- Commit: `798ef363e074e0263c156578c229a94adb88be13`
- File: `scripts/p1-filesystem-windows-test-of-test.mjs`
- RCA: `integrationGuard` used `.includes()` for `isUnsafeArchivePath` and `hasZipEntryTraversal`, so suffix mutations `...Removed` also survived.
- Repair: token-boundary regexes for both integration identifiers.
- This is a harness-only repair in the same detector and same identifier-boundary collision class.

## Test-of-test sweep findings

- `noFollow`: confirmed substring collision; repaired.
- `integrationGuard.archivePathGuard`: confirmed substring collision; repaired.
- `integrationGuard.archiveEntryGuard`: confirmed substring collision; repaired.
- `generationFence`: already uses identifier-boundary regex; no collision found in its current mutation.
- `handleOpen`: already uses identifier-boundary regexes for all three tokens; no collision found in its current mutation.
- Other runtime mutations and archive mutations use replacements that remove or invert the guarded token without the identified suffix collision.
- No sibling production defect was repaired as part of this sweep.

## Executable/document parity

The current test-of-test executable contains runtime mutations, three archive-path mutations, and two archive-integration mutations. A prior documentation claim referencing an archive size-limit mutation is not represented by the current executable mutation list and remains `NOT PROVEN` until reconciled against the exact documentation source and production guard.

## Provenance reconciliation

- GitHub `main` observed at this execution: `083225068f1e2d390f6e1d50e8b178a1e8e1bacb`.
- `docs/MASTER_EXECUTION_INDEX.md` at the audited candidate still records `b44a823b22653aded1408d36c6e5a109e4df4c3d` as current main.
- Classification: `STALE INDEX METADATA`.
- No historical SHA was deleted or overwritten.

## Electron readiness

- `desktop/package.json` at `efd85c3e6d58f87c89c3d60b24e21712c4d4424d` declares `electron: ^37.4.0` and `electron-builder: ^26.0.12`.
- Electron upgrade remains an independent P1 readiness item. No dependency mutation was made in this execution batch.
- Required next proof before upgrade: dependency tree/lockfile availability, native compatibility, preload/main IPC compatibility, packaging and installer regression, and fresh Windows/Linux evidence.

## Current evidence rule

- `21b155...` evidence remains bound to Run `33832425645` and Job `100898036005`/`100898035866`.
- `efd85c...` and `798ef3...` are new repair boundaries and cannot inherit PASS from `21b155...`.
- No certification claim is made by this addendum.
