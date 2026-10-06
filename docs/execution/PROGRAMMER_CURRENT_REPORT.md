SESSION HANDOFF = READY
REPORT_FOR_HEAD = 8de8420541b95f5692aedc097bd4cd6d94debe7d
UPDATED_AT = 2026-10-06T21:08:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue from the exact product head, close proven failures, keep the Smart Report journey source-bound, and produce visible real-business results without rebuilding or fabricating PASS.

WHAT_I_ACTUALLY_DID = Removed the timeout-prone dashboard dependency, made calculation persistence tenant mismatch fail-soft, corrected Smart Report recommendation typing, added bounded tenant-resolution retry, reconciled the dashboard UI contract, and replaced the landing catalog fan-out with a direct source-hash-bound Smart Report read with bounded network/session retries.
CURRENT_HEAD_CHANGE = 8de842 adds the customer-facing evidence language layer: human-readable evidence labels are shown in the main Smart Report signal cards, while raw field/key evidence is moved behind a technical audit disclosure. It also retains the previous source truth and fail-closed intelligence fixes.
FIRST_ACTIVE_FAILURE = The current customer-visible defect being closed is technical evidence leakage in the main report cards: raw key=value evidence was rendered directly instead of business-readable proof.
ROOT_CAUSE = Evidence strings were used as presentation text. This made correct lineage look like an internal debug dump and obscured the actual business meaning. The core data/provenance was real; the presentation layer exposed implementation syntax.
REPAIR = ee46edfc introduces direct source-hash lookup for the latest completed report in the authenticated tenant and bounded retries for transient tenant/network/timeout failures.

WHAT_IS_PROVEN = Netlify preview deploy 6ac534afa403080008010e23 is READY for efacf. Tenant f68 report job c42fb0e1-75f2-4727-8c3e-470ae1a804fa has 342 canonical committed rows and an ACCEPTED/VERIFIED/READY Evidence Passport. The 8de842 UI change is now on the exact execution branch; its new CI wave is pending/running.
NOT_YET_PROVEN = current-head typecheck/build terminal PASS, current-head authenticated browser visual PASS, and customer-sale certification. Vercel is not a dependency and its current build-rate-limit failure is ignored.

DO_NOT_REPEAT = Do not rebuild; do not delete prior work; do not fabricate unavailable metrics; do not turn REVIEW_REQUIRED into decision-ready; do not reuse stale-SHA PASS; do not weaken browser/security/truth contracts.

NEXT_EXACT_ACTION = Consume the 8de842 CI wave. Confirm Product Build, Browser E2E and Certification terminal status. Then verify the new evidence disclosure and the prior intelligence/Business Question fixes together on preview 855.

LANDING_SOURCE_METRICS_20261006 = Source calculations are read from SmartReportDetail.intelligence.calculations only; unavailable values remain unavailable. The authoritative report currently has row.count=332, data.completeness=97.04%, data.numeric.outlier.rate=17.47%, row.duplicate.rate=0%, all source-bound with confidence 1.0.

LANDING_UNIT_FORMAT_FIX = a742ade3d07d7cc3fba6f15b870f2bd91a69cf51 adds explicit source metric units: row count renders as number; completeness/outlier/duplicate render as percentages, not currency.


CURRENT_PRODUCT_TRUTH_FIX_1010F0A7 = Added net_sales/netsales aliases to sales_qty, added warehouse/store/location aliases, excluded 100%-blank fields from archetype qualification, and fail-closed unsupported archetypes to base source intelligence. This is a product behavior change, not a documentation-only claim.

CURRENT_PRODUCT_CLOSURE_20261006 = Dashboard metric units now render from an initialized valueUnit; executive hero priority uses the same selected signal as the primary recommendation; unsupported/blank data cannot qualify an archetype.

CURRENT_UI_FIX_8DE842 = Main Smart Report evidence pills are humanized; raw technical evidence is shown only inside a collapsible audit section.
