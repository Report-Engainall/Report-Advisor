# Source-Grounded Operational Tasks — 2026-09-08

## New execution slice
The daily task engine now consumes durable `source_analysis_snapshots` in addition to recommendations, alerts, and forecasts.

### Grounding rules
- Low source quality (<60%) creates a manager review task with the snapshot ID and source SHA-256 as evidence.
- An analyzed source with rows but no specialized completion creates a next-day manager review task instead of disappearing or being forced into a canonical entity.
- Other warning-bearing sources can create an employee follow-up task.
- Source-derived tasks use `sourceType=kpi` with `sourceId=source_analysis_snapshots.id`; the durable proposal store therefore preserves the source reference.
- Evidence requirements explicitly include the source-analysis snapshot and its SHA-256 fingerprint.

## Product effect
The operating loop is now more directly grounded in the actual imported source:

`source → source analysis snapshot → role task proposal → durable plan → approved decision → work item → evidence → outcome`

This avoids generating an action from an untraceable UI-only interpretation.

## Verification boundary
The task engine change and lifecycle guard are repository-level verified artifacts. Staging remains the authoritative environment for database verification. This does not certify authenticated browser E2E, Production Runtime, Backup/Restore, Rollback, or final release readiness.
