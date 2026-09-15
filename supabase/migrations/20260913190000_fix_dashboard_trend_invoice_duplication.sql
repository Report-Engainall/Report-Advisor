-- Correct an existing dashboard trend bug without introducing a second dashboard engine.
-- The existing trend query joins invoices to line items; summing invoice subtotal in that
-- joined relation multiplies an invoice by its item count. Patch the existing function
-- definition in-place and fail closed if the expected contract has drifted.
DO $$
DECLARE
  v_definition text;
  v_old text := 'SELECT sum(s.subtotal) sales,sum(si.quantity*si.cost_price) cost,count(DISTINCT s.id) invoices FROM sales_base s LEFT JOIN sale_items_base si ON si.invoice_id=s.id WHERE s.invoice_date>=m.month_start::date AND s.invoice_date<(m.month_start+interval ''1 month'')::date AND s.subtotal IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sale_items_base bad WHERE bad.invoice_id=s.id AND (bad.quantity IS NULL OR bad.cost_price IS NULL))';
  v_new text := 'SELECT (SELECT sum(sb.subtotal) FROM sales_base sb WHERE sb.invoice_date>=m.month_start::date AND sb.invoice_date<(m.month_start+interval ''1 month'')::date AND sb.subtotal IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sale_items_base bad WHERE bad.invoice_id=sb.id AND (bad.quantity IS NULL OR bad.cost_price IS NULL))) sales,sum(si.quantity*si.cost_price) cost,count(DISTINCT s.id) invoices FROM sales_base s LEFT JOIN sale_items_base si ON si.invoice_id=s.id WHERE s.invoice_date>=m.month_start::date AND s.invoice_date<(m.month_start+interval ''1 month'')::date AND s.subtotal IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sale_items_base bad WHERE bad.invoice_id=s.id AND (bad.quantity IS NULL OR bad.cost_price IS NULL))';
BEGIN
  SELECT pg_get_functiondef(p.oid)
    INTO v_definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.proname='get_dashboard_snapshot'
    AND pg_get_function_identity_arguments(p.oid)='p_months integer, p_as_of date';

  IF v_definition IS NULL THEN
    RAISE EXCEPTION 'DASHBOARD_SNAPSHOT_FUNCTION_MISSING';
  END IF;

  IF position(v_old IN v_definition)=0 THEN
    RAISE EXCEPTION 'DASHBOARD_TREND_CONTRACT_DRIFTED';
  END IF;

  v_definition := replace(v_definition, v_old, v_new);
  EXECUTE v_definition;

  SELECT pg_get_functiondef(p.oid)
    INTO v_definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.proname='get_dashboard_snapshot'
    AND pg_get_function_identity_arguments(p.oid)='p_months integer, p_as_of date';

  IF position('SELECT sum(sb.subtotal) FROM sales_base sb' IN v_definition)=0 THEN
    RAISE EXCEPTION 'DASHBOARD_TREND_FIX_NOT_APPLIED';
  END IF;
END
$$;
