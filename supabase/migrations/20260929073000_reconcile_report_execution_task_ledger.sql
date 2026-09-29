-- Keep durable execution tasks aligned with the authoritative checkpoint.
-- Existing completed/rendered jobs can be reconciled without re-importing the source.
CREATE OR REPLACE FUNCTION public.advance_report_execution_checkpoint(
  p_job_id uuid,
  p_company_id uuid,
  p_worker_id text,
  p_lease_token uuid,
  p_checkpoint jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  affected integer;
  old_stage text;
  new_stage text;
  old_hash text;
  new_hash text;
  old_pos integer;
  new_pos integer;
  v_company_id uuid := public.current_company_id();
  v_is_service_role boolean := COALESCE(auth.jwt()->>'role','') = 'service_role';
BEGIN
  IF NOT v_is_service_role AND (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED'; END IF;
  IF p_company_id IS NULL OR p_job_id IS NULL OR p_worker_id IS NULL OR p_lease_token IS NULL THEN RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_INPUT_INVALID'; END IF;
  IF NOT v_is_service_role AND (v_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id) THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF p_checkpoint IS NULL OR jsonb_typeof(p_checkpoint) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_INVALID'; END IF;

  new_stage := p_checkpoint->>'stage';
  new_hash := p_checkpoint->>'sourceHash';
  IF new_stage IS NULL OR new_stage NOT IN ('queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered') THEN RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_STAGE_INVALID'; END IF;
  IF new_hash IS NULL OR btrim(new_hash) = '' THEN RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_SOURCE_HASH_REQUIRED'; END IF;
  IF jsonb_typeof(p_checkpoint->'evidenceKeys') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_EVIDENCE_KEYS_REQUIRED'; END IF;

  SELECT checkpoint->>'stage',checkpoint->>'sourceHash'
    INTO old_stage,old_hash
  FROM public.report_execution_jobs
  WHERE id=p_job_id AND company_id=p_company_id
    AND status IN ('leased','processing')
    AND lease_owner=p_worker_id AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp()
  FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF old_hash IS NOT NULL AND btrim(old_hash)<>'' AND old_hash<>new_hash THEN RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_SOURCE_HASH_CHANGED'; END IF;

  IF old_stage IS NULL THEN
    IF new_stage<>'queued' THEN RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_INITIAL_STAGE_INVALID'; END IF;
  ELSE
    old_pos=array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],old_stage);
    new_pos=array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],new_stage);
    IF old_pos IS NULL OR new_pos<>old_pos+1 THEN RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_TRANSITION_INVALID'; END IF;
  END IF;

  UPDATE public.report_execution_jobs
  SET checkpoint=p_checkpoint,status='processing',updated_at=clock_timestamp()
  WHERE id=p_job_id AND company_id=p_company_id
    AND status IN ('leased','processing')
    AND lease_owner=p_worker_id AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp();
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected <> 1 THEN RETURN false; END IF;

  new_pos := array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],new_stage);
  UPDATE public.report_execution_tasks
  SET status='completed',
      attempt=GREATEST(attempt,1),
      started_at=COALESCE(started_at,clock_timestamp()),
      completed_at=COALESCE(completed_at,clock_timestamp()),
      evidence=coalesce(evidence,'{}'::jsonb) || jsonb_build_object('ledgerStage',stage,'checkpointStage',new_stage,'sourceHash',new_hash,'ledgerUpdatedAt',clock_timestamp()),
      last_error='{}'::jsonb,
      updated_at=clock_timestamp()
  WHERE company_id=p_company_id AND report_execution_job_id=p_job_id AND ordinal <= new_pos;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_report_execution_job(
  p_job_id uuid,
  p_company_id uuid,
  p_worker_id text,
  p_lease_token uuid,
  p_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  affected integer;
  v_company_id uuid := public.current_company_id();
  v_is_service_role boolean := COALESCE(auth.jwt()->>'role','') = 'service_role';
BEGIN
  IF NOT v_is_service_role AND (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED'; END IF;
  IF p_company_id IS NULL OR p_job_id IS NULL OR p_worker_id IS NULL OR p_lease_token IS NULL THEN RAISE EXCEPTION 'REPORT_EXECUTION_COMPLETE_INPUT_INVALID'; END IF;
  IF NOT v_is_service_role AND (v_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id) THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF p_evidence IS NULL OR jsonb_typeof(p_evidence)<>'object' THEN RAISE EXCEPTION 'REPORT_EXECUTION_COMPLETION_EVIDENCE_INVALID'; END IF;

  UPDATE public.report_execution_jobs
  SET status='completed', evidence=coalesce(p_evidence,'{}'::jsonb), completed_at=clock_timestamp(), updated_at=clock_timestamp(),
      lease_owner=null, lease_token=null, lease_expires_at=null
  WHERE id=p_job_id AND company_id=p_company_id
    AND lease_owner=p_worker_id AND lease_token=p_lease_token AND lease_expires_at>clock_timestamp()
    AND status IN ('leased','processing') AND checkpoint->>'stage'='rendered';
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected <> 1 THEN RETURN false; END IF;

  IF (SELECT count(*) FROM public.report_execution_tasks WHERE company_id=p_company_id AND report_execution_job_id=p_job_id) <> 9 THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_TASK_LEDGER_INCOMPLETE';
  END IF;

  UPDATE public.report_execution_tasks
  SET status='completed', attempt=GREATEST(attempt,1), started_at=COALESCE(started_at,clock_timestamp()),
      completed_at=COALESCE(completed_at,clock_timestamp()),
      evidence=coalesce(evidence,'{}'::jsonb) || jsonb_build_object('completionEvidence',coalesce(p_evidence,'{}'::jsonb),'ledgerUpdatedAt',clock_timestamp()),
      last_error='{}'::jsonb, updated_at=clock_timestamp()
  WHERE company_id=p_company_id AND report_execution_job_id=p_job_id;

  IF (SELECT count(*) FROM public.report_execution_tasks WHERE company_id=p_company_id AND report_execution_job_id=p_job_id AND status='completed') <> 9 THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_TASK_LEDGER_COMPLETION_FAILED';
  END IF;
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reconcile_completed_report_execution_task_ledger(
  p_job_id uuid, p_company_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_is_service_role boolean := COALESCE(auth.jwt()->>'role','') = 'service_role';
  v_status text; v_stage text; v_source_hash text; v_task_count integer;
BEGIN
  IF NOT v_is_service_role AND (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED'; END IF;
  IF p_job_id IS NULL OR p_company_id IS NULL THEN RAISE EXCEPTION 'REPORT_EXECUTION_RECONCILIATION_INPUT_INVALID'; END IF;
  IF NOT v_is_service_role AND (v_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id) THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  SELECT status,checkpoint->>'stage',checkpoint->>'sourceHash'
    INTO v_status,v_stage,v_source_hash
  FROM public.report_execution_jobs
  WHERE id=p_job_id AND company_id=p_company_id
  FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF v_status <> 'completed' OR v_stage <> 'rendered' THEN RAISE EXCEPTION 'REPORT_EXECUTION_RECONCILIATION_REQUIRES_COMPLETED_RENDERED_JOB'; END IF;
  IF coalesce(btrim(v_source_hash),'') = '' THEN RAISE EXCEPTION 'REPORT_EXECUTION_RECONCILIATION_SOURCE_HASH_REQUIRED'; END IF;
  SELECT count(*) INTO v_task_count FROM public.report_execution_tasks WHERE company_id=p_company_id AND report_execution_job_id=p_job_id;
  IF v_task_count <> 9 THEN RAISE EXCEPTION 'REPORT_EXECUTION_RECONCILIATION_TASK_COUNT_INVALID'; END IF;
  UPDATE public.report_execution_tasks
  SET status='completed', attempt=GREATEST(attempt,1), started_at=COALESCE(started_at,clock_timestamp()),
      completed_at=COALESCE(completed_at,clock_timestamp()),
      evidence=coalesce(evidence,'{}'::jsonb) || jsonb_build_object('reconciledFromCompletedJob',true,'sourceHash',v_source_hash,'reconciledAt',clock_timestamp()),
      last_error='{}'::jsonb, updated_at=clock_timestamp()
  WHERE company_id=p_company_id AND report_execution_job_id=p_job_id;
  RETURN (SELECT count(*)=9 FROM public.report_execution_tasks WHERE company_id=p_company_id AND report_execution_job_id=p_job_id AND status='completed');
END;
$function$;

REVOKE ALL ON FUNCTION public.reconcile_completed_report_execution_task_ledger(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reconcile_completed_report_execution_task_ledger(uuid,uuid) TO authenticated, service_role;
