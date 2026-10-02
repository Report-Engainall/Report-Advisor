# BUSINESS QUESTION ENGINE — PRODUCT CONTRACT
## 2026-10-02

## Purpose
لا نعرض التحليل كقائمة رسوم. نعرض الإجابات التي يحتاجها صاحب العمل، مع الدليل وحالة القدرة.

## Universal question ladder

### A. WHAT
- ماذا حدث؟
- ما مستوى النتيجة؟
- ما الفترة والعينة؟

### B. WHERE
- أين حدث التغير؟
- في أي فرع/مخزن/منطقة؟

### C. WHO/WHAT CONTRIBUTED
- من أو ما الذي ساهم في التغير؟
- من أو ما الذي سحب النتيجة للأسفل؟
- هل التركّز مرتفع؟

### D. WHY
- ما driver أو pattern المدعوم بالبيانات؟
- هل السبب مثبت أم مجرد hypothesis؟
- ما البيانات الناقصة لمنع الاستنتاج الزائد؟

### E. SO WHAT
- ما أهمية التغير؟
- من يتأثر؟
- ما الخطر أو الفرصة القابلة للقياس؟

### F. WHAT NEXT
- ما الإجراء المقترح؟
- من المالك؟
- ما النتيجة المتوقعة القابلة للقياس؟

### G. PROOF
- ما مصدر الادعاء؟
- ما evidence snapshot؟
- كيف تم الحساب؟
- ما القيود؟

### H. AFTER ACTION
- هل تم اتخاذ قرار؟
- هل تمت الموافقة؟
- هل نُفذت المهمة؟
- ما outcome الفعلي؟
- ماذا تعلمنا؟

## Capability states

كل سؤال/إجابة يجب أن ينتهي بواحدة:

`ANSWERED`
`NOT_AVAILABLE`
`INSUFFICIENT_SAMPLE`
`REVIEW_REQUIRED`
`BLOCKED`

ولا يوجد جواب تجميلي من نوع “لا توجد بيانات” عندما يكون السبب الحقيقي مختلفًا.

## Archetype integration

كل Archetype يعرّف:
`PRIMARY_QUESTIONS`
`DIAGNOSTIC_QUESTIONS`
`DECISION_QUESTIONS`
`REQUIRED_FIELDS`
`MIN_SAMPLE`
`LIMITATIONS`

ويولد الأسئلة حسب الحقول الموجودة، لا حسب قالب ثابت أعمى.

## Acceptance example

For a sales report with valid:
`documentDate + customerCode + productCode + netAmount`

the system should be able to answer, with evidence where available:

`WHAT → TREND → TOP CONTRIBUTORS → TOP DETRACTORS → CONCENTRATION → CUSTOMER/PRODUCT DRILLDOWN → WHAT NEXT`

If `cost` is absent:
`PROFITABILITY = NOT_AVAILABLE`

If the time sample is too small:
`TREND/FORECAST = INSUFFICIENT_SAMPLE`

## Product value
This contract makes Smart Report a business-question answering system rather than a visualization catalog, while preserving truthful limitations.
