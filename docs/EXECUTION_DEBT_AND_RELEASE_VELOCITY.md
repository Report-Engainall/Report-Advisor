# Execution Debt & Release Velocity — 2026-09-02

## Purpose
This is the live supplemental accounting contract for the autonomous execution protocol. The master execution index remains the authoritative ledger; this file prevents execution debt and release velocity from being silently omitted while the index is awaiting its next safe full-content refresh.

## EXECUTION DEBT

### Current debt
- `INDEX-CURRENT-HEAD-REFRESH`: actionable documentation debt. `docs/MASTER_EXECUTION_INDEX.md` still records an older current-head narrative and must be refreshed without deleting historical ledger content.
- `CI-REVALIDATION`: current exact-head Quality is still running; no PASS is promoted until it completes on the current exact SHA.

### Explicitly not debt
- Production runtime, authenticated E2E, live tenant A/B, real Backup/Restore/RPO/RTO, staging Rollback/Forward Recovery, and DR are externally blocked capabilities; their local preparation is executable and has been maintained in E1–E8.
- Historical CI PASS, runtime evidence, or certification evidence from an older SHA is not considered usable work; it is intentionally excluded by the exact-SHA rule.

## RELEASE VELOCITY

Velocity is measured only by capability/evidence closure movement across:

`Built → Integrated → Verified → Runtime Proven → Production Certified`

This enforcement cycle produced real closure in the enforcement/certification layer:
- behavioral enforcement matrix added for CASE A–H;
- execution-debt zero-gate added;
- release-velocity truth metric added;
- enforcement checker strengthened against whitespace/case variation, renamed rules, comment-only decoys, weakening clauses, missing behavioral cases, and fake TRUE STOP;
- adversarial test-of-test suite wired into CI;
- current exact-head Final Execution Batch passed all 30 deterministic gates.

No commit count, line count, documentation volume, or report count is treated as release velocity.

## TRUE STOP IMPACT

`EXECUTION DEBT = 0` is required before TRUE STOP for locally executable debt. Therefore TRUE STOP is **NOT PERMITTED** while the current-head index refresh or any other local actionable debt remains.
