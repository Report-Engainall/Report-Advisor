# Execution Report — 2026-10-14 — Generic table missingness guard

Repository: Report-Engainall/Report-Advisor
BRANCH = fix/generic-source-completeness-20261014
PR = #926 — https://github.com/Report-Engainall/Report-Advisor/pull/926
CODE_CHECKPOINT = 2ec58dd0d6e2270390e2b26f061a27a8ca3169e5
REPORT_FOR_HEAD = 2ec58dd0d6e2270390e2b26f061a27a8ca3169e5
IMPLEMENTED = Missing/non-numeric values no longer become zero in generic table totals, monthly sums or monthly reconciliation.
TESTED = PENDING_EXACT_HEAD
BROWSER-PROVEN = NOT_PROVEN
PRODUCTION-PROVEN = NOT_PROVEN
PRODUCT_COMPLETE = NO

## Change details
- Full stated total is emitted only when every row has a numeric value for the total field.
- Incomplete totals display observed coverage and explicitly say the full sum was not calculated because missing values are not zero.
- Monthly sums include observed coverage and missing/non-numeric counts.
- Period-to-period change is computed only when both adjacent periods have complete coverage.
- Total reconciliation compares only rows with a stated numeric total and every monthly value present; evidence includes mismatch, compared-row and excluded-row counts.
- A genuine discrepancy on a complete row still produces a reconciliation recommendation.

## Regression
scripts/generic-file-analysis.test.mjs adds four records: a complete row, a missing stated total, a missing month, and a genuine complete-row discrepancy. It checks the coverage boundary, absence of an unsupported trend, proper exclusion of incomplete rows, and preservation of the genuine mismatch recommendation. The test's CSV record delimiter and locale-sensitive count assertion were corrected before this checkpoint.

## Separate release blocker
PR #925 Phase-F failed at https://github.com/Report-Engainall/Report-Advisor/actions/runs/38610637235 with HTTP 503 operational_token_not_configured. Authorized operational/service/deploy credentials are not available through the connected sources; do not fabricate them or weaken fail-closed tenant checks.

NEXT_EXACT_ACTION = Verify exact-head Quality, Build, Session Handoff, Final Certification and Full Product Browser E2E on this documentation-successor SHA.
