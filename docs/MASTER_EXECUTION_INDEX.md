# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30
Repository: `Report-Engainall/Report-Advisor`
Branch: `feat/windows-desktop-watched-folder`
Current branch HEAD at this update: `22571ab2e725239affe43c7af510eb5c55ae01ea`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Baseline
- Protected certification candidate: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- This branch is a justified gap-closure branch from that baseline.
- Certification remains blocked until exact-head CI, deployment, runtime and live evidence are proven.

## Current execution cycle — 2026-08-30
### CI root-cause closure: workflow command integrity
The previous PR #100 merge-check failed at `command-integrity` because the checker inspected only root `package.json` scripts while `.github/workflows/desktop-windows.yml` legitimately invokes a script in `desktop/package.json` from `working-directory: desktop`.

Evidence:
- Failed job `99162661824` in run `33275980507` reported exactly `desktop-windows.yml: npm run smoke:native` as missing.
- The branch's workflow already executes the native smoke from `desktop`, and `desktop/package.json` defines `smoke:native`.

Canonical fix committed as `22571ab2e725239affe43c7af510eb5c55ae01ea`:
- `scripts/check-workflow-command-integrity.mjs` now resolves root scripts and scripts in explicit npm `--prefix` package contexts.
- Missing commands remain fail-closed; the checker was not weakened to ignore the desktop command.

Status: `ROOT CAUSE IDENTIFIED → CANONICAL FIX IMPLEMENTED → EXACT-HEAD CI PENDING`.

### Exact-head CI state
For the prior exact branch head `dd923cbec9c98508a239af52ad89c2df0f162d02`:
- `production-chain-guard` run `33275980572` — SUCCESS.
- `ci-bootstrap-smoke` run `33275980505` — SUCCESS.
- `file-intelligence-security` run `33275980513` — SUCCESS.
- `file-engine-header-contract` run `33275980499` — SUCCESS.
- `batch-integrity-guards` run `33275980491` — SUCCESS.
- `quality` run `33275980486` — SUCCESS.
- `integrity-batch` run `33275980507` — FAILURE, isolated to the command-integrity checker described above.

Those results are historical to `dd923cb...` and are not promoted to `22571ab...` certification evidence.

Current branch head is `22571ab2e725239affe43c7af510eb5c55ae01ea`. GitHub currently reports successful `CodeRabbit` and `Vercel` commit statuses, but the required Actions exact-head certification matrix is not yet proven. Therefore status remains `NOT PROVEN`.

## Windows Desktop Watched Folder
PR #100 `feat: Windows desktop watched-folder runtime` remains OPEN/DRAFT.

Implemented repository surface:
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
- Existing `FolderBatchImportPanel` routes native file events through canonical `processFolderFiles()`.
- Windows NSIS packaging manifest and dedicated Windows workflow.
- Executable native smoke mode covering persistence, watcher event delivery, relative-path emission and stable file read.

Status: `IMPLEMENTED → STATIC/CONTRACT VERIFIED → NATIVE SMOKE IMPLEMENTED → EXACT-HEAD EXECUTION NOT PROVEN`.

## Desktop certification gaps
1. Exact-head Windows native runtime execution — NOT PROVEN.
2. Reproducible desktop dependency install — NOT PROVEN; desktop lockfile remains absent.
3. Exact-head Windows installer artifact — NOT PROVEN.
4. Interactive installed-app restart persistence — NOT PROVEN.
5. Real report-writer partial-write behavior — NOT PROVEN beyond generic stability guard.
6. Offline/reconnect business ingestion — NOT PROVEN.
7. UNC/network-share support — intentionally outside browser capability and remains a separate agent capability.
8. Native watcher → canonical import → authenticated DB/UI result — NOT PROVEN.

## Previously established fronts
- Invoice page-read tenant/security closure: IMPLEMENTED → REGRESSION GUARD; exact-head/live pending.
- P0 Data Quality canonical aggregation: IMPLEMENTED → consumer migrated → regression; exact-head/live pending.
- Dashboard Intelligence tenant boundary: IMPLEMENTED → regression; live pending.
- Forecast read boundary: IMPLEMENTED → regression; runtime pending.
- Export tenant authority hardening: IMPLEMENTED → regression; live A/B pending.
- `queries-compat.ts`: retained as a compatibility boundary with regression guard; execution evidence remains required.

## Browser watched-folder foundation
Existing browser/PWA foundation remains the fallback web capability. It uses File System Access where available, SHA-256 fingerprints, incremental scanning and explicit permission handling. Browser sessions do not provide persistent background filesystem access after the normal web capability boundary. UNC/network paths remain outside browser capability.

## Reliability/security safeguards
- Native host does not expose Node integration to renderer.
- Renderer cannot choose an arbitrary watched root through start IPC.
- Renderer receives relative file paths only.
- Realpath containment protects against symlink escape.
- Native host reuses the canonical import pipeline rather than a duplicate business engine.
- Browser folder handles are capability state, not tenant truth.
- Native smoke uses an isolated temporary directory and synthetic CSV only.
- No production DB mutation was performed by the desktop branch.

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
- Exact-head Actions matrix after `22571ab...` is not yet evidenced.
- Exact-head Windows native smoke and installer artifact are pending.
- Desktop dependency reproducibility remains unproven.
- Authenticated real-data browser E2E remains required.
- Supabase A/B isolation, Storage, Realtime, AI/vector, OCR corpus, worker crash/recovery/DLQ, backup restore/RPO/RTO, production telemetry, load/canary/rollback and production scale/query-plan evidence remain LIVE requirements.
- No P0/P1 finding may be treated as closed solely from historical evidence.

## Current next actions
1. Obtain fresh exact-head CI evidence for `22571ab2e725239affe43c7af510eb5c55ae01ea`.
2. If command-integrity now passes, inspect the next failing/unfinished gate rather than stopping at the first green result.
3. Promote Windows native smoke only after actual Windows runner execution on the current head.
4. Capture installer artifact evidence.
5. Continue parallel canonical-data, BI/export, security/tenant, performance and reliability fronts.
6. Reconcile against migration/security forensic findings before promotion.
7. Close Issue #102 only after native runtime, installer, reproducibility, real report ingestion and required LIVE evidence are proven.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
