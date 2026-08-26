# Gross Profit Cross-Surface Evidence — 2026-08-26

## Scope

Current proof work is restricted to Gross Profit Cross-Surface Truth closure. Evidence must be attributed only to the current branch/HEAD that produced it. No previous SHA or merge SHA is certification for a later HEAD.

## Current branch HEAD

Documentation updates in this evidence delta now produce a new branch HEAD. The latest commit SHA is `abd53668bf2ba61efb5efbd16daa665f2944270f`; it has no exact-head CI certification yet.

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

## Production consumer classification

| Surface | Consumer status | Evidence state |
|---|---|---|
| Dashboard | GP consumer exists; canonical KPI/trend/top-customer path | RUNTIME REQUIRED / NOT PROVEN |
| Reports | GP consumers exist; migrated canonical paths | RUNTIME REQUIRED / NOT PROVEN |
| Executive Decision | GP consumer exists; canonical KPI path | RUNTIME REQUIRED / NOT PROVEN |
| Export | GP-relevant report export path exists and is full-dataset at source level | RUNTIME REQUIRED / NOT PROVEN |
| Analytics | No independently executable GP consumer identified in inspected application surface | NO GP CONSUMER FOUND; NOT PASS |
| BI | No independently executable GP consumer identified in inspected application surface | NO GP CONSUMER FOUND; NOT PASS |

## Critical fixture rule

The cross-surface fixture must never use `surface -> canonicalFinancialQueries -> expected`. The expected values are independent fixture truth; actual surface values must come from a real authenticated execution artifact.

## Authenticated runtime harness investigation

An existing reusable browser/authenticated surface harness was investigated on the current branch. No existing Playwright, Puppeteer, Cypress, browser storage-state, or authenticated browser-spec harness was identified. Existing report-execution E2E infrastructure is a static contract gate and does not execute an authenticated browser session.

Existing runtime/worker infrastructure also does not provide the required authenticated execution of Dashboard, Reports, Executive Decision and Export followed by capture of numeric surface results.

### Runtime blocker

`RUNTIME BLOCKED — AUTHENTICATED SURFACE HARNESS ABSENT`

This is an evidence/infrastructure blocker. It is not a product PASS and does not close Gross Profit Truth.

## Required runtime artifact

When an existing authenticated harness becomes available, it must produce an immutable artifact for independent comparison:

```text
surface
tenant
date_from
date_to
revenue
cost
gross_profit
quantity
status
source/query identity
execution timestamp
```

Export must additionally contain:

```text
exported_rows
presentation_page_size
```

The fixture requires `exported_rows = 25` and `presentation_page_size = 20`.

## Required authenticated execution

```text
Tenant A -> Dashboard -> Reports -> Executive Decision -> Export
Tenant B -> Dashboard -> Reports -> Executive Decision -> Export
```

Required checks:

- Tenant A can obtain A data only.
- Tenant B can obtain B data only.
- Cross-tenant aggregate is rejected or impossible.
- Start boundary is included consistently.
- End boundary is included consistently.
- Outside-range data is excluded consistently.
- Missing/NULL cost remains `INSUFFICIENT_DATA`, never zero.
- Export returns all 25 records rather than the 20-record presentation page.
- Export financial values reconcile to the full report dataset.

## Current proof state

- Independent fixture truth: PROVEN.
- Canonical financial formula: PROVEN at query level.
- Consumer wiring: PROVEN at source level for Dashboard, Reports and Executive Decision.
- NULL/missing-cost reference semantics: REGRESSION-ENFORCED.
- Actual authenticated Dashboard execution: NOT PROVEN.
- Actual authenticated Reports execution: NOT PROVEN.
- Actual authenticated Executive Decision execution: NOT PROVEN.
- Actual authenticated Export execution: NOT PROVEN.
- Tenant A/B runtime isolation: NOT PROVEN.
- Date-boundary runtime equivalence: NOT PROVEN.
- Missing/NULL-cost cross-surface equivalence: NOT PROVEN.
- Export 25-vs-20 runtime completeness: NOT PROVEN.
- Gross Profit Cross-Surface Truth: OPEN / NOT PROVEN.
- Runtime truth: NOT PROVEN.
- Production certification: NOT PROVEN.

## Closure rule

No `PASS`, `CROSS-SURFACE EQUIVALENCE`, or `GROSS PROFIT TRUTH-PROVEN` claim may be made from the independent fixture, source inspection, or CI alone. Closure requires:

`independent reference -> real authenticated production consumer execution -> numeric comparison -> tenant/date/missing-data checks -> export completeness -> regression -> exact-head CI -> reviewable runtime artifact`.
