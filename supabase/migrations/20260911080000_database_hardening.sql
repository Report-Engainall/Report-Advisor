-- Database hardening: tenant authorization, safe search paths, FK coverage, RLS init-plan caching.

create index if not exists idx_cart_items_product_id_fk on public.cart_items(product_id);
create index if not exists idx_carts_customer_id_fk on public.carts(customer_id);
create index if not exists idx_carts_user_id_fk on public.carts(user_id);
create index if not exists idx_categories_parent_company_fk on public.categories(parent_id, company_id);
create index if not exists idx_customer_credit_accounts_company_id_fk on public.customer_credit_accounts(company_id);
create index if not exists idx_customer_invitations_customer_id_fk on public.customer_invitations(customer_id);
create index if not exists idx_customer_invitations_invited_by_fk on public.customer_invitations(invited_by);
create index if not exists idx_customer_ledger_entries_company_id_fk on public.customer_ledger_entries(company_id);
create index if not exists idx_customer_price_tiers_company_id_fk on public.customer_price_tiers(company_id);
create index if not exists idx_customer_price_tiers_product_id_fk on public.customer_price_tiers(product_id);
create index if not exists idx_operational_task_proposals_converted_work_item_id_fk on public.operational_task_proposals(converted_work_item_id);
create index if not exists idx_operational_task_proposals_decision_id_fk on public.operational_task_proposals(decision_id);
create index if not exists idx_order_items_company_id_fk on public.order_items(company_id);
create index if not exists idx_order_outbox_events_order_id_fk on public.order_outbox_events(order_id);
create index if not exists idx_order_status_history_actor_id_fk on public.order_status_history(actor_id);
create index if not exists idx_order_status_history_order_id_fk on public.order_status_history(order_id);
create index if not exists idx_order_template_items_product_id_fk on public.order_template_items(product_id);
create index if not exists idx_order_templates_company_id_fk on public.order_templates(company_id);
create index if not exists idx_order_templates_created_by_fk on public.order_templates(created_by);
create index if not exists idx_order_templates_customer_id_fk on public.order_templates(customer_id);
create index if not exists idx_orders_created_by_fk on public.orders(created_by);
create index if not exists idx_orders_warehouse_id_fk on public.orders(warehouse_id);
create index if not exists idx_products_category_company_fk on public.products(category_id, company_id);
create index if not exists idx_source_analysis_snapshots_import_job_id_fk on public.source_analysis_snapshots(import_job_id);
create index if not exists idx_warehouses_branch_company_fk on public.warehouses(branch_id, company_id);

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
  if upper(coalesce(v_invoice.currency,'')) <> upper(coalesce((select p.currency from public.payments p where p.invoice_id=p_invoice_id and p.company_id=v_company limit 1),v_invoice.currency)) then
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

alter function public.get_executive_metrics(uuid,date,date) set search_path = public, pg_temp;

alter policy profiles_self_select on public.profiles
  using ((id = (select auth.uid())));
alter policy orders_customer_insert on public.orders
  with check ((customer_id = public.current_customer_id()) and (company_id = public.current_customer_company_id()) and (created_by = (select auth.uid())));
alter policy carts_self_select on public.carts
  using ((user_id = (select auth.uid())) and (customer_id = public.current_customer_id()) and (company_id = public.current_customer_company_id()));
alter policy cart_items_self_select on public.cart_items
  using (exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = (select auth.uid()) and c.customer_id = public.current_customer_id() and c.company_id = public.current_customer_company_id()));
alter policy order_status_history_staff_read on public.order_status_history
  using ((company_id = public.current_company_id()) and exists (select 1 from public.company_memberships cm where cm.company_id = order_status_history.company_id and cm.user_id = (select auth.uid()) and cm.is_active and cm.role = any (array['owner'::text,'admin'::text,'sales'::text,'warehouse'::text])));
alter policy order_outbox_staff_read on public.order_outbox_events
  using ((company_id = public.current_company_id()) and exists (select 1 from public.company_memberships cm where cm.company_id = order_outbox_events.company_id and cm.user_id = (select auth.uid()) and cm.is_active and cm.role = any (array['owner'::text,'admin'::text,'sales'::text,'warehouse'::text])));
alter policy customer_invitations_staff_select on public.customer_invitations
  using ((company_id = public.current_company_id()) and exists (select 1 from public.company_memberships cm where cm.company_id = customer_invitations.company_id and cm.user_id = (select auth.uid()) and cm.is_active and cm.role = any (array['owner'::text,'admin'::text,'sales'::text])));
