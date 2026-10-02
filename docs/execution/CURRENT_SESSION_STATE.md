# CURRENT SESSION STATE

SESSION HANDOFF = NOT READY
STATE_OWNER = CAPTAIN + PROGRAMMER
CURRENT_BRANCH_HEAD = cd65458182b40ed8c74545a956cab9d8b59e7cf9
CURRENT_EXECUTION_HEAD = a6f19a064003e94c508b8a27bded19933465376c
CURRENT_MAIN_HEAD = 0c337e58898d88d8a7d2a60a26773b34d90c6dd3
BRANCH = fix/current-head-runtime-provenance-20261002
PR = #730 OPEN / NOT MERGED / MERGEABLE
PROGRAMMER_REPORT = PRESENT
PROGRAMMER_REPORT_FOR_HEAD = a6f19a064003e94c508b8a27bded19933465376c
ACTION_STATUS = IN_PROGRESS

STATIC_PROOF = PRIOR_PC01_WORKFLOW_BATCH_PASS; PRIOR_PC01_SECURITY_DEFINER_PASS; PRIOR_PC01_SESSION_HANDOFF_PASS; NEW_HEAD_STATIC_REREAD_PENDING
P0A_PROOF = authenticated SELECT=true; authenticated INSERT/UPDATE/DELETE=false; anon SELECT=false; RLS=true; same-tenant visible_rows=1; wrong-tenant visible_rows=0; anon SELECT SQLSTATE=42501
P0B_FIX = expectBlocked now accepts one documented error from an allowed set; live gate has explicit same-tenant/wrong-tenant/anon Passport SELECT assertions
COHORT_PROOF = 42 candidates; 42 unique source hashes; 4 tenants; 32 PDF; 10 XLSX; 42 analyzed; quality 76..100 avg 93.64; 135 rendered outputs; 40 VERIFIED; 40 READY
ACTION_CHAIN_PROOF = NOT PROVEN; latest verified passport has no linked recommendation/decision/approval/work/outcome
P1A_STATUS = plans are low-cost/index-backed; 57014 root cause not yet isolated; no blind timeout increase applied
P1C_STATUS = Phase F STALE_RUNTIME + rollback-forward TypeError remains separate and uncertified
SECURITY_ADVISORY = public.canonical_import_repair_history RLS disabled; direct anon/authenticated table privileges false; no auto-remediation
MIGRATION_PROVENANCE = 20261002165000 migration added to branch; equivalent GRANT applied directly to staging for proof
NEXT_EXACT_ACTION = run current-head static checks, then consume current-head Evidence Passport Live Proof + Full Product Browser E2E; then isolate 57014 with execution/lock evidence and prove one source-bound action chain
DO_NOT_REPEAT = do not reuse old SHA PASS; do not widen Passport mutation privileges; do not weaken RLS; do not accept arbitrary negative-path errors; do not raise statement_timeout blindly

Resume anchor: execution code is a6f19a064003e94c508b8a27bded19933465376c. Metadata commits after it are persistence only.
