# Execution Report — 2026-10-14 — Generic table missingness guard

Repository: Report-Engainall/Report-Advisor
BRANCH = fix/generic-source-completeness-20261014
PR = #926 — https://github.com/Report-Engainall/Report-Advisor/pull/926
CODE_CHECKPOINT = 51bbfae3266bc285b35498f9c3b177cefd3e92cd
REPORT_FOR_HEAD = 51bbfae3266bc285b35498f9c3b177cefd3e92cd
IMPLEMENTED = Missing numeric values are no longer treated as zero in generic table totals, monthly aggregates or total reconciliation.
TESTED = PENDING_EXACT_HEAD
BROWSER-PROVEN = NOT_PROVEN
PRODUCTION-PROVEN = NOT_PROVEN
PRODUCT_COMPLETE = NO

## Change
- A complete stated total is shown only when every source row has a numeric value.
- Incomplete totals include observed count and a clear warning that missing values are not zero.
- Monthly sums expose numeric coverage and missing/non-numeric counts.
- Period change is calculated only when adjacent periods have complete data.
- Reconciliation compares only rows with a stated total and all periods present, and reports the number of mismatches, compared rows and excluded rows.
- A genuine discrepancy on a complete row still produces a review recommendation.

## Regression
The generic file analysis test includes one complete row, a missing stated total, a missing month, and a genuine mismatch. Assertions cover coverage, trend suppression, exclusions, and retention of the real discrepancy. The CSV test fixture now uses actual newline separators and its trend-evidence/count assertions match emitted source text.

## Independent production blocker
PR #925 Phase-F run https://github.com/Report-Engainall/Report-Advisor/actions/runs/38610637235 failed with HTTP 503 operational_token_not_configured. Required authorized operational/service/deploy credentials are unavailable through the connected sources; no secret is fabricated and tenant checks remain fail-closed.

NEXT_EXACT_ACTION = Verify exact-head Quality, Build, Session Handoff, Final Certification and Full Product Browser E2E on the documentation-successor SHA.
