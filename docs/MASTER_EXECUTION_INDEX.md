# CURRENT EXECUTION BOUNDARY — 2026-09-27 / ACTIVE FUNCTIONAL FRONT

> Exact-head startup boundary. Historical entries below are evidence only and cannot override this block.
> This top block is the only startup boundary. Entries below are historical evidence and MUST NOT override it.

- SESSION-ID: `20260927-EXEC-667`
- CURRENT VERIFIED SHA: `0b4f19fe7de377b57b2df7e70507bc32727568cc`
- CURRENT EXECUTION/CANDIDATE SHA: `8d881052fcc02b7f17eb983d2353ba0739ae0951`
- BRANCH / PR: `exec/20260927-current-main-import-ui-finalize` / #667
- CURRENT REPOSITORY HEAD: `8d881052fcc02b7f17eb983d2353ba0739ae0951`
- CURRENT CODE/TEST CANDIDATE: `8d881052fcc02b7f17eb983d2353ba0739ae0951`
- ACTIVE EXECUTION FRONTS: FUNCTIONAL #667 | EXACT-HEAD PROOF | UI CONTINUITY | GOVERNANCE
- FRONT-ID: `IMPORT-CANONICAL-FULL-SOURCE-AND-POST-IMPORT-UI`
- CURRENT BOUNDARY: Any Source → Security → Fingerprint → Understand all datasets → Normalize/Reconcile → Quality/Trust → Evidence → Canonical Commit → Persistence/Readback → Business Understanding → Signals → Decision/Work → Outcome/Learning → Replay; Benchmark remains INSUFFICIENT_SAMPLE.
- ACTUAL RESULT: tenant-authority and certification harness roots are closed; Phase-F exposed a restore-only missing compatibility resolver, now repaired forward-only before the client_ui_settings parity migration.
- EVIDENCE: exact candidate `24ba3d2531356667bf7969866d792e685f3c1787` adds only the restore-parity compatibility resolver; fresh Phase-F and certification evidence is required on this SHA.
- LAST PROVEN: exact-SHA certification-boundary parser, execution-enforcement contract, enforcement adversarial suite, and certification boundary test-of-test all passed at `9fab59c4ec7a8a299a9d93a5c9c98da69249653e`; later mutations are not covered by that PASS.
- LAST FAILED / FIRST FAILURE CONSUMED: Phase-F live restore failed while applying client_ui_settings parity because `public.current_customer_company_id()` was absent; forward baseline returned HTTP 502/rollback-forward 503. Added a timestamped wrapper delegating to canonical `current_company_id()` before the parity migration.
- OPEN BLOCKERS: live Phase-F exact-head proof and current certification wave are active on `8d881052fcc02b7f17eb983d2353ba0739ae0951`; Vercel Hobby build-rate limit remains external; user device remains offline.
- REMAINING-WORK REGISTER: re-run exact-head Phase-F backup/restore/RPO/RTO/rollback/recovery and final certification on `8d881052fcc02b7f17eb983d2353ba0739ae0951`; if green, reconcile release evidence and merge boundary. No production promotion claimed.
- NEXT EXECUTABLE ACTION: consume the first terminal Phase-F/certification gate on `8d881052fcc02b7f17eb983d2353ba0739ae0951`; repair only the first reproducible current-SHA root.
- CURRENT RESUME POINTER: 8d881052fcc02b7f17eb983d2353ba0739ae0951 → FRONT-ID IMPORT-CANONICAL-FULL-SOURCE-AND-POST-IMPORT-UI → NEXT EXECUTABLE ACTION: consume the first terminal Phase-F/certification gate on `8d881052fcc02b7f17eb983d2353ba0739ae0951`; repair only the first reproducible current-SHA root.
- NEXT INDEPENDENT ACTIONS: if CI remains running, continue safe cleanup/audit only where ownership and deletion lineage are proven; preserve the single canonical import/server/route paths.
- DO NOT REPEAT: stale PASS transfer; stale candidate binding; duplicate importer/RPC/runner/route; client-side authority for server truth; preview-as-production; reopening closed roots without current-SHA evidence.
- RESUME STATUS: ACTIVE / EXACT-HEAD RECONCILED / CERTIFICATION WAVES IN FLIGHT.
- CHECKPOINT RULE: HEAD → ACTION → RESULT → EVIDENCE → BLOCKER → NEXT.

---
# CURRENT EXECUTION BOUNDARY — 2026-09-27 / LIVE CHECKPOINT

> Exact-head evidence only. Code candidate and documentation tail are tracked separately.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `d5be7220b048a3e7bd798a9b2d9fea677b200183`
- CURRENT CODE/TEST CANDIDATE → `c5b193116e16b7ce46fd88d6d6edde268820ef52`
- FUNCTIONAL FRONT → PR #664 / `22bdfb19f234a38640961e3851c3e5eef786cbad`
- GOVERNANCE FRONT → PR #666 / `9aec629f5573830ef5d8d5bbc1e303ce41470ba3`
- PROOF → #664 3 success / 3 in-progress / 39 queued / 0 failure; #666 3 in-progress / 1 pending / 34 queued / 0 failure.
- UI AFTER IMPORT → one canonical path: Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay; Benchmark remains INSUFFICIENT_SAMPLE.
- PHASE-F → fail-closed due restore-target migration dependency on current_customer_company_id() and downstream 503 rollback-forward.
- EXTERNAL → Vercel free-plan rate limit; browser/device/production proof remains not proven.

---