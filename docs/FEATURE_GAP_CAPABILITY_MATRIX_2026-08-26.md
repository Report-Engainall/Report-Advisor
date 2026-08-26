# Report Advisor — Future Capability / Gap Matrix

> Research-only planning artifact. No feature implementation is authorized by this document. Core Truth, Runtime Evidence, and Production Certification remain higher priority.

## Status vocabulary

- `CORE` — required for correctness/reliability of the current product core.
- `ENTERPRISE` — valuable for mature multi-tenant/business deployments after core certification.
- `FUTURE` — candidate capability for a later feature wave.
- `GUARDRAIL` — pattern may be learned from, but implementation must remain independently designed and must not copy proprietary code/UI.

| Current Report-Advisor capability | Capability / gap | Commercial value | Proposed integration point | Dependency | Priority | Classification |
|---|---|---|---|---|---|---|
| Canonical intelligence / governed metrics | Semantic metric catalog, reusable definitions and lineage | Prevents KPI drift and increases trust | canonical financial/intelligence layer | Truth contracts + runtime evidence | P0 | CORE |
| Evidence / decision ledger | End-to-end evidence lineage from source to decision | Auditability and management confidence | evidence/lineage services | deterministic calculations | P0 | CORE |
| Truth states | Verified / Qualified / Insufficient Data / Blocked states across analytical surfaces | Prevents false precision | analytics result model + UI | Truth matrix | P0 | CORE |
| Executive cockpit | Morning brief / money view / evidence-to-action cockpit | Faster management decisions | Executive Decision / dashboard | runtime E2E | P1 | ENTERPRISE |
| Decision queue | Prioritized actions with snooze/dismiss/investigate/execute lifecycle | Converts analytics into action | decision/action ledger | evidence + authorization | P1 | ENTERPRISE |
| Cross-filtering / drill-down | Deterministic filter propagation across charts/tables/reports | Faster investigation | BI/analytics UI | semantic filter contract | P1 | ENTERPRISE |
| Saved views / filters / grouping | Persistent user/tenant-safe analytical views | Repeatable workflows | analytics state/persistence | tenant isolation | P1 | ENTERPRISE |
| Command Palette / keyboard-first | Keyboard navigation and command execution | Power-user productivity | global UI command layer | route/action contracts | P2 | FUTURE |
| Spreadsheet-grade exploration | Table exploration, grouping, pivot-like interactions | Familiar analysis for business users | BI/data exploration layer | large-dataset performance | P2 | FUTURE |
| Scenario / what-if analysis | Deterministic scenarios with evidence and inaction impact | Supports planning decisions | decision/scenario engine | canonical metrics + scenario model | P2 | FUTURE |
| Forecasting / backtesting | Forecasts with MAE/RMSE/MAPE, minimum-data gates | Planning and demand visibility | predictive intelligence layer | clean history + truth states | P2 | FUTURE |
| Connected knowledge workspace | Link reports, datasets, definitions, decisions and evidence | Reduces context switching | knowledge/evidence workspace | lineage IDs | P2 | FUTURE |
| Document layout/table extraction | Robust page/table classification and evidence fusion | Better PDF/document ingestion | document intelligence layer | deterministic extraction | P2 | FUTURE |
| OCR routing | Optional OCR with uncertainty/review workflow | Handles scanned documents | OCR adapter boundary | extraction confidence gates | P2 | FUTURE |
| Multi-format ingestion | XLSX/CSV/PDF/text ingestion with transactional routing | Expands usable data sources | ingestion engine | import transaction + rollback | CORE | CORE |
| Inventory/procurement intelligence | Liquidity, demand, reorder and procurement recommendations | Reduces stockouts/overstock | inventory/procurement domain | verified inventory/cost data | P1 | ENTERPRISE |
| Receivables/payables/cash intelligence | Aging, collection, payment and liquidity decisioning | Improves working capital | finance/cash intelligence | financial truth contracts | P1 | ENTERPRISE |
| Supplier intelligence | Delivery, price and dependency scoring | Purchasing leverage and risk control | supplier intelligence | purchase history | P2 | ENTERPRISE |
| Customer intelligence | RFM, inactivity, churn and value segmentation | Retention and sales prioritization | customer intelligence | sales/customer truth | P2 | ENTERPRISE |
| Anomaly detection | Evidence-backed unusual-activity detection | Early issue discovery | intelligence/anomaly engine | quality + minimum-data gates | P2 | ENTERPRISE |
| Natural-language analytics | Ask → inspect → deterministic result → approved action | Accessibility for non-technical users | ChatBI / query router | deterministic query execution + AI governance | P2 | FUTURE |
| Research/report synthesis | Multi-source planning and evidence synthesis | Faster management research | research/report workflow | evidence provenance | P3 | FUTURE |
| Observability / health center | SLOs, alerts, dependency health and diagnostics | Faster incident response | system health / telemetry | production runtime | P1 | ENTERPRISE |
| Low-bandwidth progressive UX | Network-throttled workflows and progressive disclosure | Important for constrained networks | frontend loading/cache strategy | performance evidence | P1 | CORE |
| Open-source analytical engines | Optional adapters for BI/document/data engines | Capability breadth without mandatory vendor lock-in | adapter registry | license/security review | P3 | GUARDRAIL |

## Source synthesis

The matrix is synthesized from the repository's authoritative product reference and inspiration audit. The reference explicitly identifies semantic/governed metrics, evidence/lineage, truth states, deterministic calculations, financial safety, BI exploration, forecasting/backtesting, decision intelligence, document intelligence, operational intelligence, observability, low-bandwidth UX, and optional open-source adapters as product patterns/capabilities. The inspiration audit separately records which patterns are integrated, foundation, gaps, or guardrails.

## Explicit non-implementation rule

This file does not authorize implementation. No new framework, vendor dependency, UI expansion, AI feature, or competitive capability should be added while Gross Profit Truth remains open. A future feature wave must separately pass:

```text
DESIGN -> IMPLEMENT -> REGRESSION -> EXACT-HEAD CI -> RUNTIME -> EVIDENCE
```
