# Reports Async / Export Failure-State Closure — 2026-09-08

## Exact source boundary
- Branch: `audit/ui-route-completeness-current-main`
- Base main: `d9962a2cc624272897c77b04036c703889796633`
- Closure commit: `6a9ff96bbd7f5470b7923787e0ec49f0b8ac2db4`
- Guard: `scripts/check-reports-async-export-closure.mjs`

## Defects closed
- Purchases, inventory, and receivables retry now reuses the local loader rather than reloading the browser.
- Sales, purchases, inventory, and receivables exports now fence duplicate clicks, expose progress, and surface rejected requests inline.
- Sales and profitability retry paths use explicit local loading/error state.

## Financial/security boundary
Backend financial guards remain fail-closed. A `FINANCIAL_CURRENCY_MISMATCH` is surfaced rather than converted, hidden, or used to fabricate values.

## Certification boundary
Source closure only; this does not certify authenticated E2E, tenant isolation, production runtime, successful mixed-currency export, or durable worker consumption.
