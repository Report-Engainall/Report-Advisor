# Import Finish Lifecycle — 2026-09-08

## Verified

- Staging exposes `public.import_finish_job(uuid,text,jsonb,text)`.
- The repository contract requires `SECURITY INVOKER`, tenant authority through `public.current_company_id()`, a closed terminal status set, terminal-state protection, and authenticated-only execution.
- Staging currently has **0 processing import jobs** and no oldest processing timestamp.
- No `pg_cron`/`pg_net` extension was required for this verification.

## Existing enforcement

The canonical lifecycle migration `20260830210000_harden_import_finish_lifecycle.sql` prevents arbitrary terminal states, prevents finalizing an already-terminal job, scopes the job to the caller tenant, and permits transitions only from `queued`/`processing`.

## Remaining integration boundary

The import page currently catches commit errors and returns to preview. The database terminal lifecycle is hardened, but the page-level failure path should explicitly call `updateImportRecord(..., { status: 'failed', error_message })` after a job has been created. This remains an integration task; it is not claimed closed by this evidence.

## Non-claims

This does not certify authenticated browser E2E, Tenant A/B adversarial isolation, Production runtime, backup/restore, or rollback.
