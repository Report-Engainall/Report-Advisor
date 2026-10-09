SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT_EXACT_HEAD = 7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b
CURRENT_MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT_EXECUTION_HEAD = 7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912
CURRENT_PR_HEAD = 7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b
UPDATED_AT = 2026-10-10T00:20:00+03:00
PRODUCT_COMPLETE = NO

## CURRENT EXECUTION CHECKPOINT — 2026-10-10 — PR #912

### Exact repository state
- Repository: https://github.com/Report-Engainall/Report-Advisor
- Branch: `fix/source-bound-generic-intelligence-20261009`
- PR: https://github.com/Report-Engainall/Report-Advisor/pull/912 (OPEN; NOT MERGED).
- Application/code head covered by this report: `7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b`.
- main at read time: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- The prior live state incorrectly recorded `b40e6a1462ca8b660c8f4e07461132b0da7bccbb`; that is a historical predecessor, not the live PR HEAD.
- This governance writeback covers `7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b`; after its docs-only commit, checkouts may advance to that new commit, while the application code head remains `7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b` unless code is changed.

### Work actually implemented on PR #912
- The existing source-bound generic report intelligence, canonical import, tenant guards, source lineage, smart-report catalog/details and decision/action infrastructure were preserved; no app reset/rebuild occurred.
- Commit `6f67a2ec558c08f4ea6af36c95dac56dadb0a14f` fixed four real-business-browser E2E checks that chose a hidden duplicate `EVIDENCE PASSPORT` text instead of the visible details summary/source-bound decision chain.
- The same commit passes the real report owner company ID and dedicated corpus tenant ID to Device-Independent Browser E2E actor provisioning. AuthGate, RLS and tenant authorization were not weakened.
- Commit `7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b` updates the static customer-facing contract to require the dedicated visible-proof helper and forbid the ambiguous selector. The previous contract itself caused Product Build and Final Certification to fail after the first fix; the contract and browser locator now describe the same proof.
- Commit links:
  - https://github.com/Report-Engainall/Report-Advisor/commit/6f67a2ec558c08f4ea6af36c95dac56dadb0a14f
  - https://github.com/Report-Engainall/Report-Advisor/commit/7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b

### Root cause and end-to-end evidence
- The public `/try-report` and `/import/analyze` pages are intentionally local analysis/preview surfaces; they do not persist a canonical report by themselves. The canonical write path remains `/import`, protected by AuthGate and active-company context.
- A previous authenticated browser run did create a real canonical import/report record and then read it back from Supabase. Exact recorded lineage from that run (code head `31cba40866569c6bdb6e53ce970b7b87901d1e5b`): report job `16709d80-e012-40ef-9c12-6fd8255897f8`; import job `1e68460b-f181-4f09-a4fe-d6a58be1fb18`; file record `c2d392e0-9b5c-4781-82b8-758680586524`; tenant/company `99e33354-cc45-4317-8eb3-0d486b6c5932`; source `تقارير ادارية.xlsx`; source hash `sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313`; 332 source/canonical rows; quality 98; evidence `VERIFIED`; render checkpoint recorded. This is persisted-data/readback evidence from the prior code head, not current-head browser proof.
- That browser run then failed its UI assertion because Playwright selected a hidden duplicate `EVIDENCE PASSPORT` string before reaching the visible details summary. The failure was test-locator selection, not evidence that the saved DB record was absent. The locator is now corrected, but fresh exact-head browser completion is still required.
- A separate device-independent setup mismatch selected the synthetic tenant A instead of the report owner. Its fail-closed access denial was correct behavior; actor provisioning now explicitly receives the report's owner ID.

### Unified completion checklist (status at time of writeback)

| Track / gate | Status | Evidence / constraint |
|---|---|---|
| Core contracts and tenant/source guards | PASS on preceding head; rerun queued for current head | Route, company context, source lineage and security contracts have passed on earlier exact head; re-run links below |
| Universal generic intelligence + Arabic XLSX regression | PARTIAL | Generic intelligence surfaces/contract checks pass on preceding head; Arabic semantic XLSX regression exists. Arbitrary unknown-format business interpretation is not certified for every source. |
| Visible RTL smart-report UX | IMPLEMENTED; BROWSER NOT YET PROVEN on current head | Smart Report has executive, decision-chain, source/evidence/passport and generic intelligence surfaces; exact end-to-end screenshot assertion needs fresh run. |
| Persisted report DB/readback | PASS on prior E2E source head | Exact sourceHash/job/import/file IDs above; must reproduce after fix on current code head. |
| Reports catalog to detail navigation | IMPLEMENTED; E2E proof pending | Paged tenant-scoped catalog and source-hash-bound detail route exist; fresh run must pass after refresh. |
| Auth user with active company membership | PARTIAL | AuthGate and import path require active tenant; previous E2E created persisted report. Fresh current-head full customer flow pending. |
| Auth user without membership | STATIC FAIL-CLOSED UI PRESENT; LIVE BROWSER NOT PROVEN | AuthGate gives Arabic `NO_MEMBERSHIP` vs unresolved tenant state; no default company is selected and protected data remain blocked. |
| Core build / quality | PASS on preceding head; rerun queued on current head | Prior build caught one stale static E2E-selector contract, now updated in `7a91d7c`; only fresh current-head pass closes it. |
| Session handoff contract | FAILED on preceding head due stale docs; docs being synchronized here | Error listed unreported changes in the E2E/workflow files and stale state/report files; new report anchors to `7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b`. |
| Full Product Browser E2E | FAIL on previous head at hidden-text locator; rerun queued | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37991603810 is prior-head run; current head run is queued. |
| Device-Independent Browser E2E | Smoke PASS; authenticated job not proven on previous head | Previous smoke passed; current workflow now explicitly provisions actor for report-owner tenant. Fresh run queued. |
| PDF parser | PASS on preceding head | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37991603631; this is predecessor evidence, not full PDF→persisted-report proof. DOCX live E2E remains unproven. |
| Phase F live resilience | FAIL-CLOSED on preceding head (3/4) | Health, tenant canary and rollback drill passed; backup/restore failed because unauthenticated Docker Hub pull limit blocked `postgres:17`. Keep certification NOT READY until resolved. |
| Preview deployment | READY on `6f67a2e`; new `7a91d7c` deploy pending | Previous exact deploy had source/build/deployment SHA `6f67a2e...`; current preview must match `7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b` or a later code head. |
| Production deployment | FAIL / stale | Published production deploy is still `858ef8e3e5bc5bf74430555eadfb9e6767be348b`, not current main `fa1ab4cbade9b01685507aa966c10f700a03f576` and not PR head. |
| Product complete | NO | Full current-head browser, full matrix, all mandatory gates, and same-head production proof are not yet established. |

### Required source-format / scenario matrix (honest status)
- A. Arabic customer/monthly purchases workbook with totals: `PARTIAL` — Arabic XLSX semantic regression exists; current exact-head live upload of a customer-supplied purchases workbook is not proven.
- B. Different numeric domain: `NOT PROVEN` in the current authenticated browser matrix.
- C. CSV: `NOT PROVEN` as a current-head upload→persist→refresh→catalog flow.
- D. PDF/DOCX text extraction: PDF structured parser regression passed on a predecessor head; PDF/DOCX both through a fresh persisted browser report are not proven.
- E. Empty/corrupt file: `NOT PROVEN` in current live browser matrix; should reject with clear state and no false report.
- F. Known business report with UNKNOWN archetype: generic fallback exists in the code; a current-head stored-report browser proof is `NOT PROVEN`.
- G. Authenticated user without company membership: Arabic fail-closed gate exists; live browser proof `NOT PROVEN`.
- H. Same-file duplicate and new hash: company-scoped duplicate branch and source lineage exist; current browser readback proof `NOT PROVEN`.
- I. Empty catalog then catalog with persisted report: paged catalog and navigation exist; live current-head empty→populated proof `NOT PROVEN`.
- J. Open persisted report after reload/relogin: database readback was proven on the prior head; end-user visible refresh assertion needs passing E2E on the current head.

### Exact-head CI references
All current-head checks must be checked again against `7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b`; anything on `6f67a2e` or older is predecessor evidence only.
- Current quality run: queued — https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992079243
- Current session-handoff run: queued at initial read — https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992079425
- Current device-independent E2E: queued — https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992079360
- Current full product E2E: queued — https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992079418
- Current final certification: queued — https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992079438
- Current Phase F: queued — https://github.com/Report-Engainall/Report-Advisor/actions/runs/37992079352
- Preview deploy for current head: pending — https://app.netlify.com/projects/aghbari-report-advisor/deploys/6ac958e582271500089f4ad3

### DO NOT REPEAT
- A local preview is not a persisted report.
- DB readback does not prove visible browser result.
- queued is not PASS; preview is not production.
- Do not weaken AuthGate, RLS, membership checks or tenant isolation to make tests pass.
- Do not claim support for a format without its extraction proof.
- Do not claim product completion while the live matrix, current-head browser and production proof are open.

NEXT_EXACT_ACTION = Re-read CI, browser artifacts and Netlify preview on the newest PR HEAD; fix the first terminal current-head failure, rerun all mandatory gates on that SHA, then prove report readback/catalog/detail/reload and only afterwards align and smoke-test production.
DO_NOT_MERGE = true
