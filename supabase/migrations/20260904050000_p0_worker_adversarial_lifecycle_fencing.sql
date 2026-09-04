-- P0 worker adversarial hardening: generation fencing, terminal-state integrity,
-- checkpoint monotonicity, retry bounds, and canonical worker RPC signatures.

ALTER TABLE public.report_execution_jobs
  ADD COLUMN IF NOT EXISTS lease_token uuid;

UPDATE public.report_execution_jobs
SET lease_token = gen_random_uuid()
WHERE status IN ('leased', 'processing')
  AND lease_token IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.report_execution_jobs'::regclass AND conname = 'report_execution_jobs_attempt_bounds') THEN
    ALTER TABLE public.report_execution_jobs ADD CONSTRAINT report_execution_jobs_attempt_bounds CHECK (attempt >= 0 AND max_attempts >= 1 AND attempt <= max_attempts);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.report_execution_jobs'::regclass AND conname = 'report_execution_jobs_status_values') THEN
    ALTER TABLE public.report_execution_jobs ADD CONSTRAINT report_execution_jobs_status_values CHECK (status IN ('queued','leased','processing','completed','failed','dead_letter','cancelled'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.report_execution_jobs'::regclass AND conname = 'report_execution_jobs_lease_token_integrity') THEN
    ALTER TABLE public.report_execution_jobs ADD CONSTRAINT report_execution_jobs_lease_token_integrity CHECK ((status IN ('leased','processing') AND lease_token IS NOT NULL AND lease_owner IS NOT NULL AND lease_expires_at IS NOT NULL) OR status NOT IN ('leased','processing'));
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.heartbeat_report_execution_job(uuid,text,integer);
DROP FUNCTION IF EXISTS public.advance_report_execution_checkpoint(uuid,text,jsonb);
DROP FUNCTION IF EXISTS public.complete_report_execution_job(uuid,text,jsonb);
DROP FUNCTION IF EXISTS public.fail_report_execution_job(uuid,text,jsonb);

CREATE OR REPLACE FUNCTION public.claim_report_execution_job(p_job_id uuid,p_lease_owner text,p_lease_seconds integer DEFAULT 300) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog
AS $$
DECLARE affected integer;
BEGIN
  IF p_lease_owner IS NULL OR btrim(p_lease_owner)='' THEN RAISE EXCEPTION 'Worker lease owner is required'; END IF;
  IF p_lease_seconds<30 THEN RAISE EXCEPTION 'Worker lease must be at least 30 seconds'; END IF;
  UPDATE public.report_execution_jobs
  SET status='leased', lease_owner=p_lease_owner, lease_token=gen_random_uuid(), lease_expires_at=now()+make_interval(secs=>p_lease_seconds), attempt=attempt+1, updated_at=now()
  WHERE id=p_job_id AND company_id=public.current_company_id() AND status IN ('queued','leased','processing') AND (lease_expires_at IS NULL OR lease_expires_at<=now()) AND attempt<max_attempts;
  GET DIAGNOSTICS affected=ROW_COUNT; RETURN affected=1;
END; $$;

CREATE OR REPLACE FUNCTION public.heartbeat_report_execution_job(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_lease_seconds integer DEFAULT 300) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog
AS $$
DECLARE affected integer;
BEGIN
  IF p_lease_seconds<30 THEN RAISE EXCEPTION 'Worker lease must be at least 30 seconds'; END IF;
  UPDATE public.report_execution_jobs
  SET lease_expires_at=now()+make_interval(secs=>p_lease_seconds),updated_at=now()
  WHERE id=p_job_id AND company_id=public.current_company_id() AND status IN ('leased','processing') AND lease_owner=p_worker_id AND lease_token=p_lease_token AND lease_expires_at IS NOT NULL AND lease_expires_at>now();
  GET DIAGNOSTICS affected=ROW_COUNT; RETURN affected=1;
END; $$;

CREATE OR REPLACE FUNCTION public.advance_report_execution_checkpoint(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_checkpoint jsonb) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog
AS $$
DECLARE affected integer; old_stage text; new_stage text; old_hash text; new_hash text; old_pos integer; new_pos integer;
BEGIN
  IF p_checkpoint IS NULL OR jsonb_typeof(p_checkpoint)<>'object' THEN RAISE EXCEPTION 'Checkpoint must be a JSON object'; END IF;
  new_stage=p_checkpoint->>'stage'; new_hash=p_checkpoint->>'sourceHash';
  IF new_stage IS NULL OR new_stage NOT IN ('queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered') THEN RAISE EXCEPTION 'Checkpoint stage is invalid'; END IF;
  IF new_hash IS NULL OR btrim(new_hash)='' THEN RAISE EXCEPTION 'Checkpoint source hash is required'; END IF;
  IF jsonb_typeof(p_checkpoint->'evidenceKeys')<>'array' THEN RAISE EXCEPTION 'Checkpoint evidenceKeys must be an array'; END IF;
  SELECT checkpoint->>'stage',checkpoint->>'sourceHash' INTO old_stage,old_hash
  FROM public.report_execution_jobs
  WHERE id=p_job_id AND company_id=public.current_company_id() AND status IN ('leased','processing') AND lease_owner=p_worker_id AND lease_token=p_lease_token AND lease_expires_at IS NOT NULL AND lease_expires_at>now()
  FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF old_hash IS NOT NULL AND btrim(old_hash)<>'' AND old_hash<>new_hash THEN RAISE EXCEPTION 'Checkpoint source hash cannot change during a run'; END IF;
  IF old_stage IS NOT NULL THEN
    old_pos=array_position(ARRAY['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],old_stage);
    new_pos=array_position(ARRAY['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],new_stage);
    IF old_pos IS NULL OR new_pos<>old_pos+1 THEN RAISE EXCEPTION 'Invalid checkpoint transition: % -> %',old_stage,new_stage; END IF;
  END IF;
  UPDATE public.report_execution_jobs SET checkpoint=p_checkpoint,status='processing',updated_at=now()
  WHERE id=p_job_id AND company_id=public.current_company_id() AND status IN ('leased','processing') AND lease_owner=p_worker_id AND lease_token=p_lease_token AND lease_expires_at IS NOT NULL AND lease_expires_at>now();
  GET DIAGNOSTICS affected=ROW_COUNT; RETURN affected=1;
END; $$;

CREATE OR REPLACE FUNCTION public.complete_report_execution_job(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_evidence jsonb DEFAULT '{}'::jsonb) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog
AS $$
DECLARE affected integer;
BEGIN
  IF p_evidence IS NULL OR jsonb_typeof(p_evidence)<>'object' THEN RAISE EXCEPTION 'Completion evidence must be a JSON object'; END IF;
  UPDATE public.report_execution_jobs SET status='completed',evidence=p_evidence,lease_owner=null,lease_token=null,lease_expires_at=null,completed_at=now(),updated_at=now()
  WHERE id=p_job_id AND company_id=public.current_company_id() AND status IN ('leased','processing') AND lease_owner=p_worker_id AND lease_token=p_lease_token AND lease_expires_at IS NOT NULL AND lease_expires_at>now() AND checkpoint->>'stage'='rendered';
  GET DIAGNOSTICS affected=ROW_COUNT; RETURN affected=1;
END; $$;

CREATE OR REPLACE FUNCTION public.fail_report_execution_job(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_error jsonb) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog
AS $$
DECLARE affected integer;
BEGIN
  IF p_error IS NULL OR jsonb_typeof(p_error)<>'object' THEN RAISE EXCEPTION 'Failure transition requires a structured error payload'; END IF;
  UPDATE public.report_execution_jobs SET status=CASE WHEN attempt>=max_attempts THEN 'dead_letter' ELSE 'failed' END,last_error=p_error,lease_owner=null,lease_token=null,lease_expires_at=null,completed_at=null,updated_at=now()
  WHERE id=p_job_id AND company_id=public.current_company_id() AND status IN ('leased','processing') AND lease_owner=p_worker_id AND lease_token=p_lease_token AND lease_expires_at IS NOT NULL AND lease_expires_at>now();
  GET DIAGNOSTICS affected=ROW_COUNT; RETURN affected=1;
END; $$;

CREATE OR REPLACE FUNCTION public.retry_report_execution_job(p_job_id uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog
AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.report_execution_jobs SET status='queued',lease_owner=null,lease_token=null,lease_expires_at=null,last_error='{}'::jsonb,completed_at=null,updated_at=now()
  WHERE id=p_job_id AND company_id=public.current_company_id() AND status='failed' AND attempt<max_attempts;
  GET DIAGNOSTICS affected=ROW_COUNT; RETURN affected=1;
END; $$;

REVOKE ALL ON FUNCTION public.claim_report_execution_job(uuid,text,integer) FROM public,anon,authenticated;
REVOKE ALL ON FUNCTION public.heartbeat_report_execution_job(uuid,text,uuid,integer) FROM public,anon,authenticated;
REVOKE ALL ON FUNCTION public.advance_report_execution_checkpoint(uuid,text,uuid,jsonb) FROM public,anon,authenticated;
REVOKE ALL ON FUNCTION public.complete_report_execution_job(uuid,text,uuid,jsonb) FROM public,anon,authenticated;
REVOKE ALL ON FUNCTION public.fail_report_execution_job(uuid,text,uuid,jsonb) FROM public,anon,authenticated;
REVOKE ALL ON FUNCTION public.retry_report_execution_job(uuid) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_report_execution_job(uuid,text,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.heartbeat_report_execution_job(uuid,text,uuid,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.advance_report_execution_checkpoint(uuid,text,uuid,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_report_execution_job(uuid,text,uuid,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(uuid,text,uuid,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.retry_report_execution_job(uuid) TO service_role;
