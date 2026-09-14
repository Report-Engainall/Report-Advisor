# Decision Outcome Surface — 2026-09-09

## Scope
The Decision Experience outcome stage now reads persisted `recommendation_outcomes` through `loadPersistedOutcomes()` and exposes the evidence-backed lifecycle:

**Expected → Actual → Delta → Quality → Learning**

## Source of truth
- `src/lib/analytics/outcome-feedback.ts`
- `loadPersistedOutcomes(tenantId)` first resolves the current company and fails closed on tenant mismatch.
- Rows are read from `recommendation_outcomes` and only outcomes carrying an `evidence_snapshot_id` are surfaced.

## Matching rule
The UI never guesses an outcome relationship. It selects an outcome only when:

`outcome.decisionFingerprint === selectedRecommendation.id`

No fuzzy title matching, timestamp inference, local cache fallback, or synthetic outcome is permitted.

## Delta rule
Delta is calculated only when both persisted `expectedValue` and `actualValue` exist:

`actualValue - expectedValue`

If either value is absent, Delta remains unavailable.

## Evidence surface
The UI exposes the persisted evidence snapshot identifier, observed timestamp, quality label, and optional notes. If no exact outcome exists, the UI explicitly states that no verified outcome is linked and does not fabricate Actual, Delta, or Learning.

## Certification boundary
This is repository/UI wiring and source-derived presentation. It does **not** certify authenticated production runtime, live tenant isolation, backup/restore, rollback, or E2E outcome lifecycle. Those remain external operational evidence gates.
