# Report Advisor — Master Product, Requirements & Open-Source Reference

> **AUTHORITATIVE SINGLE REFERENCE.** This is the permanent registry for the comprehensive product requirements, architecture guardrails, product inspiration, open-source projects, licenses, integration decisions, acceptance rules, and implementation mapping used while evolving Report Advisor.
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

## 4. Definition of Done
A requirement is only FULLY IMPLEMENTED when its applicable UI, backend, database, security, audit, event/queue behavior, error/loading/offline state, tests, E2E/regression coverage, performance evidence and documentation are present.

## 5. Permanent product-inspiration registry

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

## 6. Open-source source repository registry

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

## 7. Product capability synthesis map
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

## 8. Selection rule
For every new idea, evaluate:
`value = accuracy_gain + capability_gain + UX_gain + performance_gain`
against:
`cost = complexity + runtime_weight + maintenance + licensing_risk + security_risk + vendor_lock_in`
Only integrate when expected net value is positive and no project invariant is violated.

## 9. Hard rejection rules
Never integrate an external idea if it decreases numerical accuracy, introduces hallucinated business facts, creates mandatory paid AI usage, makes Ollama mandatory for customers, requires large local model downloads, forces a heavy runtime when a lighter native implementation is sufficient, weakens tenant/RLS isolation, bypasses evidence/lineage, performs financial calculations in an LLM, silently overwrites imported data with blanks, replaces business keys with internal IDs, invents PDF/OCR rows, copies proprietary code/assets/branding, introduces an unapproved restrictive license, or duplicates a stronger existing Report Advisor implementation without measurable benefit.

## 10. Integration tiers
- **Tier A — Native:** TypeScript/Supabase/browser APIs for small deterministic capabilities.
- **Tier B — Adapter:** external open-source engine behind a replaceable adapter; core remains functional if unavailable.
- **Tier C — Optional service:** heavy OCR/PDF/ML/distributed engines; no mandatory local installation.
- **Tier D — Reference only:** use interaction/architecture ideas without shipping external code.

## 11. Permanent architecture principles
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

## 12. Performance and reliability guardrails
- Parse once; do not repeatedly parse the same source.
- Chunk large imports and long-running computations.
- Use queues/timeouts for heavy operations.
- Cache deterministic intermediate results where safe.
- Keep UI responsive during streaming and computation.
- Prefer lightweight browser execution for small workloads.
- Escalate to worker/server engines only when justified by data size or complexity.
- Avoid shipping large models to normal customers.
- Preserve offline resilience and low-bandwidth behavior.
- Every heavy operation exposes progress, failure and retry state.

## 13. Security, privacy and governance guardrails
- Tenant/company scope is mandatory on tenant-scoped operations.
- RLS remains authoritative.
- AI output is untrusted until validated.
- Prompt injection must never bypass data permissions or business rules.
- Secrets never enter client bundles or prompts.
- External engines are isolated behind explicit adapters.
- Financial actions require explicit approved commands and evidence.
- Audit trail records important imports, decisions, overrides and actions.
- Onyx Pro remains isolated as an optional dataset/sync boundary.

## 14. UX/product guardrails
- Arabic RTL first, with correct handling of English identifiers and numbers.
- Mobile-first and low-bandwidth friendly.
- Fast navigation with Command Palette.
- Executive view for high-level decisions; detailed analytical views remain one step away.
- Clear status language: VERIFIED / PARTIAL / INSUFFICIENT_DATA / ERROR / STALE.
- Confidence and freshness visible where they materially affect decisions.
- No alert spam: prioritize decisions and opportunities.
- Progressive disclosure: simple default, deep analytical detail on demand.
- Tables remain first-class for business users.
- Charts explain a decision; they do not exist merely for decoration.

## 15. Current Report Advisor implementation mapping
- Unified import → existing unified import engine.
- Semantic metrics → existing semantic metric layer.
- Data quality → existing quality gates.
- Evidence/lineage → existing evidence and lineage contracts.
- Inventory → canonical intelligence + stochastic inventory.
- Forecasting → forecast + backtest + confidence.
- Finance → DSO/DIO/DPO/CCC + liquidity + collection/payment decisions.
- Document AI → document intelligence gateway + OCR/PDF adapters.
- ChatBI → deterministic query/execution path + evidence.
- Product UX → Command Palette + Executive Cockpit + decision queue.
- Free/open-source stack → adapter registry and licensing isolation.
- Comprehensive requirements → this document is the canonical consolidated reference.

## 16. Reference consolidation protocol

Previous detailed requirement/inspiration documents may remain as historical/audit artifacts, but they are **not parallel masters**.

When maintaining the project:
1. Read this file first.
2. Add new requirements and sources here.
3. Fold useful ideas from the comprehensive specification here.
4. Record open-source repositories and licensing here.
5. Record integration decisions here.
6. Add acceptance tests when capabilities enter production.
7. Update implementation mapping here.
8. Only create separate technical documents for implementation detail, not another competing requirements list.
9. Periodically reconcile historical documents into this file so the master remains complete.

## 17. Master status

This document is now the **single operational reference** for Report Advisor product direction, comprehensive requirements, product inspiration, open-source technology selection, safety/performance constraints and implementation mapping.

No future development decision should depend on a scattered conversation list when the decision can be recorded here.
