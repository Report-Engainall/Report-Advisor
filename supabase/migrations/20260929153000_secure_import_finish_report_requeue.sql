-- Move report requeue writes behind a private SECURITY DEFINER helper.
-- The public import_finish_job remains SECURITY INVOKER and gains no direct
-- UPDATE privileges on report execution tables.

CREATE OR REPLACE FUNCTION private.requeue_report_execution_after_import_finish(
  p_import_job_id uuid,
  p_company_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_current_company_id uuid := public.current_company_id();
  v_requeue_job_ids uuid[] := '{}';
BEGIN
  IF p_company_id IS NULL OR p_company_id IS DISTINCT FROM v_current_company_id THEN
    RAISE EXCEPTION 'IMPORT_REPORT_REQUEUE_TENANT_MISMATCH';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.import_jobs
    WHERE id = p_import_job_id
      AND company_id = p_company_id
      AND status = 'completed'
  ) THEN
    RAISE EXCEPTION 'IMPORT_REPORT_REQUEUE_REQUIRES_COMPLETED_IMPORT';
  END IF;

  SELECT coalesce(array_agg(id), '{}'::uuid[])
    INTO v_requeue_job_ids
  FROM (
    SELECT r.id
    FROM public.report_execution_jobs AS r
    WHERE r.company_id = p_company_id
      AND r.status IN ('leased','processing','queued')
      AND r.checkpoint->'evidenceKeys' ? ('import:' || p_import_job_id::text)
      AND coalesce(r.checkpoint->>'stage','queued') <> 'rendered'
      AND (r.lease_expires_at IS NULL OR r.lease_expires_at <= clock_timestamp())
    ORDER BY r.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT 100
  ) AS candidates;

  UPDATE public.report_execution_jobs AS r
  SET status='queued',
      lease_owner=null,
      lease_token=null,
      lease_expires_at=null,
      last_error=coalesce(r.last_error,'{}'::jsonb) || jsonb_build_object(
        'code','IMPORT_COMPLETION_REPORT_REQUEUE',
        'import_job_id',p_import_job_id,
        'requeued_at',clock_timestamp()
      ),
      updated_at=clock_timestamp()
  WHERE r.id = ANY(v_requeue_job_ids)
    AND r.company_id = p_company_id;

  UPDATE public.report_execution_tasks AS t
  SET status='queued',
      worker_id=null,
      started_at=null,
      completed_at=null,
      last_error=coalesce(t.last_error,'{}'::jsonb) || jsonb_build_object(
        'code','IMPORT_COMPLETION_REPORT_REQUEUE',
        'import_job_id',p_import_job_id,
        'requeued_at',clock_timestamp()
      ),
      updated_at=clock_timestamp()
  WHERE t.report_execution_job_id = ANY(v_requeue_job_ids)
    AND t.company_id = p_company_id
    AND t.status='running';
END;
$function$;

REVOKE ALL ON FUNCTION private.requeue_report_execution_after_import_finish(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.requeue_report_execution_after_import_finish(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION private.requeue_report_execution_after_import_finish(uuid, uuid) FROM authenticated;

CREATE OR REPLACE FUNCTION public.import_finish_job(
  p_job_id uuid,
  p_status text,
  p_result_summary jsonb DEFAULT '{}'::jsonb,
  p_error_message text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_job_company_id uuid;
  v_current_status text;
  v_total integer;
  v_processed integer;
  v_summary jsonb := coalesce(p_result_summary, '{}'::jsonb);
  v_committed integer;
  v_invalid integer;
  v_valid integer;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_status NOT IN ('completed','partial','failed','cancelled') THEN RAISE EXCEPTION 'IMPORT_TERMINAL_STATUS_REQUIRED'; END IF;

  SELECT company_id, status, total_rows, processed_rows
    INTO v_job_company_id, v_current_status, v_total, v_processed
  FROM public.import_jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND OR v_job_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN'; END IF;
  IF v_current_status IN ('completed','partial','failed','cancelled') THEN RAISE EXCEPTION 'IMPORT_JOB_ALREADY_TERMINAL'; END IF;

  v_committed := CASE WHEN jsonb_typeof(v_summary->'committed')='number' THEN (v_summary->>'committed')::integer ELSE NULL END;
  v_invalid := CASE WHEN jsonb_typeof(v_summary->'invalidRows')='number' THEN (v_summary->>'invalidRows')::integer ELSE NULL END;

  IF p_status='completed' AND v_committed IS NOT NULL AND v_invalid IS NOT NULL THEN
    v_valid := v_committed;
    IF v_committed < 0 OR v_invalid < 0 OR v_committed + v_invalid <> coalesce(v_total,0) THEN
      RAISE EXCEPTION 'IMPORT_COMPLETION_SUMMARY_MISMATCH';
    END IF;
  ELSIF p_status='completed' THEN
    IF coalesce(v_processed,0) <> coalesce(v_total,0) THEN
      RAISE EXCEPTION 'IMPORT_COMPLETION_REQUIRES_ALL_ROWS_PROCESSED';
    END IF;
    v_valid := NULL;
  END IF;

  UPDATE public.import_jobs
  SET status=p_status,
      processed_rows=CASE WHEN p_status='completed' AND v_committed IS NOT NULL THEN v_total ELSE processed_rows END,
      valid_rows=CASE WHEN p_status='completed' AND v_valid IS NOT NULL THEN v_valid ELSE valid_rows END,
      invalid_rows=CASE WHEN p_status='completed' AND v_invalid IS NOT NULL THEN v_invalid ELSE invalid_rows END,
      progress=CASE WHEN p_status='completed' THEN 100 ELSE progress END,
      completed_at=now(),
      duration_ms=CASE WHEN started_at IS NULL THEN duration_ms ELSE extract(epoch from(now()-started_at))*1000 END,
      result_summary=v_summary,
      error_message=p_error_message
  WHERE id=p_job_id AND company_id=v_company_id AND status IN ('queued','processing');

  IF NOT FOUND THEN RAISE EXCEPTION 'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN'; END IF;

  IF p_status='completed' THEN
    PERFORM private.requeue_report_execution_after_import_finish(p_job_id, v_company_id);
  END IF;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.import_finish_job(uuid, text, jsonb, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.import_finish_job(uuid, text, jsonb, text) FROM anon;
