# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30
Repository: `Report-Engainall/Report-Advisor`
Branch: `feat/windows-desktop-watched-folder`
Current branch HEAD at this update: `38dd1075d3eba2e8f201e91c4334c88a177d50ee`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Baseline
- Protected certification candidate: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- This branch is a justified gap-closure branch from that baseline.
- Certification remains blocked until exact-head CI, deployment, runtime and live evidence are proven.

## Current execution cycle — 2026-08-30
### Workflow command integrity closure
Two consecutive exact-PR CI failures exposed a checker/workflow contract mismatch. The canonical resolution was to make desktop commands explicit with `npm --prefix desktop run ...` and have the checker resolve package-prefixed scripts rather than weakening validation.

Relevant history:
- `33275980507` failed on `desktop-windows.yml: npm run smoke:native`.
- `22571ab2e725239affe43c7af510eb5c55ae01ea` extended the checker for package prefixes.
- `e7743d059f787c1f46784b15a62c4d6afc33e21a` still showed the workflow's implicit working-directory command was not visible to the checker.
- `22a587545bd26facb4491e0065685ca995479120` changed the workflow to explicit `npm --prefix desktop run smoke:native`.

Status: `CANONICAL CONTRACT FIXED; CURRENT HEAD STILL REQUIRES FRESH EXACT-HEAD EVIDENCE`.

### Native watcher smoke depth increased
Commit `38dd1075d3eba2e8f201e91c4334c88a177d50ee` deepens the executable native smoke contract. In addition to persistence, new-file event and stable read, the smoke now exercises:
- changed-file detection and changed content read;
- traversal rejection through the same root-bound read function;
- deletion detection through the real rescan path;
- the renderer IPC read path now delegates to the same tested `readWatchedFile()` implementation.

No fake filesystem abstraction was introduced; the smoke uses real Electron/Node filesystem operations in an isolated temporary directory.

Status: `IMPLEMENTED → EXECUTABLE SMOKE DEPTHENED → WINDOWS RUNNER EXECUTION PENDING`.

### Current exact branch head
`38dd1075d3eba2e8f201e91c4334c88a177d50ee`.
Fresh Actions for this exact SHA are required before any previous green result is promoted. Vercel quota failures are tracked separately as external platform events and do not constitute application certification evidence.

## Windows Desktop Watched Folder
PR #100 `feat: Windows desktop watched-folder runtime` remains OPEN/DRAFT.

Implemented:
- Electron native Windows host.
- Isolated preload bridge: `contextIsolation:true`, `nodeIntegration:false`, sandboxed BrowserWindow.
- Native folder picker; renderer cannot supply an arbitrary root to `start`.
- Recursive filesystem events plus 30-second polling fallback.
- Supported-extension allowlist.
- Relative-path-only event payloads.
- `realpath` containment for root and requested file.
- Stable `size:mtimeMs` checks before reads.
- Pending-state duplicate suppression.
- Local userData persistence with stop/forget operations.
- Existing `FolderBatchImportPanel` routes native events through canonical `processFolderFiles()`.
- Windows NSIS packaging manifest and dedicated workflow.
- Executable smoke: persistence, new file, changed file, stable reads, traversal rejection, deletion detection.

## Desktop certification gaps
1. Exact-head Windows native runtime execution — NOT PROVEN.
2. Reproducible desktop dependency install — NOT PROVEN; desktop lockfile remains absent.
3. Exact-head Windows installer artifact — NOT PROVEN.
4. Interactive installed-app restart persistence — NOT PROVEN.
5. Real report-writer partial-write behavior — generic stability guard exists; producer-specific runtime evidence pending.
6. Offline/reconnect business ingestion — NOT PROVEN.
7. UNC/network-share support — separate capability; not claimed.
8. Native watcher → canonical import → authenticated DB/UI result — NOT PROVEN.

## Previously established fronts
- Invoice page-read tenant/security closure: IMPLEMENTED → REGRESSION GUARD; exact-head/live pending.
- P0 Data Quality canonical aggregation: IMPLEMENTED → consumer migrated → regression; exact-head/live pending.
- Dashboard Intelligence tenant boundary: IMPLEMENTED → regression; live pending.
- Forecast read boundary: IMPLEMENTED → regression; runtime pending.
- Export tenant authority hardening: IMPLEMENTED → regression; live A/B pending.
- `queries-compat.ts`: retained as compatibility boundary with regression guard; execution evidence remains required.

## Browser watched-folder foundation
Existing browser/PWA capability remains the web fallback. It uses File System Access where available, SHA-256 fingerprints, incremental scanning and explicit permission handling. Persistent Windows background monitoring is provided by the native desktop path.

## Security/data-truth safeguards
- Native host does not expose Node integration to renderer.
- Renderer cannot choose arbitrary root through start IPC.
- Renderer receives relative paths only.
- Realpath containment protects against symlink escape.
- Native host reuses canonical import pipeline rather than a duplicate business engine.
- Browser folder handles are capability state, not tenant truth.
- Native smoke uses isolated temporary local data only.
- No production DB mutation was performed by the desktop branch.

## Parallel remaining fronts
### Front A — Canonical Data Truth
Full compatibility graph, NULL/UNKNOWN/INSUFFICIENT_DATA semantics, date/status/as-of consistency, remaining browser aggregation.

### Front B — Consumer + Legacy Closure
Zero-consumer proof, duplicate engines, DB-only legacy candidates and external-consumer risk.

### Front C — BI / Decision / Export
Cross-surface equivalence, Forecast/Demand Velocity/Inventory Intelligence, export metric/date/status/as-of/filter equivalence.

### Front D — Security / Tenant
RPC grants/search_path/RLS, Storage/Realtime/AI-vector, workers/notifications/generated files.

### Front E — Performance
Unbounded reads, query plans/indexes, N+1, payload bounds.

### Front F — Reliability
Worker/watcher/queue/retry/idempotency/DLQ/recovery, backup/restore/RPO/RTO.

### Front G — Runtime/LIVE
Authenticated E2E, Supabase A/B isolation, OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED
- TESTED/REGRESSION
- GATED
- RUNTIME VERIFIED
- LIVE VERIFIED
- PRODUCTION CERTIFIED

Current certification status: `PRODUCTION CERTIFIED = NO`.

## Current blockers
- Fresh exact-head Actions matrix for `38dd107...` is not yet evidenced.
- Exact-head Windows native smoke and installer artifact are pending.
- Desktop dependency reproducibility remains unproven.
- Authenticated real-data browser E2E remains required.
- Supabase A/B isolation, Storage, Realtime, AI/vector, OCR corpus, worker crash/recovery/DLQ, backup restore/RPO/RTO, production telemetry, load/canary/rollback and production scale/query-plan evidence remain LIVE requirements.

## Next execution sequence
1. Inspect fresh Actions for `38dd107...`; do not promote historical PASS.
2. If command-integrity passes, inspect Windows smoke and packaging rather than stopping at the first green gate.
3. Capture exact-head installer artifact evidence after successful packaging.
4. Continue parallel data-truth, BI/export, security/tenant, performance and reliability discovery.
5. Reconcile all findings against migration/security forensic history.
6. Update this index after each substantive execution cycle.
7. No certification until the full evidence chain is proven.
