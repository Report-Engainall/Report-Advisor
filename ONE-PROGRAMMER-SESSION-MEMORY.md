# LIVE RESUME — 2026-10-12 / CANONICAL COMMIT-ANCHOR REPAIR

Repository: Report-Engainall/Report-Advisor
Feature branch: fix/source-bound-generic-intelligence-20261009
PR #912: OPEN / NOT MERGED.
Exact application/test checkpoint: d92737993e5a295ff4341d122bcf11c8b774dc19
Documentation staging branch: checkpoint/2026-10-12-ui-governance-9c395ba
PRODUCT_COMPLETE = NO.
DO_NOT_MERGE = true.

CURRENT RESUME POINTER: docs/execution/CURRENT_SESSION_STATE.md — application and regression source head d92737993e5a295ff4341d122bcf11c8b774dc19. This patch fixes the actual canonical-row selection bug seen in the strict real-source matrix; it does not waive evidence eligibility.

NEXT: Validate the canonical commit-anchor regression, promote the fully documented checkpoint to PR #912 once no unrelated long-running head-sensitive tests are left unaccounted for, then read exact-head Build/Quality/Handoff/Phase-F/Full Product Browser E2E/Final Certification and inspect the resulting matrix artifact.

- New source files/logic at d92737993e5a295ff4341d122bcf11c8b774dc19: real-48 source matrix now resolves the canonical import using a persisted canonical_import_commits row for exact company_id + source_hash and an anchored canonical_dataset_records row whose id/company_id/source_hash match. The matrix logs analysisImportJobId and canonicalImportJobId plus commit/anchor identity and how it resolved; field preview and canonical row fetch use the verified canonical import.
- Regression tests now verify a valid same-tenant/same-hash anchor and reject empty/zero-count commits, foreign tenant, wrong hash, wrong record ID, and missing import_job_id. The existing fixture-provenance rules remain strict. No database writes were made.
- Read-only database evidence: report job e4556a03-a683-4a82-9f89-21003f842119 / tenant f68a7e91-3c7e-46fb-97a8-e339bec04e13 / source hash sha256:00e609207bf2af96bc8d03089381d423d73085f23eeb2198f91eb5c5bf58f548. Report/analysis snapshot pointed to import 0c6a6a22-c308-4bef-8ca9-55b29fa3bdf5 with 610 declared rows but 0 valid rows and 0 canonical rows for that import. The same tenant/hash has 610 rows under successful import 88810977-7704-4b1d-b808-384a99c6d91d; canonical_import_commits record 8da99f16-eaaf-407b-8d85-89ad87dbc870 anchors row 49f463c3-ee4c-446b-9412-1699de65ce94 to that successful import. The resolver uses the same tenant/hash/record identity to avoid cross-tenant substitution.
- The last completed E2E matrix on predecessor 9c395ba… showed 12/48 supported and 36 NOT_PROVEN: 30 NO_ELIGIBLE_REAL_SOURCE and six empty canonical samples despite minimum sample requirements. Anchor fix may resolve some empty-import cases only; it cannot create genuine source evidence for missing archetypes.
- On predecessor 717fcf2299f4cc8ef084eb120f3323410ba4cf79: Build 38281581629 PASS; Quality 38281581259 PASS; Handoff 38281581884 PASS; Data Quality Runtime 38281581638 PASS; Final Certification 38281581473 PASS; Phase-F 38281581295 PASS after a controlled retry of registry-rate-limited restore probe. Full Product Browser E2E 38281581401 was still running at last check. None of these proves the new code head d92737993e5a295ff4341d122bcf11c8b774dc19.
- UI contrast fixes remain in the source: generic intelligence/source lineage/findings/recommendation/upload/KPI styling and explicit dark executive hero backgrounds. Latest head still needs screenshot verification.
- PRODUCT_COMPLETE = NO. The inventory report's trusted source and matching persisted rows did not clear AWAITING_EVIDENCE_SNAPSHOT, so no decision-ready claim. Production source SHA remains last known 858ef8e3e5bc5bf74430555eadfb9e6767be348b until re-read.
