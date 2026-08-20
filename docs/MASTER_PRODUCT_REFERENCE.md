# Report Advisor — Master Product, Requirements & Open-Source Reference

> **AUTHORITATIVE SINGLE REFERENCE.** This is the permanent registry for the comprehensive product requirements, architecture guardrails, product inspiration, open-source projects, licenses, integration decisions, acceptance rules, implementation mapping, reliability rules, and release gates used while evolving Report Advisor.
>
> **Last reviewed:** 2026-08-21
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
