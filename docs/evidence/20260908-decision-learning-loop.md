# Report-Advisor — Decision Learning Loop Evidence

Date: 2026-09-08
Branch: `fix/folder-sync-universal-persistence`

## Delivered

- Added tenant-scoped `src/lib/decision-learning.ts` read model over durable `decision_outcomes`.
- Added deterministic aggregation for total/measured/correct/partial/incorrect/unknown outcomes, measured success rate, and average measured impact.
- Integrated the learning summary into `IntelligenceTaskCenterPage` so operational planning can see measured outcomes without inventing new business values.
- Existing outcome write path remains gated by an APPROVED decision, a completed work item, a tenant-owned evidence snapshot, and an authenticated tenant context.
- `source_analysis_snapshots` is already accepted as valid evidence by the Staging outcome/completion routines.

## Staging evidence

The Staging database contains the durable `decision_outcomes` table with tenant ownership and the decision runtime tables. The inspected `record_decision_outcome` routine rejects non-approved decisions, requires a completed tenant-owned work item, validates the evidence snapshot against tenant-owned evidence sources (including `source_analysis_snapshots`), and inserts the outcome with `observed_by`.

## Product loop

`source/report → analysis snapshot → recommendation → task proposal → approved decision → work item → evidence → actual outcome → learning summary`

Learning is observational only in this batch. It does not silently mutate recommendation policy, forecast models, or autonomy thresholds.

## Verification boundary

- Source changes committed to the active PR branch.
- Staging schema/function inspection completed.
- No browser/Preview PASS claimed.
- No Production/E2E/backup/rollback certification claimed.
- Frozen RC and Production aliases were not mutated.
