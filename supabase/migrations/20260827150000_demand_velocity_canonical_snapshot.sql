-- Canonical tenant-authoritative demand velocity snapshot.
-- Business aggregation stays in the database; browser consumers receive one bounded snapshot.
CREATE OR REPLACE FUNCTION public.get_demand_velocity_snapshot(
  p_days integer DEFAULT 180,
  p_as_of date DEFAULT current_date
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_days integer := greatest(1, least(coalesce(p_days, 180), 365));
  v_as_of date := coalesce(p_as_of, current_date);
  v_from date;
  v_result jsonb;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  v_from := v_as_of - (v_days - 1);

  WITH daily AS (
    SELECT si.product_id,
           inv.invoice_date::date AS sale_date,
           sum(si.quantity) AS quantity,
           sum(si.line_total) AS sales
    FROM public.sale_items si
    JOIN public.sales_invoices inv ON inv.id = si.invoice_id
    WHERE inv.company_id = v_company_id
      AND inv.invoice_date::date BETWEEN v_from AND v_as_of
      AND inv.status NOT IN ('cancelled', 'void')
      AND si.product_id IS NOT NULL
      AND si.quantity IS NOT NULL
      AND si.line_total IS NOT NULL
    GROUP BY si.product_id, inv.invoice_date::date
  ),
  ordered AS (
    SELECT d.*,
           row_number() OVER (PARTITION BY d.product_id ORDER BY d.sale_date) AS rn,
           count(*) OVER (PARTITION BY d.product_id) AS point_count
    FROM daily d
  ),
  product_stats AS (
    SELECT product_id,
           sum(quantity) AS total_quantity,
           max(quantity) AS peak_daily,
           avg(quantity) FILTER (WHERE rn <= ceil(point_count / 2.0)) AS first_half,
           avg(quantity) FILTER (WHERE rn > floor(point_count / 2.0)) AS last_half
    FROM ordered
    GROUP BY product_id
  ),
  products AS (
    SELECT p.id AS product_id, p.sku, p.name, s.total_quantity, s.peak_daily,
           CASE WHEN s.first_half > 0 THEN (s.last_half - s.first_half) / s.first_half
                WHEN s.last_half > 0 THEN 1
                ELSE 0 END AS trend
    FROM product_stats s
    JOIN public.products p ON p.id = s.product_id AND p.company_id = v_company_id
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'productId', p.product_id,
    'sku', coalesce(p.sku, ''),
    'name', p.name,
    'points', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'date', o.sale_date,
        'quantity', o.quantity,
        'sales', o.sales
      ) ORDER BY o.sale_date), '[]'::jsonb)
      FROM ordered o WHERE o.product_id = p.product_id
    ),
    'totalQuantity', p.total_quantity,
    'averageDaily', p.total_quantity / v_days::numeric,
    'peakDaily', p.peak_daily,
    'trend', p.trend
  ) ORDER BY p.total_quantity DESC, p.product_id), '[]'::jsonb)
  INTO v_result
  FROM products p;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_demand_velocity_snapshot(integer, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_demand_velocity_snapshot(integer, date) TO authenticated;
