# Report-Advisor — Owner 1 / Full Product Development Execution Protocol
## Command: 1

## 0. Role
Owner 1 = مسؤول التطوير الشامل للمنتج وتجربة الاستخدام والميزات التشغيلية من منظور المنتج.
المصدر المرجعي للهدف هو MASTER_PRODUCT_SPEC_AND_EXECUTION_PROTOCOL.md.
المطلوب هو **إكمال المنتج الموجود** لا إعادة بنائه.

## 1. PRIMARY OBJECTIVE
تحويل Report-Advisor إلى Business Command System تجاري متماسك:
DATA → IMPORT → VALIDATE → RECONCILE → INTELLIGENCE → EVIDENCE → RECOMMENDATION → DECISION → APPROVAL → WORK → OUTCOME → REPORT.
لا يجوز أن تكون الشاشة أجمل من السلوك الحقيقي الذي تمثله.

## 2. PRODUCT HIERARCHY
الأولوية في الواجهة:
Today → Operations → Money → Intelligence & Decisions → Outputs → Reference Data → Administration.
الـDashboard ليس فهرس CRUD.
Reports هي Decision Outputs.
Evidence/Freshness/Truth جزء من التجربة وليست صفحة ثانوية.

## 3. DEVELOPMENT SURFACES
Owner 1 يغلق، حسب حالة HEAD الفعلية، كل ما تبقى من:
- Application Shell / Sidebar / Header / Command Palette.
- Executive Command Center وWork Center.
- Sales, Purchases, Profitability, Receivables, Inventory, Demand.
- Customers, Products, Alternative Groups ومرجع البيانات.
- Analytics, Intelligence, Metric Inspector, RFM/ABC/Aging.
- Decision Experience, Recommendations, Forecasts, Scenarios.
- Reports وExecutive Reports ومخرجات القرار.
- Import/Analyze وDocument Intelligence وFile Analysis وOnboarding.
- Data Quality, System Health, Profile/Company/Settings.
- Proposal Demo / sellable presentation surfaces.

## 4. UX CONTRACT
كل مسار معدل يجب أن يحافظ على:
Arabic RTL، responsive/mobile، low-bandwidth، accessibility، focus states،
loading/empty/error/review/reject/insufficient-data states، tenant scope، truth context،
as-of/freshness، evidence links، progressive disclosure.

## 5. BUSINESS TRUTH
لا تُنشأ KPI أو recommendation أو status تخميني في الواجهة.
استخدم canonical reads/RPCs الحالية.
إذا لم توجد بيانات موثوقة اعرض حالة fail-closed مثل غير متاح/لا توجد بيانات.
لا تنقل commit terminal state إلى UI إذا كانت authoritative في backend.

## 6. CANONICAL RUNTIME PATHS
الالتزام بالمسارات الموجودة، ومنها:
get_dashboard_snapshot
get_dashboard_intelligence
runDurableProductionLifecycle
production-coordinator-bridge.ts
import_commit_batch
import_finish_job
لا تُنشئ Runner أو RPC بديلًا لأن التنفيذ الحالي يحتاج إصلاحًا.

## 7. DEVELOPMENT METHOD
لكل جبهة:
1. اقرأ current Exact HEAD.
2. افحص implementation الفعلي.
3. حدد فجوة منتج حقيقية.
4. نفذ أصغر تغيير صحيح.
5. اختبر المسار المركز.
6. اختبر العقد المرتبطة.
7. commit مستقل.
8. سجل SHA وEvidence.
9. انتقل فورًا للجبهة المستقلة التالية.

## 8. VISUAL SYSTEM
وحّد typography/spacing/surfaces/buttons/forms/tables/badges/tabs/dialogs.
لا تسمح بتباين بصري بين الصفحات الجديدة والقديمة.
اعتمد أسلوب Aghbari التجاري المرجعي دون نسخ صورة مرجعية أو تحويلها إلى تصميم حرفي.
لا تضف assets ثقيلة أو حزمًا غير لازمة.

## 9. MOBILE/PWA
كل surface جديد يجب أن يعمل على شاشة صغيرة.
استخدم lazy loading وroute splitting حيث يلزم.
لا تجعل الجداول أو الرسوم أو drawers حاجزًا أمام الاستخدام المحمول.
حافظ على PWA/offline shell الموجود.

## 10. INTELLIGENCE / DECISION UX
المساعد داخل Intelligence وليس كطبقة chat منفصلة بلا سياق.
اربط Evidence → Recommendation → Decision → Work → Outcome في نفس الرحلة.
احترم confidence/freshness/tenant/evidence states.
لا تُظهر سببًا غير مدعوم بالبيانات.

## 11. IMPORT / DOCUMENT EXPERIENCE
حافظ على lifecycle:
queued → fingerprinted → extracted → canonicalized → validated → analyzed → decisioned → committed → rendered.
الواجهة تعرض الحالة الحقيقية فقط.
OCR confidence:
<50 reject، 50–74 review، ≥75 trusted، مع provenance مرئي عند الحاجة.
لا تُرسل raw documents إلى local AI.

## 12. REPORTS / OUTPUTS
التجربة تبدأ من المخرج أو القرار، ثم الدليل والتفاصيل.
لا تعيد CRUD catalogue كمنطق المنتج.
كل تقرير canonical يجب أن يعرض truth context ويقود إلى investigation مناسب.
Browser export لا يُمثّل نفسه كـdurable worker إن لم يكن كذلك.

## 13. DATA / TENANT UX
أي saved view/filter/grouping/reset يجب أن يكون tenant-scoped.
لا تستخدم company ID محليًا إذا كان canonical resolver موجودًا.
لا تسمح لواجهة Tenant A بإظهار أو تعديل أي بيانات Tenant B.

## 14. PERFORMANCE
الهدف ليس benchmark للتصميم فقط.
راقب bundle weight، route chunks، duplicate components، unnecessary imports.
الحد الحالي للـcritical bundle من عقود المشروع يجب احترامه.
لا تضيف مكتبة ثقيلة لحل مشكلة يمكن حلها بالمكونات الموجودة.

## 15. ACCESSIBILITY
keyboard navigation، visible focus، semantic labels، aria states،
dialog escape، pressed/selected states، reduced motion، contrast.
أي regression في هذه الطبقة يُعالج في نفس موجة التطوير.

## 16. QUALITY GATES
عند تعديل UI/Product شغّل حسب التغيير:
- typecheck
- production build
- route/sidebar parity
- product/UI contracts
- dashboard truth contracts
- targeted browser sanity
لا تعيد E2E/runtime الشامل إلا إذا التغيير يؤثر عليه أو SHA/contract/environment تغير.

## 17. BLOCKERS
إذا احتاجت الجبهة إلى Secret/DB/runtime غير متاح:
سجل BLOCKED في Owner 1 Communication.
لا تختلق backend behavior.
أكمل surface development المستقل.

## 18. HANDOFF TO OWNER 2
يجب إرسال:
OWNER: 1
BRANCH:
UI HEAD:
CHANGED:
TESTED:
NOT TESTED:
KNOWN BLOCKERS:
NEXT HANDOFF:
لا يقال «تم» بدون SHA.

## 19. DEFINITION OF DONE — OWNER 1
Product surface complete عندما:
- feature intent واضح.
- canonical data path موجود ويُستخدم.
- states truthful.
- RTL/mobile/accessibility متماسكة.
- route/deep-link يعمل.
- targeted contracts PASS.
- لا توجد duplicate architecture.
- commit exact SHA موثق.
هذا لا يساوي Production Certification.

## 20. CONTINUE RULE
بعد كل commit ناجح:
لا تنتظر Owner 2.
استكشف الجبهة الأعلى قيمة التالية.
فقط توقف عند dependency لا يمكن تجاوزها محليًا.

## 21. FINAL PRODUCT CHECK BEFORE HANDOFF
راجع:
Today، Operations، Money، Intelligence، Decisions، Outputs،
Import، Data Quality، Reference Data، Settings،
PWA، mobile، accessibility، truth/evidence/freshness.
ثم سجّل handoff في OWNER_1_COMMUNICATION.md.

## 22. REQUIRED START MARKER
عند استلام الرقم 1، ابدأ ملف التواصل بهذا الشكل:
START | OWNER=1 | BRANCH=<exact> | HEAD=<exact> | OBJECTIVE=<one line>
ثم EXECUTION entries لكل mutation.
