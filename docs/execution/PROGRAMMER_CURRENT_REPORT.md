# PROGRAMMER CURRENT REPORT

SESSION HANDOFF = NOT READY
CURRENT_HEAD_RECONCILED = YES
PROGRAMMER_REPORT_STATUS = ACTIVE_EXECUTION

REPORT_FOR_HEAD = 5184cc1fe839a794cf2c7f4c5e1568d16aaaff8d
UPDATED_AT = 2026-10-02T14:40:00Z
CURRENT_BRANCH = fix/current-head-runtime-provenance-20261002
PR = #730 OPEN / NOT MERGED / MERGEABLE
CURRENT_BRANCH_HEAD = 5184cc1fe839a794cf2c7f4c5e1568d16aaaff8d
CURRENT_EXECUTION_HEAD = 5184cc1fe839a794cf2c7f4c5e1568d16aaaff8d
CURRENT_MAIN_HEAD = 0c337e58898d88d8a7d2a60a26773b34d90c6dd3
LATEST_COMMIT = ci: serialize report value cohort per pull request
LATEST_CI = current-head checks will supersede all prior SHA evidence; no current live/browser/certification PASS claimed yet

WHAT_I_WAS_ASKED_TO_DO = Reconcile exact branch/PR/report/state, close the authenticated Evidence Passport SELECT boundary without widening mutation privileges, fix the live negative-path assertion, investigate the cohort timeout, prove the Smart Business Action Chain, and persist truthful handoff.

WHAT_I_ACTUALLY_DID = Reconciled the branch HEAD against PR #730; confirmed the prior report/state drift; fixed Evidence Passport authenticated SELECT with least-privilege GRANT; preserved RLS and denied authenticated mutations/anon access; fixed negative-path helper to accept one documented error from an allowed set; added same-tenant/wrong-tenant/anon SELECT assertions to the live gate; read-only verified the staging privilege and RLS boundary; profiled the cohort queries; persisted this report and the session state.

WHAT_IS_PROVEN = Branch ref and PR head are a6f19a064003e94c508b8a27bded19933465376c. Staging report_evidence_passports privileges are authenticated SELECT=true, authenticated INSERT/UPDATE/DELETE=false, anon SELECT=false, RLS=true. Same-tenant authenticated row visibility returns 1; wrong-tenant visibility returns 0; anon access fails with SQLSTATE 42501. Workflow-batch, security-definer, session-handoff and diff-check passed on PC01 at the prior code state; current-head static proof still needs one fresh readback after this change. The 42-report cohort is real and analyzed, but the full action chain is not yet proven.

FIRST_ACTIVE_FAILURE = Historical current-head P0-A was authenticated GET /report_evidence_passports -> HTTP 403 / PostgreSQL 42501. Root cause confirmed: authenticated table SELECT privilege was absent.
CURRENT_ACTIVE_RUNTIME_FRONT = Evidence Passport Live Proof and Browser E2E on the new exact HEAD a6f19a064003e94c508b8a27bded19933465376c.

ROOT_CAUSE = report_evidence_passports had RLS/policy but no authenticated table SELECT privilege. P0-B historical wrong-tenant assertion was too strict because the helper required all fragments instead of one documented fail-closed error.

FILES_CHANGED =
- supabase/migrations/20261002165000_report_evidence_passports_authenticated_select.sql
- scripts/report-evidence-passport-gate-live.test.mjs
- docs/execution/PROGRAMMER_CURRENT_REPORT.md
- docs/execution/CURRENT_SESSION_STATE.md
- docs/execution/PROGRAMMER_REPORTS/2026-10-02/SESSION-20261002-1413.md

MIGRATIONS =
- Added 20261002165000_report_evidence_passports_authenticated_select.sql
- SQL: GRANT SELECT to authenticated; REVOKE authenticated INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER; REVOKE ALL anon.
- Applied the equivalent SQL directly to staging for proof.
- No RLS policy was weakened and no mutation privilege was added.

TESTS_AND_RUN_IDS =
- PC01 prior static proofs: workflow-batch PASS, security-definer PASS, session-handoff PASS after full-history, git diff --check PASS.
- Staging privilege proof: authenticated SELECT=true; authenticated INSERT/UPDATE/DELETE=false; anon SELECT=false; RLS=true.
- Staging same-tenant RLS read: visible_rows=1.
- Staging wrong-tenant RLS read: visible_rows=0.
- Staging anon SELECT proof: SQLSTATE 42501 permission denied.
- Current exact-head CI runs have not yet been consumed; do not transfer older SHA runtime PASS.

DATABASE_PROOF =
- report_evidence_passports is RLS-enabled with the tenant SELECT policy.
- authenticated SELECT is now granted; authenticated mutation privileges remain false; anon has no privilege.
- The existing RLS tenant predicate remains company_id = public.current_company_id().
- Provisioning and evidence-gate SECURITY DEFINER mutation functions remain service_role-only where applicable.
- Security advisory remains open for public.canonical_import_repair_history RLS disabled; no automatic remediation was applied.

COHORT_PLAN_PROOF =
- canonical_import_commits uses the exact composite unique index (company_id, entity_type, source_hash), estimated plan cost ~0.28..2.50.
- canonical_dataset_records uses company_id+source_hash index and filters semantic_domain, estimated cost ~0.42..2.64; no full table scan observed.
- source_analysis_snapshots uses company_id+source_hash index and filters analysis_status, then sorts by created_at/id, estimated cost ~0.27..2.50.
- Therefore the earlier 57014 is not currently proven to be caused by a catastrophic scan. Next required proof is contention/repeated-refresh behavior or actual execution timing; no blind timeout increase or index has been applied.

SMART_REPORT_READBACK =
- candidate reports=42
- unique source hashes=42
- tenants=4
- formats=32 PDF + 10 XLSX
- analyzed=42
- quality avg=93.64, min=76, max=100
- renderedOutput reports=42/42
- renderedOutput outputs=135
- specialties=8
- VERIFIED=40/42
- READY=40/42
- benchmark status declared=17/42
- latest verified passport still has no linked recommendation/decision/approval/work/outcome; full action chain remains NOT PROVEN.

RUNTIME_DEPLOYMENT_PROOF =
- No current-head deployment proof yet.
- Vercel remains blocked by build-rate-limit.
- Netlify remains the free runtime path; prior deployment evidence is not transferred across SHA.

BROWSER_PROOF =
- No authenticated browser PASS claimed on a6f19a0 yet.
- The new live gate contains authenticated same-tenant SELECT, wrong-tenant SELECT, and anon SELECT assertions.
- Evidence Passport Live Proof and Full Product Browser E2E are the next exact-head runtime checks.

PRODUCT_UX_UI_DELTA =
- No product UI scope expansion.
- This cycle is runtime/evidence boundary closure and proof only.

REMAINING_OPEN =
- Consume current-head Evidence Passport Live Proof and Full Product Browser E2E.
- Verify P0-B negative-path result on current HEAD.
- Finish P1-A by proving the cause of 57014 and applying the smallest evidence-backed optimization if still reproducible.
- Prove a real source-bound Recommendation -> Decision -> Approval -> Work -> Outcome -> Readback chain on one verified passport.
- Keep Phase F independent and uncertified.
- Maintain the open RLS advisory on canonical_import_repair_history until policy-backed remediation is defined.

DO_NOT_REPEAT =
- Do not use 28c6ea3/fbec841 or any older SHA as current runtime proof.
- Do not grant authenticated write privileges to report_evidence_passports.
- Do not bypass RLS or weaken company_id = current_company_id().
- Do not accept every error string in negative-path tests; only the documented fail-closed alternatives.
- Do not raise statement_timeout blindly.
- Do not claim 42 rendered / 40 verified as proof of action-chain completion.
- Do not reopen fixed workflow/search_path/session-handoff defects unless current-head evidence regresses.

NEXT_EXACT_ACTION = Run current-head static checks on a6f19a0, then consume the new Evidence Passport Live Proof and Full Product Browser E2E; after P0 closure, reproduce/diagnose the 57014 cohort timeout with execution/lock evidence and complete one source-bound action-chain readback.

SESSION_HANDOFF = NOT READY


## P1_RUNTIME_PROOF
- Passport privilege proof: authenticated SELECT=true; authenticated INSERT/UPDATE/DELETE=false; anon SELECT=false; RLS=true.
- Same-tenant Passport read returned 1 row; wrong-tenant read returned 0; anon read failed with SQLSTATE 42501.
- Source-bound action chain proof: Recommendation 4ec6baba-2f76-49a9-bc9b-9f7cfc0b0c28 -> Decision 7caefd77-62b1-4211-8669-84ddabb51cdd -> Approval f4a2445b-9ff1-4e1d-99ca-f6c6542cf65a -> Work 814b38d7-bd9b-4b56-9cd0-168e038817d7 -> Outcome 1eb22376-00eb-431e-bcea-02216bb60dc1.
- Outcome status=insufficient; expected_impact=NULL; actual_impact=NULL. No impact was fabricated.
- Source hash=sha256:0802746f23206b37cbe645738774db6e4208b546ec890ab3ea0305222ad77cee; job=cfcaaed7-7876-4968-a757-d559d2ea10d9; Passport=9ffb5a8d-25bf-4e74-8b00-b1651fc1a887; Passport snapshot=eff9dde2-a9da-40fa-9b26-1981471b7912; analysis snapshot=88b0e172-72c0-4dc2-a0bd-ffc44307be64.
- P1-A query plans are index-backed and low cost; one refresh and four sample refreshes returned FULL/VERIFIED/READY; no statement_timeout increase was applied.
- Report Value Cohort workflow now serializes per PR to prevent stale overlapping runs.
- Full 40-report terminal cohort proof remains CI-pending.
