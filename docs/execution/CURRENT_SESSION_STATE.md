## LIVE RESUME — 2026-10-12 / CANONICAL SOURCE AND E2E TOOLING REPAIR

CURRENT_EXACT_HEAD = d9020f76bf62a095db16aed6a340831812480567
CODE_CHECKPOINT = d9020f76bf62a095db16aed6a340831812480567
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = CANONICAL_IMPORT_ANCHOR_AND_ISOLATED_NETLIFY_CLI_FIX_COMMITTED; EXACT_HEAD_VALIDATION_REQUIRED
UPDATED_AT = 2026-10-12T17:14:27.901Z
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
CURRENT RESUME POINTER = ONE-PROGRAMMER-SESSION-MEMORY.md → docs/execution/CURRENT_SESSION_STATE.md
NEXT_EXACT_ACTION = Promote the documented source checkpoint to PR #912, then check exact-head Product Build, Quality, Session Handoff, Phase-F, Full Product Browser E2E and Final Certification. Inspect actual matrix output before deciding the next repair.

Source-code changes at d9020f76bf62a095db16aed6a340831812480567:
1. Canonical real-source matrix now resolves import_job_id through the persisted canonical_import_commits row and committed canonical record for the exact tenant+source hash. It verifies anchor ID/company/source_hash and uses that canonical import for both field preview and row reads. Regression tests cover valid, missing and cross-tenant/wrong-hash/wrong-ID cases. Matrix records IDs and resolution path.
2. Full Product Browser E2E installs pinned Netlify CLI in a disposable RUNNER_TEMP prefix and starts that exact binary. This avoids npm re-resolving the whole app dependency graph for test tooling.

Root evidence: report job e4556a03-a683-4a82-9f89-21003f842119, company f68a7e91-3c7e-46fb-97a8-e339bec04e13, hash sha256:00e609207bf2af96bc8d03089381d423d73085f23eeb2198f91eb5c5bf58f548 pointed to import 0c6a6a22-c308-4bef-8ca9-55b29fa3bdf5 (610 processed, zero valid rows and zero canonical rows), while canonical commit 8da99f16-eaaf-407b-8d85-89ad87dbc870 anchored a row of the same tenant/hash to successful import 88810977-7704-4b1d-b808-384a99c6d91d with 610 canonical rows. Database access was read-only. The separate browser setup failure on predecessor 717fcf… was npm ETARGET for @typescript-eslint/visitor-keys@8.71.2 from the old in-project Netlify install; new install is isolated.

Predecessor exact-head gates on 717fcf2299f4cc8ef084eb120f3323410ba4cf79: Build 38281581629 PASS, Quality 38281581259 PASS, Handoff 38281581884 PASS, Data Quality 38281581638 PASS, Final Certification 38281581473 PASS, Phase-F 38281581295 PASS following retry. E2E 38281581401 failed before preview startup during Netlify CLI installation. These do not validate d9020f76bf62a095db16aed6a340831812480567.

Earlier real-source matrix: 12/48; 30 missing eligible source, six empty canonical sample candidates. This fix may resolve some source-to-import linkage but cannot fabricate missing real-source coverage. Strict 48/48 gate remains. The prior inventory report had 254/254 canonical rows, quality 98, TRUSTED but AWAITING_EVIDENCE_SNAPSHOT; not decision-ready. New dark hero contrast styling still needs current-head screenshot proof.

Last known production source SHA 858ef8e3e5bc5bf74430555eadfb9e6767be348b is not proven to match this branch. PRODUCT_COMPLETE remains NO.
