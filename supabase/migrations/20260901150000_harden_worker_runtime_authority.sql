-- Worker runtime authority hardening.
REVOKE EXECUTE ON FUNCTION public.advance_report_execution_checkpoint(uuid,text,jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_report_execution_job(uuid,text,jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.fail_report_execution_job(uuid,text,jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.heartbeat_report_execution_job(uuid,text,integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.retry_report_execution_job(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.advance_report_execution_checkpoint(uuid,text,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_report_execution_job(uuid,text,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(uuid,text,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.heartbeat_report_execution_job(uuid,text,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.retry_report_execution_job(uuid) TO service_role;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.report_execution_jobs FROM authenticated;
