create or replace function public.get_receivables_report_page(p_page integer default 0, p_page_size integer default 25)
returns jsonb
language plpgsql
stable security definer
set search_path to 'pg_catalog'
as $function$
declare
  v_company_id uuid := public.current_company_id();
  v_currency text;
  v_page integer := greatest(coalesce(p_page, 0), 0);
  v_page_size integer := least(greatest(coalesce(p_page_size, 25), 1), 100);
  v_total_rows integer := 0;
  v_total_outstanding numeric := 0;
  v_currency_mismatch_rows integer := 0;
  v_rows jsonb := '[]'::jsonb;
begin
  if v_company_id is null then raise exception 'TENANT_REQUIRED'; end if;
  select c.currency into v_currency from public.companies c where c.id = v_company_id;
  select count(*) filter (where upper(btrim(coalesce(si.currency, ''))) <> upper(btrim(coalesce(v_currency, ''))))::integer
    into v_currency_mismatch_rows
    from public.sales_invoices si where si.company_id = v_company_id;

  select count(*)::integer,
         coalesce(sum(greatest(coalesce(si.total, 0) - coalesce(si.paid_amount, 0), 0)), 0)
    into v_total_rows, v_total_outstanding
    from public.sales_invoices si
   where si.company_id = v_company_id
     and coalesce(si.total, 0) > coalesce(si.paid_amount, 0)
     and coalesce(si.status, 'confirmed') <> 'cancelled';

  if v_currency_mismatch_rows = 0 then
    select coalesce(jsonb_agg(to_jsonb(q) order by q.invoice_date desc, q.id asc), '[]'::jsonb)
      into v_rows
      from (
        select si.id, si.invoice_number, si.invoice_date, si.due_date, si.total, si.paid_amount,
               greatest(coalesce(si.total, 0) - coalesce(si.paid_amount, 0), 0) as balance,
               si.status, jsonb_build_object('id', c.id, 'name', c.name) as customer
          from public.sales_invoices si
          left join public.customers c on c.id = si.customer_id and c.company_id = v_company_id
         where si.company_id = v_company_id
           and coalesce(si.total, 0) > coalesce(si.paid_amount, 0)
           and coalesce(si.status, 'confirmed') <> 'cancelled'
         order by si.invoice_date desc, si.id asc
         offset v_page * v_page_size limit v_page_size
      ) q;
  end if;

  return jsonb_build_object(
    'status', case when v_currency_mismatch_rows > 0 then 'INSUFFICIENT_DATA' when v_total_rows = 0 then 'NO_DATA' else 'CALCULATED' end,
    'currency', v_currency,
    'currency_status', case when v_currency is not null and v_currency_mismatch_rows = 0 then 'CONSISTENT' else 'INSUFFICIENT_DATA' end,
    'currency_mismatch_rows', v_currency_mismatch_rows,
    'page', v_page, 'page_size', v_page_size,
    'total_rows', case when v_currency_mismatch_rows > 0 then 0 else v_total_rows end,
    'total_outstanding', case when v_currency_mismatch_rows > 0 then null else v_total_outstanding end,
    'rows', case when v_currency_mismatch_rows > 0 then '[]'::jsonb else v_rows end,
    'reasons', case when v_currency_mismatch_rows > 0 then jsonb_build_array('CURRENCY_MISMATCH') else '[]'::jsonb end
  );
end;
$function$;
revoke all on function public.get_receivables_report_page(integer,integer) from public, anon;
grant execute on function public.get_receivables_report_page(integer,integer) to authenticated;