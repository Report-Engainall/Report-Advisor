-- Canonical sales velocity event read boundary.
-- Only authenticated callers with matching authoritative tenant context may execute.
CREATE OR REPLACE FUNCTION public.sales_velocity_events(
  p_company_id uuid,
  p_from date DEFAULT current_date - 365,
  p_to date DEFAULT current_date
)
RETURNS TABLE(product_id uuid,event_date date,quantity numeric,net_value numeric)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path TO public
AS $$
BEGIN
  IF p_company_id IS NULL OR public.current_company_id() IS NULL THEN
    RAISE EXCEPTION 'TENANT_REQUIRED';
  END IF;
  IF p_company_id <> public.current_company_id() THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;
  IF p_from > p_to OR p_to - p_from > 3650 THEN
    RAISE EXCEPTION 'INVALID_SALES_VELOCITY_WINDOW';
  END IF;

  RETURN QUERY
  SELECT si.product_id, inv.invoice_date, si.quantity, si.line_total
  FROM sale_items si
  JOIN sales_invoices inv ON inv.id = si.invoice_id
  WHERE inv.company_id = p_company_id
    AND inv.invoice_date BETWEEN p_from AND p_to
    AND inv.status IN ('confirmed','posted','paid')
    AND si.product_id IS NOT NULL
  ORDER BY inv.invoice_date ASC, si.id ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.sales_velocity_events(uuid,date,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sales_velocity_events(uuid,date,date) TO authenticated;
