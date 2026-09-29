-- Allow only the governed completed-result recovery function to satisfy the
-- existing import-completion trigger's internal tenant context without fabricating
-- a browser/JWT identity.
CREATE OR REPLACE FUNCTION private.requeue_report_execution_after_import_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_marker text := current_setting('app.import_finish_job_id', true);
  v_company_id uuid := coalesce(
    public.current_company_id(),
    nullif(current_setting('app.import_finish_company_id', true), '')::uuid
  );
  v_requeue_job_ids uuid[] := '{}';
BEGIN
  IF v_marker IS DISTINCT FROM NEW.id::text THEN
    RAISE EXCEPTION 'IMPORT_REPORT_REQUEUE_INTERNAL_CONTEXT_REQUIRED';
  END IF;
  IF v_company_id IS NULL OR NEW.company_id IS DISTINCT FROM v_company_id THEN
    RAISE EXCEPTION 'IMPORT_REPORT_REQUEUE_TENANT_MISMATCH';
  END IF;
  IF NEW.status <> 'completed' OR OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(array_agg(id), '{}'::uuid[])
    INTO v_requeue_job_ids
  FROM (
    SELECT r.id
    FROM public.report_execution_jobs AS r
    WHERE r.company_id = NEW.company_id
      AND r.status IN ('leased','processing','queued')
      AND r.checkpoint->'evidenceKeys' ? ('import:' || NEW.id::text)
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
        'import_job_id',NEW.id,
        'requeued_at',clock_timestamp()
      ),
      updated_at=clock_timestamp()
  WHERE r.id = ANY(v_requeue_job_ids)
    AND r.company_id = NEW.company_id;

  UPDATE public.report_execution_tasks AS t
  SET status='queued',
      worker_id=null,
      started_at=null,
      completed_at=null,
      last_error=coalesce(t.last_error,'{}'::jsonb) || jsonb_build_object(
        'code','IMPORT_COMPLETION_REPORT_REQUEUE',
        'import_job_id',NEW.id,
        'requeued_at',clock_timestamp()
      ),
      updated_at=clock_timestamp()
  WHERE t.report_execution_job_id = ANY(v_requeue_job_ids)
    AND t.company_id = NEW.company_id
    AND t.status='running';

  RETURN NEW;
END;
$function$;

-- Re-define the recovery function with the same canonical checks, plus the internal
-- context consumed by the completion trigger.
CREATE OR REPLACE FUNCTION public.recover_completed_report_execution_result(
  p_company_id uuid,
  p_import_job_id uuid,
  p_report_execution_job_id uuid,
  p_entity_type text,
  p_source_hash text,
  p_row_count integer,
  p_rendered_output jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
SET statement_timeout TO '30s'
AS $function$
DECLARE
  v_job public.report_execution_jobs%rowtype;
  v_import public.import_jobs%rowtype;
  v_commit public.canonical_import_commits%rowtype;
  v_canonical_count integer;
  v_result_summary jsonb;
  v_evidence jsonb;
BEGIN
  IF p_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_import_job_id IS NULL OR p_report_execution_job_id IS NULL THEN RAISE EXCEPTION 'RECOVERY_JOB_ID_REQUIRED'; END IF;
  IF p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' THEN RAISE EXCEPTION 'RECOVERY_SOURCE_HASH_INVALID'; END IF;
  IF p_row_count < 1 THEN RAISE EXCEPTION 'RECOVERY_ROW_COUNT_INVALID'; END IF;
  IF jsonb_typeof(p_rendered_output) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'RECOVERY_RENDERED_OUTPUT_INVALID'; END IF;

  SELECT * INTO v_job
  FROM public.report_execution_jobs
  WHERE id = p_report_execution_job_id AND company_id = p_company_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'RECOVERY_REPORT_EXECUTION_JOB_NOT_FOUND'; END IF;
  IF v_job.status <> 'completed' THEN RAISE EXCEPTION 'RECOVERY_REPORT_EXECUTION_JOB_NOT_COMPLETED'; END IF;
  IF coalesce(v_job.source_hash,'') <> p_source_hash THEN RAISE EXCEPTION 'RECOVERY_SOURCE_HASH_MISMATCH'; END IF;
  IF coalesce(v_job.checkpoint->>'stage','') <> 'rendered' THEN RAISE EXCEPTION 'RECOVERY_REPORT_EXECUTION_STAGE_NOT_RENDERED'; END IF;

  SELECT * INTO v_import
  FROM public.import_jobs
  WHERE id = p_import_job_id AND company_id = p_company_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'RECOVERY_IMPORT_JOB_NOT_FOUND'; END IF;
  IF v_import.file_record_id IS NULL THEN RAISE EXCEPTION 'RECOVERY_IMPORT_SOURCE_RECORD_MISSING'; END IF;

  SELECT * INTO v_commit
  FROM public.canonical_import_commits c
  WHERE c.company_id = p_company_id
    AND c.entity_type = p_entity_type
    AND c.source_hash = p_source_hash
  ORDER BY c.committed_at DESC
  LIMIT 1
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'RECOVERY_CANONICAL_COMMIT_NOT_FOUND'; END IF;
  IF v_commit.committed_count <> p_row_count THEN RAISE EXCEPTION 'RECOVERY_CANONICAL_COMMIT_COUNT_MISMATCH'; END IF;

  SELECT count(*)::integer INTO v_canonical_count
  FROM public.canonical_dataset_records r
  WHERE r.company_id = p_company_id
    AND r.source_hash = p_source_hash
    AND r.semantic_domain = CASE WHEN p_entity_type LIKE 'generic:%' THEN substr(p_entity_type, 9) ELSE p_entity_type END;
  IF v_canonical_count <> p_row_count THEN RAISE EXCEPTION 'RECOVERY_CANONICAL_DATASET_COUNT_MISMATCH'; END IF;

  v_evidence := coalesce(v_job.evidence, '{}'::jsonb)
    || jsonb_build_object(
      'renderedOutput', p_rendered_output,
      'sourceHash', p_source_hash,
      'sourceRowCount', p_row_count,
      'authoritativeCurrentRowCount', p_row_count,
      'recoveredFromCompletedDurableJob', true,
      'recoveryContract', 'recover_completed_report_execution_result:v1'
    );

  UPDATE public.report_execution_jobs
  SET evidence = v_evidence
  WHERE id = p_report_execution_job_id AND company_id = p_company_id;

  UPDATE public.report_execution_tasks
  SET evidence = coalesce(evidence, '{}'::jsonb) || jsonb_build_object(
    'renderedOutput', p_rendered_output,
    'recoveredFromCompletedDurableJob', true,
    'recoveryContract', 'recover_completed_report_execution_result:v1'
  )
  WHERE report_execution_job_id = p_report_execution_job_id
    AND company_id = p_company_id
    AND stage = 'rendered'
    AND status = 'completed';

  v_result_summary := coalesce(v_import.result_summary, '{}'::jsonb)
    || jsonb_build_object(
      'execution_job_id', p_report_execution_job_id,
      'rendered_output', p_rendered_output,
      'committed', p_row_count,
      'rendered_rows', p_row_count,
      'report_execution_status', 'completed',
      'recovered_from_completed_durable_job', true
    );

  PERFORM set_config('app.import_finish_job_id', p_import_job_id::text, true);
  PERFORM set_config('app.import_finish_company_id', p_company_id::text, true);

  IF v_import.status IN ('queued','processing') THEN
    UPDATE public.import_jobs
    SET status = 'completed',
        progress = 100,
        processed_rows = p_row_count,
        total_rows = greatest(coalesce(total_rows, p_row_count), p_row_count),
        completed_at = now(),
        duration_ms = CASE WHEN started_at IS NULL THEN duration_ms ELSE extract(epoch from (now() - started_at)) * 1000 END,
        result_summary = v_result_summary,
        error_message = NULL
    WHERE id = p_import_job_id AND company_id = p_company_id;
  ELSIF v_import.status = 'completed' THEN
    UPDATE public.import_jobs
    SET result_summary = v_result_summary
    WHERE id = p_import_job_id AND company_id = p_company_id;
  ELSE
    RAISE EXCEPTION 'RECOVERY_IMPORT_JOB_TERMINAL:%', v_import.status;
  END IF;

  RETURN jsonb_build_object(
    'recovered', true,
    'importJobId', p_import_job_id,
    'reportExecutionJobId', p_report_execution_job_id,
    'sourceHash', p_source_hash,
    'entityType', p_entity_type,
    'rowCount', p_row_count,
    'importStatus', 'completed'
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.recover_completed_report_execution_result(uuid,uuid,uuid,text,text,integer,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recover_completed_report_execution_result(uuid,uuid,uuid,text,text,integer,jsonb) TO service_role;
