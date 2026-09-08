-- Tenant-scoped import preview must resolve the same canonical identity keys that the
-- universal resolver and canonical writer use. Source files commonly arrive with
-- headers such as "SKU", "Invoice Number", or "Customer Name" rather than canonical
-- snake_case keys. Normalize keys server-side before candidate lookup.

CREATE OR REPLACE FUNCTION public.import_resolution_preview(
  p_entity_type text,
  p_rows jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company uuid := public.current_company_id();
  v_rows jsonb;
  v_limit integer;
BEGIN
  IF v_company IS NULL THEN
    RAISE EXCEPTION 'TENANT_REQUIRED';
  END IF;

  IF p_entity_type NOT IN ('products', 'customers', 'sales_invoices') THEN
    RAISE EXCEPTION 'IMPORT_ENTITY_NOT_ALLOWED';
  END IF;

  IF jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'IMPORT_ROWS_MUST_BE_ARRAY';
  END IF;

  v_limit := jsonb_array_length(p_rows);
  IF v_limit > 500 THEN
    RAISE EXCEPTION 'IMPORT_PREVIEW_LIMIT_EXCEEDED';
  END IF;

  v_rows := COALESCE((
    SELECT jsonb_agg(
      COALESCE((
        SELECT jsonb_object_agg(
          regexp_replace(lower(trim(e.key)), '[^a-z0-9]+', '_', 'g'),
          e.value
        )
        FROM jsonb_each_text(item) e
      ), '{}'::jsonb)
    )
    FROM jsonb_array_elements(p_rows) item
  ), '[]'::jsonb);

  IF p_entity_type = 'products' THEN
    RETURN COALESCE((
      SELECT jsonb_agg(to_jsonb(q) ORDER BY q.sku, q.id)
      FROM (
        SELECT p.*
        FROM public.products p
        JOIN jsonb_array_elements(v_rows) r ON true
        WHERE p.company_id = v_company
          AND nullif(trim(r.value ->> 'sku'), '') IS NOT NULL
          AND p.sku = trim(r.value ->> 'sku')
      ) q
    ), '[]'::jsonb);
  ELSIF p_entity_type = 'sales_invoices' THEN
    RETURN COALESCE((
      SELECT jsonb_agg(to_jsonb(q) ORDER BY q.invoice_number, q.id)
      FROM (
        SELECT s.*
        FROM public.sales_invoices s
        JOIN jsonb_array_elements(v_rows) r ON true
        WHERE s.company_id = v_company
          AND nullif(trim(r.value ->> 'invoice_number'), '') IS NOT NULL
          AND s.invoice_number = trim(r.value ->> 'invoice_number')
      ) q
    ), '[]'::jsonb);
  ELSE
    RETURN COALESCE((
      SELECT jsonb_agg(to_jsonb(q) ORDER BY q.name, q.id)
      FROM (
        SELECT c.*
        FROM public.customers c
        JOIN jsonb_array_elements(v_rows) r ON true
        WHERE c.company_id = v_company
          AND (
            (nullif(trim(r.value ->> 'code'), '') IS NOT NULL AND c.code = trim(r.value ->> 'code'))
            OR
            (nullif(trim(r.value ->> 'code'), '') IS NULL AND nullif(trim(r.value ->> 'name'), '') IS NOT NULL AND c.name = trim(r.value ->> 'name'))
          )
      ) q
    ), '[]'::jsonb);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.import_resolution_preview(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.import_resolution_preview(text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_resolution_preview(text, jsonb) TO authenticated;
