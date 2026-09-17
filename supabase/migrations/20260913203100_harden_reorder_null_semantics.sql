create or replace function public.demand_reorder_snapshot(p_company_id uuid, p_as_of date default current_date, p_days integer default 90, p_lead_time_days numeric default 7, p_safety_days numeric default 3)
returns table(product_id uuid, sku text, product_name text, current_stock numeric, avg_daily_demand numeric, minimum_stock numeric, reorder_point numeric, maximum_stock numeric, stockout_date date, qty_for_day numeric, qty_for_week numeric, qty_for_half_month numeric, qty_for_month numeric, suggested_order_qty numeric, urgency text, confidence text)
language plpgsql stable set search_path = public
as $$
begin
  if p_company_id is null or public.current_company_id() is null then raise exception 'TENANT_REQUIRED'; end if;
  if p_company_id <> public.current_company_id() then raise exception 'TENANT_CONTEXT_MISMATCH'; end if;
  if p_days < 1 or p_days > 3650 or p_lead_time_days < 0 or p_safety_days < 0 then raise exception 'INVALID_REORDER_PARAMETERS'; end if;
  return query
  with v as (select * from public.inventory_liquidity_velocity(p_company_id,p_as_of,p_days)),
  x as (select v.*, avg_daily_sales d, stock_qty s from v)
  select product_id,sku,product_name,s,d,
         case when d is null then null else d*greatest(p_safety_days,0) end,
         case when d is null then null else d*greatest(p_lead_time_days+p_safety_days,0) end,
         case when d is null then null else d*greatest(p_lead_time_days+p_safety_days+30,0) end,
         case when d>0 and s is not null then p_as_of+ceil(s/d)::integer else null end,
         d,case when d is null then null else d*7 end,case when d is null then null else d*15 end,case when d is null then null else d*30 end,
         case when d is not null and s is not null then greatest(0,d*(p_lead_time_days+p_safety_days+30)-s) else null end,
         case when s is null or d is null then 'normal' when s<=0 then 'critical' when d>0 and s/d<=p_lead_time_days then 'urgent' when d>0 and s/d<=p_lead_time_days+p_safety_days then 'high' else 'normal' end,
         case when s is null or d is null then 'insufficient_data' when d<=0 then 'insufficient_history' when p_days>=90 then 'high' when p_days>=30 then 'medium' else 'low' end
  from x order by product_id;
end;
$$;
