-- Reconcile durable worker RPC authority with the server-side execution boundary.
-- Worker mutations are internal privileged operations. Authenticated browser code must
-- not hold worker execution authority; the canonical import server boundary uses service_role.
-- Authenticated user calls remain tenant-bound where retained for compatibility, but the
-- worker RPC surface is revoked from anon/authenticated below.

CREATE OR REPLACE FUNCTION public.claim_report_execution_job(
  p_job_id uuid,
  p_company_id uuid,
  p_lease_owner text,
  p_lease_seconds integer DEFAULT 300
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_catalog'
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_is_service_role boolean := COALESCE(auth.jwt()->>'role','') = 'service_role';
  v_job public.report_execution_jobs%rowtype;
BEGIN
  IF NOT v_is_service_role AND (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED';
  END IF;
  IF p_company_id IS NULL OR p_job_id IS NULL OR p_lease_owner IS NULL OR btrim(p_lease_owner) = '' THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_CLAIM_INPUT_INVALID';
  END IF;
  IF NOT v_is_service_role AND (v_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id) THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;

  UPDATE public.report_execution_jobs
  SET status='leased',
      lease_owner=p_lease_owner,
      lease_token=gen_random_uuid(),
      lease_expires_at=clock_timestamp()+make_interval(secs=>greatest(coalesce(p_lease_seconds,300),30)),
      attempt=attempt+1,
      updated_at=clock_timestamp()
  WHERE id=p_job_id
    AND company_id=p_company_id
    AND status IN ('queued','leased','processing')
    AND (lease_expires_at IS NULL OR lease_expires_at < clock_timestamp())
    AND attempt < max_attempts;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_JOB_CLAIM_REJECTED';
  END IF;

  SELECT * INTO v_job
  FROM public.report_execution_jobs
  WHERE id=p_job_id AND company_id=p_company_id;

  RETURN jsonb_build_object(
    'id',v_job.id,'company_id',v_job.company_id,'status',v_job.status,
    'checkpoint',v_job.checkpoint,'attempt',v_job.attempt,'max_attempts',v_job.max_attempts,
    'lease_owner',v_job.lease_owner,'lease_token',v_job.lease_token,'lease_expires_at',v_job.lease_expires_at
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.heartbeat_report_execution_job(
  p_job_id uuid,
  p_company_id uuid,
  p_worker_id text,
  p_lease_token uuid,
  p_lease_seconds integer DEFAULT 300
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_catalog'
AS $function$
DECLARE
  affected integer;
  v_company_id uuid := public.current_company_id();
  v_is_service_role boolean := COALESCE(auth.jwt()->>'role','') = 'service_role';
BEGIN
  IF NOT v_is_service_role AND (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED';
  END IF;
  IF p_company_id IS NULL OR p_job_id IS NULL OR p_worker_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_HEARTBEAT_INPUT_INVALID';
  END IF;
  IF NOT v_is_service_role AND (v_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id) THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;

  UPDATE public.report_execution_jobs
  SET status='processing',
      lease_expires_at=clock_timestamp()+make_interval(secs=>greatest(coalesce(p_lease_seconds,300),30)),
      updated_at=clock_timestamp()
  WHERE id=p_job_id
    AND company_id=p_company_id
    AND lease_owner=p_worker_id
    AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp()
    AND status IN ('leased','processing');

  GET DIAGNOSTICS affected=ROW_COUNT;
  RETURN affected=1;
END;
$function$;

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
SET search_path TO 'public','pg_catalog'
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
  IF NOT v_is_service_role AND (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED';
  END IF;
  IF p_company_id IS NULL OR p_job_id IS NULL OR p_worker_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_INPUT_INVALID';
  END IF;
  IF NOT v_is_service_role AND (v_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id) THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;
  IF p_checkpoint IS NULL OR jsonb_typeof(p_checkpoint) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_INVALID';
  END IF;

  new_stage := p_checkpoint->>'stage';
  new_hash := p_checkpoint->>'sourceHash';

  IF new_stage IS NULL OR new_stage NOT IN ('queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered') THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_STAGE_INVALID';
  END IF;
  IF new_hash IS NULL OR btrim(new_hash) = '' THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_SOURCE_HASH_REQUIRED';
  END IF;
  IF jsonb_typeof(p_checkpoint->'evidenceKeys') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_EVIDENCE_KEYS_REQUIRED';
  END IF;

  SELECT checkpoint->>'stage',checkpoint->>'sourceHash'
  INTO old_stage,old_hash
  FROM public.report_execution_jobs
  WHERE id=p_job_id
    AND company_id=p_company_id
    AND status IN ('leased','processing')
    AND lease_owner=p_worker_id
    AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;
  IF old_hash IS NOT NULL AND btrim(old_hash)<>'' AND old_hash<>new_hash THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_SOURCE_HASH_CHANGED';
  END IF;

  IF old_stage IS NULL THEN
    IF new_stage<>'queued' THEN
      RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_INITIAL_STAGE_INVALID';
    END IF;
  ELSE
    old_pos=array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],old_stage);
    new_pos=array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],new_stage);
    IF old_pos IS NULL OR new_pos<>old_pos+1 THEN
      RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_TRANSITION_INVALID';
    END IF;
  END IF;

  UPDATE public.report_execution_jobs
  SET checkpoint=p_checkpoint,status='processing',updated_at=clock_timestamp()
  WHERE id=p_job_id
    AND company_id=p_company_id
    AND status IN ('leased','processing')
    AND lease_owner=p_worker_id
    AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp();

  GET DIAGNOSTICS affected=ROW_COUNT;
  RETURN affected=1;
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
SET search_path TO 'public','pg_catalog'
AS $function$
DECLARE
  affected integer;
  v_company_id uuid := public.current_company_id();
  v_is_service_role boolean := COALESCE(auth.jwt()->>'role','') = 'service_role';
BEGIN
  IF NOT v_is_service_role AND (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED';
  END IF;
  IF p_company_id IS NULL OR p_job_id IS NULL OR p_worker_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_COMPLETE_INPUT_INVALID';
  END IF;
  IF NOT v_is_service_role AND (v_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id) THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;
  IF p_evidence IS NULL OR jsonb_typeof(p_evidence)<>'object' THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_COMPLETION_EVIDENCE_INVALID';
  END IF;

  UPDATE public.report_execution_jobs
  SET status='completed',
      evidence=coalesce(p_evidence,'{}'::jsonb),
      completed_at=clock_timestamp(),
      updated_at=clock_timestamp(),
      lease_owner=null,
      lease_token=null,
      lease_expires_at=null
  WHERE id=p_job_id
    AND company_id=p_company_id
    AND lease_owner=p_worker_id
    AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp()
    AND status IN ('leased','processing')
    AND checkpoint->>'stage'='rendered';

  GET DIAGNOSTICS affected=ROW_COUNT;
  RETURN affected=1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fail_report_execution_job(
  p_job_id uuid,
  p_company_id uuid,
  p_worker_id text,
  p_lease_token uuid,
  p_error jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_catalog'
AS $function$
DECLARE
  affected integer;
  v_old_status text;
  v_attempt integer;
  v_max_attempts integer;
  v_new_status text;
  v_correlation_id text;
  v_user_id uuid;
  v_company_id uuid := public.current_company_id();
  v_is_service_role boolean := COALESCE(auth.jwt()->>'role','') = 'service_role';
BEGIN
  IF NOT v_is_service_role AND (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED';
  END IF;
  IF p_company_id IS NULL OR p_job_id IS NULL OR p_worker_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_FAILURE_INPUT_INVALID';
  END IF;
  IF NOT v_is_service_role AND (v_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id) THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;
  IF p_error IS NULL OR jsonb_typeof(p_error)<>'object' THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_FAILURE_PAYLOAD_INVALID';
  END IF;

  v_user_id := (SELECT auth.uid());

  SELECT status,attempt,max_attempts
  INTO v_old_status,v_attempt,v_max_attempts
  FROM public.report_execution_jobs
  WHERE id=p_job_id
    AND company_id=p_company_id
    AND lease_owner=p_worker_id
    AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp()
    AND status IN ('leased','processing')
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_new_status := CASE WHEN v_attempt>=v_max_attempts THEN 'dead_letter' ELSE 'failed' END;

  v_correlation_id := COALESCE(
    NULLIF(p_error->>'correlationId',''),
    NULLIF(p_error->>'correlation_id',''),
    p_job_id::text
  );

  UPDATE public.report_execution_jobs
  SET status=v_new_status,
      last_error=COALESCE(p_error,'{}'::jsonb),
      updated_at=clock_timestamp(),
      lease_owner=null,
      lease_token=null,
      lease_expires_at=null
  WHERE id=p_job_id
    AND company_id=p_company_id;

  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>1 THEN
    RETURN false;
  END IF;

  INSERT INTO public.alerts(
    company_id,severity,category,title,description,entity_type,entity_id,metric_value,threshold,is_read
  ) VALUES (
    p_company_id,
    CASE WHEN v_new_status='dead_letter' THEN 'high' ELSE 'warning' END,
    'report_execution',
    CASE
      WHEN v_new_status='dead_letter' THEN 'توقف تنفيذ التقرير وإحالته إلى قائمة الفشل النهائي'
      ELSE 'فشل تنفيذ التقرير'
    END,
    format('Report execution job %s انتهى بالحالة %s. correlationId=%s',p_job_id::text,v_new_status,v_correlation_id),
    'report_execution_job',
    p_job_id,
    v_attempt,
    v_max_attempts,
    false
  );

  INSERT INTO public.audit_logs(
    company_id,action,entity_type,entity_id,old_value,new_value,source,user_label,correlation_id
  ) VALUES (
    p_company_id,
    CASE WHEN v_new_status='dead_letter' THEN 'report_execution_job_dead_letter' ELSE 'report_execution_job_failed' END,
    'report_execution_job',
    p_job_id,
    jsonb_build_object('status',v_old_status,'attempt',v_attempt,'max_attempts',v_max_attempts),
    jsonb_build_object('status',v_new_status,'attempt',v_attempt,'max_attempts',v_max_attempts,'error',COALESCE(p_error,'{}'::jsonb)),
    'report_execution_runtime',
    COALESCE(v_user_id::text,'service_role'),
    v_correlation_id
  );

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.retry_report_execution_job(
  p_job_id uuid,
  p_company_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_catalog'
AS $function$
DECLARE
  affected integer;
  v_company_id uuid := public.current_company_id();
  v_is_service_role boolean := COALESCE(auth.jwt()->>'role','') = 'service_role';
BEGIN
  IF NOT v_is_service_role AND (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED';
  END IF;
  IF p_company_id IS NULL OR p_job_id IS NULL THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_RETRY_INPUT_INVALID';
  END IF;
  IF NOT v_is_service_role AND (v_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id) THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;

  UPDATE public.report_execution_jobs
  SET status='queued',
      lease_owner=null,
      lease_token=null,
      lease_expires_at=null,
      last_error='{}'::jsonb,
      completed_at=null,
      updated_at=clock_timestamp()
  WHERE id=p_job_id
    AND company_id=p_company_id
    AND status='failed'
    AND attempt<max_attempts;

  GET DIAGNOSTICS affected=ROW_COUNT;
  RETURN affected=1;
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_report_execution_job(uuid,uuid,text,integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.heartbeat_report_execution_job(uuid,uuid,text,uuid,integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.advance_report_execution_checkpoint(uuid,uuid,text,uuid,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_report_execution_job(uuid,uuid,text,uuid,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fail_report_execution_job(uuid,uuid,text,uuid,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.retry_report_execution_job(uuid,uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_report_execution_job(uuid,uuid,text,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.heartbeat_report_execution_job(uuid,uuid,text,uuid,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.advance_report_execution_checkpoint(uuid,uuid,text,uuid,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_report_execution_job(uuid,uuid,text,uuid,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(uuid,uuid,text,uuid,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.retry_report_execution_job(uuid,uuid) TO service_role;
