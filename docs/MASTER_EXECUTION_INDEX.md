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
Latest CI waves are now being used as a batch-discovery loop rather than a serial first-failure loop. Routing/Security runs the independent navigation, direct-write, import-transaction, import-governance and tenant-security checks together; downstream gates are configured to continue collecting independent failures. The latest push-triggered runs are #1493 (`f21277a7311c463b75bf0089f5d5729e639588ef`) and #1494 (`5db499535667b0b25b8a4a7aa8caf9a8edf2556f`), both in progress at this snapshot.

## Latest batch fixes
1. `src/lib/free-toolbox/batch-decision-engine.ts`: bounded risk percentages are now clamped to `[0,100]` before `finitePercent`; valid high-coverage rows no longer fail because a mathematically negative risk was passed to a non-negative validator. Commit: `f21277a7311c463b75bf0089f5d5729e639588ef`.
2. `services/document-intelligence/tests/test_intermediate_model_contract.py`: aligned the contract test import with the CI's `PYTHONPATH=services/document-intelligence` module boundary (`from app...`), eliminating the `services.document_intelligence` namespace mismatch. Commit: `5db499535667b0b25b8a4a7aa8caf9a8edf2556f`.
3. Earlier batch work already hardened migration-aware tenant-security detection, canonical query boundaries, direct-write/import transaction semantics and CI parallel discovery. These are retained; no duplicate engines/guards were introduced.
4. Report/analytics truth remains under active scan. Any `Number(... || 0)` / `parseFloat(... || 0)` in report/dashboard/analytics surfaces is treated as a candidate for semantic replacement, not silenced in the guard.

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

## Batch execution strategy
The execution unit is now a **failure family**, not a single Run failure:
- Tenant family: `COMPANY_ID`, static IDs, fallbacks, client tenant selection, direct Supabase, RPC callers.
- Import family: parse/map/validate/tenant/canonical/RPC/persistence/idempotency/race/retry/reconciliation/lineage/evidence.
- Truth family: KPI numeric/date coercion, missing→zero, source authority, date windows, cache freshness, provenance.
- Runtime family: evidence/quality/confidence/decision/recommendation/outcome and lease/heartbeat/checkpoint/retry/dead-letter/recovery.
- CI family: stale script aliases, false-negative guards, environment/module-path drift, direct-write wiring, parallel gate coverage.

## Watched-folder / cross-platform
Canonical existing watcher reused: directory selection/monitoring, SHA-256, incremental state, IndexedDB snapshots, queue/dead-letter and text-first fallback.

Single cross-platform contract: `src/lib/import-pipeline/folder-watch-contract.ts`.
- Web/PWA: active-session File System Access where supported; no false background promise after app close.
- Windows: persistent background watch requires native host adapter.
- Android: native directory permission/watcher required.
- iOS: capability-aware; arbitrary persistent background folder watching is not claimed.
- All adapters emit the same `WatchEvent` into the same queue/import pipeline.

Hardening: weak-fingerprint fail-closed behavior; duplicate stable-row rejection; disappeared-file reconciliation; watched-folder configuration validation; browser directory capability typing.

## Tenant / security truth
Proactive searches covered `COMPANY_ID`, static tenant IDs, tenant fallbacks, `company_id`, `tenant_memberships`, client-selected tenant filtering, direct Supabase reads/writes and RPC callers.

Current guard: **PASS**. The `file-engine/synonyms.ts` legacy `COMPANY_ID` consumer was removed. The compatibility query boundary is allowed only because it resolves through `resolveCurrentCompanyId()` and the canonical fail-closed RPC/RLS boundary. Adversarial tenant source-boundary guard: **PASS**.

LIVE REQUIRED: real Supabase adversarial isolation, storage/signed URLs, Realtime authorization, AI retrieval namespace isolation, secrets audit.

## Data / Import truth chain
`File → Parse → Map → Validate → Tenant → Canonical → RPC → Persistence → Reconciliation → Audit → Evidence`

Foundation/gates cover multi-format mapping, Arabic/English normalization, business-key matching, preview/approval, quarantine, provenance/lineage, governed RPC writes, Onyx adapter, watched-folder queue, chunk atomicity, tenant mismatch rejection, duplicate protection and deletion reconciliation.

Compatibility import reads/writes route through existing RPCs; no second import engine exists. Canonical report checkpoint stage, product-family `memberSkus`, entity-resolution discriminant, demand `avgDaily`, nested Supabase shapes and typed inventory balances were hardened.

Current CI direct-write governance is correctly wired to the existing `scripts/check-import-direct-write-guard.mjs`; no duplicate guard was created.

Remaining runtime proof: arbitrary/no-header/random/poor files, extraction completeness, cell lineage, golden corpus, live Onyx, live rollback/retry/reconciliation.

## KPI / BI truth
Required numeric/date fields fail closed; `INSUFFICIENT_DATA` is explicit; `activeCustomers=null` remains truthful because no authoritative active flag exists; missing aging due dates are now skipped rather than silently substituting invoice dates.

Real mismatch fixed: `net_sales` definition/query drift (`total` vs canonical `subtotal`) in `3ac71a99a05e347d5708ac04cad1aa635c4d25c2`.

Missing customer/product/category labels no longer become fabricated business labels. `check-kpi-presentation-truth.mjs`: PASS.

Type-safe KPI presentation boundary: `src/lib/dashboard-kpi-guards.ts`; Executive Command Center snapshots complete KPI truth before arithmetic/rendering and refuses to render financial cards/actions when required values are missing.

Remaining: cross-dashboard/report/export equivalence, authoritative date-window contract, cache freshness, provenance continuity and live KPI evidence.

## Current CI / next execution
- Latest active verification: #1494 / `32889999353` (head `5db499535667b0b25b8a4a7aa8caf9a8edf2556f`), with #1493 / `32889986318` immediately preceding it; both were triggered by the batch fixes.
- Batch fixes intentionally target semantic root causes rather than weakening gates.
- Next mandatory loop: collect all Routing/Security + RLS + RPC + Business Key + Lint + Build + Performance + Intelligence + Document Runtime + Report Truth failures from the same wave, cluster them, and fix independent families together.
- Parallel P0 work remains LIVE REQUIRED where real Supabase/production evidence is indispensable: adversarial tenant isolation, Storage/signed URLs, Realtime authorization, AI tenant isolation, restore/RPO-RTO, artifact verification, failure/dead-letter drills, secrets/security audit, SLO/rollback and production certification.
- Parallel P1 work remains: Windows persistent watcher, Android watcher, iOS capability integration, live folder coordinator, live document corpus, evidence graph, outcome feedback and executive action loop.

## Completion truth
**Engineering completion: ~82% (conservative).** This is not production readiness. No percentage increase is claimed for commits/guards alone. Production certification remains **NO** until LIVE runtime evidence closes the P0 matrix.
