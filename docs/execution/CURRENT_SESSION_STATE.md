# LIVE RESUME — 2026-10-11 21:57 +03 / DATABASE GRANT AND REPOSITORY MIGRATION READBACK VERIFIED

CURRENT_EXACT_HEAD = 3e1e403fa13d3f9ea974cc8ee94268ee9e2d94f3
CURRENT_CODE_TEST_HEAD = 3e1e403fa13d3f9ea974cc8ee94268ee9e2d94f3
CURRENT_EXECUTION_PARENT_HEAD = 3e1e403fa13d3f9ea974cc8ee94268ee9e2d94f3
CURRENT_PATCH_COMMIT = 3e1e403fa13d3f9ea974cc8ee94268ee9e2d94f3
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
MAIN_BASE = fa1ab4cbade9b01685507aa966c10f700a03f576
ACTION_STATUS = ORDER_STATUS_HISTORY_SELECT_GRANT_VERIFIED; EXACT_HEAD_BROWSER_RERUN_REQUIRED
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
UPDATED_AT = 2026-10-11 21:57 +03

## Latest proven repair
The first recovery commit includes `supabase/migrations/20261011185449_restore_authenticated_order_status_history_select.sql`, matching applied staging migration version `20261011185449`. Post-migration readback: authenticated SELECT true; anon SELECT false; RLS enabled true; tenant SELECT policy present true.

The first E2E failure is preserved, not rewritten as a pass: [Full Product Browser E2E run 38164694687](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164694687) failed at exact tested SHA `d9884cb458d19da402a6b7f4d40ef3e8a9129794` when an authenticated SELECT against `public.order_status_history` got 403/42501. The uploaded result artifact is [here](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164694687/artifacts/11711995869).

The separate report selector issue is now past its first failing point; real Chromium route/auth passed, the new order history permission became the first blocker. No policy was weakened and no `anon`/DML grants were added.

## Head-specific existing gate evidence
- Session Handoff [38164695511](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164695511) PASS on the pre-patch parent `2a128ab3621a426a26e855c4ce66c1dfe09724dc`.
- Final Certification Gate [38164695553](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164695553) PASS on `2a128ab3621a426a26e855c4ce66c1dfe09724dc`.
- Phase-F [38164694601](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164694601) and Data Quality Runtime [38164694533](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164694533) PASS on ancestor `d9884cb458d19da402a6b7f4d40ef3e8a9129794`.
- Quality [38164694658](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164694658) did not provide a source-quality verdict: exact-head consistency failed while the branch moved; dependencies were not installed, then `eslint`/`vite` commands failed as a consequence. A stable exact-head Quality run is still required.

NEXT_EXACT_ACTION = Consume the new full-browser run triggered by this recovery and verify that it passes the tenant-scoped order status-history SELECT and continues the real report/decision/work journey. Inspect Quality, Session Handoff, Final Certification, and Phase-F for this exact new head; fix the first new evidence-backed failure. Keep PR #912 open, PRODUCT_COMPLETE=NO.

---

# LIVE RESUME — 2026-10-11 21:55 +03 / VERIFIED STAGING ACL FIX; EXACT-HEAD USER JOURNEY STILL PENDING

CURRENT_EXACT_HEAD = 2a128ab3621a426a26e855c4ce66c1dfe09724dc
CURRENT_EXECUTION_PARENT_HEAD = 2a128ab3621a426a26e855c4ce66c1dfe09724dc
CURRENT_CODE_TEST_HEAD = d9884cb458d19da402a6b7f4d40ef3e8a9129794
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
MAIN_BASE = fa1ab4cbade9b01685507aa966c10f700a03f576
ACTION_STATUS = STAGING_ACL_FIX_READBACK_PASS; REPO_MIGRATION_COMMIT_PENDING; EXACT_HEAD_BROWSER_RERUN_REQUIRED
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
UPDATED_AT = 2026-10-11 21:55 +03

## Verified live correction
The Full Product Browser run [38164694687](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164694687), exact tested SHA `d9884cb458d19da402a6b7f4d40ef3e8a9129794`, passed route/auth step 17 but failed business step 18: HTTP 403 / SQLSTATE 42501 on SELECT from `public.order_status_history`. This is a separate first runtime failure after the smart-report selector correction.

Applied Supabase staging migration `20261011185449_restore_authenticated_order_status_history_select` with only `GRANT SELECT ON TABLE public.order_status_history TO authenticated;`. Database readback verified authenticated SELECT true, anon SELECT false, RLS enabled true, and tenant SELECT policy present true. The matching repository migration and dated archive are being persisted now.

Session Handoff [38164695511](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164695511) and Final Certification [38164695553](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164695553) passed on parent `2a128ab3621a426a26e855c4ce66c1dfe09724dc`. Phase-F [38164694601](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164694601) and Data Quality [38164694533](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164694533) passed on tested ancestor `d9884cb...`. Quality [38164694658](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38164694658) is invalid as a product-quality verdict because an exact-head mismatch prevented `npm ci`, with downstream commands then missing dependencies.

NEXT_EXACT_ACTION = Complete the migration commit, advance REPORT_FOR_HEAD to that commit with a docs-only follow-up, and verify new exact-head CI plus full authenticated browser proof. Keep PR open and do not declare product complete.

---

# LIVE RESUME — 2026-10-11T21:36:00+03:00 / SESSION HANDOFF BASELINE RECOVERY

CURRENT_EXACT_HEAD = 08a46dd52decb9b60c3fe6e488c4f56d6ea75d00
CURRENT_PRODUCT_HEAD = 08a1ac3464cd7ba818cf09287e3a83a852291681
CURRENT_CODE_TEST_HEAD = 08a46dd52decb9b60c3fe6e488c4f56d6ea75d00
CURRENT_EXECUTION_PARENT_HEAD = 08a46dd52decb9b60c3fe6e488c4f56d6ea75d00
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
MAIN_BASE = fa1ab4cbade9b01685507aa966c10f700a03f576
ACTION_STATUS = HANDOFF_FAIL_RECORDED; REPORT_BASELINE_ADVANCED_TO_CODE_HEAD; EXACT_HEAD_RETEST_REQUIRED
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
UPDATED_AT = 2026-10-11T21:36:00+03:00

## Latest exact-head outcome

The [Session Handoff Contract](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38163624486) failed on `08a46dd52decb9b60c3fe6e488c4f56d6ea75d00`: `SESSION_HANDOFF_CONTRACT_FAIL: stale report; unreported files: scripts/real-business-e2e.mjs` (job `114541517298`). The report snapshot in that run was older than the real E2E selector repair. This is a report-baseline/accounting failure; the checker must remain unchanged.

The Product Build Gate [38163624291](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38163624291), Quality [38163624340](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38163624340), and Data Quality Runtime [38163624450](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38163624450) passed on `08a46dd52decb9b60c3fe6e488c4f56d6ea75d00`. Final Certification [38163624461](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38163624461) failed; Full Product Browser [38163624481](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38163624481), Phase-F [38163624231](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38163624231), and Device-Independent Browser [38163624274](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38163624274) were cancelled.

The browser fix in `scripts/real-business-e2e.mjs` retains reportJobId/sourceHash/sourcePath checks and opens the real `التفاصيل الكاملة للتقرير` disclosure before asserting `سلسلة الثقة لهذا التقرير`. The fixed selector has not yet passed a fresh full browser run.

NEXT_EXACT_ACTION = Commit/read back this governance baseline on the branch, verify Session Handoff on the resulting head, then obtain full-browser evidence on that head and fix the first actual user-journey failure. Keep PR #912 open.

---

# LIVE RESUME — 2026-10-11T21:34:00+03:00 / SMART-REPORT EVIDENCE UI ASSERTION REPAIRED

CURRENT_EXACT_HEAD = 08a46dd52decb9b60c3fe6e488c4f56d6ea75d00
CURRENT_PRODUCT_HEAD = 08a1ac3464cd7ba818cf09287e3a83a852291681
CURRENT_CODE_TEST_HEAD = 08a46dd52decb9b60c3fe6e488c4f56d6ea75d00
CURRENT_EXECUTION_HEAD_BEFORE_GOVERNANCE_COMMIT = 08a46dd52decb9b60c3fe6e488c4f56d6ea75d00
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
MAIN_BASE = fa1ab4cbade9b01685507aa966c10f700a03f576
ACTION_STATUS = INVENTORY_GENERAL_INTELLIGENCE_PASSED_IN_PRIOR_ARTIFACT; SMART_REPORT_EVIDENCE_LOCATOR_FIXED; EXACT_HEAD_GATES_PENDING
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
UPDATED_AT = 2026-10-11T21:34:00+03:00

## First actual failure and precise cause
On browser run [38162258379](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38162258379) (head `2b5f9b47c99b6208b4d1578135adc12659f242aa`), `source-bound-surface:inventory` passed for report `8dbafdf8-f769-4c4f-97a5-22eac8b47d41`, source hash `sha256:3e945a181e766f2e2a50ea765a2db40d57a5c6049481b8e208be10a59d328839`, 254 rows. The browser journey's final persisted Smart Report refresh then failed because its test waited for the literal visible text `EVIDENCE INSPECTOR`; that string is absent from the UI. The actual evidence inspector is nested inside the `التفاصيل الكاملة للتقرير` disclosure and shows `سلسلة الثقة لهذا التقرير`. Result JSON reported `failures: []` but root `error` was `locator.waitFor: Timeout 30000ms exceeded` on that invalid locator. Artifact [11711565090](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38162258379/artifacts/11711565090) was uploaded.

## Code fix 08a46dd52decb9b60c3fe6e488c4f56d6ea75d00
`scripts/real-business-e2e.mjs` now validates the actual visible Evidence Passport disclosure after reload, opens it, waits for the real trust-chain heading `سلسلة الثقة لهذا التقرير`, and asserts it. The existing assertions for report ID, full source fingerprint and source path remain. This strengthens the actual end-user proof without changing the product component or relaxing the business gate.

## Workflow evidence recovery
`.github/workflows/full-product-browser-e2e.yml` commit `431e0c9e3752ce9f756495d0fe1ead92cc4d27a1` assigns `id: business-e2e` and skips only the diagnostic non-blocking 48-source matrix when the main business journey fails. Failure evidence is then checked and uploaded promptly.

## Exact-head checks from earlier SHA (not transferable)
`2ed9da0…` had Build/Quality/Handoff/Final Certification/device-independent browser/storage tenant/Phase-F PASS. `2c707176…` had Build/Quality/Handoff/Final Certification PASS. Neither result is automatically the result for `08a46dd52decb9b60c3fe6e488c4f56d6ea75d00`.

PRODUCT_COMPLETE = NO
NEXT_EXACT_ACTION = Read every required exact-head run for 08a46dd52decb9b60c3fe6e488c4f56d6ea75d00; inspect its business result artifact to prove the corrected Evidence Passport selector, persisted reportJobId/sourceHash, all surfaces after refresh, and finish the live resilience gate. Do not merge PR #912.


## First proven browser failure
Run [38162258379](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38162258379), head `2b5f9b47c99b6208b4d1578135adc12659f242aa`: step `Real Chromium business journey and smart report proof` = FAIL. Job remained in progress at diagnostic-only 48-archetype coverage; log fetch returned `BlobNotFound`, with no artifact available. Exact failure message is UNKNOWN and must not be guessed.

## Change committed on 431e0c9e3752ce9f756495d0fe1ead92cc4d27a1
Workflow `.github/workflows/full-product-browser-e2e.yml` IDs the blocking journey as `business-e2e` and runs diagnostic-only real-source 48 coverage only when it succeeds. On failure, fail-closed evidence check and artifact upload proceed. No business success condition was weakened.

PRODUCT_COMPLETE = NO
NEXT_EXACT_ACTION = Read the new Full Product Browser E2E artifact on the latest head; repair the first logged failure and prove authenticated upload, saved readback, and matching `reportJobId + sourceHash` after reload.


## Current confirmed failure and repair
The Product Build Gate on prior head `2b5f9b47c99b6208b4d1578135adc12659f242aa` failed at the customer-facing report contract, with exact assertion `assert.ok(!surface.includes('{report.sourcePath}'))`. It incorrectly rejected passing the exact source path as an input property to the generic intelligence component. Commit `167ebdc1d0bcf3f1090d4de9299cbc9688fb0dc6` changes the test contract to permit the sourcePath component prop while explicitly rejecting remaining direct customer-visible `{report.sourcePath}` rendering. Typecheck, production build, and the two earlier smart-report contracts passed on the prior head; new-head proof remains required.

## Prior-head gate readback (not transferable)
- [Session Handoff Contract](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38162258338): PASS on `2b5f9b4…`.
- [Final Certification Gate](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38162258407): PASS on `2b5f9b4…`.
- [Product Build Gate](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38162258148): FAIL on `2b5f9b4…` for the stale assertion above.
- [Full Product Browser E2E](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38162258379): IN PROGRESS on `2b5f9b4…` at last read; do not cancel and do not claim pass.
- Product/test commit `167ebdc1d0bcf3f1090d4de9299cbc9688fb0dc6` has triggered new runs, which must be read by exact SHA.

PRODUCT_COMPLETE = NO
NEXT_EXACT_ACTION = Read exact-head Build, Quality, Full Product Browser E2E and Phase-F results for 167ebdc1d0bcf3f1090d4de9299cbc9688fb0dc6; fix the first proven terminal failure without cancelling an existing run or transferring prior-head passes.

## First failure proven from the completed browser artifact

Full Product Browser E2E [38160613377](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38160613377) failed on parent head `9bd1902902a01422590123a0d13f2a78e5658e35` with `inventory: intelligence panel missing`. Artifact 11710353371 shows upload/canonical persistence/readback and Smart Report, Reports Center, executive, trust, decision and work views passing for the same report. The inventory surface was missing the shared intelligence panel/general card.

Report identity read back:
- reportJobId = `8dbafdf8-f769-4c4f-97a5-22eac8b47d41`
- sourcePath = `تقارير ارصدة المخزون.pdf`
- sourceHash = `sha256:3e945a181e766f2e2a50ea765a2db40d57a5c6049481b8e208be10a59d328839`
- 254 canonical rows; quality 98; TRUSTED; evidence `AWAITING_EVIDENCE_SNAPSHOT`.

## Implemented fix on product/test head `08a1ac3464cd7ba818cf09287e3a83a852291681`

- `CustomerReportSurface.tsx`, the actual source-bound domain surface used by `/reports/inventory`, now renders `GenericFileIntelligenceCard` with the report’s independent generic-intelligence output and stable report/source lineage, plus `ReportIntelligencePanel`.
- `scripts/smart-report-complete-intelligence-surface.test.mjs` now guards those imports, render paths and source-bound inputs.
- Commit: https://github.com/Report-Engainall/Report-Advisor/commit/08a1ac3464cd7ba818cf09287e3a83a852291681
- Status = IMPLEMENTED; READBACK VERIFIED BY GITHUB CONTENTS API; BUILD/BROWSER PROOF ON NEW HEAD NOT YET AVAILABLE.

## Exact parent-head gates

PASS Product Build 38160613528; PASS Quality 38160613269; PASS Data Quality Runtime 38160613476; PASS Phase-F 38160613515.
FAIL Session Handoff 38160613659 and Final Certification 38160608535 because the stale report baseline omitted `.github/workflows/phase-f-live-resilience.yml`.
FAIL Full Product Browser 38160613377 because inventory intelligence panel was not mounted. Do not carry forward these results as results for `08a1ac3464cd7ba818cf09287e3a83a852291681`.

## Separate non-blocking gap

48-archetype real-source diagnostic found 21/48 supported, 27/48 NOT_PROVEN, with the target report invisible to the diagnostic actor tenant. This is separate from the main inventory-screen failure and still requires investigation.

## Next exact action

Publish the governance checkpoint with `REPORT_FOR_HEAD=08a1ac3464cd7ba818cf09287e3a83a852291681`, then inspect exact-head Session Handoff/Build/Quality and rerun the full browser proof on that exact branch head. Repair its first demonstrated failure only. PRODUCT_COMPLETE remains NO.

---

# LIVE RESUME — 2026-10-11T20:40:00+03:00 / SOURCE-HASH + DOMAIN-LINEAGE LABELS COMMITTED; NEW EXACT-HEAD VALIDATION REQUIRED

CURRENT_EXACT_HEAD = a298e522ebcf76b19d154026db4afc0a3cdf7327
CURRENT_PRODUCT_HEAD = 7e99202909c88aec0630dd53c578d1350d4f9a74
CURRENT_CODE_TEST_HEAD = 7e99202909c88aec0630dd53c578d1350d4f9a74
CURRENT_EXECUTION_HEAD_BEFORE_THIS_STATE_COMMIT = a298e522ebcf76b19d154026db4afc0a3cdf7327
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = DOMAIN_SOURCE_HASH_AND_CONTEXT_FIXES_COMMITTED; EXACT_HEAD_GATES_REQUIRED
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true

## Actual UI fixes after reading the live E2E assertion
- `/reports/inventory` renders through `ReportsPage.tsx → SourceBoundDomainSurface → CustomerReportSurface`. The previous patch now visibly prints the complete SHA-256 as `data-testid="customer-report-source-hash"`.
- A second exact requirement was found in `scripts/real-business-e2e.mjs`: inventory must also show `SOURCE-BOUND DOMAIN ANALYSIS` and `هذه الشاشة مربوطة مباشرة بنتيجة التقرير`. The actual domain component previously rendered neither, so the screen now presents both labels as visible source context; this is not a test weakening.
- Commit `a49287cbb5271e52d0c196dcee8ba3a81a12b8fb`: visible source-bound domain labels.
- Commit `7e99202909c88aec0630dd53c578d1350d4f9a74`: contract test now asserts the visible hash and both domain labels.
- Prior report baseline `e21023d9aa5f8373568fcb869a2120efface4000` is the preview-runtime commit. Compare evidence shows it differs from the tested code commit `eb56d92...` by one doc-only report commit. The new current product/test head is `7e992029...`.

## Current evidence boundary
- Session Handoff Contract passed on parent head `465ae7d48a56b2aa5610aebe3ae4d7166ababa95`: [run 38159499475](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159499475). The guard was preserved; report anchor was adjusted to an ancestor that correctly bounds the diff.
- Quality passed on that same parent: [run 38159499402](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159499402), but it does not validate the later two UI/test commits.
- Full Product Browser E2E on older head `ae203723...` reproduced the old blocker `inventory: source hash missing`; it subsequently completed route/auth proof successfully but business journey failed. The same old run reported real-source 48-archetype coverage step successful; this still is not the current full browser pass.
- On parent `465ae7d...`, Build, Quality, Phase-F, Final Certification, and Browser had started; some runs may have been cancelled as the later UI/test commits landed. No result is inherited to `7e992029...`.
- Netlify health is healthy at deployment/source/build SHA `e21023d9...`; this preview contains the prior source-hash patch but predates the newly added domain labels. A fresh browser proof must target the newest deployment before calling the label fix proven.
- Production proof remains NO.

## NEXT EXACT ACTION
Let the exact-head gates restart on the branch containing `7e992029...`; confirm Product Build Gate and Quality, then read the Full Product Browser E2E result. The first visible inventory route must now include the full `sourceHash`, `SOURCE-BOUND DOMAIN ANALYSIS`, and the Arabic source-lineage explanation, with identical `reportJobId + sourceHash` through refresh. Fix only the first new failure. Do not modify workflow scope or disable failing assertions.

--- HISTORICAL STATE BELOW; PRESERVED ---
# LIVE RESUME — 2026-10-11T20:27:00+03:00 / DOMAIN REPORT HASH NOW VISIBLE IN ACTUAL RENDERED COMPONENT

CURRENT_PR_BASE = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT_CODE_TEST_HEAD = eb56d92f8e13dd926be0c3980fdddcaa9cf97043
CURRENT_EXECUTION_HEAD_AT_CAPTURE = fb3e6b2aff91f7bca6d56068976cb900fb958bdc
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = DOMAIN_HASH_FIX_AND_REGRESSION_COMMITTED; EXACT_HEAD_VALIDATION_PENDING
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true

## Root-cause correction
The prior visible hash fix in `src/components/SourceBoundReportSurface.tsx` did not cover `/reports/inventory`, which is rendered by `src/components/CustomerReportSurface.tsx` through `ReportsPage.tsx → SourceBoundDomainSurface`. This route mismatch is now fixed directly: CustomerReportSurface renders the complete `report.sourceHash` with `data-testid="customer-report-source-hash"`. The contract in `scripts/smart-report-complete-intelligence-surface.test.mjs` now guards it.

Commits:
- `3e06dd96517782acad9cf2aeab22e86d51380fd3` — visible full hash in actual domain surface.
- `eb56d92f8e13dd926be0c3980fdddcaa9cf97043` — regression contract.

## Live test evidence (never inherit stale-head PASS)
- Build and Quality passed on prior head `ae203723...` only: [Product Build Gate 38158554251](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38158554251), [Quality 38158554494](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38158554494).
- Phase-F live resilience passed on `ae203723...` only: [38158554444](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38158554444).
- Old browser run [38157202976](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202976) failed on source-hash visibility and is not accepted as current proof.
- On `ae203723...`, Handoff [38158554400](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38158554400) and Final Certification [38158554191](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38158554191) failed because reports omitted `PROGRAMMER_REPORTS/2026-10-11-source-hash-surface-fix.md` and `scripts/smart-report-complete-intelligence-surface.test.mjs`.
- Browser / Build / Quality / Phase-F / handoff / final-certification gates created for the pre-correction code-test head `eb56d92...` were cancelled or queued as subsequent commits landed. They must not be inherited as PASS for the domain fix.
- Commercial product creation had a separate previous-head Auth failure: `current_company_id HTTP 401`, JWT `issued at future`; track separately.

## Required handoff coverage
`src/components/CustomerReportSurface.tsx`; `src/components/SourceBoundReportSurface.tsx`; `scripts/smart-report-complete-intelligence-surface.test.mjs`; `PROGRAMMER_REPORTS/2026-10-11-source-hash-surface-fix.md`; `PROGRAMMER_REPORTS/2026-10-11-domain-surface-source-hash-fix.md`.

## NEXT EXACT ACTION
Consume new exact-HEAD Build, Quality, Browser, Handoff, Final Certification and Phase-F results. Browser must prove that `/reports/inventory` renders the exact source SHA-256 and that reportJobId/sourceHash remain stable across linked surfaces and refresh. Fix the first actual terminal failure. Do not claim product or production completion until a fresh non-fixture upload is analyzed, saved, read back and re-opened on the same source identity.

Dated checkpoint: `PROGRAMMER_REPORTS/2026-10-11-domain-surface-source-hash-fix.md`

--- HISTORICAL STATE BELOW; PRESERVED ---
# LIVE RESUME — 2026-10-11T20:10:00+03:00 / SOURCE-HASH VISIBILITY FIX COMMITTED; EXACT-HEAD CI REQUIRED

CURRENT_EXACT_HEAD = c7c774a6f1c6b620e99b7b628d586e99c8cc1bfc
CURRENT_PRODUCT_HEAD = c7c774a6f1c6b620e99b7b628d586e99c8cc1bfc
CURRENT_EXECUTION_HEAD = c7c774a6f1c6b620e99b7b628d586e99c8cc1bfc
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = SOURCE_HASH_UI_FIX_COMMITTED; EXACT_HEAD_VALIDATION_REQUIRED
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Inspect Build, Quality, Full Product Browser E2E, Session Handoff, Final Certification and Phase-F results triggered by c7c774a6f1c6b620e99b7b628d586e99c8cc1bfc; repair the first terminal failure, then prove the same reportJobId + SHA-256 through linked surfaces and refresh.

## Last verified failure and fix
The Full Product Browser E2E run 38157202976 on parent 023d8d38d0c05e6b62c872b234422f9d717e2727 failed with `inventory: source hash missing`. The source-bound report route read the same report job and checked the expected source hash, but the linked inventory surface did not visibly render that hash. Commit c7c774a6f1c6b620e99b7b628d586e99c8cc1bfc adds the full SHA-256 to shared SourceHeader in src/components/SourceBoundReportSurface.tsx; new-head browser validation is pending.
Session Handoff 38157202962 and Final Certification 38157202927 failed because the report omitted five modified files; Phase-F 38157202966 was cancelled before live probes. Previous Build 38157202890 and Quality 38157202815 passed only on the parent and are not new-head proof.

Dated report: PROGRAMMER_REPORTS/2026-10-11-source-hash-surface-fix.md
# LIVE RESUME — 2026-10-11 / SHARED EVIDENCE LABEL + SOURCE-SAFE LOGICAL RESTORE

CURRENT_EXACT_HEAD = 023d8d38d0c05e6b62c872b234422f9d717e2727
CURRENT_PRODUCT_HEAD = 023d8d38d0c05e6b62c872b234422f9d717e2727
CURRENT_EXECUTION_HEAD = 023d8d38d0c05e6b62c872b234422f9d717e2727
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = FIXES_COMMITTED; EXACT_HEAD_VALIDATION_QUEUED
SESSION HANDOFF = READY
PRODUCT_COMPLETE = NO
NEXT_EXACT_ACTION = Read the fresh exact-head Build, Quality, Session Handoff, Final Certification, Full Product Browser E2E and Phase-F runtime results. If restore passes, verify authenticated upload → visible general intelligence + eligible specialty findings → evidence → save/readback → linked-screen navigation → refresh/re-entry with unchanged reportJobId + sourceHash; fix the first terminal failure only.

## Changes committed on this application/test head

- `src/components/ReportIntelligencePanel.tsx`: the shared intelligence heading now visibly includes `EVIDENCE PASSPORT` alongside `GUIDANCE`. Root cause from browser evidence: authenticated route/source checks passed, but the source-bound Trust screen did not visibly include the required passport label.
- `scripts/phase-f-live-resilience-probes.mjs`: logical restore now gathers UUIDs actually referenced by public foreign keys to `auth.users`, then creates ID-only placeholder users in the temporary local restore target before restoring public rows. No emails, password hashes, user metadata, or auth tokens are copied; no remote/staging DDL or auth mutation is performed.
- Existing volatile exclusions remain limited to `public.operational_health_snapshots`, `public.carts`, and `public.cart_items`. Business rows such as `company_memberships`, orders, invoices, payments, and decision/evidence records are not excluded.
- `scripts/resilience-runtime.test.mjs`, `scripts/check-phase10-backup-restore-contract.mjs`, and `scripts/smart-report-complete-intelligence-surface.test.mjs` now require the ID-only restore boundary and visible passport label.

## Current proof boundary

- The previous Full Product Browser run [38155955866](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38155955866) reached the real source-bound report and proved authentication, report/tenant lineage, 254 canonical rows, Smart Report refresh readback and Reports Center source identity before failing because the Trust surface lacked visible `EVIDENCE PASSPORT`. It was not a full journey PASS.
- Phase-F on previous candidate [38156050104](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38156050104) passed 3/4 probes but failed when `company_memberships_user_id_fkey` referenced users absent from the public-only restore. The new ID-only stub strategy addresses this class of Auth FK without excluding business tables.
- Fresh validation for `023d8d38d0c05e6b62c872b234422f9d717e2727` is queued/pending: Build Gate [38157202890](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202890), Quality [38157202815](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202815), Session Handoff [38157202962](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202962), Final Certification [38157202927](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202927), Full Product Browser E2E [38157202976](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202976), and Phase-F live resilience [38157202966](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38157202966). Do not inherit predecessor PASS states.
- Current public Netlify preview has not yet been proven to contain this new source head. Production proof remains NOT_PROVEN; real-source 48-archetype coverage remains NOT_PROVEN.

# LIVE RESUME — 2026-10-11T19:24:00+03:00 / CART_ITEMS RESTORE FIX + CURRENT-HEAD RECONCILIATION

- Repository: `Report-Engainall/Report-Advisor`
- Branch: `fix/source-bound-generic-intelligence-20261009`
- PR [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912): OPEN / NOT MERGED.
- Exact product/test head covered: [`eaebe8ccaaacf17846ceb070c33229cd7d1e3b48`](https://github.com/Report-Engainall/Report-Advisor/commit/eaebe8ccaaacf17846ceb070c33229cd7d1e3b48).
- Main base: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- `PRODUCT_COMPLETE = NO`.
- `ACTION_STATUS = RESTORE_ROOT_CAUSE_PATCH_COMMITTED; EXACT_HEAD_REVALIDATION_REQUIRED`.

## What changed through this exact head

- `scripts/real-business-e2e.mjs`: current report browser proof now verifies visible GUIDANCE and source-bound report evidence across the actual linked surfaces.
- `scripts/smart-report-complete-intelligence-surface.test.mjs`: the visible guidance contract is asserted.
- `scripts/phase-f-live-resilience-probes.mjs`: logical restore excludes the operational cart parent and child rows (`public.carts`, `public.cart_items`) because auth/cart session state is not report/decision truth.
- `scripts/resilience-runtime.test.mjs` and `scripts/check-phase10-backup-restore-contract.mjs`: regression contracts enforce the new exclusion. Report and decision evidence tables are not excluded by this patch.

## Exact-head evidence boundary

On parent `eb94db1f3bad9d59020d7beb8ea42c8309f53ee1`, Build Gate, Quality, data-quality runtime, Storage Tenant Runtime E2E, Device-Independent Browser E2E and Report Value Cohort passed. Full Product Browser E2E was still in progress at capture. Final Certification and Session Handoff failed because the report omitted two changed files. Phase-F was 3/4 and failed only the logical restore on `cart_items_cart_id_fkey`.

Those parent passes are not promoted to the new head. On `eaebe8ccaaacf17846ceb070c33229cd7d1e3b48`, fresh validation is required; statuses at checkpoint were queued/pending for Build, Quality, Phase-F, Handoff, Final Certification and full browser proof.

CURRENT_EXACT_HEAD = eaebe8ccaaacf17846ceb070c33229cd7d1e3b48
CURRENT_MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT_EXECUTION_HEAD = eaebe8ccaaacf17846ceb070c33229cd7d1e3b48
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
FIRST_ACTIVE_FAILURE = Parent-head logical restore attempted to reinsert cart_items referencing excluded carts. The new code excludes both tables and adds regression assertions; current-head runtime confirmation is pending.
NEXT_EXACT_ACTION = Read current-head Phase-F + Full Product Browser E2E + Handoff/Final Certification results. Verify a fresh upload renders all available generic intelligence and source evidence across linked views, then save/readback/refresh with the same reportJobId and SHA-256. Fix only the first terminal failure and checkpoint its evidence.
DO_NOT_MERGE = true
# LIVE RESUME — 2026-10-11T19:21:00+03:00 / 844CFDC — VISIBLE GUIDANCE + LOGICAL RESTORE ROOT-CAUSE FIX

- Repository: `Report-Engainall/Report-Advisor`
- Branch: `fix/source-bound-generic-intelligence-20261009`
- PR [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912): OPEN / NOT MERGED.
- Exact product/test head covered by this checkpoint: [`844cfdc20958ddc35908727c5511901844e4e5d7`](https://github.com/Report-Engainall/Report-Advisor/commit/844cfdc20958ddc35908727c5511901844e4e5d7).
- Main base: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Product completion: `NO`. Full current-head upload/save/readback/refresh browser proof remains unproven.

CURRENT_EXACT_HEAD = 844cfdc20958ddc35908727c5511901844e4e5d7
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = CODE_FIXES_COMMITTED; EXACT_HEAD_VALIDATION_IN_PROGRESS
NEXT_EXACT_ACTION = Read exact-head Build Gate, quality, browser E2E and Phase-F restore results; fix the first failure, then demonstrate fresh non-fixture uploads display generic findings/signals/recommendations/evidence across all linked views and persist under the same job ID and source hash.

## Actual code/test changes through 844cfdc20958ddc35908727c5511901844e4e5d7

- Shared generic intelligence remains in `src/lib/report-smart.ts`: canonical rows are first priority; a source-bound extraction snapshot is used only when all rows match the declared count; partial/mismatched snapshots fail closed.
- Smart Report no longer labels specialist output as the general analysis when generic intelligence is absent; explicit unavailable/partial state and source lineage are shown.
- Reports Center displays report job ID, SHA-256 and source path; browser proof reads fresh DOM after reset.
- `src/components/ReportIntelligencePanel.tsx` now visibly renders the `GUIDANCE` label, not only a hidden data attribute. This fixes the artifact-proven old browser failure `executive: guidance section missing`; new E2E confirmation is pending.
- `scripts/phase-f-live-resilience-probes.mjs` now excludes all `VOLATILE_RESTORE_TABLES` data from logical `pg_dump` using `--exclude-table-data`. Root cause: `public.carts` is user-auth data dependent but Auth rows are outside public-only logical backups; merely excluding it from count comparisons did not prevent pg_dump from restoring it.
- Contract assertions added/updated in `scripts/smart-report-complete-intelligence-surface.test.mjs`, `scripts/resilience-runtime.test.mjs`, and `scripts/check-phase10-backup-restore-contract.mjs`.

## Exact evidence and outstanding gates

- On parent product head `9a17dd08aba41efa4a1b21f67126de3c3fb8530c`, Build Gate [38154787842](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154787842) PASS, Quality [38154787888](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154787888) PASS, Data-quality runtime [38154787868](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154787868) PASS. These include visible GUIDANCE UI patch but predate the subsequent Phase-F fix.
- At exact head `844cfdc20958ddc35908727c5511901844e4e5d7` when checkpoint was written: Build Gate [38154988245](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154988245) in progress; Quality [38154988352](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154988352) in progress; data-quality runtime [38154988348](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154988348) in progress; Final Certification [38154988336](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154988336) in progress; Phase-F live resilience [38154988385](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154988385) pending; Full Product Browser E2E [38154988368](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154988368) pending. Do not promote pending/in-progress to PASS.
- Session Handoff Contract [38154988297](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154988297) failed because the former report did not cover five files changed after it: `scripts/check-phase10-backup-restore-contract.mjs`, `scripts/phase-f-live-resilience-probes.mjs`, `scripts/resilience-runtime.test.mjs`, `scripts/smart-report-complete-intelligence-surface.test.mjs`, `src/components/ReportIntelligencePanel.tsx`. This checkpoint covers the current code head; rerun must validate that.
- Browser artifact [38153724487](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153724487) had proven auth, tenant isolation, source row count/hash, persistence, reload/readback, and Reports Center source-row rendering; it failed when executive view required visible `GUIDANCE`. The 48-archetype diagnostic was `NOT_PROVEN`, not 48/48 complete.
- Prior Phase-F live check [38154198486](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154198486) failed backup restore with `carts_user_id_fkey`; three other checks passed (operational health, tenant canary, rollback-forward drill). This code head applies the root-cause fix but it is not proven until its Phase-F run completes.
- PC01 is offline; no local build/test/browser result is claimed.
- Production remains unproven. Previous preview URL `https://deploy-preview-912--aghbari-report-advisor.netlify.app` was tied to an older head only; confirm exact-head deployment before calling it current.

## Status vocabulary

`IMPLEMENTED`: committed to PR branch.  
`INTEGRATED`: generic/specialty are composed without substitution; source-row selector wired into saved report path.  
`UI-EXPOSED`: generic unavailable/partial state, source lineage and guidance title are visibly rendered.  
`READBACK-PROVEN`: previous report’s persistence/reload readback passed; revised generic layer not yet proven end-to-end on this head.  
`BROWSER-PROVEN`: not yet proven for this head.  
`PRODUCTION-PROVEN`: not proven for this head.  
`PRODUCT COMPLETE`: NO.

---

# LIVE RESUME — 2026-10-11T19:12:00+03:00 / READBACK AFTER GOVERNANCE REPAIR

- Repository: `Report-Engainall/Report-Advisor`
- Branch: `fix/source-bound-generic-intelligence-20261009`
- PR [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912): OPEN / NOT MERGED.
- Exact checkpoint HEAD: `6d87806659a7d87b4292a8926e395f898efbcc87`.
- Current GitHub check-run counts for this exact HEAD: `{"completed/skipped":4,"completed/success":54,"completed/failure":1,"completed/neutral":3}`; no failed check-runs in this capture.
- Build/quality evidence for unchanged product code at ancestor `732e71ee4a929ad97485d92ce8f98cfa2ee79838`: Product Build Gate [38153881907](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153881907) PASS; quality [38153881804](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153881804) PASS; data-quality runtime [38153881601](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153881601) PASS.
- The current-head Session Handoff Contract [38154194920](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154194920) PASS and Final Certification Gate [38154198507](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154198507) PASS.
- Current Full Product Browser E2E [38154198443](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38154198443) is pending behind older run [38153724487](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153724487). That older run’s “Real Chromium business journey and smart report proof” step failed, and the optional 48-source diagnostic was still running. Its failure reason/output artifact is not yet available because the job has not finished. No authenticated upload/readback/refresh claim may be made.
- Product status: `PRODUCT_COMPLETE = NO`.

CURRENT_EXACT_HEAD = 6d87806659a7d87b4292a8926e395f898efbcc87
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = BUILD_QUALITY_CERTIFICATION_HANDOFF_PASS_BROWSER_PENDING
NEXT_EXACT_ACTION = Obtain the browser-business result artifact when the running old E2E job finishes; fix its first exact assertion, then prove fresh non-fixture upload → non-empty generic findings/signals/recommendations/evidence → saved readback → refresh with identical reportJobId + sourceHash.

## Change/readback status

Implemented and tested on code head `732e71e`: canonical-first row selection, complete source-bound extraction snapshot fallback, fail-closed handling for partial/mismatched snapshots, no specialist-as-general fallback in Smart Report, visible unavailable/partial warnings, and visible Reports Center job ID/hash/path. Regression fixture and ESM declarations have been repaired.
The documentation-only commit after code head `732e71e` now passes session handoff and final certification. It adds no application code, so the passing build/quality tests on `732e71e` remain the latest code validation evidence.
All other stages remain distinguished: `READBACK-PROVEN` not newly established for the revised generic layer; `BROWSER-PROVEN` not established; `PRODUCTION-PROVEN` not established.

---

# LIVE RESUME — 2026-10-11T19:05:00+03:00 / CURRENT CODE HEAD 732E71E — GENERAL ANALYSIS FIXED, BROWSER PROOF OPEN

- Repository: `Report-Engainall/Report-Advisor`
- Branch: `fix/source-bound-generic-intelligence-20261009`
- Pull request: [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912) — OPEN / NOT MERGED.
- Product code/test head covered by this checkpoint: `732e71ee4a929ad97485d92ce8f98cfa2ee79838` ([commit](https://github.com/Report-Engainall/Report-Advisor/commit/732e71ee4a929ad97485d92ce8f98cfa2ee79838)).
- Main base: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- A following governance-only commit is permitted to change only the persistent handoff files; it must not be mistaken for a product code commit.
- `PRODUCT_COMPLETE = NO`. Source-bound authenticated browser/persistence/readback/refresh proof remains unproven.

CURRENT_EXACT_HEAD = 732e71ee4a929ad97485d92ce8f98cfa2ee79838
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = CODE_AND_QUALITY_PASS_BROWSER_NOT_PROVEN
NEXT_EXACT_ACTION = Complete Full Product Browser E2E with a fresh non-fixture upload, then verify general signals/recommendations/evidence are visible and persisted on the same reportJobId + sourceHash after readback and refresh; resolve any first failed assertion without weakening evidence requirements.

## Implemented code changes covered by this head

- `src/lib/file-engine/generic-source-rows.ts`: shared selector picks canonical row payloads first, allows fallback only to a complete source-analysis snapshot after the source query has matched tenant + source hash + import job ID, and rejects incomplete previews/count conflicts.
- `src/lib/report-smart.ts`: uses the shared selector to retain the generic layer when a full bound snapshot is available and marks that origin for review. Canonical rows keep priority. It does not present a partial preview as full-source facts.
- `src/components/GenericFileIntelligenceCard.tsx`: explicit unavailable state replaces the former specialty-as-general fallback; source path/job ID/SHA-256 are shown; partial coverage or snapshot use carries visible limitations.
- `src/pages/SmartReportPage.tsx`: the “general intelligence” section now receives `report.genericIntelligence` only, not `report.genericIntelligence ?? report.intelligence`; specialty is no longer mislabeled as the general layer.
- `src/pages/ReportsPage.tsx`: Reports Center shows the report job ID, source SHA-256, and source path visibly.
- Tests: source-row selector cases cover canonical precedence, full snapshot fallback, incomplete preview rejection, and inconsistent counts; the surface test asserts non-truncating generic content/source lineage and the E2E reads the post-filter-reset DOM. The row-selector fixture now matches the row-payload contract, and the surface contract avoids duplicate ESM declarations.

## Exact-head verification observed

- [Product Build Gate run 38153881907](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153881907): SUCCESS.
- [Quality run 38153881804](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153881804): SUCCESS.
- [Data-quality runtime run 38153881601](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153881601): SUCCESS.
- [Full Product Browser E2E run 38153881729](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153881729): PENDING at capture, no job result available. Do not claim browser, persistence, or refresh proof.
- [Final Certification Gate run 38153881876](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153881876): FAILED on the stale handoff check; the logged remaining paths were the two test files changed after the prior `REPORT_FOR_HEAD=c953c628...` checkpoint. This report refreshes the checkpoint to `732e71ee4a929ad97485d92ce8f98cfa2ee79838`.
- [Session Handoff Contract run 38153881674](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153881674): FAILED for the same stale report, with precisely `scripts/generic-file-analysis.test.mjs` and `scripts/smart-report-complete-intelligence-surface.test.mjs` unreported. Following this checkpoint, only memory/current-state/current-report/new-archive files are to be committed.
- [Full Product Browser E2E on ancestor e3554c0](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153724487) was still processing the real Chromium step when last inspected. It is NOT evidence for `732e71ee4a929ad97485d92ce8f98cfa2ee79838`.
- Developer PC01 is offline, so no local shell/test/browser result is claimed. The latest executable validation evidence is from exact-head GitHub Actions.

## Status distinctions

`IMPLEMENTED` — changes committed in the PR branch.  
`INTEGRATED` — saved report builder and Smart Report UI use the generic layer independently from specialist output.  
`UI-EXPOSED` — general-analysis unavailable/partial state and Reports Center source identity are explicitly rendered.  
`READBACK-PROVEN` — not newly proven by this change set.  
`BROWSER-PROVEN` — NOT PROVEN for current head.  
`PRODUCTION-PROVEN` — NOT PROVEN.  
`PRODUCT COMPLETE` — NO.

---

# LIVE RESUME — 2026-10-11T19:00:00+03:00 / GENERIC INTELLIGENCE RESTORE + REPORT CENTER SOURCE-LINEAGE FIX

- Repository: `Report-Engainall/Report-Advisor`
- Branch: `fix/source-bound-generic-intelligence-20261009`
- PR [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912): OPEN / NOT MERGED.
- Exact code/test head covered by this report: `c953c62872f545b112bc2bd81d31c4016a5b2be4` ([commit](https://github.com/Report-Engainall/Report-Advisor/commit/c953c62872f545b112bc2bd81d31c4016a5b2be4)).
- Main base at the live PR check: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- `PRODUCT_COMPLETE = NO`. Do not claim production, authenticated-browser, or end-to-end completion until its exact-head proof passes.

CURRENT_EXACT_HEAD = c953c62872f545b112bc2bd81d31c4016a5b2be4
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = ACTIVE_EXECUTION
NEXT_EXACT_ACTION = Poll exact-head Product Build Gate, quality, and Full Product Browser E2E for c953c62872f545b112bc2bd81d31c4016a5b2be4; diagnose the first red test and prove fresh-upload → complete generic signals/recommendations/evidence → persistence/readback/refresh using the same reportJobId + sourceHash before considering merge.

## Changes saved to the live PR branch before this checkpoint

- `2cde803` and `0dd58a0` — `src/lib/report-smart.ts`: general intelligence can recover from a complete source-analysis extraction snapshot when canonical rows are unavailable, but only if the snapshot is already bound to tenant + sourceHash + importJobId and its actual row count equals the declared row count. Canonical rows stay first priority. Incomplete previews and conflicting counts return unavailable, not invented or falsely complete results.
- `66bdd6e` — added `src/lib/file-engine/generic-source-rows.ts` with an isolated selector for canonical/source-snapshot/unavailable origins.
- `d752c7a` — added focused selector regression tests: canonical priority, full bound snapshot fallback, partial preview rejection, and mismatched count rejection.
- `5d1ac03` — `src/components/GenericFileIntelligenceCard.tsx`: explicit no-data state rather than displaying specialist intelligence as the generic layer; visible warnings distinguish extraction-snapshot results and partial canonical coverage.
- `2cea5f4` — `src/pages/SmartReportPage.tsx`: removed the `report.genericIntelligence ?? report.intelligence` fallback for the section explicitly labelled general intelligence; pass source coverage/origin state into the card.
- `5dae0b6` / `b751ac4` — expanded `scripts/smart-report-complete-intelligence-surface.test.mjs` to prevent regression and check safe fallback contracts.
- `c953c62` — `src/pages/ReportsPage.tsx` now visibly shows report job ID, full source SHA-256, and source path in the report-center source-bound card. `scripts/real-business-e2e.mjs` refreshes its DOM text after clearing the row filter before checking that the same identity remains visible. Surface contract checks were added.

## Evidence as of this checkpoint (exact code head `c953c62872f545b112bc2bd81d31c4016a5b2be4`)

- GitHub check-runs fetched from `/commits/c953c62872f545b112bc2bd81d31c4016a5b2be4/check-runs`: 60 total at time of capture; 10 successes, 3 skipped, 16 in progress, 30 queued, and 1 failure.
- The only surfaced failure was `Session Handoff Contract` on run [38153486804](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153486804), because the previous resume report did not cover eight changed source/test files. This governance commit prepends the current state/report, appends memory, and adds a dated report to address that known stale-report failure.
- Product Build Gate [38153490187](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153490187) was `in_progress`; quality [38153490266](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153490266) was `queued`; Full Product Browser E2E [38153490082](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38153490082) was `pending` with no job details yet. These are not PASS claims.
- The previous authenticated browser run on ancestor `83c2f6fe50673bdc5d558aa829cd4485b6bba973` failed at `REPORTS_CENTER_JOB_ID_NOT_VISIBLE` after loading the existing 254-row PDF; this UI assertion has now been directly addressed but remains NOT PROVEN until a new browser run passes.
- The previous handoff gate identified eight unreported changed files; no product completion claim is permitted until updated governance checks prove the handoff.
- Development PC01 is offline. No local shell, typecheck, or browser test was claimed to run in this session. GitHub Actions is the current executable validation source.
- Latest deploy statuses: Vercel pending at [deployment](https://vercel.com/injaz2/report-advisor/EoYNWUcCqnaH6UTeP49MX2UzNGBv); Netlify deploy preview pending at [deployment](https://app.netlify.com/projects/aghbari-report-advisor/deploys/6acbb212f394f7000889fd8d). Neither proves production.

## Required distinctions

`IMPLEMENTED`: code is committed on PR branch.  
`INTEGRATED`: shared generic layer participates in saved Smart Report mapping, and UI contract checks are present.  
`UI-EXPOSED`: source identity and generic unavailable/partial states are now explicitly rendered in source-controlled UI.  
`READBACK-PROVEN`: not newly proven by this patch.  
`BROWSER-PROVEN`: not yet proven for `c953c62872f545b112bc2bd81d31c4016a5b2be4`.  
`PRODUCTION-PROVEN`: not proven.  
`PRODUCT COMPLETE`: NO.

---

# LIVE RESUME — 2026-10-11T18:16:00+03:00 / GENERIC INTELLIGENCE CARD + SOURCE-ROW SEARCH FIX SAVED; FRESH-UPLOAD E2E PENDING

- Repository: `Report-Engainall/Report-Advisor`
- Branch: `fix/source-bound-generic-intelligence-20261009`
- PR [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912): OPEN / NOT MERGED.
- Exact code/test HEAD being checked: `a644ab51e06b37f75bb498851d36e970ed993144` ([commit](https://github.com/Report-Engainall/Report-Advisor/commit/a644ab51e06b37f75bb498851d36e970ed993144)).
- Main base: `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Product status: `PRODUCT_COMPLETE = NO`. Do not merge or claim production readiness.

CURRENT_EXACT_HEAD = a644ab51e06b37f75bb498851d36e970ed993144
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = ACTIVE_EXECUTION
NEXT_EXACT_ACTION = Inspect Full Product Browser E2E run 38150429588 at a644ab51e06b37f75bb498851d36e970ed993144; confirm row-search filtering/reset, then require the fresh three-row CSV upload, non-empty general signals/recommendations, persisted same-source readback and refresh to pass.

## Exact-head verified checks
- Phase 2 security-definer closure: PASS [38150429372](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38150429372).
- Report Value Cohort: PASS [38150429603](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38150429603).
- Evidence Passport Live Proof: PASS [38150429601](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38150429601).
- Netlify deploy-preview status success: https://deploy-preview-912--aghbari-report-advisor.netlify.app. Vercel status was pending at this checkpoint.
- Product Build [38150429457](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38150429457), Quality [38150429418](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38150429418), and Full Product Browser [38150429588](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38150429588) were in progress/pending; none is treated as passing.
- Previous browser artifact [11706298027](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38149353444/artifacts/11706298027) confirmed the existing 254-row inventory PDF report and source hash, but failed at the mismatched report-center search assertion before the fresh upload.
- Staging PostgREST schema cache was previously recovered via staging-only `pg_notify('pgrst','reload schema')`; this is infrastructure recovery, not product E2E proof.

## Actual changes already persisted in Git
- `301c742d`: forward HTML/ARIA/test attributes through shared Card and explicitly scope the candidate-cohort RPC to service_role.
- `6bdb4c2`: add fresh Arabic CSV upload test, persisted canonical rows, synthetic-fixture exclusion metadata and source-bound report/refresh assertions.
- `6fba06d` / `d60fe20`: fix and tighten report-center search test.
- `a644ab5`: include canonical cell data in the readback and require filter results to match the exact source row number.

## Known blockers
- Exact-head authenticated upload-to-save/readback/refresh proof not yet established.
- Predecessor browser failure was `REPORTS_CENTER_ROW_SEARCH_MISSING`; the corrected test now tests the actual placeholder and filter/reset behavior.
- Previous session-handoff gate failed because the resume report omitted eight modified files. This checkpoint and the dated report refresh the record on the present code/test HEAD.
- Keep separate: IMPLEMENTED ≠ UI-EXPOSED ≠ READBACK-PROVEN ≠ BROWSER-PROVEN ≠ PRODUCTION-PROVEN.

---

# LIVE RESUME — 2026-10-11T17:36:49+03:00 / POSTGREST SCHEMA CACHE RELOADED; EXACT-HEAD RETEST NEXT

- Repository: `Report-Engainall/Report-Advisor`
- Branch: `fix/source-bound-generic-intelligence-20261009`
- PR [#912](https://github.com/Report-Engainall/Report-Advisor/pull/912): OPEN / NOT MERGED
- Exact live PR code/test HEAD before this checkpoint: `e32943bc3bfa54ec60c791b7852ffe8f227fd604` (commit: [fix(report): use file metadata to exclude synthetic sources](https://github.com/Report-Engainall/Report-Advisor/commit/e32943bc3bfa54ec60c791b7852ffe8f227fd604))
- Main base: `fa1ab4cbade9b01685507aa966c10f700a03f576`
- PRODUCT_COMPLETE = NO. Do not merge or claim authenticated/browser/production completion.

## Verified in this launch
- Read the latest live PR metadata; the branch HEAD is `e32943bc3bfa54ec60c791b7852ffe8f227fd604`, newer than the saved `d00556b` checkpoint. Its latest code change removes filename-only rejection of sources such as customer/product/invoice and instead excludes synthetic data using authoritative `file_records.metadata` keys `fixture_type=synthetic-realistic` and `catalog_id=report-intelligence.48`; tests/contracts were updated accordingly.
- On `e32943bc3bfa54ec60c791b7852ffe8f227fd604`: Quality [38086314388](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38086314388), Product Build [38086314341](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38086314341), Data Quality [38086314335](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38086314335), Device-Independent Browser smoke [38086314251](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38086314251) PASS. The latter does not prove authenticated upload/report E2E.
- Before recovery, Full Product Browser [38086314147](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38086314147), Report Value Cohort [38086314337](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38086314337), Evidence Passport Gate [38086314205](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38086314205), and Phase-F [38086314164](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38086314164) failed. Their exact terminal causes must be checked before retrying.
- Staging SQL readback on project `fnqbvfuwbdpwvhcgzksl`: cohort RPC exists (signature `get_report_value_cohort_candidates(integer,uuid)`), index `idx_report_value_cohort_candidates_source` exists, and `report_evidence_passports` is visible. Direct execution of the RPC returned a source-bound rendered record with a SHA-256 source hash and row lineage; no write was performed.
- Root cause found in PostgREST logs: schema-cache queries had been cancelled by PostgreSQL with `57014 statement timeout`. A staging-only `pg_notify('pgrst','reload schema')` was sent. Logs confirm receipt at `2026-10-11T14:36:47Z`, then `Schema cache queried in 1703.5 milliseconds` and `Schema cache loaded in 8.1 milliseconds` at `2026-10-11T14:36:49Z`. A read-only DB check showed zero waiting locks and zero active queries older than ten seconds. This proves the schema cache reloaded, not yet that the full browser journey passes.
- Netlify preview status on the live PR HEAD: success at [deploy-preview-912](https://deploy-preview-912--aghbari-report-advisor.netlify.app). Vercel remains blocked by the external build-rate-limit; no production deploy is claimed.
- Existing UI/code work is retained: universal + generic + eligible specialist intelligence, the full signals/recommendations/evidence card, and open-by-default Universal Intelligence Chain on Smart Report and File Lab. No core rebuild.

## Single next action
Inspect the exact failed-step logs for the current-head Full Product Browser, Report Value Cohort and Evidence Passport Gate runs after the PostgREST reload. If failures were solely pre-reload `PGRST002`, rerun only those failed jobs on the same exact code HEAD; otherwise repair the first demonstrated blocker. Require same `reportJobId + sourceHash` through rendered full intelligence, persistence/readback, navigation and refresh. PRODUCT_COMPLETE remains NO.

---

SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = d00556b4d7522f73e2f5e1e7e6d0f4e4b4a9a77f
CURRENT_BRANCH_HEAD_OBSERVED = d00556b4d7522f73e2f5e1e7e6d0f4e4b4a9a77f (current code/test head before this docs-only checkpoint; read live PR ref on resume)
CURRENT_CODE_TEST_HEAD = d00556b4d7522f73e2f5e1e7e6d0f4e4b4a9a77f
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T23:56:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Re-read live Phase-F and verify PostgREST staging recovery after the schema-reload notification. Then run the source-resolved authenticated browser journey; require one non-fixture report to keep the same reportJobId and SHA-256 through full display, save/readback, navigation and refresh.

## Verified checkpoint
- Code/test head: d00556b4d7522f73e2f5e1e7e6d0f4e4b4a9a77f; PR #912 remains open.
- Smart Report + File Lab now render `UniversalIntelligenceChain` expanded by default while still collapsible; generic and eligible specialty intelligence are composed, not substituted.
- E2E no longer pins the browser route to `تقارير ادارية.xlsx`. The resolver checks a source-bound completed report, file-record security/status, analyzed source snapshot, row/column count, rendered hash and synthetic-fixture exclusions. Browser/business/48-archetype paths consume the resolved ID/hash/path/counts.
- Quality [38085246442], Product Build [38085246488], Data Quality [38085246448] PASS on this exact head. Device-independent smoke [38085246495] PASS; authenticated E2E is SKIPPED.
- Cohort index/passport code contract PASS on [38085246415], but the RPC failed with HTTP 503/PGRST002 after retries. Full Product Browser [38085246315] also failed at source resolution with HTTP 503/PGRST002; no source-bound authenticated browser result was produced.
- Phase-F [38085246320] last observed in live resilience probes, 12/16 steps complete. Vercel returned a build-rate-limit failure; Netlify preview status was success.
- Staging-only index migration version `20261010202632` is recorded and its index was read back. Sent a staging-only `pg_notify('pgrst','reload schema')`; follow-up probe is not confirmed because the Supabase tool blocked the subsequent call.
- PRODUCT_COMPLETE = NO. No merge or production promotion.

---
SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = 1ae6fb43b113e18576477deb90eaa6ba7cfbd900
CURRENT_BRANCH_HEAD_OBSERVED = 1ae6fb43b113e18576477deb90eaa6ba7cfbd900 (checked before this documentation-only checkpoint)
CURRENT_CODE_TEST_HEAD = 1ae6fb43b113e18576477deb90eaa6ba7cfbd900
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T23:35:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume the current-head 40-report cohort, Phase-F, Quality, Build, Data Quality, Device Browser and Full Product Browser runs. Diagnose any remaining timeout against the corrected staging index, then prove real authenticated upload → result → save/readback → refresh with unchanged report ID/source hash.

## Checkpoint evidence
- Current code/test head: 1ae6fb43b113e18576477deb90eaa6ba7cfbd900. PR #912 stays open.
- UI commits are preserved: `5aeea95` expands `UniversalIntelligenceChain` by default in both Smart Report and File Lab; regression contract verifies the open state.
- CI fixes are preserved: `dedd9ac` fixes sibling-trigger parsing; `108a881` satisfies Quality concurrency contract.
- DB/index fix: `312e672` aligns the source-path regex used by the cohort partial index with the RPC query and adds a test in `test:report-evidence-passport-contract`. The source file is now named `20261010202632_report_value_cohort_candidates_source_index.sql` to match staging's migration ledger.
- Supabase staging `fnqbvfuwbdpwvhcgzksl` confirmed the index in `pg_indexes`, and migration ledger version `20261010202632` / name `report_value_cohort_candidates_source_index`.
- On previous code head 312, Quality, Product Build, Data Quality and Device Browser smoke passed. Cohort failed during RPC timeout while the index fix was being applied; contract tests passed. This is not the result of current-head cohort run.
- Current-head runs (as last read): cohort [38084184347] in progress; Phase-F [38084184470] in progress; Quality [38084184260] in progress; Build [38084184406] in progress; Data Quality [38084184493] in progress; Device Browser [38084184466] in progress; Full Product Browser [38084184533] pending/no jobs yet; Session Handoff [38084184492] failed on stale old report and is expected to rerun against this checkpoint.
- Prior Phase-F backup/restore failed because Postgres SSL auth did not complete within 15 sec; do not report it as a source-code or product UI failure.
- The 14 direct source assertions were readback checks, not full npm or browser proof. Arbitrary-file authenticated persistence/re-entry remains unproven. The preview uses a fixture-bound home demo.
- PRODUCT_COMPLETE = NO. No merge/production promotion.

---
SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = 24b3e10201a07fc971bafc4de09db2df491d529c
CURRENT_BRANCH_HEAD_OBSERVED = ce2004024bf53c03a1a63ff138db9b35d93d727c (verified before atomic documentation writeback; re-read live PR ref on resume)
CURRENT_CODE_TEST_HEAD = 24b3e10201a07fc971bafc4de09db2df491d529c
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T23:25:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume current-head Quality/Build/Full Product Browser and other gates; prove the expanded unified chain and source-bound save/readback/refresh using a varied non-fixture file, then diagnose the independent value-cohort timeout.

## Latest verification summary
- Code/test HEAD = 24b3e10201a07fc971bafc4de09db2df491d529c; latest branch head before this checkpoint = ce2004024bf53c03a1a63ff138db9b35d93d727c (documentation-only).
- Directly executed 14 source-contract assertions against GitHub-read-back source files; all 14 PASS. The list and boundary (“not an npm/browser pass”) are in [REPORT-20261010-CE2004-SOURCE-CONTRACT-READBACK.md](PROGRAMMER_REPORTS/2026-10-10/REPORT-20261010-CE2004-SOURCE-CONTRACT-READBACK.md).
- The two main upload/report screens now have the combined Universal Intelligence chain expanded on initial render, still collapsible. Regression assertion checks both screens.
- Netlify PR preview is reachable: [deploy-preview-912](https://deploy-preview-912--aghbari-report-advisor.netlify.app/). Its extracted landing content is fixture-bound to `28-inventory-stockout-reorder.csv`; that is demo behavior, not proof of a live uploaded customer's report.
- Current-head workflows: Product Build [38082993240], Quality [38082993284], Data Quality [38082993408], Device Browser [38082993243], Session Handoff [38082993478], Phase-F [38082993291], Value Cohort [38082993416], Full Product Browser [38082993415]. Most remained queued; cohort was in progress with logs not available. Never infer PASS from queue state.
- Older exact-head proof only: Build and Data Quality PASS on dedd9ac; Device browser smoke PASS but authenticated E2E was skipped/manual-only. Quality on dedd9ac passed the topology parser and then failed the Quality concurrency contract, fixed in 108a881; fresh current-head run pending.
- Vercel rate-limited. Cohort SQL timeout remains unresolved. Authenticated source-bound save/readback/refresh and clean restore remain NOT PROVEN.
- PRODUCT_COMPLETE = NO; PR remains open and production unpromoted.

---
SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = 24b3e10201a07fc971bafc4de09db2df491d529c
CURRENT_BRANCH_HEAD_OBSERVED = 24b3e10201a07fc971bafc4de09db2df491d529c (verified before atomic documentation checkpoint writeback; re-read live PR ref on resume)
CURRENT_CODE_TEST_HEAD = 24b3e10201a07fc971bafc4de09db2df491d529c
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T23:20:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume current-head Quality, Product Build, Full Product Browser, Value Cohort, Phase-F, Device Browser, Data Quality and Session Handoff results for 24b3e10201a07fc971bafc4de09db2df491d529c; repair first reproduced failure and verify the same report ID/source hash across refresh and readback.

## This checkpoint
- [5aeea95](https://github.com/Report-Engainall/Report-Advisor/commit/5aeea95db8f5c2c41cece263c464cb27f082dfed): opened the unified intelligence chain by default on Smart Report and File Lab; summary now accurately describes the visible/collapsible state.
- [24b3e10](https://github.com/Report-Engainall/Report-Advisor/commit/24b3e10201a07fc971bafc4de09db2df491d529c): corrected the static contract's `/\bopen\b/` assertion so it tests the open attribute instead of the literal escape characters.
- Added source-contract coverage requiring both screens' `UniversalIntelligenceChain` disclosure to start open.
- Exact-head workflows queued/pending: Data Quality [38082931758], Phase-F [38082931908], Build [38082931812], Full Product Browser [38082931895], Value Cohort [38082931955], Quality [38082931665], Device Browser [38082931628], Handoff [38082931644].
- Previous proof: Build Gate [38082440345] and Data Quality [38082440151] passed on dedd9ac; Device browser smoke [38082440390] passed, but authenticated E2E was skipped/manual-only. Those results do not certify this newer code head.
- Value cohort timed out with PostgreSQL `57014` on an earlier head; current outcome pending. Smart Report source-bound persistence/readback and clean restore are still not proven.
- PRODUCT_COMPLETE = NO. PR stays open; no production promotion.

---
SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = 108a881a12b8982a4f31458c7eb044de0d8e2a78
CURRENT_BRANCH_HEAD_OBSERVED = 108a881a12b8982a4f31458c7eb044de0d8e2a78 (verified before the atomic documentation checkpoint commit; refresh the live PR ref on resume)
CURRENT_CODE_TEST_HEAD = 108a881a12b8982a4f31458c7eb044de0d8e2a78
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T23:12:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume the exact-head 108a881a12b8982a4f31458c7eb044de0d8e2a78 Quality, Product Build, Full Product Browser, Value Cohort, Phase-F, Device Browser, Data Quality and Session Handoff runs; fix the first proven failure and verify source ID/hash readback across refresh.

## Evidence at checkpoint
- dedd9ac8c63e69082c403cdac68372718e281f0f: topology parser regression fixed; CI topology passed that check, exposing the subsequent Quality concurrency-contract failure.
- Product Build Gate [38082440345](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38082440345): PASS on dedd9ac.
- Data Quality Runtime [38082440151](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38082440151): PASS on dedd9ac.
- Device-Independent Browser [38082440390](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38082440390): browser smoke passed; authenticated E2E skipped/manual-only.
- 108a881a12b8982a4f31458c7eb044de0d8e2a78: Quality concurrency now satisfies the contract by using `github.run_id` and `cancel-in-progress: false`. Exact-head checks are newly queued/pending and must not be pre-claimed.
- Previous value cohort failure [38078344810](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38078344810): PostgreSQL `57014` statement timeout after retry in `get_report_value_cohort_candidates`.
- Smart Report source code readback shows the general intelligence card is visibly rendered, and receives `sourceHash` and `reportJobId`; browser-backed persistence/readback remains unproven.
- PRODUCT_COMPLETE = NO. PR must remain open; production not promoted.

---
SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = dedd9ac8c63e69082c403cdac68372718e281f0f
CURRENT_BRANCH_HEAD_OBSERVED = dedd9ac8c63e69082c403cdac68372718e281f0f (verified before the documentation-only checkpoint writeback; re-read live PR head on resume)
CURRENT_CODE_TEST_HEAD = dedd9ac8c63e69082c403cdac68372718e281f0f
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T23:10:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume terminal Quality/Build/Full Product Browser/Value Cohort/Phase-F/Device Browser checks for exact code head dedd9ac8c63e69082c403cdac68372718e281f0f; repair the first current-head blocker and record readback evidence.

## Current verified checkpoint
- Code change committed: dedd9ac8c63e69082c403cdac68372718e281f0f — isolate sibling workflow triggers in the CI topology parser and add a regression fixture.
- Data Quality Runtime [38082440151](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38082440151): PASS.
- At last read, Product Build [38082440345], Quality [38082440412], Full Product Browser [38082440347], Value Cohort [38082440300], Phase-F [38082440417], and Device Browser [38082440390] were queued/in progress. The Session Handoff run [38082440404] failed because the current report still pointed at a previous code head; this checkpoint now pins dedd9ac8c63e69082c403cdac68372718e281f0f.
- Current exact-head product/browser, report save/readback/refresh, and clean restore proof are not yet established.
- Prior Value Cohort run [38078344810](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38078344810) timed out twice with PostgreSQL 57014 in the candidate RPC. Do not treat it as a UI or intelligence-engine failure.
- Product remains IN PROGRESS; no merge or production promotion.

---
SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = a1d365d3e08a20cbb5ab27f4e708435c1ec724d8
CURRENT_BRANCH_HEAD_OBSERVED = a1d365d3e08a20cbb5ab27f4e708435c1ec724d8
CURRENT_CODE_TEST_HEAD = a1d365d3e08a20cbb5ab27f4e708435c1ec724d8
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T22:10:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume current-head Full Product Browser, Phase-F, Report Cohort, Build/Quality and Handoff outcomes at a1d365d3e08a20cbb5ab27f4e708435c1ec724d8; correct the first confirmed failure and persist exact results while preserving source/evidence/tenant guards.

## Current-head a1d365 checkpoint
- Data Quality Runtime 38078344758 PASS.
- Phase-F 38078344665 live probes in progress; local ops/static/canary/target/provenance steps passed.
- Report Cohort 38078344810 running; Build 38078344906 installing dependencies; Quality 38078344863 in progress.
- Handoff 38078344759 failed because prior baseline 12b did not cover a1d365 workflow edit; this state/report now pin a1d365 and next run should validate docs-only changes.
- Full Product 38078344827 pending; predecessor 38078166196 built exact SHA and passed heart regressions but actor provisioning still running.
- Device Independent 38078344615 pending; its duplicate authenticated run is manual-only.
- Netlify preview ready for a1d365; production unchanged; Vercel currently rate-limited.
---

SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = 12b7106504aaeec247803e3ada311129ee495467
CURRENT_BRANCH_HEAD_OBSERVED = 12b7106504aaeec247803e3ada311129ee495467
CURRENT_CODE_TEST_HEAD = 12b7106504aaeec247803e3ada311129ee495467
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T22:05:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume latest-head Full Product, Device Independent, Phase-F, Report Cohort, Quality/Build and Session Handoff results for 12b7106504aaeec247803e3ada311129ee495467; diagnose first confirmed failure and persist exact readback, keeping tenant/source/evidence semantics intact.

## Latest-head checkpoint
- Added bounded connection retries; local Phase-F tests passed on e9 after assertion repair.
- Added newest-run cancellation to same workflow E2E gates and filtered Phase-F away from docs-only changes at 12b7106504aaeec247803e3ada311129ee495467.
- Report Cohort prior PASS [38076567370] covers 40 reports but on old head 2d77663; current-head cohort 38077978974 pending.
- Full Product 38077978966, Device Independent 38077979075, Phase-F 38077979117, Build 38077979233, Quality 38077979087 and Handoff 38077979084 pending.
- Auth failures show internal Staging Postgres connect errors; don't conflate with UI generic-card assertions.
- No production DB changes or production promotion.
---

SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = 2d77663a8fea44cfbc98e367cca48107a63d3ec2
CURRENT_BRANCH_HEAD_OBSERVED = 2d77663a8fea44cfbc98e367cca48107a63d3ec2
CURRENT_CODE_TEST_HEAD = 2d77663a8fea44cfbc98e367cca48107a63d3ec2
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T21:40:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume Full Product Browser, Device-Independent Browser, Phase-F, Build and Quality results for 2d77663a8fea44cfbc98e367cca48107a63d3ec2; fix the first proven failure and persist exact results without weakening source/evidence guards.

## LIVE CHECKPOINT — staging concurrency update
- Workflow concurrency code commit: 2d77663a8fea44cfbc98e367cca48107a63d3ec2.
- Report Value Cohort [38076567370](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38076567370): PASS, 40-report artifact uploaded, REVIEW/INSUFFICIENT SAMPLE preserved.
- Full Product Browser [38076567127](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38076567127): IN_PROGRESS at checkpoint.
- Phase-F [38076567468](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38076567468): IN_PROGRESS; restore remains unproven.
- Device-Independent Browser [38076567296](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38076567296): PENDING.
- Product Build [38076567171], Quality [38076567159], Data Quality [38076567488]: IN_PROGRESS.
- Session Handoff [38076567285] failed due to stale report coverage; current report baseline is now 2d77663a8fea44cfbc98e367cca48107a63d3ec2 and the rerun must verify docs-only changes afterward.
---

SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = c10429178ba4f414b27c254b1675b8daf0f6ddc1
CURRENT_BRANCH_HEAD_OBSERVED = 93a9d823f80d4d36a2196976167b5a731c5648f7
CURRENT_CODE_TEST_HEAD = ae75608296a7bdff7d271e87439dace0f3817eb8
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume current-head quality/build/browser/Phase-F runs; repair the first confirmed gate failure while keeping source hashes, tenant guards and UNKNOWN != ZERO intact; then persist exact proof.
CURRENT_CODE_TEST_HEAD = ae75608296a7bdff7d271e87439dace0f3817eb8
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume queued exact-head browser/build/quality/Phase-F results; diagnose and repair the first demonstrated failure. Verify generic card visibility + exact source identity in browser and prove clean restore. Preserve UNKNOWN != ZERO. Then persist the next verified checkpoint.

## LIVE EXECUTION CHECKPOINT — source-bound report context + generic-card proof + saved_views restore parity

- Code commits: Reports Center exact context [d51bb6f](https://github.com/Report-Engainall/Report-Advisor/commit/d51bb6fe22a55da9f2533708983d6c05e08a5974); E2E report context [943102b](https://github.com/Report-Engainall/Report-Advisor/commit/943102bafef58cb84feba9df56fc65efe31614c4); context contract [639f5d9](https://github.com/Report-Engainall/Report-Advisor/commit/639f5d92ed3b9768dd1d48e9a732cdd92561e07c); live browser general-card source-ID / hash / signal / recommendation checks [ae75608](https://github.com/Report-Engainall/Report-Advisor/commit/ae75608296a7bdff7d271e87439dace0f3817eb8).
- Staging only: migration `20261010165742_restore_saved_views_schema_parity` applied in project `fnqbvfuwbdpwvhcgzksl`. Readback confirmed 9 columns, 4 constraints, 3 indexes, RLS enabled, tenant+user owner policy, authenticated CRUD, and no anon grants. Clean-restore gate has not run to completion yet.
- Preview ready: Netlify [deploy-preview-912](https://deploy-preview-912--aghbari-report-advisor.netlify.app/) serves code commit ae756; Vercel [latest docs preview](https://report-advisor-35w5janp3-injaz2.vercel.app/) is READY at branch checkpoint c104. Production Netlify is still old main commit `858ef8e3e5bc5bf74430555eadfb9e6767be348b`.
- Exact-head run cohort for branch checkpoint c104: Quality [38070293237](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38070293237), Device-Independent Browser [38070293268](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38070293268), Session Handoff [38070293310](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38070293310), Product Build [38070293366](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38070293366), Full Product Browser [38070293490](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38070293490), data quality [38070293495](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38070293495), Report Value Cohort [38070293415](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38070293415), Phase-F [38070293496](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38070293496): all QUEUED when last checked. Desktop Windows [38070293439](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38070293439) remains IN_PROGRESS. Its web build step passed; desktop dependency installation is ongoing. No browser/restore PASS claimed.
- Prior blocker history: Full Product Browser failed due Reports Center ignoring explicit report ID/hash; fixed at code level, waiting for live E2E. Device-independent browser exposed Postgres 57014 on `/reports/sales`; unresolved until current rerun. Phase-F restore previously missed `saved_views`; schema migration now tracked/applied to staging.
- Archived latest report: `docs/execution/PROGRAMMER_REPORTS/2026-10-10/REPORT-20261010-C104291-LIVE-RESUME.md`.
- Next: consume workflow results, inspect first failed job logs, repair only proven defect, then update this state and a new dated report. No merge or completion declaration until varied file types are browser-proven and source lineage survives refresh/re-entry.
---

SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = cf28f9e24e04c69f1ae068b1053768c4dc32179a
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
APPLICATION_CODE_HEAD = cf28f9e24e04c69f1ae068b1053768c4dc32179a
REPORT_BASE_HEAD = cf28f9e24e04c69f1ae068b1053768c4dc32179a
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T19:10:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume exact-head Quality, Product Build, Phase-F, Full Product Browser, Device-Independent Browser, Report Value Cohort and Session Handoff results; confirm visible executive summary after refresh and full clean logical restore; fix the first proven failure without relaxing evidence gates.

## LIVE EXECUTION CHECKPOINT — 2026-10-10T19:10:00+03:00

- Code/test head: `cf28f9e24e04c69f1ae068b1053768c4dc32179a`.
- 49 source-proof-based legacy imports repaired; 49 linked passports read back VERIFIED/READY/FULL, zero unresolved in the repaired set.
- The clean-restore blocker is now tracked: `report_intelligence_calculations` restore migration `20261010155211` is applied in staging, 3 RLS tenant policies verified, 77 metric rows retained.
- Executive summary moved outside collapsed Evidence Passport details and browser E2E now checks the visible summary DOM marker.
- Cohort run [38065456403](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38065456403) passed on this code head. Other exact-head validation still pending/in progress at checkpoint time.
- Product complete remains NO.

SESSION HANDOFF = READY
CURRENT_EXACT_HEAD = 242c072a1293346109edd3a67cd45a438f53d359
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
ACTION_STATUS = ACTIVE_EXECUTION
APPLICATION_CODE_HEAD = 242c072a1293346109edd3a67cd45a438f53d359
REPORT_BASE_HEAD = 242c072a1293346109edd3a67cd45a438f53d359
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
UPDATED_AT = 2026-10-10T18:45:00+03:00
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
NEXT_EXACT_ACTION = Consume terminal exact-head Quality, Product Build Gate, Phase-F restore, Report Value Cohort, Full Product Browser E2E and Device-Independent Browser E2E results. Confirm the restored report_cell_lineage table, close the 40-report proof-based cohort, and remove the observed statement-timeout failures without relaxing evidence gates.

## LIVE EXECUTION CHECKPOINT — 2026-10-10T18:45:00+03:00 — 49 source-proven passports closed and next restore gap fixed

- Code/test candidate: `242c072a1293346109edd3a67cd45a438f53d359`; PR #912 open/not merged.
- Source-bound legacy import repair applied to staging; readback confirms 49 imports recorded with audited row-count provenance and 49 passports `VERIFIED / READY / FULL`, zero unresolved repaired reports.
- Staging logical backup restore failed on `public.report_cell_lineage` absent from the restore schema. Its columns/FKs/unique/indexes/RLS/policy/grants were read from staging. The matching migration was applied in staging at `20261010153717`; this commit tracks the migration and makes the migration audit enforce it.
- Quality / Product Build Gate / Session Handoff PASS on the prior code candidate. Browser, value-cohort, and Phase-F still need exact-head rerun.
- The last browser run had several SQL `57014` statement-timeout responses when multiple workloads overlapped. A representative canonical source row query is ~4.6ms in a quiet EXPLAIN; cohort candidate RPC ~139ms/42 candidates in a quiet window. The script now bounds timeout retry to one and logs sanitized path/stage outcomes.
- Do not call the product complete from code or build status alone.


## LIVE EXECUTION CHECKPOINT — 2026-10-10T18:35:00+03:00 — 49 source-proven imports repaired; Phase-F provenance guard corrected in both layers

- Code candidate ce10536ae4eefcc3858a7fe407b9d5cd6a2390f5; PR #912 remains open/not merged.
- Staging row-counter reconciliation: 49 audited imports, 49 associated passports VERIFIED/READY/FULL, unresolved reports = 0.
- Migration source synchronized at versions 20261010144953 and 20261010145143.
- Predecessor run 38062072330 Report Value Cohort PASS; 38062072179 Product Build Gate PASS; 38062072369 Session Handoff PASS.
- Phase-F provenance correction now aligns the workflow preflight and JS runtime validator: only docs/execution/* and ONE-PROGRAMMER-SESSION-MEMORY.md may differ from the deployed app SHA. Code-source drift still fails closed.
- Current candidate’s exact-head tests are not terminal. Last live app source SHA observed before candidate was 2055600....
- PRODUCT_COMPLETE = NO until current-head Phase-F/restore and full source-bound browser readback pass.


## LIVE EXECUTION CHECKPOINT — 2026-10-10T18:20:00+03:00 — legacy row-count repair and governance-only runtime provenance allowed

- Code candidate: 2055600a895c05ef8239b6be4014b121d5cea775; PR #912 open/not merged.
- Live database repair: 49 imports reconciled from exact source evidence, 49 related passports VERIFIED / READY / FULL, unresolved reconciled reports 0.
- Migration history versions 20261010144953 and 20261010145143 are both checked in with idempotent SQL.
- Report Value Cohort, Quality and Product Build Gate were PASS on predecessor e017b865...; current exact-head actions are queued, so current-head success is not yet proven.
- Phase-F runtime code equivalence now allows only governance-delta files in docs/execution/* and ONE-PROGRAMMER-SESSION-MEMORY.md; app-code differences are still rejected.
- Netlify last reported app SHA 84c881e... before commit 2055600a895c05ef8239b6be4014b121d5cea775 deployment. Phase-F should be judged only after metadata catches up or governance-only equivalence validates successfully.
- Product completion remains NO.


## LIVE EXECUTION CHECKPOINT — 2026-10-10T18:05:00+03:00 — legacy import row-count repair verified on staging and synchronized to GitHub

- Code/governance HEAD: `84c881eae999ae218b2cf6b448394cbdc73d0775`; PR #912 open/not merged.
- Applied source-proof-gated row-counter reconciliation to staging. Pre-write selection was 49 imports / 49 unique source-bound proofs / 0 conflicting counts; row counts matched rendered output, analyzed snapshot, canonical commit and canonical dataset rows, with hash/file-security/source-quality guards.
- Post-write readback: `reconciled_import_jobs=49`; related passports are `VERIFIED / READY / FULL = 49`; unresolved reconciled reports = 0.
- Audit proof stored in `import_jobs.result_summary.legacyRowCountReconciliation`; no unsupported rows were inferred.
- Synchronized exact Supabase migration history versions `20261010144953` and `20261010145143` to tracked SQL files; migration body is guarded and idempotent.
- Updated session handoff contract to permit the persistent memory file while keeping report ancestry and governance-only descendants enforced.
- Report Value Cohort, Quality and Product Build Gate passed on predecessor `e017b865...` after the DB reconciliation. Current exact-head actions are queued, so current-head success is not yet proven.
- Phase-F previous attempt stopped at runtime provenance mismatch because preview still served `8f610fef...` instead of expected `e017b865...`; restore probes did not run.
- Product completion remains NO.


## LIVE EXECUTION CHECKPOINT — 2026-10-10 — zero-row legacy import ledger diagnosed by independent source evidence

- Application/test code candidate remains `8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e`; this checkpoint is documentation-only.
- Read-only staging inspection found 49 distinct import jobs whose four import counters are zero while independent source-bound proof is complete. Counts: 49 report-proof rows / 49 unique import jobs / 49 conflict-free / 0 conflicting; analyzed quality >=70; all hashes, file security and counts match.
- Current passport refresh function requires total/processed rows to equal rendered authoritative rows, so zero-valued historical counters force PARTIAL despite matching source rows, canonical commits and analysis.
- No data write has been performed. The next operation is an idempotent migration with proof guards + result_summary provenance, followed by refresh and exact readback.


## LIVE EXECUTION CHECKPOINT — 2026-10-10T17:45:00+03:00 — VOI restore schema parity migration added

- Candidate code/test HEAD: `8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e`; PR #912 remains open/not merged.
- Specialty header normalization was centralized and regression-tested; the prior TS missing-symbol failure was fixed before this candidate.
- Read-only staging schema inspection proved `intelligence_voi_requests` has tenant RLS, FK/check constraints, and priority index; repo migration tree had no tracked CREATE TABLE for it. The historical Phase-F restore failure is a migration-history/schema-parity gap.
- Added `supabase/migrations/20261010180000_restore_intelligence_voi_requests_schema_parity.sql` matching the observed schema, including least-privilege grants and tenant policy.
- Extended `scripts/check-migration-schema-audit.mjs` so the tracked migration chain must continue to include the VOI table, RLS, policy, grants, and validation guards.
- No live staging DDL was run. Restore remains NOT PROVEN until Phase-F workflow passes.
- Latest CI: Quality/Product Build Gate/Full Browser/Device-Independent/Phase-F/Report Value Cohort queued or pending on `8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e`. A previous Quality run failed because Vite was absent from `node_modules`; missing `dist/index.html` was downstream of that environment failure.
- Historical Report Value Cohort still has 24/42 evidence passports unclosed. Do not promote these to verified.
- Product completion remains NO.


## LIVE EXECUTION CHECKPOINT — 2026-10-10T17:30:00+03:00 — current candidate and distinct trust/evidence states

- Current application/test candidate: `eb95f709a8ebead63e556380e18394c02c17726`, branch `fix/source-bound-generic-intelligence-20261009`, PR #912 open, main `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Proven predecessor code `8f064944...`: quality and Product Build Gate pass; Device-Independent Browser E2E pass. Generic format matrix in the quality log passes, including TXT/CSV/JSON/JSONL/XML/YAML/Markdown/RTF and XLSX portfolio rows=3, columns=17.
- Full browser E2E on predecessor failed at a wording mismatch: UI displays source trust `موثوق`, while the assertion expected a different Arabic form. Stored report lineage itself matched source hash/path and all 332 canonical rows; evidence remained `AWAITING_EVIDENCE_SNAPSHOT`. Current candidate corrects the assertion while retaining a separate pending-evidence check. Current-candidate rerun not yet terminal.
- Value cohort remains blocked 18/42 due to 24 passports `PASSPORT_NOT_CLOSED`. Do not weaken the gate.
- Phase-F restore is blocked by missing relation `public.intelligence_voi_requests` in the restored schema; 3/4 probes passed on predecessor.
- The previous handoff contract caught stale report coverage. This checkpoint is rewritten for the current candidate and includes the code changes in the new archive entry.
- Product status remains NOT COMPLETE.


## LIVE EXECUTION CHECKPOINT — 2026-10-10 — fresh head readback before normalization fix

- Live PR head at inspection: `350d0c69596a3eaffa8e3982c0cf71e31d08a266`; main `fa1ab4cbade9b01685507aa966c10f700a03f576`; PR #912 OPEN.
- Quality exact-head job `114228066670`: PASS; typecheck, lint, build, performance budget, file-engine regressions, and generic multi-format/XLSX behavioral test passed.
- Value cohort job `114228066563`: FAIL, 18/42 accepted and 24 remained UNVERIFIED due to PASSPORT_NOT_CLOSED. Preserve this evidence gate; do not loosen it to make the cohort green.
- Full Product Browser E2E, Device-Independent Browser E2E, and Phase-F live resilience were in progress at last read. Authenticated browser/persisted readback is not proven.
- Netlify preview is fixture-backed at root and shows auth/marketing route at `/reports` without session. This is not live customer-report proof.
- Root cause for the next code patch: duplicated bad regex normalizer in File Lab specialty detection. Fix with a shared helper and behavior tests for spaced English/Arabic source headers.
- Product status remains NOT COMPLETE.


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

## LIVE EXECUTION CHECKPOINT — 2026-10-10T17:45:00+03:00 — VOI restore schema parity migration added

- Candidate code/test HEAD: `8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e`; PR #912 remains open/not merged.
- Specialty header normalization was centralized and regression-tested; the prior TS missing-symbol failure was fixed before this candidate.
- Read-only staging schema inspection proved `intelligence_voi_requests` has tenant RLS, FK/check constraints, and priority index; repo migration tree had no tracked CREATE TABLE for it. The historical Phase-F restore failure is a migration-history/schema-parity gap.
- Added `supabase/migrations/20261010180000_restore_intelligence_voi_requests_schema_parity.sql` matching the observed schema, including least-privilege grants and tenant policy.
- Extended `scripts/check-migration-schema-audit.mjs` so the tracked migration chain must continue to include the VOI table, RLS, policy, grants, and validation guards.
- No live staging DDL was run. Restore remains NOT PROVEN until Phase-F workflow passes.
- Latest CI: Quality/Product Build Gate/Full Browser/Device-Independent/Phase-F/Report Value Cohort queued or pending on `8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e`. A previous Quality run failed because Vite was absent from `node_modules`; missing `dist/index.html` was downstream of that environment failure.
- Historical Report Value Cohort still has 24/42 evidence passports unclosed. Do not promote these to verified.
- Product completion remains NO.


## LIVE EXECUTION CHECKPOINT — 2026-10-10T17:30:00+03:00 — current candidate and distinct trust/evidence states

- Current application/test candidate: `eb95f709a8ebead63e556380e18394c02c17726`, branch `fix/source-bound-generic-intelligence-20261009`, PR #912 open, main `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Proven predecessor code `8f064944...`: quality and Product Build Gate pass; Device-Independent Browser E2E pass. Generic format matrix in the quality log passes, including TXT/CSV/JSON/JSONL/XML/YAML/Markdown/RTF and XLSX portfolio rows=3, columns=17.
- Full browser E2E on predecessor failed at a wording mismatch: UI displays source trust `موثوق`, while the assertion expected a different Arabic form. Stored report lineage itself matched source hash/path and all 332 canonical rows; evidence remained `AWAITING_EVIDENCE_SNAPSHOT`. Current candidate corrects the assertion while retaining a separate pending-evidence check. Current-candidate rerun not yet terminal.
- Value cohort remains blocked 18/42 due to 24 passports `PASSPORT_NOT_CLOSED`. Do not weaken the gate.
- Phase-F restore is blocked by missing relation `public.intelligence_voi_requests` in the restored schema; 3/4 probes passed on predecessor.
- The previous handoff contract caught stale report coverage. This checkpoint is rewritten for the current candidate and includes the code changes in the new archive entry.
- Product status remains NOT COMPLETE.


## LIVE EXECUTION CHECKPOINT — 2026-10-10 — fresh head readback before normalization fix

- Live PR head at inspection: `350d0c69596a3eaffa8e3982c0cf71e31d08a266`; main `fa1ab4cbade9b01685507aa966c10f700a03f576`; PR #912 OPEN.
- Quality exact-head job `114228066670`: PASS; typecheck, lint, build, performance budget, file-engine regressions, and generic multi-format/XLSX behavioral test passed.
- Value cohort job `114228066563`: FAIL, 18/42 accepted and 24 remained UNVERIFIED due to PASSPORT_NOT_CLOSED. Preserve this evidence gate; do not loosen it to make the cohort green.
- Full Product Browser E2E, Device-Independent Browser E2E, and Phase-F live resilience were in progress at last read. Authenticated browser/persisted readback is not proven.
- Netlify preview is fixture-backed at root and shows auth/marketing route at `/reports` without session. This is not live customer-report proof.
- Root cause for the next code patch: duplicated bad regex normalizer in File Lab specialty detection. Fix with a shared helper and behavior tests for spaced English/Arabic source headers.
- Product status remains NOT COMPLETE.


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


## LIVE CHECKPOINT — 2026-10-11 20:30 — CURRENT-HEAD DOMAIN SOURCE FINGERPRINT VERIFICATION

- Repo `Report-Engainall/Report-Advisor`; PR #912 open/unmerged; branch `fix/source-bound-generic-intelligence-20261009`.
- Head before this checkpoint: `9f2d7b39aa6d73e3c680b0a7870bd27f056f1d4b`; main/base `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- Current UI fix chain: `a49287c` identifies the rendered source-bound domain surface; `3e06dd9` renders the full source hash in `CustomerReportSurface`; `7e99202` tightens the UI contract. The previous hash rendering in `SourceBoundReportSurface` alone did not fix the inventory route; the actual inventory route uses `CustomerReportSurface`.
- Current-head Full Product Browser E2E and most code quality/build/certification gates were pending/queued when checked. See `PROGRAMMER_REPORTS/2026-10-11-live-resume-current-head.md` for exact run IDs/statuses. Do not convert in-progress or queued to PASS.
- Main engine and UI chain remain in place. General intelligence must still render alongside an applicable specialty; all displayed findings/signals/recommendations/evidence must remain grounded in the same reportJobId + sourceHash.
- `PRODUCT_COMPLETE = NO`; production proof not established.
- NEXT_EXACT_ACTION = read current-head authenticated browser + build/quality terminal results; prove actual inventory domain surface fingerprint; repair first confirmed failing assertion; then prove upload → complete rendered results → persistence/readback/reload and identical source identity across screens.


## LIVE CHECKPOINT — 2026-10-11 20:33 — SESSION HANDOFF BASELINE RECONCILIATION

- Repository: Report-Engainall/Report-Advisor; branch: fix/source-bound-generic-intelligence-20261009; PR #912 remains OPEN / NOT MERGED.
- Branch head before this governance-only commit: `a298e522ebcf76b19d154026db4afc0a3cdf7327`; latest product/test commit remains `7e99202909c88aec0630dd53c578d1350d4f9a74`; main/base is `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- The Session Handoff Contract run [38159931441](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159931441) failed with exactly: `stale report; unreported files: PROGRAMMER_REPORTS/2026-10-11-live-resume-current-head.md`.
- Root cause: `scripts/check-session-handoff-contract.mjs` permits report archives under `docs/execution/PROGRAMMER_REPORTS/` but the added report was under root `PROGRAMMER_REPORTS/`. The checker must not be weakened; the correct baseline is to advance `REPORT_FOR_HEAD` to the verified parent where that already-committed root report is part of history, and keep this follow-up report in the allowed nested archive.
- Exact current-head checks: Data Quality Runtime [38159931324](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159931324) PASS; Report Value Cohort [38159931256](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159931256) PASS; File Intelligence Security [38159931185](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159931185) PASS. Product Build [38159931439](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159931439) and Quality [38159931331](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159931331) remained in progress at the latest read. Full Product Browser [38159931158](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159931158) remained pending; Device-Independent Browser [38159931392](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159931392) was in progress; Phase-F [38159931257](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38159931257) was in progress. No browser/readback/restore/production PASS is claimed.
- Product completion remains NO.
- NEXT EXACT ACTION: set the latest programmer report baseline to this verified parent, rerun Session Handoff on the descendant, then inspect the Full Product Browser E2E's first terminal result and repair only a confirmed failure.
