# Report Advisor — Master Product & Open-Source Reference Registry

> **Authoritative reference.** This is the permanent registry for the ideas, product patterns, open-source projects, licenses, source repositories, integration decisions, and rejection rules used while evolving Report Advisor.
>
> **Last reviewed:** 2026-08-21
>
> This file must be consulted before introducing a major product capability, external engine, AI provider, document parser, analytics workflow, or substantial UX pattern. It is intentionally cumulative: new sources are appended, not forgotten.

## 1. Mission

Report Advisor is a new product. It may learn from proven products and open-source projects, but it must not become a copy of any vendor.

The target is a unified, accurate, fast, flexible, predictive, advisory and financially safe business-intelligence platform with:

- deterministic business calculations;
- semantic metrics and governed definitions;
- evidence and lineage;
- multi-format document intelligence;
- operational intelligence;
- inventory and procurement intelligence;
- customer and supplier intelligence;
- financial/accounting intelligence;
- forecasting and backtesting;
- decision intelligence and what-if analysis;
- ChatBI;
- report generation;
- proactive alerts and business health;
- low-bandwidth responsive UX;
- free-first/open-source-first architecture;
- no mandatory local AI installation;
- no mandatory paid AI provider.

## 2. Permanent product-inspiration registry

### BI / Analytics

| Source | Patterns to learn from | Adopt in Report Advisor | Boundary |
|---|---|---|---|
| Microsoft Power BI | executive dashboards, semantic models, drill-down, cross-filtering | YES, synthesized | no proprietary code/UI |
| Tableau | visual exploration, analytical storytelling, interaction | YES | no copied visual identity |
| Looker | governed metrics, semantic layer, reusable definitions | YES / HIGH PRIORITY | canonical definitions remain ours |
| Qlik Sense | associative exploration, selections, discovery | SELECTIVE | keep deterministic data model |
| ThoughtSpot | natural-language analytics, ask→inspect→act | YES | LLM never computes facts |
| Metabase | self-service questions, query builder, drill-through | YES | borrow patterns, not code |
| Apache Superset | SQL exploration, dashboards, filters, alerts | YES | no embedding whole platform initially |
| Sigma | spreadsheet-like exploration, table interaction | YES | preserve semantic governance |
| Grafana | time-series, alert states, observability | SELECTIVE | operational/system monitoring focus |
| Lightdash | governed dimensions/measures, semantic consistency | SELECTIVE | verify component licenses |
| Domo / Sisense / Zoho Analytics / Omni | packaged executive analytics, embedded analytics, reusable dashboards | SELECTIVE | feature synthesis only |

### AI Analytics / Research

| Source | Patterns to learn from | Decision |
|---|---|---|
| Julius AI | conversational analysis and data exploration | YES, deterministic execution layer required |
| Hex | notebook/analysis reuse, collaborative analytical context | YES |
| Akkio / Pecan AI | predictive workflows and accessible forecasting | SELECTIVE; minimum-data gates mandatory |
| Databricks AI/BI | governed AI analytics, semantic context, enterprise workflows | YES conceptually; no platform dependency |
| STORM / Local Deep Researcher patterns | planning, multi-source research, evidence synthesis | YES for research/report workflows |

### ERP / Accounting / Operations

| Source | Patterns |
|---|---|
| Odoo | modular ERP workflows and connected business operations |
| ERPNext | open ERP/accounting/inventory workflow ideas |
| QuickBooks / Xero / Zoho Books | accounting concepts, reconciliation, receivables/payables, cash views |
| NetSuite | integrated finance/operations model |
| Cin7 / Katana | inventory, purchasing, stock movement and production-oriented workflows |

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

## 3. Open-source source repository registry

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

## 4. Selection rule

For every new idea, calculate conceptually:

`value = accuracy_gain + capability_gain + UX_gain + performance_gain`

against:

`cost = complexity + runtime_weight + maintenance + licensing_risk + security_risk + vendor_lock_in`

Only integrate when the expected net value is positive and it does not violate a project invariant.

## 5. Hard rejection rules

Never integrate an external idea if it:

- decreases numerical accuracy;
- introduces hallucinated business facts;
- creates mandatory paid AI usage;
- makes Ollama mandatory for customers;
- requires large local model downloads for normal users;
- forces a heavy runtime when a lighter native implementation is sufficient;
- weakens tenant/RLS isolation;
- bypasses evidence or lineage;
- performs financial calculations in an LLM;
- silently overwrites imported data with blank values;
- replaces business keys with internal IDs for matching;
- invents PDF/OCR rows when extraction is uncertain;
- copies proprietary code/assets/branding;
- introduces a restrictive license into the core product without explicit legal approval;
- duplicates a stronger existing Report Advisor implementation without measurable benefit.

## 6. Integration tiers

### Tier A — Native implementation

Use TypeScript/Supabase/browser APIs when the capability is small, deterministic and faster without an external engine.

### Tier B — Adapter

Use an external open-source engine behind a replaceable adapter. The product remains functional when the adapter is unavailable.

### Tier C — Optional service

For heavy engines such as large-scale OCR, advanced PDF parsing, ML training or distributed analytics. The customer-facing application must not require local installation.

### Tier D — Reference only

Use the product's interaction/architecture ideas but do not ship its code.

## 7. Permanent architecture principles

1. Semantic layer first.
2. Evidence-first AI.
3. Deterministic calculations.
4. Progressive compute: browser → worker/DuckDB → heavier server engine → distributed engine only when justified.
5. Adapter architecture.
6. Local/private processing when useful, but never mandatory local installation.
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
17. Accessibility and keyboard-first power workflows.
18. No AI-generated numeric facts without verified source data.

## 8. Current Report Advisor implementation mapping

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

## 9. Update protocol

When a new source or website is reviewed:

1. Add it to this registry.
2. Record its useful patterns.
3. Record its source repository when open-source.
4. Record the license or licensing uncertainty.
5. Decide: Native / Adapter / Optional Service / Reference Only / Reject.
6. Add an acceptance test if the capability enters production.
7. Update the Product Inspiration Matrix if the idea is a major UX/product pattern.
8. Never rely on conversation memory alone; this file is the durable reference.

## 10. Current status

This registry supersedes scattered notes as the durable reference for product inspiration and open-source technology selection. The implementation team should consult it continuously and extend it rather than starting a new disconnected list.
