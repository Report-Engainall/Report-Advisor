-- Persist source fingerprint as part of terminal import provenance.
-- Backfill only when a result_summary source hash has a complete canonical
-- source set with the exact expected row count. This is evidence-bound data
-- reconciliation; it never changes import status.

UPDATE public.import_jobs AS i
SET source_fingerprint = (i.result_summary->>'source_hash')
WHERE i.source_fingerprint IS NULL
  AND (i.result_summary->>'source_hash') LIKE 'sha256:%'
  AND i.total_rows IS NOT NULL
  AND (
    SELECT count(*)
    FROM public.canonical_dataset_records AS c
    WHERE c.company_id = i.company_id
      AND c.source_hash = (i.result_summary->>'source_hash')
  ) = i.total_rows;

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
  v_source_hash text := nullif(trim(v_summary->>'source_hash'), '');
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

  IF p_status='completed' THEN
    PERFORM set_config('app.import_finish_job_id', p_job_id::text, true);
  END IF;

  UPDATE public.import_jobs
  SET status=p_status,
      processed_rows=CASE WHEN p_status='completed' AND v_committed IS NOT NULL THEN v_total ELSE processed_rows END,
      valid_rows=CASE WHEN p_status='completed' AND v_valid IS NOT NULL THEN v_valid ELSE valid_rows END,
      invalid_rows=CASE WHEN p_status='completed' AND v_invalid IS NOT NULL THEN v_invalid ELSE invalid_rows END,
      progress=CASE WHEN p_status='completed' THEN 100 ELSE progress END,
      source_fingerprint=coalesce(source_fingerprint, v_source_hash),
      completed_at=now(),
      duration_ms=CASE WHEN started_at IS NULL THEN duration_ms ELSE extract(epoch from(now()-started_at))*1000 END,
      result_summary=v_summary,
      error_message=p_error_message
  WHERE id=p_job_id AND company_id=v_company_id AND status IN ('queued','processing');

  IF NOT FOUND THEN RAISE EXCEPTION 'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN'; END IF;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.import_finish_job(uuid, text, jsonb, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.import_finish_job(uuid, text, jsonb, text) FROM anon;