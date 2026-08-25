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

## Current truth
The latest inspected wave (#1464) passed install, tenant, adversarial tenant, data quality, migration, core, production-contract, resilience, governance, watched-folder, K/L/M, deep K→S, KPI-truth, A0 intelligence, Typecheck and behavioral regressions. It then failed at Routing/Security because `quality.yml` invoked the existing `scripts/check-import-direct-write-guard.mjs` through a missing npm script alias. This was an integration wiring defect, not a missing guard. The alias was restored in `ccd9f5b87d042d952aeea4cc2e8852f753040310`. A fresh CI verification is required before declaring the workflow green.

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

Current CI direct-write governance is correctly wired to the existing `scripts/check-import-direct-write-guard.mjs`; the npm alias was restored in `ccd9f5b87d042d952aeea4cc2e8852f753040310`. No duplicate guard was created.

Remaining runtime proof: arbitrary/no-header/random/poor files, extraction completeness, cell lineage, golden corpus, live Onyx, live rollback/retry/reconciliation.

## KPI / BI truth
Required numeric/date fields fail closed; `INSUFFICIENT_DATA` is explicit; `activeCustomers=null` remains truthful because no authoritative active flag exists; missing aging due dates are now skipped rather than silently substituting invoice dates.

Real mismatch fixed: `net_sales` definition/query drift (`total` vs canonical `subtotal`) in `3ac71a99a05e347d5708ac04cad1aa635c4d25c2`.

Missing customer/product/category labels no longer become fabricated business labels. `check-kpi-presentation-truth.mjs`: PASS.

Type-safe KPI presentation boundary: `src/lib/dashboard-kpi-guards.ts`; Executive Command Center now snapshots complete KPI truth before arithmetic/rendering, and refuses to render financial cards/actions when required values are missing.

Remaining: cross-dashboard/report/export equivalence, authoritative date-window contract, cache freshness, provenance continuity and live KPI evidence.

## Current CI / next execution
- Last inspected failure: #1464 / `32885447874`, Routing/Security at missing npm alias.
- Root fix committed: `ccd9f5b87d042d952aeea4cc2e8852f753040310`.
- CI workflow now explicitly invokes the canonical direct-write guard and continues to the downstream RLS/RPC/business-key/lint/build/runtime gates once that boundary passes.
- Next mandatory loop: fresh CI → Routing/Security → Global Tenant RLS → Import RPC tenant context → Import business key → Lint → Build → Performance → Intelligence runtime → Document intelligence → Report truth → Production readiness → Full resilience.
- Parallel P0 work remains LIVE REQUIRED where real Supabase/production evidence is indispensable: adversarial tenant isolation, Storage/signed URLs, Realtime authorization, AI tenant isolation, restore/RPO-RTO, artifact verification, failure/dead-letter drills, secrets/security audit, SLO/rollback and production certification.
- Parallel P1 work remains: Windows persistent watcher, Android watcher, iOS capability integration, live folder coordinator, live document corpus, evidence graph, outcome feedback and executive action loop.

## Completion truth
**Engineering completion: ~82% (conservative).** This is not production readiness. No percentage increase is claimed for commits/guards alone. Production certification remains **NO** until LIVE runtime evidence closes the P0 matrix.
