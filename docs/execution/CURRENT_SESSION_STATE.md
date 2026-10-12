## LIVE RESUME — 2026-10-12 / CANONICAL COMMIT-ANCHOR REPAIR

CURRENT_EXACT_HEAD = d92737993e5a295ff4341d122bcf11c8b774dc19
CODE_CHECKPOINT = d92737993e5a295ff4341d122bcf11c8b774dc19
BRANCH = fix/source-bound-generic-intelligence-20261009
PR = https://github.com/Report-Engainall/Report-Advisor/pull/912
ACTION_STATUS = CANONICAL_IMPORT_ANCHOR_FIX_AND_REGRESSIONS_COMMITTED; EXACT_HEAD_CI_PENDING
UPDATED_AT = 2026-10-12T17:12:03.445Z
PRODUCT_COMPLETE = NO
DO_NOT_MERGE = true
CURRENT RESUME POINTER = ONE-PROGRAMMER-SESSION-MEMORY.md → docs/execution/CURRENT_SESSION_STATE.md
NEXT_EXACT_ACTION = Verify new anchor-resolution regressions, then promote this documented checkpoint and inspect Build, Quality, Handoff, Phase-F, Full Product Browser E2E and Final Certification on the new head.

The code fix at d92737993e5a295ff4341d122bcf11c8b774dc19 adds an evidence-backed canonical import resolver to scripts/real-48-source-matrix-preflight.mjs. It reads commit rows filtered by exact company_id + source_hash, follows one of their committed canonical record IDs, verifies that anchor record ID, company, and hash match, and uses its import_job_id for canonical field preview and row retrieval. Matrix output contains analysisImportJobId, canonicalImportJobId, canonicalImportResolution, commit ID and anchor row ID. A source-analysis import with 0 valid rows can no longer conceal the actual committed rows for the same exact tenant and source hash when a canonical commit anchor exists.

Read-only database proof: report job e4556a03-a683-4a82-9f89-21003f842119 / company f68a7e91-3c7e-46fb-97a8-e339bec04e13 / hash sha256:00e609207bf2af96bc8d03089381d423d73085f23eeb2198f91eb5c5bf58f548 pointed to import 0c6a6a22-c308-4bef-8ca9-55b29fa3bdf5 with declared 610 but 0 valid and 0 canonical rows. Actual 610 canonical rows are attached to import 88810977-7704-4b1d-b808-384a99c6d91d. Commit 8da99f16-eaaf-407b-8d85-89ad87dbc870 (610 committed rows) anchors record 49f463c3-ee4c-446b-9412-1699de65ce94 to the latter import. All reads were SELECT-only; production records were not changed.

The resolver has pure regression coverage for a valid anchor and rejections for zero-count/no-ID, foreign tenant, wrong hash, wrong anchor ID and missing import job. Test-fixture source exclusion and minimum sample size remain unchanged. Previous 12/48 matrix coverage was partly distorted by the import-ID mismatch, but 30 archetypes also lacked any eligible real source. Fresh matrix output must prove actual change; do not infer a new score.

On predecessor head 717fcf2299f4cc8ef084eb120f3323410ba4cf79: Build 38281581629 PASS, Quality 38281581259 PASS, Handoff 38281581884 PASS, Data Quality 38281581638 PASS, Final Certification 38281581473 PASS and Phase-F 38281581295 PASS after retry. These results do not certify d92737993e5a295ff4341d122bcf11c8b774dc19. Full Product Browser E2E 38281581401 was still in progress when last read and must be checked before promotion if still useful; the fresh exact-head matrix remains required.

Latest UI source includes explicit dark executive report hero contrast and ink/indigo/brass styling across generic analysis/source evidence/signals/recommendations/upload/KPI. New screenshot verification remains pending. An inventory report previously had 254 canonical rows with TRUSTED status but evidence state AWAITING_EVIDENCE_SNAPSHOT; don't call it decision-ready.

Do not merge or claim PRODUCT_COMPLETE. The last recorded production SHA was 858ef8e3e5bc5bf74430555eadfb9e6767be348b; production parity remains NOT PROVEN.
