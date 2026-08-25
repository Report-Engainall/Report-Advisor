# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-25
Source of truth: `main`

> هذا الملف هو نقطة الرجوع الإلزامية قبل كل دفعة. لا تُحسب الملفات/commits إنجازًا بحد ذاتها. الحالة تُفصل إلى implementation / gate / runtime / live certification.

## 1. قواعد التنفيذ

- افحص الفهرس → المستودع → العمل السابق قبل coding.
- Reuse/fix/consolidate قبل create؛ ممنوع engines موازية.
- CI يعمل بالتوازي مع التدقيق؛ لا ننتظر Run لبدء GAP مستقل.
- Failure → root cause → fix → regression → rerun.
- لا mock business data، لا fake runtime evidence، لا defaults تخفي missing data أو tenant/security constraints.
- AI ليس مصدر الحقيقة المالية/الرقمية.
- كل GAP مغلق له guard/test ودليل مناسب.

## 2. الحالة المرحلية

| المسار | الحالة | المتبقي الحاسم |
|---|---|---|
| 1–21 | COMPLETE FOUNDATION | dependency recheck فقط |
| 22–29 | IMPLEMENTED/GATED | runtime/E2E/golden evidence |
| 30–37 | IMPLEMENTED/GATED | runtime + decision E2E |
| A0 | FOUNDATION/GATED | اكتمال محرك الوثائق الداخلي |
| A–D | FOUNDATION/DEEP FOUNDATION COMPLETE | live worker/action/forecast feedback |
| E–G | GATED/LIVE REQUIRED | tenant/security/restore/rollback/release evidence |
| H–I | FOUNDATION/GATED | live canaries/graph/outcomes/cockpit |
| J–J.1 | FOUNDATION/GATED | live watched-folder coordinator/continuous acceptance |
| K–L | FOUNDATION/GATED | real jobs/outcomes/telemetry/action loop |
| M | NOT LIVE CERTIFIED | production certification bundle |

## 3. Watched Folder — cross-platform

المحرك الأساسي **موجود مسبقًا وتمت إعادة مراجعته**: folder selection/monitoring، SHA-256، incremental state، IndexedDB snapshots، queue/dead-letter، canonical text fallback. لم يتم بناء محرك ثانٍ.

Capability boundary:
- Web/PWA: File System Access progressive capability + active-session monitoring؛ لا ادعاء مراقبة خلفية بعد إغلاق المتصفح.
- Windows: native persistent watcher adapter مطلوب.
- Android: native directory permission/watcher adapter مطلوب.
- iOS: capability-aware adapter؛ لا ادعاء بمراقبة خلفية غير مسموحة.
- جميع المنصات تدخل نفس ingestion engine.

## 4. Tenant / Security — static audit

تم البحث استباقيًا عن `COMPANY_ID`، static tenant IDs، tenant fallbacks، `company_id` selectors، `tenant_memberships`، client-selected tenant filtering، direct Supabase consumers وRPC callers.

الحالة الحالية:
- Tenant legacy consumer guard: PASS.
- لا توجد نتيجة موثوقة متبقية لفلتر client `tenantId/tenant_id` خارج guard/analysis paths.
- tenant resolution authoritative من database/RLS/current-company resolver.
- direct reads لا تُعتبر tenant selection؛ الحماية تعتمد على RLS/authoritative context.
- bulk writes تمر عبر governed transaction/RPC path.

LIVE REQUIRED: adversarial Supabase tenant isolation، Storage/signed URLs، Realtime auth، AI retrieval namespace isolation، secret audit.

## 5. Data / Import chain

`File → Parse → Map → Validate → Tenant → Canonical → RPC → Persistence → Reconciliation → Audit → Evidence`

Foundation verified: multi-format contracts، header synonyms، canonical mapping، normalization، business-key matching، preview/approval، quarantine، provenance/lineage، governed RPC writes، Onyx adapter، watched-folder queue.

### Hardening المنجز في الدفعة الحالية
1. **Weak fingerprint fail-closed:** لا يعود الحجم + modified time كافيين لـ`skip_unchanged` عند غياب content hash؛ نفس المصدر ينتقل إلى `process_changed`.
2. **Duplicate row keys:** reconciliation يرفض duplicate stable keys بدل أن يخفيها `Map` ويُسقط صفوفًا بصمت.
3. Regression suite أُضيفت لـ identical hash / weak fingerprint / duplicate keys / changed / deleted rows وأُدخلت في package + Quality.
4. **Watched-folder deletion reconciliation:** scan أصبح يحتفظ بالـsnapshot listing، يقارن `seenPaths` بالمخزون السابق، ويضع الملفات المختفية في حالة `deleted` ويُرجع `deletedFiles` بدل تجاهلها.

Remaining runtime: arbitrary/no-header/random/poor files، extraction/page/table classification، cell lineage، golden corpus، live Onyx، live transaction rollback/retry/reconciliation.

## 6. KPI / BI truth

KPI query layer fail-closed للحقول الرقمية/التاريخية المطلوبة، ويميز `INSUFFICIENT_DATA`. `activeCustomers=null` لأن schema لا يملك active/inactive authoritative field. Aging لا يستخدم invoice date كبديل صامت عن due date.

تنبيه semantic مثبت: selector الخاص بـ3/6/12 أشهر يحدد trend فقط؛ بقية executive KPIs حالياً all-source aggregates، ولا يجوز وصفها بأنها filtered بنفس selector قبل إنشاء contract زمني عالمي حقيقي.

Audit chain:
`KPI Definition → Source → Formula → Query → Service → Dashboard → Report → Export`

Remaining: cross-surface equivalence، authoritative date-window semantics، cache freshness/invalidation، provenance في UI/export، large-table/drill-down E2E.

## 7. Evidence / Decision / Recommendation / Outcome

Evidence-bound decision contracts موجودة. Control-plane constraints الآن fail-closed؛ missing risk/liquidity/service-level constraints لا تتحول إلى zero، ومصادر evidence مطلوبة.

Remaining: live evidence graph، real outcomes، recommendation→outcome feedback، executive approval/action loop، production-like optimizer scenarios.

## 8. Lease / Recovery

Durable jobs + lease + heartbeat + checkpoint + retry + terminal state + dead-letter موجودة.

Failure evidence preservation تم تشديده؛ terminal failure لا يستبدل error evidence بكائن فارغ.

Remaining LIVE: stuck worker injection، lease expiry، dead-letter replay، restore/RPO-RTO، rollback/forward-fix، SLO timing.

## 9. CI truth

Primary verifier: `.github/workflows/quality.yml`.

Recent failures were treated as root-cause signals:
- `32880785206`: stale npm aliases in Quality contract → fixed to canonical scripts.
- `32881175093`: document-resilience gate failure → investigated, not suppressed.
- `32881771230` (#1400): Quality stopped at workflow contract because the concurrency expression had been altered while adding the regression step → exact canonical syntax restored.
- Latest fixes trigger a new Quality run; no current PASS is claimed until it completes.

Known good gates from preceding runs include tenant legacy boundary, data-quality projection, company config, migration schema/dependency audits and earlier watched-report/control-plane gates where their run logs explicitly passed. These are not substituted for the newest run.

## 10. P0 LIVE blockers

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

## 11. P1 connected runtime

- [ ] Windows persistent native watcher
- [ ] Android native folder watcher
- [ ] iOS capability-aware integration
- [ ] live watched-folder coordinator
- [ ] real extraction checkpoints
- [ ] business-state snapshots from real outputs
- [ ] executive evidence graph live population
- [ ] bounded production-like scenarios
- [ ] recommendation outcome feedback
- [ ] approval/action loop
- [ ] live drift/health canaries
- [ ] real rollback drills

## 12. Document Intelligence P1

- [ ] provider-neutral intermediate representation
- [ ] page/table classification
- [ ] headerless/reverse schema discovery
- [ ] extraction/provenance completeness
- [ ] cell-level lineage
- [ ] entity precision/recall evidence
- [ ] mathematical reconciliation
- [ ] confidence/quarantine/reprocessing UX
- [ ] golden Arabic/English/scanned/random/no-header/merged/multi-table/poor-quality corpus

## 13. UX / predictive P2

- [ ] Command Palette
- [ ] saved views/filter/group persistence
- [ ] executive cockpit drill-down → evidence → action E2E
- [ ] deterministic what-if/scenario engine
- [ ] cross-filter/drill-down production proof
- [ ] connected evidence workspace
- [ ] low-bandwidth/mobile proof
- [ ] production forecast backtesting/minimum-data UX
- [ ] closed-loop forecast quality
- [ ] provider failure/fallback E2E
- [ ] live AI retrieval canary
- [ ] evidence-grounded Ask→Inspect→Act E2E

## 14. Truth-weighted progress

**Current engineering completion estimate: ~82%.**

This is not a production-certification percentage. Foundation/implementation coverage is roughly 90%+ across the defined feature surface, contract/gate coverage is high, but integrated runtime and live certification remain materially behind because P0 security/recovery/release evidence, native background watchers, deeper document-engine proof and connected autonomous runtime still require real environments.

So:
- Engineering implementation: **~82%**
- Contract/gate maturity: **high**
- Integrated E2E/runtime: **partial**
- Production certified: **NO / 0 certified final state until P0 live bundle closes**

## 15. Mandatory loop for every next batch

1. Read this index.
2. Search the whole repository for the requested surface and integration drift.
3. Fix all independent safe root causes in one batch.
4. Add/update regression guards.
5. Commit.
6. CI runs while the next independent audit continues.
7. PASS → deepest next GAP. FAIL → root cause → fix → rerun.
8. Update this index after every meaningful batch.

## 16. Definition of Done

UI + backend/service + DB/migrations + tenant/RLS/security + queue/audit + error/offline behavior + deterministic truth/evidence + tests + E2E/runtime evidence + performance/load evidence + documentation must be compatible and proven.

## 17. Golden rule

> افحص الفهرس → افحص المستودع → اكتشف الفجوة → أصلح الموجود → اختبر → CI → سجل الدليل → حدّث الفهرس → انتقل مباشرة للفجوة التالية.

## 18. Current batch commits

- `22eca8b1ffa488874c1d9c9482ab7d8dbab0bd43` — weak fingerprint + duplicate row fail-closed.
- `68e4b1efe03721ba8cb31de29bb56db06e115c0d` — incremental regression tests.
- `6e9c66deb0c34ecb0759696deaea4423ce572f45` — package registry.
- `1e7a771ccf604e1f47071e86f2ffedfbe8cbc1fe` — explicit deleted folder-file state.
- `a6f9f6784d8d060938f2a2d1b91d67091278c733` — folder snapshot listing.
- `b2a6c8a8f58a377aad2c060057c1bf2f43d14e7b` — watched-folder deletion reconciliation.
- `faf77504b6694f0d25870b8a3086f0a646eaeb48` — deletion reconciliation guard.
- `c9a19095122f8b564e24b62379421654a73de713` — CI concurrency contract restored.

**No production PASS is claimed. LIVE REQUIRED remains explicit.**
