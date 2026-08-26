-- Wave 06: domain-level canonical aggregates for consumer truth.
-- Authority is derived from authenticated context; caller-supplied tenant identity is
-- accepted only as a compatibility assertion and can never select another tenant.

CREATE OR REPLACE FUNCTION public.get_purchase_summary(
  p_company_id uuid,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
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
    'total', COALESCE(SUM(pi.total), 0)::numeric,
    'count', COUNT(*)::integer,
    'supplier_count', COUNT(DISTINCT pi.supplier_id)::integer,
    'as_of', COALESCE(p_to, current_date)
  )
  INTO v_result
  FROM purchase_invoices pi
  WHERE pi.company_id = v_company_id
    AND pi.status NOT IN ('cancelled', 'void')
    AND (p_from IS NULL OR pi.invoice_date >= p_from)
    AND (p_to IS NULL OR pi.invoice_date <= p_to);

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_inventory_valuation(
  p_company_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_total numeric;
  v_rows integer;
  v_missing integer;
BEGIN
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;

  SELECT COUNT(*)::integer,
         COUNT(*) FILTER (WHERE ib.quantity IS NULL OR ib.unit_cost IS NULL)::integer,
         SUM(ib.quantity * ib.unit_cost)
  INTO v_rows, v_missing, v_total
  FROM inventory_balances ib
  WHERE ib.company_id = v_company_id;

  RETURN jsonb_build_object(
    'status', CASE
      WHEN v_rows = 0 THEN 'INSUFFICIENT_DATA'
      WHEN v_missing > 0 THEN 'INSUFFICIENT_DATA'
      ELSE 'CALCULATED'
    END,
    'value', CASE WHEN v_rows > 0 AND v_missing = 0 THEN v_total ELSE NULL END,
    'rows', v_rows,
    'missing_rows', v_missing
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_purchase_summary(uuid, date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_purchase_summary(uuid, date, date) TO authenticated;
REVOKE ALL ON FUNCTION public.get_inventory_valuation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_inventory_valuation(uuid) TO authenticated;
