# Report-Advisor — Competitive Advantage Operating System
## الإصدار
2026-09-18

## 1. الغرض
هذه الوثيقة تحول Report-Advisor من منتج جيد إلى **نظام تفوق تنافسي قابل للإثبات والبيع والتوسع**.

الهدف ليس تقليد ما يظهر في السوق، بل بناء حلقة مغلقة:
**Market Signal → Problem → Fit → Proof → Product Gap → Controlled Build → Exact Evidence → Demo → Proposal → Delivery → Outcome → Portfolio → Learning**

أي ميزة أو ادعاء تجاري لا يملك طريق إثبات واضح لا يعد أصلًا تنافسيًا.

## 2. سياسة المشروع الموروثة — Non-Negotiable
كل عمل تجاري/منتجي يرث سياسة الهندسة الحالية:

- Exact-HEAD evidence فقط.
- لا historical evidence transfer.
- لا PASS اصطناعي ولا fixture يمرر اعتمادًا.
- Fail-Closed عند نقص الدليل.
- Staging-first لأي تغيير DB.
- لا Runner/RPC/architecture بديل إذا كان المسار الحالي صالحًا.
- لا إعادة تدقيق لما أغلق ما لم يتغير SHA أو البيئة أو العقد.
- كل ادعاء في Portfolio/Proposal يجب أن يعرف حالته: PROVEN / DEMO / PARTIAL / BLOCKED.
- توثيق المتطلبات لا يساوي تنفيذها.
- Product completion منفصل عن Technical completion.
- الأولوية للحقيقة، ثم القيمة، ثم سرعة التسليم، وليس العكس.

## 3. نموذج التفوق الخماسي
### Plane A — Trust
العزل متعدد المستأجرين، RLS، provenance، evidence lineage، freshness، data quality، auditability، fail-closed.

### Plane B — Decision
KPI → explanation → evidence → recommendation → action → outcome.

### Plane C — Operations
Import, OCR, normalization, reconciliation, workers, retries, reporting, alerts, low-bandwidth workflows.

### Plane D — Commercial
Proposal Demo Mode، Client Proof Room، Vertical Playbooks، Value Narrative، Offer Packaging، Case Study Builder.

### Plane E — Learning
Job signals → proof gaps → delivery gaps → portfolio gaps → product priorities.

## 4. The Aghbari Advantage
المزايا التي يجب أن يصعب تقليدها لأنها مترابطة:
1. **Evidence-First BI**: كل رقم مهم له مصدر وتعريف وفترة وحالة ثقة.
2. **Decision Operating System**: المنتج لا ينتهي عند visualization.
3. **Governed Document Intelligence**: المستند يمر من المصدر إلى البيانات والتحقق ثم الدليل.
4. **Tenant Security as a Demonstrable Capability**: العزل ليس ادعاءً تسويقيًا؛ له مسارات تحقق.
5. **Arabic RTL + low-bandwidth by design**: ليس ترجمة سطحية.
6. **Real operational workflows**: import, quality, receivables, inventory, demand, decision actions.
7. **Commercial Proof Layer**: المنتج قادر على عرض قدراته الحقيقية حسب مشكلة العميل دون إنشاء نسخة Mock منفصلة.
8. **Continuous Reconciliation**: المنتج يراجع صحة الحقيقة التشغيلية باستمرار بدل الاعتماد على snapshot واحد.
9. **Outcome Ledger**: نربط القرار بالفعل ثم نبحث عن النتيجة بدل الاكتفاء بالتوصية.
10. **Market Learning Loop**: السوق يغير الأولويات عبر Evidence وليس عبر الانطباع.

## 5. Product Value Gate
كل فكرة جديدة تمر عبر هذه البوابات:

### Gate 0 — Signal
هل يوجد ألم حقيقي متكرر في العملاء أو السوق؟

### Gate 1 — Product Fit
هل المشكلة تقع داخل هوية الأغبري؟

### Gate 2 — Evidence Fit
هل يمكن إثبات النتيجة من مصدر حقيقي؟

### Gate 3 — Outcome Fit
ما القرار أو الإجراء الذي يتحسن؟

### Gate 4 — Commercial Fit
هل يمكن عرضها في Demo خلال دقائق؟

### Gate 5 — Delivery Fit
هل يمكن تنفيذها دون architecture fork أو maintenance burden غير مبرر؟

### Gate 6 — Proof Fit
هل نستطيع إنتاج دليل Exact-HEAD بعد التنفيذ؟

### Gate 7 — Learning Fit
هل النتيجة تستحق أن تدخل Portfolio/Playbook/roadmap؟

الفكرة التي تفشل في Gate 1 أو 2 أو 5 لا تدخل core product لمجرد أنها مطلوبة في إعلان.

## 6. Evidence Passport
كل Capability قابلة للبيع يجب أن تملك سجلًا داخليًا يحتوي:
- capability_id
- customer_problem
- product_surface
- source/data contract
- proof_type
- latest_exact_sha
- runtime_evidence
- known_limits
- demo_path
- proposal_claim
- claim_strength
- owner
- last_verified_at

حالات claim:
- PROVEN: runtime + exact-head evidence.
- DEMO: واجهة قابلة للعرض لكن runtime certification غير مكتملة.
- PARTIAL: بعض المسار مثبت فقط.
- BLOCKED: دليل أو بيئة مفقودة.
- RETIRED: لم تعد capability تسويقية.

لا يجوز لـProposal أن يستخدم PROVEN إذا كانت الحالة DEMO أو PARTIAL.

## 7. Client Proof Room
المنتج يجب أن يتجه تدريجيًا إلى مساحة عرض عميلة تحتوي:
- المشكلة
- لماذا تهم
- ما الذي تم تحليله
- ما الدليل
- ما النتيجة
- ما الإجراء
- ما المتوقع بعد الإجراء
- رابط التقرير/المؤشر
- القيود المعروفة
- تاريخ آخر تحديث

هذه الغرفة تستعمل demo/client review، ولا تكشف بيانات tenant آخر أو تفاصيل أمنية غير لازمة.

## 8. Proposal Demo Mode 2.0
لا يكفي keyword matching.

التجربة المستهدفة:
**Paste Job → Extract Needs → Map Capabilities → Identify Proof → Identify Gaps → Select Demo Sequence → Generate Claim-safe Narrative → Produce Proposal Pack**

يجب أن تعرض:
- matched requirements
- proof strength
- missing proof
- delivery assumptions
- integration assumptions
- demo sequence
- recommended scope
- exclusions
- next action

لا يتم توليد ادعاء تقني غير مثبت.

## 9. Vertical Playbooks
بناء Playbooks قابلة لإعادة الاستخدام:
- Wholesale / Distribution
- Retail Operations
- B2B SaaS Analytics
- Data Import / Excel Automation
- Supabase / RLS Security
- Reporting / Executive BI
- Inventory / Demand
- Document Intelligence

كل Playbook يحتوي:
Problem → Inputs → Product Path → Evidence → Demo → Deliverables → Acceptance → Follow-up.

## 10. Signature Product Experiences
الأولوية لتجارب يصعب تقليدها بمجرد Dashboard:
- Profit Leak Radar
- Cash & Receivables Control Tower
- Assortment & Cash Simulator
- Demand / Reorder Decision Workspace
- What Changed
- Decision Experience
- Evidence Passport
- Data Trust Center
- Outcome & ROI Ledger
- Semantic Metric Studio
- Agent Control Room
- Continuous Reconciliation
- Data Contract Autopilot
- Embedded Intelligence
- Proposal Demo Mode

هذه ليست قائمة إلزامية للتنفيذ الفوري؛ تخضع لـProduct Value Gate.

## 11. Commercial Proof Packs
يجب أن نستطيع بناء حزم عرض مختلفة دون نسخ منتج جديد:
### Security Pack
Tenant isolation → RLS → auth → denial evidence → regression.

### Data Pack
Excel/CSV/document → extraction → validation → reconciliation → canonical data.

### BI Pack
KPI → report → explanation → evidence → executive decision.

### Operations Pack
Import → processing → status → retry → result → audit.

### Decision Pack
Observation → explanation → recommendation → scenario → action.

## 12. Client Outcome Ledger
عند توفر runtime المنتج الحقيقي، يجب تتبع:
- problem
- baseline
- action
- expected outcome
- observed outcome
- period
- evidence
- status
- customer confirmation

لا نحسب ROI مفترضًا على أنه realized ROI.

## 13. Competitive Moat Rules
لا نبني moat بإضافة 100 feature.
نبنيه بتكامل:
**Truth + Security + Decision + Workflow + Proof + Commercial Reuse + Learning**

## 14. Roadmap Priority
### P0 — Trust Core
Exact evidence, runtime certification, tenant isolation, import/OCR truth, persistence, reliability.

### P1 — Decision Value
Decision Control Tower, What Changed, Evidence Passport, outcome tracking.

### P2 — Commercial Scale
Proposal Demo 2.0, Proof Room, Playbooks, case-study export, offer packaging.

### P3 — Expansion
Embedded intelligence, agents, vertical extensions, integrations.

## 15. Product States
- TECHNICALLY_COMPLETE
- PRODUCT_COMPLETE
- COMMERCIAL_READY
- CERTIFIED

لا يجوز إعلان Commercial Ready بسبب UI فقط.
Commercial Ready يتطلب: usable workflow + credible proof + demo path + delivery boundary + known limitations.

## 16. Market-to-Product Learning
كل opportunity ينتج واحدة من:
- PROVEN_MATCH
- PROOF_GAP
- PRODUCT_GAP
- DELIVERY_GAP
- COMMERCIAL_GAP
- LOW_FIT

ويتم تسجيل السبب.

## 17. Anti-Noise Rules
- لا feature من إعلان واحد فقط.
- لا إضافة dependency ثقيلة لمجرد demo.
- لا benchmark غير قابل لإعادة الإنتاج.
- لا customer logo دون permission.
- لا ادعاء AI إذا كانت الوظيفة deterministic.
- لا ادعاء certification إذا كانت مجرد UI contract.
- لا إعادة تسمية mock على أنه production capability.

## 18. Success Metrics
هذه مؤشرات تشغيل وليست وعودًا:
- time-to-fit
- time-to-proof
- proof coverage
- proposal preparation time
- qualified-opportunity rate
- proposal-to-interview conversion
- interview-to-contract conversion
- delivery reuse rate
- defect/rework rate
- customer-confirmed outcomes
- portfolio freshness
- number of capabilities with current Exact-HEAD evidence

## 19. Ownership
ChatGPT / Product Experience:
- Commercial UX
- Proposal Demo
- Proof presentation
- portfolio surfaces
- information architecture
- accessibility/mobile
- evidence presentation

Programmer / Engineering:
- backend/runtime
- DB/RLS/RPC
- worker/reliability
- integrations
- security
- deployment
- certification evidence

Owner:
- final commercial prioritization
- external client communication
- account actions requiring credentials/Connects/contracts.

## 20. Final Rule
الأغبري لا يحاول أن يبدو مثل الكبار.
يجب أن يثبت للعميل، خلال دقائق، لماذا المنتج يختلف:
**ليس "لوحة أجمل"، بل نظام يعرف ما الذي يعرفه، وما الذي لا يعرفه، ولماذا، وما القرار الذي يمكن اتخاذه، وما الدليل الذي يثبته، وما الذي يحدث بعد القرار.**
