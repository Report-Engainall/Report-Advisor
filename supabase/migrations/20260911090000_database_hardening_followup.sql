-- Follow-up hardening: correct the legacy sales-payment currency invariant.
-- The RPC has no caller-supplied currency; the authoritative currency is the invoice.
-- Reject only if pre-existing payments for the same tenant/invoice contradict it.

create or replace function public.record_sales_payment(
  p_invoice_id uuid,
  p_amount numeric,
  p_method text default null,
  p_reference text default null,
  p_payment_date date default current_date
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_invoice public.sales_invoices%rowtype;
  v_paid numeric;
  v_remaining numeric;
  v_new_paid numeric;
  v_status text;
  v_payment_id uuid;
begin
  if v_user is null or v_company is null then
    raise exception 'TENANT_CONTEXT_REQUIRED';
  end if;
  if not exists (
    select 1 from public.company_memberships cm
    where cm.company_id = v_company
      and cm.user_id = v_user
      and cm.is_active = true
      and cm.role in ('owner','admin','sales')
  ) then
    raise exception 'forbidden';
  end if;
  select si.* into v_invoice
  from public.sales_invoices si
  where si.id = p_invoice_id and si.company_id = v_company
  for update;
  if not found then raise exception 'invoice_not_found'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'invalid_payment_amount'; end if;
  if p_payment_date > current_date then raise exception 'payment_date_in_future'; end if;
  if v_invoice.status in ('cancelled','void','draft') then raise exception 'invoice_not_payable'; end if;
  v_paid := coalesce(v_invoice.paid_amount,0);
  v_remaining := greatest(coalesce(v_invoice.total,0)-v_paid,0);
  if exists (
    select 1 from public.payments p
    where p.invoice_id = p_invoice_id
      and p.company_id = v_company
      and upper(coalesce(p.currency,'')) <> upper(coalesce(v_invoice.currency,''))
  ) then
    raise exception 'currency_mismatch';
  end if;
  if p_amount > v_remaining then raise exception 'payment_exceeds_balance'; end if;
  insert into public.payments(id,company_id,direction,customer_id,invoice_id,amount,payment_date,method,reference,currency)
  values(gen_random_uuid(),v_company,'in',v_invoice.customer_id,p_invoice_id,p_amount,p_payment_date,p_method,p_reference,v_invoice.currency)
  returning id into v_payment_id;
  v_new_paid := v_paid + p_amount;
  v_status := case when v_new_paid >= coalesce(v_invoice.total,0) then 'paid' else 'partially_paid' end;
  update public.sales_invoices set paid_amount=v_new_paid,status=v_status where id=p_invoice_id and company_id=v_company;
  return jsonb_build_object('payment_id',v_payment_id,'invoice_id',p_invoice_id,'paid_amount',v_new_paid,'remaining_balance',greatest(coalesce(v_invoice.total,0)-v_new_paid,0),'status',v_status);
end;
$$;
