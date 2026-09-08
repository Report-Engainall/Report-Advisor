# Executive Decision Report Read Model — 2026-09-08

## Batch result
أُضيف read model موحد للتقرير التنفيذي يجمع السجل المحفوظ بدل استنتاج دورة القرار من نص الشاشة.

## Source of truth
- `business_intelligence_decisions`: القرار، السياسة، الحالة، الثقة، الأثر المتوقع، الموافقة، التنفيذ، evidence.
- `recommendations`: التوصية المرتبطة والمالك والحالة والأثر المتوقع وsnapshot/metric metadata.
- `decision_work_items`: التنفيذ، القسم، المسؤول، الحالة، الأدلة، الأثر المتوقع/الفعلي.
- `decision_outcomes`: النتيجة المرصودة، actual/expected/impact، label، evidence snapshot.
- `recommendation_outcomes`: نتيجة التوصية وactual/expected/outcome quality.

## Runtime boundary
`public.get_executive_decision_report(integer)` هو `SECURITY INVOKER`، tenant-bound عبر `current_company_id()`, ويقبل `authenticated` فقط. تم التحقق في Staging من: `security_definer=false`, `anon_exec=false`, `authenticated_exec=true`, `tenant_bound=true`.

## UI
تم ربط `ExecutiveReportPage` بـ `ExecutiveDecisionReportPanel` الذي يعرض decision → approval → work items → outcome → learning من read model واحد. زر Print/PDF الحالي يبقى إخراجًا للشاشة نفسها؛ لم يتم إنشاء مصدر PDF موازٍ.

## Integrity
لا يتم اختلاق actual outcome أو evidence أو impact. عند غيابها يظهر أنها غير مسجلة. القراءة لا تغيّر master data ولا تنفذ قرارات.

## Verification boundary
هذا إغلاق على مستوى الكود + Staging schema/read-model boundary. لم يتم الادعاء بـ authenticated browser E2E أو live Tenant A/B أو Production/Backup/Rollback certification.
