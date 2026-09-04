-- Reconcile the authenticated Recommendations UI contract with the canonical
-- database status vocabulary. Keep legacy OPEN readable and map UI aliases
-- accepted/done to approved/completed without widening tenant scope.

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
  v_status text:=lower(trim(coalesce(p_status,'')));
  v_canonical text;
begin
  if v_company_id is null or v_user is null then
    raise exception 'TENANT_CONTEXT_REQUIRED';
  end if;

  v_canonical:=case v_status
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

  if v_canonical is null then
    raise exception 'INVALID_RECOMMENDATION_STATUS';
  end if;

  update public.recommendations
     set status=v_canonical
   where id=p_recommendation_id
     and company_id=v_company_id;

  if not found then
    raise exception 'RECOMMENDATION_NOT_FOUND_OR_FORBIDDEN';
  end if;
end;
$function$;

grant execute on function public.update_recommendation_status(uuid,text) to authenticated;
revoke execute on function public.update_recommendation_status(uuid,text) from anon;
