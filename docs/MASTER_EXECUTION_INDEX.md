# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-09

> Authoritative execution manifest. This document never promotes historical evidence across an exact-HEAD boundary. Pair every evidence batch with the exact Git `HEAD` of `main` and the exact environment/commit used.

### CURRENT PROJECT STATE
- Current code/test candidate entering this certification sweep: `a0bd55ee4e1da9de7eea503351e98e23ed81707a`.
- This candidate is the exact code/test head of PR #461 (`fix/final-certification-boundary-20260909`) and is the candidate under fresh exact-head CI certification.
- Certification remains fail-closed: no historical evidence, UI shell, simulated session, old SHA, or CI run on another SHA can certify this candidate.

### CURRENT EXACT HEAD
- Current candidate: `a0bd55ee4e1da9de7eea503351e98e23ed81707a`.
- Previous main baseline before this bounded certification repair: `4db373e61e03c030bab1628864c647b2d5bb97f6`.
- Documentation refreshes create a new exact-head boundary and do not promote runtime evidence from a previous SHA.
- Frozen release candidates remain untouched: protected candidate `14cc7cefc0fad622436b4845a0e4b46a8888e8a`, exact RC reference `d846821b8d969aaa384ab85487a0dcf264a65aca`.

### BOUNDARY / GOVERNANCE
- No rebuild from scratch.
- No historical migration rewrite.
- No Production alias mutation or rollback action as part of source reconciliation.
- No Staging data fixture is treated as certification unless an actual lifecycle is observed.
- No HTTP 200, UI shell, simulated session, CI-created run, fixture assertion, simulated JWT, historical deployment, or old SHA can certify the current candidate.
- External operational blockers do not justify idle work on source reconciliation, contract hardening, test design, or evidence preparation.
- Browser E2E must use real Chromium, real Supabase authentication, and browser-held sessions; service-role or mocked sessions are prohibited for certification.
- Certification checkout must retain full Git history (`fetch-depth: 0`) so ancestry and merge-base checks are meaningful.

## DEEP AUDIT — 2026-09-07

### Database / Security baseline
- Critical tenant/RLS/security-definer contract coverage remains governed by the repository's exact-head CI suite.
- Durable worker RPCs are service_role-only; canonical import RPCs remain authenticated and tenant-bound.
- No runtime fixture rows are treated as certification unless an actual lifecycle is observed.

### P0 — AUTHENTICATED E2E / TENANT A-B
- Dedicated Actor A/B authenticated users exist and are mapped one-to-one to Tenant A/B.
- Existing real business runner covers authenticated tenant resolution, customer/product/invoice import, DB read-back, UI read-back, refresh continuity, Tenant B isolation, cross-tenant REST denial, cross-tenant UI denial, and logout.
- Current browser certification remains NOT PROVEN because the current exact-head browser/device run has not produced the required operational evidence.

### P1 — MIGRATION / SCHEMA PARITY
- Fresh disposable replay parity is still required before certification; PR/branch evidence is not equivalent to a fresh replay PASS.

### Worker / Reliability
- Durable worker contract has explicit tenant identity, lease ownership, lease-token fencing, checkpoint monotonicity, retry budget, dead-letter handling, source provenance, and service_role-only execution.
- Worker runtime crash/retry/recovery remains UNPROVEN until an actual disposable lifecycle is executed and evidenced.

### OCR / Document Intelligence
- OCR confidence preservation and failure-closed behavior are covered by repository checks.
- Real Arabic golden-corpus runtime remains NOT PROVEN until an actual document passes through source → OCR → normalization → DB → reconciliation → analytics → evidence/decision → output.

### Import / Reconciliation
- Canonical import remains the supported business mutation path.
- Import runtime with real authenticated tenant data remains NOT PROVEN until current-head E2E evidence records upload/preview/commit/read-back and A/B denial.

### Watched Folder
- Native watched-folder contract exists and is covered by repository checks.
- End-to-end discovery, hash/fingerprint, duplicate handling, tenant binding, processing handoff, terminal state, and retry remain operationally UNPROVEN.

### Decision / Evidence / Outcomes
- Decision mutations use tenant context and user identity checks; anonymous execution is denied.
- Authenticated browser decision/evidence lifecycle remains NOT PROVEN.

### Observability / Failure Injection
- Structured error/evidence contracts exist.
- Actual operator-facing failure/alert path is not certified.

### Performance / Scale
- Source-level performance budgets and bounded batch logic exist.
- Current exact-head environment measurements are not certified.

### Recovery / Backup / Restore / Rollback
- Recovery contracts and evidence-boundary checks exist.
- Actual backup creation, isolated restore, tenant-isolation verification after restore, authenticated smoke, measured RPO/RTO, and rollback drill remain UNPROVEN.

### Remaining-work register
- backup/restore: NOT PROVEN until an actual isolated backup/restore drill is executed and evidenced.
- rollback: NOT PROVEN until an actual rollback drill is executed and evidenced.
- recovery: NOT PROVEN until worker/import recovery lifecycle is executed and evidenced.
- authenticated browser runtime: NOT PROVEN at the current exact head.

### CI / Execution Infrastructure
- Fresh exact-head workflow execution must produce real steps, runner identity, logs, and green checks before CI gates can be called PASS.
- PR #461 is the current bounded certification-repair candidate; exact candidate binding is now `a0bd55ee4e1da9de7eea503351e98e23ed81707a` after a surgical repair to the decision TOCTOU validator and adversarial mutation contract.
- Certification remains fail-closed if any required indicator is red, skipped, missing, or bound to a different SHA.

## ACTIVE EXECUTION FRONTS
- #399 — fresh migration replay and schema parity certification.
- #400 — watched-folder lifecycle and duplicate-ingestion proof.
- #401 — worker crash/retry/dead-letter/recovery drill.
- #402 — observability failure-injection and alert-path proof.
- #403 — production-scale performance evidence refresh.
- #404 — P0 authenticated Tenant A/B adversarial runtime closure; currently browser/device constrained.
- PR #461 — bounded final certification boundary repair; current exact candidate binding is `a0bd55ee4e1da9de7eea503351e98e23ed81707a`.

### LATEST CERTIFICATION SWEEP UPDATE
- Exact-head `58d40250a92fe9b024f6761d119bcc91711e7425` launched 37 workflow runs. 35 completed green, `desktop-windows` was still in progress at observation time, and `Final Certification Gate` failed inside its contract sweep.
- The failure was isolated to `scripts/check-decision-approval-toctou-contract.mjs`. The production lock-order contract passed, the 20-stage release-readiness suite reported `TOTAL=20 PASS=20 FAIL=0`, and the failure occurred in the adversarial `noDecisionLock` assertion: its mutation used a stale canonical relative offset and caused the validator to report the gate-order error instead of the intended missing-lock error.
- This is a test-of-test construction defect, not a production SQL defect. The failing job was `certification-contracts` in Final Certification Gate run `34405820740` on exact HEAD `58d40250...`.
- Surgical correction applied in `b82acf32ca46d63fd76ce59c3bf82f10c27896ad`: the `noDecisionLock` mutation now locates the latest canonical decision SELECT and its following `FOR UPDATE` inside the function body before removing the lock, ensuring the adversarial fixture actually represents a missing decision lock. The `gateBeforeLock` mutation was retained as the separate ordering adversary. No production SQL was changed.
- Fresh exact-head CI on `4455828411f2f41f04a958228cbbabdff6e89182` then exposed a second test-harness issue: after removing the decision lock, the validator could treat the later approval-row `FOR UPDATE` as the decision lock and emit the gate-order failure. The canonical SQL and decision lock-order gate passed.
- Surgical correction applied in `a0bd55ee4e1da9de7eea503351e98e23ed81707a`: the validator now requires the decision lock to occur after the decision SELECT and before the approvability gate, preventing a later approval lock from masquerading as the decision lock. No production SQL was changed.
- The Master Index is now rebound to `a0bd55ee4e1da9de7eea503351e98e23ed81707a`.
- Fresh exact-head CI is mandatory now. No PASS, CI closure, release certification, or LIVE certification is inferred from prior SHAs.
