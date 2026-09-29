-- Controlled recovery for infrastructure-failed durable report jobs.
-- Recovery is allowed only when the durable lifecycle never advanced past the initial queued stage.
CREATE OR REPLACE FUNCTION public.recover_dead_letter_report_execution_job(
  p_job_id uuid,
  p_company_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_is_service_role boolean := coalesce(auth.jwt()->>'role','') = 'service_role';
  v_stage text;
  v_nonqueued integer;
BEGIN
  IF p_job_id IS NULL OR p_company_id IS NULL THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_RECOVERY_INPUT_INVALID';
  END IF;

  IF NOT v_is_service_role AND (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED';
  END IF;

  IF NOT v_is_service_role AND (v_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id) THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;

  SELECT checkpoint->>'stage'
    INTO v_stage
  FROM public.report_execution_jobs
  WHERE id = p_job_id
    AND company_id = p_company_id
    AND status = 'dead_letter'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF coalesce(v_stage,'') <> 'queued' THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_RECOVERY_STAGE_NOT_INITIAL';
  END IF;

  SELECT count(*)
    INTO v_nonqueued
  FROM public.report_execution_tasks
  WHERE report_execution_job_id = p_job_id
    AND company_id = p_company_id
    AND status <> 'queued';

  IF v_nonqueued > 0 THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_RECOVERY_HAS_PROGRESS';
  END IF;

  UPDATE public.report_execution_jobs
  SET status = 'queued',
      attempt = 0,
      lease_owner = NULL,
      lease_token = NULL,
      lease_expires_at = NULL,
      last_error = jsonb_build_object(
        'recovered_from', 'dead_letter',
        'reason', 'infrastructure_failure_before_first_stage',
        'recovered_at', clock_timestamp()
      ),
      completed_at = NULL,
      updated_at = clock_timestamp()
  WHERE id = p_job_id
    AND company_id = p_company_id
    AND status = 'dead_letter';

  RETURN FOUND;
END;
$function$;

REVOKE ALL ON FUNCTION public.recover_dead_letter_report_execution_job(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recover_dead_letter_report_execution_job(uuid, uuid) TO service_role;