-- Use the canonical inventory balance valuation source instead of the mutable product cost price.
-- Preserve the existing liquidity engine and fail closed if its contract has drifted.
DO $$
DECLARE
  v_definition text;
  v_old text := 'stock AS (SELECT product_id,sum(quantity) qty FROM inventory_balances WHERE company_id=p_company_id GROUP BY product_id),base AS (SELECT p.id,p.sku,p.name,coalesce(st.qty,0) stock_qty,coalesce(st.qty,0)*coalesce(p.cost_price,0) stock_value,s.last_sale,coalesce(s.qty,0)/greatest(p_days,1)::numeric daily';
  v_new text := 'stock AS (SELECT product_id,sum(quantity) qty,CASE WHEN count(*) FILTER (WHERE quantity IS NULL OR unit_cost IS NULL)>0 THEN NULL ELSE sum(quantity*unit_cost) END stock_value FROM inventory_balances WHERE company_id=p_company_id GROUP BY product_id),base AS (SELECT p.id,p.sku,p.name,coalesce(st.qty,0) stock_qty,st.stock_value,s.last_sale,coalesce(s.qty,0)/greatest(p_days,1)::numeric daily';
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
    RAISE EXCEPTION 'INVENTORY_LIQUIDITY_VALUATION_CONTRACT_DRIFTED';
  END IF;

  v_definition := replace(v_definition,v_old,v_new);
  EXECUTE v_definition;

  SELECT pg_get_functiondef(p.oid)
    INTO v_definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.proname='inventory_liquidity_velocity'
    AND pg_get_function_identity_arguments(p.oid)='p_company_id uuid, p_as_of date, p_days integer';

  IF position('st.stock_value' IN v_definition)=0 THEN
    RAISE EXCEPTION 'INVENTORY_LIQUIDITY_VALUATION_FIX_NOT_APPLIED';
  END IF;
END
$$;
