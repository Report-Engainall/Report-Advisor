-- Inventory export truth: export renderers consume the same tenant-authoritative
-- valuation semantics as the inventory report instead of recalculating value in UI.
CREATE OR REPLACE FUNCTION public.get_inventory_export_truth(p_company_id uuid)
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
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;

  SELECT jsonb_build_object(
    'status', CASE
      WHEN COUNT(*) = 0 OR COUNT(*) FILTER (WHERE ib.quantity IS NULL OR ib.unit_cost IS NULL) > 0
        THEN 'INSUFFICIENT_DATA'
      ELSE 'CALCULATED'
    END,
    'rows', COALESCE(jsonb_agg(jsonb_build_object(
      'id', ib.id,
      'product_id', ib.product_id,
      'product_name', p.name,
      'warehouse_id', ib.warehouse_id,
      'warehouse_name', w.name,
      'quantity', ib.quantity,
      'unit_cost', ib.unit_cost,
      'value', CASE WHEN ib.quantity IS NULL OR ib.unit_cost IS NULL THEN NULL ELSE ib.quantity * ib.unit_cost END,
      'value_status', CASE WHEN ib.quantity IS NULL OR ib.unit_cost IS NULL THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END
    ) ORDER BY ib.updated_at DESC), '[]'::jsonb)
  )
  INTO v_result
  FROM inventory_balances ib
  JOIN products p ON p.id = ib.product_id AND p.company_id = v_company_id
  LEFT JOIN warehouses w ON w.id = ib.warehouse_id AND w.company_id = v_company_id
  WHERE ib.company_id = v_company_id;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_inventory_export_truth(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_inventory_export_truth(uuid) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_inventory_balances_company_updated_product_warehouse
  ON inventory_balances(company_id, updated_at DESC, product_id, warehouse_id);
