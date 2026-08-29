# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-29
Repository: `Report-Engainall/Report-Advisor`
Branch: `feat/windows-desktop-watched-folder`
Current branch HEAD at this update: `690a6f916077b6c227ce66005833d3022a5e7f2c`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Baseline
- Protected certification candidate: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- This branch is a justified gap-closure branch from that baseline.
- Certification remains blocked until exact-head CI, deployment, runtime and live evidence are proven.

## Current execution cycle — 2026-08-29
### Exact-head CI forensic result
The preceding PR merge-ref CI for the watched-folder work passed the broad architectural/security/intelligence gates but failed at the compile/build layer because `FolderBatchImportPanel.tsx` imported `@/lib/import/folder-handle-store` while that module was absent from the branch.

Disposition: `ROOT CAUSE IDENTIFIED → FIXED IN CODE → EXACT-HEAD CI PENDING`.

Evidence:
- `quality` run `33274307097`.
- Typecheck: `TS2307 Cannot find module '@/lib/import/folder-handle-store'`.
- Build: same missing-module failure.
- Performance budget: downstream `dist/index.html` absence after build failure, not an independent performance defect.
- Lint: 0 errors, 57 warnings; warnings are non-blocking and remain a cleanup track.
- Core architectural/security/intelligence gates continued to pass, including tenant convergence, migration schema audit, global tenant RLS, import tenant context/business key, watched-folder foundation, schema intelligence, document intelligence hardening `20/20`, report truth, production readiness, and production-scale fixtures.

### Canonical fix — persistent browser folder-handle module
Commit: `690a6f916077b6c227ce66005833d3022a5e7f2c`.

Implemented:
- added `src/lib/import/folder-handle-store.ts` using IndexedDB.
- `saveFolderHandle()` persists a `FileSystemDirectoryHandle` plus timestamp.
- `loadFolderHandle()` restores the persisted handle for the existing browser watcher resume path.
- `forgetFolderHandle()` provides explicit cleanup support.
- storage is isolated in its own database/store and does not become tenant/database truth.
- IndexedDB absence and operation failures fail explicitly rather than silently succeeding.
- database connections are closed after each operation.

This directly closes the exact compile/build defect while preserving the existing canonical browser folder-watcher architecture.

## Previously established fronts
- Invoice page-read tenant/security closure: IMPLEMENTED → REGRESSION GUARD; exact-head/live pending.
- P0 Data Quality canonical aggregation: IMPLEMENTED → consumer migrated → regression; exact-head/live pending.
- Dashboard Intelligence tenant boundary: IMPLEMENTED → regression; live pending.
- Forecast read boundary: IMPLEMENTED → regression; runtime pending.
- Export tenant authority hardening: IMPLEMENTED → regression; live A/B pending.
- `queries-compat.ts`: retained as a compatibility boundary with regression guard; execution evidence remains required.

## Watched Folder — browser foundation
Existing browser/PWA foundation is retained. The canonical platform contract explicitly distinguishes web/PWA active-session monitoring from Windows native persistent background capability. Browser implementation uses File System Access where available, SHA-256 fingerprints, incremental scanning and explicit permission handling. UNC/network paths remain outside the browser capability boundary.

Status: `IMPLEMENTED → CONTRACTED → LIVE RUNTIME PENDING`.

Evidence: `src/lib/import-pipeline/folder-watch-contract.ts`, `src/components/FolderBatchImportPanel.tsx`, `src/lib/import/batch-folder.ts`, `src/lib/import/folder-handle-store.ts`.

## Windows Desktop Watched Folder — gap closure
Implemented on `feat/windows-desktop-watched-folder`:
- Electron native host and isolated preload bridge.
- Windows directory picker; renderer cannot choose an arbitrary root through the start IPC.
- Recursive filesystem events plus 30-second polling fallback.
- Supported-extension allowlist.
- Renderer receives relative paths only; absolute local paths are not emitted through the file-event IPC.
- Read requests accept relative paths only and are constrained to the selected watched root.
- Realpath containment check prevents symlink/path indirection from escaping the watched root.
- Window close hides the app; tray exit explicitly stops the watcher.
- Existing `FolderBatchImportPanel` routes native events into canonical `processFolderFiles()` rather than a second business-import engine.
- Windows NSIS packaging and dedicated Windows workflow.
- Native watcher contract gate protects the IPC boundary and realpath/path containment invariants.
- Native selected-folder configuration persists locally and restores after restart; live restart evidence remains pending.
- Stable `size:mtimeMs` read gate rejects potentially partial files with `WATCH_FILE_STILL_WRITING`.
- Native `pending` state suppresses concurrent duplicates without prematurely marking failed/unstable files as permanently known.

## Reliability closure history
### Native IPC authority
Disposition: `FIXED`.
- selected root is established only by native picker.
- start accepts no renderer filesystem root.
- file events expose `relativePath` only.
- read-file is contained by the active watched root and realpath checks.

### Desktop restart persistence
Disposition: `FIXED IN CODE → RUNTIME NOT PROVEN`.
- native configuration persisted under Electron userData.
- preload exposes restored selection and explicit forget.
- renderer resumes persisted selection.

### Partial-write protection
Disposition: `FIXED IN CODE → RUNTIME NOT PROVEN`.
- stable `size:mtimeMs` signature required before bytes are returned.
- up to five stability checks.
- unstable files return `WATCH_FILE_STILL_WRITING`.

### Retry-safe watcher state
Disposition: `FIXED IN CODE → EXACT-HEAD CI PENDING`.
- pending set suppresses only concurrent checks.
- known state is committed only after stable-read and event emission.
- unstable/failed consumption remains retryable.

### Renderer/native TypeScript contract
Disposition: `FIXED`.
- renderer declaration mirrors `start()`, relative-path events, `getSelectedDirectory()` and `forget()`.

### Persistent browser folder handle compile gap
Disposition: `FIXED IN CODE → EXACT-HEAD CI PENDING`.
- root cause was an imported-but-absent `folder-handle-store` module.
- added canonical IndexedDB implementation with save/load/forget operations.

## Security/data-truth safeguards in desktop work
- Native host does not expose Node integration to renderer.
- Renderer cannot choose an arbitrary watched root through the start IPC.
- Renderer receives relative file paths only.
- Realpath containment protects against symlink escape.
- Local absolute paths are not sent into import evidence.
- Native host reuses the existing tenant-aware canonical import pipeline rather than bypassing RPC/import controls.
- Browser folder handles are local capability state only; they are not tenant truth or database evidence.
- No database schema or production data mutation was performed by this desktop branch.

## Remaining Windows Desktop proof
- `NOT PROVEN`: exact-head Windows installer artifact.
- `NOT PROVEN`: install/run on a real Windows machine.
- `NOT PROVEN`: authenticated tenant session + real report copied into watched folder → canonical import → database → analytics → UI.
- `NOT PROVEN`: partial-write safety against a real Onyx/export writer (stability/retry guard implemented; live writer test still required).
- `NOT PROVEN`: offline/reconnect behavior.
- `NOT PROVEN`: restart persistence of the watched-folder configuration (code path implemented; live restart evidence still required).
- `NOT PROVEN`: UNC/network share behavior; currently outside browser capability boundary and requires dedicated local-agent/network capability.

## Parallel remaining fronts
### Front A — Canonical Data Truth
- Full `queries-compat.ts` function/consumer graph.
- NULL/UNKNOWN/INSUFFICIENT_DATA semantics.
- date/status/as-of consistency.
- remaining browser business aggregation.

### Front B — Consumer + Legacy Closure
- zero-consumer proof for compatibility functions.
- duplicate business engines.
- DB-only legacy candidates with external-consumer risk.

### Front C — BI / Decision / Export
- cross-surface equivalence.
- Forecast/Demand Velocity/Inventory Intelligence.
- export metric/date/status/as-of/filter equivalence.

### Front D — Security / Tenant
- RPC grants/search_path/RLS.
- Storage/Realtime/AI-vector.
- workers, notifications and generated files.

### Front E — Performance
- unbounded reads.
- query plans/indexes.
- N+1 and payload bounds.

### Front F — Reliability
- worker/watcher/queue/retry/idempotency/DLQ/recovery.
- backup/restore/RPO/RTO.

### Front G — Runtime/LIVE
- authenticated E2E.
- Supabase A/B isolation.
- OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository behavioral/contract evidence exists; execution must be separately evidenced.
- GATED: NO CLAIM for current HEAD until exact-head CI evidence exists.
- RUNTIME VERIFIED: only with real browser/native evidence.
- LIVE VERIFIED: only with real Supabase/production evidence.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Current next actions
1. Fresh exact-head CI for corrected head `690a6f9...` and resulting merge ref.
2. Verify Windows artifact build from the dedicated Windows runner.
3. Perform real Windows install/run and watched-folder test when artifact is available.
4. Continue parallel canonical-data, BI/export, security/tenant, performance and reliability fronts.
5. Clean non-blocking lint warnings in a dedicated quality-hardening pass without changing behavior.
6. Reconcile branch against migration/security forensic findings before promotion.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
