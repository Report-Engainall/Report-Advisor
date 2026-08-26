# Profitability Financial Truth Contract

## Certification state

**NOT PROVEN** — the repository must provide executable domain evidence for each financial semantic before this contract can certify profitability.

## Required dimensions

| Dimension | Required contract decision | Current state |
|---|---|---|
| Revenue | source, inclusion, date boundary | NOT PROVEN |
| Cost | source, missing-data behavior | NOT PROVEN |
| Returns | inclusion/exclusion and sign | NOT PROVEN |
| Discounts | source and allocation | NOT PROVEN |
| Cancelled | inclusion/exclusion | NOT PROVEN |
| Void | inclusion/exclusion | NOT PROVEN |
| Quantity | unit and sign semantics | NOT PROVEN |
| Currency | currency authority and conversion | NOT PROVEN |
| Rounding | calculation/display boundary | NOT PROVEN |
| Tenant | trusted tenant authority | NOT PROVEN |
| Missing financial inputs | must never silently become zero | CONTRACT RULE |

## Mandatory semantic rule

`missing != zero`.

A missing cost, missing revenue component, unknown status, or insufficient financial input must remain explicitly classified unless the domain contract proves a zero value.

## Required states

At minimum, the financial pipeline must distinguish:

- `CALCULABLE`
- `INSUFFICIENT_DATA`
- `UNKNOWN`
- `EXCLUDED`

The implementation may use different names only if the mapping is explicit and regression-tested.

## Required negative tests

- missing cost does not produce a false profit;
- cancelled transaction does not silently contribute to revenue;
- void transaction does not silently contribute to revenue;
- tenant A cannot contribute to tenant B profitability;
- date boundary is identical across dashboard/report/export;
- rounding occurs at the documented boundary;
- empty input is not interpreted as zero without domain approval.

## Closure rule

Do not certify profitability until an executable canonical source, consumer mapping, negative tests, boundary tests, and exact-head CI evidence exist. Runtime/production certification remains `LIVE REQUIRED` until executed in the real environment.
