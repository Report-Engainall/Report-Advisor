-- Secure browser-callable bridge for the existing durable report execution runner.
-- The legacy 3-argument claim RPC remains revoked; these tenant-bound contracts use
-- an authenticated caller, explicit company identity, and a per-lease token.

ALTER TABLE public.report_execution_jobs
  ADD COLUMN IF NOT EXISTS lease_token uuid;

CREATE INDEX IF NOT EXISTS idx_report_execution_jobs_lease_token
  ON public.report_execution_jobs(company_id, lease_token)
  WHERE lease_token IS NOT NULL;

CREATE OR REPLACE FUNCTION public.enqueue_report_execution_job(
  p_company_id uuid,
  p_job_key text,
  p_source_path text,
  p_source_hash text,
  p_evidence_keys text[] DEFAULT '{}'::text[],
  p_max_attempts integer DEFAULT 3
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_job public.report_execution_jobs%rowtype;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED'; END IF;
  IF v_company_id IS NULL OR p_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF p_job_key IS NULL OR btrim(p_job_key) = '' THEN RAISE EXCEPTION 'REPORT_EXECUTION_JOB_KEY_REQUIRED'; END IF;
  IF p_source_path IS NULL OR btrim(p_source_path) = '' THEN RAISE EXCEPTION 'REPORT_EXECUTION_SOURCE_PATH_REQUIRED'; END IF;
  IF p_source_hash IS NULL OR p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' THEN RAISE EXCEPTION 'REPORT_EXECUTION_SOURCE_HASH_INVALID'; END IF;
  IF COALESCE(p_max_attempts, 0) < 1 THEN RAISE EXCEPTION 'REPORT_EXECUTION_MAX_ATTEMPTS_INVALID'; END IF;

  INSERT INTO public.report_execution_jobs(company_id,job_key,source_path,source_hash,status,checkpoint,max_attempts,evidence)
  VALUES (
    v_company_id,p_job_key,p_source_path,p_source_hash,'queued',
    jsonb_build_object('stage','queued','sourceHash',p_source_hash,'updatedAt',floor(extract(epoch from clock_timestamp())*1000)::bigint),
    LEAST(p_max_attempts,20),
    jsonb_build_object('keys',COALESCE(to_jsonb(p_evidence_keys),'[]'::jsonb))
  )
  ON CONFLICT(company_id,job_key) DO NOTHING;

  SELECT * INTO v_job
  FROM public.report_execution_jobs
  WHERE company_id=v_company_id AND job_key=p_job_key
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'REPORT_EXECUTION_JOB_NOT_FOUND'; END IF;
  IF v_job.source_hash IS DISTINCT FROM p_source_hash OR v_job.source_path IS DISTINCT FROM p_source_path THEN
    RAISE EXCEPTION 'REPORT_EXECUTION_JOB_SOURCE_IDENTITY_MISMATCH';
  END IF;

  RETURN jsonb_build_object(
    'id',v_job.id,'company_id',v_job.company_id,'status',v_job.status,
    'checkpoint',v_job.checkpoint,'attempt',v_job.attempt,'max_attempts',v_job.max_attempts,
    'lease_owner',v_job.lease_owner,'lease_token',v_job.lease_token,'lease_expires_at',v_job.lease_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_report_execution_job(
  p_job_id uuid,
  p_company_id uuid,
  p_lease_owner text,
  p_lease_seconds integer DEFAULT 300
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_job public.report_execution_jobs%rowtype;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED'; END IF;
  IF v_company_id IS NULL OR p_company_id IS NULL OR p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF p_job_id IS NULL OR p_lease_owner IS NULL OR btrim(p_lease_owner) = '' THEN RAISE EXCEPTION 'REPORT_EXECUTION_CLAIM_INPUT_INVALID'; END IF;

  UPDATE public.report_execution_jobs
  SET status='leased',lease_owner=p_lease_owner,lease_token=gen_random_uuid(),
      lease_expires_at=clock_timestamp()+make_interval(secs=>greatest(coalesce(p_lease_seconds,300),30)),
      attempt=attempt+1,updated_at=clock_timestamp()
  WHERE id=p_job_id AND company_id=v_company_id
    AND status IN ('queued','leased','processing')
    AND (lease_expires_at IS NULL OR lease_expires_at < clock_timestamp())
    AND attempt < max_attempts;

  IF NOT FOUND THEN RAISE EXCEPTION 'REPORT_EXECUTION_JOB_CLAIM_REJECTED'; END IF;

  SELECT * INTO v_job FROM public.report_execution_jobs WHERE id=p_job_id AND company_id=v_company_id;
  RETURN jsonb_build_object(
    'id',v_job.id,'company_id',v_job.company_id,'status',v_job.status,
    'checkpoint',v_job.checkpoint,'attempt',v_job.attempt,'max_attempts',v_job.max_attempts,
    'lease_owner',v_job.lease_owner,'lease_token',v_job.lease_token,'lease_expires_at',v_job.lease_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.heartbeat_report_execution_job(
  p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_lease_seconds integer DEFAULT 300
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED'; END IF;
  IF public.current_company_id() IS DISTINCT FROM p_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  UPDATE public.report_execution_jobs
  SET status='processing',lease_expires_at=clock_timestamp()+make_interval(secs=>greatest(coalesce(p_lease_seconds,300),30)),updated_at=clock_timestamp()
  WHERE id=p_job_id AND company_id=p_company_id AND lease_owner=p_worker_id AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp() AND status IN ('leased','processing');
  GET DIAGNOSTICS affected=ROW_COUNT;
  RETURN affected=1;
END;
$$;

CREATE OR REPLACE FUNCTION public.advance_report_execution_checkpoint(
  p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_checkpoint jsonb
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED'; END IF;
  IF public.current_company_id() IS DISTINCT FROM p_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF p_checkpoint IS NULL OR jsonb_typeof(p_checkpoint) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'REPORT_EXECUTION_CHECKPOINT_INVALID'; END IF;
  UPDATE public.report_execution_jobs
  SET checkpoint=p_checkpoint,status='processing',updated_at=clock_timestamp()
  WHERE id=p_job_id AND company_id=p_company_id AND lease_owner=p_worker_id AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp() AND status IN ('leased','processing');
  GET DIAGNOSTICS affected=ROW_COUNT;
  RETURN affected=1;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_report_execution_job(
  p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED'; END IF;
  IF public.current_company_id() IS DISTINCT FROM p_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  UPDATE public.report_execution_jobs
  SET status='completed',evidence=coalesce(p_evidence,'{}'::jsonb),completed_at=clock_timestamp(),updated_at=clock_timestamp(),lease_owner=null,lease_token=null,lease_expires_at=null
  WHERE id=p_job_id AND company_id=p_company_id AND lease_owner=p_worker_id AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp() AND status IN ('leased','processing');
  GET DIAGNOSTICS affected=ROW_COUNT;
  RETURN affected=1;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_report_execution_job(
  p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_error jsonb
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED'; END IF;
  IF public.current_company_id() IS DISTINCT FROM p_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  UPDATE public.report_execution_jobs
  SET status=CASE WHEN attempt>=max_attempts THEN 'dead_letter' ELSE 'failed' END,last_error=coalesce(p_error,'{}'::jsonb),updated_at=clock_timestamp(),lease_owner=null,lease_token=null,lease_expires_at=null
  WHERE id=p_job_id AND company_id=p_company_id AND lease_owner=p_worker_id AND lease_token=p_lease_token
    AND lease_expires_at>clock_timestamp() AND status IN ('leased','processing');
  GET DIAGNOSTICS affected=ROW_COUNT;
  RETURN affected=1;
END;
$$;

CREATE OR REPLACE FUNCTION public.retry_report_execution_job(p_job_id uuid,p_company_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED'; END IF;
  IF public.current_company_id() IS DISTINCT FROM p_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  UPDATE public.report_execution_jobs
  SET status='queued',lease_owner=null,lease_token=null,lease_expires_at=null,last_error='{}'::jsonb,updated_at=clock_timestamp()
  WHERE id=p_job_id AND company_id=p_company_id AND status='failed' AND attempt<max_attempts;
  GET DIAGNOSTICS affected=ROW_COUNT;
  RETURN affected=1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enqueue_report_execution_job(uuid,text,text,text,text[],integer) FROM PUBLIC,anon;
REVOKE EXECUTE ON FUNCTION public.claim_report_execution_job(uuid,uuid,text,integer) FROM PUBLIC,anon;
REVOKE EXECUTE ON FUNCTION public.heartbeat_report_execution_job(uuid,uuid,text,uuid,integer) FROM PUBLIC,anon;
REVOKE EXECUTE ON FUNCTION public.advance_report_execution_checkpoint(uuid,uuid,text,uuid,jsonb) FROM PUBLIC,anon;
REVOKE EXECUTE ON FUNCTION public.complete_report_execution_job(uuid,uuid,text,uuid,jsonb) FROM PUBLIC,anon;
REVOKE EXECUTE ON FUNCTION public.fail_report_execution_job(uuid,uuid,text,uuid,jsonb) FROM PUBLIC,anon;
REVOKE EXECUTE ON FUNCTION public.retry_report_execution_job(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.enqueue_report_execution_job(uuid,text,text,text,text[],integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_report_execution_job(uuid,uuid,text,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.heartbeat_report_execution_job(uuid,uuid,text,uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.advance_report_execution_checkpoint(uuid,uuid,text,uuid,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_report_execution_job(uuid,uuid,text,uuid,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(uuid,uuid,text,uuid,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.retry_report_execution_job(uuid,uuid) TO authenticated;
