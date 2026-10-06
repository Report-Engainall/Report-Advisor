SESSION HANDOFF = READY
UPDATED_AT = 2026-10-06T22:04:00+03:00
CURRENT_EXACT_HEAD = 667ca0b635c3b69b0a1766dc82ffd009928c8a5c
CURRENT_EXACT_PRODUCT_HEAD = e18d3f5405663244e30014049e8de580ea354b48
CURRENT_MAIN_HEAD = a6d034e05172189d278e689eb01a0c86454f529e
PR_BASE = a6d034e05172189d278e689eb01a0c86454f529e
BRANCH = fix/real-data-visible-surfaces-20261006
PR = #855
ACTION_STATUS = ACTIVE_EXECUTION_BUILD_BROWSER_CERTIFICATION

FIRST_ACTIVE_FAILURE_1 = Exact-head authenticated Chromium showed the Smart Report itself rendered real data, while the landing route failed to settle because the broad Smart Report catalog read emitted TypeError: Failed to fetch during auth/session convergence.
ROOT_CAUSE_1 = Landing depended on a 60-item Smart Report catalog fan-out before reading the designated source; transient/network timeout during that fan-out prevented the primary card from painting.
REPAIR_1 = ee46edfcfb72fe6eade0bf04348fb792a4877f61 changes the landing to read the current report directly by source hash, with bounded retries for TENANT_REQUIRED, Failed to fetch, and REPORT_UI_TIMEOUT.

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
REAL_SOURCE_JOB = c42fb0e1-75f2-4727-8c3e-470ae1a804fa
REAL_SOURCE_HASH = sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313
REAL_SOURCE_ROWS = 342
REAL_SOURCE_QUALITY = 87
REAL_SOURCE_EVIDENCE = VERIFIED / READY / ACCEPTED
REAL_KERNEL = stock=23075 | demand=324250 | baseline_coverage=0.0711642251 | demand_plus_15_coverage=0.0618819349 | anomalies=3 | scenarios=1 | sensitivities=2 | status=REVIEW_REQUIRED
CALCULATION_PERSISTENCE = 31 rows / 23 distinct metrics / 15 CALCULATED / 16 NOT_AVAILABLE, all 31 evidence-linked.
OPEN_REPORT = d074ad5c-70d4-4402-a763-01129786f392
OPEN_REPORT_SOURCE = فواتير العملاء من تاريخ 01-01 حتى 30-08-2026.pdf
OPEN_REPORT_HASH = sha256:f68f77f641cb54bbc30b9ece0ed9516700cb5ae48b6cbfb5b52317a8360faf10
OPEN_REPORT_DB_STATE = completed / rendered
OPEN_REPORT_CANONICAL_ROWS = 6776
OPEN_REPORT_CANONICAL_COMMITTED = 6776

WHAT_IS_PROVEN = Tenant f68 report c42 remains generic:inventory across report/import/canonical/rendered/evidence layers, 342/342, Passport VERIFIED/ACCEPTED/READY/FULL. Import-domain truth is now enforced client-side, server-side after authoritative parse, and in recovery rendering.
CHANGED_FILES_88C75 = scripts/check-executive-dashboard-ui-contract.mjs
CHANGE_88C75 = Replaced stale assertions requiring fetchDashboardSnapshot/fetchDashboardIntelligence with source-bound Smart Report contract assertions and explicit negative assertions against those legacy calls.
WHAT_IS_NOT_YET_PROVEN = Fresh product-build PASS, authenticated browser visual PASS, Full Product Browser PASS, Final Certification PASS, customer-sale readiness.
DO_NOT_REPEAT = No rebuild; no synthetic truth; no weakening trust/security/browser contracts; no stale-SHA PASS reuse; no generic source/job selection.
NEXT_EXACT_ACTION = Consume fresh Product Build, Session Handoff, Netlify Preview and browser/certification terminals for e18d. Fix only the first new terminal failure.


RUNTIME_REPAIR_6DBD674 = Dashboard landing no longer depends on get_dashboard_snapshot; Calculation Persistence tenant mismatch is fail-soft and remains database/RLS constrained.


PRODUCT_FIX_F292BF63 = Smart Report ReportRecommendation contract is now kept separate from legacy dashboard Recommendation rows; first source recommendation is rendered from the verified report context.

VISUAL_PROOF_88C75 = Artifact 11429020660 contains 35 screenshots; Smart Report route visibly rendered the real report 16709d80-e012-40ef-9c12-6fd8255897f8, source تقارير ادارية.xlsx, 332 rows, evidence/truth context and decision flow, while landing screenshot remained loading.

LANDING_SOURCE_METRICS_20261006 = Source calculations are read from SmartReportDetail.intelligence.calculations only; unavailable values remain unavailable. The authoritative report currently has row.count=332, data.completeness=97.04%, data.numeric.outlier.rate=17.47%, row.duplicate.rate=0%, all source-bound with confidence 1.0.

LANDING_UNIT_FORMAT_FIX = a742ade3d07d7cc3fba6f15b870f2bd91a69cf51 adds explicit source metric units: row count renders as number; completeness/outlier/duplicate render as percentages, not currency.


CURRENT_PRODUCT_FIX_65471FD = truth-field aliases + blank-field archetype gating + unsupported-archetype fail-closed + DashboardPage valueUnit initialization + executive-priority alignment.

CURRENT_PRODUCT_FIX_488FA = Semantic aliases now bridge real source fields to business-question canonical vocabulary.
CURRENT_PRODUCT_FIX_EFACF = Unsupported archetype output fails closed; evidence-boundary contract updated to protect that behavior; Netlify preview 855 is READY.

CURRENT_UI_FIX_8DE842 = Customer-facing evidence labels are humanized; raw evidence strings are kept behind a technical audit disclosure.

CURRENT_CODE_FIX_21C4 = Legacy report field names are translated to official CanonicalField schema values only; the union type is not widened.

CURRENT_RUNTIME_FIX_6CC664 = Direct source-hash-bound Smart Report is read independently from the 60-item catalog; catalog is enrichment only.

CURRENT_LIVE_REPAIR_20261006 = The sourceHash sha256:587f...d6b313 is now classified consistently as inventory across canonical data, commit, report job, import job, renderedOutput, and Evidence Passport.

CURRENT_UI_CLEANUP_942F = Customer-facing intelligence no longer labels the primary surface as AGHBARI INTELLIGENCE KERNEL or exposes Claim Rule/Archetype/Inputs as primary content; technical details remain available behind proof disclosure.

CURRENT_IMPORT_DOMAIN_GUARD_20CC = Server canonical import validates inferred domain after authoritative parsing; generic source-data is upgraded or conflicting generic domains are rejected before canonical durable write.

CURRENT_IMPORT_DOMAIN_GUARD_14CAA = Server persists authoritative inferred domain into import_jobs before canonical durable execution; conflicts are rejected instead of written.

CURRENT_UI_CLEANUP_20261006 = Removed visible N/A technical placeholders from Report Intelligence drivers; translated Smart Report status keys and Trust/Evidence hero labels into business Arabic; replaced raw decision activity identifiers with business-readable labels while preserving audit records.

HANDOFF_SYNC_20261006_974C = Programmer report checkpoint now covers the ExecutiveReportPage source-binding repair; the current exact head is the checkpoint commit above and product head remains bd21908.

TYPECHECK_CLOSURE_667 = Product Build's reported TypeScript failures are corrected in product head e18d; current exact session checkpoint is this commit.
