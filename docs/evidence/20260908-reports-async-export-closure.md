# Reports Async / Export Failure-State Closure — 2026-09-08

## Exact source boundary
- Branch: `audit/ui-route-completeness-current-main`
- Base main: `d9962a2cc624272897c77b04036c703889796633`
- Closure commit: `6a9ff96bbd7f5470b7923787e0ec49f0b8ac2db4`

## Defects closed
- Purchases, inventory, and receivables report retry previously reloaded the whole browser; retry now reuses the local loader and preserves the authenticated UI/session state.
- Report export actions previously had no local pending/error state; sales, purchases, inventory, and receivables exports now fence duplicate clicks, expose progress, and surface rejected export requests inline.
- Sales report loading now clears stale errors before retry.
- Profitability loading now has an explicit reusable retry path instead of a destructive page reload.

## Financial/security boundary
This does not weaken any backend financial guard. A `FINANCIAL_CURRENCY_MISMATCH` remains a fail-closed rejection and is surfaced to the user rather than converted or hidden.

## Certification boundary
This is a source-level UI closure. It does not certify successful export on mixed-currency data, authenticated E2E, tenant isolation, production runtime, or durable worker consumption.
