-- Final worker-only privilege boundary for the report execution failure transition.
-- This migration intentionally follows the source-parity restoration migration so
-- later historical grants cannot re-expose the privileged worker RPC.

REVOKE ALL ON FUNCTION public.fail_report_execution_job(uuid, uuid, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(uuid, uuid, text, uuid, jsonb) TO service_role;
