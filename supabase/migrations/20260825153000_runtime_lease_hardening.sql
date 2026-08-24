-- Runtime lease hardening: failure/dead-letter transitions must also reject expired worker leases.
CREATE OR REPLACE FUNCTION public.fail_report_execution_job(
  p_job_id uuid, p_worker_id text, p_error jsonb
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE affected integer;
BEGIN
  UPDATE report_execution_jobs
  SET status=CASE WHEN attempt >= max_attempts THEN 'dead_letter' ELSE 'failed' END,
      last_error=COALESCE(p_error,'{}'::jsonb), updated_at=now(), lease_owner=null, lease_expires_at=null
  WHERE id=p_job_id
    AND company_id=public.current_company_id()
    AND lease_owner=p_worker_id
    AND lease_expires_at > now()
    AND status IN ('leased','processing');
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected=1;
END; $$;

REVOKE ALL ON FUNCTION public.fail_report_execution_job(uuid,text,jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(uuid,text,jsonb) TO authenticated;
