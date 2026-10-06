# Programmer Report — 2026-10-06 — exact head 7f4bbfe8

UPDATED_AT = 2026-10-06T16:45:00+03:00
CURRENT_EXACT_HEAD = 7f4bbfe8b551790a355639fa67906ca8e155e6bd
BRANCH = feat/calculation-capability-engine-20261006
PR = #850
ACTUAL_MAIN_HEAD = 43af0fd3015f7059602e99a594844157e595b433
PR_BASE = a6d034e05172189d278e689eb01a0c86454f529e

## Product / UX / UI Delta
No new visual shell code was added in this repair wave. Smart Report behavior was corrected so real Kernel/calculation intelligence is retained for REVIEW_REQUIRED/INSUFFICIENT_SAMPLE instead of being replaced by empty/base intelligence. The UI can therefore receive the real payload through the existing Kernel Decision Surface and Smart Report surface; authenticated Chromium proof is still pending.

## What actually happened
1. Previous Smart Report readback defect was fixed at 9e1d781: intelligence availability is now separated from decision eligibility.
2. The first failing Resume and prove the real open report step failed with TEST_USER_A_EMAIL_MISSING.
3. Root cause: Actor D credentials were generated/persisted through GITHUB_ENV, but the workflow used expression-context materialization and overwrote TEST_USER_A_* with empty values.
4. Commit 591520de fixed the resume proof to fall back to dedicated Actor D credentials.
5. The next exact-head typecheck exposed AdvisorBrief.health receiving arbitrary ArchetypeRuntimeState values. Commit 7f4bbfe maps health to REVIEW_REQUIRED while preserving the exact archetype state in the headline.
6. No database schema or tenant/security rule was changed.

## Real data / database proof
- Inventory source: تقارير ادارية.xlsx
- Job: 16709d80-e012-40ef-9c12-6fd8255897f8
- Source hash: sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313
- Rows: 332; quality: 98; evidence: VERIFIED/READY/ACCEPTED.
- Kernel: stock 23075; demand 324250; anomalies 3; scenarios 1; sensitivities 2; status REVIEW_REQUIRED.
- Open report: d074ad5c-70d4-4402-a763-01129786f392
- Open report source: فواتير العملاء من تاريخ 01-01 حتى 30-08-2026.pdf
- Open report state: completed/rendered.
- Canonical rows: 6776; committed rows: 6776.
- Calculation persistence: 31 rows, 23 distinct metric IDs, 15 CALCULATED and 16 NOT_AVAILABLE; all 31 have evidence snapshot/passport linkage.

## Runtime / Browser / Production
- Product Build Gate run 380: in progress.
- Full Product Browser E2E run 8686: pending.
- Final Certification run 17515: queued.
- No production SHA is certified from this wave.

## Open
Exact-head authenticated Smart Report readback; full Decision -> Approval -> Work -> Outcome -> Learning journey; source-bound Benchmark; real-source 48/48 matrix; final deployment/browser SHA proof; sale readiness.

## Do not repeat
Do not rebuild; do not weaken evidence/trust gates; do not fabricate unavailable metrics; do not turn REVIEW_REQUIRED into decision-ready; do not claim browser UI proof before authenticated Chromium evidence.

## Next exact action
Consume terminal Build/Browser results for 7f4bbfe8. Fix only the first newly proven failure, then continue Smart Report readback -> Decision -> Approval -> Work -> Outcome -> Learning -> Benchmark -> 48/48 -> Final Certification.
