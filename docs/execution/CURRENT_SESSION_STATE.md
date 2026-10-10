SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = 87fe4f3f28d0c81be5f2547fe56c87ec0c5d3489
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
APPLICATION_CODE_HEAD = 87fe4f3f28d0c81be5f2547fe56c87ec0c5d3489
REPORT_BASE_HEAD = 2495372e2b7bfc89042f435274c1cde4e4511bec
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T16:50:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume the terminal current-code Product Build Gate and browser results, establish an actual passing generic multi-format runtime matrix, then prove upload-to-persisted-readback with the identical reportJobId and sourceHash.

## LIVE EXECUTION CHECKPOINT — 2026-10-10 — CSV heading regression and current test boundary

Application code SHA is `87fe4f3f28d0c81be5f2547fe56c87ec0c5d3489`; the current branch has a documentation-only checkpoint commit `2495372e2b7bfc89042f435274c1cde4e4511bec`. Historical state is preserved below unchanged.
- Implemented and read back: universal text-document detection no longer lets synthetic `line_number/text` fields suppress original TXT/Markdown evidence; generic tables profile every numeric column (count, missing/non-numeric count, sum, mean, min/max and row ordinal); evidence lists in table signals/findings/recommendations and UniversalIntelligenceChain are no longer silently truncated at 3/6/8 items; text examples are bounded at 100 with explicit full match counts and truncation notices.
- Exact-head Quality before the latest fix proved the TXT assertion progressed, then failed CSV row count because `اسم الصنف` was mistakenly penalized as a merged multi-field header. The new header fix exempts valid Arabic/English compound business labels while preserving the merged-header guard; `scripts/check-header-detection.mjs` now has a regression for that real CSV case.
- Current-code header contract run #8635 (`38057053199`) is still in progress at the time of the last poll; prior exact-code header contract #8634 succeeded. Product Build Gate #995 (`38057052776`) is in progress; Full Product Browser E2E #9601 (`38057050078`) is in progress, #9602 (`38057053312`) is pending; Device-Independent Browser E2E #5115 (`38057053229`) is in progress.
- Quality run #11940 (`38057053143`) failed BEFORE behavioral tests: Diagnostics returned exit 1 at the `test -f package-lock.json` step; subsequent `eslint: not found`, missing `node_modules/vite/bin/vite.js`, and missing `dist/index.html` are downstream of the failed preflight/install. GitHub API readback confirms `package-lock.json` exists both at the branch SHA and merge SHA, so this run does not establish a code regression or a passing generic-format test; investigate the exact CI workspace/log before claiming either.
- Netlify deploy preview status for code SHA `87fe4f3...` returned ready at `https://deploy-preview-912--aghbari-report-advisor.netlify.app`; Vercel and a duplicate Netlify deployment event were pending when queried. This preview is not authenticated browser or persistence evidence.
- The Session Handoff Contract failures #2324/#2325 on earlier code head were due to the old report not covering newly changed files. This checkpoint refreshes state/report/archive based on checkpoint SHA `2495372...`; the report-only commit that follows must be tested by Session Handoff Contract again.
- Still not proven: upload + extraction + full UI presentation across multiple source formats, report navigation/reload, or persisted sourceHash/reportJobId readback on the current code. `PRODUCT_COMPLETE = NO`.

SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
REPOSITORY = Report-Engainall/Report-Advisor
PR = #912 OPEN / NOT MERGED
BRANCH = fix/source-bound-generic-intelligence-20261009
APPLICATION_CODE_HEAD = 73c5205f75cc9ecf057ad0c5f956f69bc54b6ebe
PREVIOUS_CODE_CANDIDATE = 0e2fc9b2e7e55a01255cafc1286d4ab0bb506671
DOCS_BASE_PARENT = 73c5205f75cc9ecf057ad0c5f956f69bc54b6ebe
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true

## LIVE CHECKPOINT — 2026-10-10 — test fixture repaired and generic mapping guarded

This report is for application code SHA `73c5205f75cc9ecf057ad0c5f956f69bc54b6ebe`. A documentation-only child commit will advance the PR ref; the app/code SHA above remains the exact tested candidate.

### Code changes
- The general source-derived layer is composed with applicable specialist intelligence across File Lab, the universal intelligence chain and Smart Report; specialist data adds to the general layer instead of replacing it.
- The general-result card exposes every signal, recommendation, finding, risk/opportunity, evidence item, driver, measurement and limitation passed to it. Source path, report job ID and source SHA-256 remain visible/bound.
- Canonical recovery reads stored evidence and preserves sourceHash/sourcePath/importId when recovering the rendered output.
- Generic table classification uses raw source headers to verify customer identity. A guessed `mappedField=customer_name` alone does not cause a customer-portfolio/churn classification.
- The general-file format matrix contains TXT/CSV/JSON/JSONL/XML/YAML/Markdown/RTF plus the reference XLSX. The CSV regression forces `name → customer_name` in mappedField and checks that the raw generic header remains domain-neutral.
- The test’s cut assertion/orphan duplicate tail found on parent `17556d7...` was repaired in `0e2fc9b...`. A second fixture escaping issue was corrected in `73c5205f75cc9ecf057ad0c5f956f69bc54b6ebe`; same-head readback shows the CSV string has two single-backslash `\n` escape sequences, not double-escaped `\\n` sequences.

### Deployment/test status
- Latest code status at last check: CodeRabbit success; Vercel failed with a provider/account `build-rate-limit` target (no current source error reported by that status); Netlify deploy-preview status pending at deploy `6ac9965733e9f700081ad4f5`, source commit `73c5205f75cc9ecf057ad0c5f956f69bc54b6ebe`.
- Exact code-head Actions query for 73c5205f75cc9ecf057ad0c5f956f69bc54b6ebe: 56 runs; 2 completed (both skipped), 48 queued, 6 pending, 0 in progress. Product Build Gate #38013755538 QUEUED; Quality #38013755480 QUEUED; Full Product Browser E2E #38013755671 QUEUED; Data Quality Runtime #38013755732 QUEUED; File Intelligence Security #38013755423 QUEUED; Session Handoff Contract #38013755760 PENDING (older #38013752963 also pending). No terminal focused runtime-test result yet.
- The actual Node test did not yet reach a terminal run, so format-matrix runtime PASS is NOT claimed.
- A public content fetch shows the Arabic `/import/analyze` File Lab landing view. This is not upload/browser/authenticated interaction proof.
- Historical Supabase readback for job `16709d80-e012-40ef-9c12-6fd8255897f8` proves the XLSX source hash exactly equals renderedOutput.sourceHash, source path matches, and 332 canonical rows exist. This is one historic source-bound XLSX record only.

### Remaining proof gaps
- Authenticated upload → completed general analysis → Smart Report → navigation/reload → persisted readback across varied formats NOT PROVEN.
- Separate Phase-F restore/schema blocker involving `public.intelligence_causal_hypotheses` remains unproven closed.
- Adjacent PRs #906/#909 overlap report/card files but do not contain the current composition helper and new regression checks. Do not merge blindly.
- PRODUCT_COMPLETE = NO.

NEXT_EXACT_ACTION = Consume a terminal exact-head Quality/Product Build Gate result for `73c5205f75cc9ecf057ad0c5f956f69bc54b6ebe`; inspect the complete job log and fix the first confirmed failure. Then verify the same jobId/sourceHash through authenticated upload, report render, route navigation/reload and persisted readback.

---

## HISTORICAL STATE BELOW — preserved verbatim

SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
REPOSITORY = Report-Engainall/Report-Advisor
PR = #912 OPEN / NOT MERGED
BRANCH = fix/source-bound-generic-intelligence-20261009
APPLICATION_CODE_HEAD = 0e2fc9b2e7e55a01255cafc1286d4ab0bb506671
CODE_PARENT_HEAD = 17556d7af347502e8fe549c99ed6bb191b1df392
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true

## CURRENT LIVE CHECKPOINT — 2026-10-10 — generic test repaired and raw-source classification guarded

This checkpoint describes exact application-code SHA `0e2fc9b2e7e55a01255cafc1286d4ab0bb506671`. The state/report files are committed in a documentation-only child, so re-read live PR metadata for the current branch ref SHA. Use the exact application SHA above when interpreting code/test results.

### Code changes confirmed by same-head readback
- General source-derived intelligence remains integrated in File Lab, the Universal Intelligence Chain, and saved Smart Report; specialist analysis is composed on top and cannot replace general findings/signals/recommendations.
- Generic card renders the complete lists provided by intelligence (including evidence and limitations), with source path, job ID, and SHA-256 provenance. Canonical recovery selects existing persisted evidence and preserves sourceHash/sourcePath/importId.
- Customer portfolio inference now checks raw source headers. A guessed mappedField such as `name -> customer_name` cannot independently trigger customer/churn specialization.
- At parent `17556d7...`, the runtime test file was malformed by an orphan duplicate fragment following a cut assertion. The whole composition-test section is now restored in `0e2fc9b2e7e55a01255cafc1286d4ab0bb506671`; the orphan fragment is absent in same-head readback.
- The test matrix covers TXT, CSV, JSON, JSONL, XML, YAML, Markdown, RTF and the source-bound 17-column XLSX portfolio. A new case forces generic raw header `name` to mappedField `customer_name` and checks that specialization remains blocked.
- The test file and modified generic intelligence module were both read back from the exact code SHA. This is source proof, not a successful runtime test.

### Build, deployment and CI boundary
- At `0e2fc9b2e7e55a01255cafc1286d4ab0bb506671`, CodeRabbit returned success. Vercel check failed with the account target `build-rate-limit`; this is a provider/account build limit, not a reported source parse error. Netlify deploy-preview check was pending at last read for deploy `6ac99580847b8c0009f4f614`. Do not claim the latest code SHA is deployed until that deploy is confirmed ready.
- Last observed exact-code-head Actions inventory for 0e2fc9b2e7e55a01255cafc1286d4ab0bb506671: 57 runs; 2 completed (both skipped), 48 queued, 6 pending, 1 in progress at first poll. Focus: Product Build Gate #38013524659 QUEUED; Quality #38013525077 QUEUED; Data Quality Runtime #38013524702 QUEUED; File Intelligence Security #38013524449 QUEUED; Full Product Browser E2E #38013524550 PENDING and #38013520555 QUEUED; Session Handoff Contract #38013524498 PENDING. No focused runtime test has a terminal result.
- Public content retrieval of `/import/analyze` confirms the Arabic File Lab landing/entry screen is served. It does not test upload interaction or authenticated pages.
- Historical database readback: job `16709d80-e012-40ef-9c12-6fd8255897f8`, `تقارير ادارية.xlsx`; source_hash and renderedOutput.sourceHash match exactly, sourcePath matches, canonical row count is 332. This is one historical XLSX report only, not a current-head browser pass.

### Still open
- Authenticated upload → complete report → navigate/reload → persisted readback for varied formats is NOT PROVEN.
- Phase-F restore/schema blocker from an earlier head (`public.intelligence_causal_hypotheses`) is still pending.
- Adjacent PRs #906/#909 overlap the affected report/card files but do not contain this branch's current composer/guard test; do not merge blindly.
- PRODUCT_COMPLETE = NO.

NEXT_EXACT_ACTION = Consume the first terminal Quality/Product Build Gate result for `0e2fc9b2e7e55a01255cafc1286d4ab0bb506671`, inspect its full log, and fix the first confirmed failure. Then prove the same report jobId/sourceHash through authenticated upload, Smart Report navigation, reload and persisted readback.

---

## HISTORICAL STATE BELOW — preserved verbatim

# LIVE CHECKPOINT — 2026-10-10 / KEEP GENERIC TABLES DOMAIN-NEUTRAL

- Repository `Report-Engainall/Report-Advisor`, PR #912 OPEN / NOT MERGED, branch `fix/source-bound-generic-intelligence-20261009`.
- Parent branch HEAD verified before this code+report transaction: `789700d2f77dbab841ca5e68bc82aced63cf7717`. Previous application/test HEAD `a077dfebea99f8848b086f0b04dbedf83a2d6b17`; main base `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Material code fix: `src/lib/file-engine/generic-intelligence.ts` now declares a customer-specific portfolio only if actual customer identity aliases exist together with a status column and totals/month data. Generic product/supplier/name+status+total tables remain neutral, rather than being mislabeled customer churn/portfolio.
- Test improvements: `scripts/generic-file-analysis.test.mjs` now asserts CSV/JSON/JSONL/XML/YAML records with item/status/total fields remain domain-neutral; it also proves the generic-only source-status signal and reconciliation recommendation are absent from the simulated specialist layer and survive composition from the general layer. The overlap test still checks both evidence lists are unioned.
- Existing implementation retained: universal report-chain composer, file-lab/general card, persisted Smart Report generic layer, sourceHash/jobId bindings, full result/evidence display and canonical recovery lineage fix.
- Deployment proof prior to this commit: application/test SHA `a077dfebea99f8848b086f0b04dbedf83a2d6b17` was READY on Vercel, and combined statuses were success for Vercel, Netlify deploy-preview and CodeRabbit. This new code fix is not yet build/test proven.
- Exact-head GitHub Actions for `a077dfebea99f8848b086f0b04dbedf83a2d6b17` had a busy queue (Product Build Gate `38012609562` queued, Quality `38012609570` queued, Full Product Browser E2E `38012609619` queued). The newer docs-head cohort was likewise queued. Runtime execution of the expanded format matrix remains unproven.
- No authenticated end-to-end upload→Smart Report→navigate/reload→saved readback is proven; PRODUCT_COMPLETE = NO.
- NEXT EXACT ACTION: consume the first terminal focused test/build result for the new code head; fix only the first confirmed failure, then validate varied-format sourceHash/readback with Full Product Browser E2E.

---



## HISTORICAL STATE BELOW — preserved verbatim

SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
REPOSITORY = Report-Engainall/Report-Advisor
PR = #912 OPEN / NOT MERGED
BRANCH = fix/source-bound-generic-intelligence-20261009
CURRENT_CODE_HEAD = a077dfebea99f8848b086f0b04dbedf83a2d6b17
REPORT_FOR_HEAD = a077dfebea99f8848b086f0b04dbedf83a2d6b17
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T03:15:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true

## LIVE CHECKPOINT — 2026-10-10 03:15

- General intelligence is now composed with applicable specialist intelligence; the specialist layer augments rather than replaces general source analysis. File Lab runs the general analyzer for recognized datasets regardless of specialty. Saved Smart Report returns and renders the generic layer even when a specialty is detected, carries job ID/sourceHash/source path, and keeps specialist eligibility/decision gates fail-closed.
- Generic result card no longer truncates its provided signals, recommendations, findings/risks/opportunities or evidence. Canonical recovery selects stored evidence and preserves sourceHash/sourcePath/importId.
- Syntax issue at ancestor `7c0411b` was fixed by `dee505d`; Vercel build logs show `✓ built in 20.37s`, and the repaired application code is deployed READY. This is deployment proof only, not end-to-end completion.
- New format matrix committed at `a077dfebea99f8848b086f0b04dbedf83a2d6b17`: the generic runtime test covers TXT, CSV, JSON, JSONL, XML, YAML, Markdown, RTF and XLSX, with assertions for source-derived findings/evidence. Test is committed, NOT YET proven executed.
- Current exact-head gate states: Exact-head run state at a077dfebea99f8848b086f0b04dbedf83a2d6b17: 56 Action runs total; 2 completed (one success, one skipped), 49 queued, 4 pending, 1 in progress. Product Build Gate #38012609562 QUEUED; Full Product Browser E2E #38012609619 QUEUED; Quality #38012609570 QUEUED; Data Quality Runtime #38012609428 QUEUED; File Intelligence Security #38012609431 QUEUED; Session Handoff Contract #38012609304 PENDING. Combined statuses: CodeRabbit success, Vercel pending, Netlify deploy-preview pending.
- PR #906/#909 overlap the affected report/card/test paths, but their checked branch contents lack the current composer + unconditional generic layer + latest assertions. Do not merge blindly.
- Separate Phase-F blocker: previous restore test lacked `public.intelligence_causal_hypotheses`; parity migration/preflight is in the branch, but its current run is not proven green.
- Not proven: authenticated upload/browser journey, multiple-format saved-report readback after reload/re-entry, full tenant/job/hash continuity, production.
CURRENT_FIRST_FAILURE = No new terminal failure is available yet; focused checks remain queued.
NEXT_EXACT_ACTION = Inspect the first terminal exact-head Product Build Gate/Quality/Full Product Browser E2E job and fix only its verified root cause; then prove the same jobId/sourceHash through navigation, reload and persisted readback.

## HISTORICAL STATE BELOW — preserved verbatim

SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
REPOSITORY = Report-Engainall/Report-Advisor
PR = #912 (OPEN / NOT MERGED)
BRANCH = fix/source-bound-generic-intelligence-20261009
CURRENT_CODE_HEAD = 85f69f2ab10fee85293b99e902cfe15eab8f4f91
REPORT_FOR_HEAD = 85f69f2ab10fee85293b99e902cfe15eab8f4f91
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T03:00:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true

## LIVE CHECKPOINT — 2026-10-10 03:00 — GENERAL INTELLIGENCE COMPOSITION

The report covers application code at 85f69f2ab10fee85293b99e902cfe15eab8f4f91. A docs-only child commit is being created to save this state; its own hash cannot be embedded inside itself. Read PR metadata for the current branch ref after the commit, but do not infer code changes from a documentation-only head.

### Product changes present
- Shared composer src/lib/report-intelligence/compose-intelligence-layers.ts retains source-general and specialist intelligence by stable IDs, unions overlapping evidence, and preserves records unique to either layer. The more cautious health state wins. Specialist quality/evidence/decision gates are not relaxed.
- ExternalFileAnalysisPage computes general file intelligence regardless of inferred specialty, carries it into the universal chain, and shows source path/hash.
- report-smart builds and returns genericIntelligence independently; specialist eligibility failure stays REVIEW_REQUIRED while source-derived general analysis can remain visible. SmartReportPage always renders the general layer with the same report job ID/source hash.
- GenericFileIntelligenceCard displays all result/evidence collections passed to the view without the former list truncation.
- Added general/specialist composition runtime assertions and complete/source-bound smart-report surface contract checks.
- Canonical import recovery now selects existing evidence before patching renderedOutput and preserves sourceHash/sourcePath/importId. Regression assertions were added.
- The prior syntax regression at ancestor 7c0411b was fixed in dee505dc045d577b9015ca7cb2ba06adb00a6f76; Vercel build logs say “built in 20.37s” and that code SHA is READY on Vercel and Netlify.

### Current-head deployment and CI
- At code/report HEAD 85f69f2ab10fee85293b99e902cfe15eab8f4f91, GitHub shows Vercel success, Vercel Deployments – Injaz success, Netlify deploy-preview status success, CodeRabbit success. Vercel deployment dpl_43GeHixA1kSFvuwrwQkeh6SFKN8X is READY. A docs-only Netlify retry was cancelled because no build content changed; do not interpret it as a source build failure.
- Exact-head Actions: 56 runs; 3 completed (2 skipped, desktop-windows success unrelated to product proof), 49 queued, 4 pending, none in progress.
- Product Build Gate #38012001245 queued; Full Product Browser E2E #38012001488 queued; Quality #38012001386 queued; File Intelligence Security #38012001065 queued; Data Quality Runtime #38012001327 queued; Device-Independent Browser E2E #38012001097 queued; Phase-F Live Resilience #38012001221 queued; Session Handoff Contract #38012001369 pending.
- Older state pointed at 102959e and is retained below as history; it must not be treated as live head.

### Open issues and proof boundary
- PRs #906/#909 overlap the same report/card/page/test paths, but their checked branch heads lack the current composer and newest general+specialist regression assertions. Do not merge blindly.
- Prior Phase-F backup/restore found missing relation public.intelligence_causal_hypotheses; schema parity/preflight was added but the exact-head Phase-F run remains queued.
- No authenticated upload→report→navigation/reload→persisted readback run has passed at this head. A varied-format end-to-end matrix and production proof are NOT PROVEN.
- Staging row reported historically (job 16709d80-e012-40ef-9c12-6fd8255897f8, 332 canonical rows, quality 98) is not current-head browser proof.

CURRENT_FIRST_FAILURE = No new terminal product-test failure on 85f69f2 is available yet; the focused workflow jobs remain queued/pending.
NEXT_EXACT_ACTION = Consume the first terminal exact-head Product Build Gate / Quality / Full Product Browser E2E result, inspect its job log and fix only the first confirmed failure, then prove same jobId/sourceHash through user-visible navigation and saved readback.

---

## HISTORICAL STATE BELOW — preserved verbatim

SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT_EXACT_HEAD = 102959e897b5cc12c5e2d392831e07d6eaed2c0b
CURRENT_CODE_HEAD = 102959e897b5cc12c5e2d392831e07d6eaed2c0b
CURRENT_MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT_EXECUTION_HEAD = 102959e897b5cc12c5e2d392831e07d6eaed2c0b
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912
CURRENT_PR_HEAD_AT_CODE_CHECK = 102959e897b5cc12c5e2d392831e07d6eaed2c0b
UPDATED_AT = 2026-10-10T01:27:00+03:00
PRODUCT_COMPLETE = NO


## HISTORICAL CHECKPOINT — 2026-10-10 01:23 — LEGACY REPORT EVIDENCE REPAIR (superseded)

- Repository: https://github.com/Report-Engainall/Report-Advisor
- PR #912: OPEN / NOT MERGED — https://github.com/Report-Engainall/Report-Advisor/pull/912
- Branch: `fix/source-bound-generic-intelligence-20261009`
- Code HEAD: `a50159eca39fb3bea2c28a3d5399cdf0e21ce728`; main HEAD: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Batched corpus passport discovery was committed at ancestor `32df42e9b2d5039725746e62531a5a2b01d98aeb`: query completed/rendered report jobs by tenant in bounded pages, then matches hashes in memory instead of making one database query per governed file.
- Passport migration source was added at ancestor `38a1a06543a0f0669708f3dcf451b97653fb3881`. Initial direct test revealed that substring offset used 7 and left the colon in the checkpoint import ID; corrected in the subsequent migration. The final staging SQL definition was read back with `correct_offset > 0` and `wrong_offset = 0`.
- Staging migration versions returned by Supabase are `20261009222131/harden_legacy_report_evidence_passport_refresh` and `20261009222216/fix_legacy_checkpoint_import_id_offset`; repo filenames were reconciled to those exact versions to avoid creating duplicate pending migrations.
- Current database record for report job `16709d80-e012-40ef-9c12-6fd8255897f8` remains a completed rendered XLSX job with matching import fingerprint, 332 canonical rows, analysis snapshot row count 332, 18 columns, and quality 98. Prior persisted rows are real staging data, not synthetic fixture data.
- Direct privileged invocation of the passport refresh RPC through the SQL tool was blocked by tool safety and therefore did not prove a write/readback. The authorized Full Product Browser E2E invokes the same RPC using its service-role secret; use that run to establish the real outcome and never print credentials.
- The predecessor Full Product Browser E2E failed on `ee9540dd...` for two distinct product-path causes: per-file passport query timeouts and the existing legacy report not having `sourceHash/sourceBound/rowCount/qualityScore/importId` in renderedOutput. Both have code changes on this HEAD. New exact-head run is pending.
- Older Phase-F Live Resilience failed backup/restore because restore SQL referenced missing relation `public.intelligence_causal_hypotheses`. This remains a separate unresolved release blocker; do not suppress or exclude that table without proving the schema/backup contract.

### Current exact-head workflows (last observed before this governance commit)
- Session Handoff Contract: [37998946321](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37998946321) QUEUED.
- Full Product Browser E2E: [37998946502](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37998946502) PENDING.
- Product Build Gate: [37998946584](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37998946584) QUEUED.
- Quality: [37998946700](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37998946700) QUEUED.
- Device-Independent Browser E2E: [37998946694](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37998946694) QUEUED.
- Final Certification Gate: [37998946783](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37998946783) QUEUED.
- Phase-F Live Resilience: [37998946612](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37998946612) QUEUED.
- Netlify and Vercel deployment statuses were PENDING for the code HEAD at the last status read. Runtime current-head proof is therefore pending.

### Release gate separation

| Gate | Status | Evidence |
|---|---|---|
| CONTRACT/CI | PENDING after new code commit | Latest runs queued; earlier predecessor handoff passed, but current-head rerun required |
| BUILD | PENDING on `a50159eca39fb3bea2c28a3d5399cdf0e21ce728` | Product Build Gate queued |
| BROWSER | NOT PROVEN on `a50159eca39fb3bea2c28a3d5399cdf0e21ce728` | Full E2E is pending; its predecessor failure is documented |
| PERSISTENCE + READBACK | PARTIAL, predecessor data exists | Current-head authenticated RPC refresh and smart-report rendered-output readback must pass in E2E |
| RUNTIME / PREVIEW | PENDING on `a50159eca39fb3bea2c28a3d5399cdf0e21ce728` | Deployment status pending |
| PRODUCTION | NOT PROVEN | No production-current SHA and browser smoke proof |
| PRODUCT_COMPLETE | NO | Real customer journey and Phase-F blocker remain open |

NEXT_EXACT_ACTION = Consume the new exact-head Full Product Browser E2E result. On a passport or browser failure, inspect its terminal job log and the actual report row first; separately resolve Phase-F restore-schema mismatch. Do not merge or mark product complete.
DO_NOT_MERGE = true



## LIVE CHECKPOINT — 2026-10-10 00:44 — HEAD RECONCILIATION

- Repository: https://github.com/Report-Engainall/Report-Advisor
- PR #912 remains OPEN / NOT MERGED: https://github.com/Report-Engainall/Report-Advisor/pull/912
- Branch: `fix/source-bound-generic-intelligence-20261009`
- Current code baseline reviewed and tested by workflow orchestration: `99d1adfb5bc6df409243f47f0ebb8e53b4808262`; parent: `3e46dd17511533bbbab77578b39c403058002020`.
- Main at last live PR metadata read: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- This commit corrects `scripts/check-session-handoff-contract.mjs`: the changed-path line split was over-escaped. It now splits using the actual newline expression `/\r?\n/`, rather than matching literal backslash sequences.
- The previous Session Handoff Contract run failed on head `3e46dd17511533bbbab77578b39c403058002020`: run [37994951056](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37994951056). Its log said `SESSION_HANDOFF_CONTRACT_FAIL: stale report`; state/report still pointed to `447d1009caa6279faf5664da932c1f25addb8594`. The failure is recorded as historical; a fresh post-fix PASS is not claimed.
- A documentation-only commit follows this code baseline so the next contract run can evaluate a report whose `REPORT_FOR_HEAD` is an ancestor of the tested HEAD and whose changed paths are only governance documents.
- Latest exact-head runs observed on `99d1adfb5bc6df409243f47f0ebb8e53b4808262`: Session Handoff Contract [37995180640](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180640) QUEUED; Full Product Browser E2E [37995180514](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180514) QUEUED; Product Build Gate [37995180426](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180426) QUEUED; Quality [37995180504](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180504) QUEUED; Commercial Product Creation E2E [37995180499](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180499) QUEUED; Device-Independent Browser E2E [37995180266](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180266) QUEUED; Phase-F Live Resilience [37995180352](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180352) PENDING.
- Netlify and Vercel deployment statuses for this baseline were PENDING at the last read. A success on parent `3e46dd1` is not promoted to the current code baseline.
- Browser upload→canonical import→persist→catalog→details→refresh/re-login is NOT PROVEN on this code baseline. Older-head persistence IDs and browser attempts remain historical only.
- A–J universal-file matrix: no full end-to-end matrix pass is claimed. Unknown formats must stay evidence-bounded. No claims about unobserved causal impact, financial benefit, prediction, or benchmark.
- Security remains fail-closed: no AuthGate/RLS bypass, no default tenant, no fabricated membership, and no cross-source/cross-tenant mixing.

### Gate separation at this checkpoint

| Gate | Current status | Evidence |
|---|---|---|
| CONTRACT / CI | PENDING after the handoff regex correction | Fresh current-baseline CI queued; previous handoff failure linked above |
| BUILD | PENDING | [Product Build Gate](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180426) queued |
| BROWSER | NOT PROVEN | [Full Product Browser E2E](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995180514) queued |
| PERSISTENCE + READBACK | PRIOR-HEAD ONLY | Current-head upload and database readback journey not yet demonstrated |
| RUNTIME / PREVIEW | PENDING for current baseline | Deployment status pending at last read; previous preview status is not current proof |
| PRODUCTION | NOT PROVEN | Published production SHA remains historical/stale; no matching production smoke evidence |
| PRODUCT_COMPLETE | NO | Required customer journey and matrix are open |

NEXT_EXACT_ACTION = Read the first terminal result from the exact-head workflow set after the governance-only state sync; on failure, inspect that job's full log and fix only the first proven root cause. Do not re-run queued jobs or promote older-SHA evidence.
DO_NOT_MERGE = true


## HISTORICAL CHECKPOINT — 2026-10-10 00:42 — REPORT VISIBILITY REPAIR (superseded by the HEAD reconciliation above)

### Exact state
- Repository: https://github.com/Report-Engainall/Report-Advisor
- PR #912: https://github.com/Report-Engainall/Report-Advisor/pull/912 — OPEN, NOT MERGED.
- Code SHA described by this report: 447d1009caa6279faf5664da932c1f25addb8594. Main SHA: fa1ab4cbade9b01685507aa966c10f700a03f576.
- All historical checkpoint content from the 2026-10-08 source-agnostic checkpoint below is preserved; append-only reports also remain.
- Intermediate code commit 2bc08d60183193e53900561fb2b80e4b8702cc82 contained a literal escaped newline in a TSX comment and failed TypeScript/build. That defect was corrected on 447d1009caa6279faf5664da932c1f25addb8594; do not use the intermediate commit as validated code.

### P0 root cause verified with public route evidence
- On the Netlify public/preview host, PublicOrAuthenticatedWorkspace rendered ProposalDemoPage for every route merely because the hostname was a public Netlify preview/primary hostname.
- Live extraction of /reports at prior preview SHA 0474e1bf6f6e51414f9715154a385411f433f164 returned fixture inventory source 28-inventory-stockout-reorder.csv, not the tenant-protected Reports Center. This proves the visible route bug that caused demo output to substitute for the saved report experience.
- On code head 447d1009caa6279faf5664da932c1f25addb8594, host-triggered demo behavior is restricted to the landing route '/'. The protected /reports and /reports/smart/:jobId routes go through AuthGate and AppShell. Explicit ?demo=1 and /reports/smart/demo remain demo routes.
- The ?auth=1 branch now renders AuthGate with AppShell as its protected child, preventing an empty post-login workspace.
- scripts/customer-facing-report-surface-contract.test.mjs now asserts the landing-only demo route and the protected auth branch.
- The fix is pushed. Exact-head CI and the new Netlify preview/browser proof have not yet passed; do not claim completion.

### Other repairs retained
- 6f67a2ec558c08f4ea6af36c95dac56dadb0a14f: fix four Evidence Passport E2E selectors to use the visible decision chain/details summary; set E2E owner and corpus tenant IDs without weakening authorization.
- 7a91d7c85da137b0ee9d2ca7edd6f47ef8f4e90b: update stale report-surface contract to match visible evidence proof.
- 0474e1bf6f6e51414f9715154a385411f433f164: Phase F PostgreSQL client uses configurable RESILIENCE_POSTGRES_CLIENT_IMAGE defaulting to public.ecr.aws/docker/library/postgres:17, after Docker Hub rate limiting blocked the predecessor backup/restore attempt. Fresh backup/restore PASS is pending.

### Predecessor-only persistence/readback evidence
- Source code head: 31cba40866569c6bdb6e53ce970b7b87901d1e5b.
- reportJobId: 16709d80-e012-40ef-9c12-6fd8255897f8; importJobId: 1e68460b-f181-4f09-a4fe-d6a58be1fb18; file record: c2d392e0-9b5c-4781-82b8-758680586524.
- Company/tenant: 99e33354-cc45-4317-8eb3-0d486b6c5932; source: تقارير ادارية.xlsx; sourceHash: sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313.
- 332 source/canonical rows, quality 98, evidence VERIFIED and execution stages completed. This proves DB readback on a predecessor, not visible report success on the fixed route; the old browser run failed later at the hidden text locator.

### Unified closure checklist
| Track | Status | Evidence / blocker |
|---|---|---|
| Netlify host route P0 | IMPLEMENTED; exact-head proof pending | Old live preview showed the fixture demo at /reports; new preview must show protected workspace/login and later the authorized catalog. |
| AuthGate, RLS, tenant/source guards | Prior contracts passed; exact-head rerun pending | No default company, bypass or cross-tenant visibility added. |
| Universal generic intelligence | PARTIAL | Generic fallback and Arabic XLSX tests exist; A–J file matrix not yet passed end-to-end. |
| Visible RTL Smart Report | IMPLEMENTED; current browser proof pending | Executive result, decision chain, Evidence Passport, source hash and trust UI exist in code. |
| Persistence/readback | PASS on predecessor only | Exact record lineage above; replay after route repair required. |
| Catalog→details→refresh/re-login | NOT PROVEN on current head | Need browser evidence of saved catalog entry, detail values and fingerprint after refresh. |
| Active membership account | PARTIAL | Predecessor report persisted; fixed route journey pending. |
| No-membership account | Fail-closed UI exists; browser proof pending | Arabic reason shown; no default company or RLS bypass. |
| Typecheck/build/quality | QUEUED for current code head | Intermediate 2bc syntax failure corrected on current head; fresh pass is required. |
| Full Product Browser E2E | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993204984 |
| Device-Independent Browser E2E | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205140 |
| Final Certification | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205047 |
| Product Build Gate | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205233 |
| Quality | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205223 |
| File Intelligence Security | PENDING | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205145 |
| Data Quality Runtime | QUEUED | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205023 |
| Phase F resilience | PENDING | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205011 |
| Session Handoff Contract | PENDING | https://github.com/Report-Engainall/Report-Advisor/actions/runs/37993205007 |
| Netlify Preview | NOT PROVEN for current code head | Prior deploy for 2bc failed because of TSX syntax; require new deployment with source SHA 447d1009caa6279faf5664da932c1f25addb8594. |
| Production | STALE / NOT PROVEN | Published SHA 858ef8e3e5bc5bf74430555eadfb9e6767be348b is older than main fa1ab4cbade9b01685507aa966c10f700a03f576. |
| Product complete | NO | Current browser matrix, certification and same-head production smoke not proven. |

### Required matrix A–J
- A. Arabic monthly customer purchases workbook + totals: PARTIAL; regression fixture exists but actual upload journey is not proven.
- B. Numeric report in a different domain: NOT PROVEN.
- C. CSV upload→persist→refresh→catalog: NOT PROVEN.
- D. PDF/DOCX extraction into saved report: PDF parser regression passed on predecessor; full format-to-report proof is not proven.
- E. Empty/corrupt file clean rejection with no false report: NOT PROVEN.
- F. Meaningful UNKNOWN business report: generic fallback exists; persisted/browser proof not proven.
- G. User without company membership: fail-closed UI exists; live browser proof pending.
- H. Same source hash then a new hash: scoped safeguards exist; end-to-end readback proof pending.
- I. Empty catalog then saved report appears: catalog code exists; live proof pending.
- J. Reopen persisted report after refresh/re-login: prior DB readback PASS; current visual proof pending.

### Release discipline
- Local preview is not a persisted record; DB readback is not browser-visible completion.
- Queued or pending is not PASS; preview is not production.
- Do not weaken AuthGate, RLS, membership or source lineage.
- Do not merge or declare COMPLETE while a required gate remains open.

NEXT_EXACT_ACTION = Consume exact-head workflow and new Netlify preview results; prove /reports routes to AuthGate rather than demo, then prove authenticated upload→persist/readback→catalog→details→refresh/relogin and matrix A–J; repair the first terminal failure before evaluating release.
DO_NOT_MERGE = true
## 2026-10-08 checkpoint — source-agnostic file analysis closure
- APPLICATION HEAD BEFORE GOVERNANCE CHECKPOINT: 555b8b1865978ca7054537c7f23e579671c2e465.
- PR #905 merged successfully: source-agnostic external file analysis.
- Added generic parsing paths for TXT/Markdown, XML, YAML, RTF, legacy DOC review, plus explicit safe handling for ZIP containers.
- Added source-agnostic file intelligence for risk/action language, dates, numeric evidence, content profile, proposed action, and evidence boundaries.
- Added customer-facing GenericFileIntelligenceCard to the external file-analysis surface.
- Final Execution Batch on 555b8b1865978ca7054537c7f23e579671c2e465: 30/30 deterministic gates PASS.
- UI route completeness on 555b8b1865978ca7054537c7f23e579671c2e465: PASS.
- Storage tenant isolation on 555b8b1865978ca7054537c7f23e579671c2e465: PASS.
- PDF structured parser regression on 555b8b1865978ca7054537c7f23e579671c2e465: PASS.
- Netlify Deploy Preview for #905 passed and publicly rendered the general file-analysis upload surface.
- Vercel status remains infrastructure-limited by the Free daily deployment/build-rate limit and is not evidence of an application defect.
- Fresh quality/build/certification/browser gates for the application HEAD are still open.
- The prior Session Handoff failure was caused by persisted governance files still pointing to older HEADs; this checkpoint updates the recorded execution state to the current application HEAD.
- Production Netlify is still not proven current until its published deploy commit matches the final application HEAD.

CURRENT_OPEN_GATES
- Fresh exact-head quality/typecheck/build for the post-#905 main.
- Fresh exact-head final certification and full browser E2E.
- Same-head production deployment.
- GitHub Pages current-head proof if it becomes ready.

CURRENT_ACTIVE_FAILURE
- Infrastructure/proof only: Vercel Free deployment/build-rate limit.
- No application parser failure is asserted on the current application HEAD; current quality/build/certification results are still pending.

NEXT_EXACT_ACTION = Consume the current-head quality/typecheck/build result first; if clean, consume Final Certification + full browser E2E; then prove a same-head free production deployment. Do not certify from older SHAs.


## 2026-10-08 checkpoint — executive visual refinement
APPLICATION HEAD = d347f6a1683f808723388d26019497f6b78c539f4
UI_SCOPE = Shell / Sidebar / Topbar / Journey rail / Page headers / Cards / Tables / Smart Report surfaces / Mobile action bar
STATUS = IMPLEMENTED + INTEGRATED; terminal build/browser proof pending
DESIGN_DIRECTION = dark ink shell + indigo intelligence + restrained brass accent; remove legacy green/teal wash and reduce admin-CRUD visual density
NO_LOGIC_CHANGE = true
NEXT_EXACT_ACTION = consume fresh exact-head visual/build/browser gates for d347f6a1683f808723388d26019497f6b78c539f4; do not certify production from deployment READY alone.


## LIVE CHECKPOINT — 2026-10-10 01:27 — EVIDENCE PASSPORT + RESTORE SCHEMA

- Repository: https://github.com/Report-Engainall/Report-Advisor
- PR #912 remains OPEN / NOT MERGED: https://github.com/Report-Engainall/Report-Advisor/pull/912
- Branch: `fix/source-bound-generic-intelligence-20261009`
- Code HEAD: `102959e897b5cc12c5e2d392831e07d6eaed2c0b`; main HEAD: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Legacy source-bound report refresh is split across commits `32df42e` (batch hash lookup), `38a1a06` (checkpoint import fallback and render normalization), `e6e1961` (correct substring offset), and `a50159e` (migration filename reconciliation).
- Staging migrations applied and aligned to repository: `20261009222131_harden_legacy_report_evidence_passport_refresh.sql`, `20261009222216_fix_legacy_checkpoint_import_id_offset.sql`, and `20261009222627_restore_intelligence_causal_hypotheses_schema_parity.sql`.
- Read-only staging checks: the passport function has corrected `substring(... from 8)` and no `from 7`; `intelligence_causal_hypotheses` exists with RLS enabled, one tenant policy, `anon` SELECT denied, and authenticated/service-role access consistent with the deployed schema.
- Root cause in Phase-F backup/restore was source/target schema drift: the data-only dump contains `public.intelligence_causal_hypotheses`, while a clean DB created from repository migrations lacked the table. Added the schema with constraints and tenant RLS, plus an explicit local-schema preflight before restore.
- A direct call to mutate/refresh the legacy report through the SQL tool was blocked by the tool safety layer, so that single call is NOT proof. The current Full Product Browser E2E's service-role refresh/readback path must provide the write proof.
- Existing report lineage remains verified from staging reads: report job `16709d80-e012-40ef-9c12-6fd8255897f8`, import `1e68460b-f181-4f09-a4fe-d6a58be1fb18`, source `تقارير ادارية.xlsx`, hash `sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313`, import rows `332/332`, canonical rows `332`, analysis snapshot `79141488-104b-46f2-8a4c-66d63441ba0a`, quality `98`.

### Current exact-head gates (last read before this doc sync)

- Session Handoff Contract: [37999289364](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37999289364) PENDING.
- Full Product Browser E2E: [37999289311](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37999289311) PENDING.
- Product Build Gate: [37999289581](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37999289581) QUEUED.
- Quality: [37999289529](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37999289529) QUEUED.
- Device-Independent Browser E2E: [37999289647](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37999289647) QUEUED.
- Final Certification Gate: [37999289349](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37999289349) QUEUED.
- Phase-F Live Resilience: [37999289513](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37999289513) QUEUED.
- Deployment statuses for this code HEAD were still pending at the last read; production remains NOT PROVEN.

| Gate | Status | Required proof |
|---|---|---|
| CONTRACT/CI | PENDING current code HEAD | Session handoff and all exact-head contracts must reach terminal PASS |
| BUILD | PENDING | Product Build Gate on this exact HEAD |
| BROWSER | NOT PROVEN | Current authenticated upload/refresh/catalog/detail/refresh journey not complete |
| PERSISTENCE + READBACK | PARTIAL | Durable report/import/canonical/analysis read has passed on existing data; passport mutation and renderedOutput readback still need current-run proof |
| RUNTIME / PREVIEW | PENDING exact HEAD | Deployment SHA/runtime health must equal final application commit |
| PRODUCTION | NOT PROVEN | No production-current SHA and authenticated smoke proof |
| PRODUCT_COMPLETE | NO | Customer journey and release gates remain open |

NEXT_EXACT_ACTION = Inspect the first terminal result from the exact-head Full Product Browser E2E and Phase-F runs. Confirm passport refresh produces sourceHash/sourceBound/rowCount/qualityScore/importId and current smart-report content; confirm the local restore preflight and full logical restore pass. Fix the first terminal failure without suppressing evidence or weakening RLS.
DO_NOT_MERGE = true

## HISTORICAL CHECKPOINT — 2026-10-10 00:50 — SOURCE-BOUND REPORT E2E (superseded)

- Repository: https://github.com/Report-Engainall/Report-Advisor
- PR #912: OPEN / NOT MERGED — https://github.com/Report-Engainall/Report-Advisor/pull/912
- Branch: `fix/source-bound-generic-intelligence-20261009`
- Application code HEAD reviewed: `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`; parent: `54f4c6941304a0641c32e86d5fd8f095d5e42a31`.
- Main: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Change on application HEAD `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`: Full Product Browser E2E now resumes the actual XLSX report job owned by test user C/company rather than an old PDF execution whose import metadata carries zero valid rows. It keeps source hash, company authorization and row-count checks; PDF extraction remains covered separately by parser regression.
- Netlify runtime endpoint read live on this code HEAD: `status=healthy`; `source_sha=build_sha=deployment_sha=692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`; target environment `preview`; deployment `6ac9613bfb4f2400086a0786`. This is current preview runtime proof, not production proof.
- Public route fetch for unauthenticated `/reports` and `/reports/smart/:jobId` no longer returned the fixture inventory demo; it returned the general landing/auth surface. This proves only the demo override is gone; authenticated report catalog/details still require browser proof.

### Previous-run failure diagnosis
- Session Handoff Contract run `37994951056` on `3e46dd17511533bbbab77578b39c403058002020` failed because the docs pointed to older `447d100...` and `scripts/check-session-handoff-contract.mjs` used an over-escaped newline split. The checker was corrected on ancestor `99d1adfb5bc6df409243f47f0ebb8e53b4808262`.
- The subsequent Session Handoff Contract on `54f4c6941304a0641c32e86d5fd8f095d5e42a31` passed: [run 37995313007](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995313007).
- Quality run `37995312955` on `54f4c694...` failed its early branch exact-head diagnostic while the PR advanced to a later commit. Its log then showed `eslint: not found`, `vite/bin/vite.js` missing, and absent `dist/index.html` because the workflow's `Install` and preceding phases were skipped after the diagnostic failure. Treat those downstream messages as cascading failures for that stale run, not as valid evidence of a current-head build defect. Fresh Quality run for `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f` is queued.
- Phase 9 Windows contract run `37995313052` similarly failed `Verify exact PR head` on a stale run; do not promote it to an application failure on `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`.

### Exact-head workflow state observed
- Full Product Browser E2E: [37995669275](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995669275) was pending at the last read for `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`; a newer exact-head run may be created by governance sync.
- Product Build Gate: [37995669087](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995669087) queued at last read.
- Quality: [37995669171](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995669171) queued at last read.
- Session Handoff Contract: [37995669026](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995669026) queued at last read.
- Device-Independent Browser E2E: [37995668973](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995668973) queued at last read.
- Final Certification Gate: [37995669096](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37995669096) in progress at last read.
- This report does not claim a terminal PASS for any still-queued/in-progress exact-head gate.

### Release gates
| Gate | Status | Note |
|---|---|---|
| CONTRACT/CI | PARTIAL | Several security, UI route, import truth, certification and file-engine contracts passed on `692e0d6ed5c299dfc1a3bda23dfea16ed24a374f`; exact-head Quality and Session Handoff fresh result still pending |
| BUILD | PENDING | Product Build Gate queued |
| BROWSER | NOT PROVEN | Real Chromium authenticated journey has not finished |
| PERSISTENCE + READBACK | PRIOR HEAD ONLY | Current-head upload/recovery → catalog → details → refresh/re-login remains unproven |
| RUNTIME | PASS on preview | Healthy health endpoint and exact SHA match proven |
| PRODUCTION | NOT PROVEN | No production SHA/currentness/smoke pass established |
| PRODUCT_COMPLETE | NO | Do not merge or claim completed until required customer journey passes |

### Matrix A–J
A Arabic purchases XLSX: regression fixture exists; real upload path pending.
B different numeric domain: end-to-end not proven.
C CSV upload/persistence/catalog: not proven.
D PDF/DOCX full report journey: parser regressions are separate; full PDF/DOCX-to-persisted-report proof not proven.
E empty/corrupt file rejection: full journey not proven.
F unknown report type: generic intelligence exists; source-bound saved-report proof not proven.
G user without company membership: fail-closed contracts exist; live browser proof pending.
H same hash and new hash: end-to-end lineage/readback proof pending.
I empty catalog then saved report visible: not proven.
J reopen after refresh/re-login: not proven on current head.

NEXT_EXACT_ACTION = Consume the first terminal exact-head result after this documentation sync; diagnose the first failing step from its job log, then complete the authenticated XLSX report resume and Chromium journey through persisted catalog/detail/refresh proof. Do not re-run queued jobs blindly or promote stale-head evidence.
DO_NOT_MERGE = true
