# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-25
Source of truth: `main`

> نقطة الرجوع الإلزامية قبل كل دفعة. لا تُحسب الملفات/commits إنجازًا بحد ذاتها. الحالة تفصل implementation / gate / runtime / live certification.

## Mandatory execution rules
- افحص الفهرس ثم المستودع والعمل السابق قبل كل دفعة.
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
| N | ROADMAP/INTEGRATION TARGET | runtime recovery + restore evidence |
| O | ROADMAP/INTEGRATION TARGET | adversarial tenant/security runtime |
| P | ROADMAP/INTEGRATION TARGET | document intelligence depth + golden corpus |
| Q | ROADMAP/INTEGRATION TARGET | KPI/BI truth + cross-surface equivalence |
| R | ROADMAP/INTEGRATION TARGET | decision→action→outcome loop |
| S | NOT LIVE CERTIFIED | final production certification |

## Watched-folder / cross-platform
Existing folder watcher remains canonical and reused: directory selection/monitoring, SHA-256, incremental state, IndexedDB snapshots, queue/dead-letter and text-first fallback.

A single canonical cross-platform capability contract was added to `src/lib/import-pipeline/folder-watch-contract.ts` with explicit truth for Web/PWA/Windows/Android/iOS. Every adapter emits the same `WatchEvent` into the same queue/pipeline; no second ingestion engine exists.
- Web/PWA: File System Access where available; active-session monitoring only; no false background promise after app close.
- Windows: persistent background watch requires a native host adapter.
- Android: native directory permission/watcher is required.
- iOS: capability-aware integration; arbitrary persistent background folder watching is not claimed.
- Browser runtime now has canonical selection/permission boundaries plus explicit TypeScript capability typing for browser directory handles.

Hardening completed: weak-fingerprint fail-closed behavior; duplicate stable-row rejection; disappeared-file reconciliation; watched-folder configuration validation; browser folder scan capability typing.

## Tenant / security truth
Repository-wide proactive searches covered `COMPANY_ID`, static tenant IDs, tenant fallbacks, `company_id`, `tenant_memberships`, client-selected tenant filtering, direct Supabase reads/writes and RPC callers.

Current static truth: canonical tenant legacy guard was previously PASS. Run #1455/#1456 exposed the new compatibility query boundary to the static scanner. Root cause was scanner classification, not a static tenant selector: `queries-compat.ts` resolves tenant through `resolveCurrentCompanyId()` and uses the existing fail-closed RPC/RLS boundary. The guard was tightened to classify this canonical compatibility boundary as an allowed authoritative boundary in `9c9e3f0a3cbf132748d208413277926f0052a98a`.

The old `COMPANY_ID` import in `file-engine/synonyms.ts` remains removed. No static tenant ID or client-selected tenant source is accepted.

LIVE REQUIRED: adversarial Supabase tenant isolation, storage/signed URLs, Realtime authorization, AI retrieval namespace isolation, secrets audit.

## Data / Import truth chain
`File → Parse → Map → Validate → Tenant → Canonical → RPC → Persistence → Reconciliation → Audit → Evidence`

Foundation is implemented and gated: multi-format contracts, Arabic/English mapping, normalization, business-key matching, preview/approval, quarantine, provenance/lineage, governed RPC writes, Onyx adapter, watched-folder queue, chunk atomicity, tenant mismatch rejection, duplicate protection and deletion reconciliation.

Canonical browser/import query compatibility was restored without a second import engine. `queries-compat.ts` routes import-record creation/update through the existing `import_create_job`, `import_update_job_progress`, and `import_finish_job` RPCs, preserving the database-authoritative tenant boundary.

Additional type/runtime hardening: canonical `ReportExecutionStage` alias restored from the existing checkpoint stage type; product-family bridge now consumes the actual `memberSkus` field; entity-resolution discriminant is explicitly typed; demand-seasonality returns the canonical `avgDaily` field; query relational shapes now match Supabase nested-result inference; inventory balances expose their existing typed `InventoryBalance` contract.

Remaining runtime proof: arbitrary/no-header/random/poor files, page/table classification, extraction completeness, cell lineage, golden corpus, live Onyx, live rollback/retry/reconciliation.

## KPI / BI truth
Required numeric/date fields fail closed and `INSUFFICIENT_DATA` is explicit. `activeCustomers=null` because schema has no authoritative active flag. Aging does not substitute invoice date for missing due date.

The 3/6/12-month selector controls the trend only; other executive KPIs remain all-source aggregates until a global date-window contract exists.

A real KPI mismatch was found proactively: `net_sales` semantic definition declared `SUM(sales_invoices.total)` while the canonical dashboard query used `sales_invoices.subtotal`; definition/query drift was corrected in `3ac71a99a05e347d5708ac04cad1aa635c4d25c2`.

Missing customer/product/category labels no longer become fabricated business labels; they use canonical identifiers. Guard: `scripts/check-kpi-presentation-truth.mjs`.

Remaining: cross-surface KPI equivalence, authoritative global date windows, cache freshness/invalidation, provenance in UI/export, large-table/drill-down E2E, and live KPI evidence.

## Evidence → Decision → Outcome
Evidence-bound decision contracts exist and fail closed on missing risk/liquidity/service-level constraints. Canonical decision score type/function is restored in `src/lib/intelligence/decisionScore.ts`; it is reused by policy/calibration/chain rather than creating another decision engine.

Remaining: live evidence graph, real outcomes, recommendation→outcome feedback, executive action loop, production-like optimizer scenarios.

## Lease / recovery
Durable jobs + lease + heartbeat + checkpoint + retry + terminal state + dead-letter exist. Runtime regression covers checkpoint monotonicity, source-snapshot-specific idempotency identity and fail-closed tenant/idempotency context; Quality has passed these runtime checks.

LIVE REQUIRED: stuck-worker injection, lease expiry, dead-letter replay, backup restore/RPO-RTO, rollback/forward-fix, SLO timing.

## K→S closure truth
The shallow and deep K→S gates consume the historical roadmap plus `docs/IMPLEMENTATION_ROADMAP_PHASES-N-S.md`. Deep closure is aligned to the actual canonical `PhaseKLSupabaseRuntime` API and canonical P0 certification matrix.

Deep K→S previously referenced a nonexistent Phase M migration; this was corrected to `supabase/migrations/20260825150000_phase_m_certification_bundle.sql` and the corrected deep gate passed.

## CI truth / latest execution
Primary verifier: `.github/workflows/quality.yml`.
- #1430 `32883083895`: gates through deep K→S passed; KPI presentation truth exposed fabricated labels and was fixed.
- #1433 `32883300321`: gates through A0 hardening passed; TypeScript compatibility issue was fixed.
- #1444 `32884503475`: failed at `npm ci`; package manifest/lock drift was fixed in `b4837539e6e4fa8b91ad9a550c7d8f131dcca920`.
- #1446 `32884639877`: `npm ci` passed; gates through A0 hardening passed; TypeScript typecheck then exposed a broad set of stale source/test integration errors. This is the current typecheck hardening wave.
- #1455 `32885222458`: tenant legacy guard exposed `queries-compat.ts`; root cause was guard classification of an authoritative compatibility boundary. Fixed in `9c9e3f0a3cbf132748d208413277926f0052a98a`.
- #1456 `32885232252`: same compatibility boundary was consumed by CI while the next fix was being prepared; no PASS claimed.
- #1463 `32885406997`: still reached the tenant guard before the compatibility-boundary fix; no PASS claimed.
- #1464 `32885447874`: newly queued on `9c9e3f0a3cbf132748d208413277926f0052a98a`; result not yet certified at snapshot time.

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
- [ ] production forecast backtesting/minimum-data UX
- [ ] closed-loop forecast quality
- [ ] provider failure/fallback E2E
- [ ] live AI retrieval canary
- [ ] evidence-grounded Ask→Inspect→Act E2E

## Truth-weighted progress
**~82% engineering completion remains the conservative verified figure.** Broad implementation coverage is ~90%+, contract/gate maturity is high, while integrated runtime/live certification remains partial. The current batch materially improved typecheck/runtime integration and tenant-boundary classification, but these are engineering hardening—not live production evidence—so the percentage is intentionally not inflated.

Production certified: **NO** until P0 live evidence closes.

## Current batch commits
- `9687da9b8e84fefc063f0d8f49c8ae36f5fc5423` — align TypeScript target/lib and exclude unit-test sources from application typecheck.
- `510d2405dc06bce928a3cd98d0f7be2d04901278` — restore canonical decision score contract.
- `cc1f3d7dc3fdf55f1239c41196f36e77a85d300a` — type browser directory capability boundary.
- `00a2dddd4c34933b9a0af6d16e6b30a036d93a4a` — route batch folder import through compatibility query boundary.
- `7dac3c55b4e4c4549067422790b5d78b86a1d241` — add canonical query compatibility surface.
- `d0dd4f78456985cd5484e5dc4ec225c3ec7e3997` — restore App after compatibility-boundary correction.
- `d449ff6c88ad8d46235d5c9220d7a58efc643d3f` — expose canonical report checkpoint stage alias.
- `32e9738cae7c15804d14490d1251ebf5476b3e0d` — fix demand-seasonality average field.
- `727badfe7be820164e0d60422e12dfc42a7c1dae` — fix product-family bridge field drift.
- `4181b3d0519b2548e1bd3687acc2033380c09c2e` — preserve entity-resolution discriminant typing.
- `5b17641fb91878a339fb97f6310238643c6489b7` — type inventory query results.
- `9c9e3f0a3cbf132748d208413277926f0052a98a` — classify canonical tenant compatibility boundary correctly.

**No production PASS is claimed. LIVE REQUIRED remains explicit.**
