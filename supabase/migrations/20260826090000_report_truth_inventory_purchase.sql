-- Canonical report-truth snapshots. Tenant authority is session-derived only.
-- Client-provided company_id is intentionally absent from these contracts.

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
  incomplete_rows bigint
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
         sum(CASE WHEN quantity IS NULL OR unit_cost IS NULL THEN 0::numeric ELSE quantity * unit_cost END) AS total_value,
         count(*) FILTER (WHERE quantity IS NULL OR unit_cost IS NULL)::bigint AS incomplete_rows
  FROM scoped
), page AS (
  SELECT * FROM scoped
  ORDER BY last_movement_date DESC NULLS LAST, id DESC
  OFFSET greatest(p_page,0) * greatest(p_page_size,1)
  LIMIT greatest(least(p_page_size,500),1)
)
SELECT page.id, page.company_id, page.warehouse_id, page.product_id,
       page.quantity, page.unit_cost, page.last_movement_date,
       CASE WHEN page.p_id IS NULL THEN NULL ELSE jsonb_build_object('id',page.p_id,'name',page.p_name,'reorder_point',page.reorder_point) END,
       CASE WHEN page.w_id IS NULL THEN NULL ELSE jsonb_build_object('id',page.w_id,'name',page.w_name) END,
       metrics.total_rows, metrics.total_value, metrics.incomplete_rows
FROM page CROSS JOIN metrics;
$$;

REVOKE ALL ON FUNCTION public.report_inventory_snapshot(integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_inventory_snapshot(integer,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.report_purchase_summary()
RETURNS TABLE(
  total_purchases numeric,
  invoice_count bigint,
  supplier_count bigint,
  average_purchase numeric,
  incomplete_rows bigint,
  status text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
WITH scoped AS (
  SELECT total, supplier_id
  FROM purchase_invoices
  WHERE company_id = public.current_company_id()
), metrics AS (
  SELECT sum(total) AS total_purchases,
         count(*)::bigint AS invoice_count,
         count(DISTINCT supplier_id)::bigint AS supplier_count,
         count(*) FILTER (WHERE total IS NULL)::bigint AS incomplete_rows
  FROM scoped
)
SELECT total_purchases,
       invoice_count,
       supplier_count,
       CASE WHEN invoice_count > 0 AND total_purchases IS NOT NULL THEN total_purchases / invoice_count ELSE NULL END,
       incomplete_rows,
       CASE WHEN invoice_count = 0 THEN 'INSUFFICIENT_DATA'
            WHEN incomplete_rows > 0 THEN 'INSUFFICIENT_DATA'
            ELSE 'CALCULATED' END
FROM metrics;
$$;

REVOKE ALL ON FUNCTION public.report_purchase_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_purchase_summary() TO authenticated;
