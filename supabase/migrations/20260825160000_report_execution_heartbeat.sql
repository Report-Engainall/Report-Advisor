-- Phase A runtime closure: renew an active worker lease without mutating checkpoint state.
CREATE OR REPLACE FUNCTION public.heartbeat_report_execution_job(
  p_job_id uuid, p_worker_id text, p_lease_seconds integer DEFAULT 300
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE affected integer;
BEGIN
  UPDATE report_execution_jobs
  SET lease_expires_at=now() + make_interval(secs => greatest(p_lease_seconds,30)),
      updated_at=now()
  WHERE id=p_job_id
    AND company_id=public.current_company_id()
    AND lease_owner=p_worker_id
    AND lease_expires_at > now()
    AND status IN ('leased','processing');
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected=1;
END; $$;

REVOKE ALL ON FUNCTION public.heartbeat_report_execution_job(uuid,text,integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.heartbeat_report_execution_job(uuid,text,integer) TO authenticated;
