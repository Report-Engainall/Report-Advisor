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

A single canonical cross-platform capability contract was added to `src/lib/import-pipeline/folder-watch-contract.ts` with explicit truth for Web/PWA/Windows/Android/iOS. It does not create a second ingestion engine; every adapter emits the same `WatchEvent` into the same queue/pipeline.
- Web/PWA: File System Access where available; active-session monitoring only; no false background promise after app close.
- Windows: persistent background watch is a capability requiring a native host adapter; contract is explicit and CI-gated.
- Android: native directory permission/watcher is required; contract is explicit and CI-gated.
- iOS: capability-aware integration; arbitrary persistent background folder watching is explicitly not claimed.
- Browser runtime now has canonical `selectWatchedFolder()` and `ensureFolderPermission()` boundaries in `folder-watch-service.ts`.

Hardening completed: weak-fingerprint fail-closed behavior; duplicate stable-row rejection; disappeared-file reconciliation; watched-folder configuration validation.

## Tenant / security truth
Repository-wide proactive searches covered `COMPANY_ID`, static tenant IDs, tenant fallbacks, `company_id`, `tenant_memberships`, client-selected tenant filtering, direct Supabase reads/writes and RPC callers.

Current static truth: tenant legacy consumer guard PASS; adversarial tenant source-boundary guard PASS; `src/lib/supabase.ts` resolves tenant only through authenticated `current_company_id()` RPC; legacy `COMPANY_ID` import in `file-engine/synonyms.ts` was removed in commit `95f4c06631c0ed1d15f86be57768d69d95a5fcd6`. Remaining `company_id` occurrences in types/schema/authorized result shapes are not themselves tenant selectors.

Canonical import atomic wrapper verifies `p_company_id` against `current_company_id()` inside the database before invoking entity RPCs.

LIVE REQUIRED: adversarial Supabase tenant isolation, storage/signed URLs, Realtime authorization, AI retrieval namespace isolation, secrets audit.

## Data / Import truth chain
`File → Parse → Map → Validate → Tenant → Canonical → RPC → Persistence → Reconciliation → Audit → Evidence`

Foundation is implemented and gated: multi-format contracts, Arabic/English mapping, normalization, business-key matching, preview/approval, quarantine, provenance/lineage, governed RPC writes, Onyx adapter, watched-folder queue, chunk atomicity, tenant mismatch rejection, duplicate protection and deletion reconciliation.

Additional hardening closed: duplicate stable-row fail-closed behavior, source-snapshot-specific idempotency, checkpoint monotonicity, vanished-file reconciliation, watched-folder configuration validation, canonical Phase M certification migration binding in deep K→S, and duplicate header synonym removal.

A real package-toolchain drift was also found: `package.json` had lost its dependency declarations while `package-lock.json` retained them. The manifest was restored from the lock's root dependency graph. A temporary attempt to add Vitest was rejected by `npm ci` because it was not present in the lock and was removed; no dependency is accepted unless manifest and lock agree.

Remaining runtime proof: arbitrary/no-header/random/poor files, page/table classification, extraction completeness, cell lineage, golden corpus, live Onyx, live rollback/retry/reconciliation.

## KPI / BI truth
Required numeric/date fields fail closed and `INSUFFICIENT_DATA` is explicit. `activeCustomers=null` because schema has no authoritative active flag. Aging does not substitute invoice date for missing due date.

The 3/6/12-month selector controls the trend only; other executive KPIs remain all-source aggregates until a global date-window contract exists.

A real KPI mismatch was found proactively: `net_sales` semantic definition declared `SUM(sales_invoices.total)` while the canonical dashboard query used `sales_invoices.subtotal`. Root cause was definition/query drift. The existing dashboard source was treated as canonical and the semantic definition was aligned to `SUM(sales_invoices.subtotal)` in commit `3ac71a99a05e347d5708ac04cad1aa635c4d25c2`.

A separate presentation truth gap was found and fixed: missing customer/product/category labels no longer become fabricated business labels; they use canonical identifiers instead. Guard: `scripts/check-kpi-presentation-truth.mjs`.

Remaining: cross-surface KPI equivalence, authoritative global date windows, cache freshness/invalidation, provenance in UI/export, large-table/drill-down E2E, and live KPI evidence.

## Evidence → Decision → Outcome
Evidence-bound decision contracts exist and fail closed on missing risk/liquidity/service-level constraints.
Remaining: live evidence graph, real outcomes, recommendation→outcome feedback, executive action loop, production-like optimizer scenarios.

## Lease / recovery
Durable jobs + lease + heartbeat + checkpoint + retry + terminal state + dead-letter exist. Runtime regression covers checkpoint monotonicity, source-snapshot-specific idempotency identity and fail-closed tenant/idempotency context; Quality has passed these runtime checks.

LIVE REQUIRED: stuck-worker injection, lease expiry, dead-letter replay, backup restore/RPO-RTO, rollback/forward-fix, SLO timing.

## K→S closure truth
The shallow and deep K→S gates consume the historical roadmap plus `docs/IMPLEMENTATION_ROADMAP_PHASES-N-S.md`. Deep closure is aligned to the actual canonical `PhaseKLSupabaseRuntime` API (`recordHealth`, `recordEvidenceEdge`, `autonomyGate`) and the canonical `P0_RUNTIME_CERTIFICATION_MATRIX.md`.

Deep K→S previously referenced a nonexistent Phase M migration. This was corrected to the actual `supabase/migrations/20260825150000_phase_m_certification_bundle.sql`; the corrected deep gate passed in Quality.

## CI truth / latest execution
Primary verifier: `.github/workflows/quality.yml`.
- #1430 `32883083895`: all gates through deep K→S passed; KPI presentation guard exposed three old fabricated labels → fixed in `db25d19998afbb0af25eff51562929dcfe0dffe7`.
- #1433 `32883300321`: all gates through A0 intelligence hardening passed; TypeScript compatibility exposed obsolete `baseUrl`/path resolution options → fixed in `fbcec9127d717ca32ef9dd556b64576d3edbe389`.
- #1438 `32884119666`: cross-platform watcher contract/guard work was queued.
- #1439 `32884139783`: subsequent Quality execution exposed deeper repository/toolchain issues while the cross-platform work was being integrated; no PASS claimed.
- #1444 `32884503475`: failed immediately at `npm ci` because the package manifest and lockfile were out of sync. Root cause was twofold: the manifest had previously lost its dependency declarations, and a temporary Vitest declaration was not represented in the lock. The Vitest declaration was removed and the manifest was restored to the lock's dependency graph in `b4837539e6e4fa8b91ad9a550c7d8f131dcca920`.

No PASS is claimed for the post-fix commit until a new CI run consumes it.

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
**~82% engineering completion remains the conservative verified figure.** Broad implementation coverage is ~90%+, contract/gate maturity is high, while integrated runtime/live certification remains partial. The recent batch closed tenant consumer drift, browser folder selection/permission wiring, duplicate header mapping, and package manifest drift, but these are engineering hardening—not live production evidence—so the percentage is intentionally not inflated.

Production certified: **NO** until P0 live evidence closes.

## Current batch commits
- `95f4c06631c0ed1d15f86be57768d69d95a5fcd6` — remove legacy `COMPANY_ID` from synonym writes.
- `94bc0e58e8dbb470eee992f201fe993a5146ff2` — remove duplicate header synonym key.
- `c070108efd242edb89563b2858c9ad163733c535` — restore browser folder selection and permission boundary.
- `c9574b9399e952f7cc5b69c6b1e13f1742c4b2aa` — restore package manifest dependency declarations (superseded by lock-alignment correction).
- `b4837539e6e4fa8b91ad9a550c7d8f131dcca920` — align package manifest with the locked dependency graph.

**No production PASS is claimed. LIVE REQUIRED remains explicit.**