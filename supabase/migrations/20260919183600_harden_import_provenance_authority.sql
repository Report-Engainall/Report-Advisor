-- Bind the existing canonical commit writer to the authoritative import source.
-- Client-provided source claims remain untrusted; the server/database derives identity from
-- import_jobs.file_record_id -> file_records and verifies persisted hash parity before commit.

REVOKE ALL ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text) TO service_role;

DROP FUNCTION IF EXISTS public.import_commit_batch(uuid, text, jsonb, text, text, uuid);

CREATE FUNCTION public.import_commit_batch(
  p_company_id uuid,
  p_entity_type text,
  p_rows jsonb,
  p_null_policy text,
  p_source_hash text,
  p_import_job_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog
SET statement_timeout TO '30s'
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_file_record_id uuid;
  v_file_hash text;
  v_file_status text;
  v_file_security_status text;
  v_file_metadata jsonb;
  v_source_fingerprint text;
  v_job_type text;
BEGIN
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;

  IF p_company_id IS DISTINCT FROM v_company_id THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;

  IF p_import_job_id IS NULL THEN
    RAISE EXCEPTION 'IMPORT_JOB_ID_REQUIRED';
  END IF;

  IF p_source_hash IS NULL OR btrim(p_source_hash) = '' THEN
    RAISE EXCEPTION 'IMPORT_SOURCE_HASH_REQUIRED';
  END IF;

  IF p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' THEN
    RAISE EXCEPTION 'IMPORT_SOURCE_HASH_INVALID';
  END IF;

  SELECT
    i.file_record_id,
    fr.file_hash,
    fr.status,
    fr.security_status,
    fr.metadata,
    i.source_fingerprint,
    i.job_type
  INTO
    v_file_record_id,
    v_file_hash,
    v_file_status,
    v_file_security_status,
    v_file_metadata,
    v_source_fingerprint,
    v_job_type
  FROM public.import_jobs i
  JOIN public.file_records fr
    ON fr.id = i.file_record_id
   AND fr.company_id = i.company_id
  WHERE i.id = p_import_job_id
    AND i.company_id = v_company_id
  FOR SHARE OF i;

  IF NOT FOUND OR v_file_record_id IS NULL THEN
    RAISE EXCEPTION 'IMPORT_JOB_SOURCE_RECORD_NOT_FOUND_OR_FORBIDDEN';
  END IF;

  IF v_file_hash IS NULL OR v_file_hash !~ '^sha256:[0-9a-fA-F]{64}$' THEN
    RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_HASH_INVALID';
  END IF;

  IF v_file_hash IS DISTINCT FROM p_source_hash THEN
    RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_HASH_MISMATCH';
  END IF;

  IF v_file_status IS DISTINCT FROM 'ready' OR v_file_security_status IS DISTINCT FROM 'passed' THEN
    RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_NOT_VERIFIED';
  END IF;

  IF coalesce(v_file_metadata->>'storage_bucket','') IS DISTINCT FROM 'documents' THEN
    RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_STORAGE_BINDING_INVALID';
  END IF;

  IF v_file_metadata->>'raw_bytes_sha256' IS DISTINCT FROM v_file_hash THEN
    RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_RAW_HASH_PROOF_MISSING';
  END IF;

  IF v_source_fingerprint IS NULL OR btrim(v_source_fingerprint) = '' THEN
    RAISE EXCEPTION 'IMPORT_SOURCE_FINGERPRINT_REQUIRED';
  END IF;

  IF v_source_fingerprint IS DISTINCT FROM v_file_hash THEN
    RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_HASH_DRIFT';
  END IF;

  IF v_job_type IN ('products','customers','sales_invoices')
     AND v_job_type IS DISTINCT FROM p_entity_type THEN
    RAISE EXCEPTION 'IMPORT_JOB_ENTITY_TYPE_MISMATCH';
  END IF;

  RETURN public.import_commit_batch(
    p_company_id,
    p_entity_type,
    p_rows,
    p_null_policy,
    p_source_hash
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text, uuid) TO authenticated, service_role;
