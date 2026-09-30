# FINAL EXACT-HEAD READBACK CHECKPOINT — 2026-09-30

- EXACT CURRENT HEAD BEFORE THIS GOVERNANCE-ONLY WRITEBACK → `73d7f0e2b49081372a7a12dc0f95b98b5fff8f1b`.
- EXACT CURRENT-SHA QUALITY → PASS: Typecheck, Lint, Build, Performance, Production Scale, Intelligence/Production, Row Coverage, and all scheduled Quality gates.
- EXACT CURRENT-SHA FINAL EXECUTION BATCH → PASS: release artifact + 29 deterministic gates.
- EXACT CURRENT-SHA FINAL CERTIFICATION GATE → PASS.
- EXACT CURRENT-SHA EXECUTION ENFORCEMENT → PASS.
- EXACT CURRENT-SHA STORAGE TENANT ISOLATION → PASS.
- EXACT CURRENT-SHA FULL PRODUCT BROWSER E2E → PASS for exact checkout verification only; it does not prove authenticated business-flow browser execution.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; source 735; authoritative canonical 735; commit 735; analysis 735×7; quality 87; sourceTrust TRUSTED; reportVerification PENDING_EVIDENCE; evidence AWAITING_EVIDENCE_SNAPSHOT.
- 399/397 CONTRACT → source/analysis 399; canonical/authoritative 397; gap 2; GAP_DETECTED; no manual canonical mutation.
- OPERATIONAL CORPUS → 39 discovered/registered/completed/analyzed/rendered; evidence verified 0; gap-detected 1; pending evidence 38.
- EVIDENCE INSPECTOR → implemented; separates Source, Fingerprint, Canonical Commit, Row Count, Analysis, Evidence, Verification.
- IN-PLACE RETRY → all five source-bound report pages use useOptionalSourceReport.retry; ReportsPage.tsx contains no window.location.reload().
- EXTERNAL BLOCKER → authenticated current-SHA Microsoft Edge/business-flow browser proof remains NOT PROVEN because no browser/device integration is available; Vercel current exact-head status is success; hosted deployment is not being used as authenticated browser proof.
- ACTION STATUS → IN_PROGRESS only for authenticated browser proof; repository/build/certification gates are proven at the exact current code candidate.
- NEXT EXACT ACTION → authenticated browser proof when an authorized browser/device becomes available; otherwise preserve this checkpoint and do not reopen completed report processing.

# FINAL LIVE WRITE-BACK — 2026-09-30 / CURRENT CODE CANDIDATE eab462

- EXACT CODE/TEST CANDIDATE → `eab4628b49cdcf5ee0e3edcde9010f2eb021be5e`.
- EXACT-SHA PROOF → Quality Typecheck PASS, Lint PASS, Build PASS, performance/scale/intelligence production contracts PASS; Final Execution Batch PASS with 29 deterministic gates.
- REPORT RETRY ROOT FIX → `useOptionalSourceReport` now exposes an in-place `retry` function and all five source-bound report pages use it; no `window.location.reload()` remains in `ReportsPage.tsx`.
- CURRENT REPORT → 735/735 source-authoritative canonical, 735 commit, 735×7 analysis, quality 87; TRUSTED source, PENDING_EVIDENCE report verification.
- 399/397 → source 399, canonical 397, authoritative 397, gap 2, GAP_DETECTED.
- CORPUS → 39 discovered/completed/analyzed/rendered; evidence verified 0; gap 1; pending evidence 38.
- BROWSER → Full Product Browser E2E exact checkout PASS only; authenticated Edge/business-flow proof remains NOT PROVEN.
- ACTION STATUS → IN_PROGRESS.
- NEXT EXACT ACTION → governance-only persistence/readback, then exact current-head Final Certification result.

# FINAL LIVE WRITE-BACK — 2026-09-30 / CURRENT CODE CANDIDATE 1a069b

- EXACT CODE/TEST CANDIDATE → `1a069bab2e5f7012e8deb08013914189b8d60f5e`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- EXACT-SHA CI → Quality PASS: Typecheck, Lint, Build, performance, production-scale and intelligence/production contracts all PASS; Final Execution Batch PASS with 29 deterministic gates.
- CERTIFICATION ROOT → recovery migrations satisfy the SECURITY DEFINER surface contract with explicit service_role-only execution; execution-boundary contract is green for compatibility-only in-memory surfaces.
- REPORT TRUTH → sourceTrust=TRUSTED; reportVerification=PENDING_EVIDENCE; evidence=AWAITING_EVIDENCE_SNAPSHOT. Canonical commit proof is separate.
- CURRENT REPORT → 735/735 source-authoritative canonical rows, 735 commit rows, 735×7 analysis, quality 87, 9/9 durable stages rendered.
- 399/397 CONTRACT → source/analysis 399, authoritative canonical 397, canonical gap 2, GAP_DETECTED; explicit and immutable.
- CORPUS → 39 discovered/registered/completed/analyzed/rendered; evidence verified 0; gap-detected 1; pending evidence 38.
- EVIDENCE INSPECTOR → implemented on Smart Report/source-bound surfaces.
- BROWSER → no authenticated current-SHA browser proof; available Full Product Browser E2E only proves exact checkout.
- HOSTING → Vercel is still external rate-limited/pending; GitHub exact-SHA build is proven.
- ACTION STATUS → IN_PROGRESS.
- NEXT EXACT ACTION → certify final governance-only HEAD, read back persistence at exact SHA, then report remaining browser blocker.

# FINAL LIVE WRITE-BACK — 2026-09-30 / EXACT P0 PROOF COMPLETE

- EXACT CODE/TEST CANDIDATE → `5d8f4e3e308db77c54fdb8718bcb7e43a5faa6a2`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- EXACT-SHA PROOF → Quality PASS / Typecheck PASS / Lint PASS / Build PASS / Performance PASS / Production-scale PASS / Intelligence contracts PASS; Final Execution Batch PASS with release build and 29 deterministic gates.
- CERTIFICATION ROOT → execution-boundary guard passes for the current code candidate; in-memory queue/coordinator surfaces are compatibility-only and have no production importers.
- EVIDENCE TRUTH → source trust `TRUSTED`; report verification `PENDING_EVIDENCE`; current report evidence remains `AWAITING_EVIDENCE_SNAPSHOT`.
- CURRENT REPORT → 735 source rows / 735 authoritative canonical rows / 735 canonical commit rows / 735×7 analysis / quality 87 / 9 of 9 durable stages completed.
- 399/397 → explicit Staging + contract proof: source/analysis 399, authoritative canonical 397, gap 2, `GAP_DETECTED`.
- OPERATIONAL CORPUS → 39 discovered / 39 completed / 39 analyzed / 39 rendered; 38 pending evidence, 1 gap-detected, 0 evidence-verified; browser proof not established.
- EVIDENCE INSPECTOR → implemented and source-bound; Trusted Source is visibly distinct from Verified Report.
- BROWSER → current GitHub Browser E2E only verifies exact checkout. Authenticated Microsoft Edge proof is NOT PROVEN because the browser/device integration is unavailable.
- HOSTING → Vercel exact-SHA deployment remains externally build-rate-limited/pending; GitHub exact-SHA build is the authoritative code-build proof.
- ACTION STATUS → `IN_PROGRESS`.
- NEXT EXACT ACTION → execute final governance-only persistence/readback; then consume exact-SHA Quality/Certification results. Browser remains the external blocker.

# FINAL LIVE WRITE-BACK — 2026-09-30 / P0 EXACT-SHA PROOF

- EXECUTION BOUNDARY SHA BEFORE ATOMIC CONTROL-PLANE WRITEBACK → `3c6dd2d583b23be990bb9beb22eee9139b00f9c1`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- REPORT PROOF → source rows 735; authoritative canonical 735; canonical commit 735; durable stages 1..9 completed/rendered; source analysis 735×7; quality 87; source record verified ready/passed; evidence `AWAITING_EVIDENCE_SNAPSHOT`; source trust `TRUSTED`; report verification `PENDING_EVIDENCE`.
- EXACT-SHA TYPECHECK/BUILD/LINT → GitHub Quality on `3c6dd2d...` passed Typecheck, Lint and Build plus all scheduled deterministic release/contract gates. Final Execution Batch on the same SHA built the release artifact and passed 29 deterministic gates.
- EXECUTION GUARD → corrected compatibility-only in-memory boundary passed the exact-SHA quality contract. Production-source importers of the in-memory compatibility surfaces remain prohibited.
- ROW COVERAGE CONTRACT → 399 source / 397 canonical produces authoritative 397 + gap 2 + `GAP_DETECTED`; no silent downgrade.
- CORPUS → 39/39 discovered, completed, analyzed and rendered; 0 missing report jobs; evidence verified 0; pending evidence 38; gap detected 1.
- P2 EVIDENCE INSPECTOR → present in Smart Report and source-bound surfaces: Source, Fingerprint, Canonical Commit, Row Count, Analysis, Evidence, Verification State; Trusted Source remains distinct from Verified Report.
- BROWSER → authenticated Edge/UI proof remains NOT PROVEN; current GitHub browser workflow only validates checkout.
- ACTION STATUS → `IN_PROGRESS`.
- NEXT EXACT ACTION → atomically persist Memory + Execution Index + Data Truth Master to the resulting exact SHA, then read them back from that SHA; after that, certification boundary should be rerun. Browser remains external blocker.

# PRE-CI CHECKPOINT — 2026-09-30 / DURABLE EXECUTION BOUNDARY

- EXACT CURRENT MAIN HEAD → `ec26e5cf9050291d5519b773b5028356d3e87492`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- P0 BUILD/TYPECHECK/LINT → exact current SHA `94c89f8d...` already proved typecheck, build, and lint success in GitHub Actions; the only Quality failure was Core Contracts rejecting an unused in-memory compatibility definition in `worker-adapter.ts`.
- ROOT FIX IN PROGRESS → `scripts/check-report-execution-coordinator-contract.mjs` now classifies `queue.ts`, `execution-ledger.ts`, and `worker-adapter.ts` as compatibility-only leaf definitions and fails when any other production source imports them. This preserves the no-in-memory-production rule without treating unused compatibility definitions as runtime callers.
- REPORT TRUTH → source 735 / authoritative canonical 735 / commit 735; evidence `AWAITING_EVIDENCE_SNAPSHOT`; source trust `TRUSTED`; report verification remains `PENDING_EVIDENCE`.
- 399/397 CONTRACT → current Staging evidence proves source/analysis 399, canonical 397, authoritative 397, gap 2, `GAP_DETECTED`; no canonical-row rewrite.
- OPERATIONAL CORPUS → 39 discovered / 39 completed / 39 analyzed / 39 rendered; 0 missing report jobs; evidence verified 0; gap-detected 1; pending-evidence 38; browser proof not established for the corpus.
- BROWSER → GitHub Full Product Browser E2E only verifies exact checkout; authenticated browser execution remains NOT PROVEN. TinyFish/Remote Desktop are unavailable.
- ACTION STATUS → `IN_PROGRESS`.
- NEXT EXACT ACTION → prove the corrected execution-boundary guard on the resulting exact SHA, then consume Quality build/typecheck/lint and certification results.

# FINAL LIVE WRITE-BACK — 2026-09-30 / 39-REPORT OPERATIONAL CORPUS

- EXACT EXECUTION HEAD → `9b6dd27da548b2c666f485beb905026259ff1c99`; this following memory commit is control-plane only.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- CURRENT REPORT PROOF → source rows 735; authoritative canonical rows 735; canonical commit 735; durable 9/9 completed/rendered; source analysis 735×7; quality 87; source file record verified ready/passed; evidence `AWAITING_EVIDENCE_SNAPSHOT`; trust `TRUSTED`.
- OPERATIONAL REPORT CORPUS → 39 unique verified business-report sources discovered from tenant Storage after excluding generated entity-style filenames; 39/39 have completed durable generic jobs; 39/39 analyzed; 39/39 rendered; 0 report-like sources without job; 0 noncompleted report-like jobs.
- CORPUS RECOVERY EXECUTED → three missing source-analysis snapshots were rebuilt from existing `canonical_dataset_records` with explicit recovery metadata and completeness-only quality scoring; existing rendered-output recovery then repaired all four previously missing outputs.
- PARTIAL COMMIT TRUTH → `ف العملاء الاجل من ت 01-06 حتى تاريخ 15-08.pdf` has source/analyzed rows 399 and authoritative canonical rows 397; gap 2 is persisted and surfaced. No rows were silently rewritten.
- CURRENT REPORT RECOVERY → current report rendered metadata now explicitly contains authoritative current row count 735 and canonical gap 0.
- SEMANTIC EVIDENCE → no evidence state is promoted to VERIFIED by canonical commit or recovery. Current report and recovered corpus outputs remain `AWAITING_EVIDENCE_SNAPSHOT` where no dedicated source-bound evidence snapshot exists.
- CANONICAL COMMIT PROOF → SmartReport independently derives tenant-scoped committed row count and compares it to `authoritativeCurrentRowCount`, not blindly to raw source row count.
- UI → Smart Report and source-bound Executive/Trust/Decision/Work surfaces show source versus authoritative canonical counts and expose commit gaps.
- DURABLE EXECUTION GUARD → main contains the existing coordinator contract guard preventing production in-memory report execution references outside canonical local/test implementation files.
- REPOSITORY DB LINEAGE → migrations now include source-record recovery, evidence-state guard, and report analysis/render recovery/partial-commit semantics. Live Staging recovery functions are captured in repository migration `20260930130000_report_recovery_analysis_and_partial_commit_output.sql`.
- GIT CORPUS TRUTH → `tests/fixtures/realistic-reports/` on exact Git HEAD remains README-only; the 39-report closure is Storage/tenant operational corpus evidence, not a claim that Git tracks 39 fixture files.
- PROOF BOUNDARY → Staging source/recovery/canonical/corpus readback is proven. Exact current-SHA typecheck/build is not exposed by available GitHub wrapper; current combined status shows Vercel build-rate-limit failure. Authenticated Microsoft Edge/browser proof remains NOT PROVEN.
- ACTION STATUS → `IN_PROGRESS` only for exact-current-SHA certification/runtime/browser closure.
- DO-NOT-REPEAT → no blind re-import, no direct canonical-row mutation, no evidence promotion, no tenant bypass, no stale PASS, no database-to-browser inference.
- NEXT EXACT ACTION → consume exact-current-SHA CI/build/runtime/browser evidence if exposed; preserve the 39-report operational corpus closure and current report truth while closing certification.

# PRE-CORPUS-RECOVERY CHECKPOINT — 2026-09-30 / OPERATIONAL REPORT CORPUS

- EXACT CURRENT MAIN HEAD → `fa463292bd4ba3b729ea4202b751b6638ff34a09`.
- CURRENT REPORT REMAINS → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- CURRENT REPORT TRUTH → 735/735; durable 9/9 completed/rendered; canonical dataset 735; canonical commit 735; source analysis 735×7 quality 87; source record ready/passed; evidence `AWAITING_EVIDENCE_SNAPSHOT`; trust `TRUSTED`.
- OPERATIONAL STORAGE REPORT CORPUS → 39 unique verified business-report source hashes after excluding generated entity-style filenames; all 39 have completed generic report jobs; no report-like source has no job or noncompleted job.
- CORPUS GAP → only 35/39 have persisted `renderedOutput`; only 36/39 have a matching analyzed source-analysis snapshot. Four completed jobs lack rendered output; three of those also lack source-analysis snapshots.
- MISSING RENDERED REPORTS → `الصراف الحوشبي.pdf` (payments, 8 rows), `العملا النقد.pdf` (customers, 721 rows), `الفواتير من تاريخ 01-09-2026 حتى 20-09-2026.pdf` (sales, 610 rows), `ف العملاء الاجل من ت 01-06 حتى تاريخ 15-08.pdf` (sales, 399 rows, quality 94 analysis available).
- SAFETY BOUNDARY → do not re-import any of these completed jobs and do not rewrite canonical dataset rows. Recover analysis/output only from already persisted canonical/task evidence using existing canonical recovery paths.
- ACTION STATUS → `IN_PROGRESS`.
- NEXT EXACT ACTION → locate the existing canonical source-analysis recovery/build function; recover missing analysis for the three jobs with no snapshot; then invoke the existing rendered-output recovery for the four completed jobs; read back corpus counts.
- DO-NOT-REPEAT → no new importer, no fixture-specific route, no direct canonical-row mutation, no evidence VERIFIED promotion, no stale CI PASS.

# FINAL LIVE WRITE-BACK — 2026-09-30 / EVIDENCE TRUTH GUARD + CURRENT REPORT

- EXECUTION BOUNDARY SHA → `0165660ab6eab84660b3f130d7caa714531b9c5c`; the next control-plane writeback commit is memory-only.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- REAL REPORT → 735/735; durable 9/9 completed/rendered; canonical dataset 735; canonical import commit rows 735; source analysis 735×7; quality 87.
- SOURCE RECORD → ready/passed file record `071db872-2f17-4acf-8374-b1e2d9852985`; exact source hash; authoritative storage `.../5925f3a2-fbac-4678-9490-b892dca35d4d.pdf`; pending-hash false.
- EVIDENCE CORRECTION → current persisted rendered evidence is `AWAITING_EVIDENCE_SNAPSHOT`; no Staging `kpi_evidence_snapshots` record contains this source hash. `TRUSTED` remains a separate source-quality state.
- RECOVERY GUARD → live `recover_completed_report_execution_result` is v3 and rejects `evidenceStatus=VERIFIED`; repository lineage is `supabase/migrations/20260930120000_harden_report_recovery_evidence_state.sql`.
- CANONICAL COMMIT PROOF → Smart Report computes tenant-scoped canonical commit row count independently and exposes `canonicalCommitVerified`; this field never changes evidence status.
- UI ROOT FIXES → Executive / Trust / Decision / Work source-bind the active report by job + hash; Trust displays canonical commit proof separately; decision/action/outcome/learning/replay/benchmark remain their persisted states.
- DURABLE EXECUTION GUARD → main contains the strengthened existing coordinator contract blocking production references to `InMemoryReportQueue`/`ReportExecutionCoordinator` outside canonical in-memory implementation/test files.
- BUSINESS TRUTH → no fabricated financial KPI, recovery value, benchmark, decision, action, outcome, or learning.
- CORPUS TRUTH → GitHub exact-head `tests/fixtures/realistic-reports/` remains README-only; Staging operational records are not Git corpus evidence.
- PROOF BOUNDARY → Staging source/recovery/canonical/evidence readback proven; exact current-SHA build/typecheck/CI not exposed; Vercel build-rate-limited; authenticated Edge proof not proven; TinyFish browser unavailable at current wallet.
- ACTION STATUS → `IN_PROGRESS` only for exact-current-SHA certification/runtime/browser closure.
- DO-NOT-REPEAT → no re-import, no canonical-row rewrite, no evidence promotion, no tenant bypass, no stale PASS, no database-to-browser inference.
- NEXT EXACT ACTION → consume exact-current-SHA CI/build evidence if exposed; otherwise continue independent production execution proof while preserving this completed report.

# PRE-CANONICAL-RECOVERY-GUARD CHECKPOINT — 2026-09-30

- EXACT MAIN EXECUTION HEAD → `dab7dc027e9df09562b5a6e1eb555b0599e59abe`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- VERIFIED READBACK AFTER CORRECTION → import completed; rendered evidence state is `AWAITING_EVIDENCE_SNAPSHOT`; trust `TRUSTED`; decision `NO_DECISION_COMMITTED`; action `NO_ACTION_COMMITTED`; benchmark `INSUFFICIENT_SAMPLE`; source pending-hash false.
- CANONICAL INTEGRITY → 735 canonical dataset rows and 735 canonical import commit rows remain unchanged.
- ROOT ISSUE NOW CLOSED → no KPI evidence snapshot for this source hash exists; therefore `VERIFIED` was not justified and was corrected through governed recovery.
- NEXT ROOT HARDENING → recovery itself must reject `evidenceStatus=VERIFIED`; evidence acceptance must remain a separate contract.
- DO-NOT-REPEAT → no re-import, no canonical-row mutation, no browser inference.
- ACTION STATUS → `IN_PROGRESS`.
- NEXT EXACT ACTION → harden the existing recovery function against VERIFIED evidence promotion, capture the guard in the repository migration lineage, then read back the current report again.

# PRE-LONG-ACTION CHECKPOINT — 2026-09-30 / CORRECT PERSISTED EVIDENCE STATE

- EXACT MAIN EXECUTION HEAD → `04e74d270b902077ab67717ca0e5e615e4fbb68d`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- REPRODUCED SEMANTIC ISSUE → persisted renderedOutput currently says `evidenceStatus=VERIFIED`, while the canonical adapter contract generates `AWAITING_EVIDENCE_SNAPSHOT` and no KPI evidence snapshot in the tenant contains this source hash.
- SAFETY RULE → correct only rendered evidence metadata through the existing governed recovery function; do not touch canonical_dataset_records and do not re-import.
- VERIFIED FACTS THAT MUST REMAIN → source hash, ready/passed file record, canonical 735 rows, canonical commit 735, source analysis 735×7 quality 87, decision/action/outcome/learning/benchmark states.
- ACTION STATUS → `IN_PROGRESS`.
- NEXT EXACT ACTION → execute one governed recovery with renderedOutput.evidenceStatus corrected to `AWAITING_EVIDENCE_SNAPSHOT`; read back persisted evidence state and canonical counts; then update canonical memory/index.

# FINAL LIVE WRITE-BACK — 2026-09-30 / REPORT SOURCE + DURABLE EXECUTION CLOSURE FRONT

- EXECUTION BOUNDARY SHA → `4aee2ad02ee1f3ce9f026ead2f1ba5dc04b5c3f0`; the subsequent control-plane writeback commit is memory-only.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- REAL REPORT → 735/735 processed; durable stages 1..9 completed/rendered; canonical dataset 735; canonical import commit 735; source analysis 735×7; quality 87.
- SOURCE RECORD → import now points to ready/passed file record `071db872-2f17-4acf-8374-b1e2d9852985`; exact hash; authoritative storage `.../5925f3a2-fbac-4678-9490-b892dca35d4d.pdf`; source_record_pending_hash=false.
- RECOVERY ROOT FIX → repository migration `20260930110000_reconcile_completed_report_source_record_binding.sql` enforces verified source-record resolution and fail-closed storage/hash/security checks during completed-report recovery.
- EVIDENCE ROOT FIX → persisted evidence state is never promoted to VERIFIED from canonical commit presence. Canonical commit proof is a separate tenant-scoped field derived from `canonical_import_commits`.
- UI ROOT FIX → Executive / Trust / Decision / Work are source-bound; source hash is validated; Trust presents canonical commit proof separately from truth/evidence state.
- EXECUTION ROOT GUARD → the canonical `check-report-execution-coordinator-contract.mjs` on main now fails if production source imports/instantiates the in-memory execution queue/coordinator outside canonical in-memory implementation/test files.
- RUNTIME RESULT STATES → TRUSTED / VERIFIED / NO_DECISION_COMMITTED / NO_ACTION_COMMITTED / NOT_AVAILABLE / INSUFFICIENT_SAMPLE remain persisted truth; no fabricated outcomes/learning/replay/benchmark.
- CORPUS TRUTH → GitHub exact-head `tests/fixtures/realistic-reports/` still only README; Staging operational file_records/report_execution_jobs are not fixture-corpus proof.
- PROOF BOUNDARY → Staging source/recovery/canonical readback proven. Exact current-SHA build/typecheck/CI is not exposed by available GitHub wrapper; Vercel is build-rate-limited; authenticated Microsoft Edge/browser proof remains NOT PROVEN; TinyFish browser automation is unavailable at current wallet balance.
- ACTION STATUS → `IN_PROGRESS` only for current-SHA certification/runtime/browser closure.
- DO-NOT-REPEAT → no re-import, no direct canonical-row rewrite, no evidence promotion, no tenant bypass, no stale PASS, no database-to-browser inference.
- NEXT EXACT ACTION → consume exact-current-SHA CI/build evidence if exposed; otherwise continue canonical production-execution semantic proof without touching the completed report data.

# FINAL LIVE WRITE-BACK — 2026-09-30 / REPORT SOURCE RECORD + CANONICAL COMMIT PROOF

- EXECUTION BOUNDARY SHA → `a4d610076e9b5e7925e73cfae528cb4e7cd22cb4`; the following writeback commit is control-plane only.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- REPORT RESULT → 735/735 processed; 9/9 durable stages completed/rendered; canonical dataset 735; canonical import commit rows 735; source analysis 735×7; quality 87.
- SOURCE RECORD RECOVERY → import now binds verified `ready/passed` file record `071db872-2f17-4acf-8374-b1e2d9852985`; exact file hash; authoritative storage path `f68.../imports/5925f3a2-fbac-4678-9490-b892dca35d4d.pdf`; `source_record_pending_hash=false`.
- SEMANTIC EVIDENCE → no code path now promotes persisted evidence state to VERIFIED merely because canonical commit exists.
- CANONICAL COMMIT PROOF → Smart Report reads tenant-scoped `canonical_import_commits` and computes `canonicalCommitVerified` separately from trust/evidence status.
- SOURCE-BOUND UI → Executive / Trust / Decision / Work consume the real report job and preserve `reportJobId + sourceHash`; domain routes already preserve this source context.
- BUSINESS STATES → persisted report remains TRUSTED / VERIFIED / NO_DECISION_COMMITTED / NO_ACTION_COMMITTED / NOT_AVAILABLE / INSUFFICIENT_SAMPLE; no fabricated outcome/learning/replay/benchmark.
- RUNTIME EXECUTION GUARD → PR #684 contains a strengthened existing coordinator contract intended to fail if production source references `InMemoryReportQueue` or `ReportExecutionCoordinator` outside canonical in-memory/test files. Its CI is not exposed by the connector; PR is not merged and is not treated as PASS.
- CORPUS TRUTH → GitHub exact-head `tests/fixtures/realistic-reports/` still contains only README; Staging operational files are not Git fixture evidence.
- PROOF BOUNDARY → Staging source/recovery/canonical readback is proven; exact current-SHA typecheck/build is not exposed; Vercel is build-rate-limited; authenticated Edge proof is NOT PROVEN; TinyFish wallet cannot run browser automation.
- ACTION STATUS → `IN_PROGRESS` only for current-SHA certification/runtime/browser closure.
- DO-NOT-REPEAT → no re-import, no direct canonical-row rewrite, no evidence promotion, no tenant bypass, no stale PASS, no database-to-browser inference.
- NEXT EXACT ACTION → consume exact-current-SHA CI/build evidence when exposed; otherwise continue independent production-execution semantic proof while preserving this report.

# FINAL LIVE WRITE-BACK — 2026-09-30 / SOURCE-RECORD RECOVERY + SEMANTIC EVIDENCE FIX

- EXACT MAIN HEAD → `49c9a83eb39982d6edcea340de2be312364c009f`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- REAL REPORT STATE → import completed 735/735; durable lifecycle completed/rendered with 9/9 tasks completed; canonical dataset 735; canonical import commit sum 735; source analysis 735×7, quality 87.
- ROOT FIX 1 → `SourceBoundReportSurface` now consumes the actual report job for Executive/Trust/Decision/Work surfaces; route wrappers preserve `reportJobId + sourceHash`; source-context pages do not present unrelated company-wide intelligence as report truth.
- ROOT FIX 2 → `fetchSmartReport` now preserves persisted evidence semantics; it no longer upgrades an evidence state to VERIFIED because canonical commit exists.
- ROOT FIX 3 → governed recovery now reconciles the completed import to a verified company-scoped `file_records` row by exact source hash/security/file status and persists authoritative storage provenance. Repository migration: `supabase/migrations/20260930110000_reconcile_completed_report_source_record_binding.sql`.
- LIVE READBACK AFTER RECOVERY → `file_record_id=071db872-2f17-4acf-8374-b1e2d9852985`; file hash exact source hash; security `passed`; file status `ready`; storage path `f68.../imports/5925f3a2-fbac-4678-9490-b892dca35d4d.pdf`; `source_record_pending_hash=false`; import status completed.
- CANONICAL INTEGRITY → 735 canonical dataset rows and 735 canonical commit rows remain unchanged after recovery. No re-import and no canonical-row rewrite occurred.
- BUSINESS OUTPUT TRUTH → current persisted report states remain TRUSTED / VERIFIED / NO_DECISION_COMMITTED / NO_ACTION_COMMITTED / NOT_AVAILABLE / INSUFFICIENT_SAMPLE. Decision/action/outcome/learning/replay/benchmark are not fabricated.
- CORPUS TRUTH → exact GitHub `tests/fixtures/realistic-reports/` still contains only README; Staging file_records/report_execution_jobs are operational evidence, not Git fixture-corpus evidence.
- PROOF BOUNDARY → source, recovery, canonical persistence and readback are proven on Staging. Exact current-SHA automated build/typecheck and authenticated Microsoft Edge/browser proof remain NOT PROVEN. Vercel remains externally build-rate-limited; TinyFish wallet is negative and cannot run browser automation.
- ACTION STATUS → `IN_PROGRESS` only for exact-current-SHA certification/runtime/browser closure.
- DO-NOT-REPEAT → no blind re-import, no direct canonical-row edit, no evidence-state promotion, no tenant bypass, no global-to-source inference, no stale PASS, no fake browser proof.
- NEXT EXACT ACTION → consume exact-current-SHA CI/build evidence if exposed; otherwise continue independent canonical runtime/production-execution proof while preserving this completed report.

# PRE-CANONICAL-RECOVERY CHECKPOINT — 2026-09-30 / SOURCE RECORD BINDING

- EXACT MAIN HEAD BEFORE DB RECOVERY FIX → `b670f79ed15602983a980f8080810f527f7a296a`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- REPRODUCED ROOT ISSUE → completed import result_summary points at storage path `80cdfa2b-42ad-4007-a9e0-5632014118af.pdf` with `source_record_pending_hash=true`, while the same tenant has a ready/passed file_record carrying the exact source hash and storage path `5925f3a2-fbac-4678-9490-b892dca35d4d.pdf`.
- SAFETY RULE → do not rewrite canonical dataset rows and do not re-import. Fix the existing governed recovery contract so a completed-job recovery reconciles the import's source record to a verified ready file_record matching the source hash and file identity.
- ACTION STATUS → `IN_PROGRESS`.
- NEXT EXACT ACTION → update the existing `recover_completed_report_execution_result` DB contract; execute one governed recovery readback for this completed job; verify file_record_id/source path/hash alignment and no canonical-row count change.

# FINAL LIVE WRITE-BACK — 2026-09-30 / SOURCE-BOUND RESULT SURFACES

- EXACT MAIN HEAD → `9043e6f10cef89c23aa72ad1f0060018cff0b1ed`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- REAL REPORT RESULT → 735/735 processed; all 9 durable stages completed/rendered; canonical commit 735; source analysis 735 rows × 7 columns; quality 87; persisted outputs for Executive/Evidence/Decision/Work Center/Inventory.
- COMPLETED PRODUCT FIX → `fetchSmartReport` now returns durable stage evidence; new `SourceBoundReportSurface` provides source-specific Executive/Trust/Decision/Work views; all four route wrappers switch to this surface when `reportJobId` exists and reject a mismatched `sourceHash`.
- SOURCE-TRUTH RULE → source-context Decision does not show unrelated company-wide recommendations/alerts; source-context Work Center shows the report's durable lifecycle rather than global queue health; source-context Executive and Trust surfaces read the persisted report itself.
- CORPUS TRUTH → exact-head `tests/fixtures/realistic-reports/` still contains only README. The persisted 35-report Smart cohort is staging evidence, not a claim that 35/40+ fixture files are tracked in Git.
- PROOF BOUNDARY → code and Supabase staging persistence/readback are evidenced; exact current-SHA typecheck/build status is not exposed by the available GitHub wrapper, and combined status currently shows only Vercel build-rate-limit failure/pending deployment. Authenticated Microsoft Edge visual proof remains NOT PROVEN.
- ACTION STATUS → `IN_PROGRESS` only for exact-SHA runtime/hosting proof; completed report itself is not reopened or re-imported.
- DO-NOT-REPEAT → no blind re-import, no canonical row rewrite, no tenant bypass, no global-to-source inference, no stale PASS, no fake browser proof.
- NEXT EXACT ACTION → current-head CI/browser/hosting proof; if unavailable, preserve this SHA and continue only the remaining runtime contract closure.

# PRE-LONG-ACTION CHECKPOINT — 2026-09-30 / SOURCE-BOUND RESULT SURFACES

- EXACT MAIN HEAD → `8d00d2a39bf743681e1033111e180c52d7906cd2`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- CURRENT TARGET → complete the source-bound result contract: when `reportJobId` exists, Executive / Trust-Evidence / Decision / Work Center must consume the persisted report result rather than silently rendering unrelated company-wide intelligence.
- REPORT STATE → already completed/rendered 735/735 through all nine durable stages; no re-import.
- PRODUCT RULE → no global recommendation/alert/worker state is presented as source-specific unless an explicit persisted relationship exists.
- DO-NOT-REPEAT → no re-import, no canonical-row mutation, no fabricated decision/action/outcome/benchmark, no DB-to-browser PASS.
- NEXT EXACT ACTION → patch only the four source-context result surfaces and add the minimum targeted contracts needed to enforce source binding; then persist execution-index/live-memory reconciliation.
- ACTION STATUS → `IN_PROGRESS`.

# FINAL LIVE RECONCILIATION — 2026-09-30

- EXACT MAIN HEAD → `c29d61cc09021a15cf9df3c93031138e3b6da0a5`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- VERIFIED STAGING RESULT → 735/735 processed; nine durable stages completed/rendered; canonical commit 735; source analysis analyzed 735×7 at quality 87; persisted rendered outputs are source-bound for Executive/Evidence/Decision/Work Center/Inventory.
- CURRENT CODE RESULT → source-bound route/context propagation is persisted; completed import read-model reconciles historical zero valid_rows from consistent committed result data without mutating canonical records.
- CORPUS TRUTH → GitHub exact-head `tests/fixtures/realistic-reports/` contains only README; no fabricated fixture count. Current report front is a persisted staging report, not a Git corpus substitution.
- PROOF BOUNDARY → source and staging persistence/readback are proven; exact-current-SHA typecheck/build and authenticated browser proof are NOT PROVEN. Vercel remains build-rate-limited and current push workflow runs are not exposed by the available GitHub wrapper.
- ACTION STATUS → `IN_PROGRESS`; report remains open for exact-SHA UI/runtime closure.
- DO-NOT-REPEAT → no re-import, no direct canonical data rewrite, no tenant bypass, no stale PASS, no DB-to-browser inference.
- NEXT EXACT ACTION → consume current-SHA CI/browser evidence when exposed; otherwise continue the remaining source-bound screen/action contract work from this exact head.

# LIVE CHECKPOINT — 2026-09-30 / REPORT LEDGER + SOURCE-BOUND UI FRONT

- EXACT MAIN HEAD → `375d2c712f60a60d9979c0d0718807ab8e7030c1`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; durable job `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- ACTUAL RUNTIME READBACK → import completed 735/735; durable tasks 1..9 completed/rendered; canonical commit count 735; source analysis snapshot `e24ac287-234b-43ea-9434-ad60bdbb2eaa` analyzed 735 rows × 7 columns, quality 87.
- RENDERED SOURCE RESULT → source-bound Executive, Evidence/Trust, Decision, Work Center, and Inventory outputs persisted; trust TRUSTED; evidence VERIFIED; decision/action NO_*_COMMITTED; outcome/learning NOT_AVAILABLE; benchmark INSUFFICIENT_SAMPLE.
- ROOT FIX PERSISTED → completed import read-model now reconciles a historical `valid_rows=0` ledger counter from persisted `result_summary.committed=735` only when consistent with total rows; no canonical data mutation or re-import.
- CURRENT UI SURFACE WORK → Smart Report is source-bound; post-import links carry `reportJobId + sourceHash`; Executive/Trust/Decision/Work Center/Liquidity retain source context; Sales/Purchases/Inventory/Receivables/Profitability switch to source-bound domain surfaces when a report context is present.
- CORPUS FACT → exact GitHub `tests/fixtures/realistic-reports/` currently contains only README on the verified exact HEAD; no GitHub fixture corpus was fabricated or substituted. The current report is an already persisted staging report front, not a claim about Git-tracked fixture count.
- TEST/PROOF STATE → repository source verification and staging persistence/readback are proven; exact-current-SHA typecheck/build/CI and authenticated Edge/browser proof are NOT PROVEN. Vercel is externally build-rate-limited; current GitHub wrapper returned no push workflow runs for the current SHA.
- ACTION STATUS → `IN_PROGRESS` for the report front; runtime/browser closure remains blocked externally.
- DO-NOT-REPEAT → no re-import, no direct canonical-row rewrite, no tenant bypass, no stale PASS, no database-to-browser inference.
- NEXT EXACT ACTION → consume current-SHA repository CI/browser evidence when exposed; otherwise continue the remaining source-bound screen contract work, preserving this report and SHA.

# PRE-LONG-ACTION CHECKPOINT — 2026-09-30 / EXACT-HEAD TEST FRONT

- EXACT MAIN HEAD → `0bf973554a3396159cb3548d4f17c37a0eb77895`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- CURRENT REPORT STATE → previously persisted completed/rendered/source-bound; no blind re-import.
- CURRENT STAGE → post-render / source-bound business-surface verification.
- LAST VERIFIED STATE → durable completed/rendered + canonical lineage + persisted Smart Report surfaces from prior current-SHA evidence; authenticated exact-SHA browser closure remains unproven.
- ACTION IN PROGRESS → exact-head typecheck/build + targeted report-surface contract execution.
- ACTION STATUS → `IN_PROGRESS`.
- REAL BLOCKER → none for repository-side test execution; hosting/browser evidence remains separately constrained.
- DO-NOT-REPEAT → no re-import, no direct canonical-row edit, no stale PASS, no fake browser proof.
- NEXT EXACT ACTION → execute exact-head compile/build and targeted report-surface checks; fix only the first reproduced current-SHA failure, then re-run the same target.

# LIVE SURGICAL CHECKPOINT — 2026-09-30 / SOURCE-BOUND BUSINESS SURFACES

- EXACT MAIN HEAD → `bef320eeeed361f1f32a2e0895e2f73147a067bc`.
- REAL SURGICAL FIXES IN THIS WAVE →
  1. Repaired `src/lib/report-smart.ts`; removed stray post-function code that could invalidate the Smart Report query module.
  2. Added reusable `src/components/ReportSourceContext.tsx` with tenant-scoped `reportJobId + sourceHash` validation and navigation across Smart Report, Executive, Evidence, Decision, Work Center, and specialty surfaces.
  3. Bound Executive Report, Trust/Evidence, Decision Experience, Work Center, and Liquidity to preserve the active source context instead of silently losing it.
  4. Bound Sales, Purchases, Inventory, Receivables, and Profitability report routes to a source-specific surface when `reportJobId` is supplied; generic company-wide pages remain available only without source context.
  5. Post-import output buttons now preserve `reportJobId + sourceHash` so navigation never drops source identity.
  6. Smart Report catalog format eligibility expanded beyond the earlier narrow extension list to the supported report/document/image formats.
- PRODUCT BOUNDARY → fixture reports remain acceptance evidence only. The implementation target is the generic source-analysis + canonical business-decision pipeline for supported file formats, not a fixture-specific workflow.
- VERIFICATION → latest GitHub commit status still shows only the external Vercel build-rate-limit failure; no application PASS is claimed from that status. Authenticated Edge visual proof is still NOT PROVEN.
- CURRENT ACTION STATUS → `IN_PROGRESS`.
- NEXT EXACT ACTION → run exact-head typecheck/build + targeted report-surface tests through the repository's existing gates; fix the first newly reproduced compile/runtime contract only. Then verify one source-bound job across Smart → domain → evidence → decision → work-center without re-importing completed data.

# CURRENT RESUME POINTER — 2026-09-30

- CURRENT RESUME POINTER → `Report Smart Surface / source-bound business report`.
- EXACT MAIN HEAD → `e8bfce227e6067c78305ff1ea4492a4cdd580eb2`.
- SURGICAL FIXES IN THIS WAVE →
  1. Duplicate source now reopens an existing persisted Smart Report when available instead of dead-ending at "مكرر".
  2. Smart Report catalog queries persisted rendered outputs directly and normalizes verified evidence state.
  3. Smart Report detail promotes VERIFIED when analysis is persisted and canonical commit is verified.
  4. Smart Report page now renders Executive Brief, real source metrics, completeness, top source exposures/items, evidence state, decision/action/outcome/learning/benchmark states, provenance, and actual sample rows.
  5. Domain-surface links preserve `reportJobId` + `sourceHash` context for the next source-bound surface integration.
  6. Structured analytical report scoring no longer equals canonical-column mapping coverage; specialty inference uses content first and filename only as fallback.
- LIVE TENANT READBACK → company `f68a7e91-3c7e-46fb-97a8-e339bec04e13` has 35 persisted Smart Reports; `اعمار الديون للعملا.pdf` is Job `174196b5-42cf-4654-9721-13ac8d5a29db`, 27 rows, quality 98, specialty receivables, canonicalCommitVerified=true, analysis snapshot `efe39091-3055-4fd6-bd23-c11424bc5d90`.
- IMPORTANT LINKING RULE → never hand out a Smart Report Job ID from another company. Smart detail is tenant-scoped.
- HOSTING → Vercel current exact-head deploy is blocked by build-rate-limit; Netlify accessible production is still on old commit `21f6562...`. Source fixes are persisted in GitHub but exact-head hosted proof is not yet claimed.
- ACTION STATUS → `IN_PROGRESS`.
- NEXT EXACT ACTION → publish exact HEAD `e8bfce...` to an accessible host, then verify the same tenant's `اعمار الديون للعملا.pdf` at Job `174196b5-42cf-4654-9721-13ac8d5a29db`, a fresh non-duplicate report, and a duplicate-existing report. No blind re-import.

# FINAL SESSION WRITE-BACK — 2026-09-30

- LAST CERTIFIED FUNCTIONAL CANDIDATE → `531b4e810ccd7ad10dc73ea745ed3c24aa0bc8f2`.
- REPORT FRONT → `تسعيرة الاصناف حسب رقم الصنف.pdf` / import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340` / source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- SMART CORPUS READBACK → 35 qualifying completed canonical report execution jobs; 35 rendered; 0 missing; 35 correctly bound to their job source hash.
- EXECUTED FIXES → persisted recovery contract for missing rendered outputs; source-bound smart report catalog/detail data layer; source-bound SmartReportPage; report-center real report cards; progressive-disclosure route contracts.
- TRUTH BOUNDARY → decision, approval, action, outcome, learning, replay and benchmark remain uncommitted/unavailable where no persisted evidence exists; no fabricated business outcomes.
- CI PROOF → Final Certification Gate, Quality, Final Batch, Execution Enforcement, Full Product Browser E2E and Storage Tenant Isolation passed on `531b4e810ccd7ad10dc73ea745ed3c24aa0bc8f2`.
- BROWSER PROOF → GitHub browser E2E is green; authenticated Microsoft Edge visual proof on the user device is still not independently observed, so no browser PASS is inferred.
- HOSTING PROOF → exact-SHA Vercel deployment remains blocked by external build-rate-limit; no stale deployment is claimed as current.
- NEXT EXACT ACTION → resume from this checkpoint; do not re-import the canary or any other completed report.

# LATEST SESSION WRITE-BACK — 2026-09-30 / REAL REPORT SMART-OUTPUT SURFACE / FUNCTIONAL CANDIDATE 7a5da321326e4a2d9965cea786f28c4e5e679bb7

- EXACT MAIN HEAD AT FUNCTIONAL CHECKPOINT → `7a5da321326e4a2d9965cea786f28c4e5e679bb7`.
- CURRENT CODE/TEST CANDIDATE → `7a5da321326e4a2d9965cea786f28c4e5e679bb7`.
- CURRENT REPORT FRONT → `تسعيرة الاصناف حسب رقم الصنف.pdf` / import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340` / source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- LIVE REPORT COHORT → 35 qualifying completed generic canonical report jobs; 35/35 now carry `renderedOutput`; 0 missing; 0 source-hash/sourceBound mismatches.
- REPORT SMART UI → new tenant-scoped catalog/detail data access in `src/lib/report-smart.ts`; new source-bound detail page `src/pages/SmartReportPage.tsx`; route `/reports/smart/:jobId`; report center cards link each real Job to its actual smart result surface.
- RESULT CONTENT → source, fingerprint, trust, quality, row count, specialty, Truth/Evidence/Signal/Intelligence states, Decision/Action/Outcome/Learning/Benchmark/Replay states, rendered surface links, analysis preview and provenance are all displayed from persisted records; no synthetic decision/outcome/benchmark values.
- RECOVERY → `public.recover_missing_report_rendered_outputs(company)` was executed once on Staging to reconstruct missing persisted `renderedOutput` from already completed durable jobs and canonical commits. No source was re-imported.
- UI TEST ROOT FIX → `/reports/smart/:jobId` is classified as internal progressive disclosure in `scripts/check-ui-route-completeness.mjs`; this is a governance/test contract change.
- CURRENT CI BLOCKS → Final Certification and Execution Enforcement currently reject the earlier HEAD because the execution index points to an older candidate; this governance checkpoint re-anchors the candidate to the functional SHA. Vercel remains externally rate-limited.
- BROWSER STATUS → PC01/Edge authenticated proof is still NOT PROVEN; no DB-to-browser inference is allowed.
- ACTION STATUS → `IN_PROGRESS`.
- NEXT EXACT ACTION → read back the resulting governance commit SHA and exact-head workflow results; fix only the first newly reproduced product/test failure, then return to authenticated UI proof for the same real report. Never re-import.
- DO-NOT-REPEAT → no blind re-import, no direct canonical-row mutation, no fake auth, no stale CI transfer, no browser PASS without observed authenticated rendering.

# LATEST SESSION WRITE-BACK — 2026-09-30 / FINAL EXACT-SHA REPORT CHECKPOINT / 4add362127e81c57f9d6309082aa2c5bacc98129

- EXACT MAIN HEAD → `4add362127e81c57f9d6309082aa2c5bacc98129`.
- CURRENT CODE/TEST CANDIDATE → `4add362127e81c57f9d6309082aa2c5bacc98129`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; fingerprint `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- REAL READBACK → import completed 735/735; durable job completed/rendered; all nine tasks completed; canonical lineage 735; renderedOutput source-bound.
- SMART RESULT READBACK → Executive, Evidence/Trust, Decision, Work Center, Inventory outputs persisted; quality 87; trust/evidence `TRUSTED/VERIFIED`; no decision/action; outcome/learning unavailable; benchmark `INSUFFICIENT_SAMPLE`.
- ROOT FIXES PERSISTED → canonical ESM runtime import chain repaired; Executive empty-state contract corrected; shared table rowcount corrected; Work Center zero-progress labeling corrected; mobile/Advisor/alert focus-trap contracts made explicit; runtime test harness corrected to separate execute-stage order from checkpoint persistence.
- EXACT-SHA CI → all required current-head gates are successful as of this checkpoint.
- HOSTED/UI BLOCKER → no authenticated tenant browser proof on the exact current SHA. Vercel deployment available is not current exact SHA; Netlify is stale; PC01 offline; TinyFish automation balance negative. No browser PASS is claimed.
- ACTION STATUS → `BLOCKED` only for exact authenticated UI/runtime closure.
- NEXT EXACT ACTION → exact-SHA authenticated runtime proof of the five persisted result surfaces, then CLOSE report. Do not re-import.
- NEXT REPORT → none.
- DO-NOT-REPEAT → stale pass, re-import, fake auth, direct row mutation, duplicate pipeline.

# LATEST SESSION WRITE-BACK — 2026-09-30 / REPORT EXECUTION TEST-HARNESS ROOT FIX / fce1648b37cc0733391c66e1b0bbd7793cbc4d4a

- EXACT MAIN HEAD → `fce1648b37cc0733391c66e1b0bbd7793cbc4d4a`.
- CURRENT CODE/TEST CANDIDATE → `fce1648b37cc0733391c66e1b0bbd7793cbc4d4a`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- ROOT FIX → `scripts/report-execution-runtime.test.ts` now separately asserts execute-stage order and checkpoint persistence order. The product runner still persists every durable stage; the test no longer conflates checkpoint writes with execute callbacks.
- PREVIOUS QUALITY FAILURE → strict deep-equal expected execute committed/rendered but observed execute rendered plus persisted rendered checkpoint because the harness used one array for both signals.
- VERIFIED PRODUCT CONTRACT PRESERVED → durable runner continues to call `store.saveCheckpoint` for each stage and then completes with rendered evidence.
- REPORT RESULT REMAINS → 735/735 completed; durable rendered; source-bound smart outputs persisted; no re-import.
- ACTION STATUS → `IN_PROGRESS` while current-SHA quality and certification terminalize.
- NEXT EXACT ACTION → consume current-SHA quality; repair only a genuinely new product/runtime failure.

# LATEST SESSION WRITE-BACK — 2026-09-30 / CANONICAL COMMIT BOUNDARY ESM FIX / 10a52f83b4ae128389ff3224e4d0db6e025a4341

- EXACT MAIN HEAD → `10a52f83b4ae128389ff3224e4d0db6e025a4341`.
- CURRENT CODE/TEST CANDIDATE → `10a52f83b4ae128389ff3224e4d0db6e025a4341`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- ROOT FIX → `canonical-commit.ts` now resolves `canonical-truth-boundary.ts` explicitly for the Node ESM/strip-types runtime chain.
- PREVIOUS QUALITY FAILURE → `ERR_MODULE_NOT_FOUND` for `canonical-truth-boundary` imported by `canonical-commit.ts`.
- REPORT RESULT REMAINS → 735/735 completed; durable rendered; source-bound outputs persisted; no re-import.
- ACTION STATUS → `IN_PROGRESS` while current-SHA quality/certification terminalize.
- NEXT EXACT ACTION → consume current-SHA quality and Final Certification first failure only.

# LATEST SESSION WRITE-BACK — 2026-09-30 / CANONICAL ESM CHAIN REPAIRED / e84b9b716b5e63aedc7e9a9a8f9025bd6241789e

- EXACT MAIN HEAD → `e84b9b716b5e63aedc7e9a9a8f9025bd6241789e`.
- CURRENT CODE/TEST CANDIDATE → `e84b9b716b5e63aedc7e9a9a8f9025bd6241789e`.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; import `54cf5fdd-4d94-4e1d-82f3-0d5bb7630340`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- ROOT FIX → completed the canonical report-execution ESM runtime chain with explicit `.ts` extensions in durable-production-runner, production-coordinator-bridge, and phase-kl-runtime, in addition to the existing adapter fixes.
- PREVIOUS QUALITY FAILURES → sequential ERR_MODULE_NOT_FOUND failures in durable-production-runner, canonical-commit, then durable-worker-adapter imports.
- REPORT RESULT REMAINS → 735/735 completed; durable rendered; source-bound smart outputs persisted; no re-import.
- ACTION STATUS → `IN_PROGRESS` while current-SHA gates terminalize.
- NEXT EXACT ACTION → consume current-SHA quality and Final Certification first failure only.

# LATEST SESSION WRITE-BACK — 2026-09-30 / FOCUS-TRAP ACCESSIBILITY ROOT FIX / 7fe6bc49c4fc001f04fa5af40932aecd9b6afc89

- EXACT MAIN HEAD → `7fe6bc49c4fc001f04fa5af40932aecd9b6afc89`.

# LATEST SESSION WRITE-BACK — 2026-09-30 / CURRENT PERSISTED REPORT BROWSER ACCEPTANCE PROVEN / 9d671da62763345693174a6a5fa4a47397382342

- EXACT CODE/TEST HEAD PROVEN → `9d671da62763345693174a6a5fa4a47397382342`.
- REPORT-FIRST FRONT → `تسعيرة الاصناف حسب رقم الصنف.pdf`.
- EXACT SOURCE HASH → `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`.
- SAME PERSISTED REPORT JOB → `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`.
- REAL CHROMIUM RUN → Full Product Browser E2E run `36679770124` / run `6264`; exact-checkout, build, preview, browser route, business journey, fail-closed gate, and artifact upload all SUCCESS.
- BROWSER RESULT → `artifacts/e2e-business/result.json` status `PASS`; exactHead matched; failures = `[]`; Chromium authentication and tenant resolution PASS.
- DURABLE REPORT PROOF → job completed; checkpoint `rendered`; renderedOutput exists; 9/9 durable tasks completed; source rows 735; authoritative canonical rows 735; canonical commit 735; analysis 735 × 7; quality 87; trust `TRUSTED`; evidence `AWAITING_EVIDENCE_SNAPSHOT`.
- SMART REPORT BROWSER PROOF → same persisted Job opened at `/reports/smart/:jobId`; exact source path/hash, 735 rows, quality, trust, evidence state and `EVIDENCE INSPECTOR` rendered; browser refresh/readback preserved the same source-bound state.
- SOURCE-BOUND SURFACE PROOF → same `reportJobId` + `sourceHash` passed on `/reports/executive`, `/trust`, `/decision-experience?stage=evidence`, `/work-center`, and `/reports/inventory`; each returned the same source-bound Job/hash and no unrelated global intelligence was promoted as source truth.
- TENANT ISOLATION PROOF → Tenant B resolved independently and could not read Tenant A report job, canonical row, source history, Smart Report, or report catalog entry for this source.
- NON-ACTIONS → no report re-import, no canonical row rewrite, no evidence promotion, no fake auth/JWT, no parallel importer, and no parallel Browser E2E framework.
- PLAYWRIGHT REPRODUCIBILITY → Playwright `1.63.0` is now a locked project devDependency/package-lock entry; workflow no longer installs Playwright with `npm install --no-save --package-lock=false`; `npm ci` installed the pinned version before the real Chromium run.
- ARTIFACT → `full-product-browser-proof-36679770124` uploaded successfully; 44 files; artifact id `11081267824`; digest `sha256:043d59685f11f25c2289063aaa946be712d5c9da4d6af3656b4279a1715f0666`.
- CURRENT ACTION STATUS → REPORT-FIRST Browser acceptance is proven for this code SHA and this persisted report. Final documentation/index update follows; after that the resulting exact SHA must be read back and its triggered Browser E2E consumed before final closure.
- NEXT EXACT ACTION → persist this checkpoint plus the Master Execution Index, then consume the final exact-SHA Browser E2E on the resulting documentation SHA. No re-import.

# FINAL LIVE BROWSER READBACK — 2026-09-30 / CURRENT HEAD b9d179212735dc3af0147bd6b97fde4d291c7bf4

- EXACT CURRENT MAIN HEAD → `b9d179212735dc3af0147bd6b97fde4d291c7bf4`.
- EXACT-CURRENT-SHA FULL PRODUCT BROWSER E2E → PASS: workflow run `36680171455`, run number `6265`, exact checkout matched `b9d179212735dc3af0147bd6b97fde4d291c7bf4`, exact build succeeded, authenticated Chromium route succeeded, persisted-report business journey succeeded, fail-closed browser gate succeeded, artifact upload succeeded.
- EXACT-CURRENT-SHA QUALITY → PASS: workflow run `36680171431`, run number `9575`; Typecheck, Lint, Build, performance/scale, intelligence/production and all listed quality/certification contracts completed successfully.
- CURRENT REPORT → `تسعيرة الاصناف حسب رقم الصنف.pdf`; reportJobId `f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0`; source hash `sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300`; source row count `735`.
- CURRENT REPORT BROWSER READBACK → exact source path/hash/job identity preserved; Smart Report plus Executive / Trust / Decision / Work Center / Inventory source-bound surfaces preserved the same reportJobId + sourceHash; tenant isolation remained enforced; no re-import occurred.
- BROWSER ARTIFACT → `full-product-browser-proof-36680171455`; artifact id `11081956234`; digest `sha256:137872163b74a3871b55cb64ff504c847231a70c7cbe057522bfb721814b268e`.
- PRODUCT TRUTH → application code is unchanged relative to the latest ready Vercel deployment code candidate `4cc01beeb6c5fe50fb025108814dc1b0a05edd3b`; the three commits after that candidate changed only governance memory/index and the browser-proof test script, not product/runtime source.
- EVIDENCE SEMANTICS → persisted report evidence remains governed separately; browser/render proof does not fabricate a missing evidence snapshot.
- DESKTOP REMOTE → PC01 is currently offline; no local-device/Edge claim is made from that unavailable connection. Exact-current-SHA Chromium browser proof is independently proven by GitHub Actions.
- ACTION STATUS → repository/browser acceptance is proven on the exact current HEAD. Do not re-import the current report. Remaining local-device action is optional verification when PC01 reconnects, not a blocker to the proven application code path.
- NEXT EXACT ACTION → use the ready application deployment that contains the same product/runtime source as the current HEAD for interactive inspection; preserve this exact-head proof and do not create another pipeline.


# LIVE CHECKPOINT — 2026-09-30 / PDF HEART + DOCUMENT INTELLIGENCE

- EXACT CURRENT HEAD → `5277eccf39c0f36e081cf161f8288811086cd769`.
- ROOT FIX 1 → PDF fallback no longer collapses a page into one phrase; it preserves page/visual-line boundaries through `extractPdfVisualLines`.
- ROOT FIX 2 → unstructured PDF lines now receive deterministic document intelligence: structure, section/heading presence, date presence/gaps, numeric/financial-line presence, while refusing to fabricate business fields.
- ROOT FIX 3 → Smart Report top items are derived from the full canonical row set rather than only the analysis preview sample.
- ROOT FIX 4 → Smart Report retry is in-place; it no longer requires `window.location.reload()`.
- ROOT FIX 5 → inventory intelligence distinguishes valid SKU repetition across warehouse grain from repeated records in the same source context and can surface price variation by SKU.
- REGRESSION CONTRACTS ADDED → PDF visual-line fallback, inventory intelligence grain, and document-intelligence line analysis.
- REAL CORPUS READBACK BEFORE THIS CODE WAVE → 39 completed generic report jobs with renderedOutput; 1 real report job remains non-completed and queued despite a decisioned checkpoint: `فواتير العملاء من تاريخ 01-01 حتى 30-08-2026.pdf`, job `d074ad5c-70d4-4402-a763-01129786f392`, import `bf206836-e52d-4b29-843a-6337403801e6`, source hash `sha256:f68f77f641cb54bbc30b9ece0ed9516700cb5ae48b6cbfb5b52317a8360faf10`, source rows expected `6562`. Its task ledger is still queued 1..9 while checkpoint says decisioned; this is an unresolved durable-execution reconciliation issue, not a closed report.
- SOURCE ACCESS REALITY → file record is present in tenant Storage metadata but its security/file hash are still pending and the private Storage object is not readable through the available public download path. No blind re-import or synthetic source data was used.
- TEST PROOF BOUNDARY → GitHub combined status currently exposes only the external Vercel build-rate-limit failure. The newly added regression scripts are persisted but have not been claimed as executed PASS without a runtime capable of running the exact repository checkout.
- DO-NOT-REPEAT → no re-import of completed reports, no canonical-row rewrite, no evidence promotion, no fake browser proof, no fixture-specific importer, no mock report.
- NEXT EXACT ACTION → resolve the queued `d074...` durable job from the actual private source if an authoritative server-side Storage execution path becomes available; otherwise continue with the next real report only after the queued job is explicitly blocked or recovered by existing canonical worker/runtime contracts.


# LIVE CHECKPOINT — 2026-09-30 / SERVER-AUTHORITATIVE SOURCE EXECUTION

- EXACT CURRENT HEAD → `0b07dafce94c8b3ed3fc3958c0f824f10b594597`.
- ARCHITECTURAL ROOT FIX → canonical import execution now supports authoritative server-side source reading from the tenant-private Storage object. The server downloads the file with service-role storage access after resolving the authenticated tenant and validating the file record/path.
- SERVER SOURCE CONTRACT → actual bytes are hashed server-side; supplied source hash must match; security scan and format detection run on the server; the canonical parser is reused; rows are reconciled with tenant/source provenance; analysis snapshot is persisted idempotently; file provenance is upgraded only after successful authoritative read.
- RESUME CONTRACT → an existing report_execution_job can be resumed by ID using its own job_key/sourceHash/checkpoint and the import ID carried in evidence keys, without creating a duplicate report job.
- CLIENT BOUNDARY → canonical execution requests now set `serverSourceAuthority=true`; local preview may remain client-side, but canonical truth is no longer dependent on client-parsed rows.
- REAL QUEUED REPORT → `فواتير العملاء من تاريخ 01-01 حتى 30-08-2026.pdf`, report job `d074ad5c-70d4-4402-a763-01129786f392`, import `bf206836-e52d-4b29-843a-6337403801e6`, expected source hash `sha256:f68f77f641cb54bbc30b9ece0ed9516700cb5ae48b6cbfb5b52317a8360faf10`, 6562 expected rows. It remains queued in the current Staging database because no authenticated execution trigger was available in this session; no fake completion was written.
- CORPUS READBACK → 39 completed generic report jobs with rendered output; 1 unresolved report job remains queued/open.
- PROOF BOUNDARY → current combined GitHub status exposes only Vercel build-rate-limit failure. New server-source contracts and regression scripts are persisted but not claimed executed PASS without an exact runtime workflow result.
- NEXT EXACT ACTION → execute the new authoritative resume endpoint against `d074ad5c-70d4-4402-a763-01129786f392` from an authenticated runtime, then read back 6562-source/analysis/canonical/rendered results and immediately continue the next report.


# LIVE CHECKPOINT — 2026-09-30 / SALE-READINESS HARDENING

- EXACT CURRENT HEAD → `4356ba2a6ffc10e27796255cc2e16496c248d99d`.
- PRODUCT HARDENING → server-authoritative private-source execution; resumable existing report job; idempotent analysis snapshot; PDF visual-line preservation; unstructured document intelligence; full-canonical top-item analysis; inventory grain-aware anomaly detection; source-bound cross-surface retry without losing report identity.
- RELEASE GATE → `test:release-core` combines typecheck + server-source-authority + PDF visual-line + inventory-grain + document-intelligence regression contracts. Full Product Browser E2E workflow was updated to run these before Chromium/business proof.
- LIVE DEPLOYMENT → Vercel production deployment for commit `70385467dad95383da179baa950dfc3384e4bf07` is READY at `report-advisor-mijx6ot97-injaz2.vercel.app`; runtime error query returned none. Later hardening commits are newer than that deployment and therefore are not yet claimed as live there.
- CORPUS STATE → Staging has 39 completed generic report jobs with rendered outputs and exactly 1 open generic report job. The open report is `فواتير العملاء من تاريخ 01-01 حتى 30-08-2026.pdf`, job `d074ad5c-70d4-4402-a763-01129786f392`, import `bf206836-e52d-4b29-843a-6337403801e6`, source hash `sha256:f68f77f641cb54bbc30b9ece0ed9516700cb5ae48b6cbfb5b52317a8360faf10`, expected 6562 rows. Its durable checkpoint is decisioned but task ledger remains queued and the import job is processing at 0 rows. It is not closed.
- SMART SURFACES READBACK → among the 39 completed generic reports, 38 have an inferred specialty, all 39 have rendered outputs with 4+ declared surfaces, all 39 have evidence status, and all 39 currently report benchmark status `INSUFFICIENT_SAMPLE` rather than invented cohorts.
- DO-NOT-REPEAT → do not create a second job for the open report, do not write synthetic 6562 rows, do not claim the new regression scripts PASS until an exact checkout runtime executes them.
- NEXT EXACT ACTION → get the newer hardening HEAD deployed/verified, then execute the server-authoritative resume path for the single open report and read back its real 6562-row extraction/canonical/analysis/rendered result before closing it.


# LIVE CHECKPOINT — 2026-09-30 / OPEN-REPORT CI EXECUTION GATE

- EXACT CURRENT HEAD → `0758154667a0cfc1f6cac4c02bd9d1c5cc653e49`.
- OPEN-REPORT EXECUTION GATE ADDED → `scripts/resume-open-report-server-proof.mjs` authenticates with the existing E2E test account, calls the exact canonical resume endpoint for `d074ad5c-70d4-4402-a763-01129786f392`, and verifies the same job reaches completed/rendered with exactly 6562 canonical rows, a 6562-row canonical commit, completed import job, analysis snapshot, rendered output, and exactly one durable job for the job key.
- CI WORKFLOW → Full Product Browser E2E now runs the open-report server proof before Chromium browser proof, using existing Supabase/E2E secrets. No local device or user browser is required for this proof path.
- LIVE DEPLOYMENT BOUNDARY → Vercel production deployment `dpl_3XueK4okyBMYmMtk27wohiPfMuDV` is READY for commit `70385467dad95383da179baa950dfc3384e4bf07`, which already includes the server-authoritative source execution core. The newest CI/open-report proof commits are newer than that deployment and have not been claimed as live on Vercel.
- STAGING DATA → 39 completed generic reports + 1 open report. Open report remains untouched in Staging until the CI server-proof executes it; no synthetic completion has been written from this session.
- NEXT EXACT ACTION → observe the CI proof result for the newest HEAD; if it passes, read back the open report as CLOSED and then expand the same proof pattern to the remaining corpus. If CI fails, fix the exact failing root cause and rerun by commit.


## LIVE CHECKPOINT — 2026-09-30 / REPORT RESULT HARDENING / HEAD 006e27a

Current main HEAD: `006e27a275d3c68cbe3290e637955ff82cd2dfd4`.

Executed hardening on the real result chain:
- PDF non-table fallback now preserves page + visual-line + visual-cell boundaries instead of collapsing a page into one opaque phrase.
- Native PDF visual fallback now enters REVIEW (quality 55–74) instead of being rejected solely because table semantics are unproven; OCR confidence thresholds remain fail-closed.
- Smart-report canonical row retrieval now paginates the real `canonical_dataset_records` instead of silently limiting intelligence to 2,000 rows, with a 50,000-row defensive ceiling and explicit PARTIAL_ANALYSIS state beyond it.
- Sales/Purchases/Inventory source-bound surfaces now derive top items from the full canonical rows and show whether the complete source is actually analyzed; preview rows remain preview-only.
- Source-bound specialty context now verifies the active source hash instead of trusting only the job id.

Observed gates:
- Vercel commit status remains FAILURE because the connected Vercel build is blocked by `build-rate-limit`.
- Netlify production site `aghbari-report-advisor` is READY but still deployed from old commit `21f6562dbca1016842f037299ffd8815b59fe1aa`.
- GitHub workflow wrapper cannot currently expose push-triggered workflow runs through the available connector; therefore no CI PASS is claimed.

NEXT EXACT ACTION: obtain an actual execution of the latest main HEAD (prefer Netlify or authenticated CI), then prove the same real report source through extraction -> canonical commit -> smart report -> specialty surfaces with exact row counts and source hash.
