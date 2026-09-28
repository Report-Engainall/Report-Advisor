-- The report execution failure transition is a worker-only RPC.
-- All other durable report-execution worker RPCs are service_role-only.
-- Keep authenticated users out of this privileged SECURITY DEFINER boundary.

REVOKE ALL ON FUNCTION public.fail_report_execution_job(uuid, uuid, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(uuid, uuid, text, uuid, jsonb) TO service_role;
