# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-25
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
The quality workflow is operating as a batch-discovery loop rather than a serial first-failure loop. Routing/Security runs five independent checks together; downstream gates continue collecting independent failures. The last completed application gate wave reached all 43 functional/contract gates; the remaining workflow failure was in post-job Python cache handling, not an application gate. That cache path was removed because the Document Intelligence runtime contract does not require pip caching.

## Latest batch fixes
1. `src/lib/free-toolbox/batch-decision-engine.ts`: bounded risk percentages are clamped to `[0,100]` before `finitePercent`. Commit: `f21277a7311c463b75bf0089f5d5729e639588ef`.
2. `services/document-intelligence/tests/test_intermediate_model_contract.py`: aligned the test import with `PYTHONPATH=services/document-intelligence`. Commit: `5db499535667b0b25b8a4a7aa8caf9a8edf2556f`.
3. `scripts/check-report-truth-contract.mjs`: replaced greedy same-line numeric fallback detection with expression-safe matching and explicit offending-expression reporting. Commit: `96aadeeb22f7d78bf45256b7837f69de294c4b35`.
4. `.github/workflows/quality.yml`: uses current action majors (`checkout@v7`, `setup-node@v7`, `setup-python@v7`) while retaining Node 22 as the project runtime under test. Commit: `44290959303f9196084539db30ae573ab7998399`.
5. `.github/workflows/quality.yml`: removed unnecessary `setup-python` pip caching after a post-job cache-path failure; also enabled stale-run cancellation so superseded workflow runs do not waste CI capacity. Commit: `aec24437fc4e5652c0993ce94f1afbe4c76b1f5e`.
6. `src/components/data-table/DataTable.tsx`: removed `any` casts in table row rendering and unused pagination destructuring. Commit: `8cee387eb6bbe121efdb192be7ffd9b47381f718`.
7. `src/lib/file-engine/data-types.ts`: replaced `any` inputs with `unknown` and explicit type narrowing in data-type detection/cleaning. Commit: `cf470ddfe778e935b453a3a435b0f403ca458f6b`.
8. Earlier batch work hardened migration-aware tenant-security detection, canonical query boundaries, direct-write/import transaction semantics and CI parallel discovery. No duplicate engines/guards were introduced.

## Current CI
- The last inspected completed wave had **43/43 application/contract gates successful**; its only red result was a post-job `setup-python` cache failure. This is now addressed in `aec24437fc4e5652c0993ce94f1afbe4c76b1f5e`.
- The current `quality.yml` has stale-run cancellation enabled (`cancel-in-progress: true`) so superseded runs do not consume capacity while preserving complete verification for the latest commit.
- Do not treat a commit as PASS until its complete workflow job concludes.

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
- Tenant legacy/static/client-selected consumer scan: **PASS**.
- Adversarial tenant source boundary: **PASS**.
- Global tenant RLS, import RPC tenant context and business-key contracts: **PASS** in the last completed wave.
- Import transaction/runtime governance: **PASS** in the last completed wave.
- Migration schema audit: **PASS**, 52 migrations inspected with no findings.
- KPI presentation truth: **PASS**; missing authoritative values remain fail-closed rather than fabricated.
- Remaining live proof: real Supabase adversarial isolation, Storage/signed URLs, Realtime authorization, AI retrieval namespace isolation, restore/RPO-RTO, live Onyx/reconciliation, secrets and production rollback evidence.

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
**Engineering completion: ~82% (conservative).** This remains unchanged. No percentage increase is claimed for commits/guards alone. Production certification remains **NO** until LIVE runtime evidence closes the P0 matrix.
