-- Canonical dashboard dimension counts: eliminate direct browser table reads for KPI counts.
CREATE OR REPLACE FUNCTION public.get_executive_dimension_counts(p_company_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE v_company_id uuid := public.current_company_id();
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  RETURN jsonb_build_object(
    'customer_count', (SELECT count(*)::integer FROM customers WHERE company_id=v_company_id),
    'active_product_count', (SELECT count(*)::integer FROM products WHERE company_id=v_company_id AND is_active=true),
    'as_of', current_date
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_executive_dimension_counts(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_executive_dimension_counts(uuid) TO authenticated;
