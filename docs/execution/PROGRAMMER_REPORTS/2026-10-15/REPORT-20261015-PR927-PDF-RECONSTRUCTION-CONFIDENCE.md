# PR #927 — PDF reconstruction confidence and evidence deduplication

Date: 2026-10-15
Repository: Report-Engainall/Report-Advisor
Code checkpoint: 50a121570e8308c52c02726552b36194aded9ab3
PR: https://github.com/Report-Engainall/Report-Advisor/pull/927
Branch: fix/pdf-reconstruction-confidence-20261015
Status at this capture: OPEN / NOT MERGED

## Reproduction
The UI exposed a PDF as 246 records and 2 columns. The columns were organization names rather than proven business fields. The adapter marked them `PDF_TABLE_RECONSTRUCTED:41%`, while generic intelligence generated numeric statistics as though the titles were verified table headings. PDF visual-layout rows also expose `page_number`, `line_number`, `text`, and synthetic `visual_cell_*` projections.

## Root cause and functional fix
- `extractPdfTable` accepted weak header candidates at score 35, so the 41-point organization-title candidate could be accepted.
- The fallback table profile missed layouts with more than two columns and counted synthetic visual helper cells separately from source text.
- The PDF table floor was raised to 55 and the generic analysis layer now recognizes synthetic line layouts, avoids business-table profiling, and uses source-line text only once.

## Regression suite
- `scripts/pdf-visual-line-fallback.test.ts`: expected to prove the 41-point false header is rejected while a known table still reconstructs.
- `scripts/generic-file-analysis.test.mjs`: expected to prove synthetic PDF helper columns do not become business measures or duplicate keyword counts.
- Correction after prior Quality run: that run reported the overall `Behavioral regressions` step as failed, but its live log was not available while the job continued. Source review found a test expectation bug and changed it: the source text `1650000 | 1650000` contains two literal tokens. Correct behavior is keyword count `1650000:2`; the helper fields would inflate it to `1650000:4`. The current-head re-run must confirm the failure is gone.

## Verification boundary
- GitHub readback of code and corrected test: PASS.
- Typecheck on prior head: PASS.
- Session Handoff Contract on prior head: PASS.
- Behavioral regressions on prior head: FAIL; reason awaiting exact-head re-run confirmation, do not conceal.
- Current-head Quality/Build/Final Certification/browser workflows: PENDING.
- Browser proof of re-uploading the user's original PDF: NOT RUN.
- DB/job/sourceHash readback: NOT RUN.
- Production deployment proof: NOT PROVEN.
- Product complete: NO.

## Next exact action
Read the new exact-head PR #927 checks. Confirm Behavioral regressions, Product Build Gate, Quality and Final Certification pass; fix any demonstrated failure without reducing gates. After merge/deployment, re-upload the original PDF and verify source hash/job identity, visible rows, no company-name-as-measure summary, and accurate evidence counts before declaring this issue resolved.
