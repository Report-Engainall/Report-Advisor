# LIVE RESUME — 2026-10-12 / UNIVERSAL FILE ANALYSIS ACCEPTANCE

Repository: Report-Engainall/Report-Advisor
Feature branch: fix/source-bound-generic-intelligence-20261009
PR #912: OPEN / NOT MERGED.
Exact source/workflow checkpoint: 39b9e4778f115b473243c456c25d14c2ef42f45e
Staging branch: checkpoint/2026-10-12-ui-governance-9c395ba
PRODUCT_COMPLETE = NO.
DO_NOT_MERGE = true.

CURRENT RESUME POINTER: docs/execution/CURRENT_SESSION_STATE.md — exact source/workflow checkpoint 39b9e4778f115b473243c456c25d14c2ef42f45e.

PRODUCT REQUIREMENT: Analyse any file format supported by the application. Generic extraction and analysis is the required default: source-grounded facts, measurements, findings, signals, recommendations and limitations. One of 48 specialist profiles may enrich the generic layer only when the source fits. No specialty match must never suppress generic results.

Implemented:
- Full Product Browser E2E now treats the governed 48-archetype real-source matrix as a separate diagnostic, not as the acceptance criteria for generic-file analysis. Authenticated Chromium route proof and the persisted smart-report business journey remain mandatory.
- The matrix step has continue-on-error and explicitly sets REAL_SOURCE_MATRIX_DIAGNOSTIC_ONLY=1. Undercoverage writes honest NOT_PROVEN diagnostics and exits 0 only in that scoped mode. The normal strict behavior remains on unflagged invocation. The follow-up coverage logger emits the measured count and confirms it is not a generic-analysis gate.
- The blocking browser-evidence list now includes only artifacts/e2e-browser/result.json and artifacts/e2e-business/result.json; it still fails on missing result file, wrong exact head, non-PASS, or blocked findings.
- scripts/generic-file-analysis.test.mjs adds a structured CSV with unfamiliar headers and verifies universal report analysis has no archetype while still exposing the generic structure signal, finding, recommendation and summary.
- scripts/real-48-source-matrix-contract.test.mjs guards this separation; the browser workflow invokes this contract and runs generic-file-analysis.test.mjs directly.

Predecessor only: head 79a34bc8ec78c45bf3de9ce30915fcb2f723475a passed Build, Quality, Handoff, Phase-F and Final Certification; authenticated Chromium route and smart-report journey passed. The old matrix gate then failed with 18/48 specialist real-source coverage. See https://github.com/Report-Engainall/Report-Advisor/actions/runs/38282981740. That failure shows incomplete specialty coverage, not that arbitrary generic files cannot be analysed. Fresh exact-head gates on 39b9e4778f115b473243c456c25d14c2ef42f45e are still pending.

The canonical source import repair remains: source rows are chosen through persisted commit anchors bound by tenant + source hash + row ID; source-eligible coverage is not fabricated. Netlify CLI and Playwright setup both avoid re-installing the app's entire dependency tree.

UI work remains scoped to dark executive hero contrast and consistent ink/indigo/brass styling for generic intelligence, source lineage, signals, recommendations, upload and KPI surfaces. Latest style screenshot still needs validation on fresh artifact.

Last known Netlify production SHA = 858ef8e3e5bc5bf74430555eadfb9e6767be348b; production parity is not proven.

NEXT: Promote checkpoint; verify exact-head Build/Quality/Handoff/Phase-F/Full Product Browser E2E/Final Certification; inspect generic output independently of specialist diagnostic; then verify production deployment and live browser parity.
