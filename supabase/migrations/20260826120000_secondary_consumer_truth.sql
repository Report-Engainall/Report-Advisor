-- Wave 08 deep closure: secondary sales consumers use domain truth instead of page-local aggregation.
-- Tenant authority is always the authenticated context; p_company_id is only a compatibility assertion.

CREATE OR REPLACE FUNCTION public.get_sales_top_customers(
  p_company_id uuid,
  p_limit integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 5), 1), 50);
  v_result jsonb;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;

  WITH agg AS (
    SELECT
      s.customer_id AS id,
      COALESCE(c.name, s.customer_id::text) AS name,
      SUM(s.subtotal)::numeric AS value,
      COUNT(*)::integer AS invoices,
      COUNT(*) FILTER (WHERE s.subtotal IS NULL)::integer AS missing_rows
    FROM sales_invoices s
    LEFT JOIN customers c ON c.id = s.customer_id AND c.company_id = s.company_id
    WHERE s.company_id = v_company_id
      AND s.status NOT IN ('cancelled','void')
    GROUP BY s.customer_id, c.name
  )
  SELECT jsonb_build_object(
    'status', CASE WHEN EXISTS (SELECT 1 FROM agg WHERE missing_rows > 0) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,
    'rows', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'id', id,
      'name', name,
      'value', CASE WHEN missing_rows = 0 THEN value ELSE NULL END,
      'secondary', invoices
    ) ORDER BY value DESC NULLS LAST, id LIMIT v_limit) FROM agg), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_sales_top_products(
  p_company_id uuid,
  p_limit integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 5), 1), 50);
  v_result jsonb;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;

  WITH agg AS (
    SELECT
      si.product_id AS id,
      COALESCE(p.name, si.product_id::text) AS name,
      SUM(si.line_total)::numeric AS value,
      SUM(si.quantity)::numeric AS secondary,
      COUNT(*) FILTER (WHERE si.line_total IS NULL OR si.quantity IS NULL)::integer AS missing_rows
    FROM sale_items si
    JOIN sales_invoices s ON s.id = si.invoice_id AND s.company_id = v_company_id
    LEFT JOIN products p ON p.id = si.product_id AND p.company_id = s.company_id
    WHERE s.company_id = v_company_id
      AND s.status NOT IN ('cancelled','void')
      AND si.product_id IS NOT NULL
    GROUP BY si.product_id, p.name
  )
  SELECT jsonb_build_object(
    'status', CASE WHEN EXISTS (SELECT 1 FROM agg WHERE missing_rows > 0) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,
    'rows', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'id', id,
      'name', name,
      'value', CASE WHEN missing_rows = 0 THEN value ELSE NULL END,
      'secondary', CASE WHEN missing_rows = 0 THEN secondary ELSE NULL END
    ) ORDER BY value DESC NULLS LAST, id LIMIT v_limit) FROM agg), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_sales_category_breakdown(
  p_company_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_result jsonb;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;

  WITH agg AS (
    SELECT
      COALESCE(c.id::text, '__uncategorized__') AS id,
      COALESCE(c.name, 'غير مصنف') AS name,
      SUM(si.line_total)::numeric AS sales,
      SUM(si.line_total - (si.cost_price * si.quantity))::numeric AS profit,
      SUM(si.quantity)::numeric AS quantity,
      COUNT(*) FILTER (WHERE si.line_total IS NULL OR si.cost_price IS NULL OR si.quantity IS NULL)::integer AS missing_rows
    FROM sale_items si
    JOIN sales_invoices s ON s.id = si.invoice_id AND s.company_id = v_company_id
    LEFT JOIN products p ON p.id = si.product_id AND p.company_id = s.company_id
    LEFT JOIN categories c ON c.id = p.category_id AND c.company_id = s.company_id
    WHERE s.company_id = v_company_id
      AND s.status NOT IN ('cancelled','void')
    GROUP BY c.id, c.name
  )
  SELECT jsonb_build_object(
    'status', CASE WHEN EXISTS (SELECT 1 FROM agg WHERE missing_rows > 0) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,
    'rows', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'name', name,
      'sales', sales,
      'profit', CASE WHEN missing_rows = 0 THEN profit ELSE NULL END,
      'quantity', CASE WHEN missing_rows = 0 THEN quantity ELSE NULL END
    ) ORDER BY sales DESC NULLS LAST, id) FROM agg), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_receivables_aging_truth(
  p_company_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_result jsonb;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;

  WITH base AS (
    SELECT
      CASE
        WHEN s.due_date IS NULL THEN 'UNDATED'
        WHEN GREATEST(CURRENT_DATE - s.due_date, 0) <= 30 THEN '0-30'
        WHEN GREATEST(CURRENT_DATE - s.due_date, 0) <= 60 THEN '31-60'
        WHEN GREATEST(CURRENT_DATE - s.due_date, 0) <= 90 THEN '61-90'
        ELSE '90+'
      END AS bucket,
      GREATEST(s.total - s.paid_amount, 0)::numeric AS amount
    FROM sales_invoices s
    WHERE s.company_id = v_company_id
      AND s.status NOT IN ('cancelled','void')
      AND s.total IS NOT NULL
      AND s.paid_amount IS NOT NULL
      AND s.total > s.paid_amount
  ), buckets AS (
    SELECT bucket, SUM(amount)::numeric AS amount, COUNT(*)::integer AS count
    FROM base GROUP BY bucket
  ), ordered AS (
    SELECT b.bucket, COALESCE(b.amount,0)::numeric AS amount, COALESCE(b.count,0)::integer AS count
    FROM (VALUES ('0-30',1),('31-60',2),('61-90',3),('90+',4),('UNDATED',5)) v(bucket, ord)
    LEFT JOIN buckets b ON b.bucket = v.bucket
    ORDER BY v.ord
  )
  SELECT jsonb_build_object(
    'status', CASE WHEN EXISTS (
      SELECT 1 FROM sales_invoices s
      WHERE s.company_id = v_company_id AND s.status NOT IN ('cancelled','void')
        AND (s.total IS NULL OR s.paid_amount IS NULL)
    ) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,
    'rows', COALESCE((SELECT jsonb_agg(jsonb_build_object('bucket', bucket, 'amount', amount, 'count', count) ORDER BY bucket) FROM ordered), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_sales_top_customers(uuid,integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_sales_top_products(uuid,integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_sales_category_breakdown(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_receivables_aging_truth(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_sales_top_customers(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_top_products(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_category_breakdown(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_receivables_aging_truth(uuid) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_sales_invoices_company_status_customer
  ON sales_invoices(company_id, status, customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_invoice_product
  ON sale_items(invoice_id, product_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_company_due_status
  ON sales_invoices(company_id, status, due_date);
