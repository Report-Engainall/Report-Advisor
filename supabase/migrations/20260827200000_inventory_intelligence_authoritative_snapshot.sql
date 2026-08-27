-- Inventory Intelligence authoritative server boundary.
-- The client supplies analysis parameters only; tenant identity is derived
-- exclusively from the authenticated database context.

CREATE OR REPLACE FUNCTION public.inventory_intelligence_snapshot(
  p_as_of date DEFAULT current_date,
  p_days integer DEFAULT 180
)
RETURNS TABLE(
  product_id uuid,
  sku text,
  product_name text,
  stock_units numeric,
  net_sales_units numeric,
  daily_demand numeric,
  group_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH tenant AS (
  SELECT public.current_company_id() AS company_id
),
sales AS (
  SELECT si.product_id,
         sum(si.quantity) FILTER (
           WHERE inv.invoice_date >= p_as_of - greatest(p_days, 1)
         ) AS total_quantity
  FROM sale_items si
  JOIN sales_invoices inv ON inv.id = si.invoice_id
  CROSS JOIN tenant t
  WHERE inv.company_id = t.company_id
    AND inv.invoice_date <= p_as_of
    AND inv.status IN ('confirmed', 'posted', 'paid')
  GROUP BY si.product_id
),
stock AS (
  SELECT ib.product_id, sum(ib.quantity) AS stock_units
  FROM inventory_balances ib
  CROSS JOIN tenant t
  WHERE ib.company_id = t.company_id
  GROUP BY ib.product_id
),
products_for_tenant AS (
  SELECT p.id, p.sku, p.name
  FROM products p
  CROSS JOIN tenant t
  WHERE p.company_id = t.company_id
    AND p.is_active
),
groups AS (
  SELECT m.sku, m.group_id
  FROM alternative_item_group_members m
  CROSS JOIN tenant t
  WHERE m.company_id = t.company_id
)
SELECT p.id,
       p.sku,
       p.name,
       s.stock_units,
       sales.total_quantity,
       CASE
         WHEN sales.total_quantity IS NULL THEN NULL
         ELSE sales.total_quantity / greatest(p_days, 1)::numeric
       END AS daily_demand,
       g.group_id
FROM products_for_tenant p
JOIN stock s ON s.product_id = p.id
LEFT JOIN sales ON sales.product_id = p.id
LEFT JOIN groups g ON g.sku = p.sku;
$$;

REVOKE ALL ON FUNCTION public.inventory_intelligence_snapshot(date, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inventory_intelligence_snapshot(date, integer) TO authenticated;

COMMENT ON FUNCTION public.inventory_intelligence_snapshot(date, integer) IS
  'Tenant-authoritative Inventory Intelligence source. Tenant is derived from current_company_id(); callers cannot select another company.';
