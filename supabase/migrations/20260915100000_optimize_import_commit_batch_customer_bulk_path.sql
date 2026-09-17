-- Bulk customer path for canonical imports.
-- Keeps the existing durable transaction/idempotency boundary while avoiding
-- one customer upsert RPC call per row for large customer files.
CREATE OR REPLACE FUNCTION public.import_commit_batch(p_company_id uuid, p_entity_type text, p_rows jsonb, p_null_policy text DEFAULT 'preserve'::text, p_source_hash text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_row jsonb;
  v_id uuid;
  v_count integer := 0;
  v_ids jsonb := '[]'::jsonb;
  v_existing public.canonical_import_commits%rowtype;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF p_source_hash IS NULL OR btrim(p_source_hash) = '' THEN RAISE EXCEPTION 'IMPORT_SOURCE_HASH_REQUIRED'; END IF;
  IF p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' THEN RAISE EXCEPTION 'IMPORT_SOURCE_HASH_INVALID'; END IF;
  IF p_entity_type NOT IN ('products','customers','sales_invoices') THEN RAISE EXCEPTION 'IMPORT_ENTITY_TYPE_UNSUPPORTED'; END IF;
  IF jsonb_typeof(p_rows) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'IMPORT_ROWS_MUST_BE_ARRAY'; END IF;

  SELECT * INTO v_existing FROM public.canonical_import_commits c
  WHERE c.company_id=v_company_id AND c.entity_type=p_entity_type AND c.source_hash=p_source_hash FOR UPDATE;
  IF FOUND THEN RETURN jsonb_build_object('committed',v_existing.committed_count,'ids',v_existing.committed_ids,'idempotent_replay',true); END IF;

  IF jsonb_array_length(p_rows)=0 THEN
    INSERT INTO public.canonical_import_commits(company_id,entity_type,source_hash,committed_ids,committed_count)
    VALUES(v_company_id,p_entity_type,p_source_hash,'[]'::jsonb,0);
    RETURN jsonb_build_object('committed',0,'ids','[]'::jsonb,'idempotent_replay',false);
  END IF;

  IF p_entity_type='customers' THEN
    CREATE TEMP TABLE tmp_import_customers ON COMMIT DROP AS
    SELECT ord::bigint AS ord,
      NULLIF(btrim(value->>'name'),'') AS name,
      NULLIF(btrim(value->>'code'),'') AS code,
      NULLIF(btrim(value->>'phone'),'') AS phone,
      NULLIF(btrim(value->>'email'),'') AS email,
      NULLIF(btrim(value->>'segment'),'') AS segment,
      NULLIF(value->>'credit_limit','')::numeric AS credit_limit,
      NULLIF(value->>'payment_terms_days','')::integer AS payment_terms_days,
      public.normalize_import_key(NULLIF(btrim(value->>'code'),'')) AS norm_code,
      NULL::uuid AS target_id
    FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS x(value,ord);

    IF EXISTS (SELECT 1 FROM tmp_import_customers WHERE name IS NULL OR name='') THEN RAISE EXCEPTION 'customer name is required'; END IF;

    UPDATE public.customers c
    SET name=CASE WHEN p_null_policy='preserve' AND t.name IS NULL THEN c.name ELSE coalesce(t.name,c.name) END,
        phone=CASE WHEN p_null_policy='preserve' AND t.phone IS NULL THEN c.phone ELSE coalesce(t.phone,c.phone) END,
        email=CASE WHEN p_null_policy='preserve' AND t.email IS NULL THEN c.email ELSE coalesce(t.email,c.email) END,
        segment=CASE WHEN p_null_policy='preserve' AND t.segment IS NULL THEN c.segment ELSE coalesce(t.segment,c.segment) END,
        credit_limit=CASE WHEN p_null_policy='preserve' AND t.credit_limit IS NULL THEN c.credit_limit ELSE coalesce(t.credit_limit,c.credit_limit) END,
        payment_terms_days=CASE WHEN p_null_policy='preserve' AND t.payment_terms_days IS NULL THEN c.payment_terms_days ELSE coalesce(t.payment_terms_days,c.payment_terms_days) END
    FROM tmp_import_customers t
    WHERE t.norm_code IS NOT NULL AND c.company_id=v_company_id AND public.normalize_import_key(c.code)=t.norm_code;

    INSERT INTO public.customers(company_id,name,code,phone,email,segment,credit_limit,payment_terms_days)
    SELECT v_company_id,t.name,t.code,t.phone,t.email,coalesce(t.segment,'regular'),coalesce(t.credit_limit,0),coalesce(t.payment_terms_days,30)
    FROM tmp_import_customers t
    WHERE t.norm_code IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.customers c WHERE c.company_id=v_company_id AND public.normalize_import_key(c.code)=t.norm_code
    )
    ON CONFLICT DO NOTHING;

    UPDATE tmp_import_customers t SET target_id=c.id
    FROM public.customers c
    WHERE t.norm_code IS NOT NULL AND c.company_id=v_company_id AND public.normalize_import_key(c.code)=t.norm_code;

    FOR v_row IN SELECT to_jsonb(t) FROM tmp_import_customers t WHERE t.norm_code IS NULL ORDER BY t.ord LOOP
      SELECT target_id INTO v_id FROM public.import_upsert_customer(v_company_id,v_row->>'name',NULL,v_row->>'phone',v_row->>'email',v_row->>'segment',NULLIF(v_row->>'credit_limit','')::numeric,NULLIF(v_row->>'payment_terms_days','')::integer,p_null_policy);
      IF v_id IS NULL THEN RAISE EXCEPTION 'IMPORT_TARGET_ID_MISSING'; END IF;
      UPDATE tmp_import_customers SET target_id=v_id WHERE ord=(v_row->>'ord')::bigint;
    END LOOP;

    IF EXISTS (SELECT 1 FROM tmp_import_customers WHERE target_id IS NULL) THEN RAISE EXCEPTION 'IMPORT_TARGET_ID_MISSING'; END IF;
    SELECT count(*)::integer, coalesce(jsonb_agg(target_id ORDER BY ord),'[]'::jsonb) INTO v_count,v_ids FROM tmp_import_customers;
  ELSE
    FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
      IF p_entity_type='products' THEN
        SELECT target_id INTO v_id FROM public.import_upsert_product(v_company_id,v_row->>'sku',v_row->>'name',v_row->>'unit',NULLIF(v_row->>'cost_price','')::numeric,NULLIF(v_row->>'selling_price','')::numeric,NULLIF(v_row->>'min_stock','')::numeric,NULLIF(v_row->>'reorder_point','')::numeric,CASE WHEN v_row ? 'is_active' AND v_row->>'is_active'<>'' THEN (v_row->>'is_active')::boolean ELSE NULL END,p_null_policy);
      ELSE
        SELECT target_id INTO v_id FROM public.import_upsert_sales_invoice(v_company_id,v_row->>'invoice_number',NULLIF(v_row->>'invoice_date','')::date,NULLIF(v_row->>'customer_id','')::uuid,v_row->>'customer_name',NULLIF(v_row->>'subtotal','')::numeric,NULLIF(v_row->>'tax_amount','')::numeric,NULLIF(v_row->>'total','')::numeric,NULLIF(v_row->>'paid_amount','')::numeric,v_row->>'status',p_null_policy);
      END IF;
      IF v_id IS NULL THEN RAISE EXCEPTION 'IMPORT_TARGET_ID_MISSING'; END IF;
      v_count:=v_count+1; v_ids:=v_ids||jsonb_build_array(v_id);
    END LOOP;
  END IF;

  INSERT INTO public.canonical_import_commits(company_id,entity_type,source_hash,committed_ids,committed_count)
  VALUES(v_company_id,p_entity_type,p_source_hash,v_ids,v_count);
  RETURN jsonb_build_object('committed',v_count,'ids',v_ids,'idempotent_replay',false);
END;
$function$;
