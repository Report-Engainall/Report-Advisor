# Import truth audit — 2026-08-29

## Finding
The compatibility `updateImportRecord` boundary previously derived `valid_rows = processed_rows` and forced `invalid_rows = duplicate_rows = 0`. That can fabricate import-quality metrics and therefore cannot be accepted for merchant-facing reporting.

It also previously sent `processed_rows = 0` when only `error_message` was being updated and no progress was supplied, which could regress lifecycle progress.

## Evidence
- `src/lib/queries.ts` on exact head `0c37e6869ec7575c46dae9052a45db5e036ba799` contained both behaviors.
- Production RPC contract is `import_update_job_progress(p_job_id, p_processed_rows, p_valid_rows, p_invalid_rows, p_duplicate_rows, p_status)`.
- Production `import_jobs` stores the authoritative lifecycle counters.

## Decision
Do not infer validation counters from processed rows. Preserve the database's authoritative counters and only change the field the caller actually owns.

## Required fix
The compatibility boundary must read the current job counters for the tenant, preserve `valid_rows`, `invalid_rows`, and `duplicate_rows`, and use the current `processed_rows/progress` when no new progress is supplied. Terminal status must finish directly rather than performing an intermediate fabricated progress update.

## Certification impact
This is a data-truth defect in a reporting surface. It is not safe to mark the import-reporting path fully certified until the fix passes CI and regression verification.
