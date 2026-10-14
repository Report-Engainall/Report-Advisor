# Execution Report — 2026-10-14 — Generic table missingness guard

Repository: Report-Engainall/Report-Advisor
BRANCH = fix/generic-source-completeness-20261014
PR = #926 — https://github.com/Report-Engainall/Report-Advisor/pull/926
CODE_CHECKPOINT = ba64ef395bdf0c650bae24d0a4b97b0b2b76cf4a
REPORT_FOR_HEAD = ba64ef395bdf0c650bae24d0a4b97b0b2b76cf4a
RELATED_BLOCKER = PR #925 Phase-F; /api/tenant-canary returned HTTP 503 operational_token_not_configured on head 8d93a28e0d7824f4028b1a9e8e5742d65a666080.
STATUS = IMPLEMENTED; TESTED=PENDING_EXACT_HEAD; BROWSER-PROVEN=NOT_PROVEN; PRODUCTION-PROVEN=NOT_PROVEN; PRODUCT_COMPLETE=NO.

## Change
Fixed missing-value coercion in generic table profiling. Previously the monthly aggregate, overall stated-total aggregate, and monthly-to-total consistency check used `numericValue(value) ?? 0`, silently treating a missing/non-numeric source value as zero. Period change was also calculated from these zero-filled sums.

The engine now:
- Computes sums from observed numeric values and reports value coverage/missing counts.
- Reports an overall total as complete only when every source row has a numeric value for the stated-total field. When values are missing, the summary says the complete sum was not calculated and explicitly states that missing is not zero.
- Calculates period change only when the previous and latest periods are both complete.
- Compares stated totals only on rows with a numeric stated total and numeric values for every monthly column; reports mismatch count, compared-row count, and excluded-row count.
- Keeps a real mismatch on a complete row eligible for a reconciliation recommendation.

## Regression
`scripts/generic-file-analysis.test.mjs` now includes a four-row CSV fixture with one fully complete row, one missing stated total, one missing month, and one genuine discrepancy. Assertions cover observed coverage, no zero-filled total, no trend from incomplete periods, exclusion of incomplete rows, and preservation of a valid discrepancy signal/recommendation.

## Proof boundary
- Code and test commit exists at the exact code checkpoint above; commit was pushed to the existing PR #926 branch.
- Build/Quality/Full Product Browser E2E/Session Handoff/Final Certification must be read on the newest documentation-successor SHA before reporting TESTED.
- PR #925 Phase-F root cause remains external configuration: missing authorized operational token/service credentials; do not fabricate them or weaken the fail-closed canary.
- Netlify production remains stale on SHA 858ef8e3e5bc5bf74430555eadfb9e6767be348b; PRODUCTION-PROVEN=NOT_PROVEN.

NEXT_EXACT_ACTION = Verify exact-head GitHub Actions on the documentation-successor SHA, fix the first confirmed test failure, and read all changed files back from GitHub.
