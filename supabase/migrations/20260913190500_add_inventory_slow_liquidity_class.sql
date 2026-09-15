-- Preserve the existing inventory liquidity engine while restoring the missing slow class.
-- Frozen remains >180 estimated days to clear; slow is >30 and <=180.
DO $$
DECLARE
  v_definition text;
  v_old text := 'CASE WHEN stock_qty<=0 THEN ''out_of_stock'' WHEN daily<=0 OR last_sale IS NULL THEN ''frozen'' WHEN stock_qty/daily>180 THEN ''frozen'' ELSE ''moving'' END';
  v_new text := 'CASE WHEN stock_qty<=0 THEN ''out_of_stock'' WHEN daily<=0 OR last_sale IS NULL THEN ''frozen'' WHEN stock_qty/daily>180 THEN ''frozen'' WHEN stock_qty/daily>30 THEN ''slow'' ELSE ''moving'' END';
BEGIN
  SELECT pg_get_functiondef(p.oid)
    INTO v_definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.proname='inventory_liquidity_velocity'
    AND pg_get_function_identity_arguments(p.oid)='p_company_id uuid, p_as_of date, p_days integer';

  IF v_definition IS NULL THEN
    RAISE EXCEPTION 'INVENTORY_LIQUIDITY_FUNCTION_MISSING';
  END IF;

  IF position(v_old IN v_definition)=0 THEN
    RAISE EXCEPTION 'INVENTORY_LIQUIDITY_CONTRACT_DRIFTED';
  END IF;

  v_definition := replace(v_definition, v_old, v_new);
  EXECUTE v_definition;

  SELECT pg_get_functiondef(p.oid)
    INTO v_definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.proname='inventory_liquidity_velocity'
    AND pg_get_function_identity_arguments(p.oid)='p_company_id uuid, p_as_of date, p_days integer';

  IF position('THEN ''slow''' IN v_definition)=0 THEN
    RAISE EXCEPTION 'INVENTORY_SLOW_CLASS_FIX_NOT_APPLIED';
  END IF;
END
$$;
