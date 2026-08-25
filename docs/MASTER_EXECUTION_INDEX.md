# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-25
Source of truth: `main`

> نقطة الرجوع الإلزامية قبل كل دفعة. لا تُحسب الملفات/commits إنجازًا بحد ذاتها. الحالة تفصل implementation / gate / runtime / live certification.

## Rules
- افحص الفهرس ثم المستودع والعمل السابق.
- Reuse/fix/consolidate قبل create؛ لا engines موازية.
- CI يعمل بالتوازي مع التدقيق.
- Failure → root cause → fix → regression → rerun.
- لا mock business data ولا fake runtime evidence ولا defaults تخفي missing data/tenant/security constraints.
- AI ليس مصدر الحقيقة المالية/الرقمية.

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

## Tenant / security
Repository-wide proactive searches covered `COMPANY_ID`, static tenant IDs, tenant fallbacks, `company_id`, `tenant_memberships`, client-selected tenant filtering, direct Supabase reads/writes and RPC callers.

Current static truth: tenant legacy consumer guard PASS; adversarial tenant source-boundary guard PASS; no remaining verified browser-storage/query-string/static/client-selected tenant source in executable application paths; tenant is database/RLS/current-company authoritative; bulk writes remain governed by transaction/RPC. The adversarial guard is now part of Quality. fileciteturn167file0L2-L2

The canonical import atomic wrapper verifies `p_company_id` against `current_company_id()` inside the database before invoking entity RPCs. fileciteturn172file0L2-L2

LIVE REQUIRED: adversarial Supabase tenant isolation, storage/signed URLs, Realtime authorization, AI retrieval namespace isolation, secrets audit.

## Data/import truth chain
`File → Parse → Map → Validate → Tenant → Canonical → RPC → Persistence → Reconciliation → Audit → Evidence`

Foundation is implemented and gated: multi-format contracts, Arabic/English mapping, normalization, business-key matching, preview/approval, quarantine, provenance/lineage, governed RPC writes, Onyx adapter, watched-folder queue, chunk atomicity, tenant mismatch rejection, duplicate protection and deletion reconciliation.

Remaining runtime proof: arbitrary/no-header/random/poor files, page/table classification, extraction completeness, cell lineage, golden corpus, live Onyx, live rollback/retry/reconciliation.

## KPI / BI truth
Required numeric/date fields fail closed and `INSUFFICIENT_DATA` is explicit. `activeCustomers=null` because schema has no authoritative active flag. Aging does not substitute invoice date for missing due date.

The 3/6/12-month dashboard selector controls the trend only; other executive KPIs are all-source aggregates and must not be described as date-filtered until a global date-window contract exists.

Audit chain: `KPI Definition → Source → Formula → Query → Service → Dashboard → Report → Export`.

Known Q-phase GAP: dashboard query presentation still contains fallbacks for missing customer/product/category names. This is not treated as closed; missing business data must remain visibly missing or be represented by a canonical identifier, never by fabricated business meaning.

Remaining: cross-surface equivalence, authoritative date windows, cache freshness/invalidation, provenance in UI/export, large-table/drill-down E2E, and removal/replacement of misleading presentation fallbacks.

## Evidence / decision / outcome
Evidence-bound decision contracts exist and fail closed on missing risk/liquidity/service-level constraints.
Remaining: live evidence graph, real outcomes, recommendation→outcome feedback, executive action loop, production-like optimizer scenarios.

## Lease / recovery
Durable jobs + lease + heartbeat + checkpoint + retry + terminal state + dead-letter exist. Runtime regression now covers checkpoint monotonicity, source-snapshot-specific idempotency identity and fail-closed tenant/idempotency context; it passed in Quality #1419. fileciteturn185file0L2-L2
LIVE REQUIRED: stuck-worker injection, lease expiry, dead-letter replay, backup restore/RPO-RTO, rollback/forward-fix, SLO timing.

## K→S closure truth
The shallow and deep K→S gates now consume the historical roadmap plus `docs/IMPLEMENTATION_ROADMAP_PHASES_N-S.md`. The deep gate was aligned to the actual canonical `PhaseKLSupabaseRuntime` API (`recordHealth`, `recordEvidenceEdge`, `autonomyGate`) and then aligned to the canonical `P0_RUNTIME_CERTIFICATION_MATRIX.md` for blockers instead of relying on invented blocker strings. fileciteturn209file0L2-L2 fileciteturn218file0L2-L2

## CI truth / latest execution
Primary verifier: `.github/workflows/quality.yml`.
- #1413 `32882131338`: K→S roadmap phase drift → fixed with N–S addendum.
- #1419 `32882629799`: tenant/adversarial gates PASS; worker recovery PASS; deep K→S exposed canonical API naming drift → fixed.
- #1424 `32882733990`: tenant/adversarial/import/worker/K-L-M/shallow K-S all PASS; deep K-S then exposed that blocker assertions were incorrectly tied to exact roadmap wording (`raw-file`) rather than the canonical P0 matrix. Root cause fixed in `4084fd0427bff40a3cfbe3efa29e354ba8fce1af`.
- A new Quality run is triggered from the current batch; no PASS is claimed until it completes against the latest source.

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

## P2 UX/predictive
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
**~82% engineering completion remains the conservative verified figure.** This is not production certification. Broad implementation coverage is ~90%+, contract/gate maturity is high, while integrated runtime/live certification remains partial. The latest batch closes integration drift but adds no live evidence, so the percentage is not inflated.

Production certified: **NO** until P0 live evidence closes.

## Mandatory loop
1. Read this index.
2. Search the requested surface repository-wide.
3. Fix all independent safe root causes.
4. Add/update regression guards.
5. Commit.
6. CI runs while the next independent audit continues.
7. PASS → deepest next GAP; FAIL → root cause → fix → rerun.
8. Update this index after every meaningful batch.

## Current batch commits
- `7d5f266b997eb061acaa584052ee4a90c509b470` — strip-only compatible durable worker adapter.
- `2ebd3ff530b1646d930ad041c9d4879ba4b11a8c` — N–S roadmap execution addendum.
- `176e0047d9e5731bd3ee853da06e0c2cbf9b19ad` — K→S shallow gate roadmap/addendum alignment.
- `69b8cf318263ccb581bfe8766affd2b7bddc9d9d` — resumable execution recovery/idempotency regression hardening.
- `46669a4cd5b8fc7f981ded084c7465144e7b9739` — adversarial tenant source-boundary guard.
- `bdf6c74ee5296c72ce6df86cebdf3035c18d8a24` — Quality wiring for adversarial tenant guard.
- `02701c7947eae646ee8bba7557d4a1b2ca8aca02` — deep K–S roadmap alignment.
- `1c669f16c2c40bd6c04101413ad8cd01de45e65b1` — deep K–S canonical Supabase API alignment.
- `4084fd0427bff40a3cfbe3efa29e354ba8fce1af` — deep K–S blockers bound to canonical P0 matrix.

**No production PASS is claimed. LIVE REQUIRED remains explicit.**