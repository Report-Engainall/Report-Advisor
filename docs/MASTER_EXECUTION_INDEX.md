# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-09

### CURRENT PROJECT STATE
- Current code/test candidate: `fc0c270c07199e5fa88618e679882b4c35454a7d`.
- Fresh exact-head CI is mandatory; no historical SHA certifies the candidate.

### CI / EXECUTION INFRASTRUCTURE
- Certification remains fail-closed if any required indicator is red, skipped, missing, or bound to a different SHA.
- PR #461 is the bounded final-certification repair candidate.
- Exact-head `34f630748...` Final Certification Gate and `decision-runtime-authorization` failed because `check-decision-runtime-authorization.mjs` rejected the canonical inline declaration `v_company uuid := public.current_company_id()` and incorrectly classified required authorization guards as forbidden.
- Surgical correction in `fc0c270c...` accepts the canonical typed declaration and treats the authorization guards as required invariants; no production SQL changed.
- All other observed exact-head gates on `34f630748...` were green except the isolated decision runtime authorization failure and still-running jobs at observation time.

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
- The next certification decision must use fresh CI on the exact current HEAD `fc0c270c07199e5fa88618e679882b4c35454a7d`.
