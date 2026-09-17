-- Assert the existing dashboard snapshot exposes a calculated active-customer KPI.
DO $$
DECLARE
  v_definition text;
BEGIN
  SELECT pg_get_functiondef(p.oid)
    INTO v_definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.proname='get_dashboard_snapshot'
    AND pg_get_function_identity_arguments(p.oid)='p_months integer, p_as_of date';

  IF v_definition IS NULL OR position('activeCustomers' IN v_definition)=0 THEN
    RAISE EXCEPTION 'DASHBOARD_ACTIVE_CUSTOMER_KPI_MISSING';
  END IF;
END
$$;
