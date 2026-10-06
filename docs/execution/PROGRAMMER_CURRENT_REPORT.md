SESSION HANDOFF = NOT READY
REPORT_FOR_HEAD = 6dbd674394b1828e80de8b0b458441ae76f32aac
UPDATED_AT = 2026-10-06T19:12:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue from the exact product head, close proven failures, keep the Smart Report journey source-bound, and produce visible real-business results without rebuilding or fabricating PASS.

WHAT_I_ACTUALLY_DID = Made the customer landing source-bound: it now resolves the authoritative real Smart Report first and does not invoke the heavyweight get_dashboard_snapshot RPC on the landing path, which was proven to return PostgreSQL statement_timeout. Also changed Calculation Persistence tenant recheck from a thrown page-level exception to an explicit PERSISTENCE_FAILED result so transient auth refresh races cannot crash Smart Report rendering; database/RLS remains authoritative for writes.

FIRST_ACTIVE_FAILURE = Exact-head device-independent browser proof found two runtime faults: landing POST to get_dashboard_snapshot returned HTTP 500 statement_timeout, and Smart Report logged CALCULATION_PERSISTENCE_TENANT_MISMATCH during calculation readback.
ROOT_CAUSE = The landing page blocked source-bound report rendering behind a legacy aggregate RPC with a two-minute PostgreSQL timeout. The calculation readback path performed a second current_company_id resolver call and treated any transient disagreement as a thrown exception.
REPAIR = 6dbd674 removes the dashboard RPC/intelligence dependency from the landing load and renders the verified source-bound report directly with generic KPIs explicitly unavailable. The calculation persistence guard now returns a typed persistence failure for missing/mismatched tenant context instead of throwing; RLS still rejects unauthorized writes.

WHAT_IS_PROVEN = Supabase real source remains job 16709d80-e012-40ef-9c12-6fd8255897f8 (تقارير ادارية.xlsx), 332 rows, quality 98, VERIFIED/READY/ACCEPTED evidence. Chromium on d990 proved the exact PostgreSQL timeout and tenant-mismatch faults. Product Build had previously passed, and the new 6dbd674 exact-head workflows are now running.

REAL_SOURCE_FACTS = تقارير ادارية.xlsx; 332 rows; quality 98; evidence VERIFIED/READY/ACCEPTED; inventory kernel REVIEW_REQUIRED with stock 23075, demand 324250, baseline coverage 0.0711642251, demand+15 coverage 0.0618819349, anomalies 3, scenarios 1, sensitivities 2. Calculation persistence is 31 rows / 23 metric IDs / 15 CALCULATED / 16 NOT_AVAILABLE, all evidence-linked. Open sales PDF d074ad5c-70d4-4402-a763-01129786f392 is completed/rendered with 6776 canonical committed rows.

NOT_YET_PROVEN = 6dbd674 exact-head browser/business proof, final Smart Report settlement, production deployment of the fixed head, and complete Decision -> Approval -> Work -> Outcome -> Learning closure.

DO_NOT_REPEAT = Do not rebuild; do not delete prior work; do not fabricate unavailable metrics; do not turn REVIEW_REQUIRED into decision-ready; do not reuse stale-SHA PASS; do not weaken browser/security/truth contracts.

NEXT_EXACT_ACTION = Consume the 6dbd674 Device-Independent Browser and Full Product Browser terminal results. Fix only the first new runtime failure; do not reuse stale-SHA PASS.
