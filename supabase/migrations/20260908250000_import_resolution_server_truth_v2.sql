-- Server-truth identity gate for governed canonical imports.
CREATE OR REPLACE FUNCTION public.import_commit_batch_governed(
  p_company_id uuid, p_entity_type text, p_rows jsonb, p_source_rows jsonb, p_resolutions jsonb, p_null_policy text DEFAULT 'preserve'
)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  v_company uuid := public.current_company_id(); v_count integer; v_write_count integer; v_non_new integer;
  v_index integer; v_row jsonb; v_key text; v_exists boolean; v_seen text[] := ARRAY[]::text[];
  v_key_column text; v_identity_column text; v_sql text;
BEGIN
  IF v_company IS NULL OR v_company <> p_company_id THEN RAISE EXCEPTION 'IMPORT_TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_entity_type NOT IN ('products','customers','sales_invoices') THEN RAISE EXCEPTION 'IMPORT_ENTITY_TYPE_UNSUPPORTED'; END IF;
  IF jsonb_typeof(p_rows) <> 'array' OR jsonb_typeof(p_source_rows) <> 'array' OR jsonb_typeof(p_resolutions) <> 'array' THEN RAISE EXCEPTION 'IMPORT_GOVERNED_PAYLOAD_MUST_BE_JSON_ARRAYS'; END IF;
  v_count := jsonb_array_length(p_rows);
  IF v_count <> jsonb_array_length(p_source_rows) OR v_count <> jsonb_array_length(p_resolutions) THEN RAISE EXCEPTION 'IMPORT_GOVERNED_ROW_COUNT_MISMATCH'; END IF;
  IF v_count > 500 THEN RAISE EXCEPTION 'IMPORT_BATCH_TOO_LARGE'; END IF;
  SELECT count(*) FILTER (WHERE COALESCE(value->>'outcome','') <> 'new') INTO v_non_new FROM jsonb_array_elements(p_resolutions);
  IF v_non_new <> 0 THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_BLOCKED_NON_NEW'; END IF;
  SELECT count(*) FILTER (WHERE COALESCE(value->>'action','') = 'write_new' AND COALESCE((value->>'allowedToWrite')::boolean,false)) INTO v_write_count FROM jsonb_array_elements(p_resolutions);
  IF v_write_count <> v_count THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_WRITE_NOT_ALLOWED'; END IF;
  v_key_column := CASE p_entity_type WHEN 'products' THEN 'sku' WHEN 'customers' THEN 'code' ELSE 'invoice_number' END;
  FOR v_row, v_index IN SELECT value, ordinality::integer FROM jsonb_array_elements(p_rows) WITH ORDINALITY LOOP
    v_identity_column := CASE WHEN p_entity_type = 'customers' AND NULLIF(btrim(v_row->>'code'),'') IS NULL THEN 'name' ELSE v_key_column END;
    v_key := public.normalize_import_key(v_row->>v_identity_column);
    IF v_key IS NULL THEN RAISE EXCEPTION 'IMPORT_IDENTITY_KEY_REQUIRED:%', v_index; END IF;
    IF v_key = ANY(v_seen) THEN RAISE EXCEPTION 'IMPORT_DUPLICATE_IN_BATCH:%', v_index; END IF;
    v_seen := array_append(v_seen, v_key);
    v_sql := format('SELECT EXISTS (SELECT 1 FROM public.%I WHERE company_id = $1 AND public.normalize_import_key(%I) = $2)', p_entity_type, v_identity_column);
    EXECUTE v_sql INTO v_exists USING v_company, v_key;
    IF v_exists THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_SERVER_DUPLICATE:%', v_index; END IF;
  END LOOP;
  RETURN public.import_commit_batch_with_lineage(p_company_id,p_entity_type,p_rows,p_source_rows,p_null_policy);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) TO authenticated;
COMMENT ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) IS 'Tenant-safe governed import gate with server-truth identity, batch duplicate detection, explicit resolution authorization, and canonical lineage persistence.';
