SESSION HANDOFF = READY
PROGRAMMER_REPORT_STATUS = ACTIVE_EXECUTION
CURRENT MAIN HEAD = e1454854c0d4da4bbc89bb3af724e2aabeb50262
REFERENCE START HEAD = e1454854c0d4da4bbc89bb3af724e2aabeb50262
CURRENT EXECUTION HEAD = 9a17ec8cfb1504147076fc8ae8cf2318900038b7
REPORT_FOR_HEAD = 9a17ec8cfb1504147076fc8ae8cf2318900038b7
BRANCH = exec/final-reconcile-20261005
PR = #841 OPEN
UPDATED_AT = 2026-10-05T02:14:30Z

OBJECTIVE = إغلاق فجوة المنتج الفعلي للبيع: تقرير حقيقي يظهر ويُفهم ويقود إلى Evidence ثم Signal ثم Recommendation ثم Decision ثم Action، مع إثبات Browser حقيقي و48 archetypes حقيقية.

ACTUAL_IMPLEMENTATION
1) Report Center/Sales/Purchases/Receivables rendering: فصل critical snapshot عن background catalog/invoice hydration حتى لا تبقى الشاشة في loading غير منتهٍ.
2) Smart Report: إضافة decision-chain تجاري واضح WHAT/WHY/SO WHAT/IMPACT/WHAT NEXT/PROOF وربطه ببيانات التقرير الحقيقي.
3) Browser proof: الاستقرار أصبح شرط نجاح، وSmart Report يتطلب العناصر الستة، jobId/sourceHash، refresh readback، وtelemetry من صفحة tenant الصحيح.
4) 48 real-source proof: eligibility أصبحت عبر corpus tenant IDs المصرح بها، service-role للأهلية فقط، مع same-company source binding، وبدون synthetic corpus.
5) Browser Smart Report proof: tenant B أصبح مرتبطًا بمالك التقرير الحقيقي c42fb0e1 بدل tenant corpus افتراضي آخر.
6) CI governance: real-48 لم يعد continue-on-error، وsession handoff يُحدّث مع كل HEAD.

CURRENT_EVIDENCE
- Current HEAD: 9a17ec8cf.
- Session Handoff Contract: PASS على HEAD الحالي.
- Typecheck/local route checks: PASS.
- Phase 2 security: PASS.
- Phase 3 data/import truth: PASS.
- Cloudflare branch preview deployed successfully for 9a17ec8cf.
- Corpus inventory currently: 54 governed real files across 4 corpus tenants; 47 VERIFIED/READY passports.
- Real certified Smart Report: c42fb0e1-75f2-4727-8c3e-470ae1a804fa, 342 canonical rows, VERIFIED evidence, READY decision.

OPEN GATES
- Full Product Browser E2E terminal result.
- Real-source 48/48 terminal matrix result.
- Chromium screenshots for reports and Smart Report.
- Final Certification Gate on the same HEAD.

FIRST FAILURE HISTORY
- Prior Browser failure: report expectations were stale and screenshot artifact names contained query characters.
- Prior certification failure: continue-on-error in real-48 and stale session handoff.
- Prior real-48 failure: actor tenant saw only 25 completed jobs and target report belonged to another corpus tenant; eligibility gate therefore proved 17/48, not 48/48.
- These are addressed in the current candidate; no PASS is claimed until exact-head terminal evidence arrives.

NEXT_EXACT_ACTION = متابعة jobs الخاصة بالرأس 9a17ec8cf، والتقاط أول failure فقط إن ظهر، ثم إعادة إصلاحه على نفس الرأس الجديد. لا إعلان “جاهز للبيع” قبل PASS نهائي متزامن للـ48 والـBrowser والـCertification.