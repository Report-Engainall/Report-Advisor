SESSION HANDOFF = READY
REPORT_FOR_HEAD = 942f807eee11350926fa7ac63d1a6d28a29c09e9
UPDATED_AT = 2026-10-06T21:38:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue from the exact product head, close proven failures, keep the Smart Report journey source-bound, and produce visible real-business results without rebuilding or fabricating PASS.

WHAT_I_ACTUALLY_DID = Removed the timeout-prone dashboard dependency, made calculation persistence tenant mismatch fail-soft, corrected Smart Report recommendation typing, added bounded tenant-resolution retry, reconciled the dashboard UI contract, and replaced the landing catalog fan-out with a direct source-hash-bound Smart Report read with bounded network/session retries.
CURRENT_HEAD_CHANGE = 942f807 completes the customer-facing language cleanup for the intelligence surfaces: the kernel header is business-facing and raw metric ids are audit-only; claim Rule/Archetype/Inputs and supporting-evidence syntax are behind the technical proof disclosure. 940783 also makes future imports infer generic inventory/purchases/receivables/sales from actual mapped source fields instead of defaulting every source to generic:source-data.
FIRST_ACTIVE_FAILURE = The last terminal Product Build failure on edcb4 was a missing fetchSmartReport import after the source-first Reports Center refactor; 6a7fc fixed it. The current 942f wave has no terminal failure yet.
ROOT_CAUSE = The product had accumulated two classes of truth leakage: stale domain metadata from recovery/job keys and implementation-level intelligence identifiers presented as customer-facing copy.
REPAIR = ee46edfc introduces direct source-hash lookup for the latest completed report in the authenticated tenant and bounded retries for transient tenant/network/timeout failures.

WHAT_IS_PROVEN = Live tenant f68 source c42 is now consistently generic:inventory across report job, import job, canonical dataset, canonical commit, renderedOutput and Evidence Passport; 342/342 rows and Passport VERIFIED/ACCEPTED/READY/FULL. inventory-intelligence-truth passed on edcb4. Previous release readiness had 19/20 stages pass before the missing import was fixed. Current 942f browser/build/certification are queued/running.
NOT_YET_PROVEN = current-head typecheck/build terminal PASS, current-head authenticated browser visual PASS, and customer-sale certification. Vercel is not a dependency and its current build-rate-limit failure is ignored.

DO_NOT_REPEAT = Do not rebuild; do not delete prior work; do not fabricate unavailable metrics; do not turn REVIEW_REQUIRED into decision-ready; do not reuse stale-SHA PASS; do not weaken browser/security/truth contracts.

NEXT_EXACT_ACTION = Consume 942f current-head Product Build Gate, inventory-intelligence-truth, Browser E2E, Full Product Browser and Final Certification. Fix only the first terminal failure. Then inspect the current Netlify Preview once its deploy status points to 942f.

LANDING_SOURCE_METRICS_20261006 = Source calculations are read from SmartReportDetail.intelligence.calculations only; unavailable values remain unavailable. The authoritative report currently has row.count=332, data.completeness=97.04%, data.numeric.outlier.rate=17.47%, row.duplicate.rate=0%, all source-bound with confidence 1.0.

LANDING_UNIT_FORMAT_FIX = a742ade3d07d7cc3fba6f15b870f2bd91a69cf51 adds explicit source metric units: row count renders as number; completeness/outlier/duplicate render as percentages, not currency.


CURRENT_PRODUCT_TRUTH_FIX_1010F0A7 = Added net_sales/netsales aliases to sales_qty, added warehouse/store/location aliases, excluded 100%-blank fields from archetype qualification, and fail-closed unsupported archetypes to base source intelligence. This is a product behavior change, not a documentation-only claim.

CURRENT_PRODUCT_CLOSURE_20261006 = Dashboard metric units now render from an initialized valueUnit; executive hero priority uses the same selected signal as the primary recommendation; unsupported/blank data cannot qualify an archetype.

CURRENT_UI_FIX_8DE842 = Main Smart Report evidence pills are humanized; raw technical evidence is shown only inside a collapsible audit section.

CURRENT_CODE_FIX_21C4 = Semantic field aliases are translated to official CanonicalField values without widening the schema type.

CURRENT_RUNTIME_FIX_6CC664 = Reports Center reads PRIMARY_SMART_REPORT_SOURCE_HASH directly through fetchLatestSmartReportBySourceHash; catalog enrichment is non-blocking.

CURRENT_LIVE_REPAIR_20261006 = Exact source hash sha256:587f...d6b313 for tenant f68 was reclassified from generic:sales to generic:inventory across report job, import job, canonical dataset/commit, rendered outputs and Passport lineage. No other tenant/source was touched.

LIVE_DATA_REPAIR_20261006 = Tenant f68 + sourceHash sha256:587f...d6b313 reclassified from generic:sales to generic:inventory with 342 canonical rows. Evidence Passport retained id 07e3cb99-064f-4870-87cc-3d0862263834 and remains VERIFIED/ACCEPTED/READY.

CURRENT_UI_CLEANUP_942F = Kernel implementation title moved to business language; raw calculation ids and Claim Rule/Archetype/Inputs moved to technical proof disclosure. Main customer surface no longer presents these as the primary story.
