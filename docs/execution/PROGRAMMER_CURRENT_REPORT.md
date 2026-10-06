SESSION HANDOFF = READY
REPORT_FOR_HEAD = 21c4ff3d48eba39c5da59dffdd33aca1105c825f
UPDATED_AT = 2026-10-06T21:18:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue from the exact product head, close proven failures, keep the Smart Report journey source-bound, and produce visible real-business results without rebuilding or fabricating PASS.

WHAT_I_ACTUALLY_DID = Removed the timeout-prone dashboard dependency, made calculation persistence tenant mismatch fail-soft, corrected Smart Report recommendation typing, added bounded tenant-resolution retry, reconciled the dashboard UI contract, and replaced the landing catalog fan-out with a direct source-hash-bound Smart Report read with bounded network/session retries.
CURRENT_HEAD_CHANGE = 21c4ff fixes the CanonicalField typing regression introduced by the semantic business-question alias layer: legacy source names are now translated into official schema fields (productCode, productName, currentStock, salesQty) instead of being inserted into the CanonicalField union.
FIRST_ACTIVE_FAILURE = Product Build Typecheck on the previous head failed because legacy alias strings were cast/inserted as CanonicalField values.
ROOT_CAUSE = The semantic alias patch mixed source-analysis vocabulary with the strict canonical schema. The business-question evaluator accepts only the official CanonicalField union.
REPAIR = ee46edfc introduces direct source-hash lookup for the latest completed report in the authenticated tenant and bounded retries for transient tenant/network/timeout failures.

WHAT_IS_PROVEN = inventory-intelligence-truth previously passed; Netlify Preview #855 remains successful; current head 21c has correct source-field translation in code. Product Build is running; current-head browser and final certification are not terminal yet.
NOT_YET_PROVEN = current-head typecheck/build terminal PASS, current-head authenticated browser visual PASS, and customer-sale certification. Vercel is not a dependency and its current build-rate-limit failure is ignored.

DO_NOT_REPEAT = Do not rebuild; do not delete prior work; do not fabricate unavailable metrics; do not turn REVIEW_REQUIRED into decision-ready; do not reuse stale-SHA PASS; do not weaken browser/security/truth contracts.

NEXT_EXACT_ACTION = Consume 21c Product Build and browser/certification results. Fix only the first terminal customer-visible or contract failure, then refresh the handoff report to the exact product head.

LANDING_SOURCE_METRICS_20261006 = Source calculations are read from SmartReportDetail.intelligence.calculations only; unavailable values remain unavailable. The authoritative report currently has row.count=332, data.completeness=97.04%, data.numeric.outlier.rate=17.47%, row.duplicate.rate=0%, all source-bound with confidence 1.0.

LANDING_UNIT_FORMAT_FIX = a742ade3d07d7cc3fba6f15b870f2bd91a69cf51 adds explicit source metric units: row count renders as number; completeness/outlier/duplicate render as percentages, not currency.


CURRENT_PRODUCT_TRUTH_FIX_1010F0A7 = Added net_sales/netsales aliases to sales_qty, added warehouse/store/location aliases, excluded 100%-blank fields from archetype qualification, and fail-closed unsupported archetypes to base source intelligence. This is a product behavior change, not a documentation-only claim.

CURRENT_PRODUCT_CLOSURE_20261006 = Dashboard metric units now render from an initialized valueUnit; executive hero priority uses the same selected signal as the primary recommendation; unsupported/blank data cannot qualify an archetype.

CURRENT_UI_FIX_8DE842 = Main Smart Report evidence pills are humanized; raw technical evidence is shown only inside a collapsible audit section.

CURRENT_CODE_FIX_21C4 = Semantic field aliases are translated to official CanonicalField values without widening the schema type.
