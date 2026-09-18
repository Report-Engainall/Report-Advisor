# Report Advisor — Master Product, Requirements & Open-Source Reference

> **AUTHORITATIVE SINGLE REFERENCE.** This is the permanent registry for the comprehensive product requirements, architecture guardrails, product inspiration, open-source projects, licenses, integration decisions, acceptance rules, implementation mapping, reliability rules, and release gates used while evolving Report Advisor.
>
> **Last reviewed:** 2026-09-18
>
> This file supersedes scattered requirement/inspiration notes as the operational reference. New requirements, sources and implementation decisions are appended here rather than creating competing master lists.

## 1. Mission

Report Advisor is a new product. It may learn from proven products and open-source projects, but it must not become a copy of any vendor.

The target is a unified, accurate, fast, flexible, predictive, advisory and financially safe business-intelligence platform with deterministic business calculations, governed semantic metrics, evidence/lineage, multi-format document intelligence, operational/inventory/procurement intelligence, customer/supplier intelligence, financial/accounting intelligence, forecasting/backtesting, decision/what-if intelligence, ChatBI, report generation, proactive alerts, low-bandwidth UX, and a free-first/open-source-first architecture with no mandatory local AI installation or paid AI provider.

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

---
# 34. PRODUCT EVOLUTION 2026-09-18 — DECISION OPERATING SYSTEM

## 34.1 Strategic repositioning
Report Advisor is not allowed to compete primarily as another dashboard builder.

Target category:
Decision Operating System for SMB / wholesale / distribution businesses.

Commercial promise:
From source to decision to measurable outcome — with proof at every step.

The product must make a customer feel that the system:
1. understands the business context;
2. distinguishes observed fact from estimate, forecast and unavailable data;
3. explains why an issue matters;
4. proposes constrained actions;
5. gets the human approval required for consequential actions;
6. records what was actually done;
7. measures the outcome;
8. learns from verified outcomes without rewriting historical truth.

Dashboards, AI chat, OCR and charts are delivery mechanisms, not the category itself.

## 34.2 Five permanent competitive moats

### MOAT-1 — Proof Moat
Material KPI, recommendation, scenario, decision and report outputs should expose an Evidence Passport containing where applicable:
- tenant/company
- source identifier
- source snapshot
- source hash/fingerprint
- as-of timestamp
- freshness
- formula/semantic metric
- included/excluded records
- data-quality state
- assumptions
- confidence
- algorithm/model version
- decision/recommendation fingerprint
- approval identity
- outcome reference

Navigation must support:
Answer → Why → Evidence → Calculation → Source → Snapshot.

### MOAT-2 — Decision Moat
Build a Decision Control Tower rather than an alert wall.

Decision flow:
Signal → Business impact → Evidence → Alternatives → Recommendation → Constraints → Approval → Work → Expected outcome → Actual outcome → Learning.

Where data permits, expose both:
- expected impact if action is taken;
- expected impact if no action is taken.

Inaction is a scenario estimate, never a historical fact.

### MOAT-3 — Commercial Constraint Moat
Recommendations must account for applicable:
- cash budget and protected operating reserve;
- supplier lead time and reliability;
- MOQ and pack size;
- unit conversion;
- shelf-life/expiry;
- current/projected demand;
- substitute coverage;
- customer priority;
- margin;
- stockout opportunity;
- pending orders;
- operating capacity.

Canonical action classes:
BUY NOW | BUY SOON | MONITOR | REDUCE | DO NOT BUY | INVESTIGATE DATA.

### MOAT-4 — Outcome Moat
Introduce an Outcome & ROI Ledger:
Expected → Approved → Executed → Actual → Delta → Quality → Feedback → Learning.

Track where evidence exists:
- expected vs actual revenue impact;
- expected vs actual cash impact;
- expected vs actual stockout avoidance;
- predicted vs actual demand;
- recommendation acceptance;
- time-to-execution;
- decision effectiveness.

Historical source truth is immutable.

### MOAT-5 — Experience Moat
Required experience:
- Arabic RTL first;
- English/LTR support;
- mobile-first;
- low-bandwidth;
- installable PWA;
- role-aware;
- progressive evidence disclosure;
- keyboard-first desktop;
- touch-first mobile;
- no dead-end screens;
- no false success states;
- consistent product shell.

## 34.3 Flagship product surfaces
These are canonical surfaces, not separate applications.

A. Evidence Passport
Reusable inspector for KPI/report/decision/recommendation/source provenance.

B. What Changed
Compare current state to a verified prior snapshot and explain:
- what changed;
- magnitude;
- affected entities;
- supported contributors;
- business-vs-data-quality status;
- recommended action.

C. Decision Control Tower
One prioritized queue for high-value risks, opportunities, purchasing, collections, cash constraints, customer/supplier risks, data-quality blockers, approvals and overdue actions.

D. Counterfactual / Scenario Lab
Simulate demand changes, supplier delays, price changes, cash budgets, stockouts, substitutes, liquidation and assortment changes.
Every result is explicitly a scenario output.

E. Outcome & ROI Ledger
Persist expected vs actual results.

F. Data Trust Center
Expose freshness, coverage, source health, reconciliation health, import health, OCR/review queue, metric certification and runtime trust signals according to role.

G. Semantic Metric Studio
Govern metric identity, formula, required fields, dimensions, periods, owner, consumers, evidence, version and certification state.
Changes use the existing contract-change governance.

H. Agent Control Room
Every AI run exposes:
- agent role;
- task;
- scope;
- tools;
- data scope;
- evidence used;
- deterministic calculations invoked;
- confidence/data sufficiency;
- approval requirement;
- status;
- cancel/retry;
- resulting recommendation.

Hidden model chain-of-thought is never exposed.

I. Commercial Playbooks
Reusable governed workflows for:
- cash recovery;
- slow-stock liquidation;
- reorder protection;
- customer recovery;
- supplier escalation;
- margin-leak remediation;
- data-quality remediation.

J. Executive / Board Pack
Governed assembly of executive summary, changes, risks, opportunities, cash, sales, inventory, receivables, decisions, actions, evidence gaps and expected-vs-actual outcomes.

## 34.4 Additional high-value intelligence
### Profit Leak Radar
Detect evidence-backed margin/cash leakage from cost changes, discounts, returns, invalid stock, price anomalies, slow-moving capital and collection delays.

### Customer Recovery Playbook
Compare normal cadence, SKU mix, stockout effects and receivable friction before recommending recovery actions.

### Supplier Risk Cockpit
Unify lead time, reliability, price trend, shortages, dependency and affected products.

### Assortment & Cash Simulator
Model assortment changes under service, cash, margin, customer-coverage and supplier constraints.

### Merchant Memory
Persist historical business snapshots and decisions so the system can answer:
what we knew, what we decided, why, and what happened.
Historical source truth is never rewritten.

### Continuous Reconciliation
Where technically supported, continuously compare:
SOURCE → CANONICAL DATA → DERIVED METRICS → REPORT → DECISION.
Surface drift before it becomes a management problem.

### Signal-to-Noise Controller
Allow role-specific thresholds, evidence thresholds, notification windows and snooze policies.
Prefer fewer high-quality actions over alert volume.

## 34.5 AI product policy
AI may explain, summarize, classify, assist document interpretation, propose investigation paths and rank evidence-backed options.

AI may not:
- invent numeric facts;
- override deterministic calculations;
- change canonical data without approved command paths;
- approve financial actions automatically;
- bypass tenant/security boundaries;
- fabricate confidence;
- conceal uncertainty.

Premium AI remains optional. The deterministic core remains useful without AI.

## 34.6 Data Contract Autopilot
When source schema changes, the system may propose field mappings, unit/date/currency interpretation and duplicate identity rules.

Ambiguous mappings must follow:
PROPOSED → REVIEW REQUIRED → APPROVED.

Uncertain mappings never silently alter authoritative history.

## 34.7 Embedded intelligence direction
Build toward one canonical embeddable contract:
Canonical Metrics + Evidence → API/Embed Adapter → Governed Experience.

Do not duplicate calculation engines for embedded experiences.

## 34.8 White-label / Proposal Demo Mode
The product must support sales and marketplace demonstrations.

Given an authorized client/job context:
1. identify business goals;
2. map goals to capabilities;
3. create a governed demo workspace;
4. use realistic anonymized or approved sample data;
5. rename presentation context only where permitted;
6. highlight the client-specific journey;
7. show evidence, not screenshots alone;
8. generate an executive demo presentation;
9. generate a proposal-ready capability matrix;
10. preserve product and licensing boundaries.

Never present synthetic results as real client evidence.

## 34.9 Three-layer commercial proof
A sale-ready capability needs:
1. Visual proof — immediate understanding.
2. Functional proof — real product workflow.
3. Trust proof — evidence and exact business data.

Layer 1 alone is a mockup, not a premium feature.

## 34.10 Value instrumentation
Measure business value, with tenant/privacy controls:
- time to first useful result;
- time to first trusted insight;
- time to first decision;
- decision acceptance rate;
- time from decision to execution;
- expected vs actual outcome;
- percentage of recommendations with sufficient evidence;
- unresolved data-quality debt;
- manual reporting effort avoided where measurable;
- recurring use of high-value playbooks.

Usage telemetry never replaces business evidence.

## 34.11 Premium acceptance gate
A high-value feature is FULLY IMPLEMENTED only when applicable:
1. REQ-ID exists;
2. roles/permissions are defined;
3. canonical data source exists;
4. deterministic boundary is defined;
5. evidence contract exists;
6. loading/empty/error/offline/blocked states exist;
7. mobile/desktop UX exists;
8. keyboard/touch accessibility exists;
9. authenticated E2E exists;
10. security/tenant boundaries are tested;
11. performance budget is met;
12. side effect/outcome is persisted when the feature acts;
13. regression test exists;
14. exact-head evidence exists;
15. customer-facing explanation exists.

## 34.12 Product value gate
Add a product gate beside engineering certification:
TRUST + DECISION VALUE + OUTCOME VALUE + UX QUALITY + PERFORMANCE + COMMERCIAL PROOF.

Do not conflate:
TECHNICALLY_COMPLETE
PRODUCT_COMPLETE
COMMERCIAL_READY
CERTIFIED.

## 34.13 Competitive design rule
Do not try to beat Power BI, Tableau or ThoughtSpot on every dimension.

Strategic differentiation:
Arabic-first + wholesale intelligence + evidence-first governance + constraint-aware decisions + outcome tracking + low-bandwidth operation + fast client-specific deployment.

## 34.14 Market-facing packages
Do not sell dashboard pages.

Package outcomes:
- Decision Starter — data intake + executive truth + top risks/opportunities.
- Inventory Command — stockout protection + reorder + slow-stock/cash intelligence.
- Cash Recovery — receivables + liquidity + collection/payment priorities.
- Commercial Control Tower — recommendations + approvals + work + outcome ledger.
- Enterprise Decision OS — RBAC + governance + integrations + API/embed + audit + custom intelligence.

Pricing is server-configurable and must be validated by real customer demand.

## 34.15 Future moat candidates
Investigate only after the core decision loop is proven:
- privacy-safe merchant benchmarking;
- vertical intelligence packs;
- reseller/white-label;
- private deployments;
- SSO/SCIM;
- API/webhooks marketplace;
- industry agent marketplace;
- multilingual report narratives;
- mobile field-agent workflows;
- approved external-system write-back;
- measured decision ROI.

## 34.16 Market signal policy
2026 market evidence shows BI vendors moving toward AI-first/agentic analytics, governed semantic context, proactive insights and embedded analytics rather than static dashboards alone. Current marketplace listings also show heavy commoditization of basic Excel/Power BI dashboard services, while higher-priced offerings emphasize executive modeling, documentation, decision support and maintainability.

This is a positioning signal, not a product requirement copied from any vendor.

## 34.17 Requirement lifecycle
Every strategic requirement follows:
DISCOVERED → SPECIFIED → IMPLEMENTED → VERIFIED → PRODUCT_COMPLETE → COMMERCIAL_READY → CERTIFIED.

No state is inferred from appearance or code existence.

## 34.18 Feature selection formula
NET_VALUE =
customer value
+ trust gain
+ decision speed
+ outcome value
+ differentiation
- complexity
- runtime cost
- maintenance
- security risk
- licensing risk
- vendor lock-in.

Reject or defer negative-net-value ideas or anything violating a non-negotiable invariant.


## 34.19 2026 execution portfolio

Execute the new requirements through three coordinated value tracks rather than creating a large parallel feature backlog:

### Track A — Trust Core
- Evidence Passport
- Data Trust Center
- What Changed
- Semantic Metric Studio
- Continuous Reconciliation

### Track B — Decision Value
- Decision Control Tower
- Counterfactual / Scenario Lab
- Outcome & ROI Ledger
- Profit Leak Radar
- Customer Recovery Playbook
- Supplier Risk Cockpit
- Assortment & Cash Simulator
- Merchant Memory

### Track C — Commercial Scale
- Proposal Demo Mode
- Commercial Playbooks
- Executive / Board Pack
- Embedded Intelligence contract
- enterprise governance/integrations
- vertical intelligence packs

Track A should create the trust primitives used by Tracks B and C. Track B should prove customer value before Track C expands packaging or integrations.

### 34.20 Product investment rule
Do not start a new flagship surface when an existing surface can be upgraded into a measurable decision loop with lower complexity.

Prefer complete loops over module count:
signal → evidence → recommendation → approval → action → outcome.

### 34.21 Competitive non-goals
Do not chase feature parity with every generic BI vendor. Do not add generic chart types, decorative AI chat, arbitrary marketplace connectors or expensive infrastructure unless a validated customer problem requires them.

### 34.22 Saleability rule
Every flagship workflow must have a 3-minute customer demonstration path, a real evidence path, and a clear business outcome statement before it is marketed as premium.
