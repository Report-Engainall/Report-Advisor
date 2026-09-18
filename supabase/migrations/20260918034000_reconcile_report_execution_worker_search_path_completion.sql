-- Complete the durable-report SECURITY DEFINER search_path reconciliation.
-- Preserve existing grants and caller/worker authorization semantics.

ALTER FUNCTION public.enqueue_report_execution_job(uuid, text, text, text, text[], integer)
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.advance_report_execution_checkpoint(uuid, uuid, text, uuid, jsonb)
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.recover_expired_report_execution_jobs(uuid, integer)
  SET search_path = public, pg_catalog;
