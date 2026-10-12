# LIVE RESUME — 2026-10-12 / UNIVERSAL FILE ANALYSIS CI REPAIR

Repository: Report-Engainall/Report-Advisor
Branch: fix/source-bound-generic-intelligence-20261009
PR #912: open, not merged.
Exact source/workflow head: 03b7abc87932db59c38f83be0b6d4b8e1ae5512a
PRODUCT_COMPLETE = NO.
DO_NOT_MERGE = true.

CURRENT RESUME POINTER: docs/execution/CURRENT_SESSION_STATE.md — exact code/workflow checkpoint 03b7abc87932db59c38f83be0b6d4b8e1ae5512a.

Product goal: analyse any supported file using source-bound generic intelligence even when none of the 48 specialist archetypes applies. The 48 profiles remain optional enrichments; they are not the supported-file catalog.

Latest changes:
- Full Product Browser E2E: specialist real-source matrix runs as optional diagnostic; universal browser blocking set includes the authenticated route and business/smart-report report results only.
- Generic test uses a structured unclassified CSV to check generic signals/findings/recommendation/summary without any specialist match.
- Added workflow-matrix separation contract and updated customer-facing surface contract to expect the new optional-diagnostic naming/behavior. It no longer requires the 48 matrix to be the universal blocking gate or require supported=48.
- Generic test command uses node --experimental-strip-types --experimental-loader ./scripts/node-ts-extension-loader.mjs, preventing ERR_MODULE_NOT_FOUND for project TypeScript ESM imports.
- The matrix's diagnostic-only mode remains explicitly scoped by REAL_SOURCE_MATRIX_DIAGNOSTIC_ONLY=1. Default matrix calls still fail nonzero if specialist coverage is below 48.

First new-head failure from E2E run 38285830008 on head 4320906d…:
1. Run canonical heart regressions failed because scripts/customer-facing-report-surface-contract.test.mjs still expected the old 48-source gate.
2. Validate generic file intelligence failed with ERR_MODULE_NOT_FOUND for report-smart-insights.js because the direct test command omitted the TS extension loader.
Both causes are addressed in the new source head 03b7abc87932db59c38f83be0b6d4b8e1ae5512a; next CI must verify them.

Prior source-bound browser proof on predecessor 79a34bc8…: Build, Quality, Handoff, Phase-F, Final Certification passed; authenticated browser route and smart-report journey passed; specialist real-source coverage remained 18/48 and was NOT_PROVEN. It is not a generic engine failure. Predecessor E2E: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38282981740.

Latest production SHA remains 858ef8e3e5bc5bf74430555eadfb9e6767be348b. UI polish is not yet screenshot-proven on a current production deploy. Do not claim PRODUCT_COMPLETE until new head CI and live deployment/browser proof are verified.

NEXT: Read the fresh Build/Quality/Session Handoff/Phase-F/Full Product Browser E2E/Final Certification runs for 03b7abc87932db59c38f83be0b6d4b8e1ae5512a. Confirm generic file regression passes, then check actual uploaded evidence while treating the 48-profile matrix as separate diagnostics.
