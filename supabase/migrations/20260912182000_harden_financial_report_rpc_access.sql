-- Financial read RPCs remain SECURITY DEFINER because they read tenant-protected
-- tables through the canonical company context. Restrict execution to roles that
-- legitimately need the underlying financial data; do not revoke application access blindly.

CREATE OR REPLACE FUNCTION public.get_cash_account_balances()
RETURNS SETOF public.cash_accounts
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT ca.*
  FROM public.cash_accounts ca
  WHERE ca.company_id = public.current_company_id()
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = public.current_company_id()
        AND cm.user_id = auth.uid()
        AND cm.is_active = true
        AND cm.role IN ('owner','admin','accountant')
    )
  ORDER BY ca.name;
$function$;

CREATE OR REPLACE FUNCTION public.get_receivables_report_page(
  p_page integer DEFAULT 0,
  p_page_size integer DEFAULT 25
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
  if not exists (
    select 1 from public.company_memberships cm
    where cm.company_id = v_company_id
      and cm.user_id = auth.uid()
      and cm.is_active = true
      and cm.role in ('owner','admin','accountant','sales')
  ) then raise exception 'FINANCIAL_REPORT_ROLE_FORBIDDEN'; end if;

  select c.currency into v_currency from public.companies c where c.id = v_company_id;
  select count(*) filter (where upper(btrim(coalesce(si.currency, ''))) <> upper(btrim(coalesce(v_currency, ''))))::integer
    into v_currency_mismatch_rows
    from public.sales_invoices si
   where si.company_id = v_company_id;

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
        select si.id, si.invoice_number, si.invoice_date, si.due_date, si.total,
               si.paid_amount,
               greatest(coalesce(si.total, 0) - coalesce(si.paid_amount, 0), 0) as balance,
               si.status,
               jsonb_build_object('id', c.id, 'name', c.name) as customer
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
    'page', v_page,
    'page_size', v_page_size,
    'total_rows', case when v_currency_mismatch_rows > 0 then 0 else v_total_rows end,
    'total_outstanding', case when v_currency_mismatch_rows > 0 then null else v_total_outstanding end,
    'rows', case when v_currency_mismatch_rows > 0 then '[]'::jsonb else v_rows end,
    'reasons', case when v_currency_mismatch_rows > 0 then jsonb_build_array('CURRENCY_MISMATCH') else '[]'::jsonb end
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_staff_receivables()
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT coalesce(sum(greatest(coalesce(si.total,0)-coalesce(si.paid_amount,0),0)),0)::numeric
  FROM public.sales_invoices si
  WHERE si.company_id = public.current_company_id()
    AND si.status NOT IN ('cancelled','void','draft')
    AND coalesce(si.total,0) > coalesce(si.paid_amount,0)
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = public.current_company_id()
        AND cm.user_id = auth.uid()
        AND cm.is_active = true
        AND cm.role IN ('owner','admin','accountant','sales')
    );
$function$;
