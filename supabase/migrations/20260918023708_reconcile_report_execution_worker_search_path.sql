-- Reconcile the live durable-report worker SECURITY DEFINER search_path without changing
-- caller grants or worker authorization semantics. The worker functions already bind
-- auth.uid(), tenant context, lease owner, and lease token; this migration removes
-- mutable name-resolution risk while preserving those existing runtime contracts.

ALTER FUNCTION public.claim_report_execution_job(uuid, uuid, text, integer)
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.heartbeat_report_execution_job(uuid, uuid, text, uuid, integer)
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.complete_report_execution_job(uuid, uuid, text, uuid, jsonb)
  SET search_path = public, pg_catalog;
