-- Dashboard secondary truth: trend and ranked entities are calculated server-side.
-- Tenant authority is always the authenticated session's current_company_id().
CREATE OR REPLACE FUNCTION public.report_dashboard_secondary_truth(p_months integer DEFAULT 6)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH params AS (
  SELECT greatest(1, least(coalesce(p_months, 6), 12))::integer AS months
),
inv AS (
  SELECT si.id, si.customer_id, si.invoice_date
  FROM public.sales_invoices si
  WHERE si.company_id = public.current_company_id()
    AND lower(coalesce(si.status, '')) NOT IN ('cancelled', 'canceled', 'void')
),
items AS (
  SELECT sai.invoice_id, sai.product_id, sai.quantity, sai.line_total, sai.cost_price
  FROM public.sale_items sai
  JOIN inv ON inv.id = sai.invoice_id
),
quality AS (
  SELECT count(*) FILTER (WHERE line_total IS NULL OR cost_price IS NULL OR quantity IS NULL)::bigint AS incomplete_rows
  FROM items
),
months AS (
  SELECT generate_series(
    date_trunc('month', current_date) - ((p.months - 1) * interval '1 month'),
    date_trunc('month', current_date),
    interval '1 month'
  )::date AS month_start
  FROM params p
),
trend_raw AS (
  SELECT m.month_start,
         coalesce(sum(i.line_total) FILTER (WHERE date_trunc('month', inv.invoice_date)::date = m.month_start), 0)::numeric AS sales,
         coalesce(sum(i.cost_price * i.quantity) FILTER (WHERE date_trunc('month', inv.invoice_date)::date = m.month_start), 0)::numeric AS cost,
         count(DISTINCT inv.id) FILTER (WHERE date_trunc('month', inv.invoice_date)::date = m.month_start)::bigint AS invoices
  FROM months m
  LEFT JOIN inv ON date_trunc('month', inv.invoice_date)::date = m.month_start
  LEFT JOIN items i ON i.invoice_id = inv.id
  GROUP BY m.month_start
),
trend AS (
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'month', to_char(month_start, 'YYYY-MM'),
    'sales', CASE WHEN q.incomplete_rows = 0 THEN sales ELSE NULL END,
    'cost', CASE WHEN q.incomplete_rows = 0 THEN cost ELSE NULL END,
    'profit', CASE WHEN q.incomplete_rows = 0 THEN sales - cost ELSE NULL END,
    'invoices', invoices
  ) ORDER BY month_start), '[]'::jsonb) AS value
  FROM trend_raw CROSS JOIN quality q
),
top_customers AS (
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', x.customer_id, 'name', coalesce(x.customer_name, x.customer_id::text), 'value', x.value) ORDER BY x.value DESC), '[]'::jsonb) AS value
  FROM (
    SELECT inv.customer_id, c.name customer_name, sum(i.line_total)::numeric value
    FROM inv JOIN items i ON i.invoice_id = inv.id
    LEFT JOIN public.customers c ON c.id = inv.customer_id
    WHERE inv.customer_id IS NOT NULL AND i.line_total IS NOT NULL
    GROUP BY inv.customer_id, c.name
    ORDER BY value DESC
    LIMIT 5
  ) x
),
top_products AS (
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', x.product_id, 'name', coalesce(x.product_name, x.product_id::text), 'value', x.value, 'secondary', x.quantity) ORDER BY x.value DESC), '[]'::jsonb) AS value
  FROM (
    SELECT i.product_id, p.name product_name, sum(i.line_total)::numeric value, sum(i.quantity)::numeric quantity
    FROM items i
    LEFT JOIN public.products p ON p.id = i.product_id
    WHERE i.product_id IS NOT NULL AND i.line_total IS NOT NULL AND i.quantity IS NOT NULL
    GROUP BY i.product_id, p.name
    ORDER BY value DESC
    LIMIT 5
  ) x
),
categories AS (
  SELECT coalesce(jsonb_agg(jsonb_build_object('name', x.name, 'sales', x.sales, 'profit', CASE WHEN q.incomplete_rows = 0 THEN x.profit ELSE NULL END, 'quantity', x.quantity) ORDER BY x.sales DESC), '[]'::jsonb) AS value
  FROM (
    SELECT coalesce(c.name, 'غير مصنف') name, sum(i.line_total)::numeric sales, sum(i.line_total - i.cost_price * i.quantity)::numeric profit, sum(i.quantity)::numeric quantity
    FROM items i
    LEFT JOIN public.products p ON p.id = i.product_id
    LEFT JOIN public.categories c ON c.id = p.category_id
    WHERE i.line_total IS NOT NULL AND i.quantity IS NOT NULL AND i.cost_price IS NOT NULL
    GROUP BY c.name
  ) x CROSS JOIN quality q
)
SELECT jsonb_build_object(
  'status', CASE WHEN q.incomplete_rows > 0 THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,
  'incompleteRows', q.incomplete_rows,
  'trend', t.value,
  'topCustomers', tc.value,
  'topProducts', tp.value,
  'categories', cat.value
)
FROM quality q CROSS JOIN trend t CROSS JOIN top_customers tc CROSS JOIN top_products tp CROSS JOIN categories cat;
$$;

REVOKE ALL ON FUNCTION public.report_dashboard_secondary_truth(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_dashboard_secondary_truth(integer) TO authenticated;
