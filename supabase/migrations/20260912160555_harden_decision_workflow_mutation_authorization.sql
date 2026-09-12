create or replace function public.create_decision_work_item(p_decision_id uuid, p_recommendation_id uuid, p_department text, p_assignee_id uuid, p_assignee_label text, p_title text, p_description text, p_priority text, p_due_at timestamptz, p_expected_impact numeric, p_evidence_refs jsonb)
returns uuid language plpgsql security definer set search_path = '' as $function$
declare v_company uuid := public.current_company_id(); v_user uuid := auth.uid(); v_id uuid;
begin
  if v_company is null or v_user is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if not exists (select 1 from public.company_memberships m where m.company_id=v_company and m.user_id=v_user and m.is_active=true and lower(m.role) in ('owner','admin','administrator')) then raise exception 'WORK_ITEM_MUTATION_FORBIDDEN'; end if;
  if not exists (select 1 from public.business_intelligence_decisions d where d.id=p_decision_id and d.company_id=v_company and d.status='APPROVED') then raise exception 'DECISION_NOT_APPROVED'; end if;
  if p_recommendation_id is not null and not exists (select 1 from public.recommendations r where r.id=p_recommendation_id and r.company_id=v_company and r.decision_id=p_decision_id) then raise exception 'RECOMMENDATION_NOT_FOUND_OR_NOT_LINKED'; end if;
  if p_assignee_id is null then raise exception 'WORK_ITEM_OWNER_REQUIRED'; end if;
  if not exists (select 1 from public.company_memberships m where m.company_id=v_company and m.user_id=p_assignee_id and m.is_active=true) then raise exception 'ASSIGNEE_NOT_ACTIVE_TENANT_MEMBER'; end if;
  if p_assignee_label is null or btrim(p_assignee_label)='' then raise exception 'WORK_ITEM_OWNER_LABEL_REQUIRED'; end if;
  if p_department is null or btrim(p_department)='' then raise exception 'WORK_ITEM_DEPARTMENT_REQUIRED'; end if;
  if p_title is null or btrim(p_title)='' then raise exception 'WORK_ITEM_TITLE_REQUIRED'; end if;
  if p_priority not in ('LOW','MEDIUM','HIGH','CRITICAL') then raise exception 'INVALID_WORK_ITEM_PRIORITY'; end if;
  if p_evidence_refs is null or jsonb_typeof(p_evidence_refs) <> 'array' or jsonb_array_length(p_evidence_refs)=0 then raise exception 'WORK_ITEM_EVIDENCE_REQUIRED'; end if;
  insert into public.decision_work_items(company_id,decision_id,recommendation_id,department,assignee_id,assignee_label,title,description,priority,due_at,expected_impact,evidence_refs)
  values(v_company,p_decision_id,p_recommendation_id,p_department,p_assignee_id,p_assignee_label,p_title,p_description,p_priority,p_due_at,p_expected_impact,p_evidence_refs)
  returning id into v_id;
  return v_id;
end; $function$;

create or replace function public.record_decision_outcome(p_decision_fingerprint text, p_evidence_snapshot_id text, p_action_id text, p_observed_at timestamptz, p_label text, p_actual_value numeric default null, p_expected_value numeric default null, p_impact_value numeric default null, p_notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $function$
declare v_company uuid:=public.current_company_id(); v_user uuid:=auth.uid(); v_id uuid; v_decision uuid; v_work_item uuid; v_assignee uuid;
begin
 if v_company is null or v_user is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
 if p_decision_fingerprint is null or btrim(p_decision_fingerprint)='' or p_evidence_snapshot_id is null or btrim(p_evidence_snapshot_id)='' or p_observed_at is null then raise exception 'OUTCOME_IDENTITY_INCOMPLETE'; end if;
 select d.id into v_decision from public.business_intelligence_decisions d where d.company_id=v_company and d.decision_key=p_decision_fingerprint and d.status='APPROVED';
 if v_decision is null then raise exception 'OUTCOME_DECISION_NOT_APPROVED_OR_FORBIDDEN'; end if;
 if p_action_id is null or btrim(p_action_id)='' or p_action_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'OUTCOME_WORK_ITEM_REQUIRED'; end if;
 select w.id,w.assignee_id into v_work_item,v_assignee from public.decision_work_items w where w.id=p_action_id::uuid and w.company_id=v_company and w.decision_id=v_decision and w.status='COMPLETED';
 if v_work_item is null then raise exception 'OUTCOME_WORK_ITEM_NOT_FOUND_OR_FORBIDDEN'; end if;
 if not (v_assignee=v_user or exists(select 1 from public.company_memberships m where m.company_id=v_company and m.user_id=v_user and m.is_active=true and lower(m.role) in ('owner','admin','administrator'))) then raise exception 'OUTCOME_MUTATION_FORBIDDEN'; end if;
 if not (exists(select 1 from public.kpi_evidence_snapshots s where s.id::text=p_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.business_state_snapshots s where s.id::text=p_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.import_snapshots s where s.id::text=p_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.operational_health_snapshots s where s.id::text=p_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.source_analysis_snapshots s where s.id::text=p_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.decision_action_receipts r where r.id::text=p_evidence_snapshot_id and r.company_id=v_company and r.status in ('SUCCEEDED','RUNNING'))) then raise exception 'OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN'; end if;
 if p_label not in ('correct','incorrect','partial','unknown') then raise exception 'INVALID_OUTCOME_LABEL'; end if;
 insert into public.decision_outcomes(company_id,decision_fingerprint,evidence_snapshot_id,action_id,observed_at,observed_by,label,actual_value,expected_value,impact_value,notes) values(v_company,p_decision_fingerprint,p_evidence_snapshot_id,p_action_id,p_observed_at,v_user,p_label,p_actual_value,p_expected_value,p_impact_value,p_notes) on conflict(company_id,decision_fingerprint,observed_at) do nothing returning id into v_id;
 if v_id is null then raise exception 'OUTCOME_ALREADY_RECORDED'; end if;
 return v_id;
end; $function$;

revoke all on function public.create_decision_work_item(uuid,uuid,text,uuid,text,text,text,text,timestamptz,numeric,jsonb) from public, anon;
grant execute on function public.create_decision_work_item(uuid,uuid,text,uuid,text,text,text,text,timestamptz,numeric,jsonb) to authenticated;
revoke all on function public.record_decision_outcome(text,text,text,timestamptz,text,numeric,numeric,numeric,text) from public, anon;
grant execute on function public.record_decision_outcome(text,text,text,timestamptz,text,numeric,numeric,numeric,text) to authenticated;
