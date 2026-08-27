-- Inventory Intelligence truth hardening.
-- Preserve the existing function signature while fixing two data-truth defects:
-- 1) products with no balance must not disappear from the snapshot;
-- 2) multiple group memberships must not multiply product rows.
-- The caller never supplies tenant identity; current_company_id() remains authoritative.

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
WITH params AS (
  SELECT p_as_of AS as_of_date,
         LEAST(GREATEST(COALESCE(p_days, 180), 1), 3650) AS days
),
tenant AS (
  SELECT public.current_company_id() AS company_id
),
sales AS (
  SELECT si.product_id,
         SUM(si.quantity) AS total_quantity
  FROM sale_items si
  JOIN sales_invoices inv ON inv.id = si.invoice_id
  CROSS JOIN tenant t
  CROSS JOIN params p
  WHERE inv.company_id = t.company_id
    AND inv.invoice_date >= p.as_of_date - p.days
    AND inv.invoice_date <= p.as_of_date
    AND inv.status IN ('confirmed', 'posted', 'paid')
  GROUP BY si.product_id
),
stock AS (
  SELECT ib.product_id,
         SUM(ib.quantity) AS stock_units
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
  SELECT m.sku,
         CASE
           WHEN COUNT(DISTINCT m.group_id) = 1 THEN MIN(m.group_id)
           ELSE NULL
         END AS group_id
  FROM alternative_item_group_members m
  CROSS JOIN tenant t
  WHERE m.company_id = t.company_id
    AND m.group_id IS NOT NULL
  GROUP BY m.sku
)
SELECT p.id,
       p.sku,
       p.name,
       s.stock_units,
       sales.total_quantity,
       CASE
         WHEN sales.total_quantity IS NULL THEN NULL
         ELSE sales.total_quantity / params.days::numeric
       END AS daily_demand,
       g.group_id
FROM products_for_tenant p
CROSS JOIN params
LEFT JOIN stock s ON s.product_id = p.id
LEFT JOIN sales ON sales.product_id = p.id
LEFT JOIN groups g ON g.sku = p.sku;
$$;

REVOKE ALL ON FUNCTION public.inventory_intelligence_snapshot(date, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inventory_intelligence_snapshot(date, integer) TO authenticated;

COMMENT ON FUNCTION public.inventory_intelligence_snapshot(date, integer) IS
  'Tenant-authoritative Inventory Intelligence source. Products without stock remain visible with NULL stock; ambiguous multi-group membership remains NULL. Tenant is derived from current_company_id().';
