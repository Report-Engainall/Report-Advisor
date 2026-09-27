# CURRENT EXECUTION BOUNDARY — 2026-09-27 / ACTIVE FUNCTIONAL FRONT

> Exact-head startup boundary. Historical entries below are evidence only and cannot override this block.
> This top block is the only startup boundary. Entries below are historical evidence and MUST NOT override it.

- SESSION-ID: `20260927-EXEC-667`
- CURRENT VERIFIED SHA: `0b4f19fe7de377b57b2df7e70507bc32727568cc`
- CURRENT EXECUTION/CANDIDATE SHA: `b32abdd4b04d45aa251b4cd62d1c907b81c529ea`
- BRANCH / PR: `exec/20260927-current-main-import-ui-finalize` / #667
- CURRENT REPOSITORY HEAD: `b32abdd4b04d45aa251b4cd62d1c907b81c529ea`
- CURRENT CODE/TEST CANDIDATE: `b32abdd4b04d45aa251b4cd62d1c907b81c529ea`
- ACTIVE EXECUTION FRONTS: FUNCTIONAL #667 | EXACT-HEAD PROOF | UI CONTINUITY | GOVERNANCE | SAFE CLEANUP
- FRONT-ID: `IMPORT-CANONICAL-FULL-SOURCE-AND-POST-IMPORT-UI`
- CURRENT BOUNDARY: Any Source → Security → Fingerprint → Understand all datasets → Normalize/Reconcile → Quality/Trust → Evidence → Canonical Commit → Persistence/Readback → Business Understanding → Signals → Decision/Work → Outcome/Learning → Replay; Benchmark remains INSUFFICIENT_SAMPLE.
- ACTUAL RESULT: canonical import is the single entry; post-upload UI covers the full lifecycle and carries import identity into Trust/Evidence, Data Quality, Decision/Work, Outcome/Learning and Replay. Evidence Passport is fail-closed unless the authoritative source snapshot is analyzed. A restore-only tenant resolver and a new customer-credit restore-parity migration now close the observed Phase-F schema gaps.
- EVIDENCE: Netlify preview for `b32abdd4b04d45aa251b4cd62d1c907b81c529ea` is successful; public route fetch returns the Arabic الأغبري shell and authentication gate. Phase-F exact prior proof at `8d881052fcc02b7f17eb983d2353ba0739ae0951` observed `public.customer_credit_accounts` missing during restore; staging schema introspection has been matched exactly by migration `20260927182000_restore_customer_credit_accounts_schema_parity.sql`. Fresh terminal CI/Phase-F proof for `b32abdd4b04d45aa251b4cd62d1c907b81c529ea` is NOT YET PROVEN.
- LAST PROVEN: historical PASS records remain bound to their original SHAs. The current candidate has no transferred PASS.
- LAST FAILED / FIRST FAILURE CONSUMED: Phase-F restore failed on a missing `customer_credit_accounts` relation; the prior diagnostics race was separately repaired by validating the PR merge ref's second parent against `pull_request.head.sha`. Vercel deployment remains blocked by the Hobby build-rate limit and is external to repository code.
- OPEN BLOCKERS: exact-head quality/certification/Phase-F waves on `b32abdd4b04d45aa251b4cd62d1c907b81c529ea`; Vercel Hobby build-rate limit; local device/browser-dependent verification remains unavailable. Device-independent Windows build is currently progressing on GitHub-hosted Windows.
- REMAINING-WORK REGISTER: consume the first terminal current-SHA gate; repair only the first reproducible root; then reconcile release evidence and merge boundary. Keep safe duplicate/dead-file audit active without deleting any file lacking canonical-owner proof.
- NEXT EXECUTABLE ACTION: consume first terminal quality / Phase-F / certification result on `b32abdd4b04d45aa251b4cd62d1c907b81c529ea`; if failure, repair only that root.
- CURRENT RESUME POINTER: `b32abdd4b04d45aa251b4cd62d1c907b81c529ea` → `IMPORT-CANONICAL-FULL-SOURCE-AND-POST-IMPORT-UI` → consume first terminal exact-head gate.
- NEXT INDEPENDENT ACTIONS: current CI artifact/evidence consumption; staging read-only parity checks; safe duplicate/dead-file audit; no production mutation.
- DO NOT REPEAT: stale PASS transfer; stale candidate binding; duplicate importer/RPC/runner/route; client authority for server truth; preview-as-production; reopening closed roots without current-SHA evidence.
- RESUME STATUS: ACTIVE / EXACT-HEAD RECONCILED / RESTORE PARITY + UI TRUTH GUARDS CLOSED IN CODE / CERTIFICATION WAVES IN FLIGHT.
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