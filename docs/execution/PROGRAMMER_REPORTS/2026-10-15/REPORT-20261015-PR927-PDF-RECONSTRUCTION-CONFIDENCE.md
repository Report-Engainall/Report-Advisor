# PR #927 — PDF reconstruction confidence and evidence deduplication

Date: 2026-10-15
Repository: Report-Engainall/Report-Advisor
Code checkpoint: 45123ea3241faa46749bac6df394c31bddd2794a
PR: https://github.com/Report-Engainall/Report-Advisor/pull/927
Branch: fix/pdf-reconstruction-confidence-20261015
Status: OPEN / NOT MERGED

## Reproduction
The UI exposed `المديونيه المستحقه 24-9-2026.pdf` as 246 records and 2 columns. The column headers were organization names, mapping was 0/2, yet the adapter marked the reconstruction `PDF_TABLE_RECONSTRUCTED:41%` and the generic analysis calculated arithmetic results as if the PDF table structure were proven.

## Root cause and fix
1. `extractPdfTable` accepted detected headers at score 35; this fixture's organization-title pair scores 41.
2. Visual PDF fallback stores both a `text` source line and `visual_cell_*` helper columns, which previously let the generic profile count the same source tokens multiple times and mislabel the layout as a business table.
3. Raise the structured table floor to 55. Keep low-confidence rows as original page/line evidence. Treat the synthetic layout as text-first evidence, not a business table, and analyze the `text` field once.

## Tests and CI correction
- PDF parser regression reproduces the 41-point false header and asserts no table reconstruction; it retains positive coverage for a known good header.
- Generic regression checks that `1650000 | 1650000` is counted twice from the source `text`, rather than four times when the same values are counted again through helper cells.
- First Quality run on `2d4f46f7c1cb0f4193e60ad6a2de3c782555b69a` failed on the added count assertion, expecting four source occurrences. The log confirmed the assertion; the fixture actually has two. Fixed to `1650000:2`.
- Quality workflow's Behavioral regressions stage now calls `npm run test:pdf-visual-line-fallback`, so the actual confidence-gate regression is explicitly run during mandatory Quality.

## Verification boundary
- Code, corrected test and quality-workflow invocation: GitHub-readback-proven.
- Typecheck on the previous head: PASS.
- Previous overall Quality run: FAIL due the wrong test expectation (corrected at this checkpoint).
- Current exact-head behavioral test, Product Build Gate, Quality, Session Handoff, Final Certification and browser E2E: PENDING.
- Original PDF re-upload/browser proof and DB/job/sourceHash readback: NOT RUN.
- Production deployment proof: NOT PROVEN.
- Product complete: NO.

## Next exact action
Inspect the exact-head CI and browser results for PR #927. Confirm the corrected source-occurrence count and the new PDF regression pass, fix any remaining failure without bypasses, and only then proceed through required merge/deploy gates. Re-upload the original PDF on the live app to verify its current source-bound result before declaring resolution.
