alter table public.operational_task_proposals
  add column if not exists decision_id uuid references public.business_intelligence_decisions(id);

create or replace function public.convert_operational_task_proposal(
  p_proposal_id uuid,
  p_decision_id uuid,
  p_assignee_id uuid default null,
  p_assignee_label text default null,
  p_due_at timestamptz default null
) returns uuid
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_company uuid:=public.current_company_id(); v_user uuid:=auth.uid();
  v_status text; v_existing uuid; v_role text; v_priority text; v_title text; v_reason text;
  v_source_type text; v_source_id uuid; v_expected_outcome text; v_evidence jsonb; v_linked_decision uuid;
  v_work uuid; v_recommendation uuid; v_department text;
begin
  if v_company is null or v_user is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  select status,converted_work_item_id,role,priority,title,reason,source_type,source_id,expected_outcome,evidence_required,decision_id
    into v_status,v_existing,v_role,v_priority,v_title,v_reason,v_source_type,v_source_id,v_expected_outcome,v_evidence,v_linked_decision
  from public.operational_task_proposals where id=p_proposal_id and company_id=v_company for update;
  if not found then raise exception 'TASK_PROPOSAL_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_existing is not null then return v_existing; end if;
  if v_status <> 'accepted' then raise exception 'TASK_PROPOSAL_MUST_BE_ACCEPTED'; end if;
  if p_decision_id is null then raise exception 'APPROVED_DECISION_REQUIRED'; end if;
  if v_linked_decision is not null and v_linked_decision<>p_decision_id then raise exception 'TASK_PROPOSAL_ALREADY_LINKED_TO_DIFFERENT_DECISION'; end if;
  if not exists(select 1 from public.business_intelligence_decisions d where d.id=p_decision_id and d.company_id=v_company and d.status='APPROVED') then raise exception 'DECISION_NOT_APPROVED'; end if;
  if v_source_type='recommendation' and v_source_id is not null then
    if not exists(select 1 from public.recommendations r where r.id=v_source_id and r.company_id=v_company and r.decision_id=p_decision_id) then raise exception 'RECOMMENDATION_NOT_LINKED_TO_DECISION'; end if;
    v_recommendation:=v_source_id;
  end if;
  if p_assignee_id is not null and not exists(select 1 from public.company_memberships m where m.company_id=v_company and m.user_id=p_assignee_id and m.is_active=true) then raise exception 'ASSIGNEE_NOT_ACTIVE_TENANT_MEMBER'; end if;
  v_department:=case v_role when 'manager' then 'management' when 'employee' then 'operations' when 'sales' then 'sales' when 'warehouse' then 'warehouse' when 'accountant' then 'accounting' when 'purchasing' then 'purchasing' else 'operations' end;
  v_work:=public.create_decision_work_item(p_decision_id,v_recommendation,v_department,p_assignee_id,p_assignee_label,v_title,v_reason||E'\n\nالنتيجة المتوقعة: '||v_expected_outcome,upper(v_priority),p_due_at,null,jsonb_build_object('task_proposal_id',p_proposal_id,'source_type',v_source_type,'source_id',v_source_id,'evidence_required',coalesce(v_evidence,'[]'::jsonb)));
  update public.operational_task_proposals set decision_id=p_decision_id,converted_work_item_id=v_work,status='converted',updated_at=now()
   where id=p_proposal_id and company_id=v_company and status='accepted' and converted_work_item_id is null;
  if not found then raise exception 'TASK_PROPOSAL_STATE_CHANGED'; end if;
  return v_work;
end;
$$;

revoke all on function public.convert_operational_task_proposal(uuid,uuid,uuid,text,timestamptz) from public,anon;
grant execute on function public.convert_operational_task_proposal(uuid,uuid,uuid,text,timestamptz) to authenticated;
