# Report Advisor — Project Execution Index

> المرجع التشغيلي الدائم قبل أي عمل جديد. اقرأه أولًا ثم افحص المستودع. إذا تعارض هذا الملف مع الكود الحالي فالكود هو الحقيقة ويجب تحديث الفهرس.

## 1. قواعد العمل
1. لا تبدأ من الذاكرة؛ ابدأ من هذا الملف ثم من المستودع.
2. قبل إنشاء Gate/Workflow ابحث عن وظيفة موجودة تؤدي الغرض نفسه.
3. افصل Static Readiness عن Runtime PASS وعن Production Certification.
4. وجود Contract لا يعني نجاح التشغيل.
5. Build/Quality PASS لا يعني Production Certified.
6. `steps: null` أو غياب logs قبل أول Step لا يُنسب للتطبيق بلا runtime evidence.
7. قبل تعديل ملف موجود: اقرأ النسخة الحالية ثم حدّثها.
8. بعد كل دفعة سجّل commit والاكتشافات والإصلاحات والتحقق وما تبقى.
9. Quality هو مسار التحقق الأساسي؛ المتخصص manual فقط عندما يكرر ما يغطيه Quality.
10. الهدف الإصلاح والتوحيد، لا زيادة الملفات بلا حاجة.

## 2. الحالة الحالية — 2026-08-25
**Strategic phase:** Consolidation → Runtime Verification → Production Closure
**Current priority:** Full topology inventory → J/K/L/M deep audit → Autonomy → Recovery → Master Production Gate → real runtime verification.
**Historical CI blocker:** Jobs فشلت سابقًا قبل Steps (`steps: null`/no logs)؛ يحتاج تحققًا حديثًا ولا يُفسر كفشل تطبيق بلا evidence.

## 3. خريطة المراحل
| المرحلة | المجال | الحالة |
|---|---|---|
| 1 | Foundation / Architecture | ✅ منفذة سابقًا |
| 2 | DB / RLS / RBAC | ✅ منفذة ومتقدمة |
| 3 | Unified Import Engine | ✅ منفذة سابقًا |
| 4 | File/Data/Document Intelligence | ✅ متقدمة |
| 5 | Performance | ✅ منفذة سابقًا |
| 6 | Security / Tenant Isolation | 🟢 متقدمة |
| 7 | Core Quality | 🟢 baseline سابق ناجح |
| 8 | K/L/M Runtime | 🟡 يحتاج Runtime evidence |
| 9 | Autonomy / Governance | 🟡 يحتاج Runtime evidence |
| 10 | Phase F Resilience / Recovery | 🟡 static + live منفصلان |
| 11 | Release Evidence / Provenance | 🟢 متقدمة جدًا |
| 12 | Production Certification | 🟡 تحتاج final runtime evidence |
| 13 | Final Master Release | ⏳ لم يُعلن |

## 4. Canonical Quality
`.github/workflows/quality.yml` يغطي أصلًا Core، K/K-runtime، L/resumable، M، K→S closure/deep closure، Production blockers/certification، Continuous Trust، Autonomous Governance، Security/Tenant/RLS، File/Document/Analysis Runtime، وresilience. لذلك لا تضف مسار push مكررًا قبل فحصه.

## 5. CI topology المنفذ
- J/K/L runtime wave → manual-only — `2117ea05bcfda6f9321919c991c3d9e5b9a03371`
- Autonomy safety wave → manual-only — `86b961b721d3ce17c58d9ada2dae9a9dd5b227cc`
- `scripts/check-ci-execution-topology.mjs` — `fcbfbaf908c63a193eb8ad852253aabdb880a051`
- Quality topology/recovery integration — `c7a1561fa049a6c89863d1e34816c09bc2ec0c49`

## 6. Release / Certification المنفذ
- Certification boundary — `35e9dbb0e907b4cfa529533b07cd3beecd762e09`
- Security/provenance — `5edd785f890428f208fe5f05d381394a31fced77`
- Artifact/migration provenance — `17f48ebf6836f8a1cb1e3e592bc309f9d78a22e6`
- Release artifact integrity — `bc2f1f2b96d2dd7d3c023f3e4c55d85dce7e3fb7`
- Rollback contract — `8d27e749549aec79d118a27f3e3b48c250870210`
- Release manifest — `36633c481966257bf782ccd42f18a107608a3953`
- Manifest integrity — `c029b98d1729d62f53431b0db4d0bbd335a65fa0`
- Manifest workflow — `864a4a871438de3ceb50108426f3311ef30e176a`
- Drift — `0801e07e43a03955c21e8ad4a61545eabc7ce974`
- Evidence snapshot — `cda2ed0e61e1683ee886a15e8fbc238663614211`
- Evidence freshness — `971c9dde1295cee4070334fa780669e4119d54ea`
- Release decision provenance — `e0d8bd561603d4f648618d2352acfdf247b97991`
- Audit bundle — `6854a064f490aff284a3fb50fcb18a8d4b3dcfeb`
- Release gate completeness — `94687198491ee9804ad0ff7f4866e5633d460d40`
- Unified release gate — `2fc36900190b878e36449b966ba4120503d4ba8c`
- Recovery readiness — `e7af4dca612761e6d19e3d24e4e6e29d7589618e`
- Recovery workflow — `be9daad4915f2c9b5082ffb77b5c1dcb974fe66c`
- Production recovery gate — `2f3547b272511847f12a35b5ae686f390566a96e`

## 7. Existing capabilities — لا تعِد بناءها
ابحث أولًا عن Phase F Operational Resilience، Backup/Restore verification، Rollback/Forward-Fix، Continuous Trust، Production Release Blockers، Unified Production Decision Chain، Release Evidence، K/L/M contracts، Security/Tenant/RLS.

## 8. تاريخ مهم
- `profiles`/`auth.users` تم إصلاحه مع trigger و`heal_missing_profiles()`.
- Import preview كان يخطئ في مطابقة SKUs الموجودة.
- Unified Import Engine هو مسار bulk import الحاكم.
- E2E كان يحتاج owner runtime بسبب `AUTH=signed_out`.
- Ollama محلي؛ لا تعيد `/api/chat` أو Lovable gateway.
- Onyx isolation سابقًا `236/236 PASS` و`onyx_datasets = 0`.
- النتائج القديمة لا تكفي لإعلان Production PASS؛ أعد التشغيل.

## 9. Topology inventory — أحدث اكتشاف وإصلاح
تم فحص directory الخاص بالـworkflows مباشرة من GitHub، وليس الاعتماد على الذاكرة. ظهرت مسارات متخصصة متعددة، منها:
- `quality.yml` — canonical push/PR validation.
- `production-closure.yml` — كان أيضًا push/PR ويكرر مجموعة كبيرة من Production readiness/release tests الموجودة في Quality.
- `master-production-verification.yml`
- `production-certification-boundary.yml`
- `production-chain-guard.yml`
- `production-evidence-boundary.yml`
- `production-integrity-wave-v2.yml`
- `phase-e-live-certification.yml`
- `phase-f-live-resilience.yml`
- `j-k-l-runtime-wave.yml`
- `autonomy-safety-wave.yml`
- `file-engine-header-contract.yml`
- `file-intelligence-security.yml`

### إصلاح جديد
`production-closure.yml` كان يعمل تلقائيًا على `push main` وPR، رغم أن Quality يحتوي بالفعل على Production blockers/certification/readiness. تم تحويله إلى **workflow_dispatch فقط** مع تثبيت `ubuntu-22.04`.

Commit: `0f4e1f36a53117516974170268f4d93aaa726ca2`

الهدف: إبقاء Production Closure كمسار متخصص يمكن تشغيله عمدًا، بدل مضاعفة التنفيذ على كل Push.

## 10. قائمة التنفيذ القادمة
### NOW-1 — أكمل topology inventory
- احصر كل workflow الحالي فعليًا.
- افحص triggers لكل واحد.
- صنّف canonical / specialized / duplicate / obsolete.
- اربط كل Workflow بالـscripts/npm commands التي يشغلها.
- لا تحذف أي Workflow قبل إثبات التكرار وعدم الحاجة.

### NOW-2 — J/K/L/M deep audit
Contract → implementation → test → evidence → runtime.

### NOW-3 — Autonomy deep audit
Safety / governance / decision chain / fail-closed / tenant boundaries.

### NOW-4 — Recovery deep audit
Static readiness / backup freshness / restore / rollback / RPO-RTO / live evidence.

### NOW-5 — Master Production Gate
توحيد القرار وإزالة التكرار المنطقي.

### NOW-6 — Real runtime verification
تشغيل فعلي، تصنيف failures، إصلاح، إعادة تشغيل.

### NOW-7 — Final certification
فقط بعد نجاح المسار الكامل.

## 11. Definition of Done
- [ ] Canonical CI topology بلا تكرار ضار
- [ ] Core Quality PASS
- [ ] J/K/L runtime PASS
- [ ] M certification PASS
- [ ] Autonomy runtime PASS
- [ ] Tenant/RLS/security PASS
- [ ] File/Data/Document intelligence PASS
- [ ] Recovery live verification PASS
- [ ] Backup/restore/rollback evidence حديثة
- [ ] Manifest integrity PASS
- [ ] Artifact/dependency/migration provenance PASS
- [ ] Drift/Freshness PASS
- [ ] Release decision APPROVED
- [ ] Production blockers = 0
- [ ] Production certification PASS
- [ ] Final build/deployment verification PASS

## 12. Update template
```text
Date:
Goal:
Files changed:
Commit(s):
Discovered:
Fixed:
Verified:
Remaining:
Next exact action:
```

## Golden Rule
> لا تبدأ من الذاكرة. ابدأ من هذا الفهرس، ثم من المستودع نفسه. بعد كل دفعة مؤثرة حدّث هذا الملف. إذا تعارض الفهرس مع الكود الحالي، الكود هو الحقيقة.
