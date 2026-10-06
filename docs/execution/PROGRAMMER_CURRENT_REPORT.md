SESSION HANDOFF = NOT READY
REPORT_FOR_HEAD = a0760bc72c272ef32cbc03420d516afda9fd264f
UPDATED_AT = 2026-10-06T18:48:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue from the exact product head, close proven failures, keep the Smart Report journey source-bound, and produce visible real-business results without rebuilding or fabricating PASS.

WHAT_I_ACTUALLY_DID = Added the authoritative real-report surface to the customer landing screen and changed the browser proof to require that surface on '/'. Then corrected the E2E actor-provisioning contract: it was still asserting the old TEST_USER_A <- TEST_USER_D overwrite even though the workflow had already removed that bug. The contract now asserts the overwrite is absent and that the open-report resume path legitimately falls back from A credentials to Actor D credentials.

FIRST_ACTIVE_FAILURE = Full Product Browser E2E #8747 never reached Chromium business routes because the canonical regressions stopped at test:e2e-actor-provisioning on a stale assertion.
ROOT_CAUSE = The actor provisioning contract was stale: it required the previously removed TEST_USER_A_EMAIL/TEST_USER_D_EMAIL and password overwrites. With that assertion failing, the workflow skipped preview startup and actor provisioning, producing downstream connection-refused and missing-email failures.
REPAIR = a0760bc72c272ef32cbc03420d516afda9fd264f corrects the contract to fail if the old overwrite exists, proves the A->D fallback in resume-open-report-server-proof, marks the real-report landing card with a browser test id, and makes Chromium explicitly prove the '/' landing screen renders تقارير ادارية.xlsx with 332 rows and VERIFIED / READY / ACCEPTED.

WHAT_IS_PROVEN = The real Supabase report is still authoritative: job 16709d80-e012-40ef-9c12-6fd8255897f8, تقارير ادارية.xlsx, 332 rows, quality 98, evidence VERIFIED / READY / ACCEPTED. Exact product commit 9e64763f passed Product Build Gate #410 and deployed READY to Vercel. Commit a0760bc72c272ef32cbc03420d516afda9fd264f contains the contract/landing-proof repair and is now building/deploying; its exact-head browser result is not yet proven.

REAL_SOURCE_FACTS = تقارير ادارية.xlsx; 332 rows; quality 98; evidence VERIFIED/READY/ACCEPTED; inventory kernel REVIEW_REQUIRED with stock 23075, demand 324250, baseline coverage 0.0711642251, demand+15 coverage 0.0618819349, anomalies 3, scenarios 1, sensitivities 2. Calculation persistence is 31 rows / 23 metric IDs / 15 CALCULATED / 16 NOT_AVAILABLE, all evidence-linked. Open sales PDF d074ad5c-70d4-4402-a763-01129786f392 is completed/rendered with 6776 canonical committed rows.

NOT_YET_PROVEN = exact-head a796 authenticated Chromium Smart Report readback; exact-head Product Build, Full Product Browser, Device-Independent Browser and Final Certification terminal evidence; complete Decision -> Approval -> Work -> Outcome -> Learning; source-bound Benchmark; real-source 48/48; production promotion; sale readiness.

DO_NOT_REPEAT = Do not rebuild; do not delete prior work; do not fabricate unavailable metrics; do not turn REVIEW_REQUIRED into decision-ready; do not reuse stale-SHA PASS; do not weaken browser/security/truth contracts.

NEXT_EXACT_ACTION = Read the a0760bc exact-head Product Build and Full Product Browser E2E terminal results. If the browser reaches a new failure, fix only that first failure and rerun the exact-head proof.
