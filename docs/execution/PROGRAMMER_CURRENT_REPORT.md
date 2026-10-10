## CURRENT EXECUTION REPORT — 2026-10-10T23:12:00+03:00 — quality-run concurrency repair / exact-head checkpoint

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 108a881a12b8982a4f31458c7eb044de0d8e2a78
UPDATED_AT = 2026-10-10T23:12:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue the existing Report-Advisor, preserve the working universal-intelligence engine, expose all source-derived findings with exact lineage, and prove the upload-to-persistence user journey rather than declaring completion from a green build.
WHAT_I_ACTUALLY_DID = Verified the live PR HEAD, corrected the CI topology trigger-boundary bug in dedd9ac8c63e69082c403cdac68372718e281f0f, then consumed its Quality logs. That run confirmed CI topology had advanced past the Phase-F classification failure and exposed a second actionable defect: Quality's own contract required a per-run concurrency group containing github.run_id with cancel-in-progress=false. Updated .github/workflows/quality.yml accordingly and committed 108a881a12b8982a4f31458c7eb044de0d8e2a78. All writes were read back from GitHub.
WHAT_IS_PROVEN = On code head dedd9ac, CI topology produced its JSON result without the previous Phase-F parser error; Product Build Gate [38082440345](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38082440345) passed; Data Quality Runtime [38082440151](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38082440151) passed; Device-Independent Browser [38082440390](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38082440390) passed its smoke job (authenticated E2E remains skipped/manual-only). Commit 108a881a12b8982a4f31458c7eb044de0d8e2a78 readback confirms the quality workflow now uses group quality-${{ github.run_id }}-${{ github.event.pull_request.number || github.ref_name }} with cancel-in-progress=false. New runs on 108a881a12b8982a4f31458c7eb044de0d8e2a78 were queued/pending at last read: Quality [38082699904], Product Build [38082699975], Full Product Browser [38082699868], Value Cohort [38082699916], Phase-F [38082699801], Device Browser [38082699826], Data Quality [38082699672], and Handoff [38082699901]. These are not final PASS claims.
FIRST_ACTIVE_FAILURE = Quality [38082440412](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38082440412) failed at test:quality-workflow-contract after the topology parser check passed. The concurrency contract error is addressed in 108a881a12b8982a4f31458c7eb044de0d8e2a78; a new Quality result is not yet available. The prior cohort test [38078344810](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38078344810) timed out twice in get_report_value_cohort_candidates with PostgreSQL 57014. An exact-head Full Product Browser result proving authenticated upload → results → save/readback → refresh is still absent.
ROOT_CAUSE = Quality workflow configuration contradicted its executable contract: it grouped by PR/ref (not unique per run) and cancelled in-flight verification. The separate value-cohort selection query still exceeds the SQL statement timeout; retries cannot repair a query plan problem.
NEXT_EXACT_ACTION = Consume every listed workflow at code head 108a881a12b8982a4f31458c7eb044de0d8e2a78; repair the first reproduced failing test and, if cohort still times out, inspect the RPC SQL plan/index predicate before making DB changes. Then confirm the same report job ID and SHA-256 source hash after browser navigation, persistence/readback and refresh. Do not merge, promote production, or mark product complete.

---
## CURRENT EXECUTION REPORT — 2026-10-10T23:10:00+03:00 — CI topology parser repair / exact-head verification

SESSION HANDOFF = READY
REPORT_FOR_HEAD = dedd9ac8c63e69082c403cdac68372718e281f0f
UPDATED_AT = 2026-10-10T23:10:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue Report-Advisor without rebuilding the intelligence engine; keep general and applicable specialty analysis together, show full results in the UI, and prove source-bound persistence across screens.
WHAT_I_ACTUALLY_DID = Inspected the live PR #912 branch and current-head workflow logs. Fixed scripts/check-ci-execution-topology.mjs: the push trigger parser had continued through the sibling pull_request trigger and misread its paths filter as a push filter. It now stops at the next two-space trigger sibling and includes a regression fixture. Committed as dedd9ac8c63e69082c403cdac68372718e281f0f.
WHAT_IS_PROVEN = GitHub readback confirms commit dedd9ac8c63e69082c403cdac68372718e281f0f is PR #912 HEAD and changes only the topology-check script. The parser regression logic passed an isolated execution check. Data Quality Runtime run [38082440151](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38082440151) passed at this head. Product Build [38082440345], Quality [38082440412], Full Product Browser [38082440347], Report Cohort [38082440300], Phase-F [38082440417], Device Browser [38082440390] were running or queued at the last read; those are not PASS claims. Source readback confirms the Smart Report page renders GenericFileIntelligenceCard outside its collapsed evidence details and passes report.genericIntelligence, sourceHash and reportJobId; this is code evidence, not authenticated browser proof.
FIRST_ACTIVE_FAILURE = Session Handoff [38082440404](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38082440404) failed because its report baseline predated .github/workflows/quality.yml, scripts/check-ci-execution-topology.mjs, scripts/check-migration-schema-audit.mjs and the cohort index migration. The current report now pins REPORT_FOR_HEAD=dedd9ac8c63e69082c403cdac68372718e281f0f; only allowed documentation paths should follow it. The previous quality run on a1d365 failed at the parser defect this commit addresses. Report Value Cohort on a1d365 timed out twice in get_report_value_cohort_candidates with PostgreSQL 57014; that remains an independent database-performance blocker. Full Product authenticated source journey and persisted readback are not yet proven.
ROOT_CAUSE = pushTrigger() used the next unindented YAML line as its boundary, so parsing continued across sibling event triggers and consumed pull_request.paths. Staging cohort selection also exceeds its SQL statement timeout; retrying the same timed-out query is not a resolution.
NEXT_EXACT_ACTION = Consume terminal checks for exact code head dedd9ac8c63e69082c403cdac68372718e281f0f; inspect the first failed current-head job logs, especially Quality and the 40-report cohort, then fix only the reproduced blocker and prove the same report job ID/source hash after browser navigation, save/readback and refresh. Do not merge or declare product complete.

---
## CURRENT EXECUTION REPORT — 2026-10-10T22:10:00+03:00 — a1d365 current-head verification

SESSION HANDOFF = READY
REPORT_FOR_HEAD = a1d365d3e08a20cbb5ab27f4e708435c1ec724d8
UPDATED_AT = 2026-10-10T22:10:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue the existing Report-Advisor, preserve universal intelligence, bind findings to the exact source, and prove varied-file upload through visible results, persistence and refresh without rebuilding the engine.
WHAT_I_ACTUALLY_DID = Read current-head Actions and Staging Auth telemetry, verified Data Quality PASS and Phase-F preflight/local checks, and corrected the programmer-report baseline after a workflow edit on a1d365.
WHAT_IS_PROVEN = Data Quality Runtime 38078344758 PASS on a1d365; Phase-F local operations/static/canary/runtime-target/preview-provenance steps passed and live probes started; generic-file test suite previously logged GENERIC FILE ANALYSIS PASS; staging saved_views parity is applied/read back; Netlify preview is ready for a1d365.
FIRST_ACTIVE_FAILURE = Session Handoff 38078344759 failed stale report coverage because REPORT_FOR_HEAD 12b did not cover the a1d365 Phase-F workflow file update. Full Product 38078344827 is pending behind predecessor 38078166196 whose actor provisioning was still in progress. Phase-F live probes, 40-report cohort, build and quality have no final current-head conclusions yet.
ROOT_CAUSE = Handoff checkpoint lagged the latest workflow edit. Separately, Staging Auth logs still show internal database connection pressure (10 token 504, 7 admin-user 504 and 4 total 500 events in latest available window); previous Full Product attempt failed before UI assertions during actor provision/auth.
NEXT_EXACT_ACTION = Consume new-head Full Product, Phase-F, cohort, build/quality and handoff outcomes, repair first confirmed failing step and prove exact report ID/hash through upload/results/save/readback/refresh. Do not merge or declare product complete yet.

## CURRENT EXECUTION REPORT — 2026-10-10T22:05:00+03:00 — Auth saturation and latest-head workflow controls

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 12b7106504aaeec247803e3ada311129ee495467
UPDATED_AT = 2026-10-10T22:05:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue the existing Report-Advisor without rebuilding the engine; expose general intelligence alongside applicable specialty intelligence, preserve report ID/source hash across screens, and prove the real upload-to-readback user journey.
WHAT_I_ACTUALLY_DID = Queried live Auth telemetry and GitHub active runs; added bounded retries for only pre-query connection errors; corrected the regression assertion; made the duplicate authenticated Device-Independent journey manual-only; fixed workflow concurrency contract; configured same-workflow stale-run cancellation and Phase-F path filters; saved latest state.
WHAT_IS_PROVEN = Source-context UI fix/test and generic-card visible-source assertions are committed. Generic-file-format regression previously logged GENERIC FILE ANALYSIS PASS. Staging saved_views parity migration is applied/read back with RLS owner policy. At e9, Phase-F local operational checks passed after test assertion fix; latest code/CI head is 12b7106504aaeec247803e3ada311129ee495467.
FIRST_ACTIVE_FAILURE = Latest-head Full Product, Phase-F, cohort, quality/build and handoff are pending; no current-head full browser or clean restore PASS yet. Earlier Auth browser failure was HTTP 504/500 before the UI assertions.
ROOT_CAUSE = Staging Auth could not connect to its internal Postgres endpoint for supabase_auth_admin. Telemetry recorded 81 password-token 504s and 25 token 500s, then another 54 token 504s. At least five stale PR heads had concurrent Storage/Auth/Full Product/Evidence/Phase-F jobs.
NEXT_EXACT_ACTION = Consume current-head workflow results; fix first reproduced blocker and prove exact source SHA from upload through visible general + specialist findings, persistence/readback and refresh/re-entry. Don't merge or claim complete until browser and restore pass.

## CURRENT EXECUTION REPORT — 2026-10-10T21:40:00+03:00 — staging concurrency and current proof status

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 2d77663a8fea44cfbc98e367cca48107a63d3ec2
UPDATED_AT = 2026-10-10T21:40:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Continue existing Report-Advisor work, expose the general intelligence layer with exact source identity, prove varied-file user journeys and persistence, and do not rebuild the existing engine.
WHAT_I_ACTUALLY_DID = Committed a single atomic CI change serializing authenticated browser runs together and heavy staging restore/cohort runs together; consumed current run logs and verified the 40-report cohort succeeded with an artifact.
WHAT_IS_PROVEN = CI workflow update committed at 2d77663a8fea44cfbc98e367cca48107a63d3ec2; Report Value Cohort 38076567370 passed on this exact head with 40-report artifact; staging saved_views parity was applied and read back with RLS and owner isolation; generic file-analysis regression had previously logged GENERIC FILE ANALYSIS PASS.
FIRST_ACTIVE_FAILURE = Full Product Browser 38076567127 and Phase-F 38076567468 were still in progress; Device-Independent Browser 38076567296 pending. Handoff 38076567285 failed because the report did not cover the four workflow changes, which are now included in the documented exact-head baseline.
ROOT_CAUSE = Staging workloads competed for Supabase Auth/Postgres/pooler resources; prior logs recorded Auth HTTP 504, PostgreSQL 57014 and pooler ECHECKOUTTIMEOUT. The handoff gate correctly rejected a stale report baseline.
NEXT_EXACT_ACTION = Consume final browser/restore/build/quality logs at 2d77663a8fea44cfbc98e367cca48107a63d3ec2; correct the first reproducible blocker and prove the authenticated varied-file journey with exact source-hash persistence. Do not merge or mark complete.

## CURRENT EXECUTION REPORT — 2026-10-10 — session handoff contract alignment

SESSION HANDOFF = READY
REPORT_FOR_HEAD = c10429178ba4f414b27c254b1675b8daf0f6ddc1
UPDATED_AT = 2026-10-10
WHAT_I_WAS_ASKED_TO_DO = Continue the existing Report-Advisor PR without rebuilding the engine; make the universal intelligence visible across report routes, retain exact source identity, prove varied-file journeys, and persist every checkpoint.
WHAT_I_ACTUALLY_DID = Fixed Reports Center source-context selection, updated browser E2E to pass and assert report ID/hash, added visible generic-card source/signal/recommendation assertions, added and applied saved_views restore schema parity only to staging, and archived the exact status.
WHAT_IS_PROVEN = GitHub readback confirms code/test commits and archive/state/current-report files; staging saved_views readback confirms schema/RLS/policy/grants; Netlify preview at code head ae756 is READY and Vercel preview at ae756 is READY.
FIRST_ACTIVE_FAILURE = Current-head browser and clean-restore proofs remain pending; the prior session-handoff run failed because the report checkpoint did not cover the changed file list, now corrected by pinning REPORT_FOR_HEAD to c104 (the code checkpoint before documentation-only changes).
ROOT_CAUSE = The session handoff contract computes git diff REPORT_FOR_HEAD..HEAD and rejects changed files not represented by allowed documentation paths; the report was still referencing an older code report head.
NEXT_EXACT_ACTION = Consume the latest-head quality/build/full-browser/device-independent-browser/Phase-F runs; read the first completed failure's logs, repair the verified cause, then persist exact outcomes. Do not merge or claim product complete while user journey gates remain open.

## CURRENT EXECUTION REPORT — 2026-10-10 — source-bound report context, visible generic intelligence, saved_views restore parity

SESSION HANDOFF = READY
REPORT_FOR_BRANCH_HEAD = c10429178ba4f414b27c254b1675b8daf0f6ddc1
APPLICATION_CODE_HEAD = ae75608296a7bdff7d271e87439dace0f3817eb8
REPOSITORY = Report-Engainall/Report-Advisor
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

WHAT_CHANGED
- Reports Center accepts an explicit `reportJobId + sourceHash`, fetches that exact tenant-scoped source, checks the hash and refuses silent substitution. Commit [d51bb6f](https://github.com/Report-Engainall/Report-Advisor/commit/d51bb6fe22a55da9f2533708983d6c05e08a5974).
- Full Product E2E supplies the same source context to the Reports Center. Commit [943102b](https://github.com/Report-Engainall/Report-Advisor/commit/943102bafef58cb84feba9df56fc65efe31614c4).
- Source context regression contract added in commit [639f5d9](https://github.com/Report-Engainall/Report-Advisor/commit/639f5d92ed3b9768dd1d48e9a732cdd92561e07c).
- Full Product browser script checks visible general intelligence card, source ID/path/hash and visible generic signals/recommendations on the Smart Report even with a detected specialty. Commit [ae75608](https://github.com/Report-Engainall/Report-Advisor/commit/ae75608296a7bdff7d271e87439dace0f3817eb8).
- Added and applied saved_views restore parity migration only in Staging; exact schema/policy/privilege readback documented in archived report and session memory. No production DDL performed.

WHAT_IS_PROVEN
- GitHub readback: code and regression changes are committed to PR #912; PR remains open and mergeable.
- Staging table readback: saved_views exists (9 columns, 4 constraints, 3 indexes), RLS enabled, owner policy includes both tenant and auth user predicates, authenticated CRUD grants, no anon grants. Migration ledger version = 20261010165742.
- Netlify preview containing code commit ae756 is READY: https://deploy-preview-912--aghbari-report-advisor.netlify.app/
- Vercel preview at docs checkpoint c104 is READY: https://report-advisor-35w5janp3-injaz2.vercel.app/
- The exact-head browser and clean-restore gates are NOT YET PROVEN. Queued run IDs: Quality 38070293237; Device-Independent Browser 38070293268; Session Handoff 38070293310; Build 38070293366; Full Product Browser 38070293490; data quality 38070293495; Value Cohort 38070293415; Phase-F 38070293496. Desktop Windows 38070293439 is still in progress and blocks the queue; its web build step itself passed.
- Known unresolved prior failures: sales query statement timeout on /reports/sales; clean restore lacked saved_views (migration now addresses this); Reports Center browser readback missing (code fix plus E2E now exercise exact context).

WHAT REMAINS
- Consume exact-current-head browser/build/quality/Phase-F run conclusions and logs.
- Prove upload → analysis → visible complete results → save/readback → refresh/re-entry retains exact source hash and report ID across Screens.
- If sales timeout repeats, capture actual failure/log/plan evidence before changing pagination, exact count or financial totals; do not relabel missing as zero.
- Keep PR #912 open and product-complete = NO until those proofs pass.

NEXT_EXACT_ACTION = consume the current-head workflows, inspect the first confirmed failing job's logs, fix the proven cause, and persist an updated checkpoint.
---


## CURRENT EXECUTION REPORT — 2026-10-10T19:10:00+03:00 — visible executive summary + metric restore schema parity

SESSION HANDOFF = READY
REPORT_FOR_HEAD = cf28f9e24e04c69f1ae068b1053768c4dc32179a
UPDATED_AT = 2026-10-10T19:10:00+03:00
REPOSITORY = Report-Engainall/Report-Advisor
APPLICATION_CODE_HEAD = cf28f9e24e04c69f1ae068b1053768c4dc32179a
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

WHAT_I_WAS_ASKED_TO_DO =
Continue the existing Report-Advisor project and deliver executed fixes, not status-only commentary: keep universal file analysis, restore persisted metric schema, expose the Smart Report's executive summary, and prove the result through exact-head browser/build/restore gates.

WHAT_I_ACTUALLY_DID =
- Applied the source-proof-gated legacy import reconciliation on staging, with audit evidence stored under `import_jobs.result_summary.legacyRowCountReconciliation`. It only repaired records whose source hash/file security/rendered row count/analyzed row count/canonical commit count/canonical row count matched exactly. Readback established 49 corrected import jobs, 49 passports VERIFIED/READY/FULL, and zero unresolved within that repaired set.
- Applied tracked restore-schema migrations for `intelligence_voi_requests` and `report_cell_lineage` after inspecting their live schema and tenant protections.
- Applied `restore_report_intelligence_calculations_schema_parity` at staging migration version `20261010155211`. Readback verifies the relation exists with RLS enabled and 3 tenant-scoped policies. The table has 77 persisted metrics across 2 report jobs (33 CALCULATED and 44 NOT_AVAILABLE), so “unavailable” values remain explicit rather than fabricated.
- Fixed a real UI bug in `src/pages/SmartReportPage.tsx`: the executive-summary section was nested inside the collapsed Evidence Passport `<details>`, hiding it from normal users by default. It now renders before that disclosure with `data-testid="smart-report-executive-summary"`.
- Updated `scripts/real-business-e2e.mjs` to wait for and inspect the visible executive-summary element, rather than treating collapsed content as visible. Updated `scripts/smart-report-complete-intelligence-surface.test.mjs` and `scripts/check-migration-schema-audit.mjs` with regressions for visible summary order and metric-table restore/security parity.

WHAT_IS_PROVEN =
- Staging readback: 49 source-proof-based imports reconciled; associated 49 passports are VERIFIED/READY/FULL; 0 unresolved in that repaired set.
- Staging migration ledger contains `20261010155211 restore_report_intelligence_calculations_schema_parity`; the relation is RLS-enabled, has 3 tenant policies, and retains 77 calculation rows.
- Current code candidate `cf28f9e24e04c69f1ae068b1053768c4dc32179a` is committed/read back in GitHub. Source assertions prove the executive-summary marker now precedes the collapsed Evidence Passport disclosure; the E2E assertion targets that visible marker.
- Report Value Cohort [38065456403](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38065456403) completed SUCCESS on `cf28f9e24e04c69f1ae068b1053768c4dc32179a`; the previous exact-head cohort run [38064799780](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38064799780) proved 40/40 selected reports close as VERIFIED/READY/FULL across 4 tenants.
- Product Build, Quality, Phase-F, device-independent browser, full business browser, and handoff results for `cf28f9e24e04c69f1ae068b1053768c4dc32179a` are still pending/in progress at this checkpoint. No PASS is claimed for these current runs.
- Previous Phase-F run [38064799827](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38064799827) passed 3/4 probes and failed the backup restore on missing `report_intelligence_calculations`; this exact relation now has a tracked migration. The current Phase-F run must pass before restore is considered closed.
- Previous Full Product Browser [38064796601](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38064796601) failed with `Smart Report executive summary missing`; DOM inspection shows the executive summary was inside collapsed details. The UI and E2E now target the visible summary, awaiting exact-head rerun.

FIRST_ACTIVE_FAILURE =
Exact-head validation remains open. The main known unclosed proofs are: current browser run after moving the summary, current Phase-F logical restore after adding metric table parity, and current Quality/Product Build + Session Handoff results.

ROOT_CAUSE =
Two concrete defects were found: a missing checked-in schema parity migration for an existing persisted metrics table; and an executive summary mounted only inside a collapsed Evidence Passport disclosure, so the key management-level summary was not visible during a normal Smart Report view. Separately, a staging restore can reveal one missing relation at a time; each must be reconstructed from the observed live schema and secured, not waived.

NEXT_EXACT_ACTION =
Consume exact-head Quality, Product Build, Phase-F, Full Product Browser, Device-Independent Browser, Report Value Cohort and Session Handoff results. Fix the first confirmed failure while keeping source/evidence gates fail-closed; prove Smart Report summary visible on load and after refresh and prove the clean logical restore reaches completion. Keep PR #912 open until these proofs pass.

---

## CURRENT EXECUTION REPORT — 2026-10-10T18:45:00+03:00 — lineage restore parity + bounded cohort diagnostics

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 242c072a1293346109edd3a67cd45a438f53d359
UPDATED_AT = 2026-10-10T18:45:00+03:00
REPOSITORY = Report-Engainall/Report-Advisor
APPLICATION_CODE_HEAD = 242c072a1293346109edd3a67cd45a438f53d359
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

### Executed changes and database results

- The strict, source-bound legacy import reconciliation migration was applied to staging twice under two migration ledger versions. It only changes rows where source fingerprint, secured file hash, rendered row count, analyzed rows/quality, canonical commit rows, and canonical dataset rows are identical, with zero invalid rows. Its proof is persisted in `import_jobs.result_summary.legacyRowCountReconciliation`.
- Readback proves 49 reconciled import records and 49 linked passports as `VERIFIED / READY / FULL`; unresolved repaired reports = 0. The change does not relax the evidence gate.
- Read-only staging inspection found another restore schema gap, `public.report_cell_lineage`, which the live schema has but a clean logical restore lacks. Its schema, constraints, indexes, RLS, tenant policy and grants were observed, and the matching restore migration was applied to staging at version `20261010153717`. This candidate adds the migration file and an audit contract to GitHub.
- Existing VOI parity migration remains tracked and protected by migration-audit assertions.

### CI evidence and root causes

- Quality [38062418605](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38062418605): PASS at `242c072a1293346109edd3a67cd45a438f53d359`.
- Product Build Gate [38062418545](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38062418545): PASS at `242c072a1293346109edd3a67cd45a438f53d359`.
- Session Handoff Contract [38062418613](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38062418613): PASS at `242c072a1293346109edd3a67cd45a438f53d359`.
- Full Product Browser E2E [38062418281](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38062418281): FAILED overall. Its route scan passed; business E2E generated a failure report. The source-bound report lineage matches the same source hash/path/job and 332 canonical rows; later DB readback confirmed its passport was already `VERIFIED / READY / FULL`.
- Device-Independent Browser E2E [38062418614](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38062418614): FAILED due to HTTP 500 / Postgres `57014 statement timeout` in report routes while multiple heavy workflows were running. A read-only `EXPLAIN ANALYZE` on a representative canonical source-row query took ~4.6 ms and returned 776 rows from 6,776 source-bound rows, indicating transient DB contention rather than absence of data.
- Report Value Cohort [38062418457](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38062418457): FAILED before it logged its candidate pool, with the same `57014 canceling statement due to statement timeout`. The candidate RPC ran in ~139 ms during a quiet window and returned 42 eligible source-bound candidates; target is 40.
- Phase-F [38062418646](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38062418646): 3/4 probes passed; backup restore failed on the missing `public.report_cell_lineage` relation. This migration repairs that concrete schema gap; exact-head restore proof is still pending.
- This update bounds retries for SQL statement timeouts to one retry and emits safe structured request-path/stage diagnostics. Other transient HTTP errors keep their ordinary bounded backoff. It does not mark failed DB calls as PASS.

### Next exact action

Run the new exact-head gates with the lineage migration and diagnostic instrumentation. Confirm Phase-F restore passes, cohort reaches its candidate/read stages and closes 40 reports, and both browser suites complete without `57014` responses. Keep PR #912 open; product completion remains NO until end-to-end source upload, Smart Report rendering/navigation/reload/readback and evidence-linked decision/workflow proof are all readback-proven.

---

## CURRENT EXECUTION REPORT — 2026-10-10T18:35:00+03:00 — source-bound evidence repair and complete Phase-F governance-path correction

SESSION HANDOFF = READY
REPORT_FOR_HEAD = ce10536ae4eefcc3858a7fe407b9d5cd6a2390f5
UPDATED_AT = 2026-10-10T18:35:00+03:00
REPOSITORY = Report-Engainall/Report-Advisor
APPLICATION_CODE_HEAD = ce10536ae4eefcc3858a7fe407b9d5cd6a2390f5
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

WHAT_I_WAS_ASKED_TO_DO
Resume the existing product without rebuilding the intelligence core; ensure general intelligence is shared across supported readable report formats, specialist analysis augments it, all evidence remains source-bound, screens are connected, and every launch records a reproducible checkpoint.

WHAT_I_ACTUALLY_DID
- Shared header normalization/specialty inference is wired into the two File Lab specialty paths and the generic file test covers spaced English/Arabic headers plus generic headers that must not infer a specialty.
- The browser test now distinguishes the actual source trust label “موثوق” from a pending/review evidence snapshot and does not promote one state into the other.
- Added VOI request schema restore parity migrations and a schema audit contract for the table/index/RLS/tenant policy/grants/checks.
- Reconciled 49 legacy imports using only exact source-bound evidence: 49 unique candidate imports, 49 conflict-free proofs, zero conflicting proofs, rendered rows = analyzed snapshot rows = canonical commit rows = canonical dataset rows; source file hash/fingerprint/passport/snapshot hash match, file is secure, analysis quality >=70.
- Applied the guarded reconciliation migration in staging, wrote its audit proof into import_jobs.result_summary, refreshed the passports, and read back 49 audited imports / 49 VERIFIED-READY-FULL passports / zero unresolved reconciled reports.
- Synchronized the exact Supabase versions 20261010144953 and 20261010145143 as tracked SQL migration files in GitHub.
- Updated the session-handoff contract to allow the required root session-memory file as an explicitly recognized persistence artifact.
- Updated the Phase-F live workflow's preflight provenance comparison to allow only docs/execution/* plus ONE-PROGRAMMER-SESSION-MEMORY.md as governance-only deltas; all other code-file drift remains fail-closed.
- Updated the Phase-F runtime probe's deployment-code equivalence and its contract test to use the same strict governance-only allow-list. The runtime probe is not considered passed until a terminal Phase-F workflow reports the result.

WHAT_IS_PROVEN
- Staging readback after migration: 49 imports carry RECONCILED_FROM_SOURCE_BOUND_PROOF status; 49 associated passports are VERIFIED / READY / FULL; unresolved reconciled reports = 0.
- Report Value Cohort run 38062072330 on predecessor governance head 6bd35572e41936cb335685292fbbc31f28b1b595 passed after the repair. Product Build Gate run 38062072179 and Session Handoff Contract run 38062072369 also passed on that predecessor head.
- The newer product code candidate 2055600a895c05ef8239b6be4014b121d5cea775 had Product Build Gate PASS with TypeScript, production build and all four customer/smart-report/source-upload contracts passing.
- Netlify returned the upload screen with application source SHA 2055600a895c05ef8239b6be4014b121d5cea775. Candidate ce10536... changes the Phase-F provenance gate and is now the newest code candidate; its own Quality, Build, Browser and Phase-F runs are not yet terminal.
- Previous Phase-F attempt on an older head was cancelled before restore probes because the workflow's preflight still rejected the root session-memory file. The current candidate fixes both the workflow preflight and the runtime probe’s code-equivalence rule; a current-candidate PASS is not asserted.
- Current full browser E2E / device-independent browser E2E and Quality tests were still queued on the predecessor branch tip. The source-bound upload → saved report → navigate/reload flow remains an explicit closure gate.

FIRST_ACTIVE_FAILURE
Current candidate runs have been triggered but are not terminal. The critical next proof is a current-head Phase-F run plus authenticated full-browser upload/render/navigation/reload/readback; queued runs do not count as PASS.

ROOT_CAUSE
Legacy import counters were zero despite corroborating row evidence, causing passports to remain PARTIAL; fixed with source-proof-gated reconciliation. Separately, the Phase-F deployment provenance gate duplicated its docs-only allow-list in two places and both omitted the mandatory session-memory file. Both guards now allow only the declared governance paths, not product source drift.

NEXT_EXACT_ACTION
Consume terminal runs for ce10536ae4eefcc3858a7fe407b9d5cd6a2390f5. Confirm preview health reports the application SHA, pass the Phase-F restore probes, and pass full product browser readback on a varied file with the same reportJobId and sourceHash after navigation and reload. Do not merge PR #912 or claim product completion before that evidence exists.

---

## CURRENT EXECUTION REPORT — 2026-10-10T18:20:00+03:00 — source-bound legacy evidence closure and Phase-F provenance gate fix

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 2055600a895c05ef8239b6be4014b121d5cea775
UPDATED_AT = 2026-10-10T18:20:00+03:00
REPOSITORY = Report-Engainall/Report-Advisor
APPLICATION_CODE_HEAD = 2055600a895c05ef8239b6be4014b121d5cea775
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

WHAT_I_WAS_ASKED_TO_DO
Resume the existing product without rebuilding the intelligence core; ensure generic intelligence renders for arbitrary supported reports, specialized intelligence augments rather than replaces it, evidence stays source-bound, CI gates are meaningful, and every launch saves exact status.

WHAT_I_ACTUALLY_DID
- Shared header normalizer/specialty inference is committed and wired in both File Lab paths; regressions cover English and Arabic spaced headings plus generic headers that must not imply a specialty.
- Full Product Browser E2E trust wording assertion was fixed to recognize the UI's actual source-trust label “موثوق” while keeping evidence snapshot review/pending distinct.
- Added and tracked VOI request table restore-parity migrations and a schema-audit contract for table/index/RLS/tenant policy/grants/checks.
- Reconciled 49 legacy imports with counters stored as zero only when independent source-bound evidence matched exactly: rendered row count, file/security state, source fingerprint/hash, analyzed snapshot row count and quality, canonical commit count, and canonical dataset count. There were 49 unique candidates, 49 conflict-free and zero conflicting.
- Applied the gated migration in staging and refreshed the associated passports; post-write readback proves 49 audited imports, 49 related passports VERIFIED / READY / FULL, and zero unresolved reconciled reports. Each import’s result_summary.legacyRowCountReconciliation stores the proof and rule version.
- Tracked both observed Supabase migration history versions: 20261010144953_reconcile_legacy_import_rowcount_from_source_proof.sql and 20261010145143_reconcile_legacy_import_rowcount_from_source_proof.sql.
- Fixed Session Handoff Contract’s allow-list to include the required persistent session-memory file.
- Fixed Phase-F runtime code-equivalence boundary to permit ONE-PROGRAMMER-SESSION-MEMORY.md alongside docs/execution/* only. The companion contract asserts this rule. Code differences outside these governance paths continue to fail closed.

WHAT_IS_PROVEN
- Live database readback: reconciled import count = 49; matching passport statuses = 49 VERIFIED / READY / FULL; unresolved = 0.
- Report Value Cohort predecessor run 38061102673 passed after reconciliation. Predecessor Quality 38061102377 and Product Build Gate 38061102647 also passed. These are predecessor-head passes, not current-head passes.
- Prior Phase-F failure on head e017b865... showed RUNTIME_PROVENANCE_CODE_DRIFT=true because runtime preview stayed on older app SHA 8f610fef...; the test required later documentation SHA e017b865.... The earlier diff included real code edits, so that failure was valid then.
- Current code candidate 2055600a895c05ef8239b6be4014b121d5cea775 changes the provenance equivalence rule narrowly; exact-head current Quality/Product/browser/cohort/Phase-F workflows are queued or pending. Current-head success is NOT YET PROVEN.
- Netlify’s last observed page reported app source SHA 84c881e...; the new code commit 2055600a895c05ef8239b6be4014b121d5cea775 is deploying. Phase-F must not be judged until the preview’s reported SHA is current or the docs-only equivalence rule is proven to accept only governance-only deltas.

FIRST_ACTIVE_FAILURE
Current-head CI is not terminal. The outstanding gates are current-head typecheck/build/UI tests, authenticated Full Product Browser E2E, value cohort rerun, Session Handoff Contract, and Phase-F runtime/restore proof.

ROOT_CAUSE
Three unrelated defects were proven and addressed: malformed File Lab header normalization; a browser assertion conflating source trust with passport status; and zero-valued legacy import counters forcing valid source-backed reports into PARTIAL evidence coverage. A fourth CI problem was provenance semantics: Phase-F runtime accepted only docs under docs/execution/ as documentation-only, but the product's required session memory file lives at the repository root.

NEXT_EXACT_ACTION
Consume terminal runs for 2055600a895c05ef8239b6be4014b121d5cea775; fix the first genuine failure, not a queued run. Verify the latest Netlify preview’s provenance and Phase-F restore probe, then prove the same reportJobId/sourceHash through varied-format upload, full result display, navigation/reload and persisted readback. Keep PR #912 open until the current-head end-to-end and clean restore gates pass.

---

## CURRENT EXECUTION REPORT — 2026-10-10T18:05:00+03:00 — source-proven row-count reconciliation applied and read back

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 84c881eae999ae218b2cf6b448394cbdc73d0775
UPDATED_AT = 2026-10-10T18:05:00+03:00
REPOSITORY = Report-Engainall/Report-Advisor
APPLICATION_CODE_HEAD = 84c881eae999ae218b2cf6b448394cbdc73d0775
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

WHAT_I_WAS_ASKED_TO_DO
Resume PR #912 without recreating the intelligence core; make general analysis shared by all supported readable formats; present complete source-bound findings in File Lab and Smart Report; keep source trust separate from evidence-passport verification; persist every checkpoint and prove the user journey.

WHAT_I_ACTUALLY_DID
- Shared header normalizer/specialty inference and tests are tracked; the earlier TypeScript failure from a stale `inferSpecialty` reference was repaired.
- Added source/evidence trust-state E2E assertions matching the rendered Arabic label `موثوق` while independently retaining pending/review snapshot state.
- Added VOI request table restore-parity migrations and a schema-audit contract requiring table/index/RLS/tenant policy/grants/validation guards.
- Queried staging read-only and found 49 completed generic import jobs with zeroed legacy row counters while source-bound evidence matched across report render, source-analysis snapshot, canonical commit ledger and canonical dataset records. There were 49 unique candidates, 49 conflict-free proofs, and 0 conflicting proofs; expected row counts ranged 1–886.
- Applied guarded migration `reconcile_legacy_import_rowcount_from_source_proof` to staging. It updated only imports meeting exact hash, file security/status, render, analysis-quality, canonical commit and canonical row-count predicates, and wrote an audit object to each `import_jobs.result_summary`. It refreshed associated passports and aborted transactionally if any touched passport remained open.
- Read back the database after the migration: 49 imports contain `legacyRowCountReconciliation.status=RECONCILED_FROM_SOURCE_BOUND_PROOF`; all 49 related passports are `VERIFIED / READY / FULL`; unresolved reconciled reports = 0.
- Synchronized both generated migration-version records into tracked SQL files `supabase/migrations/20261010144953_reconcile_legacy_import_rowcount_from_source_proof.sql` and `supabase/migrations/20261010145143_reconcile_legacy_import_rowcount_from_source_proof.sql`. Both files are committed/read back from GitHub and include the transactional closure guard. The SQL is idempotent because already reconciled imports no longer match the all-zero-counter eligibility predicate.
- Updated `scripts/check-session-handoff-contract.mjs` so the required `ONE-PROGRAMMER-SESSION-MEMORY.md` is an explicitly allowed persistent handoff file, while retaining report-head ancestry and restricted governance-doc/archive coverage.

WHAT_IS_PROVEN
- Pre-write SELECT aggregate: 49 unique imports, 49 conflict-free row-count matches, 0 conflicts, quality score >=70, secure source record, and identical sourceHash/sourceFingerprint/fileHash/passportHash/snapshotHash.
- Supabase reported migration execution success. Post-write readback: `reconciled_import_jobs=49`.
- Passport readback: exactly 49 related passports are `VERIFIED / READY / FULL`; `unresolved_reconciled_reports=0`.
- Report Value Cohort passed on predecessor checkpoint [38061102673](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38061102673) after the data reconciliation. Quality [38061102377](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38061102377) and Product Build Gate [38061102647](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38061102647) also passed on that predecessor checkpoint.
- Exact-current-candidate workflows for `84c881eae999ae218b2cf6b448394cbdc73d0775` are pending/queued. Do not claim current-head build, browser, session-handoff, or backup/restore closure yet.
- Phase-F on an older docs head failed its runtime preview provenance guard because Netlify kept serving application SHA `8f610fef...` while the test required `e017b865...`; that run did not reach restore probes. This remains an outstanding exact-deployment test, not proof that the newly tracked migrations failed.
- Previous Full Product Browser E2E had a test wording mismatch; the assertion is corrected, but current-head authenticated upload-to-saved-readback/reload must still pass.

FIRST_ACTIVE_FAILURE
Current-head CI remains unverified. Outstanding gates are exact-head browser flow/readback, a current-SHA deployed preview for Phase-F, and clean restore with tracked schema/history. Historical cohort failure has been repaired in staging, but its current-head CI rerun remains queued.

ROOT_CAUSE
Legacy generic imports retained zero total/processed/valid/invalid counters after the application had already preserved matching source fingerprint, successful file security, completed render, analyzed quality, canonical commit ledger and canonical dataset rows. The passport refresh correctly required counters to match authoritative source-derived rows, so coverage remained PARTIAL. The corrective migration uses all independent corroborating evidence and never derives counts from filenames or guessed specialty.

NEXT_EXACT_ACTION
Consume the current-head Quality, Product Build Gate, Report Value Cohort, Full Product Browser E2E, Session Handoff Contract and Phase-F runs. Fix the first confirmed failure without relaxing evidence gates. Require an exact-deployed preview SHA before judging Phase-F. Then prove varied-format upload → complete general plus applicable specialist results → navigation/reload → saved readback with unchanged `reportJobId + sourceHash`.

---

## CURRENT EXECUTION REPORT — 2026-10-10 — legacy import row-count root cause proven

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e
UPDATED_AT = 2026-10-10
REPOSITORY = Report-Engainall/Report-Advisor
APPLICATION_CODE_HEAD = 8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

WHAT WAS VERIFIED:
- Read-only staging query over `report_execution_jobs`, `import_jobs`, `file_records`, `source_analysis_snapshots`, `canonical_import_commits`, `canonical_dataset_records`, `report_evidence_snapshots`, and `report_evidence_passports`.
- 49 unique import jobs have `total_rows=processed_rows=valid_rows=invalid_rows=0`, but all independent source-bound row proofs match: report rendered row count = analyzed snapshot rows = canonical commit count = canonical dataset rows, and sourceHash = source fingerprint = source file hash = passport/snapshot hash; source file security is passed; all files are ready/processed/verified; quality >=70.
- Aggregate has 49 report proofs, 49 unique import jobs, 49 conflict-free and 0 conflicting import jobs, with proven row counts 1–886. These were SELECT-only reads; no rows changed yet.
- This exactly explains why the current passport refresh function marks those imports PARTIAL/REVIEW: its final guard requires import total/processed rows to equal the independently proven authoritative count, while legacy metadata is stored as zero.

PRODUCT FIXES ALREADY TRACKED:
- Shared specialty header normalizer + Arabic/English spaced-header regression.
- E2E source trust assertion corrected to distinguish trusted source (`موثوق`) from an unverified/pending evidence snapshot.
- VOI request schema parity migration and migration schema audit guard are tracked at code head `8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e`.
- Free Netlify preview currently serves the same application SHA `8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e` on `/try-report`; it shows the Arabic upload screen. This proves route/deploy content only, not upload/persistence.
- Exact-candidate CI remains queued; previous full browser test exposed a wording mismatch, not a hash/row-lineage mismatch. Historical value cohort has only 18/42 verified until legacy counter repair is proven.

NO DATA HAS BEEN MUTATED BY THIS CHECKPOINT.

NEXT EXACT ACTION:
Add a source-proof-gated idempotent migration that corrects only eligible all-zero legacy import counters, records row/hash/analysis/canonical evidence in `result_summary`, refreshes associated passports, then read back exact updated rows and rerun the cohort and Phase-F restore gates. The repair must not update a row where any hash, status, security, quality, or count disagrees.

---

## CURRENT EXECUTION REPORT — 2026-10-10T17:45:00+03:00 — VOI restore schema parity and generic specialty header fix

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e
UPDATED_AT = 2026-10-10T17:45:00+03:00
REPOSITORY = Report-Engainall/Report-Advisor
APPLICATION_CODE_HEAD = 8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

WHAT_I_WAS_ASKED_TO_DO =
Resume the existing PR without rebuilding the intelligence core; make generic intelligence available for every readable file; preserve specialty analysis, full evidence lists, source lineage, and durable UI integration; fix verified blockers only.

WHAT_I_ACTUALLY_DID =
- Added shared specialty inference `src/lib/file-engine/specialty-inference.ts`, wired both File Lab specialty call sites to it, and added tests for spaced Arabic/English headers plus generic-header no-specialty behavior.
- Read actual browser failure on the predecessor: source trust rendered as `موثوق`, while E2E expected a different Arabic string. E2E now checks trusted source and pending evidence-snapshot/review state separately; exact-head rerun has not yet gone terminal.
- Queried staging schema read-only. `public.intelligence_voi_requests` exists there with id/company/report job/source hash/question/decision key/sensitivity/estimated value/priority/minimum evidence/state/provenance/created_at; FKs and checks; `idx_voi_requests_priority`; RLS and `voi_requests_tenant` policy; authenticated/service-role CRUD.
- The repository migration tree had no tracked migration creating `intelligence_voi_requests`; Phase-F restore failed because the restored schema did not have this relation.
- Added `supabase/migrations/20261010180000_restore_intelligence_voi_requests_schema_parity.sql` to track the missing schema in clean restores, plus a migration-audit regression in `scripts/check-migration-schema-audit.mjs` to check table/index/RLS/tenant policy/grants/guards.
- Did not apply DDL to the live staging database.

WHAT_IS_PROVEN =
- Same-branch GitHub readback proves the shared header helper and tests are committed.
- Prior Quality and Product Build Gate passed at predecessor `8f064944...`; generic file matrix logged `GENERIC FILE ANALYSIS PASS` and structured XLSX proof `rows=3 columns=17 mapped=17`.
- Exact Full Product Browser E2E predecessor exposed the actual UI assertion mismatch while confirming source hash/path/job and 332 canonical rows. It was not a full-flow PASS.
- Current code candidate `8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e` and VOI migration/audit changes are committed/read back. The exact-head workflows listed in the resume section are pending/queued. No current-head pass is asserted.
- A previous Quality workflow run on an adjacent docs merge failed during setup/build due to missing `node_modules/vite/bin/vite.js`; the missing `dist/index.html` occurred afterwards. This does not prove a behavior failure, nor a successful build.
- Historical Report Value Cohort remains 18/42 verified; 24 passports remain not closed. Historical Phase-F restore failed on the missing VOI relation before this migration was added.

FIRST_ACTIVE_FAILURE =
New-candidate CI is not terminal. The historical restore failure now has a tracked schema-parity fix candidate, but it has not yet been verified by backup/restore workflow.

ROOT_CAUSE =
The intelligence core is present; current gaps are integration/verification rather than a missing core rewrite. Confirmed causes were: malformed File Lab header normalizer; an E2E assertion conflating source trust and final evidence-passport verification; and a restore schema relation that existed in staging but was absent from tracked migrations. The cohort failure is a separate genuine evidence-closure issue, not something to paper over.

NEXT_EXACT_ACTION =
Consume terminal Quality, Product Build Gate, Full Product Browser E2E, Session Handoff, and Phase-F results for `8f610fef2a966b4ae179ba26f1dbfd2fdfdb2c4e`. Fix the first proven issue while preserving fail-closed evidence states. Then prove one real report’s `reportJobId + sourceHash` through upload/render/navigation/reload/readback, and separately close the 40-report passport cohort.

---

## CURRENT EXECUTION REPORT — 2026-10-10T17:30:00+03:00 — shared specialty inference and browser trust-state proof repair

SESSION HANDOFF = READY
REPORT_FOR_HEAD = eb95f709a8ebead63e556380e18394c02c17726
UPDATED_AT = 2026-10-10T17:30:00+03:00
REPOSITORY = Report-Engainall/Report-Advisor
APPLICATION_CODE_HEAD = eb95f709a8ebead63e556380e18394c02c17726
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

WHAT_I_WAS_ASKED_TO_DO = Resume existing PR #912, keep the completed intelligence core, make general analysis common to all uploaded files, expose complete source-bound results across File Lab and Smart Report, and prove actual report persistence/browser behavior.

WHAT_I_ACTUALLY_DID =
- Added `src/lib/file-engine/specialty-inference.ts` with a shared Unicode/NFKC header normalizer and header-evidence-based specialty inference.
- Replaced the duplicate and malformed File Lab normalizers in both preview and memoized specialty inference; repository readback on `8f064944...` showed no remaining `inferSpecialty` references in `ExternalFileAnalysisPage.tsx`.
- Added generic analysis regressions for spaced `Current Stock`, `Sales Qty`, `الرصيد المستحق`, `المدفوع`, explicit customer/supplier identity, and a generic `name,status,total` table that must not acquire a fabricated specialty.
- Read exact-head quality and product build logs for `8f064944...`: both passed. Generic analysis emitted `GENERIC FILE ANALYSIS PASS`; structured XLSX portfolio emitted `rows=3 columns=17 mapped=17 status/trend/reconciliation`. Device-independent browser test passed.
- Inspected Full Product Browser E2E logs. All 32 route checks passed and the certified Smart Report matched source path/hash, report job ID, and 332 source/canonical/committed rows. Its evidence state correctly remained `AWAITING_EVIDENCE_SNAPSHOT`. The browser failed only because its Arabic source-trust assertion omitted the UI’s actual text `موثوق`.
- Fixed `scripts/real-business-e2e.mjs` on current candidate `eb95f709a8ebead63e556380e18394c02c17726` so the browser accepts the displayed trusted-source label and separately requires visible evidence-review/pending status when no evidence snapshot is verified. This fixes the assertion, not the evidence gate.

WHAT_IS_PROVEN =
- Exact predecessor-head `8f064944f5f3b42c25ce1d3e687426abafd4b080`: Quality [38058146785](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38058146785) PASS; Product Build Gate [38058146826](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38058146826) PASS; Device-Independent Browser E2E [38058146520](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38058146520) PASS.
- Generic file-analysis run log explicitly confirms `GENERIC FILE ANALYSIS PASS` plus structured XLSX row/column/status/trend/reconciliation proof.
- The Full Product Browser E2E log exposed the actual trust assertion error; persisted current report ID `16709d80-e012-40ef-9c12-6fd8255897f8`, source `تقارير ادارية.xlsx`, SHA `sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313`, 332 rows, quality score 98, and evidence state `AWAITING_EVIDENCE_SNAPSHOT`.
- Current candidate `eb95f709a8ebead63e556380e18394c02c17726` is committed and read back. Exact-head CI results have not yet become terminal at report creation. No claim is made that the new browser assertion passes.
- Value Cohort [38058146878](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38058146878) FAIL: only 18/42 passports verified; 24 remain unclosed/unverified.
- Phase-F live resilience [38058146545](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38058146545) FAIL: backup restore reports missing `public.intelligence_voi_requests`; 3/4 probes pass.
- Prior Session Handoff Contract [38058146969](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38058146969) FAIL due to missing file coverage in this report; this report and current state are now refreshed, with an append-only archive entry.

FIRST_ACTIVE_FAILURE = Current candidate CI not yet terminal. The last fully observed user-flow failure was an incorrect browser assertion that did not recognize `موثوق`; the same run proved all route checks and matching report/source lineage but did not prove the complete user flow.

ROOT_CAUSE = Two distinct states were conflated in the E2E assertion: source trust (`موثوق`) and evidence-passport verification (`AWAITING_EVIDENCE_SNAPSHOT`). The Smart Report correctly did not promote an unverified snapshot. Separately, the File Lab had an invalid whitespace-regex normalizer; the shared helper and source-header behavioral test now address that defect. Remaining product blockers are unclosed passports and restore schema parity.

NEXT_EXACT_ACTION = Consume terminal exact-head Quality/Product Build Gate/Full Product Browser E2E for `eb95f709a8ebead63e556380e18394c02c17726`. Fix the first verified failure without faking evidence status; then investigate why 24/42 evidence passports do not close and repair the restore schema relation. Keep PR #912 open until same `reportJobId + sourceHash` is proved through upload, full result display, navigation/reload and persisted readback.

---

## CURRENT EXECUTION REPORT — 2026-10-10 — verified generic-analysis head and specialty-normalization fix

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 350d0c69596a3eaffa8e3982c0cf71e31d08a266
UPDATED_AT = 2026-10-10
REPOSITORY = Report-Engainall/Report-Advisor
APPLICATION_CODE_HEAD = 350d0c69596a3eaffa8e3982c0cf71e31d08a266
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

WHAT WAS READ BACK:
- Quality exact-head run `38057224871` / job `114228066670`: successful; log explicitly shows `GENERIC FILE ANALYSIS PASS` and `STRUCTURED XLSX CUSTOMER PORTFOLIO PASS rows=3 columns=17 mapped=17 status/trend/reconciliation`.
- Report Value Cohort run `38057224832` / job `114228066563`: failed on truthful passport closure, 18 accepted of 42 candidate reports; 24 still `PASSPORT_NOT_CLOSED`, `UNVERIFIED`, `REVIEW`, or `PARTIAL`.
- Full Product Browser E2E, Device-Independent Browser E2E and Phase-F live resilience were in progress; no authenticated upload-to-persisted-readback pass is asserted.
- Preview is fixture-backed publicly; `/reports` returned the unauthenticated entry/marketing surface in this browser context, so it cannot prove customer business flow.

ROOT CAUSE AND NEXT CODE CHANGE:
- `src/pages/ExternalFileAnalysisPage.tsx` duplicates a malformed regex character-class normalizer for specialty detection. Spaced English/Arabic headers can fail detection, resulting in the general layer showing without a matching specialty layer.
- Next action: create a shared tested specialty inference helper, wire File Lab to it, and add regression fixtures for headers like `Current Stock`, `Sales Qty`, `الرصيد المستحق`, and `المدفوع`, without widening the specialization rules beyond explicit source evidence.
- Keep PR #912 open; do not claim product complete until varied-format authenticated upload, rendered complete results, same `reportJobId + sourceHash` across navigation/reload, durable readback, and required passport cohort closure are proven.

---

## CURRENT EXECUTION REPORT — 2026-10-10 — universal evidence and Arabic CSV header correction

SESSION HANDOFF = READY
REPORT_FOR_HEAD = 2495372e2b7bfc89042f435274c1cde4e4511bec
UPDATED_AT = 2026-10-10T16:50:00+03:00
REPOSITORY = Report-Engainall/Report-Advisor
APPLICATION_CODE_HEAD = 87fe4f3f28d0c81be5f2547fe56c87ec0c5d3489
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
PRODUCT_COMPLETE = NO

WHAT_I_WAS_ASKED_TO_DO = Resume the existing PR #912 without rebuilding the core; make generic analysis common across readable report formats; preserve source-bound evidence; surface all available metrics, signals, recommendations and limits; persist truthful checkpoints and verify actual results.

WHAT_I_ACTUALLY_DID =
- Verified the live repository, main SHA, PR #912 and current branch before editing; did not use the historical SHA supplied in the initial note as current proof.
- Committed and read back `3d6d04fe...`: fixed TXT/Markdown/RTF documents being misclassified as synthetic line-number/text business tables; removed the first-five-numeric-column cap; added measured numeric counts/sum/mean/min/max and source record ordinals for each numeric field; removed hidden evidence cuts in table finding/signal/recommendation and UniversalIntelligenceChain stage output; added generic-analysis and UI contract regressions.
- Examined actual Quality failure on the previous code head. TXT evidence had previously been missing; after the document-shape fix, the test progressed to CSV and found a real header-detector issue. Committed `87fe4f3f...` to treat valid compound Arabic/English headings (including `اسم الصنف`) as normal field labels while retaining detection of merged PDF headers. Added a regression in `scripts/check-header-detection.mjs`.
- Updated persistent memory/checkpoint in commit `2495372e...` before this report, recording actual CI outcomes and the exact next action.

WHAT_IS_PROVEN =
- GitHub same-branch file readback confirms the edits exist and have the expected content/SHAs.
- Product Build Gate #994 (`38056756845`) succeeded on prior code SHA `3d6d04f...`; file-engine header contract #8634 (`38056756912`) also succeeded on that prior code SHA.
- Quality #11939 (`38056756921`) on `3d6d04f...` executed the generic analysis test and failed at CSV row count (expected 2, got 1), which identified why a valid `اسم الصنف` header lost to the first data row.
- On the new code SHA `87fe4f3...`, the updated header contract run #8635 (`38057053199`) has not yet returned a terminal result at last read. Product Build Gate #995 (`38057052776`) is in progress. Full Product Browser E2E #9601 (`38057050078`) in progress and #9602 (`38057053312`) pending; Device-Independent Browser E2E #5115 (`38057053229`) in progress.
- Quality #11940 (`38057053143`) failed before behavioral tests because CI diagnostics exited 1 at `test -f package-lock.json`; later missing ESLint/Vite and dist output are downstream of dependencies not being installed. API readback shows the lock file exists on the PR branch and merge SHA. This is a CI preflight/install failure; it is not evidence that latest code passes or fails the generic-format runtime test.
- Netlify returned a ready deploy-preview URL `https://deploy-preview-912--aghbari-report-advisor.netlify.app` for the new code SHA. This is preview-build proof only, not an authenticated interaction, saved report or reload proof.

FIRST_ACTIVE_FAILURE = The current code SHA has no terminal Product Build Gate or browser result yet, and no executed generic multi-format runtime test result because Quality #11940 stopped at its environment preflight. The next code-level risk is the new valid-Arabic-header regression; the test is pending on run #8635.

ROOT_CAUSE = Two confirmed product defects: (1) synthetic document rows `line_number/text` were allowed into the structured-table profiler, which replaced text evidence; (2) generic numeric and stage evidence was silently truncated. A subsequent real CSV case showed `اسم الصنف` was scored as a merged multi-field heading because separate known hint tokens were counted independently. Separately, current Quality infrastructure stopped at its package-lock preflight while the lock file exists in GitHub tree, so later lint/build failures in that run are downstream setup noise.

NEXT_EXACT_ACTION = Consume terminal Product Build Gate #995, header contract #8635 and Full Product Browser E2E #9601/#9602 results for code SHA `87fe4f3f28d0c81be5f2547fe56c87ec0c5d3489`; fix the first verified product failure, or isolate/repair the Quality preflight if it continues failing. Then prove the same reportJobId + sourceHash through varied-format upload, full rendered results, navigation/reload and persisted readback. Keep PR #912 unmerged until that proof exists.

---

## CURRENT EXECUTION REPORT — 2026-10-10 — corrected generic CSV fixture and source-header guard

APPLICATION_CODE_HEAD = 73c5205f75cc9ecf057ad0c5f956f69bc54b6ebe
CODE_PARENT = 761ef9b922637f23817b2612d50ffe53de092c77
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
REPORT_DATE = 2026-10-10

WHAT CHANGED =
- In `src/lib/file-engine/generic-intelligence.ts`, customer specialization is allowed only when raw source labels provide customer identity. Mapping guesses alone cannot label a generic table as a customer portfolio.
- In `scripts/generic-file-analysis.test.mjs`, the malformed duplicate tail was removed and general/specialist composition assertions restored as one complete block.
- The added `name,status,total` CSV fixture deliberately maps raw `name` to `customer_name` and verifies the result remains domain-neutral.
- The new CSV fixture's newline escaping was corrected in `73c5205f75cc9ecf057ad0c5f956f69bc54b6ebe`; source readback confirms the string has single-backslash newline escapes. It no longer holds literal double-backslash sequences.
- Existing generic/specialist composition, evidence union, full-list UI, source provenance and fail-closed specialty gates remain in place.

PROOF OBSERVED =
- Code commit `73c5205f75cc9ecf057ad0c5f956f69bc54b6ebe` exists; same-head readback confirms corrected fixture, removed orphan tail, and raw-header regression.
- Exact-head combined status: CodeRabbit success; Vercel failure target is account/provider `build-rate-limit`; Netlify status pending at deploy `6ac9965733e9f700081ad4f5`.
- The CI inventory returned 56 workflows; Product Build Gate #38013755538 queued, Quality #38013755480 queued, Full Product Browser E2E #38013755671 queued, Data Quality Runtime #38013755732 queued, File Intelligence Security #38013755423 queued, Session Handoff Contract #38013755760 pending. Actual runtime test PASS is not proven.
- Public File Lab HTML loads. Authenticated user interaction is not tested.
- One historical XLSX database row has exact sourceHash/renderedOutput hash equality and 332 canonical rows; varied-format saved readback is not proven.

PROOF STATUS =
IMPLEMENTED = YES for generic+specialist composition and raw-header classification guard
SOURCE_READBACK = YES
TEST_SOURCE_REPAIRED = YES
RUNTIME_TEST_PASS = NOT PROVEN
LATEST_NETLIFY_DEPLOY = BUILDING / PENDING AT LAST READ
VERCEL = ACCOUNT BUILD-RATE-LIMIT
BROWSER_PASS = NOT PROVEN
SAVED_MULTI_FORMAT_READBACK = NOT PROVEN
PRODUCTION_PASS = NO
PRODUCT_COMPLETE = NO

NEXT EXACT ACTION = Consume the first terminal current-code-head Quality/Product Build Gate job, fix only its first confirmed failure, then prove the same report hash across authenticated upload, Smart Report, reload and database readback.

---



## HISTORICAL EXECUTION REPORTS BELOW — preserved verbatim

## CURRENT EXECUTION REPORT — 2026-10-10 — test syntax and raw-header inference repaired

APPLICATION_CODE_HEAD = 0e2fc9b2e7e55a01255cafc1286d4ab0bb506671
CODE_PARENT_HEAD = 17556d7af347502e8fe549c99ed6bb191b1df392
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
REPORT_DATE = 2026-10-10

WHAT CHANGED
- `src/lib/file-engine/generic-intelligence.ts`: customer-portfolio detection now relies on raw column names that explicitly identify a customer, not solely on a mapper-inferred `mappedField`.
- `scripts/generic-file-analysis.test.mjs`: removed a malformed duplicated orphan tail and restored the complete general/specialist composition assertions.
- Added a regression where raw CSV column `name` is forced to `mappedField='customer_name'`, but the output must remain domain-neutral.
- The existing general/specialist composition, evidence union, all-list card, source provenance, canonical recovery fix and fail-closed decision gates remain unchanged.

WHAT IS PROVEN
- Code commit `0e2fc9b2e7e55a01255cafc1286d4ab0bb506671` exists; branch pointer update and same-head readbacks succeeded.
- The repaired test section no longer contains the orphan line and ends before the test PASS log; the raw-header guard and regression fixture are present.
- Actual Node test execution is NOT proven. Current-head focused workflows are still queued/pending.
- Latest observed status on this code SHA: CodeRabbit success; Vercel check points to account `build-rate-limit`; Netlify preview status pending.
- Public File Lab route is served. This is not interactive/authenticated browser proof.
- Historic DB job `16709d80-e012-40ef-9c12-6fd8255897f8` confirms exact sourceHash/renderedOutput hash equality and 332 canonical rows for one XLSX.

LIVE RUNS
Last observed exact-code-head Actions inventory for 0e2fc9b2e7e55a01255cafc1286d4ab0bb506671: 57 runs; 2 completed (both skipped), 48 queued, 6 pending, 1 in progress at first poll. Focus: Product Build Gate #38013524659 QUEUED; Quality #38013525077 QUEUED; Data Quality Runtime #38013524702 QUEUED; File Intelligence Security #38013524449 QUEUED; Full Product Browser E2E #38013524550 PENDING and #38013520555 QUEUED; Session Handoff Contract #38013524498 PENDING. No focused runtime test has a terminal result.

PROOF STATUS
IMPLEMENTED = YES for generic + specialist composition and source-header inference guard
SOURCE_READBACK = YES
RUNTIME_TEST_PASS = NOT PROVEN
LATEST_CODE_NETLIFY_DEPLOY = PENDING AT LAST READ
VERCEL = ACCOUNT BUILD-RATE-LIMIT
AUTHENTICATED_BROWSER_PASS = NOT PROVEN
MULTI_FORMAT_PERSISTED_READBACK = NOT PROVEN
PRODUCTION_PASS = NO
PRODUCT_COMPLETE = NO

NEXT EXACT ACTION = Consume the first terminal current-code-head Quality/Product Build Gate log, fix only the first confirmed failure, then prove upload→Smart Report→navigation/reload→saved readback with identical job ID and source hash.

---



## HISTORICAL EXECUTION REPORTS BELOW — preserved verbatim

## CURRENT EXECUTION REPORT — 2026-10-10 — KEEP GENERAL TABLE ANALYSIS DOMAIN-NEUTRAL

APPLICATION_HEAD = pending-this-commit
PARENT_HEAD = 789700d2f77dbab841ca5e68bc82aced63cf7717
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
DATE = 2026-10-10

WHAT CHANGED IN THIS TRANSACTION =
- Tightened `profileStructuredTable` in `src/lib/file-engine/generic-intelligence.ts`: a table is customer-portfolio-shaped only when there is a real customer identity column (for example customer_name / اسم العميل / اسم الزبون) plus status and totals/month structure. An item/supplier label plus status and total no longer gets a customer-churn interpretation.
- Expanded format assertions to require CSV, JSON, JSONL, XML, YAML examples with generic item/status/total fields remain domain-neutral.
- Corrected a false-positive in the merge regression: the simulated specialist layer now contains only one overlapping signal and its own specialist records, not every generic signal/recommendation from the base. Assertions require the generic-only status signal and reconciliation recommendation to arrive from the general layer, and require both evidence sources on overlapping IDs.
- This preserves the existing core and all source-bound/decision gates.

CURRENT PROOF =
- Parent HEAD read back as `789700d2f77dbab841ca5e68bc82aced63cf7717`, PR #912 open, not merged.
- The code/test changes in this transaction are new; build and runtime tests are not yet proven.
- The prior application SHA `a077dfebea99f8848b086f0b04dbedf83a2d6b17` was Vercel READY; its Vercel/Netlify preview/CodeRabbit statuses were successful. Those results do not transfer to the new fix SHA.
- No current-head authenticated browser or persisted report readback proof. PRODUCT_COMPLETE = NO.

NEXT EXACT ACTION =
Inspect the first terminal new-head build/quality result, repair the first actual failure, then use Full Product Browser E2E to verify the same source hash through upload, saved Smart Report, navigation and reload.


## HISTORICAL REPORTS BELOW — preserved verbatim

## CURRENT EXECUTION REPORT — 2026-10-10 — GENERAL INTELLIGENCE ACROSS FILE TYPES

APPLICATION_HEAD = a077dfebea99f8848b086f0b04dbedf83a2d6b17
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 OPEN / NOT MERGED
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
REPORT_FOR_HEAD = a077dfebea99f8848b086f0b04dbedf83a2d6b17
UPDATED_AT = 2026-10-10T03:15:00+03:00

WHAT_CHANGED =
- Added `compose-intelligence-layers.ts` and integrated it into the universal chain so source-general analysis and applicable specialist analysis are merged by stable IDs with unioned evidence.
- File Lab creates generic intelligence independent of specialty detection; Smart Report computes/returns/renders the separate general layer on every smart report, while specialist quality/decision gates remain fail-closed.
- GenericFileIntelligenceCard exposes all lists passed to it, evidence, measurements, owners, limitations, drivers, risks/opportunities and source identity without view-level truncation.
- Canonical recovery now reads existing evidence and preserves sourceHash, sourcePath and importId.
- Fixed confirmed syntax regression in `report-smart.ts` at ancestor `7c0411b` in code commit `dee505d`. Vercel recorded `✓ built in 20.37s`; the repaired code was deployed READY.
- Expanded `scripts/generic-file-analysis.test.mjs` to test TXT, CSV, JSON, JSONL, XML, YAML, Markdown, RTF and XLSX, requiring source-derived findings and source-specific evidence for each case. Commit: `a077dfebea99f8848b086f0b04dbedf83a2d6b17`.

PROOF =
- GitHub readback confirms modified code and test blobs. New format test matrix is authored and committed; its runtime execution is still PENDING.
- Current-head deployment contexts are CodeRabbit success, Vercel pending, Netlify deploy-preview pending. Product Build Gate #38012609562, Full Product Browser E2E #38012609619, Quality #38012609570 and Data Quality Runtime #38012609428 are queued; File Intelligence Security #38012609431 queued; Session Handoff Contract #38012609304 pending.
- No authenticated browser upload→report→navigation/reload→saved readback proof has passed at this head. No production proof.

PROOF_STATUS
IMPLEMENTED = YES for source-general + specialist composition and complete list view
INTEGRATED = YES in PR #912
SOURCE_READBACK = YES
FORMAT_TEST_RUNTIME_PASS = PENDING
BUILD_GATE = QUEUED
BROWSER_PASS = NOT PROVEN
PERSISTED_READBACK = NOT PROVEN
PRODUCTION_PASS = NO
PRODUCT_COMPLETE = NO

FIRST_ACTIVE_FAILURE = No terminal product-focused test failure has surfaced at exact head `a077dfebea99f8848b086f0b04dbedf83a2d6b17`; the focused workflows remain queued/pending. The last confirmed parse error was fixed at `dee505d`. The independent Phase-F restore-schema blocker remains pending.
NEXT_EXACT_ACTION = Consume a terminal focused gate at this exact head, inspect logs and repair only the first confirmed failure; then prove varied-format source-bound report display/readback.

---


## HISTORICAL EXECUTION REPORTS BELOW — preserved verbatim

## CURRENT EXECUTION REPORT — 2026-10-10 — GENERAL INTELLIGENCE ACROSS FILE TYPES

APPLICATION_HEAD = 85f69f2ab10fee85293b99e902cfe15eab8f4f91
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912 (OPEN / NOT MERGED)
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
REPORT_FOR_HEAD = 85f69f2ab10fee85293b99e902cfe15eab8f4f91
UPDATED_AT = 2026-10-10T03:00:00+03:00

WHAT_I_WAS_ASKED_TO_DO =
Continue the existing product branch, preserve the intelligence core, make generic source-derived analysis available for all supported file shapes regardless of inferred specialty, compose specialist analysis without replacing the general layer, show complete findings/signals/recommendations/evidence on upload and saved-report surfaces, maintain source identity across routes, and preserve an append-only execution record.

WHAT_CHANGED =
- `src/lib/report-intelligence/compose-intelligence-layers.ts`: shared source-general + specialist composition, stable-ID deduplication, union of overlapping evidence, both layer-specific signal/recommendation/finding sets retained and cautious health precedence.
- `src/lib/universal-report-intelligence.ts`: accepts `generalIntelligence` and composes it with existing rule-set/specialist/preview result.
- `src/pages/ExternalFileAnalysisPage.tsx`: computes generic intelligence for every recognized dataset, passes it into the universal chain and binds the card to file path/hash.
- `src/lib/report-smart.ts`: computes and returns `genericIntelligence` independently of specialty eligibility, retains fail-closed review state for specialist decisions, and composes the general layer into the shared report intelligence object.
- `src/pages/SmartReportPage.tsx`: renders the general card whether or not a specialty exists, with report path/job ID/source hash, and passes it to the Universal Intelligence Chain.
- `src/components/GenericFileIntelligenceCard.tsx`: renders all available result/evidence lists, finding/risk/opportunity records, drivers, owners, measurements and limits without old 5/8-item presentation truncation.
- Regression assertions added for merging general/specialist layers and complete/source-bound card visibility.
- Canonical recovery now selects existing `evidence` and preserves `sourceHash`, `sourcePath`, and `importId` while repairing rendered output.
- The syntax failure introduced by an earlier stale-range edit was fixed in commit `dee505dc045d577b9015ca7cb2ba06adb00a6f76`; Vercel build log records `✓ built in 20.37s`, and the repaired code SHA is READY on Vercel and Netlify.

WHAT_IS_PROVEN =
- Code/application SHA under review: `85f69f2ab10fee85293b99e902cfe15eab8f4f91`; PR #912 remains open; main SHA `fa1ab4cbade9b01685507aa966c10f700a03f576`.
- GitHub source readback verifies edited files, the composer, the source-lineage repair, the UI list-rendering and the new regression assertions.
- Deployment statuses at exact code SHA: Vercel success/READY, Vercel Deployments – Injaz success, Netlify deploy-preview success, CodeRabbit success. The last docs-only Netlify attempt was canceled due no published build content change; app code from `dee505d...` is deployed.
- Exact-head Actions query: 56 runs, 3 completed (2 skipped, desktop-windows success is not product proof), 49 queued, 4 pending, none in progress.
- Product Build Gate [38012001245](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38012001245) QUEUED; Full Product Browser E2E [38012001488](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38012001488) QUEUED; Quality [38012001386](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38012001386) QUEUED; File Intelligence Security [38012001065](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38012001065) QUEUED; Data Quality Runtime [38012001327](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38012001327) QUEUED; Device-Independent E2E [38012001097](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38012001097) QUEUED; Phase-F [38012001221](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38012001221) QUEUED; Session Handoff Contract [38012001369](https://github.com/Report-Engainall/Report-Advisor/actions/runs/38012001369) PENDING.
- Runtime merge assertions are committed but not yet proven executed. No browser journey/readback pass at this head is claimed.

FIRST_ACTIVE_FAILURE =
The important focused workflows have not reached a terminal result at this exact head, so no new terminal product failure can yet be diagnosed. A previous confirmed build failure at ancestor `7c0411b...` is fixed and build-proven on `dee505d...`. Separate Phase-F restore failure involving missing `public.intelligence_causal_hypotheses` remains unresolved until the exact-head Phase-F job returns.

PROOF_STATUS
IMPLEMENTED = YES for shared general/specialist composition and complete-list UI exposure in the PR
INTEGRATED = YES, PR #912 open
PERSISTED = GITHUB SOURCE CHANGES/REPORT READBACK YES; end-user intelligence persistence/readback NOT PROVEN
UI_EXPOSED = SOURCE READBACK YES; BROWSER-PROVEN NO
CONTRACT_PASS = PENDING
BUILD_PASS = VERCEL READY; Product Build Gate workflow QUEUED
BROWSER_PASS = NOT PROVEN
RUNTIME_PASS = DEPLOYMENTS READY; authenticated user journey NOT PROVEN
PRODUCTION_PASS = NO
PRODUCT_COMPLETE = NO

NEXT_EXACT_ACTION = Consume a terminal result from the exact-head Product Build Gate / Quality / Full Product Browser E2E, inspect the full job log, fix the first confirmed failure, and then prove the same report job ID/source hash across upload, navigation, reload, and persisted readback.

---


## HISTORICAL REPORTS BELOW — preserved verbatim

## CURRENT EXECUTION REPORT — 2026-10-10 — EVIDENCE PASSPORT + RESTORE SCHEMA

APPLICATION_HEAD = 102959e897b5cc12c5e2d392831e07d6eaed2c0b
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
REPORT_FOR_HEAD = 102959e897b5cc12c5e2d392831e07d6eaed2c0b
UPDATED_AT = 2026-10-10T01:27:00+03:00

WHAT_I_WAS_ASKED_TO_DO = Continue current PR execution, remove the first confirmed root causes, keep the evidence lineage accurate, sync live execution files, and prove the persisted report journey.

WHAT_I_ACTUALLY_DID =
- Reworked governed corpus passport job discovery to query per tenant in bounded pages and match relevant source hashes in memory, avoiding a separate DB scan for every file.
- Added a legacy report passport refresh migration that recovers the import ID from the report job checkpoint, validates completed import/fingerprint/file/analysis/canonical counts, and writes verified source-bound render fields only after checks.
- Corrected a one-character parsing offset in a follow-up migration. Staging function source readback verifies the corrected offset and confirms the broken offset is absent.
- Added schema parity for `intelligence_causal_hypotheses` because Phase-F's data-only backup included the table while clean local restoration from repo migrations lacked it. The migration preserves its observed constraints, tenant RLS policy, no anon SELECT, and authenticated/service privileges; Phase-F now checks the table after migration reset before restoring the dump.
- Updated the branch's migration filenames to the timestamps that Supabase actually registered, preventing duplicate pending migration versions.
- Reconciled CURRENT_SESSION_STATE, PROGRAMMER_CURRENT_REPORT and a new append-only dated report to the exact code HEAD. PR remains unmerged.

WHAT_IS_PROVEN =
- PR #912 is OPEN / NOT MERGED; code HEAD 102959e897b5cc12c5e2d392831e07d6eaed2c0b; main HEAD fa1ab4cbade9b01685507aa966c10f700a03f576.
- Staging migration versions `20261009222131`, `20261009222216`, `20261009222627` are applied. Metadata readback confirms `intelligence_causal_hypotheses` has RLS, one tenant policy and no anon SELECT privilege.
- Report job `16709d80-e012-40ef-9c12-6fd8255897f8` and import `1e68460b-f181-4f09-a4fe-d6a58be1fb18` are completed for `تقارير ادارية.xlsx` with matching SHA-256, 332/332 valid rows, 332 canonical rows, analysis row count 332, 18 columns, quality 98.
- Direct privileged refresh call through the SQL tool did not execute because the tool safety layer blocked it; no write/readback PASS is claimed for that attempt.
- The latest exact-head CI runs listed in state were pending/queued; current-head browser, Passport refresh, Phase-F restore and production proof remain unproven.

FIRST_ACTIVE_FAILURE = The prior Full Product Browser E2E failed at per-file real-corpus passport refresh with a Supabase statement timeout and later failed the business smart-report proof because a legacy renderedOutput lacked sourceHash/sourceBound/rowCount/qualityScore/importId. The code now batches job discovery and enriches only from validated tenant/source/import/analysis/canonical evidence. The prior Phase-F restore failed because public.intelligence_causal_hypotheses was absent from the locally reconstructed schema even though the source dump contains it; schema parity and a preflight are now added but still require a green restore run.

ROOT_CAUSE = The passport refresher performed an N+1 query pattern over governed files; the evidence RPC assumed the import ID was already copied into renderedOutput and did not recover it from the durable job checkpoint; older renderedOutput missed normalized fields expected by the current UI/E2E. Separately, restore target schema drifted from the source DB because one existing relation was not declared in repo migrations.

NEXT_EXACT_ACTION = Inspect the latest exact-head Full Product Browser E2E run and Phase-F run at their first terminal failure. Verify the passport refresh write/readback and smart-report content path, then verify the logical backup/restore snapshot equality with the restored causal-hypothesis table. Do not merge or declare complete while any critical release gate is open.

PROOF_STATUS
IMPLEMENTED = YES for bounded batch discovery, legacy checkpoint import recovery and schema parity on 102959e897b5cc12c5e2d392831e07d6eaed2c0b
INTEGRATED = YES in open PR #912
PERSISTED = migration changes applied to staging and source tracked at version-matched filenames
UI_EXPOSED = NOT PROVEN on current HEAD
READBACK_PROVEN = base report data verified; passport mutation/readback via current-run service credentials pending
CONTRACT_PASS = PENDING exact-head
BUILD_PASS = PENDING exact-head
BROWSER_PASS = NOT PROVEN
RUNTIME_PASS = PENDING exact-head deployment
PRODUCTION_PASS = NO
PRODUCT_COMPLETE = NO

SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT MAIN HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT EXECUTION HEAD = 102959e897b5cc12c5e2d392831e07d6eaed2c0b
REPORT_FOR_HEAD = 102959e897b5cc12c5e2d392831e07d6eaed2c0b

---

## HISTORICAL EXECUTION REPORT — 2026-10-10 01:23 — preserved

## CURRENT EXECUTION REPORT — 2026-10-10 — LEGACY REPORT EVIDENCE REPAIR

APPLICATION_HEAD = a50159eca39fb3bea2c28a3d5399cdf0e21ce728
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
REPORT_FOR_HEAD = a50159eca39fb3bea2c28a3d5399cdf0e21ce728
UPDATED_AT = 2026-10-10T01:23:00+03:00

WHAT_I_WAS_ASKED_TO_DO = Continue from the live PR, repair the first proven failures in the source-bound saved-report path, preserve tenant security, update durable state, and verify exact-head evidence.

WHAT_I_ACTUALLY_DID =
- Batched governed corpus report-job discovery by tenant and hash with bounded pagination, removing the former per-file database query loop that hit statement timeouts.
- Added a legacy-aware evidence-passport migration that recovers the import job ID from the same report execution checkpoint when older renderedOutput lacks importId; it validates completed import status, source fingerprint, secure file record, matching analysis, and full import/canonical row counts before marking the report verified.
- Normalized source-bound report output only from validated records: source hash/path, import ID, authoritative row count, quality score, analysis snapshot ID, sourceBound flag, trust state, evidence snapshot and passport IDs.
- Fixed an initial offset error in the checkpoint parser with a subsequent migration; verified current Supabase function source has the corrected offset and no old offset.
- Reconciled migration filenames with the versions actually recorded in staging, avoiding duplicate pending migration versions.
- Updated state, current report, archive and archive index. Did not merge PR #912 or claim the live refresh itself passed.

WHAT_IS_PROVEN =
- PR #912 remains open/unmerged; code HEAD a50159eca39fb3bea2c28a3d5399cdf0e21ce728; main fa1ab4cbade9b01685507aa966c10f700a03f576.
- Supabase staging has applied migration versions 20261009222131 and 20261009222216; function source readback shows the corrected import-ID substring offset.
- The target real report job is completed/rendered; its import is completed with 332/332 valid rows, fingerprint equals source hash, canonical table contains 332 records, and analysis snapshot is XLSX with 332 rows, 18 columns and quality score 98.
- Earlier E2E proven route+tenant stages succeeded at predecessor head; that did not establish current-head final smart-report rendering.
- Current-head workflow results were queued/pending at the last read; no final current-head browser readback has yet been claimed.
- The privileged direct refresh RPC call was blocked by the SQL tool safety layer. The next valid proof is the workflow's authorized service-role refresh and browser readback, not an inferred PASS.

FIRST_ACTIVE_FAILURE = The last completed Full Product Browser E2E on predecessor ee9540dd failed on a slow N+1 corpus-passport lookup and a legacy renderedOutput schema that lacked sourceHash/sourceBound/rowCount/qualityScore/importId. The fixes are now committed. A separate Phase-F backup/restore run failed because restore SQL referenced missing relation public.intelligence_causal_hypotheses; this separate resilience fault remains unresolved.

ROOT_CAUSE = Two related report-path defects: one DB lookup per governed file caused repeated tenant-scoped scans and timeouts; older completed report jobs stored authoritative source/import/row-count data in root job fields and checkpoint/evidence keys but omitted fields required by the current UI proof contract. Passport refresh did not recover the checkpoint import ID or enrich renderedOutput after source/import/canonical checks. The checkpoint substring offset was corrected and the migration history filenames were aligned.

NEXT_EXACT_ACTION = Consume [Full Product Browser E2E](https://github.com/Report-Engainall/Report-Advisor/actions/runs/37998946502) on code HEAD a50159eca39fb3bea2c28a3d5399cdf0e21ce728; confirm governed passports refresh, 48/48 runtime, report readback, actual Chromium smart report/catalog/refresh journey, and tenant isolation. Then inspect and repair the Phase-F missing-relation restore contract. Do not merge while either critical failure remains.

PROOF_STATUS
IMPLEMENTED = YES for batch discovery and legacy passport repair on a50159eca39fb3bea2c28a3d5399cdf0e21ce728
INTEGRATED = YES in open PR #912
PERSISTED = migration applied to staging; repository migrations match applied version IDs
UI_EXPOSED = NOT PROVEN on current code head
READBACK_PROVEN = base data readback PASS; passport refresh write/readback on current schema NOT YET PROVEN
CONTRACT_PASS = PENDING exact-head
BUILD_PASS = PENDING exact-head
BROWSER_PASS = NOT PROVEN exact-head
RUNTIME_PASS = PENDING for exact preview SHA
PRODUCTION_PASS = NO
PRODUCT_COMPLETE = NO

SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT MAIN HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT EXECUTION HEAD = a50159eca39fb3bea2c28a3d5399cdf0e21ce728
REPORT_FOR_HEAD = a50159eca39fb3bea2c28a3d5399cdf0e21ce728


---

## HISTORICAL EXECUTION REPORT — 2026-10-10 00:50 — preserved

## CURRENT EXECUTION REPORT — 2026-10-10 — SOURCE-BOUND REPORT E2E

APPLICATION_HEAD = 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
REPORT_FOR_HEAD = 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f
UPDATED_AT = 2026-10-10T00:50:00+03:00

WHAT_I_WAS_ASKED_TO_DO = Continue from the current live PR head, resolve current blockers, keep product and evidence source-bound, synchronize governance, and prove the saved-report browser journey.

WHAT_I_ACTUALLY_DID =
- Re-read live PR metadata; latest application code head at this checkpoint is 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f, not the earlier 54f4... baseline.
- Inspected exact-head workflow statuses and fetched the failed Quality logs for predecessor 54f4....
- Diagnosed the predecessor Quality failure as an exact-head race: Diagnostics failed while the PR branch advanced; Install and earlier phases were skipped, causing cascading `eslint: not found`, missing Vite, and absent dist output. A fresh exact-head Quality run for 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f was queued; the old failure is not treated as proof of a code build failure.
- Confirmed the Session Handoff Contract passed on 54f4... after correcting the over-escaped newline split.
- Read the current Netlify `/api/health` endpoint: healthy, with source/build/deployment SHA all equal to 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f, on preview deployment 6ac9613bfb4f2400086a0786.
- Public unauthenticated route inspection confirms /reports no longer substitutes the fixed inventory demo; it returns the landing/auth surface. This is not an authenticated catalog proof.
- Current code change configures the Full Product Browser E2E report-resume step to use the genuine XLSX report and test user C's owning company, preserving row-count and source-hash assertions. No auth/RLS bypass introduced.
- Updated governance records and an append-only dated report; historical checkpoints are preserved.

WHAT_IS_PROVEN =
- PR #912 open/not merged; application code SHA 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f; main fa1ab4cbade9b01685507aa966c10f700a03f576.
- Build exact SHA and canonical heart regressions passed earlier within Full Product Browser E2E run 37995313077 on 54f4...; they are not promoted as exact-692e0d6ed5c299dfc1a3bda23dfea16ed24a374f results.
- Current Netlify preview runtime has source/build/deployment SHA 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f and reports healthy.
- Session Handoff Contract passed on 54f4... at run 37995313007. Fresh handoff run for 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f was queued at last read.
- Security isolation, import truth, file-engine header, UI route completeness and several certification contracts reported success on 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f in the initial workflow result fetch.
- Current-head Full Product Browser E2E, Quality and Product Build Gate were queued/pending at last read; no terminal current-head browser pass.
- No current-head persisted upload/readback/catalog/detail/refresh/re-login proof yet.

FIRST_ACTIVE_FAILURE = No terminal application failure is established on 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f yet. The first observed failed checks belong to stale predecessor runs: Session Handoff failed on 3e46dd1 due stale governance + incorrect line splitting (fixed at 99d1adf); Quality and Phase 9 exact-head diagnostics on 54f4 failed while the branch advanced. The immediate current blocker is waiting for terminal results from the latest exact-head build/quality/browser workflows, then diagnosing the first terminal failure.

ROOT_CAUSE = Stale branch-HEAD checks failed because the PR was advanced while older workflow runs were running; their install/build/performance failures were downstream of the failed diagnostics. A separate handoff checker bug was corrected previously. Current preview runtime is aligned to 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f; authenticated customer journey still needs proof.

NEXT_EXACT_ACTION = Wait for the in-flight exact-head run's status to update through GitHub (without launching duplicates); inspect the first terminal failing job log and repair only the demonstrated root cause. Prove the real XLSX job recovery, authenticated Chromium report/catalog/detail and post-refresh readback before merge.

PROOF_STATUS
ROOT_CAUSE_IDENTIFIED = YES for stale-predecessor failures; no new terminal application fault established
IMPLEMENTED = YES for tenant-owned XLSX E2E resume configuration on 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f
INTEGRATED = YES in open PR #912
PERSISTED = YES on branch; governance sync being recorded
UI_EXPOSED = PUBLIC ROUTE FIX VERIFIED; authenticated saved report NOT PROVEN
CONTRACT_PASS = PARTIAL; stale Session Handoff failure fixed and 54f4 pass; fresh exact-head handoff pending
BUILD_PASS = PENDING exact-head Product Build Gate
BROWSER_PASS = NOT PROVEN on 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f
PERSISTENCE_PASS = predecessor-only
RUNTIME_PASS = PASS on preview SHA 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f
PREVIEW_PASS = PASS for exact SHA/runtime health only
PRODUCTION_PASS = NO
PRODUCT_COMPLETE = NO

SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT MAIN HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT EXECUTION HEAD = 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f
REPORT_FOR_HEAD = 692e0d6ed5c299dfc1a3bda23dfea16ed24a374f

---

## HISTORICAL REPORT — 2026-10-10 00:44 — preserved
## CURRENT EXECUTION REPORT — 2026-10-10 — HEAD RECONCILIATION + SESSION HANDOFF REPAIR

APPLICATION_HEAD = 99d1adfb5bc6df409243f47f0ebb8e53b4808262
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
REPORT_FOR_HEAD = 99d1adfb5bc6df409243f47f0ebb8e53b4808262
UPDATED_AT = 2026-10-10T00:44:00+03:00

WHAT_I_WAS_ASKED_TO_DO = Continue from the live PR state, diagnose the first terminal failure, reconcile stale execution records, preserve security, and prove the customer-facing saved-report journey.

WHAT_I_ACTUALLY_DID =
- Re-read PR #912 metadata and current workflow statuses; the live PR HEAD had advanced beyond the user-supplied 0bf5d5c... to 3e46dd1..., then the governance fix was committed as 99d1adfb5bc6df409243f47f0ebb8e53b4808262.
- Downloaded the failed Session Handoff Contract job log and identified both the stale REPORT_FOR_HEAD baseline and an over-escaped changed-path newline split in scripts/check-session-handoff-contract.mjs.
- Corrected the split expression and persisted it in 99d1adfb5bc6df409243f47f0ebb8e53b4808262; the updated script was read back from GitHub.
- Prepared a single governance-only commit updating CURRENT_SESSION_STATE.md, PROGRAMMER_CURRENT_REPORT.md, the append-only report archive, and the archive README to this verified baseline.
- Did not merge PR #912, restart queued jobs, relax authorization, or label pending work as PASS.

WHAT_IS_PROVEN =
- PR #912 is open and not merged; branch fix/source-bound-generic-intelligence-20261009; code baseline 99d1adfb5bc6df409243f47f0ebb8e53b4808262; main baseline fa1ab4cbade9b01685507aa966c10f700a03f576.
- Commit 99d1adfb5bc6df409243f47f0ebb8e53b4808262 changes the session handoff changed-path split and is a child of 3e46dd17511533bbbab77578b39c403058002020.
- The prior Session Handoff Contract failed at run 37994951056 on 3e46dd1 with the log message SESSION_HANDOFF_CONTRACT_FAIL: stale report; state/report contained 447d1009caa6279faf5664da932c1f25addb8594. The script cause is now patched, but the post-fix contract result is still pending.
- Latest recorded run set on 99d1adfb5bc6df409243f47f0ebb8e53b4808262: Session Handoff Contract 37995180640 queued; Full Product Browser E2E 37995180514 queued; Product Build Gate 37995180426 queued; Quality 37995180504 queued; Commercial Product Creation E2E 37995180499 queued; Device-Independent Browser E2E 37995180266 queued; Phase-F Live Resilience 37995180352 pending.
- Deployment statuses on 99d1adfb5bc6df409243f47f0ebb8e53b4808262 were pending in the last status read. Earlier preview success on 3e46dd1 is not promoted to this head.
- The prior-head database identifiers in the historic report remain predecessor evidence only. No current-head browser-visible saved-report proof is claimed.

FIRST_ACTIVE_FAILURE = Session Handoff Contract failure on predecessor head 3e46dd17511533bbbab77578b39c403058002020, run 37994951056. The checker falsely collapsed the changed path list because the newline split was over-escaped, while the report baseline also lagged at 447d1009caa6279faf5664da932c1f25addb8594. The split was corrected in 99d1adfb5bc6df409243f47f0ebb8e53b4808262; a fresh exact-head pass is pending.

ROOT_CAUSE = Governance checkpoint drift plus incorrect changed-path splitting in scripts/check-session-handoff-contract.mjs. The path-list bug is fixed. State/report baseline is being synchronized to 99d1adfb5bc6df409243f47f0ebb8e53b4808262, after which the handoff contract must run on the new descendant commit.

NEXT_EXACT_ACTION = Observe the fresh post-sync Session Handoff Contract and Full Product Browser E2E; inspect logs at the first final failure. Complete authenticated upload→canonical import→persist/readback→catalog→details→refresh/re-login and A–J proof before merge.

PROOF_STATUS
ROOT_CAUSE_IDENTIFIED = YES; prior failing log inspected
IMPLEMENTED = YES for the checker split correction on 99d1adfb5bc6df409243f47f0ebb8e53b4808262
INTEGRATED = YES in open PR #912
PERSISTED = YES in GitHub; checker file read back after update
UI_EXPOSED = NOT PROVEN on current code baseline
CONTRACT_PASS = PENDING fresh exact-head run
BUILD_PASS = PENDING
BROWSER_PASS = NOT PROVEN
PERSISTENCE_PASS = predecessor-only evidence; current replay pending
RUNTIME_PASS = PENDING for current code baseline
PREVIEW_PASS = PENDING for current code baseline
PRODUCTION_PASS = NO
PRODUCT_COMPLETE = NO

SESSION HANDOFF = NOT READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT MAIN HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT EXECUTION HEAD = 99d1adfb5bc6df409243f47f0ebb8e53b4808262
REPORT_FOR_HEAD = 99d1adfb5bc6df409243f47f0ebb8e53b4808262


---

## HISTORICAL REPORT — 2026-10-10 00:42 — preserved without overwriting

## CURRENT EXECUTION REPORT — 2026-10-10 — PR #912 P0 ROUTE FIX

APPLICATION_HEAD = 447d1009caa6279faf5664da932c1f25addb8594
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = #912
MAIN_HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
REPORT_FOR_HEAD = 447d1009caa6279faf5664da932c1f25addb8594
UPDATED_AT = 2026-10-10T00:42:00+03:00

WHAT_I_WAS_ASKED_TO_DO = Restore real report visibility in the existing app, preserve prior work/source lineage, and prove the product beyond backend tests.

WHAT_I_ACTUALLY_DID =
- Public preview extraction showed /reports rendering fixture inventory demo instead of protected Reports Center because the Netlify host predicate returned ProposalDemoPage for all workspace routes.
- Restricted host-based demo to the landing path; /reports and /reports/smart/:jobId now flow through AuthGate and AppShell.
- Fixed ?auth=1 to render AppShell behind AuthGate and added route contract assertions.
- Fixed the four hidden-text Evidence Passport E2E selectors, corrected device-independent test actor company IDs, aligned the static surface contract, and configured Phase F to use an official PostgreSQL public ECR mirror.
- An intermediate code commit 2bc failed due literal newline escapes at App.tsx line 222; the escapes were corrected at 447d1009caa6279faf5664da932c1f25addb8594. Exact-head CI is rerunning.

WHAT_IS_PROVEN =
- Current code SHA 447d1009caa6279faf5664da932c1f25addb8594; main fa1ab4cbade9b01685507aa966c10f700a03f576; PR #912 open/not merged.
- Public rendered page inspection of prior preview SHA 0474e1bf6f6e51414f9715154a385411f433f164 verified /reports displayed fixture 28-inventory-stockout-reorder.csv instead of the tenant catalog. This directly verifies the route root cause.
- Current source restricts host-triggered demo to '/'; route test asserts protected workspace handling. New preview and current-head browser proof pending.
- Persisted Supabase readback on predecessor SHA 31cba40866569c6bdb6e53ce970b7b87901d1e5b: report job 16709d80-e012-40ef-9c12-6fd8255897f8; import job 1e68460b-f181-4f09-a4fe-d6a58be1fb18; file record c2d392e0-9b5c-4781-82b8-758680586524; company 99e33354-cc45-4317-8eb3-0d486b6c5932; source تقارير ادارية.xlsx; hash sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313; 332 rows; quality 98; VERIFIED. This is prior-head DB evidence only.
- Production is still published at 858ef8e3e5bc5bf74430555eadfb9e6767be348b; no production PASS.

FIRST_ACTIVE_FAILURE = Live public Netlify /reports returned ProposalDemoPage and fixture inventory data instead of the real protected reports catalog. The intermediate route patch at 2bc also failed TypeScript due a literal newline escape; corrected at 447d1009caa6279faf5664da932c1f25addb8594.

ROOT_CAUSE = A host-level preview condition replaced all non-special routes with demo UI; so /reports/smart/:jobId after a successful upload could not display the saved report on the public Netlify host. Host demo is now restricted to the landing route. Prior Playwright proof also picked a hidden duplicate evidence label, and the E2E tenant setup used the wrong company; those were separately corrected.

NEXT_EXACT_ACTION = Consume build/quality/security/certification/browser/Phase-F results for this exact code SHA and the new Netlify deployment; prove the real authenticated upload→DB readback→catalog→detail→refresh/re-login flow and scenarios A–J before merge or production.

PROOF_STATUS
ROOT_CAUSE_IDENTIFIED = YES from public rendered route evidence
IMPLEMENTED = YES on 447d1009caa6279faf5664da932c1f25addb8594
INTEGRATED = YES in open PR #912
PERSISTED = YES on branch
UI_EXPOSED = IMPLEMENTED; new preview test pending
READBACK_PROVEN = predecessor only
CONTRACT_PASS = PENDING
BUILD_PASS = PENDING
BROWSER_PASS = NOT PROVEN
PERSISTENCE_PASS = predecessor readback PASS; current replay pending
PREVIEW_PASS = NOT PROVEN for current SHA
PRODUCTION_PASS = NO
PRODUCT_COMPLETE = NO

SESSION HANDOFF = READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT MAIN HEAD = fa1ab4cbade9b01685507aa966c10f700a03f576
CURRENT EXECUTION HEAD = 447d1009caa6279faf5664da932c1f25addb8594
REPORT_FOR_HEAD = 447d1009caa6279faf5664da932c1f25addb8594

