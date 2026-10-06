SESSION HANDOFF = NOT READY
UPDATED_AT = 2026-10-06T18:00:00+03:00
CURRENT_EXACT_HEAD = 721f09c963bf6200086d37afad71453fe4051e30
CURRENT_EXACT_PRODUCT_HEAD = 721f09c963bf6200086d37afad71453fe4051e30
CURRENT_MAIN_HEAD = a6d034e05172189d278e689eb01a0c86454f529e
PR_BASE = a6d034e05172189d278e689eb01a0c86454f529e
BRANCH = fix/real-data-visible-surfaces-20261006
PR = #855
ACTION_STATUS = ACTIVE_EXECUTION_PRODUCT_EVIDENCE_PENDING

FIRST_ACTIVE_FAILURE_1 = Smart Report previously mixed historical and current jobs for the same source hash and could render contradictory specialty/row data.
ROOT_CAUSE_1 = Multiple completed jobs shared the same source hash, while customer-facing consumers and session state could select an older job.
REPAIR_1 = 24e9a64b52d00f4668528ff2947349611aad0a22 added source-hash dedupe/current-source resolution, historical handoff warnings, source-bound links, canonical field normalization, recommendation/evidence matching, stale sessionStorage protection, empty-row filtering, and source-scoped Work Center behavior.

FIRST_ACTIVE_FAILURE_2 = Exact-head Full Product Browser E2E canonical heart regression rejected the old source-workspace assertion because it searched for the literal contiguous string report.canonicalRows.map while the valid implementation is formatted across lines.
ROOT_CAUSE_2 = The test asserted source formatting instead of the intended behavior.
REPAIR_2 = 28e6ed2f42478563246296aa1b20aeca82208a21 changed the contract to a whitespace-tolerant regex while retaining all behavioral assertions.

FIRST_ACTIVE_FAILURE_3 = Exact-head Full Product Browser E2E resume step received empty TEST_USER_A_EMAIL/PASSWORD.
ROOT_CAUSE_3 = The workflow assigned TEST_USER_A_* from expression-context env.TEST_USER_D_* immediately after the provisioning step, before the GITHUB_ENV values existed in that expression context.
REPAIR_3 = a4ed31ff8fdb0ea121f4eafefb4ee13236ce3a19 removed those overrides; resume-open-report-server-proof.mjs already falls back from TEST_USER_A_* to TEST_USER_D_*.

FIRST_ACTIVE_FAILURE_4 = Session Handoff Contract incorrectly treated all changed files as unreported.
ROOT_CAUSE_4 = scripts/check-session-handoff-contract.mjs split git diff output with a regex matching literal backslashes instead of real CR/LF separators.
REPAIR_4 = 721f09c963bf6200086d37afad71453fe4051e30 changes the split to /\r?\n/ so the allowlist is evaluated per path.

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

WHAT_IS_PROVEN = Exact product deployment at 721 lineage remains based on the 24e9/a4ed repair chain; Vercel deployment a4ed31ff was READY and its deployed HTML reports aghbari-source-sha=a4ed31ff8fdb0ea121f4eafefb4ee13236ce3a19. Product Build Gate 399 on 24e9 succeeded; Commercial Product Creation 4323 on 24e9 succeeded. The real inventory/open-report database facts remain evidence-linked.
WHAT_IS_NOT_YET_PROVEN = exact-head authenticated Smart Report Chromium readback after the latest fixes; complete Decision -> Approval -> Work -> Outcome -> Learning; source-bound Benchmark; real-source 48/48; final certification; production promotion; sale readiness.
DO_NOT_REPEAT = No rebuild; no synthetic truth; no weakening of trust/security/browser gates; no stale-SHA PASS reuse; no generic report/job without source context.
NEXT_EXACT_ACTION = Consume the new 721-cycle Product Build, Full Product Browser, Device-Independent Browser, Phase-F and Final Certification results. Fix only the first newly proven product failure, then certify the real Smart Report and full business journey on the resulting exact product head.
