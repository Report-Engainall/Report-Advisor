-- Close the existing liquidity classification gap without replacing the inventory engine.
-- The original function distinguished only moving/frozen; slow-moving is a required commercial state.
-- Keep the deterministic thresholds explicit: <=90 days moving, >90 and <=180 slow, >180 frozen.

CREATE OR REPLACE FUNCTION inventory_liquidity_velocity(
  p_company_id uuid,
  p_as_of date DEFAULT current_date,
  p_days integer DEFAULT 90
)
RETURNS TABLE(
  product_id uuid,
  sku text,
  product_name text,
  stock_qty numeric,
  stock_value numeric,
  last_sale_date date,
  days_since_sale integer,
  avg_daily_sales numeric,
  avg_weekly_sales numeric,
  avg_half_month_sales numeric,
  avg_monthly_sales numeric,
  avg_half_year_sales numeric,
  avg_yearly_sales numeric,
  estimated_days_to_clear numeric,
  liquidity_class text
)
LANGUAGE sql
STABLE
AS $$
WITH sales AS (
  SELECT si.product_id,
         sum(si.quantity) FILTER (WHERE inv.invoice_date >= p_as_of - greatest(p_days,1)) AS qty,
         max(inv.invoice_date) AS last_sale
  FROM sale_items si
  JOIN sales_invoices inv ON inv.id = si.invoice_id
  WHERE inv.company_id = p_company_id
    AND inv.invoice_date <= p_as_of
    AND inv.status IN ('confirmed','posted','paid')
  GROUP BY si.product_id
), stock AS (
  SELECT product_id, sum(quantity) AS qty
  FROM inventory_balances
  WHERE company_id = p_company_id
  GROUP BY product_id
), base AS (
  SELECT p.id, p.sku, p.name, coalesce(st.qty,0) stock_qty,
         coalesce(st.qty,0) * coalesce(p.cost_price,0) stock_value,
         s.last_sale,
         coalesce(s.qty,0) / greatest(p_days,1)::numeric daily
  FROM products p
  LEFT JOIN stock st ON st.product_id = p.id
  LEFT JOIN sales s ON s.product_id = p.id
  WHERE p.company_id = p_company_id AND p.is_active
)
SELECT id, sku, name, stock_qty, stock_value, last_sale,
       CASE WHEN last_sale IS NULL THEN NULL ELSE (p_as_of-last_sale)::integer END,
       daily, daily*7, daily*15, daily*30, daily*182.5, daily*365,
       CASE WHEN daily > 0 THEN stock_qty/daily ELSE NULL END,
       CASE
         WHEN stock_qty <= 0 THEN 'out_of_stock'
         WHEN daily <= 0 OR last_sale IS NULL THEN 'frozen'
         WHEN stock_qty/daily > 180 THEN 'frozen'
         WHEN stock_qty/daily > 90 THEN 'slow'
         ELSE 'moving'
       END
FROM base;
$$;
