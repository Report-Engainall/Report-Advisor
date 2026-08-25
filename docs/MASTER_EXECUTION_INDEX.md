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
| 1–21 | COMPLETE FOUNDATION | dependency recheck |
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
Existing folder watcher is canonical and reused: directory selection/monitoring, SHA-256, incremental state, IndexedDB snapshots, queue/dead-letter and text-first fallback.
- Web/PWA: progressive File System Access; active-session monitoring only; no false background promise after app close.
- Windows: native persistent watcher adapter required.
- Android: native directory permission/watcher adapter required.
- iOS: capability-aware adapter; no false arbitrary-background promise.
- All adapters feed the same ingestion engine.

Hardening completed: weak-fingerprint fail-closed behavior; duplicate stable-row rejection; disappeared-file reconciliation; watched-folder configuration validation.

## Tenant / security truth
Repository-wide proactive searches covered `COMPANY_ID`, static tenant IDs, tenant fallbacks, `company_id`, `tenant_memberships`, client-selected tenant filtering, direct Supabase reads/writes and RPC callers.

Current static truth: tenant legacy consumer guard PASS; adversarial tenant source-boundary guard PASS; no remaining verified browser-storage/query-string/static/client-selected tenant source in executable application paths; tenant is database/RLS/current-company authoritative; bulk writes remain governed by transaction/RPC.

Canonical import atomic wrapper verifies `p_company_id` against `current_company_id()` inside the database before invoking entity RPCs.

LIVE REQUIRED: adversarial Supabase tenant isolation, storage/signed URLs, Realtime authorization, AI retrieval namespace isolation, secrets audit.

## Data / Import truth chain
`File → Parse → Map → Validate → Tenant → Canonical → RPC → Persistence → Reconciliation → Audit → Evidence`

Foundation is implemented and gated: multi-format contracts, Arabic/English mapping, normalization, business-key matching, preview/approval, quarantine, provenance/lineage, governed RPC writes, Onyx adapter, watched-folder queue, chunk atomicity, tenant mismatch rejection, duplicate protection and deletion reconciliation.

Additional hardening closed: duplicate stable-row fail-closed behavior, source-snapshot-specific idempotency, checkpoint monotonicity, vanished-file reconciliation, watched-folder configuration validation, and canonical Phase M certification migration binding in deep K→S.

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
The shallow and deep K→S gates consume the historical roadmap plus `docs/IMPLEMENTATION_ROADMAP_PHASES_N-S.md`. Deep closure is aligned to the actual canonical `PhaseKLSupabaseRuntime` API (`recordHealth`, `recordEvidenceEdge`, `autonomyGate`) and the canonical `P0_RUNTIME_CERTIFICATION_MATRIX.md`.

Deep K→S previously referenced a nonexistent Phase M migration. This was corrected to the actual `supabase/migrations/20260825150000_phase_m_certification_bundle.sql`; the corrected deep gate passed in Quality #1430.

## CI truth / latest execution
Primary verifier: `.github/workflows/quality.yml`.
- #1427 `32882832259`: stale Phase M migration path → fixed in `230943f8815f3e27ecf95055f546ab5ee826e251`.
- #1430 `32883083895`: all gates through deep K→S passed; KPI presentation guard then exposed three old fabricated labels → fixed in `db25d19998afbb0af25eff51562929dcfe0dffe7`.
- #1433 `32883300321`: all gates through A0 intelligence hardening passed; TypeScript 7 typecheck exposed obsolete `baseUrl`/path resolution options in `tsconfig.app.json`.
- #1435 `32884019503`: **currently running** against `fbcec9127d717ca32ef9dd556b64576d3edbe389`, which removes obsolete `baseUrl` and changes `@/*` to `./src/*`. No PASS claimed yet.

The latest completed failure was a tooling/configuration compatibility root cause, not a business-data failure: TypeScript reported `TS5102 baseUrl has been removed` and `TS5090 non-relative paths are not allowed`. This was fixed directly in the canonical `tsconfig.app.json` rather than weakening CI or pinning an older compiler.

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
**~82% engineering completion remains the conservative verified figure.** Broad implementation coverage is ~90%+, contract/gate maturity is high, while integrated runtime/live certification remains partial. The current batch closed real integration drift and tooling compatibility but did not add live production evidence, so the percentage is intentionally not inflated.

Production certified: **NO** until P0 live evidence closes.

## Current batch commits
- `230943f8815f3e27ecf95055f546ab5ee826e251` — deep K→S canonical Phase M migration binding.
- `5e9ee23bad46300c7d4f83e2c029f559251a3b8` — KPI presentation truth guard.
- `85973d4e8aeaa5dd34c15bf230bd51a47b21cf3c` — Quality KPI truth wiring.
- `db25d19998afbb0af25eff51562929dcfe0dffe7` — KPI missing-label root fix using canonical identifiers.
- `3ac71a99a05e347d5708ac04cad1aa635c4d25c2` — net-sales semantic definition aligned to canonical dashboard source.
- `fbcec9127d717ca32ef9dd556b64576d3edbe389` — TypeScript 7-compatible `tsconfig.app.json`.

**No production PASS is claimed. LIVE REQUIRED remains explicit.**