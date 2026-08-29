# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-29
Repository: `Report-Engainall/Report-Advisor`
Branch: `feat/windows-desktop-watched-folder`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Baseline
- Protected certification candidate: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- This branch is a justified gap-closure branch from that baseline.
- Certification remains blocked until exact-head CI, deployment, runtime and live evidence are proven.

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

Evidence: `src/lib/import-pipeline/folder-watch-contract.ts`, `src/components/FolderBatchImportPanel.tsx`, `src/lib/import/batch-folder.ts`.

## Windows Desktop Watched Folder — new gap closure
Finding: the platform contract declared `windows.persistentBackgroundWatch=true` and `nativeDirectoryPermission=true`, but the repository had no native Windows host/adapter implementing that capability. The browser watcher could not honestly provide persistent desktop filesystem access.

Classification: `P1 PRODUCT + RELIABILITY + PLATFORM CAPABILITY GAP`.

Fix implemented on branch `feat/windows-desktop-watched-folder`:
- Added `desktop/main.cjs` Electron native host.
- Added isolated `desktop/preload.cjs` bridge with `contextIsolation=true`, `nodeIntegration=false`, sandboxed renderer.
- Native directory selection uses Windows dialog instead of accepting arbitrary filesystem paths from the web UI.
- Native watcher uses recursive filesystem events where supported plus a 30-second polling fallback.
- File processing waits 1.2 seconds after filesystem events before reading, reducing partial-write capture risk.
- Supported extensions are allowlisted.
- File reads are root-bound; traversal outside the selected root fails closed with `WATCH_FOLDER_PATH_OUTSIDE_ROOT`.
- Absolute local filesystem paths are not persisted as import evidence; only the relative path is passed into the canonical import pipeline.
- Window close hides the application and leaves the watcher alive; tray exit stops the watcher explicitly.
- Added `desktop/package.json` and Windows NSIS packaging configuration.
- Added `.github/workflows/desktop-windows.yml` for reproducible Windows installer builds.
- Added `scripts/check-windows-desktop-folder-watch-contract.mjs` as a repository contract gate.
- Existing `FolderBatchImportPanel` now detects the native host and routes watched-file events into the existing canonical `processFolderFiles()` pipeline instead of creating a second business-import engine.

Status: `IMPLEMENTED → CI REGRESSION PASS → WINDOWS INSTALLER/LIVE E2E NOT YET PROVEN`.

### CI evidence for branch head `097ab3527614e22c98f30aa8652e9406dff14657`
- `quality` run `33272680089`: SUCCESS.
- `integrity-batch` run `33272680072`: SUCCESS.
- `batch-integrity-guards` run `33272680100`: SUCCESS.
- `production-chain-guard` run `33272680078`: SUCCESS.
- `file-intelligence-security` run `33272680095`: SUCCESS.
- `file-engine-header-contract` run `33272680097`: SUCCESS.
- `ci-bootstrap-smoke` run `33272680074`: SUCCESS.

An earlier run exposed a workflow-command defect because the desktop workflow used `npm run package:win` from `desktop/`; the workflow was corrected to `npm --prefix desktop run package:win`. This is recorded as `DISCOVERED → FIXED`; the subsequent repository CI suite passed.

## Forensic execution note — main branch procedural correction
During this cycle, desktop files were accidentally written to `main` because the GitHub contents API defaults to the default branch when `branch` is omitted. The files were immediately deleted from `main`; no desktop implementation remains there. This created revert commits on `main`, so the historical SHA `4da16b9a...` is no longer the literal current `main` ref even though the accidental file content was removed. Do not claim the original Exact HEAD is still the main branch tip. The certification baseline remains the historical protected candidate for evidence comparison, while new work is isolated on the feature branch.

## Security/data-truth safeguards added in desktop work
- Native host does not expose Node integration to renderer.
- Renderer cannot request reads outside the active watched root.
- Local absolute paths are not sent into the import evidence path.
- Native host reuses the existing tenant-aware canonical import pipeline rather than bypassing RPC/import controls.
- No database schema or production data mutation was performed by this desktop branch.

## Remaining Windows Desktop proof
- `NOT PROVEN`: Windows installer artifact from the dedicated Windows runner.
- `NOT PROVEN`: install/run on a real Windows machine.
- `NOT PROVEN`: authenticated tenant session + real report copied into watched folder → canonical import → database → analytics → UI.
- `NOT PROVEN`: partial-write safety against a real Onyx/export writer.
- `NOT PROVEN`: offline/reconnect behavior.
- `NOT PROVEN`: restart persistence of the watched-folder configuration.
- `NOT PROVEN`: UNC/network share behavior; currently explicitly outside the browser path and requires a later dedicated local-agent/network capability.

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

## Next execution
1. Complete Windows runner installer artifact verification.
2. Open the desktop branch for exact-head CI + Windows artifact review.
3. Fresh desktop runtime test with a real report folder and authenticated tenant.
4. Reconcile the branch against the later migration/security forensic findings before any production promotion.
5. Continue the remaining parallel data-truth/security/BI/reliability fronts.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
