-- Inventory report truth: business counts/alerts and display rows are server-authoritative.
-- Tenant is derived from current_company_id(); page size is bounded and cannot define totals.
CREATE INDEX IF NOT EXISTS idx_inventory_balances_company_updated
  ON public.inventory_balances(company_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_company_active
  ON public.products(company_id, is_active);

CREATE OR REPLACE FUNCTION public.get_inventory_report_snapshot(
  p_page integer DEFAULT 0,
  p_page_size integer DEFAULT 25
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_page integer := GREATEST(COALESCE(p_page,0),0);
  v_page_size integer := LEAST(GREATEST(COALESCE(p_page_size,25),1),100);
  v_rows jsonb;
  v_result jsonb;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', ib.id,
    'quantity', ib.quantity,
    'unit_cost', ib.unit_cost,
    'product', jsonb_build_object('id', p.id, 'name', p.name, 'reorder_point', p.reorder_point),
    'warehouse', jsonb_build_object('id', w.id, 'name', w.name)
  ) ORDER BY ib.updated_at DESC), '[]'::jsonb)
  INTO v_rows
  FROM public.inventory_balances ib
  LEFT JOIN public.products p ON p.id=ib.product_id AND p.company_id=v_company_id
  LEFT JOIN public.warehouses w ON w.id=ib.warehouse_id AND w.company_id=v_company_id
  WHERE ib.company_id=v_company_id
  OFFSET v_page*v_page_size LIMIT v_page_size;

  WITH base AS (
    SELECT ib.quantity, p.reorder_point
    FROM public.inventory_balances ib
    LEFT JOIN public.products p ON p.id=ib.product_id AND p.company_id=v_company_id
    WHERE ib.company_id=v_company_id
  ), quality AS (
    SELECT count(*) FILTER (WHERE quantity IS NULL OR unit_cost IS NULL) AS unknown_rows
    FROM public.inventory_balances ib
    WHERE ib.company_id=v_company_id
  )
  SELECT jsonb_build_object(
    'rows', v_rows,
    'page', v_page,
    'pageSize', v_page_size,
    'totalRows', (SELECT count(*) FROM base),
    'lowStock', (SELECT count(*) FROM base WHERE quantity IS NOT NULL AND reorder_point IS NOT NULL AND quantity <= reorder_point),
    'outOfStock', (SELECT count(*) FROM base WHERE quantity IS NOT NULL AND quantity <= 0),
    'unknownRows', (SELECT unknown_rows FROM quality)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_inventory_report_snapshot(integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_inventory_report_snapshot(integer,integer) TO authenticated;
