SESSION HANDOFF = READY
REPORT_FOR_HEAD = 6a7fc975842715e37f0a2b27a2817fb899101e40
UPDATED_AT = 2026-10-06T21:30:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue from the exact product head, close proven failures, keep the Smart Report journey source-bound, and produce visible real-business results without rebuilding or fabricating PASS.

WHAT_I_ACTUALLY_DID = Removed the timeout-prone dashboard dependency, made calculation persistence tenant mismatch fail-soft, corrected Smart Report recommendation typing, added bounded tenant-resolution retry, reconciled the dashboard UI contract, and replaced the landing catalog fan-out with a direct source-hash-bound Smart Report read with bounded network/session retries.
CURRENT_HEAD_CHANGE = 6a7fc975 fixes the Reports Center TypeScript regression by retaining fetchSmartReport for linked source-bound report contexts while keeping the new direct source-first load for the primary report. The live tenant source was reclassified deterministically from generic:sales to generic:inventory across canonical lineage and Evidence Passport.
FIRST_ACTIVE_FAILURE = Product Build Gate on edcb4 failed because ReportsPage.tsx still referenced fetchSmartReport after the import was removed during the source-first catalog fix.
ROOT_CAUSE = The source-first refactor removed an import used by the optional linked-report loader. Separately, the live report had been classified as sales by stale recovery metadata even though its source schema is an inventory layout.
REPAIR = ee46edfc introduces direct source-hash lookup for the latest completed report in the authenticated tenant and bounded retries for transient tenant/network/timeout failures.

WHAT_IS_PROVEN = Live source c42fb0e1-75f2-4727-8c3e-470ae1a804fa is now generic:inventory with 342 inventory canonical rows, inventory canonical commit, and Evidence Passport VERIFIED/ACCEPTED/READY/FULL. inventory-intelligence-truth passed on edcb4. Migration recovery logic now prefers source-schema inventory signals over job_key. 19/20 release-readiness stages previously passed; only build failed for the missing import.
NOT_YET_PROVEN = current-head typecheck/build terminal PASS, current-head authenticated browser visual PASS, and customer-sale certification. Vercel is not a dependency and its current build-rate-limit failure is ignored.

DO_NOT_REPEAT = Do not rebuild; do not delete prior work; do not fabricate unavailable metrics; do not turn REVIEW_REQUIRED into decision-ready; do not reuse stale-SHA PASS; do not weaken browser/security/truth contracts.

NEXT_EXACT_ACTION = Consume 6a7fc CI terminals. If build passes, inspect Device-Independent Browser and Full Product Browser. Fix only the first terminal customer-visible failure. Keep the live source classification invariant: inventory, 342/342, Passport VERIFIED/READY.

LANDING_SOURCE_METRICS_20261006 = Source calculations are read from SmartReportDetail.intelligence.calculations only; unavailable values remain unavailable. The authoritative report currently has row.count=332, data.completeness=97.04%, data.numeric.outlier.rate=17.47%, row.duplicate.rate=0%, all source-bound with confidence 1.0.

LANDING_UNIT_FORMAT_FIX = a742ade3d07d7cc3fba6f15b870f2bd91a69cf51 adds explicit source metric units: row count renders as number; completeness/outlier/duplicate render as percentages, not currency.


CURRENT_PRODUCT_TRUTH_FIX_1010F0A7 = Added net_sales/netsales aliases to sales_qty, added warehouse/store/location aliases, excluded 100%-blank fields from archetype qualification, and fail-closed unsupported archetypes to base source intelligence. This is a product behavior change, not a documentation-only claim.

CURRENT_PRODUCT_CLOSURE_20261006 = Dashboard metric units now render from an initialized valueUnit; executive hero priority uses the same selected signal as the primary recommendation; unsupported/blank data cannot qualify an archetype.

CURRENT_UI_FIX_8DE842 = Main Smart Report evidence pills are humanized; raw technical evidence is shown only inside a collapsible audit section.

CURRENT_CODE_FIX_21C4 = Semantic field aliases are translated to official CanonicalField values without widening the schema type.

CURRENT_RUNTIME_FIX_6CC664 = Reports Center reads PRIMARY_SMART_REPORT_SOURCE_HASH directly through fetchLatestSmartReportBySourceHash; catalog enrichment is non-blocking.

CURRENT_LIVE_REPAIR_20261006 = Exact source hash sha256:587f...d6b313 for tenant f68 was reclassified from generic:sales to generic:inventory across report job, import job, canonical dataset/commit, rendered outputs and Passport lineage. No other tenant/source was touched.
