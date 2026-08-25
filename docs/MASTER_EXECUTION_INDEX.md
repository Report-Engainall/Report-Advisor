# Report Advisor — Master Execution & Truth Index

> المرجع التنفيذي المركزي. يُقرأ قبل كل دفعة، ثم يُفحص المستودع الحالي. الكود الحالي هو الحقيقة. لا يُحسب أي GAP مغلقًا بالملفات أو الـcommits وحدها.

Snapshot: 2026-08-25
Source of truth: `main` / `Report-Engainall/Report-Advisor`

## 1. قواعد التنفيذ

1. افحص هذا الفهرس ثم المستودع ثم العمل السابق قبل أي تغيير.
2. Reuse / fix / consolidate قبل create؛ لا تُنشأ محركات موازية.
3. افصل دائمًا: IMPLEMENTED / GATED / RUNTIME-VERIFIED / LIVE REQUIRED / PRODUCTION-CERTIFIED.
4. Quality verifier وليس scheduler: أثناء CI يستمر التدقيق المستقل والتنفيذ القابل للإغلاق.
5. لا تحول failure إلى warning، ولا تستخدم mock business data أو fake runtime evidence.
6. AI ليس مصدر الحقيقة الرقمية/المالية.
7. لا تستخدم defaults لإخفاء missing data أو tenant/risk/liquidity/service constraints.
8. كل إصلاح مغلق يجب أن يملك root cause + test/guard مناسب.
9. بعد كل دفعة: commit + اكتشاف + سبب + إصلاح + اختبار + CI + المتبقي + الخطوة التالية.

## 2. تعريف الحالة

- COMPLETE: implementation + applicable evidence يحقق DoD.
- FOUNDATION: architecture/contracts موجودة، proof غير مكتمل.
- GATED: guards/tests موجودة، runtime proof غير مكتمل.
- LIVE REQUIRED: يتطلب بيئة حقيقية.
- GAP: متطلب معروف غير مكتمل.
- GUARDRAIL: متعمد عدم التنفيذ لأسباب أمن/تكرار/سياسة.

## 3. الحالة المرحلية الحالية

| المرحلة | الحالة | الحقيقة الحالية | المتبقي الرئيسي |
|---|---|---|---|
| 1–21 | COMPLETE FOUNDATION | tenant/RLS/import governance/ledgers/A0 foundations | إعادة تحقق عند dependency drift |
| 22 | IMPLEMENTED | preview/reconciliation | runtime/E2E |
| 23 A0.3 | IMPLEMENTED/GATED | schema intelligence/mapping | golden/E2E depth |
| 24 A0.4 | IMPLEMENTED/GATED | entity resolution/idempotency | runtime reconciliation proof |
| 25 | IMPLEMENTED/GATED | review/quarantine/promotion | full user E2E |
| 26 | IMPLEMENTED/GATED | transactional routing/rollback | live transaction proof |
| 27 | IMPLEMENTED/GATED | canonical Onyx adapter | live adapter proof |
| 28 | IMPLEMENTED | golden manifest | execute/expand corpus |
| 29 | IMPLEMENTED/GATED | unified quality gates | current CI completion |
| 30–37 | IMPLEMENTED/GATED | demand/pack/decision/liquidity/production chain | runtime + golden decision E2E |
| A0 | FOUNDATION/GATED | deterministic document/data contracts | complete internal engine |
| A | FOUNDATION COMPLETE | queue/idempotency/lease/render/evidence/artifact integrity | live worker proof |
| B | DEEP FOUNDATION COMPLETE | entitlements/usage/provider-neutral lifecycle | live production evidence |
| C | DEEP FOUNDATION COMPLETE | evidence-bound actions/executor/receipts | live action path |
| D | DEEP FOUNDATION COMPLETE | forecasting/backtesting/diagnostics/outcome feedback | production feedback proof |
| E | GATED/LIVE REQUIRED | tenant/RLS/readiness/certification foundations | adversarial/live security canaries |
| F | GATED/LIVE REQUIRED | resilience/backup/RPO-RTO/SLO foundations | restore/worker/rollback canaries |
| G | GATED/LIVE REQUIRED | release manifests/evidence/fail-closed chain | staging/parity/signed artifact/canary |
| H | FOUNDATION/GATED | continuous trust/autonomous safety | live canaries/remediation |
| I | FOUNDATION/GATED | governance/BI/evidence/risk budgets | live graph/anomaly/outcome/cockpit |
| J | FOUNDATION/GATED | watched-folder/lineage/reconciliation/control plane | live coordinator/business state |
| J.1 | FOUNDATION/GATED | text-first watched reports | live continuous ingestion acceptance |
| K | FOUNDATION/GATED | durable jobs/lineage/canonical text/scenarios/calibration | real jobs/outcomes/rollback |
| L | FOUNDATION/GATED | health/evidence graph/certification predicates | live telemetry/graph/action loop |
| M | NOT LIVE CERTIFIED | certification gates | complete live certification bundle |

## 4. Cross-platform watched-folder objective

The repository already had the watched-folder engine; it is reused rather than rebuilt. Existing flow includes folder selection/monitoring, SHA-256 fingerprinting, incremental processing, IndexedDB snapshot state, queue/dead-letter contracts and canonical text fallback.

New cross-platform capability boundary:
- Web/PWA: progressive File System Access capability; active-session monitoring where supported; never claim arbitrary background monitoring after app close.
- Windows: native persistent watcher adapter required for background monitoring.
- Android: native directory permission/watcher adapter required, subject to OS policy.
- iOS: capability-aware native adapter; no false promise of arbitrary local-folder background monitoring.
- All adapters emit the existing canonical watch/import events into the same ingestion engine.

## 5. Tenant / security status

Static repository-wide searches were performed for `COMPANY_ID`, tenant IDs, tenant fallbacks, `company_id`, `tenant_memberships`, direct Supabase usage and client-selected tenant filtering.

Current truth:
- tenant legacy guard exists and scans executable application/runtime consumers.
- no remaining search evidence of a client `tenantId`/`tenant_id` filter pattern was found outside the guard.
- canonical tenant resolution is server/database authoritative; client selection cannot override it.
- direct Supabase reads remain allowed only where database RLS/current-tenant enforcement is authoritative; they are not treated as tenant selectors.
- direct writes are governed by import transaction/RPC guards; bulk import bypasses remain prohibited.
- `company_id` fields in result types do not constitute tenant selection by themselves.

LIVE REQUIRED: adversarial Supabase tenant isolation, storage/signed URLs, Realtime authorization, AI retrieval namespace isolation and secret audit.

## 6. File → Parse → Map → Validate → Tenant → Canonical → RPC → Persistence → Reconciliation → Audit → Evidence

### Existing foundation verified
- multi-format report contract and header synonyms.
- canonical mapping/normalization/business-key matching.
- governed bulk import and RPC transaction path.
- incremental source fingerprinting and row reconciliation.
- Onyx canonical adapter and isolation guard.
- provenance/lineage and text-first fallback.
- quarantine/review/promotion contracts.
- watched-folder queue/dead-letter contracts.

### New hardening in current batch
1. Weak source fingerprints no longer become `skip_unchanged` merely because size + modified timestamp match; when content hash is absent/changed for the same source, processing fails closed into `process_changed`.
2. Duplicate stable row keys are now rejected before reconciliation instead of being silently collapsed by a `Map`.
3. Added executable regression tests for identical hash, weak fingerprint, duplicate row keys, changed rows and deleted rows.
4. Registered that regression suite in `package.json` and Quality.

### Remaining data/runtime proof
- arbitrary/no-header/random schemas and poor files.
- page/table classification and extraction completeness.
- cell-level lineage where available.
- large/golden corpus execution.
- live Onyx synchronization evidence.
- live transactional rollback/retry/reconciliation proof.

## 7. KPI / BI truth status

Current dashboard/query layer already fails closed for required numeric/date fields and explicitly represents `INSUFFICIENT_DATA`. `activeCustomers` is null because the canonical customer schema has no authoritative active/inactive field; missing due dates are not silently replaced by invoice date.

Current dashboard trend selector controls the trend horizon; other executive KPIs are currently all-source aggregates and must not be described as filtered by the trend selector. This is a semantic UI/query boundary to preserve until a true global date-filter contract is introduced.

Audit targets:
`KPI Definition → Source → Formula → Query → Service → Dashboard → Report → Export`

Remaining proof: cross-surface KPI equivalence, authoritative date-window semantics where applicable, cache freshness/invalidation, provenance in material UI/export, large-table and drill-down E2E.

## 8. Evidence → Quality → Confidence → Decision → Recommendation → Outcome

Existing evidence-bound decision/recommendation contracts are retained. Autonomous control-plane constraints are fail-closed: missing risk/liquidity/service-level constraints cannot become zero; evidence source references are mandatory.

Remaining: live evidence graph population, real decision outcomes, recommendation→observed-outcome feedback, executive approval/action loop and production-like scenario execution.

## 9. Lease / execution / recovery

Existing durable job, lease, heartbeat, checkpoint, retry, complete/fail and dead-letter contracts remain canonical.

Hardening completed: terminal failure transitions preserve structured failure evidence rather than replacing missing error payloads with an empty object.

Remaining LIVE REQUIRED: stuck-worker injection, lease expiry recovery, dead-letter replay, backup restore, rollback/forward-fix and SLO timing evidence.

## 10. CI topology

Primary verifier: `.github/workflows/quality.yml`.

Observed specialized workflows remain manual/specialized unless coverage proves they should be consolidated. No additional push-triggered production workflow should be added without a demonstrated coverage gap.

Recent CI truth:
- Run `32880785206` failed at the Quality workflow contract because stale npm aliases were referenced; root cause fixed by calling the canonical scripts directly.
- Run `32881175093` failed in the newly added document-resilience gate; the failure was treated as a real wiring/contract signal, not suppressed.
- Run `32881197772` (`#1395`) started after the workflow correction and was still in progress during the audit.
- Subsequent import hardening triggered Run `32881752782` (`#1399`, in progress) and Run `32881771230` (`#1400`, queued) on the latest commits. These are not counted as PASS until completed.

## 11. Current P0 — must be LIVE CLOSED before production certification

- [ ] adversarial Supabase tenant certification
- [ ] storage/signed URL verification
- [ ] Realtime authorization verification
- [ ] AI retrieval tenant isolation verification
- [ ] backup restore + RPO/RTO evidence
- [ ] staging migration dry-run + schema drift
- [ ] environment parity
- [ ] signed deployment artifact verification
- [ ] stuck-worker/dead-letter recovery drill
- [ ] incident/SLO rollback + forward-fix drill
- [ ] security/secret audit
- [ ] stabilization telemetry
- [ ] final production certification bundle

## 12. Current P1 — connected runtime

- [ ] Windows native persistent watcher
- [ ] Android native folder permission/watcher
- [ ] iOS capability-aware native integration
- [ ] bind durable watched-folder jobs to live coordinator
- [ ] persist extraction checkpoints at real boundaries
- [ ] feed real outputs into business-state snapshots
- [ ] populate executive evidence graph from live decisions/KPIs
- [ ] bounded optimizer scenarios on production-like snapshots
- [ ] recommendation→outcome feedback
- [ ] portfolio/materiality routing to executive approval
- [ ] drift/health scoring to live telemetry/canaries
- [ ] real rollback drills

## 13. Document Intelligence P1

- [ ] provider-neutral intermediate representation completeness
- [ ] page/table classification
- [ ] headerless/reverse schema discovery
- [ ] extraction/provenance completeness
- [ ] cell-level lineage
- [ ] entity-resolution precision/recall evidence
- [ ] mathematical reconciliation coverage
- [ ] confidence/quarantine/reprocessing UX
- [ ] golden Arabic/English/scanned/random/no-header/merged/multi-table/poor-quality corpus

## 14. BI / UX / predictive P2

- [ ] Command Palette / keyboard workflows
- [ ] saved views/filter/group persistence
- [ ] executive cockpit → drill-down → evidence → action E2E
- [ ] deterministic what-if/scenario evidence engine
- [ ] cross-filter/drill-down production UI proof
- [ ] connected evidence/knowledge workspace
- [ ] low-bandwidth/mobile/throttled-network proof
- [ ] forecasting production backtesting/minimum-data UX
- [ ] closed-loop forecast quality
- [ ] provider failure/fallback E2E
- [ ] live AI retrieval isolation canary
- [ ] evidence-grounded Ask→Inspect→Act E2E

## 15. Real progress calculation

This percentage is a **truth-weighted engineering estimate**, not a commit/file count and not a production-certification percentage.

Current assessment: **~82% engineering completion**.

Interpretation:
- Broad foundation/implementation: ~90%+ across the originally defined feature surface.
- Contract/gate coverage: high and continuously exercised by Quality.
- Integrated runtime/E2E: materially lower because several connected surfaces still require live proof.
- Production certification: **not complete** because P0 live evidence remains open.

Therefore **82% does not mean 82% production certified**. The remaining ~18% is disproportionately concentrated in live integration, adversarial security, document-engine depth, connected autonomous runtime, cross-platform native watchers and final certification evidence.

## 16. Mandatory execution loop

### NOW-1
Search tenant consumers, direct reads/writes, RPC callers, static IDs, fallbacks and authoritative-source violations repository-wide.

### NOW-2
Run File → Parse → Map → Validate → Tenant → Canonical → RPC → Persistence → Reconciliation → Audit → Evidence audit; repair root causes and add regression coverage.

### NOW-3
Run KPI Definition → Source → Formula → Query → Service → Dashboard → Report → Export equivalence audit; repair only proven mismatches.

### NOW-4
Run Evidence → Quality → Confidence → Decision → Recommendation → Outcome and Lease → Heartbeat → Checkpoint → Complete/Fail → Retry → Recovery → Dead-letter drift audits.

### NOW-5
Run Tenant/RLS → Storage → Realtime → AI retrieval → concurrency → failure injection → recovery static/runtime audits in parallel with Quality.

### NOW-6
Implement the next native folder watcher adapter without duplicating the existing ingestion engine.

### NOW-7
CI: PASS → immediately next deepest GAP; FAIL → root cause → fix → regression → rerun. Never wait for CI before independent work.

### NOW-8
After every meaningful batch, update this index before starting the next batch.

## 17. Definition of Done

A capability is fully implemented only when applicable UI, service/backend, database/migrations, security/RLS/tenant scope, audit/queue behavior, error/loading/offline behavior, deterministic truth/evidence, tests, E2E/runtime evidence, performance/load evidence and documentation are compatible and proven.

## 18. Golden rule

> افحص الفهرس → افحص المستودع → افحص العمل السابق → اكتشف الفجوة → أصلح الموجود → اختبر → شغّل CI → سجّل الدليل → حدّث الفهرس → انتقل مباشرة للفجوة التالية.

## 19. Current batch ledger — 2026-08-25

Commits produced in this execution wave include:
- `af9edb196dc3c2b276a8110fb1a21d2c7de47dc2` — Quality executes incremental ledger regression.
- `68e4b1efe03721ba8cb31de29bb56db06e115c0d` — duplicate/weak fingerprint regression test.
- `22eca8b1ffa488874c1d9c9482ab7d8dbab0bd43` — weak fingerprint and duplicate-row fail-closed hardening.
- `6e9c66deb0c34ecb0759696deaea4423ce572f45` — package registry for the new regression suite.
- earlier same-wave commits established cross-platform folder capability/native adapter boundary and corrected stale Quality workflow aliases.

No claim of production PASS is made. LIVE REQUIRED remains explicit.
