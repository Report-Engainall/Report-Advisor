# CURRENT SESSION STATE

SESSION HANDOFF = NOT READY
STATE_OWNER = CAPTAIN + PROGRAMMER
CURRENT_EXACT_HEAD = 5184cc1fe839a794cf2c7f4c5e1568d16aaaff8
CURRENT_EXECUTION_HEAD = 5184cc1fe839a794cf2c7f4c5e1568d16aaaff8
CURRENT_EXECUTION_HEAD_STABILITY = documentation-only commits do not change execution code head
CURRENT_MAIN_HEAD = 0c337e58898d88d8a7d2a60a26773b34d90c6dd3
BRANCH = fix/current-head-runtime-provenance-20261002
PR = #730 OPEN / NOT MERGED / MERGEABLE
PROGRAMMER_REPORT = PRESENT
PROGRAMMER_REPORT_FOR_HEAD = 5184cc1fe839a794cf2c7f4c5e1568d16aaaff8
ACTION_STATUS = IN_PROGRESS

STATIC_PROOF = WORKFLOW_BATCH_PASS; SECURITY_DEFINER_PASS; SESSION_HANDOFF_PASS; LIVE_GATE_SYNTAX_PASS; GIT_DIFF_CHECK_PASS
P0A_PROOF = authenticated SELECT=true; authenticated INSERT/UPDATE/DELETE=false; anon SELECT=false; RLS=true; same-tenant visible_rows=1; wrong-tenant visible_rows=0; anon SELECT SQLSTATE=42501
P0B_FIX = expectBlocked accepts one documented error from an allowed set; live gate includes authenticated Passport SELECT assertions
COHORT_PROOF = 42 candidates; 42 unique source hashes; 4 tenants; 32 PDF; 10 XLSX; 42 analyzed; quality 76..100 avg 93.64; 135 rendered outputs; 40 VERIFIED; 40 READY
ACTION_CHAIN_PROOF = NOT PROVEN; latest verified passport has no linked recommendation/decision/approval/work/outcome
P1A_STATUS = no scan root cause proven; query plans low-cost/index-backed; direct refresh samples FULL/VERIFIED/READY; PR-level cohort concurrency guard added; terminal 40-report proof pending
P1C_STATUS = Phase F STALE_RUNTIME + rollback-forward TypeError remains separate and uncertified
SECURITY_ADVISORY = public.canonical_import_repair_history RLS disabled; direct anon/authenticated table privileges false; no auto-remediation
MIGRATION_PROVENANCE = 20261002165000 migration added to branch; equivalent GRANT applied directly to staging for proof
NEXT_EXACT_ACTION = consume terminal current-head Evidence Passport Live Proof, Full Product Browser E2E, Report Value Cohort, and Final Certification; first new P0/P1 only
DO_NOT_REPEAT = do not reuse old SHA PASS; do not widen Passport mutation privileges; do not weaken RLS; do not accept arbitrary negative-path errors; do not raise statement_timeout blindly

Resume anchor: execution code is a6f19a064003e94c508b8a27bded19933465376c. Metadata commits after it are persistence only.
