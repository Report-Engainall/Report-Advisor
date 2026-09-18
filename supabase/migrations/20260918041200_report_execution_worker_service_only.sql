-- Forward-only security boundary for release-critical report execution worker RPCs.
-- Worker lifecycle mutations are server/worker operations. Preserve retry_report_execution_job
-- as an authenticated tenant-scoped operator boundary; it is intentionally excluded here.
--
-- No function body or runtime behavior is rewritten. Only EXECUTE exposure is reconciled.

REVOKE ALL ON FUNCTION public.enqueue_report_execution_job(uuid, text, text, text, text[], integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_report_execution_job(uuid, text, text, text, text[], integer)
  TO service_role;

REVOKE ALL ON FUNCTION public.claim_report_execution_job(uuid, uuid, text, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_report_execution_job(uuid, uuid, text, integer)
  TO service_role;

REVOKE ALL ON FUNCTION public.heartbeat_report_execution_job(uuid, uuid, text, uuid, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.heartbeat_report_execution_job(uuid, uuid, text, uuid, integer)
  TO service_role;

REVOKE ALL ON FUNCTION public.advance_report_execution_checkpoint(uuid, uuid, text, uuid, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.advance_report_execution_checkpoint(uuid, uuid, text, uuid, jsonb)
  TO service_role;

REVOKE ALL ON FUNCTION public.complete_report_execution_job(uuid, uuid, text, uuid, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_report_execution_job(uuid, uuid, text, uuid, jsonb)
  TO service_role;

REVOKE ALL ON FUNCTION public.fail_report_execution_job(uuid, uuid, text, uuid, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(uuid, uuid, text, uuid, jsonb)
  TO service_role;

DO $$
DECLARE
  worker record;
BEGIN
  FOR worker IN
    SELECT *
    FROM (VALUES
      ('public.enqueue_report_execution_job(uuid,text,text,text,text[],integer)'),
      ('public.claim_report_execution_job(uuid,uuid,text,integer)'),
      ('public.heartbeat_report_execution_job(uuid,uuid,text,uuid,integer)'),
      ('public.advance_report_execution_checkpoint(uuid,uuid,text,uuid,jsonb)'),
      ('public.complete_report_execution_job(uuid,uuid,text,uuid,jsonb)'),
      ('public.fail_report_execution_job(uuid,uuid,text,uuid,jsonb)')
    ) AS t(signature)
  LOOP
    IF has_function_privilege('authenticated', worker.signature, 'EXECUTE') THEN
      RAISE EXCEPTION 'REPORT_EXECUTION_WORKER_AUTHENTICATED_EXECUTE_REMAINS: %', worker.signature;
    END IF;
    IF has_function_privilege('anon', worker.signature, 'EXECUTE') THEN
      RAISE EXCEPTION 'REPORT_EXECUTION_WORKER_ANON_EXECUTE_REMAINS: %', worker.signature;
    END IF;
    IF NOT has_function_privilege('service_role', worker.signature, 'EXECUTE') THEN
      RAISE EXCEPTION 'REPORT_EXECUTION_WORKER_SERVICE_ROLE_EXECUTE_MISSING: %', worker.signature;
    END IF;
  END LOOP;
END
$$;
