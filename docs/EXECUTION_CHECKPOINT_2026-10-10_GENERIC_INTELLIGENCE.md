# Execution Checkpoint — 2026-10-10 — Generic Intelligence Across All File Types

## Repository and exact state

- Repository: `Report-Engainall/Report-Advisor`
- Pull request: [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912), open and not merged
- Branch: `fix/source-bound-generic-intelligence-20261009`
- Product code HEAD at entry: `0e3821e960c4138b6073c2ad26fff13b6de8fe9b`
- Documentation checkpoint commit: `3823e34a0b953cd959d8ade4ee87a4228f3493fd` (moves branch head; product logic above remains the exact reviewed code parent)
- Main base SHA from PR metadata: `fa1ab4cbade9b01685507aa966c10f700a03f576`
- Previous historical SHA supplied by user, `ab292d6cfd9ca948b362c0a975cc38cb489ada24`, is stale relative to the live PR head and must not be used for proof.

## Work verified before product continuation

1. GitHub direct writes succeeded. Commit `c951d7228ee1802536c40177f0b22347e7ffb816` changes `netlify/functions/canonical-import-execute.mts` to select `evidence` before recovery and preserve the report `sourceHash`, `sourcePath`, and `importId` in recovered rendered output.
2. Commit `0e3821e960c4138b6073c2ad26fff13b6de8fe9b` adds source-lineage assertions to `scripts/check-report-execution-e2e-contract.mjs`.
3. Both files were read back from the same branch after commits; the expected strings were present.
4. This does not prove the test script executed; no local checkout/runtime execution is available through the GitHub connector itself.

## Current source findings

- `src/lib/report-smart.ts`: generic dataset/intelligence is built, but subsequent eligibility gates can clear the base intelligence and return `emptyReportIntelligence`. Source-derived descriptive analysis should remain visible even when decisions/recommendations are gated; eligibility gates must remain in place for consequential actions.
- `src/pages/SmartReportPage.tsx`: `GenericFileIntelligenceCard` is only rendered when `!report.specialty`, suppressing the general layer when a specialist is inferred.
- `src/pages/ExternalFileAnalysisPage.tsx`: preview general intelligence is also conditional on the absence of an inferred specialty.
- `src/components/GenericFileIntelligenceCard.tsx`: the current card truncates signal evidence to five, and inspection/guidance to eight; it does not yet expose the full available set.
- `src/lib/universal-report-intelligence.ts`: `previewIntelligence` replaces the base/rule-set intelligence object wholesale; that seam should combine compatible general and specialized results instead of selecting one.
- Existing core files must be preserved and repaired at the assembly/display seams; no parallel analysis engine is to be built.

## Live gate snapshot at pre-checkpoint PR head

- Commit combined status: CodeRabbit success; Vercel pending.
- Product Build Gate run `38011206476` was in progress at last read.
- Full Product Browser E2E run `38011206342` was queued, with `browser-e2e` queued. A queued job is not a pass.
- Numerous certification, security, and contract workflows were queued or in progress. Refresh on the next checkpoint; do not infer their terminal states from this note.
- Open adjacent PRs observed: #911 (`e2d1c2736035cf483d0446b5f662a48d49c34cc9`), #909 (`5c691ae4e18e6589e071b2c96cad6f006385b456`), #906 (`7d91d49774f75c3dd64132f8b4193ba3a3642f5b`), and #882 (`84c4e3cd0c7be784ef760d5535bd74708bc5e407`). Review the current diffs for overlap before duplicating existing changes.

## Required next implementation

1. Inspect exact current source ranges and existing tests.
2. Compose the general content-derived analysis with specialist intelligence only when applicable, preserving stable IDs and deduplicating evidence. Do not convert missing/weak data into zero or inflate confidence/quality.
3. Make the Smart Report and uploaded-file analysis UI expose the general layer for both specialized and unspecialized files, and render complete signal/recommendation/evidence sets without arbitrary list truncation; display source identity and bounds.
4. Add executable regression assertions for both specialist and no-specialty routes and for completeness of evidence lists.
5. Test `test:generic-file-analysis`, `test:smart-report-complete-intelligence-surface`, `test:report-execution-e2e-contract`, plus typecheck/build via exact-head GitHub checks. Consume Full Product Browser E2E and verify the same job ID/source hash after navigation/reload before claiming source-bound journey proof.

## Product completion boundary

The product remains **IN PROGRESS**. A static contract, passing build, public preview, or queued browser job alone does not prove the user journey, persisted readback, or source-bound intelligence on varied file formats.

## Exact first action on resume

Read the live PR head/check statuses after the checkpoint commit; then make the smallest source-bound intelligence composition and UI exposure patch, followed by focused tests and a new immutable report. Do not rebuild the platform from scratch.


## Implementation delta — 2026-10-10

Candidate product commit before this documentation writeback: `9caca7cf54c6c9d1d902e694e6fa5906a04890c4` (PR #912; OPEN / NOT MERGED).

- Added `src/lib/report-intelligence/compose-intelligence-layers.ts` to merge general-source results with applicable specialist results, deduplicate on stable IDs, union evidence, retain general-only and specialist-only signals/recommendations, and choose the more cautious health state.
- Updated `universal-report-intelligence.ts`, `ExternalFileAnalysisPage.tsx`, `report-smart.ts`, and `SmartReportPage.tsx` to keep general intelligence available on both preview and persisted routes regardless of specialty.
- Exposed the general layer separately on `SmartReportDetail`, while merging it into the main intelligence object for the other report surfaces.
- Reworked `GenericFileIntelligenceCard.tsx` so all available signals, recommendations, evidence, drivers, findings/risks/opportunities and measurement/owner/limitation fields render without the former 5-evidence/8-inspection truncation. The card accepts source path/hash/job ID and renders them.
- Extended `generic-file-analysis.test.mjs` with merge behavior assertions and `smart-report-complete-intelligence-surface.test.mjs` with specialty-independent exposure, completeness and source-lineage assertions.
- These are code/test changes verified by GitHub write/read operations only. **They are not yet test PASS evidence**; no local runtime is connected through this GitHub-only path, and current-head CI is the next verification source.

### First next action
Refresh PR #912 head and CI at that exact SHA; resolve compilation or focused-test failures first. Then validate varied text/XML/YAML/RTF and XLSX source shapes, followed by authenticated browser/persisted readback of the same report job + source hash across navigation/reload.


## Exact CI frontier and immediate correction — 2026-10-10

- Pre-writeback candidate SHA: `0444faab81a75f222db978040e485c59e23b2839`; PR #912 open and unmerged.
- Latest observed combined status: Vercel `pending`.
- Latest observed PR workflows for that SHA include Full Product Browser E2E run `38011635086` (queued), Product Build Gate run `38011635134` (queued), and Commercial PWA E2E run `38011635125` (in progress). Remaining security/certification runs are largely queued/pending. These are not passes.
- Readback verified the general/specialist composition code, the report runtime composition, the source-bound generic card, and the added runtime/static tests. Tests have not yet been executed; the GitHub connector is the available execution surface in this task.
- One code-quality correction included in the next atomic commit: use an explicit optional-list guard before comparing signal priority-reason length. The surface contract also now verifies that the persisted report's general layer feeds the Universal Intelligence chain.
- Exact next step after this commit: query its own current status/workflow runs; then inspect the first terminal failure from Product Build/Focused/Full Product Browser E2E and correct that failure before considering any release claim.


## Verified build failure and exact source repair — 2026-10-10

- Vercel deployment `dpl_AWB56DhZXAZMCPeTafQ4m5x91KPG` failed on SHA `7c0411b67f366a36fda9ff2c0a29c1f173ed6434`: `src/lib/report-smart.ts:985:39`, `Expected ")" but found "genericIntelligence"`.
- Netlify deploy `6ac98f18d2e77d0008483c23` failed on the same SHA, build script exit code 2. This is a source parse problem, not merely a provider failure.
- The complete damaged region is being replaced from the current file offsets; this restores the warning condition and keeps generic descriptive analysis separate from the specialty eligibility/decision gate. Replacement-region text assertions passed; a successful build is not yet proven.
- Pre-repair source blob `11b7ff70a3911930277537326e5bb49fd36e94b0`; parent SHA `7c0411b67f366a36fda9ff2c0a29c1f173ed6434`.
- Next action: read the new commit and its deploy/build results. If parsing/build succeeds, inspect TypeScript/focused tests and then source-bound Full Product Browser E2E. No PASS is pre-claimed.
