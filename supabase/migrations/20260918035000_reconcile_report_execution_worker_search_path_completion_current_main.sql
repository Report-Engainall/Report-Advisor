-- Forward-only current-main reconciliation for report execution SECURITY DEFINER workers.
-- This records the safe search_path state already verified in the live staging runtime.
-- It does not recreate missing historical migration history.

ALTER FUNCTION public.enqueue_report_execution_job(uuid, text, text, text, text[], integer)
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.advance_report_execution_checkpoint(uuid, uuid, text, uuid, jsonb)
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.recover_expired_report_execution_jobs(uuid, integer)
  SET search_path = public, pg_catalog;
