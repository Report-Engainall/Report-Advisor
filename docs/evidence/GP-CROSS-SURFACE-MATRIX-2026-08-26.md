# Gross Profit Cross-Surface Evidence Matrix — 2026-08-26

Target branch: `runtime/gross-profit-truth-closure`

Current repository state: authenticated runtime is unavailable because CERT_* values are not available to the certification environment. Therefore no runtime cell is promoted to PASS.

| Surface | Revenue | Cost | GP | Qty | NULL | Date | Currency | Tenant | Export |
|---|---|---|---|---|---|---|---|---|---|
| Dashboard | IMPLEMENTED / NOT PROVEN runtime | IMPLEMENTED / NOT PROVEN runtime | IMPLEMENTED / NOT PROVEN runtime | IMPLEMENTED / NOT PROVEN runtime | REGRESSION-PROVEN / NOT PROVEN runtime | STATIC-PROVEN / NOT PROVEN runtime | REGRESSION-PROVEN / NOT PROVEN runtime | STATIC-PROVEN / NOT PROVEN runtime | N/A |
| Reports | SHARED / NOT PROVEN runtime | SHARED / NOT PROVEN runtime | SHARED overall KPI; breakdown CONTRACT GAP | SHARED / NOT PROVEN runtime | NOT PROVEN runtime | N/A for current all-time KPI surface | NOT PROVEN runtime | STATIC-PROVEN / NOT PROVEN runtime | INTEGRATED / NOT PROVEN runtime |
| Executive | INTEGRATED / NOT PROVEN runtime | INTEGRATED source KPI / NOT PROVEN runtime | INTEGRATED / NOT PROVEN runtime | INTEGRATED source KPI / NOT PROVEN runtime | IMPLEMENTED fail-closed / NOT PROVEN runtime | INTEGRATED selected-period KPI / NOT PROVEN runtime | NOT PROVEN runtime | STATIC-PROVEN / NOT PROVEN runtime | N/A |
| Export | IMPLEMENTED / NOT PROVEN runtime | IMPLEMENTED / NOT PROVEN runtime | IMPLEMENTED / NOT PROVEN runtime | IMPLEMENTED / NOT PROVEN runtime | REGRESSION-PROVEN / NOT PROVEN runtime | IMPLEMENTED via canonical boundary / NOT PROVEN runtime | REGRESSION-PROVEN / NOT PROVEN runtime | STATIC-PROVEN / NOT PROVEN runtime | RUNTIME ARTIFACT REQUIRED |

## Interpretation

- `SHARED` means the surface intentionally consumes the canonical Dashboard KPI path; it is not independent proof.
- `CONTRACT GAP` means the surface exposes a line/category profitability breakdown for which no invoice-header discount/tax allocation contract exists. No allocation formula is invented.
- `NOT PROVEN runtime` is mandatory until an authenticated actual result is compared with the independent oracle.
- Static RLS evidence does not promote Tenant cells to runtime proof.
- Export's complete-dataset loader is not the 20-row presentation page; live 25>20 evidence is still required.

## Required final runtime comparator

Independent fixture/oracle → actual Dashboard → actual Reports → actual Executive → actual XLSX evidence → compare Revenue, Cost, Gross Profit, Quantity, status, tenant, date range, and currency. The comparator must not import canonical production financial functions.
