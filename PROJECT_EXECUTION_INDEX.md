# Report Advisor — Project Execution Index

> المرجع التشغيلي الدائم قبل أي عمل جديد. اقرأه أولًا، ثم افحص المستودع نفسه. حدّثه بعد كل دفعة مؤثرة. إذا تعارض مع الكود الحالي فالكود الحالي هو الحقيقة، ثم صحح الفهرس.

## 1. قواعد العمل

1. لا تبدأ من الذاكرة؛ ابدأ من هذا الملف ثم من المستودع.
2. قبل إنشاء Gate أو Workflow جديد ابحث عن وظيفة موجودة تؤدي الغرض نفسه.
3. افصل دائمًا بين Static Readiness وRuntime PASS وProduction Certification.
4. وجود Contract لا يعني نجاح التشغيل.
5. Build/Quality PASS لا يعني Production Certified.
6. `steps: null` أو غياب logs قبل أول Step دليل محتمل على CI bootstrap/runner؛ لا تنسبه للتطبيق بلا runtime evidence.
7. قبل تعديل ملف موجود: اقرأ النسخة الحالية ثم حدّثها، ولا تنشئ نسخة بديلة.
8. بعد كل دفعة سجّل commit والملفات والاكتشافات والإصلاحات والتحقق وما تبقى.
9. Quality هو مسار التحقق الأساسي؛ المتخصص يكون manual فقط عندما يكرر ما يغطيه Quality.
10. الهدف هو الإصلاح والتوحيد، لا زيادة عدد الملفات بلا حاجة.

## 2. الحالة الحالية — 2026-08-25

**Strategic phase:** Consolidation → Runtime Verification → Production Closure

**Priority:** inventory شامل للـworkflows/scripts/contracts، إزالة التكرار والتعارض، إصلاح الفجوات الحقيقية، ثم تشغيل المسار الكامل.

**CI blocker التاريخي:** Jobs متعددة فشلت قبل Steps (`steps: null` / لا logs). يحتاج تحقق حديث ولا يُفسر كفشل تطبيق بلا evidence.

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

## 4. المسار المرجعي

`.github/workflows/quality.yml` يحتوي أصلًا على أجزاء من:

- Core build/lint/typecheck
- Phase K production intelligence/runtime
- Phase L runtime/resumable execution
- Phase M certification
- K→S closure/deep closure
- Production release blockers/certification
- Continuous Trust
- Autonomous Governance
- Security/Tenant/RLS
- File Engine/Document Intelligence/Analysis Runtime
- Resilience gates

**قرار:** لا تنشئ Workflow موازيًا قبل التحقق من تغطية Quality.

## 5. إصلاحات CI topology المنفذة

- J/K/L runtime wave → manual-only. Commit: `2117ea05bcfda6f9321919c991c3d9e5b9a03371`
- Autonomy safety wave → manual-only. Commit: `86b961b721d3ce17c58d9ada2dae9a9dd5b227cc`
- `scripts/check-ci-execution-topology.mjs` → topology guard. Commit: `fcbfbaf908c63a193eb8ad852253aabdb880a051`
- Quality integration for topology/recovery. Commit: `c7a1561fa049a6c89863d1e34816c09bc2ec0c49`

## 6. Release / Certification work المنفذ

### Certification / Security
- `scripts/check-production-certification-boundary.mjs` — `35e9dbb0e907b4cfa529533b07cd3beecd762e09`
- `scripts/check-security-provenance-certification.mjs` — `5edd785f890428f208fe5f05d381394a31fced77`

### Provenance / Artifact
- `scripts/check-artifact-migration-provenance.mjs` — `17f48ebf6836f8a1cb1e3e592bc309f9d78a22e6`
- `scripts/check-release-artifact-integrity.mjs` — `bc2f1f2b96d2dd7d3c023f3e4c55d85dce7e3fb7`
- `scripts/check-rollback-decision-contract.mjs` — `8d27e749549aec79d118a27f3e3b48c250870210`

### Manifest / Evidence
- `scripts/build-release-manifest.mjs` — `36633c481966257bf782ccd42f18a107608a3953`
- `scripts/check-release-manifest-integrity.mjs` — `c029b98d1729d62f53431b0db4d0bbd335a65fa0`
- Manifest workflow — `864a4a871438de3ceb50108426f3311ef30e176a`
- `scripts/check-release-drift.mjs` — `0801e07e43a03955c21e8ad4a61545eabc7ce974`
- `scripts/check-release-evidence-snapshot.mjs` — `cda2ed0e61e1683ee886a15e8fbc238663614211`
- `scripts/check-evidence-freshness.mjs` — `971c9dde1295cee4070334fa780669e4119d54ea`
- `scripts/check-release-decision-provenance.mjs` — `e0d8bd561603d4f648618d2352acfdf247b97991`
- `scripts/check-release-audit-bundle.mjs` — `6854a064f490aff284a3fb50fcb18a8d4b3dcfeb`

### Unified release / recovery
- `scripts/check-release-gate-completeness.mjs` — `94687198491ee9804ad0ff7f4866e5633d460d40`
- `.github/workflows/production-release-gate-chain.yml` — `2fc36900190b878e36449b966ba4120503d4ba8c`
- `scripts/check-recovery-readiness.mjs` — `e7af4dca612761e6d19e3d24e4e6e29d7589618e`
- `.github/workflows/recovery-readiness.yml` — `be9daad4915f2c9b5082ffb77b5c1dcb974fe66c`
- `scripts/check-production-recovery-gate.mjs` — `2f3547b272511847f12a35b5ae686f390566a96e`

## 7. أشياء موجودة بالفعل ولا يجوز إعادة بنائها عميانًا

ابحث أولًا عن:

- Phase F Operational Resilience
- Backup/Restore verification
- Rollback/Forward-Fix drills
- Continuous Trust
- Production Release Blockers
- Unified Production Decision Chain
- Release Evidence / Evidence Manifest
- K/L/M runtime contracts
- Security/Tenant/RLS contracts

**المبدأ:** الموجود يُراجع ويُصلح ويُوحّد؛ لا نخلق بديلًا لمجرد اختلاف الاسم.

## 8. دروس ومشاكل تاريخية

- `profiles` كان فارغًا رغم `auth.users` وتم إصلاحه مع trigger و`heal_missing_profiles()`.
- Import preview كان يخطئ في مطابقة SKUs الموجودة؛ matching/mapping كان موضع إصلاح.
- Bulk import محكوم عبر Unified Import Engine.
- E2E كان متوقفًا سابقًا بسبب `AUTH=signed_out` ويحتاج owner runtime.
- Ollama محلي؛ لا تعيد `/api/chat` أو Lovable gateway.
- Performance/streaming عولج معماريًا بفصل Data Engine عن LLM وتحسين workers/streaming.
- Onyx isolation سابقًا: `236/236 PASS` و`onyx_datasets = 0`.
- النتائج القديمة لا تكفي لإعلان Production PASS؛ أعد التشغيل.

## 9. قائمة التنفيذ القادمة

### NOW-1 — Full topology inventory
- كل `.github/workflows/*`
- كل `scripts/check-*`
- تصنيف canonical / specialized / duplicate / obsolete
- ربط كل check بمرحلة استخدامه
- اكتشاف التكرار والتعارض

### NOW-2 — J/K/L/M deep audit
Contract → implementation → test → evidence، ثم إصلاح gaps الحقيقية فقط.

### NOW-3 — Autonomy deep audit
Safety / governance / decision chain / fail-closed / tenant boundaries.

### NOW-4 — Recovery deep audit
Static readiness / backup freshness / restore / rollback drill / RPO-RTO / live evidence.

### NOW-5 — Master Production Gate
توحيد القرار وإزالة المسارات المتكررة.

### NOW-6 — Real runtime verification
تشغيل فعلي، تحليل failures، إصلاح، وإعادة التشغيل.

### NOW-7 — Final certification
فقط بعد نجاح المسار الكامل.

## 10. سجل التقدم

### 2026-08-25 — Consolidation
- اكتُشف أن Quality يغطي معظم J/K/L/M/Autonomy/Production gates.
- تم منع J/K/L وAutonomy من التكرار على push.
- تمت إضافة CI topology guard.
- تم دمج topology/recovery checks داخل Quality.
- تم إنشاء هذا الفهرس الدائم لمنع إعادة الجهود.

### قالب إلزامي لكل تحديث لاحق

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

## 12. Golden Rule

> **لا تبدأ من الذاكرة. ابدأ من هذا الفهرس، ثم من المستودع نفسه.**
>
> بعد كل دفعة مؤثرة: حدّث الحالة والـcommits والاكتشافات والإصلاحات والخطوة التالية. هذا الملف هو ذاكرة سير العمل، وليس بديلًا عن فحص الكود الحالي.