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

Latest hardening:
- weak fingerprint no longer skips unchanged on size+mtime alone; same source becomes `process_changed` when content hash is absent/different.
- duplicate stable row keys fail closed before reconciliation.
- watched-folder scans now reconcile disappeared files using snapshot listing and return `deletedFiles`/`deleted` state.
- watched-folder configuration has explicit validation for ID/path/interval/concurrency/extensions.

## Tenant / security
Repository-wide proactive searches covered `COMPANY_ID`, static tenant IDs, tenant fallbacks, `company_id`, `tenant_memberships`, client-selected tenant filtering, direct Supabase reads/writes and RPC callers.

Current static truth: tenant legacy consumer guard PASS; no remaining verified client `tenantId/tenant_id` filter outside guard/analysis paths; tenant is database/RLS/current-company authoritative; bulk writes remain governed by transaction/RPC.

The canonical import wrapper additionally verifies `p_company_id` against `current_company_id()` inside the database before invoking entity RPCs, so a client-selected tenant cannot override the database tenant context. fileciteturn172file0L2-L2

LIVE REQUIRED: adversarial Supabase tenant isolation, storage/signed URLs, Realtime authorization, AI retrieval namespace isolation, secrets audit.

## Data/import truth chain
`File → Parse → Map → Validate → Tenant → Canonical → RPC → Persistence → Reconciliation → Audit → Evidence`

Existing foundation: multi-format contracts, Arabic/English header mapping, normalization, business-key matching, preview/approval, quarantine, provenance/lineage, governed RPC writes, Onyx adapter, watched-folder queue.

Hardening completed: whole-chunk validation before writes, tenant mismatch rejection in the atomic RPC wrapper, stable business-key/duplicate protection, incremental ledger, explicit deletion reconciliation, and text-first fallback isolation.

Remaining runtime proof: arbitrary/no-header/random/poor files, page/table classification, extraction completeness, cell lineage, golden corpus, live Onyx, live rollback/retry/reconciliation.

## KPI / BI truth
Required numeric/date fields fail closed and `INSUFFICIENT_DATA` is explicit. `activeCustomers=null` because schema has no authoritative active flag. Aging does not substitute invoice date for missing due date.

The 3/6/12-month dashboard selector currently controls the trend only; other executive KPIs are all-source aggregates and must not be described as date-filtered until a global date-window contract exists.

Audit chain: `KPI Definition → Source → Formula → Query → Service → Dashboard → Report → Export`.

Proactive source review found no separate KPI engine drift; however the dashboard query surface still contains presentation fallbacks for missing customer/product/category names and remains a Q-phase hardening target because missing business data must remain visibly missing rather than be relabeled as a fabricated business value.

Remaining: cross-surface equivalence, authoritative date windows, cache freshness/invalidation, provenance in UI/export, large-table/drill-down E2E, and removal/replacement of misleading presentation fallbacks.

## Evidence / decision / outcome
Evidence-bound decision contracts exist. Control-plane constraints are fail-closed; missing risk/liquidity/service-level constraints cannot become zero and evidence references remain mandatory.

Remaining: live evidence graph, real outcomes, recommendation→outcome feedback, executive action loop, production-like optimizer scenarios.

## Lease / recovery
Durable jobs + lease + heartbeat + checkpoint + retry + terminal state + dead-letter exist. Failure evidence preservation is hardened.

The resumable runtime regression now also asserts checkpoint monotonicity, source-snapshot-specific idempotency identity, and fail-closed rejection of empty tenant/idempotency context. The test passes in the next CI cycle when run against the current source.

LIVE REQUIRED: stuck-worker injection, lease expiry, dead-letter replay, backup restore/RPO-RTO, rollback/forward-fix, SLO timing.

## CI truth / latest execution
Primary verifier: `.github/workflows/quality.yml`.

- `32880785206`: stale npm aliases → fixed by invoking canonical scripts.
- `32881771230` (#1400): concurrency syntax contract failure → exact canonical syntax restored.
- `32881939671` (#1406): reached Autonomous Business Control Plane after all earlier gates passed; failure investigated as a real runtime-test issue.
- `32882008369` (#1408): reached the same control-plane stage; `phase-l-resumable-execution` exposed a real Node 22 strip-only compatibility defect in the durable worker adapter.
- `32882131338` (#1413): durable worker runtime now PASS; the next real failure was `k-to-s-closure` because the historical roadmap did not contain explicit Phase N–S entries.
- Root cause of #1413: `check-k-to-s-closure.mjs` required Phase K–S but `docs/IMPLEMENTATION_ROADMAP.md` ended before N–S.
- Fix: added authoritative `docs/IMPLEMENTATION_ROADMAP_PHASES_N-S.md` and changed the K→S gate to validate the historical roadmap plus the N–S execution addendum.

Notable #1413 gate evidence: tenant convergence PASS, tenant legacy boundary PASS, data-quality PASS, company config PASS, migration schema/dependency checks PASS, Quality workflow PASS, core contracts PASS, production certification contract PASS, resilience/release evidence PASS, continuous trust PASS, governance PASS, watched-folder foundation PASS, incremental ledger PASS, business control plane PASS, Phase K runtime PASS, Phase L runtime PASS, resumable execution PASS, Phase M certification PASS. The failure was documentation/closure contract drift at K→S, not worker runtime.

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
**~82% engineering completion remains the conservative verified figure.** This is not production certification. Broad implementation coverage is ~90%+, contract/gate maturity is high, while integrated runtime/live certification remains partial. The latest CI batch closed additional runtime/roadmap drift but did not produce live evidence, so the percentage is not inflated.

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
- `22eca8b1ffa488874c1d9c9482ab7d8dbab0bd43` — weak fingerprint + duplicate row fail-closed.
- `68e4b1efe03721ba8cb31de29bb56db06e115c0d` — incremental regression suite.
- `1e7a771ccf604e1f47071e86f2ffedfbe8cbc1fe` — explicit deleted state.
- `a6f9f6784d8d060938f2a2d1b91d67091278c733` — folder snapshot listing.
- `b2a6c8a8f58a377aad2c060057c1bf2f43d14e7b` — deletion reconciliation.
- `3bc7d38c7922524c074f3503c3f66e7fd07de712` — watcher configuration guard.
- `c9a19095122f8b564e24b62379421654a73de713` — CI concurrency syntax restore.
- `12c239ab976bc0a6c01a3b9bae3f645f579b39cb` — explicit TS extensions in runtime test.
- `81fdaaad55218db0d0da07d6dcd970499c1a45a5` — explicit TS extension in checkpoint hardening test.
- `7d5f266b997eb061acaa584052ee4a90c509b470` — strip-only compatible durable worker adapter.
- `2ebd3ff530b1646d930ad041c9d4879ba4b11a8c` — explicit N–S roadmap execution addendum.
- `176e0047d9e5731bd3ee853da06e0c2cbf9b19ad` — K→S gate reads historical roadmap + N–S addendum.
- `69b8cf318263ccb581bfe8766affd2b7bddc9d9d` — resumable execution recovery/idempotency regression hardening.

**No production PASS is claimed. LIVE REQUIRED remains explicit.**