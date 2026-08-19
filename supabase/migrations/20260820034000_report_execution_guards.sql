-- Report execution must be tenant-bound and race-safe. Workers should claim jobs atomically.
CREATE OR REPLACE FUNCTION public.queue_report_run(p_report_id uuid, p_schedule_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_company uuid;
  run_id uuid;
BEGIN
  SELECT company_id INTO report_company FROM public.report_definitions WHERE id = p_report_id;
  IF report_company IS NULL OR NOT public.has_company_access(report_company) THEN RAISE EXCEPTION 'report access denied'; END IF;
  IF p_schedule_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.report_schedules s
    WHERE s.id = p_schedule_id AND s.company_id = report_company AND s.report_id = p_report_id AND s.enabled
  ) THEN RAISE EXCEPTION 'schedule access denied'; END IF;
  INSERT INTO public.report_runs(company_id, report_id, schedule_id, status)
  VALUES (report_company, p_report_id, p_schedule_id, 'queued')
  RETURNING id INTO run_id;
  RETURN run_id;
END;
$$;
REVOKE ALL ON FUNCTION public.queue_report_run(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.queue_report_run(uuid,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_report_run(p_worker_id text)
RETURNS SETOF public.report_runs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidate AS (
    SELECT id FROM public.report_runs
    WHERE status = 'queued'
    ORDER BY requested_at
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  UPDATE public.report_runs r
  SET status = 'running', started_at = now()
  FROM candidate c
  WHERE r.id = c.id
  RETURNING r.*;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_report_run(text) FROM PUBLIC;
-- Worker credentials should be granted separately in the deployment environment; do not expose this RPC to browser clients.

COMMENT ON FUNCTION public.queue_report_run(uuid,uuid) IS 'Queues a report only after verifying report/schedule tenant ownership.';
COMMENT ON FUNCTION public.claim_report_run(text) IS 'Atomic SKIP LOCKED claim primitive for a trusted background worker; intentionally not granted to authenticated clients.';
