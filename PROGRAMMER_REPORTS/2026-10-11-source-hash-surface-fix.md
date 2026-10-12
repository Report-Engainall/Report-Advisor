# تقرير استئناف تنفيذي — 2026-10-11 / إصلاح بصمة المصدر على الشاشات المرتبطة

- المستودع: `Report-Engainall/Report-Advisor`
- الفرع: `fix/source-bound-generic-intelligence-20261009`
- طلب السحب: [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912) — مفتوح وغير مدمج.
- رأس الكود الحالي بعد الإصلاح: `c7c774a6f1c6b620e99b7b628d586e99c8cc1bfc`
- الرأس الذي اختُبر في التشغيل الفاشل السابق: `023d8d38d0c05e6b62c872b234422f9d717e2727`
- الحالة: `PRODUCT_COMPLETE = NO`، `DO_NOT_MERGE = true`.

## آخر تقرير تم العثور عليه
ملف `ONE-PROGRAMMER-SESSION-MEMORY.md` وآخر سجلات `docs/execution/CURRENT_SESSION_STATE.md` و`docs/execution/PROGRAMMER_CURRENT_REPORT.md` لم تكن متوافقة مع آخر فشل فعلي؛ أقدم سجل في الذاكرة حدّد الرأس `023d8d38...` وطلب فحص اختبارات المتصفح والاستعادة والاعتماد.

## دليل حي قرأناه من GitHub
- Product Build Gate [38157202890](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202890): SUCCESS على `023d8d38...`.
- Quality [38157202815](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202815): SUCCESS على الرأس نفسه.
- Full Product Browser E2E [38157202976](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202976): FAIL. خطوة المتصفح والهوية مرت، وإثبات 48 archetypes أبلغ عن نجاحه، لكن رحلة الأعمال فشلت برسالة `inventory: source hash missing`.
- Session Handoff [38157202962](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202962): FAIL بسبب تقرير قديم لم يغطِّ خمسة ملفات: `scripts/check-phase10-backup-restore-contract.mjs`, `scripts/phase-f-live-resilience-probes.mjs`, `scripts/resilience-runtime.test.mjs`, `scripts/smart-report-complete-intelligence-surface.test.mjs`, `src/components/ReportIntelligencePanel.tsx`.
- Final Certification [38157202927](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202927): FAIL عند نفس حاجز تسليم الحالة القديم.
- Phase-F [38157202966](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202966): CANCELLED قبل تشغيل فحوص الاستعادة الحية.
- معاينة Netlify ورابط Vercel أبلغا نجاح الحالة للـ `023d8d38...`، لكن هذا ليس إثبات إنتاج أو اكتمال.

## التغيير الفعلي في هذا الاستئناف
- في `src/components/SourceBoundReportSurface.tsx` أُضيف عرض مرئي كامل لبصمة SHA-256 في رأس السطح المصدرّي المشترك، مع `data-testid="source-bound-report-source-hash"`.
- السبب المباشر الذي أثبته اختبار Chromium هو أن سطح المخزون المرتبط بالتقرير لم يعرض بصمة المصدر في النص المرئي، رغم أن معرّف التقرير والبصمة مرّرا في الرابط وجرى التحقق من قراءة المهمة ذاتها. الإصلاح يعرض البصمة صراحةً على الشاشات التنفيذية/الثقة/القرار/العمل التي تستخدم رأس المصدر المشترك؛ لم نخفّف شرط الاختبار.
- commit الإصلاح: [c7c774a6](https://github.com/Report-Engainall/Report-Advisor/commit/c7c774a6f1c6b620e99b7b628d586e99c8cc1bfc).

## ما لم يثبت بعد
- لا يوجد بعد PASS لرحلة Chromium على الرأس الجديد `c7c774a6f1c6b620e99b7b628d586e99c8cc1bfc`.
- لا يوجد PASS جديد للاستعادة الحية أو اعتماد الإصدار أو تسليم الحالة بعد إصلاح البصمة.
- لا يُدّعى إثبات رفع ملف جديد ثم حفظه وإعادة قراءته بعد تسجيل الخروج/الدخول على الرأس الجديد.
- لا يُدّعى نشر إنتاجي مطابق للرأس الجديد.

## الخطوة التنفيذية التالية الوحيدة
انتظر/اقرأ نتائج CI التي انطلقت من commit `c7c774a6f1c6b620e99b7b628d586e99c8cc1bfc`، ثم أصلح أول فشل نهائي في Full Product Browser E2E؛ بعده أعد إثبات Phase-F وSession Handoff وFinal Certification على الرأس ذاته. لا تدمج قبل إغلاق الفشل وإثبات بصمة المصدر عبر كل شاشة مرتبطة.
