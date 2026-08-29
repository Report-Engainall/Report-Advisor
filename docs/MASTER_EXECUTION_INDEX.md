# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30
Repository: `Report-Engainall/Report-Advisor`
Branch: `feat/windows-desktop-watched-folder`
Current branch HEAD at this update: `7a5ae02ec03528b4b80bf4c7dc9d9c651196a12a`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Baseline
- Protected certification candidate: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- This branch is a justified gap-closure branch from that baseline.
- Certification remains blocked until exact-head CI, deployment, runtime and live evidence are proven.

## Current execution cycle — 2026-08-30
### Exact-head / branch evidence refresh
Branch head before this index update: `7a5ae02ec03528b4b80bf4c7dc9d9c651196a12a`.

Previous exact branch head `ca786dc29d400a6c6bb1d65b64a25a6171e4a577` had successful repository gates:
- `quality` run `33274911754` — SUCCESS.
- `integrity-batch` run `33274911753` — SUCCESS.
- `batch-integrity-guards` run `33274911750` — SUCCESS.
- `file-engine-header-contract` run `33274911763` — SUCCESS.
- `ci-bootstrap-smoke` run `33274911742` — SUCCESS.
- `production-chain-guard` run `33274911764` — SUCCESS.
- `file-intelligence-security` run `33274911756` — SUCCESS.

The desktop runtime smoke and workflow changes were then committed on top of that evidence. Fresh CI is required for the resulting index-update SHA; no previous PASS is promoted automatically.

### Windows Desktop Watched Folder — implementation closure added
PR #100 `feat: Windows desktop watched-folder runtime` remains OPEN/DRAFT.

Implementation proven by repository inspection:
- Electron native Windows host.
- Isolated preload bridge with `contextIsolation:true`, `nodeIntegration:false`, and sandboxed BrowserWindow.
- Native folder picker; renderer cannot supply an arbitrary root to `start`.
- Recursive filesystem events plus 30-second polling fallback.
- Supported-extension allowlist.
- Relative-path-only event payloads.
- `realpath` containment for watched root and requested file.
- Stable `size:mtimeMs` checks before reading a file; unstable writes fail with `WATCH_FILE_STILL_WRITING`.
- Pending-state duplicate suppression.
- Local userData persistence of selected folder and explicit forget/stop operations.
- Existing `FolderBatchImportPanel` sends native file events through canonical `processFolderFiles()` rather than creating a second business import engine.
- Windows NSIS packaging manifest and dedicated Windows workflow.

### New runtime-verification implementation
A real native smoke path has now been added rather than relying only on static contract checks:
- `desktop/main.cjs` supports an explicit `REPORT_ADVISOR_NATIVE_SMOKE=1` mode.
- The smoke path creates an isolated temporary watched directory and nested input directory.
- It persists the selected root, reloads it, and verifies restart-style persistence through the same persisted configuration contract.
- It starts the real Electron watcher.
- It writes a supported CSV file into the nested directory.
- It waits for the actual watcher event and verifies the emitted path is relative (`incoming/smoke-report.csv`).
- It verifies the file can be read through the same stable-read filesystem path.
- It cleans up the temporary directory and persisted state.
- `.github/workflows/desktop-windows.yml` now executes this smoke test on the Windows runner before packaging the installer.

This is a **new executable runtime gate**, not yet a PASS: the workflow must run successfully on the current exact head before the evidence is promoted.

### Windows Desktop — remaining NOT PROVEN findings
Issue #102 is the current certification-gap record.

1. **Exact-head native runtime execution** — smoke implementation exists; successful Windows CI execution on the post-change exact head is pending.
2. **Reproducible desktop dependencies** — desktop workflow still uses `npm install`; `desktop/package-lock.json` is absent. This remains NOT PROVEN and is intentionally not hidden.
3. **Installer artifact** — exact-head Windows installer artifact evidence remains pending.
4. **Real-user restart persistence** — smoke covers persistence mechanics; interactive installed-app restart remains pending.
5. **Partial-write behavior against a real report writer** — stability guard is implemented; producer-specific runtime evidence remains pending.
6. **Offline/reconnect behavior** — not proven.
7. **UNC/network share behavior** — intentionally outside current browser capability; dedicated local-agent/network capability remains a separate gap.
8. **Native watcher → canonical import → authenticated DB/UI result** — smoke proves native watcher mechanics only; end-to-end business ingestion remains pending.

Disposition: `IMPLEMENTED → STATIC/CONTRACT VERIFIED → NATIVE SMOKE ADDED → EXACT-HEAD RUNTIME EVIDENCE PENDING`.

### Vercel preview evidence
PR #100 received a Ready Vercel Preview on 2026-08-29. This is web-preview evidence only; it cannot certify the native Windows host.

A Vercel deployment-rate-limit failure was observed on one deployment attempt (`api-deployments-free-per-day`); this is an external platform quota event, not an application defect. A later preview reached Ready.

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

## Reliability closure history
### Native IPC authority
Disposition: `FIXED`.
- selected root is established only by native picker.
- start accepts no renderer filesystem root.
- file events expose `relativePath` only.
- read-file is contained by the active watched root and realpath checks.

### Desktop restart persistence
Disposition: `FIXED IN CODE → NATIVE SMOKE COVERAGE ADDED → INTERACTIVE RUNTIME NOT PROVEN`.
- native configuration persisted under Electron userData.
- preload exposes restored selection and explicit forget.
- renderer resumes persisted selection.
- native smoke now exercises persistence load/restore on the Windows runner.

### Partial-write protection
Disposition: `FIXED IN CODE → NATIVE SMOKE COVERS STABLE READ → REAL-PRODUCER RUNTIME NOT PROVEN`.
- stable `size:mtimeMs` signature required before bytes are returned.
- up to five stability checks.
- unstable files return `WATCH_FILE_STILL_WRITING`.

### Retry-safe watcher state
Disposition: `FIXED IN CODE → STATIC CONTRACT VERIFIED; NATIVE SMOKE ADDED; EXACT-HEAD EXECUTION PENDING`.
- pending set suppresses only concurrent checks.
- known state is committed only after stable-read and event emission.
- unstable/failed consumption remains retryable.

### Renderer/native TypeScript contract
Disposition: `FIXED`.
- renderer declaration mirrors `start()`, relative-path events, `getSelectedDirectory()` and `forget()`.

### Persistent browser folder handle compile gap
Disposition: `FIXED IN CODE`.
- root cause was an imported-but-absent `folder-handle-store` module.
- added canonical IndexedDB implementation with save/load/forget operations.
- exact-head CI previously proved the corrected branch compiles/builds successfully.

### Renderer hooks quality hardening
Disposition: `IMPLEMENTED`.
- `FolderBatchImportPanel` callback/effect dependencies are explicit and stable.
- no business logic or data-source change was introduced.

## Security/data-truth safeguards in desktop work
- Native host does not expose Node integration to renderer.
- Renderer cannot choose an arbitrary watched root through the start IPC.
- Renderer receives relative file paths only.
- Realpath containment protects against symlink escape.
- Local absolute paths are not sent into import evidence.
- Native host reuses the existing tenant-aware canonical import pipeline rather than bypassing RPC/import controls.
- Browser folder handles are local capability state only; they are not tenant truth or database evidence.
- No database schema or production data mutation was performed by this desktop branch.
- Native smoke uses only an isolated temporary directory and synthetic local file; it does not touch production data.

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

## Certification blockers currently visible
- Fresh exact-head CI is required after this index update because the index itself changes the branch SHA.
- Exact-head Windows native smoke execution and installer artifact evidence are pending.
- Desktop dependency reproducibility remains unproven because no desktop lockfile is present.
- Authenticated real-data browser E2E remains required.
- Supabase A/B tenant isolation, Storage, Realtime, AI/vector, OCR corpus, worker crash/recovery/DLQ, backup restore/RPO/RTO, production telemetry, load/canary/rollback and production scale/query-plan evidence remain LIVE requirements.
- No P0/P1 finding may be treated as closed solely from historical evidence.

## Current next actions
1. Wait for and inspect fresh exact-head CI, including the Windows native smoke.
2. If smoke fails, classify root cause and make the smallest canonical fix; do not weaken the test.
3. Capture exact-head installer artifact evidence after successful packaging.
4. Continue parallel canonical-data, BI/export, security/tenant, performance and reliability fronts.
5. Reconcile branch against migration/security forensic findings before promotion.
6. Close Issue #102 only after native runtime, installer, reproducibility, real report ingestion and required LIVE evidence are actually proven.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
