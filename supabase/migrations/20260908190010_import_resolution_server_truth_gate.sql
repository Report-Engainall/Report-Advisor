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
  v_row jsonb;
  v_key text;
  v_seen text[] := ARRAY[]::text[];
  v_existing boolean;
BEGIN
  IF v_company IS NULL OR v_company <> p_company_id THEN
    RAISE EXCEPTION 'IMPORT_TENANT_CONTEXT_REQUIRED';
  END IF;
  IF p_entity_type NOT IN ('products','customers','sales_invoices') THEN
    RAISE EXCEPTION 'IMPORT_ENTITY_TYPE_UNSUPPORTED';
  END IF;
  IF jsonb_typeof(p_rows) <> 'array' OR jsonb_typeof(p_source_rows) <> 'array' OR jsonb_typeof(p_resolutions) <> 'array' THEN
    RAISE EXCEPTION 'IMPORT_GOVERNED_PAYLOAD_MUST_BE_JSON_ARRAYS';
  END IF;
  v_count := jsonb_array_length(p_rows);
  IF v_count = 0 THEN
    RETURN jsonb_build_object('committed',0,'ids','[]'::jsonb);
  END IF;
  IF v_count <> jsonb_array_length(p_source_rows) OR v_count <> jsonb_array_length(p_resolutions) THEN
    RAISE EXCEPTION 'IMPORT_GOVERNED_ROW_COUNT_MISMATCH';
  END IF;

  SELECT count(*) FILTER (WHERE COALESCE(value->>'outcome','') <> 'new') INTO v_non_new
  FROM jsonb_array_elements(p_resolutions);
  IF v_non_new <> 0 THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_BLOCKED_NON_NEW'; END IF;

  SELECT count(*) FILTER (WHERE COALESCE(value->>'action','') = 'write_new' AND COALESCE((value->>'allowedToWrite')::boolean,false)) INTO v_write_count
  FROM jsonb_array_elements(p_resolutions);
  IF v_write_count <> v_count THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_WRITE_NOT_ALLOWED'; END IF;

  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
    IF p_entity_type = 'products' THEN
      v_key := public.normalize_import_key(v_row->>'sku');
      IF v_key IS NULL THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_KEY_REQUIRED'; END IF;
      IF v_key = ANY(v_seen) THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_DUPLICATE_IN_BATCH'; END IF;
      v_seen := array_append(v_seen,v_key);
      SELECT EXISTS(SELECT 1 FROM public.products WHERE company_id=v_company AND public.normalize_import_key(sku)=v_key) INTO v_existing;
    ELSIF p_entity_type = 'customers' THEN
      v_key := public.normalize_import_key(v_row->>'code');
      IF v_key IS NULL THEN
        v_key := 'name:' || COALESCE(public.normalize_import_key(v_row->>'name'),'');
      END IF;
      IF v_key IS NULL OR v_key = 'name:' THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_KEY_REQUIRED'; END IF;
      IF v_key = ANY(v_seen) THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_DUPLICATE_IN_BATCH'; END IF;
      v_seen := array_append(v_seen,v_key);
      SELECT EXISTS(
        SELECT 1 FROM public.customers
        WHERE company_id=v_company
          AND ((public.normalize_import_key(code)=public.normalize_import_key(v_row->>'code') AND public.normalize_import_key(v_row->>'code') IS NOT NULL)
            OR (public.normalize_import_key(v_row->>'code') IS NULL AND public.normalize_import_key(name)=public.normalize_import_key(v_row->>'name')))
      ) INTO v_existing;
    ELSE
      v_key := public.normalize_import_key(v_row->>'invoice_number');
      IF v_key IS NULL THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_KEY_REQUIRED'; END IF;
      IF v_key = ANY(v_seen) THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_DUPLICATE_IN_BATCH'; END IF;
      v_seen := array_append(v_seen,v_key);
      SELECT EXISTS(SELECT 1 FROM public.sales_invoices WHERE company_id=v_company AND public.normalize_import_key(invoice_number)=v_key) INTO v_existing;
    END IF;
    IF v_existing THEN RAISE EXCEPTION 'IMPORT_RESOLUTION_SERVER_DUPLICATE'; END IF;
  END LOOP;

  v_result := public.import_commit_batch_with_lineage(p_company_id,p_entity_type,p_rows,p_source_rows,p_null_policy);
  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) TO authenticated;
