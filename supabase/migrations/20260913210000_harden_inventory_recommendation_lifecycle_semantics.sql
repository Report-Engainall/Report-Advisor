create or replace function public.inventory_liquidity_velocity(p_company_id uuid, p_as_of date default current_date, p_days integer default 90)
returns table(product_id uuid, sku text, product_name text, stock_qty numeric, stock_value numeric, last_sale_date date, days_since_sale integer, avg_daily_sales numeric, avg_weekly_sales numeric, avg_half_month_sales numeric, avg_monthly_sales numeric, avg_half_year_sales numeric, avg_yearly_sales numeric, estimated_days_to_clear numeric, liquidity_class text)
language plpgsql stable set search_path to 'public' as $function$
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
    select p.id,p.sku,p.name,
           case when st.product_id is null then 0 else st.qty end stock_qty,
           st.stock_value,s.last_sale,
           case when s.qty is null then null else s.qty/greatest(p_days,1)::numeric end daily
    from products p
    left join stock st on st.product_id=p.id
    left join sales s on s.product_id=p.id
    where p.company_id=p_company_id and p.is_active
  )
  select id,sku,name,stock_qty,stock_value,last_sale,
         case when last_sale is null then null else (p_as_of-last_sale)::integer end,
         daily,daily*7,daily*15,daily*30,daily*182.5,daily*365,
         case when daily>0 and stock_qty is not null then stock_qty/daily else null end,
         case when stock_qty is null then 'insufficient_data'
              when stock_qty<=0 then 'out_of_stock'
              when daily is null or daily<=0 or last_sale is null then 'frozen'
              when stock_qty/daily>180 then 'frozen'
              when stock_qty/daily>30 then 'slow'
              else 'moving' end
  from base order by id;
end;
$function$;

create or replace function public.update_recommendation_status(p_recommendation_id uuid, p_status text)
returns void language plpgsql security definer set search_path to 'public', 'pg_catalog' as $function$
declare v_company_id uuid:=public.current_company_id(); v_user uuid:=auth.uid(); v_requested text:=lower(trim(coalesce(p_status,''))); v_next text; v_current text; v_decision uuid;
begin
  if v_company_id is null or v_user is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  v_next:=case v_requested when 'new' then 'new' when 'open' then 'OPEN' when 'accepted' then 'approved' when 'approved' then 'approved' when 'in_progress' then 'in_progress' when 'done' then 'completed' when 'completed' then 'completed' when 'rejected' then 'rejected' when 'dismissed' then 'dismissed' else null end;
  if v_next is null then raise exception 'INVALID_RECOMMENDATION_STATUS'; end if;
  select r.status,r.decision_id into v_current,v_decision from public.recommendations r where r.id=p_recommendation_id and r.company_id=v_company_id for update;
  if not found then raise exception 'RECOMMENDATION_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_current in ('completed','rejected','dismissed') and v_next<>v_current then raise exception 'RECOMMENDATION_TERMINAL_OR_STATE_LOCKED'; end if;
  if v_next='OPEN' and v_current not in ('new','OPEN') then raise exception 'RECOMMENDATION_INVALID_TRANSITION'; end if;
  if v_next='rejected' and v_current not in ('new','OPEN') then raise exception 'RECOMMENDATION_INVALID_TRANSITION'; end if;
  if v_next='dismissed' and v_current not in ('new','OPEN') then raise exception 'RECOMMENDATION_INVALID_TRANSITION'; end if;
  if v_next='approved' then
    if v_current not in ('OPEN','approved') then raise exception 'RECOMMENDATION_APPROVAL_REQUIRES_OPEN'; end if;
    if v_decision is null or not exists(select 1 from public.business_intelligence_decisions d where d.id=v_decision and d.company_id=v_company_id and d.status='APPROVED') then raise exception 'RECOMMENDATION_APPROVAL_REQUIRES_APPROVED_DECISION'; end if;
  end if;
  if v_next='in_progress' then
    if v_current<>'approved' then raise exception 'RECOMMENDATION_WORK_REQUIRES_APPROVED'; end if;
    if not exists(select 1 from public.decision_work_items w where w.company_id=v_company_id and w.recommendation_id=p_recommendation_id and w.status='IN_PROGRESS') then raise exception 'RECOMMENDATION_WORK_NOT_IN_PROGRESS'; end if;
  end if;
  if v_next='completed' then
    if v_current<>'in_progress' then raise exception 'RECOMMENDATION_COMPLETION_REQUIRES_IN_PROGRESS'; end if;
    if not exists(select 1 from public.decision_work_items w where w.company_id=v_company_id and w.recommendation_id=p_recommendation_id and w.status='COMPLETED') then raise exception 'RECOMMENDATION_WORK_NOT_COMPLETED'; end if;
  end if;
  update public.recommendations set status=v_next where id=p_recommendation_id and company_id=v_company_id;
  if not found then raise exception 'RECOMMENDATION_STATE_CHANGED'; end if;
end;
$function$;

create or replace function public.record_recommendation_outcome(p_recommendation_key text, p_observed_at timestamptz, p_expected_impact numeric default null, p_actual_impact numeric default null, p_outcome_quality numeric default null, p_status text default 'insufficient', p_decision_id uuid default null, p_evidence jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path to 'public', 'pg_catalog' as $function$
declare v_company uuid:=public.current_company_id(); v_user uuid:=auth.uid(); v_id uuid; v_recommendation_id uuid; v_recommendation_decision uuid; v_decision_id uuid; v_evidence_snapshot_id text:=nullif(btrim(coalesce(p_evidence->>'evidence_snapshot_id','')),'');
begin
  if v_company is null or v_user is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if p_recommendation_key is null or btrim(p_recommendation_key)='' or p_observed_at is null then raise exception 'OUTCOME_IDENTITY_INCOMPLETE'; end if;
  select r.id,r.decision_id into v_recommendation_id,v_recommendation_decision from public.recommendations r where r.id::text=p_recommendation_key and r.company_id=v_company;
  if v_recommendation_id is null then select d.id into v_decision_id from public.business_intelligence_decisions d where d.decision_key=p_recommendation_key and d.company_id=v_company; if v_decision_id is null then raise exception 'OUTCOME_PROVENANCE_NOT_FOUND'; end if;
  else if v_recommendation_decision is not null then v_decision_id:=v_recommendation_decision; end if; end if;
  if p_decision_id is not null then
    if not exists(select 1 from public.business_intelligence_decisions d where d.id=p_decision_id and d.company_id=v_company) then raise exception 'DECISION_NOT_FOUND_OR_FORBIDDEN'; end if;
    if v_decision_id is not null and v_decision_id<>p_decision_id then raise exception 'RECOMMENDATION_DECISION_MISMATCH'; end if;
    v_decision_id:=p_decision_id;
  end if;
  if v_decision_id is null then raise exception 'DECISION_PROVENANCE_REQUIRED'; end if;
  if not exists(select 1 from public.business_intelligence_decisions d where d.id=v_decision_id and d.company_id=v_company and d.status='APPROVED') then raise exception 'OUTCOME_DECISION_NOT_APPROVED_OR_FORBIDDEN'; end if;
  if not exists(select 1 from public.decision_work_items w where w.decision_id=v_decision_id and w.company_id=v_company and w.status='COMPLETED') then raise exception 'OUTCOME_WORK_NOT_COMPLETED'; end if;
  if v_evidence_snapshot_id is null then raise exception 'OUTCOME_EVIDENCE_REQUIRED'; end if;
  if not (exists(select 1 from public.kpi_evidence_snapshots s where s.id::text=v_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.business_state_snapshots s where s.id::text=v_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.import_snapshots s where s.id::text=v_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.operational_health_snapshots s where s.id::text=v_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.decision_action_receipts r where r.id::text=v_evidence_snapshot_id and r.company_id=v_company and r.status='SUCCEEDED')) then raise exception 'OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN'; end if;
  if p_status not in ('positive','negative','neutral','insufficient') then raise exception 'INVALID_OUTCOME_STATUS'; end if;
  if p_status in ('positive','negative','neutral') and (p_expected_impact is null or p_actual_impact is null) then raise exception 'OUTCOME_VALUES_REQUIRED_FOR_KNOWN_STATUS'; end if;
  if p_outcome_quality is not null and (p_outcome_quality<0 or p_outcome_quality>1) then raise exception 'OUTCOME_QUALITY_OUT_OF_RANGE'; end if;
  insert into public.recommendation_outcomes(company_id,recommendation_key,decision_id,observed_at,expected_impact,actual_impact,outcome_quality,status,evidence) values(v_company,p_recommendation_key,v_decision_id,p_observed_at,p_expected_impact,p_actual_impact,p_outcome_quality,p_status,coalesce(p_evidence,'{}'::jsonb)) on conflict(company_id,recommendation_key) do update set decision_id=excluded.decision_id,observed_at=excluded.observed_at,expected_impact=excluded.expected_impact,actual_impact=excluded.actual_impact,outcome_quality=excluded.outcome_quality,status=excluded.status,evidence=excluded.evidence returning id into v_id;
  return v_id;
end;
$function$;
