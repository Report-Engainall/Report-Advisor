-- The demand/reorder wrapper is itself an authorization-bearing RPC.
-- Resolve the session tenant explicitly here rather than relying only on its nested query.
CREATE OR REPLACE FUNCTION public.demand_reorder_snapshot(
  p_as_of date DEFAULT current_date,
  p_days integer DEFAULT 90,
  p_lead_time_days numeric DEFAULT 7,
  p_safety_days numeric DEFAULT 3
)
RETURNS TABLE(
  product_id uuid, sku text, product_name text, current_stock numeric,
  avg_daily_demand numeric, minimum_stock numeric, reorder_point numeric,
  maximum_stock numeric, stockout_date date, qty_for_day numeric, qty_for_week numeric,
  qty_for_half_month numeric, qty_for_month numeric, suggested_order_qty numeric,
  urgency text, confidence text
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company uuid := public.current_company_id();
BEGIN
  IF v_company IS NULL THEN
    RAISE EXCEPTION 'TENANT_REQUIRED';
  END IF;

  RETURN QUERY
  WITH v AS (
    SELECT * FROM public.inventory_liquidity_velocity(p_as_of, p_days)
  ), x AS (
    SELECT v.*, avg_daily_sales d, stock_qty s FROM v
  )
  SELECT product_id, sku, product_name, s, d,
         d * greatest(p_safety_days,0),
         d * greatest(p_lead_time_days+p_safety_days,0),
         d * greatest(p_lead_time_days+p_safety_days+30,0),
         CASE WHEN d > 0 THEN p_as_of + ceil(s/d)::integer ELSE NULL END,
         d, d*7, d*15, d*30,
         CASE WHEN d IS NULL OR s IS NULL THEN NULL
              ELSE greatest(0, d*(p_lead_time_days+p_safety_days+30)-s) END,
         CASE WHEN s <= 0 THEN 'critical'
              WHEN d > 0 AND s/d <= p_lead_time_days THEN 'urgent'
              WHEN d > 0 AND s/d <= p_lead_time_days+p_safety_days THEN 'high'
              ELSE 'normal' END,
         CASE WHEN d IS NULL OR d <= 0 THEN 'insufficient_history'
              WHEN p_days >= 90 THEN 'high'
              WHEN p_days >= 30 THEN 'medium'
              ELSE 'low' END
  FROM x;
END;
$$;

REVOKE ALL ON FUNCTION public.demand_reorder_snapshot(date,integer,numeric,numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.demand_reorder_snapshot(date,integer,numeric,numeric) TO authenticated;
