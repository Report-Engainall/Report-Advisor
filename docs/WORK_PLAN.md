# Report-Advisor — خطة العمل التنفيذية الموحدة

> الهدف: تحويل Report-Advisor من مجموعة شاشات منفصلة إلى خط بيانات وذكاء مترابط يبدأ من أي مصدر وينتهي بتقرير وقرار قابل للإثبات.

| المسار | سياسة/قدرة | المطلوب | معيار الإغلاق | الحالة |
|---|---|---|---|---|
| I-01 | الاستيراد الموحد | ملف واحد، مجلد، رفع يدوي، مصدر خارجي عبر نفس pipeline | نفس مراحل security→fingerprint→detect→parse→profile→map→dedupe→quality→route | قيد التنفيذ |
| I-02 | كشف نوع التقرير | اكتشاف تلقائي بالحقول + القيم + البنية + النص/OCR | معروف→كيان متخصص؛ غير معروف→تقرير عام | قيد التنفيذ |
| I-03 | كشف الأعمدة | header detection + synonym dictionary + fuzzy/semantic mapping | كل عمود ظاهر، confidence، evidence، unknown preserved | قيد التنفيذ |
| I-04 | سياسة التكرار | SHA للملف + row/entity fingerprints + duplicate candidates | skip exact duplicate؛ تحديث/تعارض بمراجعة؛ لا حذف صامت | قيد التنفيذ |
| I-05 | سياسة الحقول | raw source محفوظ + canonical projection + lineage | لا يسقط أي حقل غير معروف | منفذ جزئيًا |
| I-06 | الصور/OCR | image/PDF OCR + confidence + visual asset tracking | النص/الجداول تستمر للتحليل؛ confidence evidence | منفذ جزئيًا |
| I-07 | تقرير عام | مساحة مستقلة لأي مصدر لا يطابق كيانًا | تقرير عام قابل للتصفح والتحليل دون اختراع بيانات | منفذ جزئيًا |
| D-01 | لوحة القيادة الذكية | KPIs حقيقية + freshness + quality + change detection | كل رقم له مصدر/وقت/tenant | قيد التنفيذ |
| D-02 | تحليل التقرير | profiling + relations + anomalies + schema drift | تقرير تفصيلي قابل للتنقل | منفذ جزئيًا |
| D-03 | التقارير الذكية | توليد تقرير من البيانات الفعلية | findings + evidence + drilldown | منفذ جزئيًا: Executive Decision Report read model + freshness/as-of + lifecycle quality + evidence/lineage refs + print-safe page؛ ما زال PDF artifact verification وE2E مطلوبًا |
| A-01 | التوصيات | تحويل findings إلى actions | recommendation + impact + evidence + status | منفذ جزئيًا: outcomes attribution + governed learning ranking؛ adaptive policy write-back غير تلقائي |
| F-01 | التنبؤات | forecasts مع confidence وإظهار البيانات المستخدمة | forecast + horizon + uncertainty + provenance | قيد التنفيذ |
| AI-01 | المساعد الذكي | سؤال طبيعي على البيانات والأدلة | tenant-safe + grounded + citations | قيد التنفيذ |
| T-01 | مهام الأدوار | توليد مهام اليوم/الغد حسب المدير والموظف والمبيعات والمخازن والمحاسب والمشتريات | task proposal مرتبط بمصدر + سبب + أولوية + نتيجة + دليل | منفذ جزئيًا |
| T-02 | استدامة خطة العمل | حفظ المقترحات واستئنافها عبر الجلسات | tenant-safe + lifecycle + dedupe وعدم تكرار الخطة عند الحفظ | منفذ |
| T-03 | القرار ← المهمة | تحويل المقترح المقبول إلى work item بعد القرار المعتمد | لا تنفيذ قبل APPROVED decision؛ assignee tenant member | منفذ: RPC + persistence + approval gate + واجهة التحويل والتنفيذ مرتبطة بالدورة |
| T-04 | المهمة ← الدليل ← النتيجة | ربط work item بالتنفيذ والدليل والنتيجة والتعلم | start→evidence→complete→outcome→learning دون تجاوز approval | منفذ جزئيًا: start/complete/outcome gates + واجهة التشغيل + source-analysis evidence + learning read model + governed recommendation ranking؛ ما زال adaptive learning write-back مطلوبًا |
| T-05 | خطة التشغيل اليومية | read model دائم لحالة اليوم/الغد حسب الدور | proposed/accepted/open/in-progress/completed/overdue/evidence-missing مع tenant isolation | منفذ |
| Q-01 | جودة البيانات | duplicates/missing/outliers/conflicts | severity + resolution workflow | قيد التنفيذ |
| R-01 | العلاقات | اكتشاف مفاتيح وعلاقات بين datasets | relation graph + confidence | قيد التنفيذ |
| O-01 | التشغيل | queue/resume/progress/observability | لا تختفي العملية عند التنقل | منفذ جزئيًا |
| G-01 | الحوكمة | RLS + lineage + audit + evidence | كل عملية قابلة للتتبع | منفذ جزئيًا |
| E2E-01 | E2E | browser authenticated + tenant A/B | PASS بأدلة حية | محجوب تشغيليًا |
| PROD-01 | Production | runtime + backup + rollback | evidence حقيقي | محجوب تشغيليًا |

## سياسة القرار الموحدة

1. **لا نرمي مصدرًا قابلًا للقراءة.** إذا تعذر تصنيفه يصبح `general_report`/`document_analysis`.
2. **لا نرمي عمودًا.** العمود غير المعروف يبقى في raw source مع `unmapped` ويظهر للمستخدم.
3. **لا نكرر الكتابة بلا بصمة.** exact file duplicate = skipped. Entity/row duplicate = candidate/conflict حسب سياسة المصدر.
4. **لا نكتب إلى كيان متخصص بثقة منخفضة.** يلزم review أو مسار تقرير عام.
5. **لا نولد رقمًا بلا مصدر.** كل KPI/finding/forecast/recommendation يجب أن يرتبط ببيانات أو evidence.
6. **كل شاشة تقرأ من نفس read-models.** لا توجد أرقام مستقلة مخترعة لكل صفحة.
7. **الصورة تعامل كمصدر بيانات.** OCR عند الإمكان، وVision عند توفر backend موثوق، مع confidence وreview عند الحاجة.
8. **كل مسار يجب أن يكون قابلاً للاستئناف.** checkpoint + fingerprint + durable state.
9. **المهام ليست تنفيذًا تلقائيًا.** المقترح ينتظر دورة القرار والموافقة؛ التنفيذ والنتيجة يحتاجان أدلة حقيقية.
10. **الحفظ Idempotent.** إعادة بناء الخطة لا تنشئ نسخًا مكررة لنفس الدور/الأفق/المصدر/المهمة.
11. **لا تحويل بلا قرار معتمد.** تحويل task proposal إلى work item يتم فقط عبر tenant-safe RPC يتحقق من `APPROVED`، ويرفض assignee غير العضو النشط، ويحافظ على ارتباط recommendation→decision عندما يكون المصدر توصية.
12. **خطة التشغيل لا تستبدل مصدر الحقيقة.** العدادات اليومية read-model مشتقة من proposals/work items، ولا تسمح بتنفيذ أو تجاوز approval/evidence gates.
13. **التعلم لا يغيّر السياسات بصمت.** نتائج القرارات تحفظ وتُقاس أولًا؛ أي adaptive write-back لاحقًا يجب أن يمر بحوكمة وعتبات وأدلة.
14. **الترتيب التعلمي محكوم.** لا يؤثر outcome على ترتيب التوصيات إلا بعد حد أدنى 3 ملاحظات، وبحد أقصى ±15%، مع إبقاء الإشارة وسببها وحجم عينتها قابلة للتتبع.
15. **التقرير التنفيذي لا يعيد بناء دورة القرار.** يقرأ decision/approval/work/evidence/outcome/learning من read model واحد؛ Print/PDF لا ينشئ مصدر حقيقة موازيًا.
16. **الذاكرة التنفيذية دائمة.** كل دفعة تنفيذية موثقة في `docs/EXECUTION_LEDGER.md` مع SHA وحدود الادعاء؛ لا نعتمد على ذاكرة المحادثة وحدها.

## ترتيب التنفيذ

**Wave A — Foundation:** I-01..I-07 + D-02 + Q-01 + R-01.

**Wave B — Intelligence:** D-01 + D-03 + A-01 + F-01 + T-01 + T-02 + T-05.

**Wave C — AI:** AI-01 + semantic report interpretation + visual understanding boundary.

**Wave D — Product closure:** T-03 + T-04 + E2E + observability + performance + backup/restore/rollback + certification.

لا يُعتبر المنتج نهائيًا للبيع قبل إغلاق Wave D بالأدلة المطلوبة.
