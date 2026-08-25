# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-25
Source of truth: `main`

> نقطة الرجوع الإلزامية قبل كل دفعة. لا تُحسب الملفات/commits إنجازًا بحد ذاتها. نفصل implementation / gate / runtime / live certification.

## Mandatory execution rules
- افحص الفهرس والمستودع والعمل السابق قبل كل دفعة.
- Reuse/fix/consolidate قبل create؛ لا engines موازية.
- CI يعمل بالتوازي مع التدقيق والتنفيذ.
- Failure → root cause → fix → regression → rerun.
- لا mock business data ولا fake runtime evidence ولا defaults تخفي missing data/tenant/security constraints.
- AI ليس مصدر الحقيقة المالية/الرقمية.
- PASS لا يعني production-certified؛ LIVE evidence منفصل.

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

Remaining runtime proof: arbitrary/no-header/random/poor files, extraction completeness, cell lineage, golden corpus, live Onyx, live rollback/retry/reconciliation.

## KPI / BI truth
Required numeric/date fields fail closed; `INSUFFICIENT_DATA` is explicit; `activeCustomers=null` remains truthful because no authoritative active flag exists; aging does not substitute invoice date for missing due date.

Real mismatch fixed: `net_sales` definition/query drift (`total` vs canonical `subtotal`) in `3ac71a99a05e347d5708ac04cad1aa635c4d25c2`.

Missing customer/product/category labels no longer become fabricated business labels. `check-kpi-presentation-truth.mjs`: PASS.

New type-safe KPI presentation boundary added: `src/lib/dashboard-kpi-guards.ts`; Executive Command Center now refuses to render financial cards/actions when required values are missing instead of inventing defaults.

Remaining: cross-surface KPI equivalence, authoritative global date windows, cache freshness/invalidation, provenance in UI/export, drill-down E2E, live KPI evidence.

## Evidence → Decision → Outcome
Evidence-bound decision contracts and fail-closed policy exist. Canonical `DecisionScore` is reused. `decisionExplainability.ts` was aligned to the canonical score contract.

Remaining: live evidence graph, real outcomes, recommendation→outcome feedback, executive action loop, production-like optimizer scenarios.

## Lease / recovery
Durable jobs + lease + heartbeat + checkpoint + retry + terminal state + dead-letter exist. Runtime regression covers checkpoint monotonicity, source-snapshot-specific idempotency identity and fail-closed tenant/idempotency context.

LIVE REQUIRED: stuck-worker injection, lease expiry, dead-letter replay, backup restore/RPO-RTO, rollback/forward-fix, SLO timing.

## K→S closure truth
Shallow/deep K→S gates consume the historical roadmap plus `docs/IMPLEMENTATION_ROADMAP_PHASES-N-S.md`, actual canonical runtime API and P0 certification matrix. The nonexistent Phase M migration reference was corrected to `supabase/migrations/20260825150000_phase_m_certification_bundle.sql`; deep K→S gate passes.

## Latest CI truth
Primary verifier: `.github/workflows/quality.yml`.
- #1430 `32883083895`: through deep K→S passed; KPI presentation guard exposed fabricated labels and was fixed.
- #1444 `32884503475`: `npm ci` failed from package manifest/lock drift; fixed in `b4837539e6e4fa8b91ad9a550c7d8f131dcca920`.
- #1464 `32885447874`: npm install and all gates through A0 hardening passed; Typecheck exposed 20+ real source integration errors.
- #1466 `32885963464`: npm install, tenant/security, import, K/L/M, K→S, KPI and A0 gates all passed again; Typecheck still failed on the known source integration wave. No PASS claimed.

Latest Typecheck findings from #1466:
- `multifactor-demand-forecast.ts`: optional numeric input was not narrowed.
- `decisionExplainability.ts`: stale `DecisionScoreInput` import.
- `AnalyticsPage.tsx`: nullable date passed to `Date`.
- `ExecutiveCommandCenterPage.tsx`: nullable KPI values used as guaranteed numbers.

Fixes now committed after #1466:
- `6a4e9931436ae8c0018183c07740355b1b848251` — preserve optional demand semantics.
- `7a78aaeb8fcda6dd0ba888b45989a91810817728` — align decision explainability to canonical score.
- `bdda7e2ae53294c55ac4f4bb2084ff128da28a34` — add explicit complete-KPI narrowing guard.
- `043ef7a35993de18ba9f18ecd2a526cb8554b130` — gate Executive Command Center on complete KPI truth; no fabricated defaults.

A new Quality run was automatically queued from `6a4e993...`; it was observed running through Typecheck before the additional commits landed. Therefore its result is not used as proof for the later fixes; a newer run must certify them.

## P0 LIVE blockers
- [ ] adversarial tenant certification
- [ ] storage/signed URL verification
- [ ] Realtime authorization
- [ ] AI retrieval tenant isolation
- [ ] backup restore/RPO-RTO
- [ ] staging migration/schema drift
- [ ] environment parity
- [ ] signed artifact verification
- [ ] stuck-worker/dead-letter drill
- [ ] incident/SLO rollback/forward-fix
- [ ] security/secret audit
- [ ] stabilization telemetry
- [ ] final production certification

## P1 connected runtime
- [ ] Windows persistent native watcher
- [ ] Android native folder watcher
- [ ] iOS capability-aware integration
- [ ] live watched-folder coordinator
- [ ] real extraction checkpoints
- [ ] business-state snapshots from real outputs
- [ ] live executive evidence graph
- [ ] production-like bounded scenarios
- [ ] recommendation outcome feedback
- [ ] executive approval/action loop
- [ ] live drift/health canaries
- [ ] real rollback drills

## P1 Document Intelligence
- [ ] provider-neutral intermediate representation
- [ ] page/table classification
- [ ] headerless/reverse schema discovery
- [ ] extraction/provenance completeness
- [ ] cell lineage
- [ ] entity precision/recall evidence
- [ ] mathematical reconciliation
- [ ] confidence/quarantine/reprocessing UX
- [ ] golden Arabic/English/scanned/random/no-header/merged/multi-table/poor-quality corpus

## P2 UX / predictive
- [ ] Command Palette
- [ ] saved views/filter/group persistence
- [ ] executive cockpit drill-down→evidence→action E2E
- [ ] deterministic what-if/scenario engine
- [ ] cross-filter/drill-down production proof
- [ ] connected evidence workspace
- [ ] low-bandwidth/mobile proof
- [ ] forecast backtesting/minimum-data UX
- [ ] closed-loop forecast quality
- [ ] provider failure/fallback E2E
- [ ] live AI retrieval canary
- [ ] evidence-grounded Ask→Inspect→Act E2E

## Truth-weighted progress
**~82% engineering completion remains the conservative verified figure.** Implementation coverage is ~90%+, contract/gate maturity is high, integrated runtime is advanced but partial, and live certification remains incomplete. Recent commits are hardening and integration work; they do not automatically increase the percentage.

Production certified: **NO** until P0 live evidence closes.

## Execution loop
At the start/end of every batch: read this index → scan the repository → run CI in parallel → fix every independent root-cause gap that is safe to close → add/strengthen guard → commit → let CI re-run → continue to the next deeper gap without waiting.
