SESSION HANDOFF = READY
REPORT_FOR_HEAD = 6cc6646edbe4f1819613105d42afe909c2735bd3
UPDATED_AT = 2026-10-06T21:24:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue from the exact product head, close proven failures, keep the Smart Report journey source-bound, and produce visible real-business results without rebuilding or fabricating PASS.

WHAT_I_ACTUALLY_DID = Removed the timeout-prone dashboard dependency, made calculation persistence tenant mismatch fail-soft, corrected Smart Report recommendation typing, added bounded tenant-resolution retry, reconciled the dashboard UI contract, and replaced the landing catalog fan-out with a direct source-hash-bound Smart Report read with bounded network/session retries.
CURRENT_HEAD_CHANGE = 6cc664 makes the designated Smart Report source read direct and tenant/source-hash bound; the 60-item report catalog is now enrichment only and cannot block first customer paint. It removes the exact architectural path that previously produced Failed to fetch during catalog fan-out.
FIRST_ACTIVE_FAILURE = Reports Center still coupled the primary report to fetchSmartReportCatalog(60), so the real source could not load independently when catalog/session/network convergence failed.
ROOT_CAUSE = primaryPromise was derived from catalogPromise. The supposed direct source-first repair existed in comments but not in the actual dependency graph.
REPAIR = ee46edfc introduces direct source-hash lookup for the latest completed report in the authenticated tenant and bounded retries for transient tenant/network/timeout failures.

WHAT_IS_PROVEN = CanonicalField regression is fixed on 21c. inventory-intelligence-truth had previously passed. The new 6cc664 source-first load path is committed; current-head CI/build/browser/certification are not yet terminal.
NOT_YET_PROVEN = current-head typecheck/build terminal PASS, current-head authenticated browser visual PASS, and customer-sale certification. Vercel is not a dependency and its current build-rate-limit failure is ignored.

DO_NOT_REPEAT = Do not rebuild; do not delete prior work; do not fabricate unavailable metrics; do not turn REVIEW_REQUIRED into decision-ready; do not reuse stale-SHA PASS; do not weaken browser/security/truth contracts.

NEXT_EXACT_ACTION = Consume 6cc664 CI results, especially Product Build, Session Handoff and Device-Independent Browser. Fix only the first terminal failure, then verify Preview 855 with the direct source-first load.

LANDING_SOURCE_METRICS_20261006 = Source calculations are read from SmartReportDetail.intelligence.calculations only; unavailable values remain unavailable. The authoritative report currently has row.count=332, data.completeness=97.04%, data.numeric.outlier.rate=17.47%, row.duplicate.rate=0%, all source-bound with confidence 1.0.

LANDING_UNIT_FORMAT_FIX = a742ade3d07d7cc3fba6f15b870f2bd91a69cf51 adds explicit source metric units: row count renders as number; completeness/outlier/duplicate render as percentages, not currency.


CURRENT_PRODUCT_TRUTH_FIX_1010F0A7 = Added net_sales/netsales aliases to sales_qty, added warehouse/store/location aliases, excluded 100%-blank fields from archetype qualification, and fail-closed unsupported archetypes to base source intelligence. This is a product behavior change, not a documentation-only claim.

CURRENT_PRODUCT_CLOSURE_20261006 = Dashboard metric units now render from an initialized valueUnit; executive hero priority uses the same selected signal as the primary recommendation; unsupported/blank data cannot qualify an archetype.

CURRENT_UI_FIX_8DE842 = Main Smart Report evidence pills are humanized; raw technical evidence is shown only inside a collapsible audit section.

CURRENT_CODE_FIX_21C4 = Semantic field aliases are translated to official CanonicalField values without widening the schema type.

CURRENT_RUNTIME_FIX_6CC664 = Reports Center reads PRIMARY_SMART_REPORT_SOURCE_HASH directly through fetchLatestSmartReportBySourceHash; catalog enrichment is non-blocking.
