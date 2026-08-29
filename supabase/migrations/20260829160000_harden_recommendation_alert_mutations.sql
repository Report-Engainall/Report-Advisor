-- Canonical mutation boundary for recommendation/alert state changes.
-- Direct authenticated UPDATE/DELETE/TRUNCATE is revoked; lifecycle writes use tenant-bound RPCs.

create or replace function public.mark_alert_read(p_alert_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_company_id uuid;
begin
  v_company_id := public.current_company_id();
  if v_company_id is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  update public.alerts set is_read = true
   where id = p_alert_id and company_id = v_company_id;
  if not found then raise exception 'ALERT_NOT_FOUND_OR_FORBIDDEN'; end if;
end;
$$;

create or replace function public.update_recommendation_status(p_recommendation_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_company_id uuid;
begin
  v_company_id := public.current_company_id();
  if v_company_id is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if p_status is null or btrim(p_status) = '' then raise exception 'RECOMMENDATION_STATUS_REQUIRED'; end if;
  if lower(p_status) not in ('new','in_progress','completed','dismissed','approved','rejected') then
    raise exception 'INVALID_RECOMMENDATION_STATUS';
  end if;
  update public.recommendations set status = lower(p_status)
   where id = p_recommendation_id and company_id = v_company_id;
  if not found then raise exception 'RECOMMENDATION_NOT_FOUND_OR_FORBIDDEN'; end if;
end;
$$;

create or replace function public.link_recommendation_to_decision(p_recommendation_id uuid, p_decision_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_company_id uuid;
begin
  v_company_id := public.current_company_id();
  if v_company_id is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if not exists (select 1 from public.recommendations where id=p_recommendation_id and company_id=v_company_id) then
    raise exception 'RECOMMENDATION_NOT_FOUND_OR_FORBIDDEN';
  end if;
  if not exists (select 1 from public.business_intelligence_decisions where id=p_decision_id and company_id=v_company_id) then
    raise exception 'DECISION_NOT_FOUND_OR_FORBIDDEN';
  end if;
  update public.recommendations set decision_id=p_decision_id where id=p_recommendation_id and company_id=v_company_id;
  update public.business_intelligence_decisions set recommendation_id=p_recommendation_id where id=p_decision_id and company_id=v_company_id;
end;
$$;

revoke all on function public.mark_alert_read(uuid) from public, anon;
grant execute on function public.mark_alert_read(uuid) to authenticated;
revoke all on function public.update_recommendation_status(uuid,text) from public, anon;
grant execute on function public.update_recommendation_status(uuid,text) to authenticated;
revoke all on function public.link_recommendation_to_decision(uuid,uuid) from public, anon;
grant execute on function public.link_recommendation_to_decision(uuid,uuid) to authenticated;

revoke update, delete, truncate on public.alerts from authenticated;
revoke update, delete, truncate on public.recommendations from authenticated;
revoke update, delete, truncate on public.business_intelligence_decisions from authenticated;
