-- Reconcile repository source with the verified Staging SECURITY DEFINER surface.
-- Generated from pg_get_functiondef() on 2026-09-28 for project fnqbvfuwbdpwvhcgzksl.
-- Forward-only source parity repair; no new RPC names are introduced.
-- SECURITY DEFINER functions remain authenticated-only and service-role callable.

CREATE OR REPLACE FUNCTION public.accept_customer_invitation(p_token text)
 RETURNS customers
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_inv public.customer_invitations;v_uid uuid;v_email text;v_customer public.customers;begin v_uid:=auth.uid();if v_uid is null then raise exception 'AUTH_REQUIRED';end if;v_email:=lower(trim(coalesce(auth.jwt()->>'email','')));if length(trim(coalesce(p_token,'')))<32 then raise exception 'INVALID_INVITATION';end if;select ci.* into v_inv from public.customer_invitations ci where ci.token_hash=encode(digest(trim(p_token),'sha256'),'hex') for update;if not found or v_inv.revoked_at is not null or v_inv.accepted_at is not null or v_inv.expires_at<=now() then raise exception 'INVITATION_INVALID_OR_EXPIRED';end if;if v_email<>lower(v_inv.email) then raise exception 'INVITATION_EMAIL_MISMATCH';end if;if exists(select 1 from public.profiles p where p.id=v_uid) then raise exception 'ACCOUNT_ALREADY_LINKED';end if;select c.* into v_customer from public.customers c where c.id=v_inv.customer_id and c.company_id=v_inv.company_id for update;if not found then raise exception 'CUSTOMER_NOT_FOUND';end if;insert into public.profiles(id,organization_id,customer_id,role) values(v_uid,v_inv.company_id,v_customer.id,'customer');update public.customer_invitations set accepted_at=now() where id=v_inv.id;insert into public.audit_logs(company_id,action,entity_type,entity_id,new_value,source) values(v_inv.company_id,'customer_invitation_accepted','customer_invitation',v_inv.id,jsonb_build_object('user_id',v_uid,'customer_id',v_customer.id),'customer_activation');return v_customer;end $function$

REVOKE ALL ON FUNCTION public.accept_customer_invitation(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_customer_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_customer_invitation(text) TO service_role;

CREATE OR REPLACE FUNCTION public.convert_operational_task_proposal(p_proposal_id uuid, p_decision_id uuid, p_assignee_id uuid DEFAULT NULL::uuid, p_assignee_label text DEFAULT NULL::text, p_due_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_company uuid:=public.current_company_id(); v_user uuid:=auth.uid(); v_status text; v_existing uuid; v_role text; v_priority text; v_title text; v_reason text; v_source_type text; v_source_id uuid; v_expected_outcome text; v_evidence jsonb; v_linked_decision uuid; v_work uuid; v_recommendation uuid; v_department text; begin if v_company is null or v_user is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if; select status,converted_work_item_id,role,priority,title,reason,source_type,source_id,expected_outcome,evidence_required,decision_id into v_status,v_existing,v_role,v_priority,v_title,v_reason,v_source_type,v_source_id,v_expected_outcome,v_evidence,v_linked_decision from public.operational_task_proposals where id=p_proposal_id and company_id=v_company for update; if not found then raise exception 'TASK_PROPOSAL_NOT_FOUND_OR_FORBIDDEN'; end if; if v_existing is not null then return v_existing; end if; if v_status <> 'accepted' then raise exception 'TASK_PROPOSAL_MUST_BE_ACCEPTED'; end if; if p_decision_id is null then raise exception 'APPROVED_DECISION_REQUIRED'; end if; if v_linked_decision is not null and v_linked_decision<>p_decision_id then raise exception 'TASK_PROPOSAL_ALREADY_LINKED_TO_DIFFERENT_DECISION'; end if; if not exists(select 1 from public.business_intelligence_decisions d where d.id=p_decision_id and d.company_id=v_company and d.status='APPROVED') then raise exception 'DECISION_NOT_APPROVED'; end if; if v_source_type='recommendation' and v_source_id is not null then if not exists(select 1 from public.recommendations r where r.id=v_source_id and r.company_id=v_company and r.decision_id=p_decision_id) then raise exception 'RECOMMENDATION_NOT_LINKED_TO_DECISION'; end if; v_recommendation:=v_source_id; end if; if p_assignee_id is not null and not exists(select 1 from public.company_memberships m where m.company_id=v_company and m.user_id=p_assignee_id and m.is_active=true) then raise exception 'ASSIGNEE_NOT_ACTIVE_TENANT_MEMBER'; end if; v_department:=case v_role when 'manager' then 'management' when 'employee' then 'operations' when 'sales' then 'sales' when 'warehouse' then 'warehouse' when 'accountant' then 'accounting' when 'purchasing' then 'purchasing' else 'operations' end; v_work:=public.create_decision_work_item(p_decision_id,v_recommendation,v_department,p_assignee_id,p_assignee_label,v_title,v_reason||E'\n\nالنتيجة المتوقعة: '||v_expected_outcome,upper(v_priority),p_due_at,null,jsonb_build_object('task_proposal_id',p_proposal_id,'source_type',v_source_type,'source_id',v_source_id,'evidence_required',coalesce(v_evidence,'[]'::jsonb))); update public.operational_task_proposals set decision_id=p_decision_id,converted_work_item_id=v_work,status='converted',updated_at=now() where id=p_proposal_id and company_id=v_company and status='accepted' and converted_work_item_id is null; if not found then raise exception 'TASK_PROPOSAL_STATE_CHANGED'; end if; return v_work; end; $function$

REVOKE ALL ON FUNCTION public.convert_operational_task_proposal(uuid, uuid, uuid, text, timestamp with time zone) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.convert_operational_task_proposal(uuid, uuid, uuid, text, timestamp with time zone) TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_operational_task_proposal(uuid, uuid, uuid, text, timestamp with time zone) TO service_role;

CREATE OR REPLACE FUNCTION public.create_cash_account(p_branch_id uuid, p_name text, p_currency text, p_opening_balance numeric DEFAULT 0)
 RETURNS cash_accounts
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_company uuid:=public.current_company_id(); v_role text; v_row public.cash_accounts; begin if auth.uid() is null or v_company is null then raise exception using errcode='42501',message='authenticated company context required'; end if; select cm.role into v_role from public.company_memberships cm where cm.company_id=v_company and cm.user_id=auth.uid() and cm.is_active limit 1; if v_role not in ('owner','admin') then raise exception using errcode='42501',message='admin finance role required'; end if; if p_name is null or btrim(p_name)='' or length(btrim(p_name))>200 then raise exception 'invalid_cash_account_name'; end if; if p_currency is null or upper(btrim(p_currency)) !~ '^[A-Z]{3}$' then raise exception 'invalid_currency'; end if; if coalesce(p_opening_balance,0)<0 then raise exception 'invalid_opening_balance'; end if; insert into public.cash_accounts(company_id,branch_id,name,currency,opening_balance) values(v_company,p_branch_id,btrim(p_name),upper(btrim(p_currency)),coalesce(p_opening_balance,0)) returning * into v_row; return v_row; end $function$

REVOKE ALL ON FUNCTION public.create_cash_account(uuid, text, text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_cash_account(uuid, text, text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_cash_account(uuid, text, text, numeric) TO service_role;

CREATE OR REPLACE FUNCTION public.create_customer_invitation(p_customer_id uuid, p_email text, p_expires_hours integer DEFAULT 72)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_company uuid;v_token text;v_id uuid;v_expires timestamptz;v_email text;begin if auth.uid() is null then raise exception 'AUTH_REQUIRED';end if;v_company:=public.current_company_id();if v_company is null then raise exception 'COMPANY_NOT_FOUND';end if;if not exists(select 1 from public.company_memberships cm where cm.company_id=v_company and cm.user_id=auth.uid() and cm.is_active and cm.role in ('owner','admin','sales')) then raise exception 'NOT_AUTHORIZED';end if;if not exists(select 1 from public.customers c where c.id=p_customer_id and c.company_id=v_company) then raise exception 'CUSTOMER_NOT_FOUND';end if;v_email:=lower(trim(coalesce(p_email,'')));if length(v_email)<5 or length(v_email)>320 or position('@' in v_email)<=1 then raise exception 'INVALID_EMAIL';end if;if p_expires_hours is null or p_expires_hours<1 or p_expires_hours>168 then raise exception 'INVALID_EXPIRY';end if;update public.customer_invitations set revoked_at=coalesce(revoked_at,now()) where company_id=v_company and customer_id=p_customer_id and accepted_at is null and revoked_at is null;v_token:=encode(gen_random_bytes(32),'base64url');v_expires:=now()+make_interval(hours=>p_expires_hours);insert into public.customer_invitations(company_id,customer_id,email,token_hash,expires_at,invited_by) values(v_company,p_customer_id,v_email,encode(digest(v_token,'sha256'),'hex'),v_expires,auth.uid()) returning id into v_id;insert into public.audit_logs(company_id,action,entity_type,entity_id,new_value,source) values(v_company,'customer_invitation_created','customer_invitation',v_id,jsonb_build_object('customer_id',p_customer_id,'email',v_email,'expires_at',v_expires),'admin_invite');return jsonb_build_object('id',v_id,'token',v_token,'expires_at',v_expires,'email',v_email);end $function$

REVOKE ALL ON FUNCTION public.create_customer_invitation(uuid, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_customer_invitation(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_customer_invitation(uuid, text, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.create_decision_action_receipt(p_work_item_id uuid, p_idempotency_key text, p_decision_fingerprint text, p_evidence_snapshot_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_company uuid := public.current_company_id();
  v_id uuid;
  v_existing uuid;
BEGIN
  IF v_company IS NULL OR auth.uid() IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF NULLIF(trim(p_idempotency_key),'') IS NULL THEN RAISE EXCEPTION 'IDEMPOTENCY_KEY_REQUIRED'; END IF;
  IF p_evidence_snapshot_id IS NULL THEN RAISE EXCEPTION 'DECISION_ACTION_EVIDENCE_REQUIRED'; END IF;
  IF NOT (
    EXISTS(SELECT 1 FROM public.kpi_evidence_snapshots s WHERE s.id=p_evidence_snapshot_id AND s.company_id=v_company)
    OR EXISTS(SELECT 1 FROM public.business_state_snapshots s WHERE s.id=p_evidence_snapshot_id AND s.company_id=v_company)
    OR EXISTS(SELECT 1 FROM public.import_snapshots s WHERE s.id=p_evidence_snapshot_id AND s.company_id=v_company)
    OR EXISTS(SELECT 1 FROM public.operational_health_snapshots s WHERE s.id=p_evidence_snapshot_id AND s.company_id=v_company)
    OR EXISTS(SELECT 1 FROM public.source_analysis_snapshots s WHERE s.id=p_evidence_snapshot_id AND s.company_id=v_company)
  ) THEN RAISE EXCEPTION 'DECISION_ACTION_EVIDENCE_NOT_FOUND_OR_FORBIDDEN'; END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.decision_work_items w
    JOIN public.business_intelligence_decisions d ON d.id=w.decision_id AND d.company_id=w.company_id
    WHERE w.id=p_work_item_id AND w.company_id=v_company AND w.status='IN_PROGRESS'
      AND d.status='APPROVED' AND d.decision_key=p_decision_fingerprint
  ) THEN RAISE EXCEPTION 'WORK_ITEM_NOT_EXECUTABLE'; END IF;

  SELECT r.id INTO v_existing
  FROM public.decision_action_receipts r
  WHERE r.company_id=v_company AND r.idempotency_key=p_idempotency_key;
  IF v_existing IS NOT NULL THEN RETURN v_existing; END IF;

  INSERT INTO public.decision_action_receipts(
    company_id,work_item_id,idempotency_key,status,attempt,evidence_snapshot_id,decision_fingerprint
  ) VALUES(v_company,p_work_item_id,p_idempotency_key,'ACCEPTED',1,p_evidence_snapshot_id,p_decision_fingerprint)
  ON CONFLICT(company_id,idempotency_key) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    SELECT r.id INTO v_id FROM public.decision_action_receipts r
    WHERE r.company_id=v_company AND r.idempotency_key=p_idempotency_key;
  END IF;
  RETURN v_id;
END;
$function$

REVOKE ALL ON FUNCTION public.create_decision_action_receipt(uuid, text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_decision_action_receipt(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_decision_action_receipt(uuid, text, text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.create_invoice_from_order(p_order_id uuid)
 RETURNS sales_invoices
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_company uuid:=public.current_company_id(); v_role text; v_order public.orders%rowtype; v_invoice public.sales_invoices%rowtype; v_number text; begin if auth.uid() is null or v_company is null then raise exception using errcode='42501',message='authenticated staff context required'; end if; select cm.role into v_role from public.company_memberships cm where cm.company_id=v_company and cm.user_id=auth.uid() and cm.is_active limit 1; if v_role not in ('owner','admin','sales') then raise exception using errcode='42501',message='staff finance role required'; end if; select * into v_order from public.orders o where o.id=p_order_id and o.company_id=v_company for update; if not found then raise exception 'order_not_found'; end if; if v_order.status <> 'completed' then raise exception 'order_must_be_completed'; end if; select * into v_invoice from public.sales_invoices si where si.order_id=v_order.id and si.company_id=v_company limit 1; if found then return v_invoice; end if; v_number:='INV-'||v_order.order_number::text; insert into public.sales_invoices(company_id,branch_id,customer_id,invoice_number,invoice_date,due_date,status,subtotal,discount_amount,tax_amount,total,paid_amount,currency,order_id,created_at) values(v_company,null,v_order.customer_id,v_number,current_date,null,'confirmed',v_order.total,0,0,v_order.total,0,v_order.currency,v_order.id,now()) returning * into v_invoice; insert into public.audit_logs(company_id,action,entity_type,entity_id,new_value,source) values(v_company,'invoice_created','sales_invoice',v_invoice.id,jsonb_build_object('order_id',v_order.id,'invoice_number',v_number,'total',v_order.total,'currency',v_order.currency),'order_completion'); return v_invoice; end $function$

REVOKE ALL ON FUNCTION public.create_invoice_from_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_invoice_from_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_invoice_from_order(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.create_order(p_idempotency_key text, p_warehouse_id uuid, p_lines jsonb)
 RETURNS TABLE(id uuid, order_number bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_company uuid:=public.current_customer_company_id(); v_customer uuid:=public.current_customer_id(); v_order_id uuid; v_order_number bigint; v_existing public.orders%rowtype; v_line jsonb; v_product uuid; v_qty integer; v_available numeric; v_price numeric(18,2); v_currency text; v_order_currency text; v_subtotal numeric(18,2):=0; v_requested_key text:=trim(coalesce(p_idempotency_key,'')); v_line_count integer; v_existing_count integer; begin if auth.uid() is null or v_company is null or v_customer is null then raise exception using errcode='42501',message='authenticated customer context required'; end if; if length(v_requested_key)<16 or length(v_requested_key)>128 then raise exception using errcode='22023',message='invalid idempotency key'; end if; if p_warehouse_id is null or not exists(select 1 from public.warehouses w where w.id=p_warehouse_id and w.company_id=v_company and w.is_active) then raise exception using errcode='42501',message='warehouse not available'; end if; if p_lines is null or jsonb_typeof(p_lines)<>'array' then raise exception using errcode='22023',message='order lines required'; end if; v_line_count:=jsonb_array_length(p_lines); if v_line_count<1 or v_line_count>100 then raise exception using errcode='22023',message='order must contain between 1 and 100 lines'; end if; if not exists(select 1 from public.customers c where c.id=v_customer and c.company_id=v_company) then raise exception using errcode='42501',message='customer required'; end if; perform pg_advisory_xact_lock(hashtextextended(v_company::text||':'||v_requested_key,0)); select o.* into v_existing from public.orders o where o.company_id=v_company and o.idempotency_key=v_requested_key for update; if found then if v_existing.customer_id<>v_customer or v_existing.warehouse_id<>p_warehouse_id then raise exception using errcode='40001',message='idempotency key payload conflict'; end if; select count(*) into v_existing_count from public.order_items oi where oi.company_id=v_company and oi.order_id=v_existing.id; if v_existing_count<>v_line_count or exists(select 1 from jsonb_array_elements(p_lines) l where not exists(select 1 from public.order_items oi where oi.company_id=v_company and oi.order_id=v_existing.id and oi.product_id=(l->>'productId')::uuid and oi.quantity=(l->>'quantity')::numeric)) then raise exception using errcode='40001',message='idempotency key payload conflict'; end if; return query select v_existing.id,v_existing.order_number; return; end if; for v_line in select value from jsonb_array_elements(p_lines) loop begin v_product:=(v_line->>'productId')::uuid; exception when invalid_text_representation then raise exception using errcode='22023',message='invalid product id'; end; if v_product is null or v_line->>'quantity' is null or v_line->>'quantity' !~ '^[0-9]+$' then raise exception using errcode='22023',message='invalid order line'; end if; v_qty:=(v_line->>'quantity')::integer; if v_qty<1 or v_qty>10000 then raise exception using errcode='22023',message='invalid quantity'; end if; end loop; if exists(select 1 from(select value->>'productId' product_id from jsonb_array_elements(p_lines)) x group by product_id having count(*)>1) then raise exception using errcode='22023',message='duplicate product line'; end if; for v_line in select value from jsonb_array_elements(p_lines) order by value->>'productId' loop v_product:=(v_line->>'productId')::uuid; v_qty:=(v_line->>'quantity')::integer; if not exists(select 1 from public.products p where p.id=v_product and p.company_id=v_company and p.is_active) then raise exception using errcode='P0001',message='product unavailable'; end if; select cpt.unit_price,cpt.currency into v_price,v_currency from public.customer_price_tiers cpt where cpt.company_id=v_company and cpt.customer_id=v_customer and cpt.product_id=v_product and cpt.min_quantity<=v_qty order by cpt.min_quantity desc,cpt.created_at desc limit 1; if v_price is null then select p.selling_price into v_price from public.products p where p.id=v_product and p.company_id=v_company and p.is_active; v_currency:='YER'; end if; if v_price is null or v_price<0 then raise exception using errcode='P0001',message='authorized price unavailable'; end if; v_currency:=coalesce(nullif(trim(v_currency),''),'YER'); if v_order_currency is null then v_order_currency:=v_currency; elsif v_order_currency<>v_currency then raise exception using errcode='22023',message='mixed order currencies are not allowed'; end if; select ib.quantity into v_available from public.inventory_balances ib where ib.company_id=v_company and ib.warehouse_id=p_warehouse_id and ib.product_id=v_product for update; if not found or v_available<v_qty then raise exception using errcode='P0001',message='insufficient stock'; end if; v_subtotal:=v_subtotal+round(v_price*v_qty,2); end loop; insert into public.orders(company_id,customer_id,warehouse_id,status,total,currency,idempotency_key,quantity_confirmed_at,created_by) values(v_company,v_customer,p_warehouse_id,'pending',v_subtotal,coalesce(v_order_currency,'YER'),v_requested_key,now(),auth.uid()) returning orders.id,orders.order_number into v_order_id,v_order_number; for v_line in select value from jsonb_array_elements(p_lines) order by value->>'productId' loop v_product:=(v_line->>'productId')::uuid; v_qty:=(v_line->>'quantity')::integer; select cpt.unit_price into v_price from public.customer_price_tiers cpt where cpt.company_id=v_company and cpt.customer_id=v_customer and cpt.product_id=v_product and cpt.min_quantity<=v_qty order by cpt.min_quantity desc,cpt.created_at desc limit 1; if v_price is null then select p.selling_price into v_price from public.products p where p.id=v_product and p.company_id=v_company and p.is_active; end if; update public.inventory_balances ib set quantity=ib.quantity-v_qty,updated_at=now() where ib.company_id=v_company and ib.warehouse_id=p_warehouse_id and ib.product_id=v_product and ib.quantity>=v_qty; if not found then raise exception using errcode='P0001',message='inventory changed; retry order'; end if; insert into public.inventory_movements(company_id,warehouse_id,product_id,movement_type,quantity,reference_type,reference_id,movement_date,notes) values(v_company,p_warehouse_id,v_product,'sale',v_qty,'order',v_order_id,current_date,'B2B order checkout'); insert into public.order_items(order_id,company_id,product_id,quantity,unit,unit_price,line_total) select v_order_id,v_company,v_product,v_qty,p.unit,v_price,round(v_price*v_qty,2) from public.products p where p.id=v_product and p.company_id=v_company; end loop; insert into public.order_status_history(company_id,order_id,from_status,to_status,actor_id) values(v_company,v_order_id,null,'pending',auth.uid()); insert into public.order_outbox_events(company_id,order_id,event_type,payload) values(v_company,v_order_id,'order.created',jsonb_build_object('order_id',v_order_id,'order_number',v_order_number)); insert into public.audit_logs(company_id,action,entity_type,entity_id,new_value,source) values(v_company,'order_created','order',v_order_id,jsonb_build_object('order_number',v_order_number,'customer_id',v_customer,'warehouse_id',p_warehouse_id,'total',v_subtotal),'b2b_checkout'); return query select v_order_id,v_order_number; end; $function$

REVOKE ALL ON FUNCTION public.create_order(text, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order(text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(text, uuid, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.finalize_runtime_decision(p_decision_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_company uuid:=public.current_company_id();
  v_user uuid:=auth.uid();
  v_decision_key text;
begin
  if v_company is null or v_user is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if not exists (
    select 1 from public.company_memberships cm
    where cm.company_id=v_company and cm.user_id=v_user and cm.is_active
      and cm.role in ('owner','admin')
  ) then raise exception 'FINALIZE_ROLE_FORBIDDEN'; end if;
  select d.decision_key into v_decision_key
  from public.business_intelligence_decisions d
  where d.id=p_decision_id and d.company_id=v_company and d.status='APPROVED' for update;
  if v_decision_key is null then raise exception 'DECISION_NOT_FINALIZABLE'; end if;
  if not exists(select 1 from public.decision_work_items w where w.company_id=v_company and w.decision_id=p_decision_id) then raise exception 'DECISION_WORK_ITEMS_REQUIRED'; end if;
  if exists(select 1 from public.decision_work_items w where w.company_id=v_company and w.decision_id=p_decision_id and w.status<>'COMPLETED') then raise exception 'DECISION_WORK_ITEMS_INCOMPLETE'; end if;
  if not exists(select 1 from public.decision_outcomes o where o.company_id=v_company and o.decision_fingerprint=v_decision_key) then raise exception 'DECISION_OUTCOME_REQUIRED'; end if;
  update public.business_intelligence_decisions set status='EXECUTED',executed_at=now()
  where id=p_decision_id and company_id=v_company and status='APPROVED';
  if not found then raise exception 'DECISION_STATE_CHANGED'; end if;
  return true;
end;
$function$

REVOKE ALL ON FUNCTION public.finalize_runtime_decision(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finalize_runtime_decision(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_runtime_decision(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.record_payment(p_invoice_id uuid, p_amount numeric, p_method text DEFAULT 'cash'::text, p_cash_account_id uuid DEFAULT NULL::uuid, p_reference text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_company uuid:=public.current_company_id(); v_role text; v_invoice public.sales_invoices%rowtype; v_account public.cash_accounts%rowtype; v_paid numeric; v_remaining numeric; v_new_paid numeric; v_status text; v_payment_id uuid; begin if auth.uid() is null or v_company is null then raise exception using errcode='42501',message='authenticated company context required'; end if; select cm.role into v_role from public.company_memberships cm where cm.company_id=v_company and cm.user_id=auth.uid() and cm.is_active limit 1; if v_role not in ('owner','admin','sales') then raise exception using errcode='42501',message='staff finance role required'; end if; if p_amount is null or p_amount<=0 then raise exception 'invalid_payment_amount'; end if; select * into v_invoice from public.sales_invoices where id=p_invoice_id and company_id=v_company for update; if not found then raise exception 'invoice_not_found'; end if; if v_invoice.status in ('void','cancelled','draft') then raise exception 'invoice_not_payable'; end if; v_paid:=coalesce(v_invoice.paid_amount,0); v_remaining:=greatest(coalesce(v_invoice.total,0)-v_paid,0); if p_amount>v_remaining then raise exception 'payment_exceeds_balance'; end if; if upper(coalesce(p_method,'CASH'))='CASH' then if p_cash_account_id is null then raise exception 'cash_account_required'; end if; select * into v_account from public.cash_accounts where id=p_cash_account_id and company_id=v_company for update; if not found then raise exception 'cash_account_not_found'; end if; if v_account.currency<>v_invoice.currency then raise exception 'payment_currency_mismatch'; end if; update public.cash_accounts set received=received+p_amount,updated_at=now() where id=v_account.id; end if; insert into public.payments(company_id,direction,customer_id,invoice_id,amount,payment_date,method,reference,currency) values(v_company,'in',v_invoice.customer_id,v_invoice.id,p_amount,current_date,lower(coalesce(p_method,'cash')),nullif(btrim(p_reference),''),v_invoice.currency) returning id into v_payment_id; v_new_paid:=v_paid+p_amount; v_status:=case when v_new_paid>=coalesce(v_invoice.total,0) then 'paid' else 'partially_paid' end; update public.sales_invoices set paid_amount=v_new_paid,status=v_status where id=v_invoice.id; insert into public.audit_logs(company_id,action,entity_type,entity_id,new_value,source) values(v_company,'payment_recorded','payment',v_payment_id,jsonb_build_object('invoice_id',v_invoice.id,'amount',p_amount,'new_paid_amount',v_new_paid,'status',v_status),'finance'); return jsonb_build_object('payment_id',v_payment_id,'invoice_id',v_invoice.id,'paid_amount',v_new_paid,'remaining_balance',greatest(v_invoice.total-v_new_paid,0),'status',v_status); end $function$

REVOKE ALL ON FUNCTION public.record_payment(uuid, numeric, text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_payment(uuid, numeric, text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_payment(uuid, numeric, text, uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.record_payment(p_invoice_id uuid, p_amount numeric, p_method text, p_cash_account_id uuid DEFAULT NULL::uuid, p_reference text DEFAULT NULL::text, p_idempotency_key text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_company uuid:=public.current_company_id(); v_role text; v_invoice public.sales_invoices%rowtype; v_account public.cash_accounts%rowtype; v_paid numeric; v_remaining numeric; v_new_paid numeric; v_status text; v_payment_id uuid; v_existing public.payments%rowtype; v_key text:=nullif(pg_catalog.btrim(p_idempotency_key),''); v_reference text:=nullif(pg_catalog.btrim(p_reference),''); v_method text:=lower(nullif(pg_catalog.btrim(coalesce(p_method,'cash')),'')); v_payload_hash text;
begin
  if auth.uid() is null or v_company is null then raise exception using errcode='42501',message='authenticated company context required'; end if;
  select cm.role into v_role from public.company_memberships cm where cm.company_id=v_company and cm.user_id=auth.uid() and cm.is_active limit 1;
  if v_role not in ('owner','admin','sales') then raise exception using errcode='42501',message='staff finance role required'; end if;
  if v_key is null or pg_catalog.length(v_key)>128 then raise exception using errcode='22023',message='payment idempotency key required'; end if;
  if v_method not in ('cash','bank_transfer','card','other') then raise exception using errcode='22023',message='invalid payment method'; end if;
  if p_amount is null or p_amount<=0 or p_amount::text in ('NaN','Infinity','-Infinity') then raise exception using errcode='22023',message='invalid_payment_amount'; end if;
  if p_invoice_id is null then raise exception using errcode='22023',message='invoice id required'; end if;
  v_payload_hash:=pg_catalog.md5(pg_catalog.jsonb_build_object('invoice_id',p_invoice_id,'amount',p_amount,'method',v_method,'cash_account_id',p_cash_account_id,'reference',v_reference)::text);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_company::text||':'||v_key,0));
  select * into v_existing from public.payments p where p.company_id=v_company and p.idempotency_key=v_key limit 1;
  if found then
    if v_existing.idempotency_payload_hash is distinct from v_payload_hash then raise exception using errcode='23505',message='payment idempotency key is bound to a different payload'; end if;
    return pg_catalog.jsonb_build_object('payment_id',v_existing.id,'invoice_id',v_existing.invoice_id,'idempotent_replay',true);
  end if;
  select * into v_invoice from public.sales_invoices where id=p_invoice_id and company_id=v_company for update;
  if not found then raise exception 'invoice_not_found'; end if;
  if v_invoice.status in ('void','cancelled','draft') then raise exception 'invoice_not_payable'; end if;
  v_paid:=coalesce(v_invoice.paid_amount,0); v_remaining:=greatest(coalesce(v_invoice.total,0)-v_paid,0);
  if p_amount>v_remaining then raise exception 'payment_exceeds_balance'; end if;
  if v_method='cash' then
    if p_cash_account_id is null then raise exception 'cash_account_required'; end if;
    select * into v_account from public.cash_accounts where id=p_cash_account_id and company_id=v_company for update;
    if not found then raise exception 'cash_account_not_found'; end if;
    if v_account.currency<>v_invoice.currency then raise exception 'payment_currency_mismatch'; end if;
    update public.cash_accounts set received=received+p_amount,updated_at=now() where id=v_account.id;
  elsif p_cash_account_id is not null then raise exception 'cash_account_not_allowed_for_non_cash_payment'; end if;
  insert into public.payments(company_id,direction,customer_id,invoice_id,amount,payment_date,method,reference,currency,idempotency_key,idempotency_payload_hash)
  values(v_company,'in',v_invoice.customer_id,v_invoice.id,p_amount,current_date,v_method,v_reference,v_invoice.currency,v_key,v_payload_hash) returning id into v_payment_id;
  v_new_paid:=v_paid+p_amount; v_status:=case when v_new_paid>=coalesce(v_invoice.total,0) then 'paid' else 'partially_paid' end;
  update public.sales_invoices set paid_amount=v_new_paid,status=v_status where id=v_invoice.id;
  insert into public.audit_logs(company_id,action,entity_type,entity_id,new_value,source) values(v_company,'payment_recorded','payment',v_payment_id,pg_catalog.jsonb_build_object('invoice_id',v_invoice.id,'amount',p_amount,'new_paid_amount',v_new_paid,'status',v_status),'finance');
  return pg_catalog.jsonb_build_object('payment_id',v_payment_id,'invoice_id',v_invoice.id,'paid_amount',v_new_paid,'remaining_balance',greatest(v_invoice.total-v_new_paid,0),'status',v_status,'idempotent_replay',false);
exception when unique_violation then
  select * into v_existing from public.payments p where p.company_id=v_company and p.idempotency_key=v_key limit 1;
  if found and v_existing.idempotency_payload_hash=v_payload_hash then return pg_catalog.jsonb_build_object('payment_id',v_existing.id,'invoice_id',v_existing.invoice_id,'idempotent_replay',true); end if;
  raise;
end;
$function$

REVOKE ALL ON FUNCTION public.record_payment(uuid, numeric, text, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_payment(uuid, numeric, text, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_payment(uuid, numeric, text, uuid, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.record_sales_payment(p_invoice_id uuid, p_amount numeric, p_method text DEFAULT NULL::text, p_reference text DEFAULT NULL::text, p_payment_date date DEFAULT CURRENT_DATE)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$

REVOKE ALL ON FUNCTION public.record_sales_payment(uuid, numeric, text, text, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_sales_payment(uuid, numeric, text, text, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_sales_payment(uuid, numeric, text, text, date) TO service_role;

CREATE OR REPLACE FUNCTION public.revoke_customer_invitation(p_invitation_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_company uuid;v_updated integer;begin if auth.uid() is null then raise exception 'AUTH_REQUIRED';end if;v_company:=public.current_company_id();if not exists(select 1 from public.company_memberships cm where cm.company_id=v_company and cm.user_id=auth.uid() and cm.is_active and cm.role in ('owner','admin')) then raise exception 'NOT_AUTHORIZED';end if;update public.customer_invitations set revoked_at=now() where id=p_invitation_id and company_id=v_company and accepted_at is null and revoked_at is null;get diagnostics v_updated=row_count;if v_updated=1 then insert into public.audit_logs(company_id,action,entity_type,entity_id,source) values(v_company,'customer_invitation_revoked','customer_invitation',p_invitation_id,'admin_invite');end if;return v_updated=1;end $function$

REVOKE ALL ON FUNCTION public.revoke_customer_invitation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_customer_invitation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_customer_invitation(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.transition_order(p_order_id uuid, p_to_status text)
 RETURNS orders
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_company uuid:=public.current_company_id(); v_role text; v_order public.orders%rowtype; v_previous_status text; v_item record; v_allowed boolean:=false; v_invoice public.sales_invoices%rowtype; begin if auth.uid() is null or v_company is null then raise exception using errcode='42501',message='authenticated staff context required'; end if; select cm.role into v_role from public.company_memberships cm where cm.company_id=v_company and cm.user_id=auth.uid() and cm.is_active limit 1; if v_role is null or v_role not in ('owner','admin','sales','warehouse') then raise exception using errcode='42501',message='staff membership required'; end if; select o.* into v_order from public.orders o where o.id=p_order_id and o.company_id=v_company for update; if not found then raise exception using errcode='P0002',message='order not found'; end if; if p_to_status not in ('pending','confirmed','preparing','ready','completed','cancelled') then raise exception using errcode='22023',message='invalid order status'; end if; v_previous_status:=v_order.status; v_allowed:=(v_previous_status='pending' and p_to_status in ('confirmed','cancelled') and v_role in ('owner','admin','sales')) or (v_previous_status='confirmed' and p_to_status in ('preparing','cancelled') and v_role in ('owner','admin','warehouse')) or (v_previous_status='preparing' and p_to_status in ('ready','cancelled') and v_role in ('owner','admin','warehouse')) or (v_previous_status='ready' and p_to_status='completed' and v_role in ('owner','admin','warehouse','sales')); if not v_allowed then raise exception using errcode='42501',message='order transition not allowed'; end if; if p_to_status='cancelled' and v_previous_status<>'cancelled' then for v_item in select oi.product_id,oi.quantity from public.order_items oi where oi.company_id=v_company and oi.order_id=v_order.id order by oi.product_id loop update public.inventory_balances ib set quantity=ib.quantity+v_item.quantity,updated_at=now() where ib.company_id=v_company and ib.warehouse_id=v_order.warehouse_id and ib.product_id=v_item.product_id; if not found then raise exception using errcode='P0001',message='inventory balance missing while cancelling order'; end if; insert into public.inventory_movements(company_id,warehouse_id,product_id,movement_type,quantity,reference_type,reference_id,movement_date,notes) values(v_company,v_order.warehouse_id,v_item.product_id,'return',v_item.quantity,'order',v_order.id,current_date,'Order cancellation stock restoration'); end loop; end if; update public.orders set status=p_to_status,updated_at=now() where id=v_order.id returning * into v_order; insert into public.order_status_history(company_id,order_id,from_status,to_status,actor_id) values(v_company,v_order.id,v_previous_status,p_to_status,auth.uid()); insert into public.order_outbox_events(company_id,order_id,event_type,payload) values(v_company,v_order.id,'order.status_changed',jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'from_status',v_previous_status,'to_status',p_to_status)); insert into public.audit_logs(company_id,action,entity_type,entity_id,old_value,new_value,source) values(v_company,'order_status_changed','order',v_order.id,jsonb_build_object('status',v_previous_status),jsonb_build_object('status',p_to_status),'order_workflow'); if p_to_status='completed' then select * into v_invoice from public.sales_invoices where company_id=v_company and order_id=v_order.id limit 1; if not found then insert into public.sales_invoices(company_id,branch_id,customer_id,invoice_number,invoice_date,due_date,status,subtotal,discount_amount,tax_amount,total,paid_amount,currency,order_id,created_at) values(v_company,null,v_order.customer_id,'INV-'||v_order.order_number::text,current_date,null,'confirmed',v_order.total,0,0,v_order.total,0,v_order.currency,v_order.id,now()) returning * into v_invoice; insert into public.audit_logs(company_id,action,entity_type,entity_id,new_value,source) values(v_company,'invoice_created','sales_invoice',v_invoice.id,jsonb_build_object('order_id',v_order.id,'invoice_number',v_invoice.invoice_number,'total',v_order.total,'currency',v_order.currency),'order_completion'); end if; end if; return v_order; end $function$

REVOKE ALL ON FUNCTION public.transition_order(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transition_order(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transition_order(uuid, text) TO service_role;

