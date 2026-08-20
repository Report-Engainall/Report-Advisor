# Report Advisor — Product Inspiration Matrix

This is a synthesis of product patterns observed across major BI, analytics, ERP, AI analytics, document intelligence and productivity products. It is intentionally a feature/interaction study, not a copy of proprietary code, branding, assets or screens.

## Sources reviewed

Power BI, Tableau, Looker, Qlik Sense, ThoughtSpot, Metabase, Apache Superset, Sigma, Preset, Grafana, Zoho Analytics, Domo, Sisense, Omni, Hex, Julius AI, Akkio, Databricks AI/BI, Pecan AI, Streamlit, Odoo, ERPNext, QuickBooks, Xero, Zoho Books, NetSuite, Cin7, Katana, Linear, Notion, Stripe, Vercel, Docling, PaddleOCR, Unstructured, Open WebUI, Dify, Flowise, Langflow.

## Patterns worth adopting

### 1. Governed intelligence
- One canonical metric definition and one source of truth.
- Evidence attached to every important answer.
- Clear distinction between calculated, estimated and unavailable values.
- Data lineage visible without forcing users into technical screens.

Inspired by the semantic-model/governance emphasis of Looker and modern AI-BI evaluation criteria. The key principle is that a beautiful answer is not useful if its meaning is ambiguous. 

### 2. Ask → inspect → act
- Natural-language question entry.
- Result rendered as KPI/table/chart when appropriate.
- Show the calculation/evidence path.
- Offer a next action only when a deterministic rule supports it.

Inspired by ThoughtSpot, Metabase, Julius, Hex and modern AI analyst workflows.

### 3. Decision queue instead of alert spam
- Rank by business impact, urgency and confidence.
- Group related warnings.
- Allow snooze, dismiss, investigate and execute.
- Keep the evidence beside the recommendation.

Inspired by Linear Inbox/command workflows and modern BI alerting patterns.

### 4. Command palette
- Ctrl/Cmd+K.
- Search pages, actions and reports.
- Context-aware commands.
- Keyboard-first navigation for power users.

Linear demonstrates how a command menu can become a primary navigation and action surface rather than a decorative search box.

### 5. Saved views
- Save filters and grouping.
- Personal/default workspace views.
- Switch between list/table/chart modes.
- Reset to canonical defaults.

Inspired by Linear display options and enterprise BI self-service exploration.

### 6. Executive cockpit
- Small number of high-signal KPIs.
- Trend direction and variance.
- Immediate risks and opportunities.
- Cash/inventory/customer actions in one place.

Inspired by Power BI/Tableau/Looker executive dashboard patterns, but adapted to Report Advisor's deterministic decision model.

### 7. Spreadsheet-grade exploration without spreadsheet fragility
- Fast table views.
- Column visibility.
- Sorting/filtering/grouping.
- Export only when policy allows it.
- Preserve semantic definitions behind the table.

Inspired by Sigma and self-service BI tools.

### 8. Multi-format document intelligence
- Detect document type before extraction.
- Native text/table extraction before OCR.
- OCR only where needed.
- Preserve page/table/cell evidence.
- Send uncertain extraction to review rather than inventing values.

Inspired by Docling, PaddleOCR and Unstructured patterns.

### 9. Knowledge workspace
- Reports, datasets, definitions, decisions and evidence connected.
- Search across business knowledge.
- Reuse previous analyses as context.

Inspired by Notion's connected workspace and modern AI analytics context systems.

### 10. Progressive disclosure
- Simple default view.
- Advanced controls one layer deeper.
- Technical diagnostics available without cluttering executive screens.

### 11. Responsive, fast, low-bandwidth UX
- Skeleton states instead of layout jumps.
- Lazy-loaded heavy pages.
- Parse once, reuse many times.
- Cache safe deterministic results.
- Avoid sending entire datasets to AI.

### 12. Financial safety rails
- Protected cash reserve.
- Payment recommendations constrained by liquidity.
- Receivable collection ranking.
- Separate bank/cash/receivable/payable concepts.

### 13. Forecast transparency
- Minimum-data gate.
- Forecast confidence.
- Backtesting metrics.
- Explain why a forecast is unavailable.
- Never convert insufficient data into a confident prediction.

## Design language to synthesize

- Calm neutral canvas with high-contrast typography.
- One restrained accent for primary actions.
- Semantic status colors only for meaning: success, warning, danger, neutral.
- Compact data-dense cards with generous spacing between groups.
- Consistent 12–16px radii, subtle borders and restrained shadows.
- RTL-first Arabic layout while preserving LTR numeric/code/data contexts.
- Charts should emphasize decisions, not decoration.
- Tables should support scan → filter → inspect → act.

## What we deliberately do NOT copy

- Proprietary source code.
- Vendor logos/brand identity.
- Proprietary illustrations or screenshot assets.
- Exact screen layouts.
- Closed vendor APIs as required dependencies.
- Paid AI services as mandatory infrastructure.

The result must be a new Report Advisor experience built from generalized, proven interaction patterns and our own business-intelligence architecture.
