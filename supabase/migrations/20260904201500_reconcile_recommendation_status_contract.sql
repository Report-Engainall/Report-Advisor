-- Reconcile the authenticated Recommendations UI contract with the canonical
-- database status vocabulary and enforce legal recommendation transitions.

create or replace function public.update_recommendation_status(
  p_recommendation_id uuid,
  p_status text
) returns void
language plpgsql
security definer
set search_path='pg_catalog'
as $function$
declare
  v_company_id uuid:=public.current_company_id();
  v_user uuid:=auth.uid();
  v_requested text:=lower(trim(coalesce(p_status,'')));
  v_next text;
  v_current text;
  v_decision uuid;
begin
  if v_company_id is null or v_user is null then
    raise exception 'TENANT_CONTEXT_REQUIRED';
  end if;

  v_next:=case v_requested
    when 'new' then 'new'
    when 'open' then 'OPEN'
    when 'accepted' then 'approved'
    when 'approved' then 'approved'
    when 'in_progress' then 'in_progress'
    when 'done' then 'completed'
    when 'completed' then 'completed'
    when 'rejected' then 'rejected'
    when 'dismissed' then 'dismissed'
    else null
  end;

  if v_next is null then
    raise exception 'INVALID_RECOMMENDATION_STATUS';
  end if;

  select r.status,r.decision_id
    into v_current,v_decision
    from public.recommendations r
   where r.id=p_recommendation_id
     and r.company_id=v_company_id
   for update;

  if not found then
    raise exception 'RECOMMENDATION_NOT_FOUND_OR_FORBIDDEN';
  end if;

  if v_current in ('approved','in_progress','completed','rejected','dismissed')
     and v_next<>v_current then
    raise exception 'RECOMMENDATION_TERMINAL_OR_STATE_LOCKED';
  end if;

  if v_next='OPEN' and v_current not in ('new','OPEN') then
    raise exception 'RECOMMENDATION_INVALID_TRANSITION';
  end if;

  if v_next in ('rejected','dismissed') and v_current not in ('new','OPEN') then
    raise exception 'RECOMMENDATION_INVALID_TRANSITION';
  end if;

  if v_next='approved' then
    if v_current not in ('OPEN','approved') then
      raise exception 'RECOMMENDATION_APPROVAL_REQUIRES_OPEN';
    end if;
    if v_decision is null or not exists (
      select 1 from public.business_intelligence_decisions d
       where d.id=v_decision
         and d.company_id=v_company_id
         and d.status='APPROVED'
    ) then
      raise exception 'RECOMMENDATION_APPROVAL_REQUIRES_APPROVED_DECISION';
    end if;
  end if;

  if v_next='in_progress' then
    if v_current<>'approved' then
      raise exception 'RECOMMENDATION_WORK_REQUIRES_APPROVED';
    end if;
    if not exists (
      select 1 from public.decision_work_items w
       where w.company_id=v_company_id
         and w.recommendation_id=p_recommendation_id
         and w.status='IN_PROGRESS'
    ) then
      raise exception 'RECOMMENDATION_WORK_NOT_IN_PROGRESS';
    end if;
  end if;

  if v_next='completed' then
    if v_current<>'in_progress' then
      raise exception 'RECOMMENDATION_COMPLETION_REQUIRES_IN_PROGRESS';
    end if;
    if not exists (
      select 1 from public.decision_work_items w
       where w.company_id=v_company_id
         and w.recommendation_id=p_recommendation_id
         and w.status='COMPLETED'
    ) then
      raise exception 'RECOMMENDATION_WORK_NOT_COMPLETED';
    end if;
  end if;

  update public.recommendations
     set status=v_next
   where id=p_recommendation_id
     and company_id=v_company_id;

  if not found then
    raise exception 'RECOMMENDATION_STATE_CHANGED';
  end if;
end;
$function$;

grant execute on function public.update_recommendation_status(uuid,text) to authenticated;
revoke execute on function public.update_recommendation_status(uuid,text) from anon;
