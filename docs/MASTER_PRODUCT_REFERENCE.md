# Report Advisor — Master Product, Requirements & Open-Source Reference

> **AUTHORITATIVE SINGLE REFERENCE.** This is the permanent registry for the comprehensive product requirements, architecture guardrails, product inspiration, open-source projects, licenses, integration decisions, acceptance rules, implementation mapping, reliability rules, and release gates used while evolving Report Advisor.
>
> **Last reviewed:** 2026-09-21
>
> This file supersedes scattered requirement/inspiration notes as the operational reference. New requirements, sources and implementation decisions are appended here rather than creating competing master lists.

## 1. Mission

Report Advisor is a new product. It may learn from proven products and open-source projects, but it must not become a copy of any vendor.

The target is a unified, accurate, fast, flexible, predictive, advisory and financially safe Business Decision Operating System with deterministic business calculations, governed semantic metrics, evidence/lineage, multi-format document intelligence, operational/inventory/procurement intelligence, customer/supplier intelligence, financial/accounting intelligence, forecasting/backtesting, decision/what-if intelligence, ChatBI, report generation, proactive alerts, low-bandwidth UX, and a free-first/open-source-first architecture with no mandatory local AI installation or paid AI provider.


## 2A. AUTHORITATIVE PRODUCT CONSTITUTION — AGHBARI 2026-09-21

> **BINDING PRODUCT RULE.** This section is part of \`docs/MASTER_PRODUCT_REFERENCE.md\` itself. It is not a secondary UI note and must not be copied into a competing master document. When older UI structures, navigation maps, screen groupings or visual contracts conflict with this section, the older structure is **SUPERSEDED** for product design purposes. Historical files remain historical evidence only.

### Product identity

**الأغبري / Report-Advisor — Business Decision Operating System**

The product is not a generic dashboard, CRUD application, mini-ERP, pharmacy application, chatbot, or Bolt-style template. Its purpose is to turn business data and documents into:

\`Data → Truth → Evidence → Signal → Decision → Approval → Action → Outcome → Learning → Benchmark\`

The product experience must visibly connect business facts to business decisions while remaining fail-closed when evidence, history, cost basis, freshness, tenant scope, or confidence is insufficient.

### Mandatory top-level information architecture

The primary application navigation is fixed to these zones only:

1. **مركز القرار / Decision Center**
   - Business health, decision queue, exceptions, signals, opportunities, Money Recovery, Decision Coverage, Decision ROI, Business Replay, outcome follow-up.

2. **البيانات والتشغيل / Data Operations**
   - Work Center, import/upload, document intelligence, extraction, normalization, validation, reconciliation, data quality, schema drift, sources/connectors and operational jobs.

3. **التحليل التجاري / Business Analytics**
   - Sales, Purchases, Profitability, Receivables/Collections, Liquidity/Cash, Inventory, Demand/Movement, Customer/Supplier analysis, RFM, ABC/XYZ/FSN, Aging, concentration, anomalies and trend analysis.

4. **الذكاء والقرار / Intelligence & Decision**
   - Signals, drivers, early warnings, recommendations, forecasts, backtests, scenarios, AI advisory, Decision Experience and Decision Playbooks.

5. **الثقة والأدلة / Trust & Evidence**
   - Evidence Center, Evidence Passport, provenance, lineage, Metric Inspector, snapshots, confidence, decision evidence, benchmark governance and trust health.

6. **التقارير والمخرجات / Reports & Outputs**
   - Executive report, domain reports, Report Builder, review, export and print surfaces. Reports are decision outputs, not merely decorative views.

7. **البيانات المرجعية / Master Data**
   - Customers, Products, Suppliers, Warehouses, inventory entities, business keys, synonyms, units, packaging and semantic dictionary.

8. **الإعدادات / Settings**
   - Company, users, roles, permissions, profile, language, currency, sources/connectors, notifications, security, integrations and system health.

No additional top-level sidebar category may be introduced unless this master reference is deliberately amended with an explicit product decision.

### Aghbari Advisor — permanent intelligence layer

**المستشار الأغبري** is not a standalone navigation category. It is a persistent application layer available from every major screen through a fixed conversation drawer/panel.

It must understand current page context, active report/metric/entity/decision and available evidence. It may explain, investigate, compare, diagnose, summarize, forecast where minimum-data gates pass, build scenarios, draft recommendations and navigate the user to evidence/analysis/decision surfaces.

Every consequential answer must expose, where applicable:

- Source / Evidence
- Calculation or metric reference
- Period / As Of / Freshness
- Confidence / quality state
- Expected impact
- Recommended next step

The advisor may never manufacture authoritative business numbers, bypass validation, perform unapproved financial writes, or replace deterministic business calculations.

### Information-architecture rule

Do **not** promote individual metrics or analytical techniques into top-level navigation.

The following are lenses/features inside their parent domains, not sidebar categories:
- RFM
- ABC / XYZ / FSN
- Aging
- DSO / DIO / DPO / CCC
- Forecasts
- Margin
- Velocity / acceleration
- Metric Inspector
- Evidence Passport
- Provenance
- Confidence
- Scenario analysis

Likewise, the advisor is not a separate app.

### Canonical business journey

For any imported report, document or connected dataset, the user-visible journey should progressively reveal:

\`Source → Extraction → Normalization → Validation → Reconciliation → Canonical Truth → Semantic Metrics → Analysis → Evidence → Signal → Intelligence → Recommendation → Decision → Approval → Action → Outcome → Learning → Benchmark\`

The UI must never imply a later state before the authoritative backend state exists.

### Visual constitution

The visual system is fixed at product level:

- Arabic-first RTL enterprise SaaS.
- Aghbari dark ink/navigation foundation with teal/emerald and restrained warm-gold accents.
- High information density without visual noise.
- Strong hierarchy and progressive disclosure.
- One shared App Shell, Header, Sidebar, Page Header and design system.
- Shared typography, spacing, surfaces, controls, states, tables, charts, dialogs and responsive rules.
- KPI cards are evidence-aware and must expose data state when it matters.
- Charts use a consistent semantic palette and meaningful labels; no decorative color proliferation.
- Trust states are first-class: \`VERIFIED\`, \`TRUSTED\`, \`PARTIAL\`, \`REVIEW\`, \`BLOCKED\`, \`INSUFFICIENT DATA\`.
- Responsive, mobile-capable, PWA-friendly and low-bandwidth aware.
- Keyboard-first command access through the existing Command Palette.
- Accessibility, focus behavior, readable Arabic typography and reduced-motion behavior are required.
- No copied vendor UI, generic Bolt sections, legacy visual islands, contradictory brand systems or demo-only screens.

The approved BI reference image defines **composition, hierarchy, density and visual language** only. It is not a literal copy target.

### Dashboard / Decision Center visual contract

The home surface is a **Decision Center**, not a generic KPI wall. Its visual hierarchy should prioritize:

1. Business pulse / executive context.
2. Four or fewer critical business indicators where real evidence exists.
3. Business trend and drivers.
4. Distribution / concentration / exposure views where useful.
5. Decision summary: what needs attention, why, evidence, owner/next step.
6. High-value signals and exceptions.
7. Direct entry points to Work Center, Reports, Documents, Intelligence, Investigations and other decision workflows.

No fabricated metric, synthetic alert or placeholder chart may be presented as business truth.

### Document / import visual contract

The import experience must make the real processing lifecycle visible:

\`queued → fingerprinted → extracted → canonicalized → validated → analyzed → decisioned → committed → rendered\`

The interface must distinguish:
- pending/processing,
- review-required,
- blocked/rejected,
- committed,
- rendered,
- unavailable.

\`committed\` is only shown after the authoritative database commit path succeeds.

### MANDATORY UNIFIED IMPORT ENTRY — ONE CANONICAL INGESTION SURFACE

**قاعدة المنتج الملزمة:** الأغبري يملك مدخلًا واحدًا عامًا للمصادر والملفات والبيانات. هذه النقطة ليست «مستورد منتجات» أو «مستورد عملاء» أو «مستورد فواتير»، ولا تُبنى تجربة المستخدم على اختيار كيان أو جدول قبل قراءة المصدر.

المسار الكانوني هو:

`Any Source → Read → Understand → Extract Structure & Meaning → Quality & Confidence → Evidence → Review → Canonical Approval/Commit → Business Understanding`

يرفع المستخدم أي مصدر يدويًا أو عبر قناة مدعومة. النظام هو الذي يتولى اكتشاف الصيغة، الفحص الأمني، استخراج المحتوى، فهم البنية والحقول والعلاقات، رصد الجودة، بناء السياق الدلالي، وتحديد ما يمكن إثباته. لا يُطلب من المستخدم اختيار هوية المصدر مسبقًا، ولا تُفرض عليه قائمة كيانات ثابتة، ولا يظهر له تصنيف داخلي على أنه «محرك الاستيراد».

قد يستخدم القلب الداخلي إشارات أو تصنيفات دلالية مساعدة لفهم المصدر وتحسين التحليل، لكن هذه الآليات تبقى **تفاصيل تنفيذية داخلية**. لا يجوز أن تتحول إلى taxonomy للمنتج، أو قوائم اختيار، أو routes/RPCs/importers منفصلة، أو لغة تجبر المستخدم على التفكير في جداول قاعدة البيانات.

التجربة العامة يجب أن تُظهر للمستخدم قيمة الفهم نفسه: ما الذي قُرئ، ما الذي فُهم، ما مستوى الجودة والثقة، ما الذي يحتاج مراجعة، وما الذي أصبح موثقًا وقابلًا للاستخدام. عندما يكون المعنى غير محسوم، لا يُخمن النظام ولا يرفض المصدر لمجرد أنه جديد؛ يحتفظ به ضمن العقد العام، ويُظهر حدود الفهم ويطلب المراجعة فقط عندما تكون المراجعة لازمة للثقة.

إذا احتاج النظام بعد ذلك إلى تحليل تشغيلي متخصص، فذلك يحدث **بعد فهم المصدر** داخل طبقات Business Analytics / Intelligence / Decision، وليس عبر تحويل صفحة الاستيراد إلى كتالوج مستوردات متخصصة.

لا يجوز لأي تطوير لاحق أن يعيد إدخال اختيار target entity أو table picker إلى المدخل الموحد، ولا إنشاء مسار استيراد مستقل لمجرد اختلاف طبيعة البيانات. أي توسعة يجب أن تزيد قدرة الأغبري على فهم المصادر المختلفة عبر نفس المسار العام، مع الحفاظ على الحقيقة الكانونية، الدليل، الـprovenance، الـtenant/RLS، والـfail-closed behavior.

**النتيجة التصميمية الملزمة:** المستخدم يفكر «لدي مصدر أريد أن يفهمه الأغبري»، ولا يفكر «أي جدول يجب أن أستورد إليه؟». هذه قاعدة منتج أساسية وليست تحسينًا اختياريًا للواجهة.

### PRODUCT DECISION — DOMAIN-NEUTRAL INGESTION
The unified ingestion surface is intentionally **general-purpose and source-first**. The user never starts by selecting a fixed target entity or table-specific importer. The system reads the source first, extracts structure and content, understands semantic meaning and confidence, and preserves that context without exposing internal taxonomy as the product experience.

The product identity must remain broader than any single business record type. Fixed implementation targets may exist only as internal compatibility details; they must never define the import UX, product taxonomy, customer-facing language, or canonical product position.

The correct mental model is:
`Any Source → Read → Understand → Semantic Context → Quality → Evidence → Review → General Canonical Contract → Business Understanding`

The general canonical contract now exists on the existing `import_commit_batch` path. Source-neutral rows are persisted in `canonical_dataset_records`, protected by tenant RLS and provenance/source-hash checks, while legacy specialized implementation branches remain internal compatibility only. The unified import UX must not expose those legacy entity names or require the user to select a target.

### Truth and finance rules visible in UI

- Deterministic calculations are authoritative.
- AI is assistive for explanation, synthesis and recommendation wording.
- Profitability is explicitly unavailable when no verified cost basis exists.
- Forecasts are explicitly unavailable when minimum-data gates fail.
- Benchmarks show \`INSUFFICIENT SAMPLE\` when sampling requirements are not met.
- Stale or unknown data cannot silently drive executive warnings or decisions.
- Tenant scope, period, As Of, freshness and evidence remain traceable from important outputs.

### Cleanup / consolidation law

The product must continuously converge toward one coherent system.

For every legacy or duplicate surface, classify it as:
- **KEEP** — required and canonical.
- **IMPROVE** — required but visually/architecturally weak.
- **REPLACE** — capability needed but implementation contradicts the canonical product path.
- **REMOVE** — proven orphan, duplicate, dead, obsolete, mock, legacy-branded or conflicting surface.

Before deletion, inspect references/dependencies and preserve any required capability by consolidating into the canonical path. Do not create another wrapper, runner, RPC, navigation map or competing design system to avoid doing the consolidation.


### MANDATORY PRODUCT-DESIGN INITIATIVE — VALUE-FIRST UI EVOLUTION

الواجهات لا تُعامل كمخرجات جامدة للمواصفة. في كل شاشة وتدفق، يجب أن يعمل المبرمج بعقلية **Product Designer + UI/UX Engineer** وأن يبحث استباقيًا عن فرصة حقيقية لتحسين الفهم، القرار، العمل، الثقة، أو القيمة المدركة.

بعد أي تنفيذ واجهي، يجب إجراء مراجعة **«ما الذي يمكن تحسينه هنا؟»** وتنفيذ التحسين المناسب مباشرة ضمن الهوية والبنية المعتمدتين، سواء كان ذلك Action أو زرًا، بطاقة أو مؤشرًا، تحسين عرض البيانات، Drawer/Panel/Modal، فلترًا أو بحثًا، تنبيهًا أو حالة، Tooltip، مقارنة/Visualization/Timeline/Evidence View، حالة Empty/Loading/Success/Warning/Blocked/Review/Insufficient Data، Micro-interaction، Shortcut، أو تحسينًا في الترتيب والتسلسل البصري وطريقة عرض النتيجة أو التوصية أو القرار.

هذه المبادرة **مقيدة بالقيمة وليست تفويضًا للزحام أو اختراع وظائف**: يُنفذ العنصر فقط إذا أضاف قيمة واضحة مثل فهم أسرع، قرار أسرع، عمل أسرع، دليل أوضح، اكتشاف فرصة/مشكلة، خطوات أقل، ثقة أعلى، أو قيمة مدركة أعلى. ويجب أن يبقى متسقًا مع الـIA، الهوية البصرية، المسارات الحقيقية، حالات الثقة، deterministic calculations، fail-closed، tenant/RLS، والأداء والاستجابة. لا يجوز أن تتحول المبادرة إلى taxonomy جديدة أو backend path جديد لمجرد خدمة الواجهة.

### MANDATORY PROGRESSIVE DISCLOSURE — BUSINESS-FIRST NAVIGATION

قوة المنتج لا تُقاس بعدد العناصر الظاهرة في الـSidebar. **الواجهة الأساسية يجب أن تبقى موجهة لرجل الأعمال، لا لكتالوج قدرات تقني.**

قاعدة العرض:
- تبقى المناطق الثمانية ثابتة وواضحة.
- تظهر في المستوى الأول الوظائف الأكثر استخدامًا واتخاذًا للقرار فقط.
- القدرات المتقدمة التي يمكن أن تشتت المستخدم تُكتشف داخل الـHub أو عبر فتح القسم، ويمكن إظهارها في الـSidebar فقط عند وضع **Advanced/Expert**.
- لا تتحول كل KPI أو تقنية تحليل أو طبقة ثقة إلى عنصر Navigation مستقل لمجرد أنها موجودة في المنتج.
- يجب أن تكشف الواجهة العمق تدريجيًا: **Overview → Hub → Advanced Surface → Evidence/Detail**.
- كل سطح جديد يجب أن يكون مكتمل القيمة وقابلًا للوصول، لكن دون التضحية بالوضوح أو التسلسل البصري.

الهدف: **إظهار قوة العمل المتراكم عبر الشهور دون إغراق رجل الأعمال في التفاصيل من أول نظرة.**

### Visual-first execution priority

For the next major product-development wave, the first priority is **complete visual coverage of the entire canonical product surface** using the shared design system and real application paths.

The programmer must first bring all canonical screens into one coherent Aghbari product experience, then deepen truth/runtime/certification work in parallel where independent, without weakening any fail-closed rule.

The target is not “more pages”. The target is a visibly complete, commercially credible product whose:
- shell is coherent,
- navigation is canonical,
- every major surface looks native to Aghbari,
- real data paths remain authoritative,
- empty/loading/error/review states are deliberate,
- and the transition from data to evidence to decision is visible.

### Supersession statement

The following are explicitly **not** the product identity and must not be restored as the main information architecture:
- generic Commerce / ERP CRUD groupings,
- arbitrary Bolt-style dashboard sections,
- duplicate sidebar taxonomies,
- one-page-per-KPI navigation,
- a standalone chatbot product identity,
- visual mockups that bypass real application state,
- duplicate "Intelligence" or "Evidence" navigation trees,
- sector-specific framing that narrows the platform into a single industry.

This constitution supersedes conflicting UI/navigation proposals while preserving valid underlying technical capabilities.

## 2B. CANONICAL AGHBARI PRODUCT TREE — UI / UX / SURFACE CONTRACT

This is the target product tree. It defines how capabilities are presented; it does not authorize new backend paths merely to satisfy a visual tree.

الأغبري
├─ Global App Shell
│  ├─ RTL workspace
│  ├─ Header / company / period / As Of / freshness / trust
│  ├─ Command Palette
│  ├─ Notifications / account
│  ├─ Persistent Aghbari Advisor drawer
│  └─ Responsive / PWA / low-bandwidth behavior
├─ 01 مركز القرار
│  ├─ نبض الأعمال
│  ├─ Decision Queue
│  ├─ Signals & Exceptions
│  ├─ Opportunities / Money Recovery
│  ├─ Decision Coverage
│  ├─ Decision ROI
│  ├─ Business Replay
│  └─ Outcome follow-up
├─ 02 البيانات والتشغيل
│  ├─ Work Center
│  ├─ Import / Upload
│  ├─ Document Intelligence
│  ├─ Extraction / OCR
│  ├─ Validation / Review
│  ├─ Reconciliation / Deduplication
│  ├─ Data Quality
│  ├─ Sources / Connectors
│  ├─ Watched Reports / Folder processing
│  └─ Operational jobs
├─ 03 التحليل التجاري
│  ├─ Analytics Home
│  ├─ Sales
│  ├─ Purchases
│  ├─ Receivables / Collections
│  ├─ Liquidity / Cash
│  ├─ Profitability / Margin
│  ├─ Inventory
│  ├─ Demand / Movement
│  ├─ Customers / Customer 360
│  ├─ Products / Product 360
│  ├─ Suppliers
│  ├─ RFM
│  ├─ ABC / XYZ / FSN
│  ├─ Aging
│  ├─ Concentration
│  └─ Anomalies / Trends
├─ 04 الذكاء والقرار
│  ├─ Intelligence Control Room
│  ├─ Signals / Drivers / Early Warning
│  ├─ Recommendations
│  ├─ Forecasts + Backtesting
│  ├─ Scenarios / What-if
│  ├─ Decision Experience
│  └─ Decision Playbooks
├─ 05 الثقة والأدلة
│  ├─ Evidence Center
│  ├─ Evidence Passport
│  ├─ Metric Inspector
│  ├─ Provenance / Lineage
│  ├─ Snapshots / As-of
│  ├─ Confidence / Truth states
│  ├─ Decision Evidence
│  └─ Benchmark Governance
├─ 06 التقارير والمخرجات
│  ├─ Executive Report
│  ├─ Sales / Purchases
│  ├─ Inventory / Demand
│  ├─ Receivables / Profitability
│  ├─ Decision / Recommendation Reports
│  ├─ Data Quality / Audit
│  ├─ Report Builder
│  └─ PDF / Excel / CSV / Print
├─ 07 البيانات المرجعية
│  ├─ Customers
│  ├─ Products
│  ├─ Suppliers
│  ├─ Warehouses / Locations
│  ├─ Inventory entities
│  ├─ Alternatives
│  └─ Business Keys / Synonyms / Units / Semantic Dictionary
└─ 08 الإعدادات
   ├─ Company / Workspace
   ├─ Users / Roles / Permissions
   ├─ Profile
   ├─ Language / Currency
   ├─ Sources / Connectors
   ├─ Notifications
   ├─ Security
   ├─ Integrations
   └─ System Health / Operations

### Progressive disclosure contract

The same product supports three density levels without becoming three products:
- Essential: Decision Center, Import, Reports, Sales, Receivables, Inventory, Customers, Products, Decisions.
- Advanced: Profitability, Demand, RFM, ABC, Aging, Alternatives, Metric Inspector, Scenarios, Data Quality.
- Expert: Document Intelligence, File Analysis, Evidence/Audit, Integrations, System/Operations.

Role presets may emphasize the same canonical surfaces for Executive, Finance, Sales, Collections, Inventory, Operations, Analyst and Data/Import Operator. Hidden UI is never an authorization boundary; server-side tenant/RLS/permissions remain authoritative.

### Screen completion contract

Every canonical surface must be a native Aghbari screen with:
- real data path or explicit unavailable state;
- loading, empty, review, blocked and error states;
- evidence/truth context where material;
- mobile/responsive behavior;
- keyboard/focus accessibility;
- consistent shell/design system;
- contextual drill-down/return path;
- no standalone mock data.

## 2C. CANONICAL TECHNOLOGY & OPERATING STACK

### Current native application stack

- Frontend: React 18 + TypeScript + Vite.
- Routing: React Router.
- Styling/design: Tailwind CSS + shared CSS/design tokens; IBM Plex Sans Arabic; RTL-first.
- Icons: Lucide React.
- Charts: Recharts through shared chart primitives.
- Business/data client: Supabase JS.
- Backend/data authority: Supabase/Postgres, RLS, RPC/security-definer boundaries, tenant context.
- Document inputs: XLSX/CSV/PDF/text/Word-compatible extraction using the existing adapters: xlsx, pdfjs-dist, mammoth, tesseract.js where applicable.
- PWA/offline: service worker, local persistence/fingerprint patterns and progressive/offline-first workflows where the existing contract requires them.
- AI: deterministic query/intelligence context first; LLM/Ollama/local models are assistive adapters only and never the source of authoritative numeric truth.
- Hosting/deployment: GitHub source + GitHub Actions; Vercel/Netlify are deployment/preview targets, never evidence by themselves.
- Validation: repository contracts, TypeScript, build/lint, targeted tests, browser E2E, tenant adversarial checks, persistence/readback checks and release/certification gates.

### Optional open-source capability registry

Open-source engines remain adapters/reference capabilities, not mandatory bundled dependencies. Existing registry candidates include DuckDB, Apache Arrow/Parquet, Polars/pandas, Tesseract, Docling, PaddleOCR, Unstructured, LangChain/LangGraph, Dify/Langflow and related analytics/document/AI tooling. Any adoption requires capability proof, license/security review, measurable benefit and adapter isolation.

### Intelligence and reliability techniques

Use, where already supported by repository contracts:
- deterministic semantic metric resolution;
- evidence/lineage and immutable snapshots;
- analysis caching and cache invalidation;
- lazy routes/code splitting/manual chunking;
- virtualized large-data table patterns;
- debounced search/prefetch where useful;
- bounded concurrency;
- queue leases, heartbeats, checkpoints, retry/DLQ;
- watched-folder fingerprinting and incremental reconciliation;
- forecasting minimum-data gates + MAE/RMSE/MAPE/backtesting;
- bounded scenarios/constraint-aware optimization;
- tenant-aware business-risk/approval controls;
- artifact integrity and release manifests;
- SLO/error-budget and health evidence;
- backup/restore and RPO/RTO evidence;
- rollback/forward-fix drills.

### Space / cost / build discipline

Prefer:
1. route-level lazy loading and shared components;
2. existing RPCs/runners/adapters over duplicates;
3. manual chunking only where it reduces actual load/cost;
4. removal/consolidation of dead CSS, components, routes and assets after dependency inspection;
5. small visual primitives over repeated per-page implementations;
6. no large images/fonts/assets added to Git without measurable product value;
7. no new package unless existing capabilities cannot safely satisfy the requirement;
8. no rerun of unchanged expensive gates.

The objective is maximum product surface with minimum duplicate code, bundle weight, build/deploy cost and CI repetition without reducing evidence quality or functionality.

## 2D. END-TO-END PRODUCT EXECUTION GRAPH

Source / Connected Data
  ↓
Detection → Extraction → OCR/Table parsing
  ↓
Normalization → Entity Resolution → Validation
  ↓
Data Quality → Reconciliation → Canonical Truth
  ↓
Semantic Metrics → Deterministic KPI Engine
  ↓
Analytics → Signals → Evidence
  ↓
Intelligence → Forecast / Scenario / Recommendation
  ↓
Decision → Approval → Action
  ↓
Outcome → Replay → Learning
  ↓
Benchmark / Trust
  ↓
Reports / Executive Outputs

At every arrow the UI should expose the state that is genuinely known. AI never replaces a missing deterministic boundary.

## 2E. COMPLETE PRODUCT GATE

A product surface is complete only when:
Product UX + Visual consistency + Real data path + Truth state + Persistence + Tenant/RLS + Runtime behavior + Evidence + Tests + Performance + Deployment readiness

Passing build or route existence alone is never completion.



## 2. MASTER REQUIREMENTS — consolidated from the comprehensive specification

### Priority 1 — Foundation, ingestion and deterministic core
- Unified multi-format ingestion: XLSX multi-sheet, CSV, tabular/text PDF, Arabic/English numbers and dates, currency.
- Dataset classification and confidence.
- Automatic business relationship discovery: SKU, customer, supplier, account keys.
- Unit and packaging conversion.
- Preview + approval before import execution.
- Source authority and reconciliation.
- Historical state reconstruction.
- Null versus zero data-loss prevention.
- Business-key and persistent semantic dictionary.
- Deterministic query router and compute engine.
- Currency/FX and time intelligence.
- Data quality, coverage and completeness scoring.
- Cross-file linking and double-count prevention.
- Timeout, queue, chunking, cache and diagnostics.
- Anti-hallucination and regression tests.
- Offline resilience and Ollama independence.

### Priority 2 — Operational intelligence
- Commercial expert reasoning and automatic business diagnosis.
- Verified cost basis and explicit Profit Unavailable state.
- KPI definitions, formulas, required fields and windows.
- Returns, discounts, cancellations and unposted transactions.
- Inventory states: physical, available, reserved, damaged, blocked, sellable.
- Inventory values: cost, sales, liquid and dead stock.
- ABC / XYZ / FSN.
- Expiry and shelf-life intelligence where lot/batch dates exist.
- Aging: 0–30, 31–60, 61–90, 91–180, 180+.
- Trend: direction, velocity, acceleration, seasonality, volatility.
- Stockout and stochastic demand with minimum-data gates.
- Purchase routing: BUY NOW, BUY SOON, MONITOR, DO NOT BUY, OVERSTOCK.
- Sales/liquidation actions and price protection.
- Customer RFM, dynamic inactivity and churn risk.
- Supplier delivery, price and dependency scoring.
- Anomaly detection with evidence.

### Priority 3 — Financial and cash intelligence
- DSO, DIO, DPO, CCC.
- Separate bank, cashier, receivable, payable and liquidity concepts.
- 0/7/15/30/60/90-day cash projection and liquidity gaps.
- Receivables collection prioritization.
- Constraint-based liquidity allocation with operating cash reserve protection.
- Evidence-based supplier payment prioritization.
- Multi-level financial trends and seasonality.

### Priority 4 — Predictive, decision, memory and proactive intelligence
- Company/category/product/customer/supplier/cash-flow forecasting with minimum data thresholds.
- Backtesting: MAE/RMSE/MAPE and closed-loop quality tracking.
- Unified priority queue and confidence score.
- What-if scenarios and inaction impact.
- Opportunity intelligence.
- Analytical memory and historical snapshots.
- Proactive early warning and post-upload business diagnosis.
- Automatic business health report using verified data only.
- Optional isolated Onyx Pro dataset/sync.

### Electronics/domain extensions
- Product catalog, brands, categories, subcategories, variants, attributes.
- SKU, barcode, serial number, IMEI.
- Bundles and accessories.
- Warranty, RMA, repair tickets and service SLA.
- Customers, customer tiers, suppliers, warehouses, transfers, reservations.
- Purchases, orders, invoices, payments, receivables and returns.
- Base, wholesale-wholesale, wholesale, retail and customer-specific pricing.
- Campaigns, quantity tiers, pricing formulas, price recovery and price audit.
- Import: Excel, CSV, PDF, OCR, DQS, synonyms, profiles, hashes, resumable upload, deduplication, conflict resolution, snapshots and rollback.

## 3. Comprehensive acceptance and safety rules
1. No mock KPI values in production paths.
2. No LLM-generated numeric facts.
3. No business write from an AI response without an explicit approved command path.
4. Every decision requires evidence/quality gates.
5. Every tenant-scoped operation carries company/tenant scope.
6. Import preview precedes execution for user-uploaded datasets.
7. Empty imported fields never silently overwrite existing values.
8. Exact business keys take precedence over internal UUIDs for matching.
9. PDF/OCR extraction must never invent rows; uncertain extraction becomes a review/error state.
10. AI quota exhaustion falls back to deterministic rules; it never silently starts paid usage.
11. Ollama is optional and never required for customers.
12. Every requirement is tracked as FULLY IMPLEMENTED, PARTIALLY IMPLEMENTED or NOT IMPLEMENTED until evidence exists.
13. Financial calculations must use verified accounting inputs; purchasing totals must never be silently substituted for cost of sales.
14. External engines must not weaken RLS, tenant isolation, lineage or auditability.
15. Heavy AI/document/ML engines must be optional services or adapters, never mandatory customer installs.
16. Proprietary code, assets, branding and copied UI must never be introduced from inspiration products.
17. Money must use numeric/decimal-safe storage and arithmetic; never binary float for accounting values.
18. Sensitive data is never sent to external AI without explicit policy; sensitive/private workloads prefer isolated/local processing.
19. Logs must not contain secrets.
20. Never display 'sent/synced' before authoritative server acknowledgement.

## 4. AI Governance

AI does not calculate authoritative business numbers.

### Deterministic calculations
- Revenue
- Cost
- Profit
- Margin
- Stock
- Turnover
- Aging
- ABC/XYZ/FSN
- Financial ratios
- Forecast metrics and backtests

### AI responsibilities
- Explanation
- Trend interpretation
- Qualitative forecast narrative
- Recommendation wording
- Research/report synthesis over verified evidence

### AI pipeline
`Raw → Untrusted → Sanitized → Injection Detection → Structured → Deterministic Context → LLM`

Every Action Card should expose:
- Why
- Source Metrics
- Calculation
- Snapshot ID
- Confidence
- Expected Impact
- Action

If history is insufficient: `Forecast Unavailable: Insufficient Historical Data`.

AI ledger should support request/model/token/cost/time/timestamp tracking and quotas. At quota exhaustion: rule-based fallback.

## 5. Definition of Done
A requirement is only FULLY IMPLEMENTED when its applicable UI, backend, database, security, audit, event/queue behavior, error/loading/offline state, tests, E2E/regression coverage, performance evidence and documentation are present.

## 6. Permanent product-inspiration registry

### BI / Analytics
| Source | Patterns to learn from | Adopt | Boundary |
|---|---|---|---|
| Microsoft Power BI | executive dashboards, semantic models, drill-down, cross-filtering | YES, synthesized | no proprietary code/UI |
| Tableau | visual exploration, analytical storytelling, interaction | YES | no copied visual identity |
| Looker | governed metrics, semantic layer, reusable definitions | YES / HIGH | canonical definitions remain ours |
| Qlik Sense | associative exploration, selections, discovery | SELECTIVE | deterministic data model |
| ThoughtSpot | natural-language analytics, ask→inspect→act | YES | LLM never computes facts |
| Metabase | self-service questions, query builder, drill-through | YES | borrow patterns, not code |
| Apache Superset | SQL exploration, dashboards, filters, alerts | YES | no whole-platform embedding initially |
| Sigma | spreadsheet-like exploration, table interaction | YES | preserve semantic governance |
| Grafana | time-series, alert states, observability | SELECTIVE | operational monitoring focus |
| Lightdash | governed dimensions/measures, semantic consistency | SELECTIVE | verify component licenses |
| Domo / Sisense / Zoho Analytics / Omni | packaged executive analytics, embedded analytics, reusable dashboards | SELECTIVE | feature synthesis only |

### AI Analytics / Research
| Source | Patterns | Decision |
|---|---|---|
| Julius AI | conversational analysis and data exploration | YES, deterministic execution required |
| Hex | notebook/analysis reuse, collaborative analytical context | YES |
| Akkio / Pecan AI | predictive workflows and accessible forecasting | SELECTIVE; minimum-data gates |
| Databricks AI/BI | governed AI analytics, semantic context, enterprise workflows | YES conceptually; no platform dependency |
| STORM / Local Deep Researcher patterns | planning, multi-source research, evidence synthesis | YES for research/report workflows |

### ERP / Accounting / Operations
| Source | Patterns |
|---|---|
| Odoo | modular ERP workflows and connected business operations |
| ERPNext | open ERP/accounting/inventory workflow ideas |
| QuickBooks / Xero / Zoho Books | accounting concepts, reconciliation, receivables/payables, cash views |
| NetSuite | integrated finance/operations model |
| Cin7 / Katana | inventory, purchasing, stock movement and production workflows |

### Productivity / UX
| Source | Patterns |
|---|---|
| Linear | command palette, keyboard-first actions, inbox/decision workflow, saved views, progressive disclosure |
| Notion | connected knowledge workspace, reusable context, search |
| Stripe | clean financial information hierarchy and status clarity |
| Vercel | fast responsive product UX, deployment/observability thinking |

### Document / AI application products
| Source | Patterns |
|---|---|
| Docling | document layout understanding, tables, structured extraction |
| PaddleOCR | OCR/document parsing, multilingual extraction |
| Unstructured | document partitioning and normalized document elements |
| Open WebUI | model/provider abstraction and local/private AI UX |
| Dify | datasets, knowledge bases, workflows, model routing, observability |
| Flowise | visual AI/RAG workflow composition |
| Langflow | visual tool/LLM workflow composition |

## 7. Open-source source repository registry

These are source references, not automatic dependencies. Every candidate is evaluated by capability, license, bundle/runtime cost, security, maintenance, browser/server fit and measurable benefit.

### Analytics / data
- DuckDB — https://github.com/duckdb/duckdb — MIT
- Apache Arrow — https://github.com/apache/arrow — Apache-2.0
- Apache Parquet — https://github.com/apache/parquet-format — Apache-2.0 ecosystem
- Polars — https://github.com/pola-rs/polars — MIT
- pandas — https://github.com/pandas-dev/pandas — BSD-3-Clause
- Apache Spark — https://github.com/apache/spark — Apache-2.0
- Trino — https://github.com/trinodb/trino — Apache-2.0
- Apache Superset — https://github.com/apache/superset — Apache-2.0
- Metabase — https://github.com/metabase/metabase — AGPL-3.0
- Redash — https://github.com/getredash/redash — BSD-2-Clause
- Grafana — https://github.com/grafana/grafana — AGPL-3.0
- Lightdash — https://github.com/lightdash/lightdash — inspect component-specific licensing before reuse

### Document / PDF / OCR
- Apache Tika — https://github.com/apache/tika — Apache-2.0
- PyMuPDF — https://github.com/pymupdf/PyMuPDF — AGPL/commercial dual licensing; isolate unless approved
- Camelot — https://github.com/camelot-dev/camelot — MIT
- Tabula — https://github.com/tabulapdf/tabula-java — MIT
- Tesseract OCR — https://github.com/tesseract-ocr/tesseract — Apache-2.0
- EasyOCR — https://github.com/JaidedAI/EasyOCR — Apache-2.0
- docTR — https://github.com/mindee/doctr — Apache-2.0
- OpenCV — https://github.com/opencv/opencv — Apache-2.0
- Docling — https://github.com/docling-project/docling — inspect current repository license/components before embedding
- PaddleOCR — https://github.com/PaddlePaddle/PaddleOCR — inspect current repository license/components before embedding
- Unstructured — https://github.com/Unstructured-IO/unstructured — inspect current repository/component licensing before embedding

### ML / evaluation / workflow
- MLflow — https://github.com/mlflow/mlflow — Apache-2.0
- TensorBoard — https://github.com/tensorflow/tensorboard — Apache-2.0
- Orange — https://github.com/biolab/orange3 — GPL family; reference/isolated use
- KNIME — https://github.com/knime/knime-core — inspect extension licensing
- LangChain — https://github.com/langchain-ai/langchain — MIT
- LangGraph — https://github.com/langchain-ai/langgraph — MIT
- Dify — https://github.com/langgenius/dify — inspect exact component/product licensing
- Langflow — https://github.com/langflow-ai/langflow — MIT
- PostHog — https://github.com/PostHog/posthog — core/EE licensing must be checked per component

## 8. Product capability synthesis map
- Executive cockpit with clear KPI hierarchy and drill-down.
- Governed semantic metric definitions.
- Associative exploration and cross-filtering.
- Natural-language Ask → Inspect → Act workflow.
- Self-service query and exploration for non-technical users.
- Spreadsheet-like analytical interaction where useful.
- Time-series and operational monitoring.
- Forecasting with confidence and backtesting.
- Reusable analytical context and snapshots.
- Modular ERP/accounting workflows.
- Receivables/payables and cash visibility.
- Inventory, procurement and supplier workflows.
- Command Palette / keyboard-first navigation.
- Saved views and decision queues.
- Connected knowledge and evidence.
- Document layout/table/OCR routing.
- Model/provider abstraction.
- Dataset/knowledge/workflow orchestration.
- Observability, diagnostics and auditability.
- Progressive disclosure instead of dashboard overload.

## 9. Reporting / Export

Supported report domains should include Sales, Purchases, Inventory, Customers, Suppliers, Receivables, Payables, Profitability, Warranty/Repairs/RMA where applicable, Pricing, Import, Sync, Audit, Security and AI.

Exports: PDF, Excel, CSV and print where applicable.

Every material report must carry:
- Snapshot ID
- As Of timestamp
- Source/lineage
- Version
- Filters
- Owner
- Data freshness
- Confidence/quality where applicable

## 10. Audit / Observability / Health

Every sensitive operation records:
- Actor
- Action
- Before
- After
- Reason
- Timestamp
- Request ID
- Correlation ID

Logs contain no secrets.

Core metrics:
- API P95
- DB latency
- Queue lag
- Import throughput
- Search latency
- Cache hit ratio
- Notification success
- AI usage
- Error rate

Tracing should cover UI → API → DB/Queue where applicable.

Health Center checks:
- Database
- Realtime
- Storage
- Notifications
- Queues
- Outbox
- Onyx
- AI backends
- Search
- Backups
- RLS
- Critical relations

Health states: Healthy / Warning / Critical / Unknown.

## 11. Backup / Disaster Recovery

Define RPO and RTO.

Backups must be automated, encrypted and verified.

Restore drills must verify:
1. Database restoration.
2. Migrations.
3. Integrity.
4. Counts.
5. Business-critical records.
6. Smoke tests.
7. Restore timing.

A backup existing is not evidence of disaster-recovery readiness.

## 12. API / Database governance

Every endpoint must have, as applicable:
- Authentication
- Authorization
- Validation
- Rate limiting
- Idempotency
- Versioning
- Structured errors
- Correlation ID

Errors expose code/message/details/correlation_id, never stack traces.

Database governance:
- migrations and rollback strategy
- foreign keys
- unique/check constraints
- NOT NULL where required
- numeric-safe money
- timezone policy
- indexes
- query-plan review
- row/version concurrency controls

## 13. Contract change control

Changes to API, DB, Import Profile, KPI, Onyx Mapping, Permission, Order Workflow, AI Schema, Report or Pricing Formula require:
- Change ID
- Old Contract
- New Contract
- Reason
- Impact Analysis
- Affected Requirements
- Affected Tests
- Migration
- Approval
- Version
- Rollback plan

## 14. Data freshness

Freshness states:
- Fresh
- Warning
- Stale
- Critical
- Unknown

Stale data must not silently drive alerts, forecasts or executive decisions.
Every important dashboard/report shows As Of + Freshness.

## 15. Concurrency and atomicity

Explicitly test:
- Concurrent orders
- Concurrent imports
- Concurrent price edits
- Concurrent manual inventory edits
- Concurrent Onyx sync

Prevent:
- Lost updates
- Double reservations
- Duplicate imports
- Double invoices
- Double event effects

## 16. Performance engineering

Targets:
- Interactive API P95 <300ms
- Search <150ms target
- Normal import preview <2s
- Heavy jobs asynchronous
- UI non-blocking

Techniques:
- code splitting
- lazy routes
- prefetching where beneficial
- query caching
- virtualized lists
- debounced search
- Web Workers
- image optimization
- compression
- HTTP caching
- database indexes
- query-plan review
- connection pooling where applicable

Performance budgets should cover initial JS, images, API payloads, queries and memory.

Do not use cosmetic UI optimizations to hide a slow query.

## 17. Job UX

Long-running jobs expose:
- percentage
- current phase
- processed
- remaining
- speed
- ETA

Suggested phases:
Reading → Detection → Mapping → Validation → Quality → Merge → Analytics → Recommendations

Actions:
- Cancel
- Pause
- Retry failed chunks

## 18. Feature flags / safe rollout

Support flags by:
- Global
- Organization
- Role
- Percentage

Lifecycle:
Internal → Canary → Limited → Full

Each flag records owner, created_at, expires_at and reason.

## 19. Developer / Architecture Center

The platform should be able to expose/generated views for:
- Route Tree
- Component Tree
- Permission Matrix
- DB Map
- RPC Map
- Event Map
- Queue Map
- Integration Map
- Feature Flag Map
- Import Profile Map

It should detect:
- duplicate engines
- orphan routes
- unused components
- missing permissions
- missing RLS
- unindexed queries
- TODOs/placeholders
- mock production paths

## 20. Golden datasets / regression

Maintain stable datasets for:
- products
- prices
- inventory
- orders
- customers
- suppliers
- imports
- PDFs
- OCR
- AI prompts

Every important bug becomes a permanent regression test, including tests for non-existent entities and hallucination traps.

Performance/load suites should cover at least:
- 1k products
- 10k products
- 100k+ import rows
- large Excel
- large PDF
- thousands of orders
- large notification history

Measure route load, API/DB latency, import throughput, memory peak, AI first token when applicable, and UI frame stability.

## 21. Acceptance / Traceability Matrix

Every REQ-ID should track:
- Domain
- Requirement
- Business Rule
- Source of Truth
- Inputs
- Outputs
- Preconditions
- Postconditions
- Permissions
- Failure Modes
- Side Effects
- Dependencies
- Performance SLA
- Security Requirements
- Acceptance Criteria
- Test ID
- Evidence
- Owner
- Version
- Status

Status lifecycle:
Specified → Implemented → Unit Tested → Integration Tested → E2E Tested → Security Tested → Performance Tested → Accepted

Master traceability:
`Requirement → Code → API → Database → Permission → Event → Test → E2E → Security → Performance → Evidence → Acceptance`

No requirement may be marked accepted without a Test ID and evidence.

## 22. Release gates

Do not declare FINAL when any applicable gate fails:
- Security
- Data integrity
- Pricing isolation
- SSOT
- Import correctness
- Onyx reconciliation/isolation
- Backup/Restore
- E2E
- Regression
- Performance

No fake production data.

## 23. Phased execution

Phase 0 — Inventory + architecture audit + baseline.
Phase 1 — Stabilize + bugs/root causes.
Phase 2 — SSOT + contracts + governance.
Phase 3 — Import + DQS + PDF/OCR + profiles.
Phase 4 — Catalog + inventory + purchasing + Onyx.
Phase 5 — Pricing + orders + atomicity + invoice.
Phase 6 — Outbox + queue + search + cache + notifications.
Phase 7 — Analytics + finance + forecast.
Phase 8 — AI governance + action cards.
Phase 9 — Security + session + tenant isolation.
Phase 10 — PWA + offline + sync.
Phase 11 — Performance + DR + observability.
Phase 12 — Full E2E + regression + acceptance.

Gate rule: PASS → next phase. FAIL → fix → re-test.

## 24. Permanent architecture principles
1. Semantic layer first.
2. Evidence-first AI.
3. Deterministic calculations.
4. Progressive compute: browser → worker/DuckDB → heavier server engine → distributed engine only when justified.
5. Adapter architecture.
6. Local/private processing when useful, never mandatory local installation.
7. Parse once, reuse many times.
8. Confidence everywhere.
9. Data freshness everywhere.
10. End-to-end lineage.
11. Observability.
12. Human approval for financial actions.
13. Decision queue instead of alert spam.
14. Ask → inspect → act.
15. Progressive disclosure.
16. Low-bandwidth/mobile-first behavior.
17. Accessibility and keyboard-first workflows.
18. No AI-generated numeric facts without verified source data.
19. Source authority before reconciliation.
20. Historical snapshots and analytical memory.
21. Minimum-data gates for statistical/predictive claims.
22. Graceful degradation when optional AI/document backends are unavailable.
23. Customer-facing core remains useful without AI.
24. Server acknowledgement before user-facing success state.
25. No architectural duplication without measurable benefit.

## 25. Selection rule
For every new idea, evaluate:
`value = accuracy_gain + capability_gain + UX_gain + performance_gain`
against:
`cost = complexity + runtime_weight + maintenance + licensing_risk + security_risk + vendor_lock_in`
Only integrate when expected net value is positive and no project invariant is violated.

## 26. Hard rejection rules
Never integrate an external idea if it decreases numerical accuracy, introduces hallucinated business facts, creates mandatory paid AI usage, makes Ollama mandatory for customers, requires large local model downloads, forces a heavy runtime when a lighter native implementation is sufficient, weakens tenant/RLS isolation, bypasses evidence/lineage, performs financial calculations in an LLM, silently overwrites imported data with blanks, replaces business keys with internal IDs, invents PDF/OCR rows, copies proprietary code/assets/branding, introduces an unapproved restrictive license, or duplicates a stronger existing Report Advisor implementation without measurable benefit.

## 27. Integration tiers
- **Tier A — Native:** TypeScript/Supabase/browser APIs for small deterministic capabilities.
- **Tier B — Adapter:** external open-source engine behind a replaceable adapter; core remains functional if unavailable.
- **Tier C — Optional service:** heavy OCR/PDF/ML/distributed engines; no mandatory local installation.
- **Tier D — Reference only:** use interaction/architecture ideas without shipping external code.

## 28. Update protocol — mandatory

Whenever a new website, product, open-source repository, framework, technique, UX pattern, algorithm, document engine or requirement is discovered:
1. Add it to this file.
2. Record the useful capability/pattern.
3. Record source repository and license when available.
4. Record licensing/security/performance uncertainty.
5. Decide Native / Adapter / Optional Service / Reference Only / Reject.
6. If integrated, add an acceptance/regression test.
7. Update implementation mapping/status.
8. Do not create another competing master reference.
9. Treat older files as historical evidence, not competing authorities.

## 29. Current implementation mapping

- Unified import → existing unified import engine.
- Semantic metrics → semantic metric layer.
- Data quality → quality gates.
- Evidence/lineage → evidence and lineage contracts.
- Inventory → canonical intelligence + stochastic inventory.
- Forecasting → forecast + backtest + confidence.
- Finance → DSO/DIO/DPO/CCC + liquidity + collection/payment decisions.
- Document AI → document intelligence gateway + OCR/PDF adapters.
- ChatBI → deterministic query/execution path + evidence.
- Product UX → Command Palette + Executive Cockpit + decision queue.
- Free/open-source stack → adapter registry and licensing isolation.
- Master requirements → this document.

## 30. Single-reference policy

`docs/MASTER_PRODUCT_REFERENCE.md` is the only operational master reference for Report Advisor requirements, inspiration, open-source technology selection, architecture guardrails, acceptance rules, release gates and implementation traceability.

Other documents may remain as:
- historical source material;
- detailed technical evidence;
- test output;
- implementation notes;
- external source snapshots.

They must not become competing master lists.

## 31. Execution coverage snapshot — 2026-08-21

This percentage is an engineering coverage estimate, not a claim that the product is production-accepted. A capability counts as implemented only when code evidence exists; it counts as accepted only when the Definition of Done and release gates have evidence.

### Current estimated coverage
- Foundation / ingestion / deterministic core: **82% implemented**
- Operational intelligence: **78% implemented**
- Financial / cash intelligence: **72% implemented**
- Predictive / decision / memory intelligence: **69% implemented**
- AI governance / free-first runtime: **84% implemented**
- Document intelligence / OCR architecture: **76% implemented**
- Security / tenant / RLS governance: **86% implemented**
- UX / product experience / routing: **81% implemented**
- Observability / DR / release engineering: **63% implemented**
- E2E / regression / acceptance evidence: **55% implemented**

**Overall engineering implementation coverage: ~75%.**

**Production acceptance coverage: ~58%.**

The gap is intentional: implemented code is not counted as fully complete until integration, security, performance, E2E and evidence gates pass. The next work should therefore prioritize closing acceptance gaps rather than adding cosmetic features.

## 32. Immediate execution priorities

1. Convert remaining PARTIAL requirements into explicit REQ-ID traceability with code/test/evidence links.
2. Close E2E gaps around authenticated tenant bootstrap, import-to-report flow, decision flow and report export.
3. Harden document/OCR uncertainty states and ensure every extracted field retains source lineage.
4. Verify financial engines against golden datasets and concurrency cases.
5. Add performance evidence for search, import preview, large imports and dashboard aggregation.
6. Complete backup/restore drill evidence and health-center checks.
7. Verify PWA/offline/sync conflict behavior under real reconnect scenarios.
8. Keep free deterministic mode as the default and reject silent paid AI fallback.
9. Only after gates improve, add further high-value inspiration-derived capabilities.

## 33. Continuous development rule

Development proceeds in large batches without requiring user prompts between every sub-step. Each batch must:
- inspect current implementation;
- select the highest-value incomplete capability;
- implement or harden it;
- add/update regression checks;
- update this master reference;
- preserve the single-reference policy;
- report only after a meaningful batch or a blocking failure.

Never trade correctness for apparent progress percentage.


### LATEST PRODUCT-CODE OVERRIDE — 2026-09-21 / TRUST & EVIDENCE POLISH
- **Latest exact product/code head:** `778a601189077e0bda5b844e6d6a06e35ab7e1e3`.
- **Completed:** Trust & Evidence now uses one actionable evidence-path panel, exposes all six evidence/governance surfaces without duplicating the same list, provides a context-aware next trust action, and supports explicit refresh.
- **Truth rule preserved:** the next action is derived only from the existing data-quality snapshot state; no new confidence score, synthetic evidence, or unsupported business state was introduced.
- **Architecture unchanged:** no route, RPC, runner, job family, calculation, tenant/RLS path, or import lifecycle was introduced.
- **Deployment boundary:** exact current head remains unproven live; Vercel continues to report the free-plan `build-rate-limit` blocker.

## IMPLEMENTATION UPDATE — 2026-09-21 / UI PRODUCT WAVE 26
This update records implementation state only; it does not replace the product constitution.

- Current exact product/code HEAD: `3de200146403ff4e1dae105837dd37af3eff3f50`.
- Scenario/what-if surface: the existing deterministic scenario calculation is now presented as a governed sensitivity workflow with baseline, assumptions, revenue/cost/profit deltas, margin impact, reset, boundaries and decision handoff.
- Scenario truth gate: the existing financial truth check remains authoritative; blocked state now directs the user toward Data Quality or Trust/Evidence rather than exposing an empty or misleading scenario surface.
- Data Quality: existing snapshot and diagnostic score logic are preserved; the UI now makes the score boundary explicit and adds source-import and Trust/Evidence actions.
- No new backend capability was invented. No importer taxonomy was added to product UX.
- Exact-head runtime/build proof remains open and must be re-proven on this SHA.


## IMPLEMENTATION UPDATE — 2026-09-21 / CORE IMPORT PROVENANCE HARDENING
- Current exact product/code HEAD: `aaf3b07e2399718c8efe379c328d96ed149ea2a4`.
- The unified import remains one general source-first experience.
- Canonical server execution now verifies the stored source bytes, re-extracts them, re-runs reconciliation, applies authoritative quality gates, and sends only server-derived rows to the existing durable commit boundary.
- Quality contract: below 50 rejects; 50–74 requires explicit review approval; 75+ proceeds without that review requirement.
- Browser-derived rows are no longer authoritative commit input.
- No new RPC, runner, import route, specialized importer, tenant/RLS model or product taxonomy was introduced.
- Exact-head runtime/build proof remains open and must be re-proven on this SHA.


## IMPLEMENTATION UPDATE — 2026-09-21 / CORE RESILIENCE + UI WAVE 28
- Exact product/code HEAD: `403d6af5211482fd9086668136b2902707970e41`.
- Unified import remains source-first and domain-neutral; authoritative commit input is derived server-side from stored source bytes.
- Durable worker recovery has been exercised against live staging using the existing canonical recovery function. Five expired processing leases were requeued according to their remaining retry budget.
- A forward-only migration now aligns fresh environments with the live retryable-expired-lease recovery behavior.
- Decision Experience now surfaces actual owner/deadline/status/expected-impact/impact-result fields already present in recommendation records.
- Work Center now surfaces durable worker health with explicit partial-read semantics.
- Scanned-PDF OCR remains fail-closed server-side until a true authoritative OCR-capable runtime is available.


## IMPLEMENTATION UPDATE — 2026-09-21 / CONTINUOUS EXECUTION WAVE 29
- Corrected a real current-head AnalyticsPage import defect: the analytics hero used `ChartNoAxesCombined` without importing it.
- Removed the unused `BarChart3` import from the same file.
- Product shape is unchanged: unified source-first import, canonical 8-zone information architecture, progressive disclosure, Aghbari RTL design system, and evidence-first states remain binding.
- No new route, importer, RPC, runner, job family, table, tenant/RLS path, or deterministic calculation was introduced.
- Runtime boundary remains explicit: exact-head deployment/build/browser proof is not current PASS while Vercel is blocked by free-plan build-rate limit.


## IMPLEMENTATION UPDATE — 2026-09-21 / UI TRUTH + INTERACTION HARDENING WAVE 30
- `ConnectionsPage` now communicates three evidence states: proven path, bounded runtime path, and adapter-only path. Claims about watched-folder automation and scanned-PDF OCR are explicitly bounded until runtime proof exists.
- The secondary source-center action now routes to Trust/Evidence rather than a demo-first surface.
- `IntelligencePage` recommendation acceptance/rejection now exposes in-flight state and failure handling without changing the existing canonical mutation path.
- The product constitution remains unchanged: one source-first import experience, eight top-level zones, progressive disclosure, Aghbari RTL enterprise design, evidence-aware states, and no Bolt/CRUD taxonomy.


## IMPLEMENTATION UPDATE — 2026-09-21 / EXECUTIVE REPORT ACCOUNTABILITY WAVE 31
- Executive reporting now uses existing recommendation records to expose active decision count, accountable-owner coverage, and recorded outcome coverage.
- Recommendation summaries show real status/owner/expected impact/actual impact result fields.
- This is a presentation/value improvement only; the canonical product architecture, source-first unified import, evidence states, deterministic calculations, tenant/RLS and backend paths are unchanged.


## IMPLEMENTATION UPDATE — 2026-09-21 / IMPORT AUTHORITY + CI REPAIR WAVE
- The unified import entry is now single-path source-first: `/import` renders only the canonical importer and does not expose the legacy folder-specialization UI.
- Snapshot persistence for source analysis is now performed from the server-authoritative canonical execution boundary after durable execution; the browser import page does not write directly to `source_analysis_snapshots`.
- Import CI now explicitly guards the entry surface against fixed entity taxonomy and verifies authoritative parse/reconciliation precedes the source-ready state.
- Decision Experience and Liquidity syntax/lint defects found by exact-head GitHub Actions were repaired.
- No new importer taxonomy, RPC, runner, job family, or deterministic calculation path was introduced.


## IMPLEMENTATION UPDATE — 2026-09-21 / CURRENT-HEAD JSX REPAIR
- Decision Experience JSX was corrected after exact-head CI exposed a parser error; the readiness display remains driven by existing recommendation state.
- The current code candidate also contains the unified import boundary correction: one canonical source-first entry, no legacy folder-specialization UI, server-authoritative Snapshot persistence, and explicit import-order contract checks.
- No new product taxonomy, RPC, runner, or calculation engine was introduced.


## IMPLEMENTATION UPDATE — 2026-09-21 / DECISION JSX FINAL REPAIR
- Decision Experience now has a direct, structurally valid Decision Readiness block driven by the existing recommendation state.
- This was a presentation-only repair; no decision backend path, deterministic business calculation, tenant/RLS, or approval contract changed.


## IMPLEMENTATION UPDATE — 2026-09-21 / ROUTE + JSX CLOSURE
- The canonical Decision Experience conditional is structurally valid and its readiness UI remains based on existing recommendation data.
- UI route completeness now treats `/proposal-demo` as an explicitly permitted internal progressive-disclosure route rather than a primary navigation category.
- No new top-level navigation section or product taxonomy was introduced.
