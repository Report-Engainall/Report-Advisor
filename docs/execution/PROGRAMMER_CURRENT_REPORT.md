SESSION HANDOFF = READY
PROGRAMMER_REPORT_STATUS = ACTIVE_EXECUTION
CURRENT MAIN HEAD = 21586845371893a381e93721a0fc1de6de20eee7
REFERENCE START HEAD = 21586845371893a381e93721a0fc1de6de20eee7
CURRENT EXECUTION HEAD = 2e49dd940e93b9289793673594e7859c6731a16f0
REPORT_FOR_HEAD = 2e49dd940e93b9289793673594e7859c6731a16f
BRANCH = fix/generic-smart-report-cross-surface-20261008
PR = #906
UPDATED_AT = 2026-10-08T17:55:00+03:00

WHAT_I_WAS_ASKED_TO_DO = Continue from current main without rebuilding; make generic file intelligence persist into Smart Reports, connect the result to customer-facing screens, and close certification/browser proof gaps.

OBJECTIVE = Any uploaded source -> extraction -> generic or specialty truth -> evidence -> signals -> findings -> recommendation -> measurement -> decision/action, with the same reportJobId/sourceHash lineage across the customer journey.

WHAT_I_ACTUALLY_DID =
- Added a canonical adapter in src/lib/report-smart.ts that reconstructs a Dataset from the authoritative source-analysis metadata plus canonical rows and invokes buildGenericFileIntelligence when no business specialty is inferred.
- This moves risk/action language, dates, numeric evidence, generic findings, recommendation, measurement, and evidence boundary from the preview-only path into the persisted Smart Report intelligence object.
- Added a visible GenericFileIntelligenceCard to SmartReportPage for generic reports, using the same report.intelligence object consumed by the existing intelligence/advisory surfaces.
- Aligned scripts/check-phase11-e2e-performance-closure.mjs with the actual 950KB critical asset ceiling while retaining the 600KB largest-JS-chunk ceiling.
- Added a smart-report contract assertion for the generic intelligence surface.

WHAT_IS_PROVEN =
- Current main 21586845371893a381e93721a0fc1de6de20eee7 has a successful Product Build Gate, proving typecheck/build plus the existing smart-report/customer-facing contracts on the exact main HEAD.
- The old Final Certification failure on main was reproduced from Actions: PHASE11_E2E_PERFORMANCE_CLOSURE_FAIL because the gate expected 900KB while scripts/check-performance-budget.mjs defined 950KB.
- The old Full Product Browser E2E failure on f0e0d844 was caused by a missing normalizer.js import and then cascading missing actor env; the current report-smart-insights.ts import now points to normalizer.js and must be freshly certified at this branch head.
- No production-current claim is made.

FIRST_ACTIVE_FAILURE = The corrected XML guard still failed its regression because the outer-container fallback stopped scanning before materializing repeated child records; the new patch now materializes repeated nested records. Browser also failed the Node intelligence runtime because report-smart-insights.ts referenced normalizer.js; the import now points to normalizer.ts.
ROOT_CAUSE = Generic intelligence was not persisted for specialty-null reports; certification budget was stale at 900KB; XML fallback needed explicit repeated-child row materialization; browser Node runtime needed a TypeScript normalizer import.
NEXT_EXACT_ACTION = Re-run exact-head Product Build, Quality, Full Product Browser E2E, then Final Certification on the repaired head; merge only on terminal PASS and prove same-head production.

OBJECTIVE = Real source -> readable report -> evidence -> intelligence -> decision chain -> browser proof -> certification, with no fabricated outcomes or benchmark values.

WHAT_I_ACTUALLY_DID = Merged #905: expanded the file engine for common generic formats, added source-agnostic content intelligence and a visible generic intelligence card, and added a regression contract for TXT/XML/YAML/RTF.

WHAT_IS_PROVEN = PR #905 merged into main at 555b8b1865978ca7054537c7f23e579671c2e465. Final Execution Batch passed 30/30 deterministic gates; UI route completeness, storage tenant isolation, and PDF structured parser regression passed on the same HEAD. Netlify PR preview #905 passed and publicly rendered the file-analysis surface. Vercel remains blocked by the Free deployment/build-rate limit.

ROOT_CAUSE = The external file-analysis surface had advertised broad format support while several common formats were still rejected by the parser switch and TXT/Markdown were routed through CSV parsing; PR #905 closes that gap with conservative parsers plus source-agnostic intelligence while retaining fail-closed evidence boundaries.
FIRST_ACTIVE_FAILURE = The Session Handoff Contract initially failed because persisted execution docs still referenced older HEADs after #905; this checkpoint aligns the state/report with the current application HEAD. Vercel remains an infrastructure limit, not an application failure.

NEXT_EXACT_ACTION = Consume fresh current-head quality/typecheck/build and certification/browser results for the post-#905 main; then prove same-head production deployment. Treat Vercel Free-rate failure as infrastructure-only.

CHANGED_FILES_ACCOUNTED_FOR = PR #884 src/pages/ReportsPage.tsx; PR #886 scripts/real-business-e2e.mjs; PR #887 strict TypeScript import specifiers + archetype evaluator Array access across 11 runtime files.

CURRENT PRODUCT HEAD = 11c4abca93802053de2ace699328f74795993114
LATEST PRODUCT CHANGE = PR #889 merged: active report lineage is now carried through intelligence → Advisor → decision → work → replay → benchmark → trust, with an E2E contract.
PROOF STATE = Netlify PR #889 preview READY; exact-head authenticated E2E/build/certification still not terminal; production still old.


## Current execution checkpoint — 2026-10-07
### Exact main
`e33c08c7471f49fac44a14da4fdac7cc651aa297`

### Product closure completed
The active report context now remains attached across the global shell, mobile navigation, command palette, decision journey, and source-bound operating surfaces. The report context card exposes direct links to Command Center, Decision Inbox, Executive Report, Evidence, Intelligence, Advisor Cases, Decision, Work, Replay, Benchmark, and the matching domain report.

### Verified deployment evidence
Netlify previews for PRs #895 and #896 reached READY. The preview surfaces visibly render a real smart-report fixture with actual source rows, signal, recommendation, WHY/SO WHAT, decision state, work guidance, outcome/learning gaps, and benchmark fail-closed behavior.

### Remaining release gate
Production still points at older deploy `6ac3d608e2e37d0008cc0222`. Do not call production current until the published deploy commit is exactly `e33c08c7471f49fac44a14da4fdac7cc651aa297`.


## 2026-10-08 checkpoint — PR #905 source-agnostic file intelligence
### Application result
The external file analysis path now accepts common text/structured formats without forcing a predefined business specialty. It preserves raw line evidence for unstructured content and derives generic intelligence from observed evidence.

### Evidence
- Main application HEAD: 555b8b1865978ca7054537c7f23e579671c2e465.
- PR #905: merged.
- Final Execution Batch: 30/30 deterministic gates PASS on the application HEAD before this governance-only checkpoint.
- UI route completeness: PASS.
- Storage tenant isolation: PASS.
- PDF structured parser regression: PASS.
- Netlify Deploy Preview for #905: READY / public.
### Remaining proof
Quality/typecheck/build, full browser E2E, Final Certification, and same-head production are still open. No production PASS is claimed.
