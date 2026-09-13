do $$
declare
  v_def text;
begin
  select pg_get_functiondef('public.get_dashboard_snapshot(integer,date)'::regprocedure) into v_def;
  if position('activeCustomers' in v_def)=0 then
    if position('(SELECT count(*) FROM public.customers WHERE company_id=v_company_id) total_customers,(SELECT count(*) FROM public.products WHERE company_id=v_company_id) total_products' in v_def)=0 then
      raise exception 'DASHBOARD_ACTIVE_CUSTOMERS_SOURCE_ANCHOR_MISSING';
    end if;
    v_def:=replace(v_def,
      '(SELECT count(*) FROM public.customers WHERE company_id=v_company_id) total_customers,(SELECT count(*) FROM public.products WHERE company_id=v_company_id) total_products',
      '(SELECT count(*) FROM public.customers WHERE company_id=v_company_id) total_customers,(SELECT count(DISTINCT customer_id) FROM sales_base WHERE customer_id IS NOT NULL AND invoice_date>=date_trunc(''month'',p_as_of::timestamp)-((v_months-1)*interval ''1 month'')) active_customers,(SELECT count(*) FROM public.products WHERE company_id=v_company_id) total_products');
  end if;
  if position('''activeCustomers'',counts.active_customers' in v_def)=0 then
    if position('''activeCustomers'',NULL' in v_def)=0 then
      raise exception 'DASHBOARD_ACTIVE_CUSTOMERS_OUTPUT_ANCHOR_MISSING';
    end if;
    v_def:=replace(v_def,'''activeCustomers'',NULL','''activeCustomers'',counts.active_customers');
  end if;
  if position('''activeCustomers'',counts.active_customers' in v_def)=0 then raise exception 'DASHBOARD_ACTIVE_CUSTOMERS_SOURCE_FIX_FAILED'; end if;
  execute v_def;
end $$;
