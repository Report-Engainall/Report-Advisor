# Report Advisor — Master Product, Requirements & Open-Source Reference

> **AUTHORITATIVE SINGLE REFERENCE.** This is the permanent registry for the comprehensive product requirements, architecture guardrails, product inspiration, open-source projects, licenses, integration decisions, acceptance rules, implementation mapping, reliability rules, and release gates used while evolving Report Advisor.
>
> **Last reviewed:** 2026-09-19
>
> This file supersedes scattered requirement/inspiration notes as the operational reference. New requirements, sources and implementation decisions are appended here rather than creating competing master lists.

## 1. Mission

Report Advisor is a new product. It may learn from proven products and open-source projects, but it must not become a copy of any vendor.

The target is Aghbari as a Business Decision Operating System: a unified, accurate, evidence-first system that turns business data and documents into verified truth, prioritized signals, governed decisions, controlled actions, measurable outcomes, and organizational learning. BI, document intelligence, forecasting, finance, inventory, customer/supplier intelligence, reports, ChatBI, alerts and AI are capabilities inside that operating loop - not the product identity by themselves.

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


### Domain extensions - modular, never the product identity
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

Never trade correctness for apparent progress percentage.\r\n\r\n## 34. Aghbari Product Identity - 2026-09-19

This section is permanent product memory and is the canonical strategic direction for all future development.

### Product category

Aghbari is not being built as:
- a pharmacy application;
- a generic ERP clone;
- a dashboard catalogue;
- a chatbot wrapper;
- an AI-generated reporting layer;
- a collection of disconnected CRUD pages.

Aghbari is a Business Decision Operating System.

Core operating loop:
`Data -> Truth -> Evidence -> Signal -> Decision -> Approval -> Action -> Outcome -> Learning -> Benchmark`

Every major feature must strengthen one or more links in this loop.

### Core product promise

The system should answer, with traceable evidence:
1. What is happening?
2. What is important now?
3. Why is it happening?
4. What evidence proves it?
5. What decision is available?
6. Who approved it?
7. What action was taken?
8. What happened afterward?
9. Did the decision create the expected value?
10. What should the organization learn and reuse?

Prefer proof of business value over feature-count growth.

### Strategic capability pillars

#### 1. Truth + Evidence Engine
Canonical truth:
`source -> formula -> period -> tenant -> as-of -> freshness -> evidence -> result`

First-class evidence capabilities:
- Evidence Passport;
- evidence references and lineage;
- confidence/truth state;
- explicit missing-evidence states;
- source and snapshot identity;
- deterministic metric definitions.

#### 2. Decision Operating System
Lifecycle:
`signal -> evidence -> decision -> approval -> work -> action receipt -> outcome -> learning`

Existing approval/work/action/outcome infrastructure must become one coherent customer experience. No AI response may bypass the governed action path.

#### 3. Money Recovery
Evidence-backed pressure areas:
- receivables and collections;
- inventory exposure;
- margin pressure;
- cash and liquidity;
- pricing leakage;
- avoidable commercial loss.

Never invent a recovery amount. Show evidence blockage when evidence is insufficient.

#### 4. Decision ROI
Eligible decisions should support:
- expected impact;
- actual measured impact;
- delta;
- return state;
- outcome timing;
- evidence sufficiency.

`AWAITING_OUTCOME` is valid. Actuals are never fabricated.

#### 5. Decision Coverage
Coverage should be visible across Sales, Receivables, Margin, Inventory, Customers, Products and Collections.

Coverage means canonical evidence exists to support a decision. Page existence is not coverage.

#### 6. Decision Playbooks
Important recurring signals should have guided and reversible playbooks.

Examples:
- collections: aging -> customer context -> approve -> act -> record collection outcome;
- inventory: movement/balance -> demand/alternatives -> approve reversible action -> measure;
- margin: canonical revenue/cost -> affected entities -> cause -> act -> measure.

Playbooks must reuse governed paths and must not create shadow write engines.

#### 7. Business Replay and Learning
Decision history is a first-class asset.
`signal -> evidence -> decision -> action -> outcome -> replay`

Replay compares expected versus actual results and creates reusable learning without unverified causal claims.

#### 8. Benchmark Network
Peer benchmarking requires sufficient, policy-compliant real cohort data.
Until the minimum sample is met:
`BENCHMARK = INSUFFICIENT_SAMPLE`
No synthetic benchmark is customer-facing truth.

#### 9. Connector Memory and Schema Drift Guard
Safely remember connector/source structure and detect:
- added fields;
- removed fields;
- type changes;
- stable schemas.

Required-field removal or incompatible type change is blocking. Additive safe change may enter review. Schema memory must never silently change canonical truth.

#### 10. Evidence Agent Protocol
A tenant-scoped read-only evidence interface is part of the product architecture.

Required:
- current tenant scope;
- authenticated user context;
- canonical dashboard snapshot;
- metric definitions;
- evidence passport;
- decision records;
- outcome records;
- structured truth and missing-evidence state;
- no service-role exposure;
- no write capability.

Current endpoint: `/api/evidence-context`. It remains read-only and fail-closed.

#### 11. Vertical Packs
Core is horizontal; vertical differentiation lives in intelligence and presentation.

Food/wholesale/distribution may be a demonstration pack, but Aghbari must not become pharmacy-specific or locked to one industry.

Vertical packs may contain:
- terminology;
- KPI presets;
- decision playbooks;
- report lenses;
- benchmark definitions;
- import profiles;
- demo datasets.

Canonical truth remains shared.

#### 12. Proposal and Job-to-Demo Compiler
Upwork is a sales channel, not product identity.

Target flow:
`job requirements -> capability mapping -> real route -> real evidence -> screenshot -> verified gaps -> demo -> proposal`

Only real capabilities may be claimed. Screenshots must map to reachable product states. Demo data must be synthetic or authorized. Gaps must be disclosed. No fabricated prior work or customer results.

#### 13. Commercial Proof
Value should be demonstrable within minutes:
- money view;
- evidence passport;
- decision case;
- expected versus actual outcome;
- executive story;
- route/deep-link;
- verifiable product state.

The sales demo should use the same architecture as the real product wherever possible.

## 35. Product Experience Hierarchy

Primary hierarchy:
`TODAY -> MONEY -> DECISIONS -> TRUST/EVIDENCE -> INTELLIGENCE -> OUTPUTS -> REFERENCE -> ADMINISTRATION`

Rules:
- important signals are investigation entry points;
- reports are decision outputs, not a catalogue;
- intelligence explains and prioritizes but does not own authoritative numbers;
- administration stays below customer-value surfaces;
- progressive disclosure beats dashboard overload;
- mobile and low-bandwidth are product requirements.

## 36. Commercial Moat Rules

The moat is the connected system of:
- governed truth;
- Evidence Passport;
- decision lifecycle;
- Money Recovery;
- Decision ROI;
- Decision Coverage;
- playbooks;
- Business Replay;
- schema drift protection;
- evidence-agent protocol;
- real cohort benchmarking;
- vertical packs;
- proof-driven demos.

The moat is the connected evidence-to-outcome system, not any single feature.

## 37. Explicit Non-Goals and Rejected Direction

Outside the product direction unless explicitly reauthorized:
- pharmacy-specific product identity;
- copied vendor dashboards, layouts, branding or proprietary assets;
- decorative concept screens without real product flows;
- screenshot-only features with no reachable implementation;
- synthetic business evidence presented as live truth;
- invented benchmark/sample data;
- AI-generated authoritative financial numbers;
- direct AI-to-database mutation outside the approved action path;
- mandatory paid AI providers;
- mandatory local model installation for customers;
- separate competing truth engines;
- duplicate runners, RPCs or write paths when an existing path is sufficient;
- feature growth that does not improve customer value, evidence, actionability or commercial proof.

## 38. Strategic Layer Status

Baseline: integration SHA `323f9e78f1e80b06a9b98ce9496c7bad20da7bb4`.

Implemented in code or architecture:
- Aghbari moat panel;
- Evidence Passport;
- Decision ROI state model;
- Decision Coverage;
- Money Recovery derivation;
- playbook guidance;
- Schema Drift Guard;
- benchmark readiness logic;
- tenant-scoped Evidence Agent endpoint;
- agent boundary contract;
- Proposal Demo differentiation surface;
- Decision Experience evidence and ROI surfaces;
- dashboard Money Recovery and Decision Coverage surfaces.

Still requiring deeper product/runtime completion:
- live decision -> approval -> work -> action receipt -> outcome loop;
- measured expected versus actual ROI from real outcomes;
- Business Replay and reusable learning;
- real cohort benchmark ingestion and governance;
- connector memory persistence and production drift lifecycle;
- deeper vertical packs;
- full Job-to-Demo compiler;
- complete customer-facing action receipts and outcome capture.

This is implementation status, not certification. Production acceptance still requires the Definition of Done and exact-head evidence gates.

## 39. Product Decision Rule

For every proposed capability:
`customer problem -> verified evidence -> decision/action value -> implementation path -> exact tests -> measurable outcome`

Reject proposals whose main benefit is visual novelty, trend imitation or feature-count inflation.

Prefer capabilities that:
- reduce time to trustworthy decision;
- recover or defend money;
- reduce operational risk;
- make evidence auditable;
- close the outcome loop;
- create reusable organizational learning;
- strengthen commercial demonstration.

## 40. Memory Governance - Single Live Product Memory

This file is the single living product-memory authority.

When requirements evolve:
1. update this file;
2. preserve compatible historical requirements;
3. explicitly supersede conflicts;
4. record rejected directions that prevent drift;
5. link implementation and test evidence;
6. never create a second product-memory master.

Operational execution protocols may remain separate, but they are subordinate to this product memory for product direction.

## 41. Reference Hygiene

Reference material is allowed only when it improves a measurable project capability.

- `docs/PRODUCT_INSPIRATION_MATRIX.md` is retired as redundant with this master reference.
- `docs/INSPIRATION_IMPLEMENTATION_AUDIT.md` remains historical implementation evidence, not an active requirements master.
- Visual inspiration is a principle source, not a design source. Adopt interaction and architecture principles; never copy layouts, assets, branding or visual identity.
- Repository assets should remain minimal and purposeful. Do not store decorative reference images unless required by the shipped product.

## 42. Owner Split - Product vs Operations

- Owner 1: product architecture, UX, intelligence, commercial experience, decision surfaces, vertical packs, proposal/demo capabilities.
- Owner 2: runtime, DB, security, tenant isolation, imports, PDF/OCR runtime, worker/report execution, storage, realtime, backup/restore, CI/CD, deployment, certification and release.
- Both owners share this same product memory and exact-head evidence rules.
- Neither owner may create a conflicting product identity or a second requirements master.
\r\n
## 43. Strategic Intake, Commercial Layer and Lifecycle State — 2026-09-19

deterministic business calculations are authoritative for financial and operational truth; AI may assist interpretation but never replaces governed calculation or evidence.
Free/open-source architecture follows the free-first/open-source-first policy for eligible tooling, adapters and infrastructure without weakening security, evidence or commercial readiness.

The strategic product source reviewed on 2026-09-19 is development input only. It does not create a second product memory. `docs/MASTER_PRODUCT_REFERENCE.md` remains the single live product-memory authority.

### Strategic intake classification

#### KEEP
- Aghbari = Business Decision Operating System.
- `Data -> Truth -> Evidence -> Signal -> Decision -> Approval -> Action -> Outcome -> Learning -> Benchmark`.
- Evidence Passport and explicit evidence sufficiency states.
- Decision Operating System and governed decision lifecycle.
- Money Recovery.
- Decision ROI.
- Decision Coverage.
- Decision Playbooks.
- Business Replay / organizational learning.
- Benchmark Network with `INSUFFICIENT_SAMPLE` until policy-compliant real cohort evidence exists.
- Connector Memory + Schema Drift Guard.
- Read-only Evidence Agent boundary.
- Vertical Packs without locking the product to one sector.
- Commercial Proof.
- Job-to-Demo / Proposal Compiler.
- Product Experience hierarchy: `TODAY -> MONEY -> DECISIONS -> TRUST/EVIDENCE -> INTELLIGENCE -> OUTPUTS -> REFERENCE -> ADMINISTRATION`.
- The hard rejection rules preventing pharmacy-only identity, CRUD-only product thinking, dashboard catalogue behavior, chatbot-wrapper behavior, fake evidence, duplicate engines and duplicate write paths.

#### EVOLVE
- The Commercial Engine is part of the product's distribution architecture, not the product identity.
- Supported distribution sequence: Upwork, LinkedIn, Contra, Fiverr, Toptal later when operationally justified, and Direct B2B / agencies.
- Commercial compiler flow: `Requirement -> Capability -> Evidence -> Real Route -> Demo -> Verified Gaps -> Proposal`.
- Delivery loop: `Product -> Demo -> Evidence -> Lead/Job Fit -> Proposal -> Contract -> Delivery -> Outcome -> Case Study`.
- Commercial surfaces must consume the same canonical product runtime, evidence and real routes used by customers.
- Proposal generation must disclose unavailable capabilities, unverified gaps and missing evidence instead of filling them with synthetic claims.

#### SUPERSEDE
- Any separate product-memory, master-requirements or competing strategic-memory document is superseded by this file for live product direction.
- The strategic source reviewed on 2026-09-19 remains historical/development source material only and does not become an operational master.
- Older product direction that conflicts with the Business Decision Operating System identity is superseded only where this file explicitly states the new canonical direction; compatible requirements remain retained.

#### REJECT
- Pharmacy-only product identity.
- Generic ERP clone positioning.
- Dashboard catalogue as the main UX model.
- Chatbot wrapper as the main product.
- Decorative screens without reachable implementation.
- Fake/synthetic business evidence presented as live truth.
- Synthetic benchmarks represented as customer-facing truth.
- AI-generated authoritative financial numbers.
- Direct AI-to-database mutation outside governed approval/action paths.
- Separate Truth/Decision/Write/Runner/RPC engines when an existing canonical path is sufficient.
- Commercial-channel features that distort or fork the core product identity.

### Product lifecycle states

The following states are intentionally separate and must never be collapsed into one completion percentage:

| State | Meaning | Current posture |
|---|---|---|
| Strategic Intent | Requirement is part of the canonical product direction | Active across sections 34–43 |
| Implemented | Code or architecture exists | Core moat, evidence, decision and commercial-demo surfaces exist in part |
| Runtime-Complete | Exact tested head executes the capability end-to-end in its real runtime | Must be asserted only against the exact current SHA; prior SHA evidence does not transfer automatically |
| Evidence-Complete | Exact-SHA evidence proves runtime + DB/security/E2E requirements applicable to the capability | Current certification remains fail-closed until exact-head gates pass |
| Commercial-Ready | Capability is real, demonstrable, evidence-backed and safe to claim in customer/job proposals | Product is progressing; full Job-to-Demo compiler and outcome-backed case-study loop remain incomplete |

### Exact-head rule for strategic status

A capability may remain strategically KEEP/EVOLVE while its implementation state is `PARTIAL` or `PENDING`. Strategic inclusion is not runtime acceptance. Exact SHA, environment and contract boundaries remain authoritative for claims of completion.

### Commercial identity rule

Aghbari is the product. Upwork, LinkedIn, Contra, Fiverr, Toptal and Direct B2B/agencies are distribution channels. No channel-specific surface may create a competing product identity, separate truth source, fake case study, copied customer proof, or duplicate execution path.

### Memory change protocol

Every future strategic evolution must:
1. preserve Git history before substantive rewrite;
2. classify the change as `KEEP`, `EVOLVE`, `SUPERSEDE` or `REJECT`;
3. update this file rather than creating another product master;
4. link code/test/runtime/evidence state where available;
5. keep certification fail-closed when evidence does not match the exact head.
