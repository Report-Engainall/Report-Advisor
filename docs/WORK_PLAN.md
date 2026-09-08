# Report-Advisor — خطة العمل التنفيذية الموحدة

> الهدف: تحويل Report-Advisor من مجموعة شاشات منفصلة إلى خط بيانات وذكاء مترابط يبدأ من أي مصدر وينتهي بتقرير وقرار قابل للإثبات.

| المسار | سياسة/قدرة | المطلوب | معيار الإغلاق | الحالة |
|---|---|---|---|---|
| I-01 | الاستيراد الموحد | ملف واحد، مجلد، رفع يدوي، مصدر خارجي عبر نفس pipeline | security→fingerprint→detect→parse→profile→map→dedupe→quality→route | قيد التنفيذ |
| I-02 | كشف نوع التقرير | اكتشاف تلقائي بالحقول + القيم + البنية + النص/OCR | معروف→كيان متخصص؛ غير معروف→تقرير عام | منفذ جزئيًا: classifier حتمي بالحقول والثقة + fallback عام؛ دمج القيم/النص/OCR والتشغيل E2E متبقٍ |
| I-03 | كشف الأعمدة | header detection + synonym dictionary + fuzzy/semantic mapping | كل عمود ظاهر، confidence، evidence، unknown preserved | قيد التنفيذ |
| I-04 | سياسة التكرار | SHA للملف + row/entity fingerprints + duplicate candidates | skip exact؛ candidate/conflict بمراجعة؛ لا حذف صامت | منفذ جزئيًا: deterministic resolution + governed pre-write policy؛ downstream writer wiring وE2E متبقيان |
| I-05 | سياسة الحقول | raw source محفوظ + canonical projection + lineage | لا يسقط أي حقل غير معروف | منفذ جزئيًا |
| I-06 | الصور/OCR | image/PDF OCR + confidence + visual asset tracking | النص/الجداول تستمر للتحليل؛ confidence evidence | منفذ جزئيًا |
| I-07 | تقرير عام | مساحة مستقلة لأي مصدر لا يطابق كيانًا | تقرير عام قابل للتصفح والتحليل دون اختراع بيانات | منفذ جزئيًا |
| D-01 | لوحة القيادة الذكية | KPIs حقيقية + freshness + quality + change detection | كل رقم له مصدر/وقت/tenant | قيد التنفيذ |
| D-02 | تحليل التقرير | profiling + relations + anomalies + schema drift | تقرير تفصيلي قابل للتنقل | منفذ جزئيًا: relation candidates + confidence/evidence؛ graph UI وanomaly/schema-drift متبقية |
| D-03 | التقارير الذكية | توليد تقرير من البيانات الفعلية | findings + evidence + drilldown | منفذ جزئيًا |
| A-01 | التوصيات | تحويل findings إلى actions | recommendation + impact + evidence + status | منفذ جزئيًا |
| F-01 | التنبؤات | forecasts مع confidence وإظهار البيانات المستخدمة | forecast + horizon + uncertainty + provenance | منفذ جزئيًا |
| AI-01 | المساعد الذكي | سؤال طبيعي على البيانات والأدلة | tenant-safe + grounded + citations | قيد التنفيذ |
| T-01 | مهام الأدوار | توليد مهام حسب الدور والأفق | task proposal مرتبط بمصدر + دليل | منفذ جزئيًا |
| T-02 | استدامة خطة العمل | حفظ المقترحات واستئنافها | tenant-safe + lifecycle + dedupe | منفذ |
| T-03 | القرار ← المهمة | تحويل المقترح المقبول بعد القرار | APPROVED + tenant member | منفذ |
| T-04 | المهمة ← الدليل ← النتيجة | start→evidence→complete→outcome→learning | لا تجاوز للموافقة والدليل | منفذ جزئيًا |
| T-05 | خطة التشغيل اليومية | read model دائم | tenant isolation + lifecycle | منفذ |
| Q-01 | جودة البيانات | duplicates/missing/outliers/conflicts | severity + resolution workflow | منفذ جزئيًا: quality summary + governed resolution policy؛ UI/persistence/E2E متبقية |
| R-01 | العلاقات | اكتشاف مفاتيح وعلاقات بين datasets | relation graph + confidence | منفذ جزئيًا |
| O-01 | التشغيل | queue/resume/progress/observability | لا تختفي العملية عند التنقل | منفذ جزئيًا |
| G-01 | الحوكمة | RLS + lineage + audit + evidence | كل عملية قابلة للتتبع | منفذ جزئيًا |
| E2E-01 | E2E | browser authenticated + tenant A/B | PASS بأدلة حية | محجوب تشغيليًا |
| PROD-01 | Production | runtime + backup + rollback | evidence حقيقي | محجوب تشغيليًا |

## Resolution governance

`src/lib/file-engine/resolution-policy.ts` يجعل القرار السابق للكتابة صريحًا وغير تدميري:

- `new` → `write_new` / يسمح بالكتابة
- `skip_exact` → `skip_exact` / يمنع النسخة الثانية
- `candidate_duplicate` → `review_duplicate` / يمنع الكتابة حتى المراجعة
- `conflict` → `review_conflict` / يمنع الكتابة حتى القرار

Implementation SHA: `c82e55a67b2f6717b2a389501385abbeea0a0bb8`.
Evidence: `docs/evidence/20260908-import-resolution-governance.md` (`e594d60823574929046542040989f6d26d52d6ca`).

## السياسات غير القابلة للتفاوض

1. لا نرمي مصدرًا قابلًا للقراءة؛ fallback إلى `general_report`/`document_analysis`.
2. لا نرمي عمودًا غير معروف؛ يبقى في raw source.
3. لا تكرار للكتابة بلا fingerprint.
4. لا تخصص بثقة منخفضة دون مراجعة.
5. لا رقم بلا مصدر.
6. نفس read-models عبر الشاشات.
7. الصور مصادر بيانات؛ OCR/Vision مع confidence.
8. كل مسار resumable.
9. المهام ليست تنفيذًا تلقائيًا.
10. الحفظ idempotent.
11. لا تحويل بلا قرار معتمد.
12. read models مشتقة وليست مصدر الحقيقة.
13. التعلم لا يغير السياسة بصمت.
14. learning ranking: حد أدنى 3 ملاحظات، حد أقصى ±15%.
15. التقرير التنفيذي يقرأ دورة القرار من read model واحد.
16. الذاكرة التنفيذية دائمة ومثبتة بـSHA.

## ترتيب التنفيذ

**Wave A:** I-01..I-07 + D-02 + Q-01 + R-01.

**Wave B:** D-01 + D-03 + A-01 + F-01 + T-01 + T-02 + T-05.

**Wave C:** AI-01 + semantic report interpretation + visual understanding.

**Wave D:** T-03 + T-04 + E2E + observability + performance + backup/restore/rollback + certification.

لا يُعتبر المنتج نهائيًا للبيع قبل إغلاق Wave D بالأدلة المطلوبة.
