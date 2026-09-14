create or replace function public.inventory_liquidity_velocity(p_company_id uuid, p_as_of date default current_date, p_days integer default 90)
returns table(product_id uuid, sku text, product_name text, stock_qty numeric, stock_value numeric, last_sale_date date, days_since_sale integer, avg_daily_sales numeric, avg_weekly_sales numeric, avg_half_month_sales numeric, avg_monthly_sales numeric, avg_half_year_sales numeric, avg_yearly_sales numeric, estimated_days_to_clear numeric, liquidity_class text)
language plpgsql stable set search_path = public
as $$
begin
  if p_company_id is null or public.current_company_id() is null then raise exception 'TENANT_REQUIRED'; end if;
  if p_company_id <> public.current_company_id() then raise exception 'TENANT_CONTEXT_MISMATCH'; end if;
  if p_days < 1 or p_days > 3650 then raise exception 'INVALID_ANALYSIS_WINDOW'; end if;
  if p_as_of > current_date then raise exception 'INVALID_AS_OF_DATE'; end if;
  return query
  with sales as (
    select si.product_id,
           case when count(*) filter (where si.quantity is null) > 0 then null else sum(si.quantity) filter (where inv.invoice_date >= p_as_of - (greatest(p_days,1)-1)) end as qty,
           max(inv.invoice_date) as last_sale
    from sale_items si
    join sales_invoices inv on inv.id=si.invoice_id
    where inv.company_id=p_company_id and inv.invoice_date<=p_as_of and inv.status in ('confirmed','posted','paid')
    group by si.product_id
  ),
  stock as (
    select product_id,
           case when count(*) filter (where quantity is null)>0 then null else sum(quantity) end qty,
           case when count(*) filter (where quantity is null or unit_cost is null)>0 then null else sum(quantity*unit_cost) end stock_value
    from inventory_balances
    where company_id=p_company_id
    group by product_id
  ),
  base as (
    select p.id,p.sku,p.name,coalesce(st.qty,0) stock_qty,st.stock_value,s.last_sale,
           case when s.qty is null then null else s.qty/greatest(p_days,1)::numeric end daily
    from products p
    left join stock st on st.product_id=p.id
    left join sales s on s.product_id=p.id
    where p.company_id=p_company_id and p.is_active
  )
  select id,sku,name,stock_qty,stock_value,last_sale,
         case when last_sale is null then null else (p_as_of-last_sale)::integer end,
         daily,daily*7,daily*15,daily*30,daily*182.5,daily*365,
         case when daily>0 then stock_qty/daily else null end,
         case when stock_qty<=0 then 'out_of_stock'
              when daily is null or daily<=0 or last_sale is null then 'frozen'
              when stock_qty/daily>180 then 'frozen'
              when stock_qty/daily>30 then 'slow'
              else 'moving' end
  from base order by id;
end;
$$;
