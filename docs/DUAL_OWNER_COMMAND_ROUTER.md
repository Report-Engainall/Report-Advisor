# Report-Advisor — Dual Owner Command Router
## Effective: 2026-09-18

هذه الوثيقة هي مفتاح التشغيل بين المالك/الذكاء الاصطناعي والمبرمج.
الرقم وحده يحدد المسار؛ لا حاجة لشرح الدور في كل مرة.

## 1. COMMAND = 1
الرقم **1** يعني: **Owner 1 — التطوير الشامل للمنتج**.
Owner 1 مسؤول عن تطوير المنتج وتجربة المستخدم وكل ما يلزم لإكمال المنتج من جهة التطوير.
Owner 1 لا يتولى تشغيل الإنتاج أو اعتماد الإطلاق بدل Owner 2.
عند استلام «1» يبدأ التنفيذ مباشرة من آخر حالة مؤكدة.

## 2. COMMAND = 2
الرقم **2** يعني: **Owner 2 — العمليات، Runtime، التكامل، الاعتماد والإطلاق**.
Owner 2 مسؤول عن تشغيل ما تم تطويره، إصلاح blockers التشغيلية، CI/CD، DB، الأمن، E2E، resilience، certification والإطلاق.
Owner 2 لا يعيد تصميم المنتج أو يفتح موجات UI لمجرد تحسين الشكل.

## 3. SOURCE OF TRUTH
كلا المالكين يقرآن قبل العمل:
1. هذا الملف.
2. docs/MASTER_PRODUCT_SPEC_AND_EXECUTION_PROTOCOL.md
3. docs/MASTER_EXECUTION_INDEX.md
4. docs/PARALLEL_EXECUTION_COORDINATION_PROTOCOL_2026-09-18.md
5. ملف التواصل الخاص بهما.

لا تُنقل Evidence بين SHAs.
المعيار هو Exact HEAD + البيئة + الاختبار + الأثر الفعلي.

## 4. STARTUP HANDSHAKE
قبل أي mutation، يكتب المالك في ملف التواصل الخاص به:
START / التاريخ والوقت / OWNER / BRANCH / EXACT HEAD / الهدف الحالي / الملفات المحتمل تعديلها / dependencies / blockers / NEXT.
لا يبدأ تنفيذ صامتًا.

## 5. OWNERSHIP BOUNDARY
Owner 1 يملك product/UI/domain development.
Owner 2 يملك runtime/DB/CI/security/operations/release.
الملفات المشتركة لا تُعدّل بالتوازي.
أي handoff يجب أن يحتوي branch + exact SHA + الاختبارات + المطلوب التالي.

## 6. NO-WAIT RULE
إذا كان مسار خارجي محجوبًا، يسجل صاحبه BLOCKED مع dependency دقيقة.
ثم يواصل كل المسارات المستقلة.
لا يجوز إيقاف التطوير الشامل فقط لأن اعتماد الإطلاق ينتظر Secret/Provider/Device.

## 7. NO-FABRICATION RULE
ممنوع fake PASS، fake session، fake tenant، fake transaction، fake OCR، fake evidence، fake result أو service-role browser auth.
UI لا تعتبر مكتملة إذا كانت توحي بسلوك backend غير موجود.

## 8. EXACT-HEAD RULE
بعد كل commit:
Branch:
SHA:
HEAD label:
Tests:
Evidence:
NEXT HANDOFF:
تغيير SHA يلغي صلاحية أي claim متأثر به ويستلزم إعادة الاختبارات المتأثرة فقط.

## 9. MAIN PROTECTION
لا تعديل مباشر على main أثناء الموجات التنفيذية.
كل تغيير يمر عبر branch واضح وPR/hand-off واضح.
لا force-push على عمل المالك الآخر.

## 10. COMMAND SEMANTICS
«1» = واصل Owner 1 development من آخر HEAD مؤكد.
«2» = واصل Owner 2 operations/release من آخر HEAD مؤكد.
أي رقم لا يساوي 1 أو 2 لا يغيّر ملكية المسار.

## 11. DEFINITION OF HANDOFF
READY_FOR_HANDOFF لا تعني أن المسار كامل.
تعني أن التغيير committed، والاختبارات المرتبطة به مثبتة، ولا توجد mutation غير مسجلة، ويمكن للمالك الآخر دمجه أو اختباره على SHA المحدد.

## 12. CURRENT VERIFIED SNAPSHOT
MAIN HEAD = 1568e43889d27b5d850e64c0b99d03a994fd3bbe
UI HEAD = bce816945d6a12a17d14aaaa9034b81cd183f9af
INTEGRATION HEAD = 0eab10cd94da5705345be129da663a440a98db7e
هذه اللقطة مرجعية فقط؛ يجب إعادة قراءة refs قبل كل mutation.

## 13. AUTHORITATIVE END STATE
المنتج لا يسمى SALE READY / PRODUCTION CERTIFIED إلا بعد إغلاق متطلبات Owner 2 على Exact Release SHA.
Owner 1 قد يكون COMPLETE PRODUCT DEVELOPMENT بينما Owner 2 ما زال OPEN RELEASE.
هذه حالتان مستقلتان ولا تختلطان.

## 14. REQUIRED RESPONSE TO USER
عند استلام 1 أو 2:
ابدأ التنفيذ مباشرة.
لا تطلب من المستخدم إعادة شرح الدور.
لا تعيد سرد الوثيقة كاملة.
اعرض فقط الحالة الفعلية، ما أُنجز، ما بقي، والانتقال التالي.
