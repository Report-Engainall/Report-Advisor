-- Canonical profitability truth: server-derived tenant, line-level revenue/cost,
-- explicit missing-evidence semantics, and one source for summary + category consumers.
CREATE OR REPLACE FUNCTION public.report_profitability_truth(
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL
)
RETURNS TABLE (
  category_id uuid,
  category_name text,
  revenue numeric,
  cost_of_sales numeric,
  gross_profit numeric,
  margin_pct numeric,
  quantity numeric,
  total_rows bigint,
  incomplete_rows bigint,
  currency_count bigint,
  currency text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH scoped AS (
  SELECT
    si.id AS invoice_id,
    si.invoice_date,
    si.currency,
    si.status,
    sai.product_id,
    sai.quantity,
    sai.line_total,
    sai.cost_price,
    p.category_id,
    COALESCE(c.name, 'غير مصنف') AS category_name
  FROM public.sales_invoices si
  JOIN public.sale_items sai ON sai.invoice_id = si.id
  LEFT JOIN public.products p ON p.id = sai.product_id
  LEFT JOIN public.categories c ON c.id = p.category_id
  WHERE si.company_id = public.current_company_id()
    AND lower(coalesce(si.status, '')) NOT IN ('cancelled', 'canceled', 'void')
    AND (p_from IS NULL OR si.invoice_date >= p_from)
    AND (p_to IS NULL OR si.invoice_date <= p_to)
),
quality AS (
  SELECT
    count(*)::bigint AS total_rows,
    count(*) FILTER (
      WHERE line_total IS NULL OR cost_price IS NULL OR quantity IS NULL
    )::bigint AS incomplete_rows,
    count(DISTINCT currency)::bigint AS currency_count,
    min(currency) AS currency
  FROM scoped
),
valid AS (
  SELECT *
  FROM scoped
  WHERE line_total IS NOT NULL
    AND cost_price IS NOT NULL
    AND quantity IS NOT NULL
),
cats AS (
  SELECT
    category_id,
    category_name,
    sum(line_total)::numeric AS revenue,
    sum(cost_price * quantity)::numeric AS cost_of_sales,
    sum(line_total - (cost_price * quantity))::numeric AS gross_profit,
    CASE
      WHEN sum(line_total) > 0
      THEN (sum(line_total - (cost_price * quantity)) / sum(line_total) * 100)::numeric
      ELSE NULL
    END AS margin_pct,
    sum(quantity)::numeric AS quantity
  FROM valid
  GROUP BY category_id, category_name
),
totals AS (
  SELECT
    sum(v.line_total)::numeric AS revenue,
    sum(v.cost_price * v.quantity)::numeric AS cost_of_sales,
    sum(v.line_total - (v.cost_price * v.quantity))::numeric AS gross_profit,
    CASE
      WHEN sum(v.line_total) > 0
      THEN (sum(v.line_total - (v.cost_price * v.quantity)) / sum(v.line_total) * 100)::numeric
      ELSE NULL
    END AS margin_pct,
    sum(v.quantity)::numeric AS quantity
  FROM valid v
)
SELECT
  c.category_id,
  c.category_name,
  c.revenue,
  c.cost_of_sales,
  c.gross_profit,
  c.margin_pct,
  c.quantity,
  q.total_rows,
  q.incomplete_rows,
  q.currency_count,
  q.currency,
  CASE
    WHEN q.total_rows = 0 THEN 'INSUFFICIENT_DATA'
    WHEN q.incomplete_rows > 0 THEN 'INSUFFICIENT_DATA'
    WHEN q.currency_count > 1 THEN 'INSUFFICIENT_DATA'
    WHEN t.revenue IS NULL OR t.cost_of_sales IS NULL THEN 'INSUFFICIENT_DATA'
    ELSE 'CALCULATED'
  END AS status
FROM cats c
CROSS JOIN quality q
CROSS JOIN totals t
UNION ALL
SELECT
  NULL::uuid,
  '__TOTAL__',
  t.revenue,
  t.cost_of_sales,
  t.gross_profit,
  t.margin_pct,
  t.quantity,
  q.total_rows,
  q.incomplete_rows,
  q.currency_count,
  q.currency,
  CASE
    WHEN q.total_rows = 0 THEN 'INSUFFICIENT_DATA'
    WHEN q.incomplete_rows > 0 THEN 'INSUFFICIENT_DATA'
    WHEN q.currency_count > 1 THEN 'INSUFFICIENT_DATA'
    WHEN t.revenue IS NULL OR t.cost_of_sales IS NULL THEN 'INSUFFICIENT_DATA'
    ELSE 'CALCULATED'
  END
FROM quality q
CROSS JOIN totals t;
$$;

REVOKE ALL ON FUNCTION public.report_profitability_truth(date,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_profitability_truth(date,date) TO authenticated;
