# Report-Advisor Execution Archive — 2026-10-09 / REAL-REPORT ACTOR ALIGNMENT

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 90c7a9464004b001a53d324fc9836fb5b3cdd655
UPDATED_AT = 2026-10-09T06:45:00+03:00
BRANCH = captain/critical-bundle-proof-20261009
PR = #911 OPEN / UNMERGED
PR_HEAD_AT_WRITEBACK_PARENT = 90c7a9464004b001a53d324fc9836fb5b3cdd655
PREVIEW = https://deploy-preview-911--aghbari-report-advisor.netlify.app

## Current delta — report identity isolation at 90c7a9464004b001a53d324fc9836fb5b3cdd655
- Files changed: src/pages/SmartReportPage.tsx; src/components/SourceBoundReportSurface.tsx; scripts/source-report-workspace-contract.test.mjs.
- Both report surfaces now clear stale content during route changes, bind the displayed report and errors to the current jobId + sourceHash, and reject identity mismatches. The source-bound surface cancels stale requests.
- f3c73612 failed the exact build on TS18047/TS2322; 90c7a946 added explicit null narrowing. The current Product Build run 37879969580 is still running; no PASS was claimed at the time of this checkpoint.
- At last read: Quality 37879969419 running; Full Product Browser E2E 37879969657 pending; Session Handoff 37879969624 failed due to stale report documentation before this writeback; Final Certification 37879969438 and Device E2E 37879969303 running.
- The predecessor browser rerun 37876997910 failed provisioning and authenticated report flow. Supabase Auth logs showed /token 504/500 and Postgres connection deadlines; real-source passports and 48 archetype runtime proof were skipped.
- The preview is fixture-backed, not live customer proof. Product completion remains NO.

## Live-report actor correction
- e9271260ac2b52f623023840fa3aabfaad572669 changes scripts/resume-open-report-server-proof.mjs to authenticate TEST_USER_C_EMAIL/PASSWORD.
- The actor provisioner grants user C default membership in REAL_SMART_REPORT_COMPANY_ID, while user A belongs to RUNTIME-EVIDENCE-A-401117. The previous open-report proof logged in as A and then queried a job owned by the separately configured live-report company.
- scripts/e2e-actor-provisioning-contract.test.mjs now asserts that the open-report verifier uses user C and matches the tenant membership setup.
- This correction is code-reviewed from source relationships but remains NOT BROWSER-PROVEN until latest-head Full Product Browser completes.

## Passport refresh and actor audit reliability
- 8583448ff6cdddabea2d1e83eae630802dd298fd added bounded 25s request timeout, up to three retries for retryable failures, explicit progress records and logical duplicate-job suppression to governed passport refresh.
- The same commit made actor audit query failures explicit so a backend error is not mistaken for a missing audit row.

## Latest proof frontier
- Full Product Browser E2E 37876852731 is IN PROGRESS at e927; Product Build 37876857478, Quality 37876857607, Device E2E 37876857500, Session Handoff 37876857440 and Final Certification 37876857543 were queued at last read; Phase F 37876857595 was pending.
- At ancestor 858, build 37876282142 and quality 37876282183 passed; at ancestor 419, handoff 37876658311 and execution enforcement 37876654255 passed. These are not final results at e927.
- Full Browser 37876278794 at 858 failed the actor-provisioning and real-open-report steps, so later passport and 48/48 steps were skipped.
- Live-report opening with exact source hash, end-to-end row/import/canonical persistence, 48/48 archetypes, authenticated route lineage, Phase F READY and production remain NOT PROVEN.

## Next exact action
Read back the docs-only checkpoint, verify successor handoff/certification, then inspect Full Product Browser 37876852731 and other exact-head gates. Repair only the first confirmed failure; do not weaken tenant access or evidence constraints.

--- PRIOR ARCHIVE ---

# Report-Advisor Execution Archive — 2026-10-09 / POST-FIX CHECKPOINT 8583448

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 8583448ff6cdddabea2d1e83eae630802dd298fd
UPDATED_AT = 2026-10-09T05:52:00+03:00
BRANCH = captain/critical-bundle-proof-20261009
PR = #911 OPEN / UNMERGED
PR_HEAD_AT_WRITEBACK_PARENT = 8583448ff6cdddabea2d1e83eae630802dd298fd
APPLICATION_HEAD = 2c4ef80717a6e7052373e721d2e0586115cc5efd
CURRENT_MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PREVIEW = https://deploy-preview-911--aghbari-report-advisor.netlify.app

## Current changes in the branch
- 8583448ff6cdddabea2d1e83eae630802dd298fd changes only scripts/provision-e2e-actors.mjs, scripts/refresh-governed-real-corpus-passports.mjs, and scripts/e2e-actor-provisioning-contract.test.mjs.
- Passport refresh now uses 25s request timeout, bounded three attempts on retryable transport/HTTP errors, progress logs, and duplicate logical-job suppression.
- Actor provisioning now throws an explicit AUDIT_QUERY_FAILED diagnostic when an audit read errors, instead of treating an errored read as a missing row.
- Readback confirmed all three changes; preview `aghbari-source-sha` exactly matched 8583448ff6cdddabea2d1e83eae630802dd298fd.

## Exact proof and blockers at checkpoint
- Product Build Gate 37876282142 PASS; Quality 37876282183 PASS; Execution Enforcement Contract 37876278781 PASS.
- Handoff 37876282175 and certification 37876278779 failed before this writeback because the session documents were stale relative to code commit 8583448. This commit makes the reports cover the code parent; verify the successor’s check result.
- Full Product Browser run 37876278794 IN PROGRESS at actor provisioning; Device-Independent E2E run 37876281894 IN PROGRESS at authenticated actor provisioning; Phase F run 37876281803 IN PROGRESS.
- Historical Phase F run at 89181 ended NOT READY, with health/rollback STALE_RUNTIME and pg_dump ECHECKOUTTIMEOUT. It is not an outcome for the newer 858 run.
- Live customer report, exact route-to-report jobId/sourceHash, full upload-to-decision, real-source 48/48 and production proof remain NOT PROVEN.

## Next exact action
Read back the documentation checkpoint commit, inspect current handoff/certification, then consume current Full Product Browser, Device-Independent authenticated E2E, and Phase F results. Use errors from bounded passport refresh to make a narrow correction; do not weaken auth, RLS, numeric truth, source identity or evidence acceptance.

--- PREVIOUS CHECKPOINT ARCHIVE ---

# Report-Advisor Execution Archive — 2026-10-09 / RESUMED PR #911 CHECKPOINT

SESSION HANDOFF = READY
REPORT_FOR_HEAD = be6fcc0242db7f4748946d52c56ba1828d6eda74
UPDATED_AT = 2026-10-09T05:24:00+03:00
BRANCH = captain/critical-bundle-proof-20261009
PR = #911 OPEN / UNMERGED
PR_HEAD_AT_READ = be6fcc0242db7f4748946d52c56ba1828d6eda74
APPLICATION_HEAD = 2c4ef80717a6e7052373e721d2e0586115cc5efd
CURRENT_MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CONTROL_PLANE_WRITEBACK_BASE = be6fcc0242db7f4748946d52c56ba1828d6eda74
PREVIEW = https://deploy-preview-911--aghbari-report-advisor.netlify.app

## Exact resume audit
- Re-read the canonical boot state, current programmer report, captain/programmer operating protocol, SYSTEM_HEART, execution index, knowledge manifest, canonical programmer memory and archive.
- Confirmed PR #911 head is be6fcc0242db7f4748946d52c56ba1828d6eda74; application source head remains 2c4ef80717a6e7052373e721d2e0586115cc5efd; main is fa1ab4cbade9b01685507aa966c10f700a03f576.
- Confirmed the requested Project-Governance/NASR_PROJECT_SUPERVISION_PROTOCOL.md is missing on both PR branch and main. Used docs/execution/CAPTAIN_PROGRAMMER_OPERATING_PROTOCOL.md as the verified fallback; did not fabricate missing policy text.
- Single checkpoint update is restricted to the four canonical session files. No application or runtime code is changed by this writeback.

## Exact-head proof at be6fcc0242db7f4748946d52c56ba1828d6eda74
- Product Build Gate run 37870488204: PASS.
- Quality run 37870487827: PASS, including the repaired Node XLSX test byte handling.
- Data Quality Runtime run 37870488220: PASS.
- Device-independent public browser-smoke subjob 113627199178: PASS.
- PR preview status contexts are successful; this is preview evidence, not production proof.
- Session Handoff Contract run 37870487766/job 113627197501: FAIL because report coverage still pointed at c7828c84... and omitted .github/workflows/phase-f-live-resilience.yml.
- Final Certification Gate run 37870487791/job 113627197862: FAIL at the same final handoff validation.
- Storage Tenant Runtime E2E run 37870488054/job 113627198132: FAIL with AUTH_TOKEN_HTTP_504; no tenant checks started.
- Commercial Product Creation E2E run 37870488230/job 113627198803: FAIL on Supabase Auth HTTP 504 before business assertions.
- Device-independent authenticated job 113628214148: FAIL during ephemeral actor provisioning with E2E_ACTOR_REQUEST_TIMEOUT.
- Full Product Browser E2E run 37870488215/job 113627199618: FAIL during auth provisioning; downstream authenticated route/report and 48-archetype proof did not complete.
- Report Value Cohort run 37870488147/job 113627268405: FAIL with upstream request timeout; no valid cohort proof produced.
- Phase F live resilience run 37870488256: CANCELLED.

## Root-cause separation
1. Governance defect: REPORT_FOR_HEAD was stale at c7828c84d45bfbada5489df4fd00ec362f15bca7 while the PR advanced to be6fcc0242db7f4748946d52c56ba1828d6eda74; the handoff validator correctly surfaced the unreported workflow file. Pointing coverage at the current candidate base makes the new checkpoint describe only allowed documentation updates.
2. Runtime blocker: independent auth-dependent jobs all observed Supabase HTTP 504/request timeouts. This demonstrates a shared live dependency failure during this attempt; it does not yet prove whether the service fault is transient or persistent and is not evidence of an application authentication defect by itself.
3. Product evidence still open: no authenticated pagination/source lineage proof, safe XLSX upload, full upload-to-decision, real-source 48/48, or production proof.

## Next exact action
Read back the new checkpoint commit, then consume Session Handoff + Final Certification runs on the resulting current head. If the governance gates pass, retry the auth-dependent E2E gates once; if the 504 repeats, preserve the explicit external blocker and continue with safe independent product contracts without weakening auth, RLS, evidence integrity, or numeric truth.
