# PR #927 — PDF reconstruction confidence and evidence deduplication

Date: 2026-10-15
Repository: Report-Engainall/Report-Advisor
Code checkpoint: 4ba8cd5073838f5a469f7a527a217cdcf1cc30a0
PR: https://github.com/Report-Engainall/Report-Advisor/pull/927
Branch: fix/pdf-reconstruction-confidence-20261015
Status at capture: OPEN / NOT MERGED

## Reproduction
The UI exposed a PDF as 246 records and 2 columns. The columns were organization names rather than proven business fields. The adapter marked them `PDF_TABLE_RECONSTRUCTED:41%`, while generic intelligence computed arithmetic summaries as if the names were measure headers. The fallback line dataset also carries `page_number`, `line_number`, `text` and synthetic `visual_cell_*` projections; the generic layer previously treated the projections as independent content.

## Root cause
`extractPdfTable` accepted a detected header candidate at score 35, so the reported 41-point candidate could be accepted. The generic table profile only excluded synthetic line datasets with at most two columns and missed the PDF layout with multiple `visual_cell_*` columns.

## Change
1. Reject table candidates below score 55; keep weak layouts on the page/line evidence fallback.
2. Recognize synthetic line layouts with page and line ordinals, a source text field, and visual helper cells.
3. Use the source line field exactly once in generic text profiling and do not generate business-table statistics for synthetic visual layouts.
4. Add regressions for the 41-point company-title candidate, preserving a known reconstructable table, and avoiding duplicate metric evidence from synthetic helper cells.
5. Correct the source-occurrence assertion: the two sample data rows contain two appearances per row (four literal occurrences), while helper-cell double counting would produce eight.

## Verification boundary
- GitHub branch and changed-file readback: PASS.
- Functional code checkpoint: READBACK-PROVEN.
- Local behavioral tests: NOT RUN in this connector session.
- Exact-head CI on the documentation-only successor: PENDING.
- Browser proof of re-uploading the user's original PDF: NOT RUN.
- DB/job/sourceHash readback: NOT RUN.
- Production deployment proof: NOT PROVEN.
- Product complete: NO.

## Next exact action
Read exact-head Quality, Product Build, Session Handoff and Final Certification results for PR #927. Fix any failed test at its root cause without bypassing gates. Only after required checks pass, merge through the normal review/gate process and re-run the user's source PDF in the live UI; verify source hash/job identity, page/line evidence, table status, and no invented measures before declaring resolution.
