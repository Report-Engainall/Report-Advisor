-- Governed import write gate: non-new rows can never reach canonical persistence.
CREATE OR REPLACE FUNCTION public.import_commit_batch_governed(
  p_company_id uuid,
  p_entity_type text,
  p_rows jsonb,
  p_source_rows jsonb,
  p_resolutions jsonb,
  p_null_policy text DEFAULT 'preserve'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company uuid := public.current_company_id();
  v_count integer;
  v_write_count integer;
  v_non_new integer;
  v_result jsonb;
BEGIN
  IF v_company IS NULL OR v_company <> p_company_id THEN
    RAISE EXCEPTION 'IMPORT_TENANT_CONTEXT_REQUIRED';
  END IF;
  IF jsonb_typeof(p_rows) <> 'array' OR jsonb_typeof(p_source_rows) <> 'array' OR jsonb_typeof(p_resolutions) <> 'array' THEN
    RAISE EXCEPTION 'IMPORT_GOVERNED_PAYLOAD_MUST_BE_JSON_ARRAYS';
  END IF;
  v_count := jsonb_array_length(p_rows);
  IF v_count <> jsonb_array_length(p_source_rows) OR v_count <> jsonb_array_length(p_resolutions) THEN
    RAISE EXCEPTION 'IMPORT_GOVERNED_ROW_COUNT_MISMATCH';
  END IF;

  SELECT count(*) FILTER (WHERE COALESCE(value->>'outcome','') <> 'new')
    INTO v_non_new
  FROM jsonb_array_elements(p_resolutions);
  IF v_non_new <> 0 THEN
    RAISE EXCEPTION 'IMPORT_RESOLUTION_BLOCKED_NON_NEW';
  END IF;

  SELECT count(*) FILTER (WHERE COALESCE(value->>'action','') = 'write_new' AND COALESCE((value->>'allowedToWrite')::boolean,false))
    INTO v_write_count
  FROM jsonb_array_elements(p_resolutions);
  IF v_write_count <> v_count THEN
    RAISE EXCEPTION 'IMPORT_RESOLUTION_WRITE_NOT_ALLOWED';
  END IF;

  v_result := public.import_commit_batch_with_lineage(
    p_company_id,
    p_entity_type,
    p_rows,
    p_source_rows,
    p_null_policy
  );
  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) TO authenticated;

COMMENT ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text)
IS 'Tenant-safe import write gate. Requires one explicit write_new resolution for every row and rejects exact duplicates, candidate duplicates, and conflicts before canonical write.';
