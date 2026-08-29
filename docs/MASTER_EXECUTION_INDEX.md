# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-29
Repository: `Report-Engainall/Report-Advisor`
Branch: `feat/windows-desktop-watched-folder`
Current branch HEAD at this update: `577c9274a36d70e970d19dcc8adbe7f326974152`

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

## Windows Desktop Watched Folder — gap closure
Finding: the platform contract declared `windows.persistentBackgroundWatch=true` and `nativeDirectoryPermission=true`, but the repository had no native Windows host/adapter implementing that capability. The browser watcher could not honestly provide persistent desktop filesystem access.

Classification: `P1 PRODUCT + RELIABILITY + PLATFORM CAPABILITY GAP`.

Implemented on `feat/windows-desktop-watched-folder`:
- Electron native host and isolated preload bridge.
- Windows directory picker; renderer cannot choose an arbitrary root through the start IPC.
- Recursive filesystem events plus 30-second polling fallback.
- 1.2s delayed event read to reduce partial-write capture risk.
- Supported-extension allowlist.
- Renderer receives relative paths only; absolute local paths are not emitted through the file-event IPC.
- Read requests accept relative paths only and are constrained to the selected watched root.
- Realpath containment check prevents symlink/path indirection from escaping the watched root.
- Window close hides the app; tray exit explicitly stops the watcher.
- Existing `FolderBatchImportPanel` routes native events into canonical `processFolderFiles()` rather than a second business-import engine.
- Windows NSIS packaging and dedicated Windows workflow.
- Native watcher contract gate now protects the IPC boundary and realpath/path containment invariants.

### New forensic finding and canonical fix — 2026-08-29
The first native implementation allowed the renderer to pass a root path to `startWatch(root)` and emitted the absolute file path in the file-event payload. Although the import evidence path used the relative path, this was unnecessarily broad native IPC authority.

Disposition: `FIXED`.

Fixes:
- `selectedRoot` is established only by the native Windows directory picker.
- `start` accepts no renderer-supplied filesystem root.
- file-event payload contains `relativePath` only.
- `read-file` resolves only beneath the active watched root.
- `fs.promises.realpath()` containment is checked for both watched root and requested file before reading.
- contract test explicitly rejects the old unsafe IPC shapes.

Commits:
- `301259e5e13cce51da48fc653cdc57eb8741afe9` — native IPC hardening.
- `cb58f200793ea9b9fe10a0f3d136753bc86bfb14` — relative-path preload bridge.
- `f464a8e4c2f7bebde3b52d3231bf10f551f4b718` — canonical UI wiring to relative paths.
- `577c9274a36d70e970d19dcc8adbe7f326974152` — regression contract + this index update.

Current status: `IMPLEMENTED → CONTRACT UPDATED → EXACT-HEAD CI PENDING`.

## Earlier CI evidence
Branch head `097ab3527614e22c98f30aa8652e9406dff14657` had the full repository CI suite successful:
- `quality` run `33272680089`: SUCCESS.
- `integrity-batch` run `33272680072`: SUCCESS.
- `batch-integrity-guards` run `33272680100`: SUCCESS.
- `production-chain-guard` run `33272680078`: SUCCESS.
- `file-intelligence-security` run `33272680095`: SUCCESS.
- `file-engine-header-contract` run `33272680097`: SUCCESS.
- `ci-bootstrap-smoke` run `33272680074`: SUCCESS.

An earlier desktop workflow defect (`npm run package:win` from the wrong working directory) was corrected to `npm --prefix desktop run package:win` and subsequent repository CI passed.

## Forensic execution note — main branch procedural correction
During this cycle, desktop files were accidentally written to `main` because the GitHub contents API defaults to the default branch when `branch` is omitted. The files were immediately deleted from `main`; no desktop implementation remains there. This created revert commits on `main`, so the historical SHA `4da16b9a...` is not the literal current main ref. Do not claim otherwise. The certification baseline remains the historical protected candidate for evidence comparison; new work is isolated on the feature branch.

## Security/data-truth safeguards in desktop work
- Native host does not expose Node integration to renderer.
- Renderer cannot choose an arbitrary watched root through the start IPC.
- Renderer receives relative file paths only.
- Realpath containment protects against symlink escape.
- Local absolute paths are not sent into import evidence.
- Native host reuses the existing tenant-aware canonical import pipeline rather than bypassing RPC/import controls.
- No database schema or production data mutation was performed by this desktop branch.

## Remaining Windows Desktop proof
- `NOT PROVEN`: exact-head Windows installer artifact.
- `NOT PROVEN`: install/run on a real Windows machine.
- `NOT PROVEN`: authenticated tenant session + real report copied into watched folder → canonical import → database → analytics → UI.
- `NOT PROVEN`: partial-write safety against a real Onyx/export writer.
- `NOT PROVEN`: offline/reconnect behavior.
- `NOT PROVEN`: restart persistence of the watched-folder configuration.
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
1. Run/inspect exact-head CI for `577c9274...`.
2. Verify Windows artifact build from the dedicated Windows runner.
3. Perform real Windows install/run and watched-folder test when artifact is available.
4. Reconcile branch against migration/security forensic findings before promotion.
5. Continue parallel canonical-data, BI/export, security/tenant, performance and reliability fronts.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
