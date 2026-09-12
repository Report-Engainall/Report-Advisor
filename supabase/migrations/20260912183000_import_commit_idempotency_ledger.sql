-- Durable import commit ledger closes the crash window between the canonical
-- mutation and the durable 'committed' checkpoint. The ledger write is part of
-- the same transaction as the canonical rows, so a retry either observes the
-- prior committed result or performs the entire mutation once.

CREATE TABLE IF NOT EXISTS public.canonical_import_commits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('products','customers','sales_invoices')),
  source_hash text NOT NULL,
  committed_ids jsonb NOT NULL CHECK (jsonb_typeof(committed_ids) = 'array'),
  committed_count integer NOT NULL CHECK (committed_count >= 0),
  committed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, entity_type, source_hash)
);

ALTER TABLE public.canonical_import_commits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS canonical_import_commits_tenant ON public.canonical_import_commits;
CREATE POLICY canonical_import_commits_tenant ON public.canonical_import_commits
  FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());
REVOKE ALL ON public.canonical_import_commits FROM anon;
GRANT SELECT ON public.canonical_import_commits TO authenticated;

CREATE OR REPLACE FUNCTION public.import_commit_batch(
  p_company_id uuid,
  p_entity_type text,
  p_rows jsonb,
  p_null_policy text DEFAULT 'preserve',
  p_source_hash text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO ''
AS $$
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

  SELECT * INTO v_existing
  FROM public.canonical_import_commits c
  WHERE c.company_id = v_company_id
    AND c.entity_type = p_entity_type
    AND c.source_hash = p_source_hash
  FOR UPDATE;

  IF FOUND THEN
    RETURN jsonb_build_object('committed', v_existing.committed_count, 'ids', v_existing.committed_ids, 'idempotent_replay', true);
  END IF;

  IF jsonb_array_length(p_rows) = 0 THEN
    INSERT INTO public.canonical_import_commits(company_id,entity_type,source_hash,committed_ids,committed_count)
    VALUES(v_company_id,p_entity_type,p_source_hash,'[]'::jsonb,0);
    RETURN jsonb_build_object('committed',0,'ids','[]'::jsonb,'idempotent_replay',false);
  END IF;

  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows)
  LOOP
    IF p_entity_type = 'products' THEN
      SELECT target_id INTO v_id FROM public.import_upsert_product(
        v_company_id,v_row->>'sku',v_row->>'name',v_row->>'unit',
        NULLIF(v_row->>'cost_price','')::numeric,NULLIF(v_row->>'selling_price','')::numeric,
        NULLIF(v_row->>'min_stock','')::numeric,NULLIF(v_row->>'reorder_point','')::numeric,
        CASE WHEN v_row ? 'is_active' AND v_row->>'is_active' <> '' THEN (v_row->>'is_active')::boolean ELSE NULL END,
        p_null_policy
      );
    ELSIF p_entity_type = 'customers' THEN
      SELECT target_id INTO v_id FROM public.import_upsert_customer(
        v_company_id,v_row->>'name',v_row->>'code',v_row->>'phone',v_row->>'email',v_row->>'segment',
        NULLIF(v_row->>'credit_limit','')::numeric,NULLIF(v_row->>'payment_terms_days','')::integer,p_null_policy
      );
    ELSE
      SELECT target_id INTO v_id FROM public.import_upsert_sales_invoice(
        v_company_id,v_row->>'invoice_number',NULLIF(v_row->>'invoice_date','')::date,
        NULLIF(v_row->>'customer_id','')::uuid,v_row->>'customer_name',
        NULLIF(v_row->>'subtotal','')::numeric,NULLIF(v_row->>'tax_amount','')::numeric,
        NULLIF(v_row->>'total','')::numeric,NULLIF(v_row->>'paid_amount','')::numeric,
        v_row->>'status',p_null_policy
      );
    END IF;
    IF v_id IS NULL THEN RAISE EXCEPTION 'IMPORT_TARGET_ID_MISSING'; END IF;
    v_count := v_count + 1;
    v_ids := v_ids || jsonb_build_array(v_id);
  END LOOP;

  INSERT INTO public.canonical_import_commits(company_id,entity_type,source_hash,committed_ids,committed_count)
  VALUES(v_company_id,p_entity_type,p_source_hash,v_ids,v_count);

  RETURN jsonb_build_object('committed',v_count,'ids',v_ids,'idempotent_replay',false);
END;
$$;

REVOKE ALL ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text) TO authenticated;
