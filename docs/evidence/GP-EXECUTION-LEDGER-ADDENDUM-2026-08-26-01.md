# Gross Profit Execution Ledger Addendum — 2026-08-26

- HEAD introducing currency guard: `664b68a428e3c7858f62bfa68ba31403a11a0631`
- HEAD adding currency regression: `519a9837710fd2e87c7a01a2ebc8b1a0912a36d3`
- HEAD wiring currency regression into exact-head CI: `1f61db0f0b516ce99d8f9c35b7a98e608f2bc7f5`
- FIND: financial aggregation previously had no explicit mixed-currency guard.
- FIX: canonical truth/export now propagate currency and return `INSUFFICIENT_DATA` for missing/mixed currency.
- REGRESSION: dedicated `gross-profit-currency-regression.mjs` is wired into exact-head CI.
- RUNTIME: not applicable yet; authenticated runtime remains blocked by external CERT_* availability.
- CLASSIFICATION: IMPLEMENTED + REGRESSION-ENFORCED after the new exact-head run passes; until then the new HEAD remains uncertified.
