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
  v_index integer;
  v_row jsonb;
  v_resolution jsonb;
  v_key text;
  v_other jsonb;
  v_other_key text;
  v_existing uuid;
  v_result jsonb;
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
  IF v_count <> jsonb_array_length(p_source_rows) OR v_count <> jsonb_array_length(p_resolutions) THEN
    RAISE EXCEPTION 'IMPORT_GOVERNED_ROW_COUNT_MISMATCH';
  END IF;
  IF v_count > 500 THEN
    RAISE EXCEPTION 'IMPORT_BATCH_TOO_LARGE';
  END IF;

  FOR v_index IN 0..GREATEST(v_count - 1, -1) LOOP
    v_row := p_rows -> v_index;
    v_resolution := p_resolutions -> v_index;

    IF COALESCE(v_resolution->>'outcome','') <> 'new'
       OR COALESCE(v_resolution->>'action','') <> 'write_new'
       OR COALESCE((v_resolution->>'allowedToWrite')::boolean,false) IS NOT TRUE THEN
      RAISE EXCEPTION 'IMPORT_RESOLUTION_BLOCKED_ROW_%', v_index + 1;
    END IF;

    IF p_entity_type = 'products' THEN
      v_key := public.normalize_import_key(v_row->>'sku');
      IF v_key IS NULL THEN RAISE EXCEPTION 'SKU_REQUIRED_ROW_%', v_index + 1; END IF;
      SELECT id INTO v_existing FROM public.products
       WHERE company_id=v_company AND public.normalize_import_key(sku)=v_key LIMIT 1;
      IF v_existing IS NOT NULL THEN
        RAISE EXCEPTION 'IMPORT_DUPLICATE_EXISTING_PRODUCT_ROW_%', v_index + 1;
      END IF;
    ELSIF p_entity_type = 'customers' THEN
      v_key := public.normalize_import_key(v_row->>'code');
      IF v_key IS NOT NULL THEN
        SELECT id INTO v_existing FROM public.customers
         WHERE company_id=v_company AND public.normalize_import_key(code)=v_key LIMIT 1;
        IF v_existing IS NOT NULL THEN
          RAISE EXCEPTION 'IMPORT_DUPLICATE_EXISTING_CUSTOMER_ROW_%', v_index + 1;
        END IF;
      END IF;
    ELSE
      v_key := public.normalize_import_key(v_row->>'invoice_number');
      IF v_key IS NULL THEN RAISE EXCEPTION 'INVOICE_NUMBER_REQUIRED_ROW_%', v_index + 1; END IF;
      SELECT id INTO v_existing FROM public.sales_invoices
       WHERE company_id=v_company AND public.normalize_import_key(invoice_number)=v_key LIMIT 1;
      IF v_existing IS NOT NULL THEN
        RAISE EXCEPTION 'IMPORT_DUPLICATE_EXISTING_INVOICE_ROW_%', v_index + 1;
      END IF;
    END IF;

    FOR v_other IN SELECT value FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS x(value, ordinality) WHERE x.ordinality - 1 < v_index LOOP
      IF p_entity_type = 'products' THEN
        v_other_key := public.normalize_import_key(v_other->>'sku');
      ELSIF p_entity_type = 'customers' THEN
        v_other_key := public.normalize_import_key(v_other->>'code');
      ELSE
        v_other_key := public.normalize_import_key(v_other->>'invoice_number');
      END IF;
      IF v_key IS NOT NULL AND v_key = v_other_key THEN
        RAISE EXCEPTION 'IMPORT_DUPLICATE_WITHIN_BATCH_ROW_%', v_index + 1;
      END IF;
    END LOOP;
  END LOOP;

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

COMMENT ON FUNCTION public.import_commit_batch_governed(uuid,text,jsonb,jsonb,jsonb,text) IS 'Server-truth governed import writer: validates tenant, resolution authorization, existing canonical identities, and intra-batch duplicates before delegating to lineage writer.';
