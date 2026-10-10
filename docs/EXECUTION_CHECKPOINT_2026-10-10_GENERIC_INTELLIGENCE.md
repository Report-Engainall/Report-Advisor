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
