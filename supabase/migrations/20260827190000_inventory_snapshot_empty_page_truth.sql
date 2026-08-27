DROP FUNCTION IF EXISTS public.report_inventory_snapshot(integer, integer);

CREATE OR REPLACE FUNCTION public.report_inventory_snapshot(
  p_page integer DEFAULT 0,
  p_page_size integer DEFAULT 25
)
RETURNS TABLE(
  id uuid,
  company_id uuid,
  warehouse_id uuid,
  product_id uuid,
  quantity numeric,
  unit_cost numeric,
  last_movement_date timestamptz,
  product jsonb,
  warehouse jsonb,
  total_rows bigint,
  total_value numeric,
  incomplete_rows bigint,
  low_stock_rows bigint,
  out_of_stock_rows bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
WITH scoped AS (
  SELECT ib.id, ib.company_id, ib.warehouse_id, ib.product_id,
         ib.quantity, ib.unit_cost, ib.last_movement_date,
         p.id AS p_id, p.name AS p_name, p.reorder_point,
         w.id AS w_id, w.name AS w_name
  FROM inventory_balances ib
  LEFT JOIN products p ON p.id = ib.product_id
  LEFT JOIN warehouses w ON w.id = ib.warehouse_id
  WHERE ib.company_id = public.current_company_id()
), metrics AS (
  SELECT count(*)::bigint AS total_rows,
         sum(CASE WHEN quantity IS NULL OR unit_cost IS NULL THEN NULL::numeric ELSE quantity * unit_cost END) AS total_value,
         count(*) FILTER (WHERE quantity IS NULL OR unit_cost IS NULL)::bigint AS incomplete_rows,
         count(*) FILTER (WHERE quantity IS NOT NULL AND reorder_point IS NOT NULL AND quantity <= reorder_point)::bigint AS low_stock_rows,
         count(*) FILTER (WHERE quantity IS NOT NULL AND quantity <= 0)::bigint AS out_of_stock_rows
  FROM scoped
), page AS (
  SELECT * FROM scoped
  ORDER BY last_movement_date DESC NULLS LAST, id DESC
  OFFSET greatest(p_page,0) * greatest(p_page_size,1)
  LIMIT greatest(least(p_page_size,500),1)
), page_rows AS (
  SELECT page.id, page.company_id, page.warehouse_id, page.product_id,
         page.quantity, page.unit_cost, page.last_movement_date,
         CASE WHEN page.p_id IS NULL THEN NULL ELSE jsonb_build_object('id',page.p_id,'name',page.p_name,'reorder_point',page.reorder_point) END AS product,
         CASE WHEN page.w_id IS NULL THEN NULL ELSE jsonb_build_object('id',page.w_id,'name',page.w_name) END AS warehouse
  FROM page
)
SELECT page_rows.id, page_rows.company_id, page_rows.warehouse_id, page_rows.product_id,
       page_rows.quantity, page_rows.unit_cost, page_rows.last_movement_date,
       page_rows.product, page_rows.warehouse,
       metrics.total_rows, metrics.total_value, metrics.incomplete_rows,
       metrics.low_stock_rows, metrics.out_of_stock_rows
FROM page_rows CROSS JOIN metrics
UNION ALL
SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
       metrics.total_rows, metrics.total_value, metrics.incomplete_rows,
       metrics.low_stock_rows, metrics.out_of_stock_rows
FROM metrics
WHERE NOT EXISTS (SELECT 1 FROM page_rows);
$$;

REVOKE ALL ON FUNCTION public.report_inventory_snapshot(integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_inventory_snapshot(integer,integer) TO authenticated;
