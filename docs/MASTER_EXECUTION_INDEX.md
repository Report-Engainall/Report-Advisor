# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main`

> نقطة الرجوع الإلزامية قبل كل دفعة. لا تُحسب الملفات/commits إنجازًا بحد ذاتها. نفصل implementation / gate / runtime / live certification.

## Mandatory execution rules
- افحص الفهرس والمستودع والعمل السابق قبل كل دفعة.
- Reuse/fix/consolidate قبل create؛ لا engines موازية.
- CI يعمل بالتوازي مع التدقيق والتنفيذ.
- لا نتبع ~2500 commit/failure واحدًا واحدًا؛ نستخدم **failure-family batching**: scan/search → cluster by root cause → fix all independent instances → regression guard → CI.
- Failure → root cause → batch fix → regression → rerun.
- لا mock business data ولا fake runtime evidence ولا defaults تخفي missing data/tenant/security constraints.
- AI ليس مصدر الحقيقة المالية/الرقمية.
- PASS لا يعني production-certified؛ LIVE evidence منفصل.

## Current truth
The quality workflow is operated as a batch-discovery loop rather than a serial first-failure loop. No CI PASS is claimed for commits whose complete workflow result is unavailable.

## Latest implementation batches
- `99b70b9c791341444e4a13d00155593e5e01bb74`: centralized compatibility tenant guard in `queries-compat.ts`.
- `5f8653ab7288e95cce5b4aa723250cd3f37b64ee`: removed fabricated import metrics and invalid non-terminal finalization from compatibility updates; existing canonical counters and lineage are read first, progress is interpreted as percentage, and only terminal statuses call `import_finish_job`.
- `1ebe366613d9f58d7d9bb7f60bc195f00bdc6ad6`: added a parallel P0 family gate that executes the existing tenant, import, KPI/report-truth, workflow, and production-blocker contracts concurrently and aggregates failures instead of serially stopping at the first one.
- `f72b85f6c0f6d3e3ae1d86a6bc20e3e1a8690f59`: exposed the parallel P0 family gate as `npm run test:p0-batch`.
- Existing canonical import lifecycle hardening remains authoritative: tenant context, terminal allow-list, row locking and lineage preservation.

## Current CI truth
- No CI PASS is claimed for the new P0 batch until a complete workflow result exists.
- The P0 batch gate is intentionally fail-closed: any family failure makes the aggregate gate fail while still reporting all independently failing families.
- Static review confirms the compatibility path no longer turns `progress` into fabricated valid/invalid/duplicate metrics and does not finalize non-terminal states.
- Runtime Supabase evidence remains separate and LIVE REQUIRED.

## Phase truth
| المسار | الحالة | المتبقي الحاسم |
|---|---|---|
| 1–21 | COMPLETE FOUNDATION | dependency/toolchain recheck |
| 22–29 | IMPLEMENTED/GATED | runtime/E2E/golden evidence |
| 30–37 | IMPLEMENTED/GATED | runtime + decision E2E |
| A0 | FOUNDATION/GATED | document engine depth |
| A–D | FOUNDATION/DEEP FOUNDATION COMPLETE | live worker/action/forecast feedback |
| E–G | GATED/LIVE REQUIRED | tenant/security/restore/rollback/release |
| H–I | FOUNDATION/GATED | live canaries/graph/outcomes/cockpit |
| J–J.1 | FOUNDATION/GATED | live watched-folder coordinator |
| K–L | FOUNDATION/GATED | real jobs/outcomes/telemetry/action loop |
| M | FOUNDATION/CONTRACT-GATED | final production bundle/live certification |
| N | INTEGRATION TARGET | runtime recovery + restore evidence |
| O | INTEGRATION TARGET | adversarial tenant/security runtime |
| P | INTEGRATION TARGET | document intelligence depth + golden corpus |
| Q | INTEGRATION TARGET | KPI/BI truth + cross-surface equivalence |
| R | INTEGRATION TARGET | decision→action→outcome loop |
| S | NOT LIVE CERTIFIED | final production certification |

## Tenant / Data / KPI truth
- Tenant legacy/static/client-selected consumer scan: **PASS** for the guarded boundary; remaining hits must be classified by authoritative flow, not string matching alone.
- Canonical browser tenant resolver remains `resolveCurrentCompanyId()`.
- Import RPCs validate tenant context server-side and use tenant-owned row locks.
- Import lifecycle has idempotency, canonical tenant context and terminal-state hardening.
- Compatibility import updates now preserve canonical counters and result-summary lineage rather than fabricating missing metrics.
- KPI presentation must remain fail-closed for missing authoritative values; no missing→zero coercion is accepted.

## Watched-folder / cross-platform
Canonical existing watcher reused: directory selection/monitoring, SHA-256, incremental state, IndexedDB snapshots, queue/dead-letter and text-first fallback.

Single cross-platform contract: `src/lib/import-pipeline/folder-watch-contract.ts`.
- Web/PWA: active-session File System Access where supported; no false background promise after app close.
- Windows: persistent background watch requires native host adapter.
- Android: native directory permission/watcher required.
- iOS: capability-aware; arbitrary persistent background folder watching is not claimed.
- All adapters emit the same `WatchEvent` into the same queue/import pipeline.

## P0 / P1 truth
**P0:** Supabase adversarial runtime, Storage/signed URLs, Realtime authorization, AI tenant isolation, Backup Restore/RPO-RTO, migration parity, artifact verification, worker failure/dead-letter drills, security/secrets, SLO/rollback, production certification.

**P1:** Windows persistent watcher, Android native watcher, iOS capability integration, live folder coordinator, live Document Intelligence corpus, evidence graph, outcome feedback, executive action loop.

These remain LIVE REQUIRED wherever static contracts cannot establish real runtime behavior.

## Completion truth
**Engineering completion: ~82% conservative.** No percentage increase is claimed for commits/guards alone. Production certification remains **NO** until LIVE runtime evidence closes the P0 matrix.

## Batch execution method — permanent
Every wave now follows: **scan entire family → cluster root causes → fix all safe instances → strengthen existing guard/test → re-scan → move to next family**. The assistant does not stop after the first defect and does not return for user approval between independent fixes.

## Next parallel wave
1. Run the new P0 family gate in CI and use its aggregate failure set as the next root-cause cluster.
2. KPI/metric SQL and service contracts: tenant scope, silent zero/default coercion, date semantics, provenance.
3. Report/decision/recommendation constructors: evidence, confidence, provenance and outcome linkage.
4. Import transaction boundaries: deletion/tombstone reconciliation, retry idempotency, terminal replay and lineage.
5. Lease/checkpoint/recovery: heartbeat races, duplicate completion, stale lease recovery and dead-letter evidence.
6. Storage/Realtime/AI isolation contracts and runtime canary wiring.
7. Native watcher adapters and live folder coordinator without claiming unsupported platform capabilities.
8. Continue CI in parallel; increase certified percentage only after complete evidence.
