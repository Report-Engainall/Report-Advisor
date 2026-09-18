# Selective Competitive Tracks — Report-Advisor

> **OWNER-APPROVED 2026-09-18:** هذه المسارات الخمسة هي تركيز تنافسي انتقائي معتمد؛ ليست backlog ميزات. لا يُضاف أي نطاق جديد دون Product Value Gate والدليل المناسب.
## 2026-09-18

> هذه الوثيقة ليست Product Backlog مشتقًا من Upwork. أمثلة السوق تستخدم فقط لاكتشاف أين يمكن لمنتجنا الحالي أن ينافس بقوة. لا تتحول أي إشارة سوقية إلى ميزة إلا بعد Product Value Gate.

## الهدف
جعل Report-Advisor الصغير قادرًا على الفوز بصفقات محددة أمام عروض أكبر منه عبر:
**تخصص واضح + دليل أقوى + تجربة عرض أسرع + نطاق تنفيذ منضبط.**

## Track 1 — Evidence-First BI / Executive Reporting
**المشكلة التي نستهدفها:** عميل لديه بيانات أعمال متفرقة ويريد KPI/تقارير يمكن تتبعها، لا Dashboard شكلي.
**الأصول الموجودة:** canonical dashboard, reports, metric inspector, truth states, executive report, evidence-oriented UX.
**دليل البيع:** KPI → تعريف → مصدر → فترة → تقرير → قرار.
**عرض 5 دقائق:** Dashboard → KPI → Evidence → Executive Report.
**لا نبني لهذا المسار:** BI platform عامة أو عشرات visualization types لمجرد المنافسة.

## Track 2 — Supabase Multi-Tenant Security / RLS Remediation
**المشكلة:** SaaS قائم لديه tenant leakage أو سياسات RLS غير منضبطة.
**الأصول الموجودة:** tenant isolation, RLS contracts, service-role boundaries, deny/fail-closed thinking, exact-head verification.
**دليل البيع:** Actor A/B → allowed path → denied cross-tenant path → evidence.
**عرض 10 دقائق:** نموذج عزل + policy boundary + اختبار رفض.
**لا نبني:** منتج security scanner عام أو بديل كامل لـSupabase.

## Track 3 — Excel/CSV → Governed Data Pipeline
**المشكلة:** العميل يملك ملفات Excel/CSV ومستندات ويريد إدخالًا موثوقًا إلى نظام أعمال.
**الأصول الموجودة:** canonical import path, extraction/normalization/validation concepts, data quality, reconciliation, import checkpoints.
**دليل البيع:** Source → Validation → Reconciliation → Canonical Data → Report.
**عرض 10 دقائق:** ملف → مراجعة → نتيجة حاكمة → أثر على التقرير.
**لا نبني:** ETL platform عامة أو connectors بلا طلب متكرر.

## Track 4 — Arabic RTL B2B Operations UX
**المشكلة:** نظام أعمال عربي يحتاج واجهة RTL احترافية، mobile/low-bandwidth، وليس ترجمة سطحية.
**الأصول الموجودة:** Arabic-first shell, RTL, responsive, accessibility, compact data surfaces.
**دليل البيع:** نفس workflow على desktop/mobile مع وضوح الحالات والأخطاء والـkeyboard.
**عرض 5 دقائق:** login → dashboard → operation → report على شاشة صغيرة.
**لا نبني:** design system تجميلي منفصل عن workflows الحقيقية.

## Track 5 — Inventory / Receivables Decision Workspace
**المشكلة:** صاحب تجارة/توزيع لديه مخزون أو ذمم ويحتاج قرارًا تشغيليًا، لا مجرد أرقام.
**الأصول الموجودة:** inventory intelligence, demand velocity, receivables/aging, decision experience, truth rails.
**دليل البيع:** Observation → evidence → priority → action path.
**عرض 10 دقائق:** stock/receivable signal → explanation → decision workspace.
**لا نبني:** ERP كامل أو forecasting platform عامة قبل وجود repeated demand.

## Track Selection Rule
الفرصة تدخل التنفيذ التجاري إذا:
1. تطابق Track واحدًا أو أكثر بوضوح.
2. لدينا capability حقيقية قريبة من المطلوب.
3. يمكن إنتاج proof path سريع.
4. نطاق التسليم يمكن حصره.
5. لا يتطلب fork معماري أو ادعاء خبرة غير مثبت.

## Commercial Packaging
لا نبيع «Report-Advisor كله» لكل عميل.
نبيع نتيجة مركزة:
- BI Evidence Sprint
- Supabase Tenant-Security Sprint
- Governed Excel/Data Import Sprint
- Arabic B2B UX Upgrade
- Inventory/Receivables Decision Sprint

هذه عروض تجارية مقترحة، وليست Features يجب إضافتها للمنتج.

## Market Signal Handling
إعلان واحد = Signal.
تكرار مشكلة + قيمة استراتيجية + ملاءمة المنتج = Candidate.
Candidate يمر Product Value Gate.
فقط بعد اجتياز البوابة يمكن أن يصبح Product Work.

## Competitive Rule
لا نحاول هزيمة شركة أكبر في «عدد الميزات».
نحاول هزيمتها في:
- وضوح المشكلة
- قوة الإثبات
- سرعة الوصول للنتيجة
- جودة النطاق
- صدق الادعاء
- سهولة تسليم نتيجة قابلة للقبول

## Success Measure
نريد أن نعرف:
- أي Track ينتج أكثر فرصًا qualified.
- أي Track يملك أعلى proof coverage.
- أين نحتاج Proof Gap فقط، وأين يوجد Product Gap حقيقي.
- أي عرض يمكن تنفيذه بسرعة مع إعادة استخدام عالية.

## Ownership
ChatGPT:
- تحديد المسارات
- Product/UX proof surfaces
- Proposal/Demo framing
- Portfolio narrative

Programmer:
- runtime/security/integrations/certification required by the selected engagement.

Owner:
- اختيار الفرص الخارجية وإرسال العروض والتعاقد والالتزامات التجارية.
