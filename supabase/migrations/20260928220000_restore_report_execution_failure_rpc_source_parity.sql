-- Restore the verified report-execution failure transition source into the repository.
-- This forward-only reconciliation preserves the existing RPC name/signature and
-- authenticated/service-role boundary while restoring the live body observed in Staging.
CREATE OR REPLACE FUNCTION public.fail_report_execution_job(p_job_id uuid, p_company_id uuid, p_worker_id text, p_lease_token uuid, p_error jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
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

REVOKE ALL ON FUNCTION public.fail_report_execution_job(p_job_id uuid, p_company_id uuid, p_worker_id text, p_lease_token uuid, p_error jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(p_job_id uuid, p_company_id uuid, p_worker_id text, p_lease_token uuid, p_error jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(p_job_id uuid, p_company_id uuid, p_worker_id text, p_lease_token uuid, p_error jsonb) TO service_role;
