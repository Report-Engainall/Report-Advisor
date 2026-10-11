# تقرير استئناف تنفيذي — 11 أكتوبر 2026 — بصمة المصدر في صفحة المجال الفعلية

## تعريف الرأس
- المستودع: `Report-Engainall/Report-Advisor`
- الفرع: `fix/source-bound-generic-intelligence-20261009`
- طلب السحب: [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912)، مفتوح وغير مدمج.
- آخر HEAD كود/اختبار في وقت كتابة هذا السجل: `eb56d92f8e13dd926be0c3980fdddcaa9cf97043`.
- إصلاح واجهة صفحة المجال: [`3e06dd9`](https://github.com/Report-Engainall/Report-Advisor/commit/3e06dd96517782acad9cf2aeab22e86d51380fd3).
- اختبار العقد المحدث: [`eb56d92`](https://github.com/Report-Engainall/Report-Advisor/commit/eb56d92f8e13dd926be0c3980fdddcaa9cf97043).
- `PRODUCT_COMPLETE = NO`; لا تدمج قبل إثبات رحلة المتصفح.

## لماذا لم يكن الإصلاح السابق كافيًا؟
قراءة تركيب الصفحات الحي أثبتت أن `/reports/inventory` لا يستخدم `SourceBoundReportSurface` الذي أُصلح في commit `c7c774a6...`. صفحة المجال تمر عبر `ReportsPage.tsx → SourceBoundDomainSurface → CustomerReportSurface`. لذلك كان الإصلاح السابق في رأس مشاركة آخر، ولم يعالج المكوّن الذي اختبره Chromium فعليًا.

## التغيير التنفيذي الحالي
- في `src/components/CustomerReportSurface.tsx` أُضيفت بصمة المصدر الكاملة `report.sourceHash` إلى واجهة صفحة المجال، بشكل ظاهر وقابل للكسر عبر الأسطر، مع `data-testid="customer-report-source-hash"`.
- في `scripts/smart-report-complete-intelligence-surface.test.mjs` أُضيف عقد انحدار يتأكد أن صفحة المجال تعرض البصمة الكاملة.
- لم يتم حذف شرط المتصفح الذي يرفض غياب بصمة المصدر، ولم تُضف بيانات افتراضية أو أرقام تجريبية.

## الأدلة الحية عند نقطة الحفظ
- على الرأس السابق `023d8d38...`: البناء والجودة نجحا؛ رحلة المتصفح فشلت بوضوح برسالة `inventory: source hash missing`.
- على الرأس `ae203723...`: Product Build Gate وQuality نجحا، واختبار الاستعادة الحية Phase-F نجح. لكن Handoff وFinal Certification فشلا بسبب نقص سجل الملفات.
- مسار CI الجديد بدأ على `eb56d92...`:
  - [Product Build Gate #1108](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159039145) — queued عند التحقق.
  - [Quality #12053](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159039134) — queued عند التحقق.
  - [Full Product Browser E2E #9733](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159039083) — pending/ينتظر دور التشغيل عند التحقق.
  - [Session Handoff #2564](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159039238) — queued.
  - [Final Certification #19112](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159039140) — queued.
  - [Phase-F #5583](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159039334) — جارٍ.
  - [Report Value Cohort #1310](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159039272) — queued/قيد التهيئة حينها.
- نجاح Phase-F [38158554444](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38158554444) هو على رأس `ae203723...` فقط، لا يُنقل تلقائيًا إلى HEAD الجديد.
- تجربة إنشاء المنتج التجاري على `ae203723...` فشلت بسبب `current_company_id HTTP 401` مع `JWT issued at future`; هذا يُسجل كإخفاق Auth/توقيت منفصل، لا كفشل في محرك ذكاء التقرير.
- معاينة Netlify وVercel ليست إثبات إنتاج. حدّ Vercel المجاني كان يقيّد بعض عمليات النشر؛ لا تُستهلك عمليات نشر إضافية بلا داعٍ.

## فجوات لم تُغلق
- يجب أن يمر اختبار المتصفح على `eb56d92...` أو رأس أحدث مع إثبات البصمة المرئية في صفحة المخزون.
- يجب أن تنجح Handoff وFinal Certification بعد تضمين ملفات التقرير المؤرّخ واختبار العقد ضمن تقرير الحالة.
- يجب استهلاك نتيجة Phase-F الدقيقة على HEAD الذي يحتوي إصلاح صفحة المجال.
- لا يزال إثبات رحلة رفع ملف جديد ثم حفظ كل النتائج وإعادة القراءة بعد التنقل/التحديث/إعادة الدخول غير مكتمل على الرأس الحالي.
- لا يوجد إثبات إنتاج مطابق للرأس الحالي.

## الإجراء التنفيذي التالي الوحيد
حدّث الحالة والذاكرة والتقرير الحالي بحيث تغطي صراحةً كل الملفات الجديدة في هذا الرأس، ثم اقرأ نتائج CI النهائية على الرأس الحي. عند فشل الاختبار، أصلح أول سبب جذري مسجل فقط؛ لا ترخِ متطلبات المصدر أو الاختبار ولا تدّعِ PASS غير مثبت.
