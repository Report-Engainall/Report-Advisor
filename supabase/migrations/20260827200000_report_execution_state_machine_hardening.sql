-- Deep runtime state-machine hardening: make durable checkpoint progression enforce the same
-- invariants that the in-process checkpoint helper already enforces.
CREATE OR REPLACE FUNCTION public.advance_report_execution_checkpoint(
  p_job_id uuid, p_worker_id text, p_checkpoint jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE
  affected integer;
  current_stage text;
  next_stage text;
  job_source_hash text;
  current_checkpoint jsonb;
  current_index integer;
  next_index integer;
BEGIN
  IF p_worker_id IS NULL OR btrim(p_worker_id) = '' THEN
    RAISE EXCEPTION 'Checkpoint persistence requires a non-empty worker lease owner';
  END IF;
  IF p_checkpoint IS NULL OR jsonb_typeof(p_checkpoint) <> 'object' THEN
    RAISE EXCEPTION 'Checkpoint must be a JSON object';
  END IF;
  IF jsonb_typeof(p_checkpoint->'stage') <> 'string' THEN
    RAISE EXCEPTION 'Checkpoint stage is required';
  END IF;
  IF p_checkpoint->>'stage' NOT IN ('queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered') THEN
    RAISE EXCEPTION 'Checkpoint stage is invalid';
  END IF;
  IF jsonb_typeof(p_checkpoint->'sourceHash') <> 'string' OR btrim(p_checkpoint->>'sourceHash') = '' THEN
    RAISE EXCEPTION 'Checkpoint source hash is required';
  END IF;
  IF jsonb_typeof(p_checkpoint->'evidenceKeys') <> 'array'
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(COALESCE(p_checkpoint->'evidenceKeys','[]'::jsonb)) AS item
       WHERE jsonb_typeof(item) <> 'string'
     ) THEN
    RAISE EXCEPTION 'Checkpoint evidence keys must be an array of strings';
  END IF;
  IF p_checkpoint ? 'rowCount'
     AND (
       jsonb_typeof(p_checkpoint->'rowCount') <> 'number'
       OR (p_checkpoint->>'rowCount')::numeric < 0
       OR (p_checkpoint->>'rowCount')::numeric <> trunc((p_checkpoint->>'rowCount')::numeric)
     ) THEN
    RAISE EXCEPTION 'Checkpoint rowCount must be a non-negative integer';
  END IF;

  SELECT
    COALESCE(NULLIF(checkpoint->>'stage',''),'queued'),
    checkpoint,
    source_hash
  INTO current_stage, current_checkpoint, job_source_hash
  FROM report_execution_jobs
  WHERE id=p_job_id
    AND company_id=public.current_company_id()
    AND lease_owner=p_worker_id
    AND lease_expires_at > now()
    AND status IN ('leased','processing')
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  next_stage := p_checkpoint->>'stage';
  IF COALESCE(NULLIF(current_checkpoint->>'sourceHash',''), job_source_hash) <> job_source_hash THEN
    RAISE EXCEPTION 'Stored checkpoint source hash does not match durable job source hash';
  END IF;
  IF p_checkpoint->>'sourceHash' <> job_source_hash THEN
    RAISE EXCEPTION 'Checkpoint source hash cannot change during a run';
  END IF;

  current_index := CASE current_stage
    WHEN 'queued' THEN 0 WHEN 'fingerprinted' THEN 1 WHEN 'extracted' THEN 2
    WHEN 'canonicalized' THEN 3 WHEN 'validated' THEN 4 WHEN 'analyzed' THEN 5
    WHEN 'decisioned' THEN 6 WHEN 'committed' THEN 7 WHEN 'rendered' THEN 8
    ELSE -1 END;
  next_index := CASE next_stage
    WHEN 'queued' THEN 0 WHEN 'fingerprinted' THEN 1 WHEN 'extracted' THEN 2
    WHEN 'canonicalized' THEN 3 WHEN 'validated' THEN 4 WHEN 'analyzed' THEN 5
    WHEN 'decisioned' THEN 6 WHEN 'committed' THEN 7 WHEN 'rendered' THEN 8
    ELSE -1 END;

  IF next_index <> current_index + 1 THEN
    RAISE EXCEPTION 'Invalid checkpoint transition: % -> %', current_stage, next_stage;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(COALESCE(current_checkpoint->'evidenceKeys','[]'::jsonb)) AS existing(key)
    WHERE NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(p_checkpoint->'evidenceKeys') AS incoming(key)
      WHERE incoming.key = existing.key
    )
  ) THEN
    RAISE EXCEPTION 'Checkpoint evidence keys cannot be removed during progression';
  END IF;

  UPDATE report_execution_jobs
  SET checkpoint=p_checkpoint, status='processing', updated_at=now()
  WHERE id=p_job_id
    AND company_id=public.current_company_id()
    AND lease_owner=p_worker_id
    AND lease_expires_at > now()
    AND status IN ('leased','processing');
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected=1;
END;
$$;

-- Keep claim semantics bounded and reject ambiguous worker identities.
CREATE OR REPLACE FUNCTION public.claim_report_execution_job(
  p_job_id uuid, p_lease_owner text, p_lease_seconds integer DEFAULT 300
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE affected integer;
BEGIN
  IF p_lease_owner IS NULL OR btrim(p_lease_owner) = '' THEN
    RAISE EXCEPTION 'A non-empty worker lease owner is required';
  END IF;
  IF p_lease_seconds < 30 OR p_lease_seconds > 3600 THEN
    RAISE EXCEPTION 'lease seconds must be between 30 and 3600';
  END IF;

  UPDATE report_execution_jobs
  SET status='leased', lease_owner=p_lease_owner, lease_expires_at=now() + make_interval(secs => p_lease_seconds),
      attempt=attempt+1, updated_at=now()
  WHERE id=p_job_id
    AND company_id=public.current_company_id()
    AND status IN ('queued','leased','processing')
    AND (lease_expires_at IS NULL OR lease_expires_at < now())
    AND attempt < max_attempts;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.advance_report_execution_checkpoint(uuid,text,jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.advance_report_execution_checkpoint(uuid,text,jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.claim_report_execution_job(uuid,text,integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_report_execution_job(uuid,text,integer) TO authenticated;
