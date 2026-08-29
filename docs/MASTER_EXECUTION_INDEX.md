# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30
Repository: `Report-Engainall/Report-Advisor`
Branch: `feat/windows-desktop-watched-folder`
Current branch HEAD at this update: `22a587545bd26facb4491e0065685ca995479120`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Baseline
- Protected certification candidate: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- This branch is a justified gap-closure branch from that baseline.
- Certification remains blocked until exact-head CI, deployment, runtime and live evidence are proven.

## Current execution cycle — 2026-08-30
### CI root-cause closure: workflow command integrity — round 1
The PR #100 merge-check failed because the checker inspected only root `package.json` scripts while the Windows workflow invoked a script from `desktop/package.json` under a desktop working directory.

Evidence: failed job `99162661824` / run `33275980507` reported `desktop-windows.yml: npm run smoke:native` as missing.

Fix committed: `22571ab2e725239affe43c7af510eb5c55ae01ea`.
The checker was extended to resolve explicit npm `--prefix` package contexts while remaining fail-closed.

### CI root-cause closure: workflow command integrity — round 2
Fresh PR CI on `22571ab...` still failed the same gate. Forensic inspection showed the workflow command itself was written as `npm run smoke:native` with `working-directory: desktop`, which is semantically valid for GitHub Actions but opaque to the repository checker, which intentionally validates command ownership from the command text.

Canonical follow-up fix committed: `22a587545bd26facb4491e0065685ca995479120`.
- The workflow now invokes the desktop command explicitly as `npm --prefix desktop run smoke:native`.
- This removes ambiguity between workflow working-directory semantics and the command-integrity contract.
- The actual command remains the same desktop `smoke:native` script; no bypass or ignore rule was added.

Status: `ROOT CAUSE → FIXED IN CODE/WORKFLOW → FRESH EXACT-HEAD CI PENDING`.

### Exact-head CI history
For `dd923cbec9c98508a239af52ad89c2df0f162d02`:
- production-chain-guard `33275980572` SUCCESS
- ci-bootstrap-smoke `33275980505` SUCCESS
- file-intelligence-security `33275980513` SUCCESS
- file-engine-header-contract `33275980499` SUCCESS
- batch-integrity-guards `33275980491` SUCCESS
- quality `33275980486` SUCCESS
- integrity-batch `33275980507` FAILURE at command-integrity

For `e7743d059f787c1f46784b15a62c4d6afc33e21a` fresh Actions were observed starting; the integrity-batch job `33276174860` again failed at command-integrity, which led to the explicit-prefix workflow correction above.

Those historical results are never promoted to the current head.

Current exact branch head: `22a587545bd26facb4491e0065685ca995479120`. Fresh Actions evidence for this exact SHA is required. A Vercel status failure observed on the preceding index update pointed to `api-deployments-free-per-day` / upgrade-to-Pro and is treated as an external platform quota event, not an application defect; it does not substitute for runtime evidence.

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
- Stable `size:mtimeMs` checks before reads; unstable writes fail closed.
- Pending-state duplicate suppression.
- Local userData persistence with stop/forget operations.
- Existing `FolderBatchImportPanel` routes native events through canonical `processFolderFiles()`.
- Windows NSIS packaging manifest and dedicated workflow.
- Executable native smoke mode covering persistence, watcher event, relative-path emission and stable read.
- Workflow command now explicitly identifies the desktop package for the command-integrity gate.

Status: `IMPLEMENTED → STATIC/CONTRACT VERIFIED → NATIVE SMOKE IMPLEMENTED → EXACT-HEAD EXECUTION NOT PROVEN`.

## Desktop certification gaps
1. Exact-head Windows native runtime execution — NOT PROVEN.
2. Reproducible desktop dependency install — NOT PROVEN; desktop lockfile remains absent.
3. Exact-head Windows installer artifact — NOT PROVEN.
4. Interactive installed-app restart persistence — NOT PROVEN.
5. Real report-writer partial-write behavior — NOT PROVEN beyond generic stability guard.
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
Existing browser/PWA capability remains the web fallback. It uses File System Access where available, SHA-256 fingerprints, incremental scanning and explicit permission handling. Persistent Windows background monitoring is provided by the native desktop path, not by pretending browser APIs can do more than they can.

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
- Fresh exact-head Actions matrix for `22a587...` is pending.
- Exact-head Windows native smoke and installer artifact are pending.
- Desktop dependency reproducibility remains unproven.
- Authenticated real-data browser E2E remains required.
- Supabase A/B isolation, Storage, Realtime, AI/vector, OCR corpus, worker crash/recovery/DLQ, backup restore/RPO/RTO, production telemetry, load/canary/rollback and production scale/query-plan evidence remain LIVE requirements.

## Next execution sequence
1. Inspect fresh Actions for `22a587...`; do not promote prior results.
2. If command-integrity passes, inspect every subsequent Windows/quality gate.
3. Capture Windows native smoke and installer artifact evidence only after actual runner success.
4. Continue parallel data-truth, BI/export, security/tenant, performance and reliability discovery.
5. Reconcile all findings against the forensic/migration history.
6. Update this index after each substantive execution cycle.
7. No certification until the full evidence chain is proven.
