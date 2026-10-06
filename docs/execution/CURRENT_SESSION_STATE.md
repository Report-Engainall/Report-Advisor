SESSION HANDOFF = NOT READY
UPDATED_AT = 2026-10-06T18:59:00+03:00
CURRENT_EXACT_HEAD = 5d0c799b1676b7ed4318fd1e63077a8f409eeb6b
CURRENT_EXACT_PRODUCT_HEAD = 5d0c799b1676b7ed4318fd1e63077a8f409eeb6b
CURRENT_MAIN_HEAD = a6d034e05172189d278e689eb01a0c86454f529e
PR_BASE = a6d034e05172189d278e689eb01a0c86454f529e
BRANCH = fix/real-data-visible-surfaces-20261006
PR = #855
ACTION_STATUS = ACTIVE_EXECUTION_AUTHENTICATED_BROWSER

FIRST_ACTIVE_FAILURE_1 = Smart Report could mix historical and current jobs for the same physical source and render contradictory specialty/row data.
ROOT_CAUSE_1 = Completed jobs sharing a source hash existed under different tenant contexts while customer-facing selection had a fixed primary job and stale session state could override it.
REPAIR_1 = 24e9a64b52d00f4668528ff2947349611aad0a22 added source-hash dedupe/current-source resolution, historical handoff warnings, source-bound links, field normalization, evidence pairing, empty-row filtering, and source-scoped Work Center behavior.

FIRST_ACTIVE_FAILURE_2 = Full Product Browser E2E source-workspace contract rejected a valid multiline report.canonicalRows.map implementation.
ROOT_CAUSE_2 = The contract asserted source formatting rather than behavior.
REPAIR_2 = 28e6ed2f42478563246296aa1b20aeca82208a21 changed the assertion to whitespace-tolerant matching.

FIRST_ACTIVE_FAILURE_3 = Full Product Browser E2E resume received empty TEST_USER_A_EMAIL/PASSWORD.
ROOT_CAUSE_3 = full-product-browser-e2e.yml overwrote A credentials from expression-context env.TEST_USER_D_* before GITHUB_ENV values existed.
REPAIR_3 = a4ed31ff8fdb0ea121f4eafefb4ee13236ce3a19 removed the overwrite and retained the script fallback to provisioned Actor D.

FIRST_ACTIVE_FAILURE_4 = Session Handoff Contract evaluated valid changed paths as unreported.
ROOT_CAUSE_4 = check-session-handoff-contract.mjs split git diff output with a regex matching literal backslashes rather than actual line separators.
REPAIR_4 = 721f09c963bf6200086d37afad71453fe4051e30 corrected the diff split to /\r?\n/.

PRODUCT_HARDENING_5 = Reports Center still had a fixed primary reportJobId and could resurrect a historical report after a later run of the same source.
REPAIR_5 = a796dac1ebbd1bcee1563198c4d1e972fe0ca5e7 resolves the primary Smart Report from the authoritative source-hash catalog, uses the latest catalog job, scopes the primary card to the resolved job, and clears stale sessionStorage when no authoritative report is read.

LIVE_SOURCE_CHECK = Supabase currently shows one completed job for company 99e33354-cc45-4317-8eb3-0d486b6c5932 with source hash sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313: job 16709d80-e012-40ef-9c12-6fd8255897f8. The same physical source hash exists in another tenant as job c42fb0e1-75f2-4727-8c3e-470ae1a804fa; tenant-scoped catalog selection prevents cross-tenant contamination.

REAL_SOURCE = تقارير ادارية.xlsx
REAL_SOURCE_JOB = 16709d80-e012-40ef-9c12-6fd8255897f8
REAL_SOURCE_HASH = sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313
REAL_SOURCE_ROWS = 332
REAL_SOURCE_QUALITY = 98
REAL_SOURCE_EVIDENCE = VERIFIED / READY / ACCEPTED
REAL_KERNEL = stock=23075 | demand=324250 | baseline_coverage=0.0711642251 | demand_plus_15_coverage=0.0618819349 | anomalies=3 | scenarios=1 | sensitivities=2 | status=REVIEW_REQUIRED
CALCULATION_PERSISTENCE = 31 rows / 23 distinct metrics / 15 CALCULATED / 16 NOT_AVAILABLE, all 31 evidence-linked.
OPEN_REPORT = d074ad5c-70d4-4402-a763-01129786f392
OPEN_REPORT_SOURCE = فواتير العملاء من تاريخ 01-01 حتى 30-08-2026.pdf
OPEN_REPORT_HASH = sha256:f68f77f641cb54bbc30b9ece0ed9516700cb5ae48b6cbfb5b52317a8360faf10
OPEN_REPORT_DB_STATE = completed / rendered
OPEN_REPORT_CANONICAL_ROWS = 6776
OPEN_REPORT_CANONICAL_COMMITTED = 6776

WHAT_IS_PROVEN = Product Build Gate #413 passed on the prior product head; Session Handoff succeeded on 2b585284. The authoritative report is still job 16709d80-e012-40ef-9c12-6fd8255897f8 with 332 rows, quality 98, VERIFIED/READY/ACCEPTED evidence. 5d0c799 binds device-independent authenticated E2E to its certified open-report execution job/source/file.
WHAT_IS_NOT_YET_PROVEN = authenticated browser proof on 5d0c799; complete commercial journey; production certification.
DO_NOT_REPEAT = No rebuild; no synthetic truth; no weakening trust/security/browser contracts; no stale-SHA PASS reuse; no generic source/job selection.
NEXT_EXACT_ACTION = Read the 5d0c799 Full Product Browser E2E and Device-Independent authenticated E2E terminal results; repair only the first new proven failure.
