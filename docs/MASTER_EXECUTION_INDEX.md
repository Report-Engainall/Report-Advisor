# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-09

### CURRENT PROJECT STATE
- Current code/test candidate: `1a50e8337b11716b65bbf450bf78fc6fc7b004b9`.
- Fresh exact-head CI is mandatory; no historical SHA certifies the candidate.

### CI / EXECUTION INFRASTRUCTURE
- Certification remains fail-closed if any required indicator is red, skipped, missing, or bound to a different SHA.
- PR #461 is the bounded final-certification repair candidate.
- Exact-head `e436841c...` Final Certification Gate failed in `check-decision-runtime-authorization.mjs`: the canonical migration declares `v_company` inline in the DECLARE clause, while the test required a separate assignment statement.
- Surgical correction in `1a50e833...` accepts the canonical inline `v_company uuid := public.current_company_id()` declaration. No production SQL changed.
- Exact-head `e436841c...` Quality also failed because the index listed recovery evidence as unproven but did not contain the exact phrase `not proven`; this index now binds that state explicitly.

### UNPROVEN OPERATIONAL GATES
Runtime evidence status: **not proven**.
- authenticated browser runtime
- fresh disposable migration replay/schema parity
- watched-folder lifecycle
- worker crash/retry/recovery
- observability failure injection
- current-head performance evidence
- backup/restore and rollback drills

### CERTIFICATION RULE
- No PASS, CI closure, release certification, or LIVE certification is inferred from prior SHAs.
