# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-09

### CURRENT PROJECT STATE
- Current code/test candidate: `4adf574968b05a7b030c724984c11b247b9250f4`.
- Fresh exact-head CI is mandatory; no historical SHA certifies the candidate.

### CI / EXECUTION INFRASTRUCTURE
- Certification remains fail-closed if any required indicator is red, skipped, missing, or bound to a different SHA.
- PR #461 is the bounded final-certification repair candidate.
- Exact-head `a3bfb6e1...` Final Certification Gate failed in `check-decision-approval-toctou-contract.mjs` because the `noDecisionLock` adversarial mutation removed the decision-row lock but the validator could still mistake the later approval-row `FOR UPDATE` for that lock.
- Surgical correction in `4adf5749...` binds the decision lock to the `business_intelligence_decisions` SELECT query itself. No production SQL changed.

### UNPROVEN OPERATIONAL GATES
- authenticated browser runtime
- fresh disposable migration replay/schema parity
- watched-folder lifecycle
- worker crash/retry/recovery
- observability failure injection
- current-head performance evidence
- backup/restore and rollback drills

### CERTIFICATION RULE
- No PASS, CI closure, release certification, or LIVE certification is inferred from prior SHAs.
