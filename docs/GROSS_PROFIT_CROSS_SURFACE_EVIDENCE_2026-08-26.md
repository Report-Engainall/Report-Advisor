# Gross Profit Cross-Surface Evidence — 2026-08-26

## Scope

Current proof work is restricted to the Gross Profit Cross-Surface Truth closure. Evidence must be attributed only to the current branch/HEAD that produced it.

## Independent business-truth reference

The reference is calculated directly from the deterministic fixture and does not import, call, or project any production financial consumer.

- Revenue: `SUM(sale_items.line_total)`
- Cost of Sales: `SUM(sale_items.cost_price * sale_items.quantity)` when every required cost is present.
- Gross Profit: `Revenue - Cost of Sales` only when cost data is complete.
- Missing/NULL required cost: `INSUFFICIENT_DATA`; never implicit zero.

Expected fixture results:

| Scope | Revenue | Cost | Gross Profit | Quantity | Status |
|---|---:|---:|---:|---:|---|
| Tenant A — complete-cost subset | 630 | 380 | 250 | 9 | CALCULATED |
| Tenant A — complete dataset with missing cost | 705 | NULL | NULL | 10 | INSUFFICIENT_DATA |
| Tenant B | 900 | 540 | 360 | 9 | CALCULATED |

Date semantics are inclusive for the fixture's start and end boundaries; an outside-range record is excluded.

## Production consumer sweep

| Surface | Production path inspected | Current classification |
|---|---|---|
| Dashboard | `DashboardPage` → `fetchCanonicalDashboardKPIs`, `fetchCanonicalMonthlyTrend`, `fetchCanonicalTopCustomers` | CANONICAL consumer path |
| Reports | `ReportsPage` → canonical KPI/trend/top-customer consumers; report export uses `fetchAllSalesInvoicesForReportExport` | CANONICAL for migrated paths; numeric proof NOT PROVEN |
| Executive Decision | `ExecutiveCommandCenterPage` → `fetchCanonicalDashboardKPIs` | CANONICAL consumer path |
| Analytics | current Analytics center exposes RFM/ABC/Aging; no Gross Profit consumer was identified | NOT APPLICABLE / NO-GP-CONSUMER; equivalence NOT PROVEN |
| BI | no independently executable Gross Profit consumer was identified in the inspected application surface | UNKNOWN / NOT PROVEN |
| Export | Sales export invokes `fetchAllSalesInvoicesForReportExport`; profitability export uses category data | CANONICAL source for invoice export; complete numeric GP equivalence NOT PROVEN |

The inspected Dashboard and Executive Decision code calls the canonical financial queries directly. The Reports page imports the canonical KPI/trend/top-customer functions and the full-dataset sales export function. These facts establish wiring, not cross-surface numeric proof. fileciteturn374file0 fileciteturn378file0 fileciteturn371file0

## Critical finding: previous fixture was insufficient

The prior fixture projected `truth(completeA)` onto every surface. That was a **reference self-comparison**, not execution of the production consumers. It could pass even if a real surface diverged.

That implementation has been removed from the proof path. The current `scripts/gross-profit-cross-surface-fixture.mjs` requires `GROSS_PROFIT_SURFACE_RESULTS` captured by a real surface execution harness and fails closed when the artifact is absent. It does not synthesize surface results from the canonical reference.

## Required real-surface artifact

The strict fixture requires a JSON artifact containing independent results for both authenticated tenant contexts:

```text
Tenant A:
  Dashboard, Reports, Analytics, BI, Decision, Export
Tenant B:
  Dashboard, Reports, Analytics, BI, Decision, Export
```

Each surface result must contain:

```text
revenue
cost
grossProfit
quantity
status
```

Export additionally requires:

```text
rowCount = 25
rowCount > presentation page size (20)
```

The artifact must originate from actual production surface execution. A result copied from the canonical query is not acceptable evidence.

## Current proof state

- Independent fixture truth: PROVEN.
- Canonical financial formula: PROVEN at query level.
- Consumer wiring: PROVEN for Dashboard, Reports migrated paths, and Executive Decision.
- NULL/missing-cost reference semantics: REGRESSION-ENFORCED.
- Actual surface-level numeric execution: **NOT PROVEN**.
- Tenant A/B runtime isolation: **NOT PROVEN**.
- Export 25-vs-20 runtime completeness: **NOT PROVEN**.
- Analytics/BI Gross Profit equivalence: **NOT PROVEN** because independently executable GP consumers were not established.
- Gross Profit Cross-Surface Truth: **OPEN / NOT PROVEN**.
- Runtime truth: NOT PROVEN.
- Production certification: NOT PROVEN.

## Guardrail

No `PASS`, `CROSS-SURFACE EQUIVALENCE`, or `GROSS PROFIT TRUTH-PROVEN` claim may be made from the independent fixture alone. Closure requires:

`independent reference → real production consumer execution → numeric comparison → tenant/date/missing-data checks → export completeness → regression → exact-head CI → evidence artifact`.
