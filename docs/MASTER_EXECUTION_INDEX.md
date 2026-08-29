# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30
Repository: `Report-Engainall/Report-Advisor`
Branch: `feat/windows-desktop-watched-folder`
Current branch HEAD at this update: `ca786dc29d400a6c6bb1d65b64a25a6171e4a577`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Baseline
- Protected certification candidate: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- This branch is a justified gap-closure branch from that baseline.
- Certification remains blocked until exact-head CI, deployment, runtime and live evidence are proven.

## Current execution cycle — 2026-08-30
### Exact-head / branch evidence refresh
Branch head under review: `ca786dc29d400a6c6bb1d65b64a25a6171e4a577`.

Observed successful CI on this exact branch head:
- `quality` run `33274911754` — SUCCESS; verify job completed all listed architecture, security, intelligence, regression, typecheck, lint, build and resilience gates.
- `integrity-batch` run `33274911753` — SUCCESS.
- `batch-integrity-guards` run `33274911750` — SUCCESS.
- `file-engine-header-contract` run `33274911763` — SUCCESS.
- `ci-bootstrap-smoke` run `33274911742` — SUCCESS.
- `production-chain-guard` run `33274911764` — SUCCESS.
- `file-intelligence-security` run `33274911756` — SUCCESS.

These are repository/CI proofs only. They do not promote the branch to Runtime/LIVE/Production Certification.

### Windows Desktop Watched Folder — evidence classification
PR #100 `feat: Windows desktop watched-folder runtime` remains OPEN and DRAFT at branch head `ca786dc29d400a6c6bb1d65b64a25a6171e4a577`.

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

Evidence: PR #100 changed files and `scripts/check-windows-desktop-folder-watch-contract.mjs`.

### Windows Desktop — NOT PROVEN findings
Issue #102 created as the current certification-gap record.

1. **Native runtime execution** — static contract verification exists, but there is no exact-head evidence of a real Windows Electron session performing select → persist → start → new/changed file event → stable read → canonical import handoff → database/UI result.
2. **Reproducible desktop dependencies** — desktop workflow uses `npm install`; `desktop/package-lock.json` is not present in PR #100. Reproducible dependency resolution is therefore not proven.
3. **Installer artifact** — exact-head Windows installer artifact evidence is not yet present in the observed CI runs.
4. **Restart persistence** — implemented in code but not proven by a real restart test.
5. **Partial-write behavior against a real report writer** — stability guard implemented but not proven against a real producer such as an Onyx/export writer.
6. **Offline/reconnect behavior** — not proven.
7. **UNC/network share behavior** — intentionally outside the current browser capability boundary; dedicated local-agent/network capability remains a separate gap.

Disposition: `IMPLEMENTED → CI VERIFIED FOR WEB/REPOSITORY CONTRACTS → NATIVE RUNTIME NOT PROVEN`.

### Vercel preview evidence
PR #100 received a Ready Vercel Preview deployment on 2026-08-29. This is valid web-preview evidence only; it cannot certify the native Windows host.

A Vercel deployment-rate-limit failure was also observed on one deployment attempt (`api-deployments-free-per-day`); this is an external platform quota event, not an application defect. The later preview reached Ready.

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
Disposition: `FIXED IN CODE → EXACT-HEAD CI VERIFIED FOR STATIC CONTRACTS; RUNTIME PENDING`.
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
- exact-head CI now proves the corrected branch compiles/builds successfully.

### Renderer hooks quality hardening
Disposition: `IMPLEMENTED`.
- `FolderBatchImportPanel` callback/effect dependencies are now explicit and stable.
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
- Native Windows runtime/installer evidence is not proven.
- Authenticated real-data browser E2E remains required.
- Supabase A/B tenant isolation, Storage, Realtime, AI/vector, OCR corpus, worker crash/recovery/DLQ, backup restore/RPO/RTO, production telemetry, load/canary/rollback and production scale/query-plan evidence remain LIVE requirements.
- No P0/P1 finding may be treated as closed solely from historical evidence.

## Current next actions
1. Exact-head CI for the new index-update SHA.
2. Execute/obtain the dedicated Windows workflow and installer artifact evidence.
3. Perform real Windows install/run and watched-folder runtime test.
4. Continue parallel canonical-data, BI/export, security/tenant, performance and reliability fronts.
5. Continue non-blocking lint warning cleanup in isolated quality-hardening commits without changing behavior.
6. Reconcile branch against migration/security forensic findings before promotion.
7. Close Issue #102 only after its evidence requirements are actually proven.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
