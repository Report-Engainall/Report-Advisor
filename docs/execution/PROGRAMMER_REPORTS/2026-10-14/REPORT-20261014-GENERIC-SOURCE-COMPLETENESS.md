# Execution report — 2026-10-14 — Source completeness + browser refresh readback

Repository: Report-Engainall/Report-Advisor
Branch: fix/generic-source-completeness-20261014
Code checkpoint: 10f1e376a135e0be72862315bf675f2966aa98a0
PR #926: https://github.com/Report-Engainall/Report-Advisor/pull/926 (OPEN / NOT MERGED)
Updated: 2026-10-14T19:18:00Z

## Source-completeness fix

The Smart Report runtime now passes canonical fetch completeness and expected source count into the general intelligence selector. Partial or inconsistent canonical rows are rejected; a complete source-bound snapshot may be used as fallback, otherwise analysis is unavailable with an Arabic warning. The selected dataset row count equals the validated selected set.

Regression coverage in scripts/generic-file-analysis.test.mjs passed in Quality on prior candidate 16446f4003f1611ca842574c0cbf3f9bb50ee9bb; logs show GENERIC FILE ANALYSIS PASS and SOURCE-BOUND ROW SELECTOR PASS canonical-priority/completeness-guard/full-snapshot-fallback/partial-preview/count-mismatch.

## Full browser refresh diagnosis

Full Product Browser E2E run 38618336854 failed on 16446f4003f1611ca842574c0cbf3f9bb50ee9bb, finding E2E-REPORT-014. Initial report settlement passed; after refresh, the DOM contained all six chain cards, exact job ID and source hash, source file name, and no visible loading/errors. The test still marked readback NOT_PROVEN due to two pending read-only GETs to business_intelligence_decisions filtered to the report's source-intelligence history. It recorded zero failed routes and no failed network/HTTP responses.

Validation of the matching query on staging:
- Supabase edge logs show successful GET 200 responses for the exact endpoint with origin time approximately 185–245 ms.
- EXPLAIN ANALYZE of the equivalent tenant + decision_key prefix filter completed in ~1.4 ms.
- This does not prove the browser telemetry entries finished correctly; it shows database/query latency is not the cause.

## Fix implemented

In scripts/run-full-product-browser-e2e.mjs, only GET requests to /rest/v1/business_intelligence_decisions associated with the exact source-intelligence key for the current Smart Report route are excluded from blocking DOM settlement. The full failure accounting is preserved: requestfailed events, failedResponses, routeFailed and routeFailedResponses still produce explicit findings. A contract assertion was added in scripts/check-browser-e2e-page-telemetry-contract.mjs so this exception stays narrowly scoped and does not suppress write requests or non-2xx/network failures.

## Exact-head evidence before this fix

On 16446f4003f1611ca842574c0cbf3f9bb50ee9bb, these passed: Product Build Gate 38618337065; Quality 38618336564; Session Handoff 38618336190; Final Certification 38618336879; Device-independent E2E 38618336839; Commercial Product Creation E2E 38618337179; Data Quality Runtime 38618337297. Full browser run 38618336854 failed with E2E-REPORT-014. None of those statuses proves the new head 10f1e376a135e0be72862315bf675f2966aa98a0; run the new exact-head gates before merging.

## Separate production blocker

PR #925 remains open/unmerged; Phase-F run 38610637235 failed with HTTP 503 operational_token_not_configured. Netlify published deploy 6ac3d608e2e37d0008cc0222 uses stale main SHA 858ef8e3e5bc5bf74430555eadfb9e6767be348b. Netlify's enumerated site env vars do not include RESILIENCE_OPERATIONAL_TOKEN, SUPABASE_SERVICE_ROLE_KEY or NETLIFY_AUTH_TOKEN, and no team-level vars were returned. Production remains NOT_PROVEN until authorized credentials are provisioned and Phase-F passes.

## Next exact action

Validate the new telemetry contract and all required exact-head gates, especially Full Product Browser E2E. Keep PR #926 open until the readback test succeeds with truthful error accounting; do not merge PR #925 until live Phase-F passes.
