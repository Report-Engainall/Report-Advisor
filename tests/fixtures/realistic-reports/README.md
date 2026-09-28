# Realistic Report Fixtures — Report-Advisor / الأغبري

هذا المجلد مخصص لملفات اختبار حقيقية الشكل لمسار:

Upload → Format Detection → Security → Extraction → Understanding → Specialty Detection → Matching → Normalization → Quality → Trust → Review → Canonical Commit → Analysis → Evidence → Signal → Decision → Work → Outcome/Learning → Benchmark

## قواعد رفع الملفات

1. استخدم ملفات منزوعة البيانات الحساسة فقط.
2. لا ترفع أسماء عملاء حقيقيين، هواتف، بريدًا، عناوين، أرقامًا ضريبية، حسابات بنكية، رموز وصول، أو أي أسرار.
3. احتفظ ببنية التقرير، أنواع الأعمدة، اختلافات التسمية، القيم الناقصة، التواريخ، العملات، وتكرار الصفوف قدر الإمكان.
4. التنوع أهم من الحجم؛ ملفات صغيرة واقعية أفضل من ملف ضخم مصنوع بلا تنوع.

## المجموعة المقترحة

- sales.xlsx — مبيعات متعددة الصفوف، عربية/إنجليزية، تواريخ، خصومات، ضريبة، عملة.
- purchases.csv — مشتريات مع موردين وتكاليف ووحدات مختلفة.
- inventory.csv — رصيد مخزون، مستودع، SKU، تكلفة، نقطة طلب، وحالات صفرية عند الحاجة.
- receivables.xlsx — فواتير، استحقاق، مدفوع، متبقي، وأعمار متنوعة.
- scanned-arabic-report.pdf — PDF عربي ممسوح ضوئيًا لاختبار OCR/الحجب.
- structured-arabic-report.pdf — PDF عربي نصي لاختبار الاستخراج المنظم.
- mixed-report.xlsx — أعمدة إضافية، أسماء بديلة، حقول ناقصة وتنسيقات مختلطة.
- low-quality.csv — ملف متعمد به نقص/تعارضات لاختبار REVIEW / BLOCKED / INSUFFICIENT DATA.
- multi-currency.csv — ملف متعدد العملات لاختبار كشف عدم اتساق العملة وعدم اختلاق تحويل.

## ما نريد إثباته لكل ملف

- fingerprint
- format / specialty detection
- extraction result
- quality / trust state
- lifecycle: queued → fingerprinted → extracted → canonicalized → validated → analyzed → decisioned → committed → rendered
- canonical commit evidence
- evidence snapshot
- source-bound recommendation / decision
- final report output
- الفشل المنضبط عند نقص الدليل

لا تعتبر النتيجة ناجحة لمجرد انتهاء الرفع؛ النجاح يتطلب إثبات الحالة الكانونية وسلسلة الدليل كاملة.

## ملاحظة

هذه الملفات Fixtures للاختبار فقط، وليست قاعدة بيانات إنتاجية ولا مسار importer جديدًا لكل تخصص.
