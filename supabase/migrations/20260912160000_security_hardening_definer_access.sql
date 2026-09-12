-- Security hardening: remove authenticated EXECUTE from internal control-plane gates.
REVOKE EXECUTE ON FUNCTION public.autonomy_runtime_gate(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.can_enter_phase_l_autonomy(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_control_plane_health() FROM authenticated;

-- Approval and finalization are privileged state transitions; require active owner/admin membership.
CREATE OR REPLACE FUNCTION public.decide_approval(p_approval_id uuid, p_approve boolean, p_reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_decision uuid;
  v_decision_status text;
  v_status text;
  v_requested_by uuid;
begin
  if v_company is null or v_user is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if not exists (select 1 from public.company_memberships cm where cm.company_id=v_company and cm.user_id=v_user and cm.is_active and cm.role in ('owner','admin')) then raise exception 'APPROVAL_ROLE_FORBIDDEN'; end if;
  select decision_id into v_decision from public.decision_approvals where id=p_approval_id and company_id=v_company;
  if v_decision is null then raise exception 'APPROVAL_NOT_FOUND'; end if;
  select status into v_decision_status from public.business_intelligence_decisions where id=v_decision and company_id=v_company for update;
  if v_decision_status is distinct from 'PROPOSED' then raise exception 'DECISION_STATE_CHANGED'; end if;
  select status, requested_by into v_status, v_requested_by from public.decision_approvals where id=p_approval_id and company_id=v_company for update;
  if v_status <> 'PENDING' then raise exception 'APPROVAL_NOT_PENDING'; end if;
  if p_approve and v_requested_by=v_user then raise exception 'SELF_APPROVAL_FORBIDDEN'; end if;
  update public.decision_approvals set status=case when p_approve then 'APPROVED' else 'REJECTED' end, decided_at=now(), decided_by=v_user, reason=p_reason where id=p_approval_id and company_id=v_company and status='PENDING';
  if not found then raise exception 'APPROVAL_STATE_CHANGED'; end if;
  update public.business_intelligence_decisions set status=case when p_approve then 'APPROVED' else 'REJECTED' end, approved_by=case when p_approve then v_user else null end, approved_at=case when p_approve then now() else null end, rejection_reason=case when p_approve then null else p_reason end where id=v_decision and company_id=v_company and status='PROPOSED';
  if not found then raise exception 'DECISION_STATE_CHANGED'; end if;
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.finalize_runtime_decision(p_decision_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare v_company uuid:=public.current_company_id(); v_user uuid:=auth.uid(); v_decision_key text;
begin
  if v_company is null or v_user is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if not exists (select 1 from public.company_memberships cm where cm.company_id=v_company and cm.user_id=v_user and cm.is_active and cm.role in ('owner','admin')) then raise exception 'FINALIZE_ROLE_FORBIDDEN'; end if;
  select d.decision_key into v_decision_key from public.business_intelligence_decisions d where d.id=p_decision_id and d.company_id=v_company and d.status='APPROVED' for update;
  if v_decision_key is null then raise exception 'DECISION_NOT_FINALIZABLE'; end if;
  if not exists(select 1 from public.decision_work_items w where w.company_id=v_company and w.decision_id=p_decision_id) then raise exception 'DECISION_WORK_ITEMS_REQUIRED'; end if;
  if exists(select 1 from public.decision_work_items w where w.company_id=v_company and w.decision_id=p_decision_id and w.status<>'COMPLETED') then raise exception 'DECISION_WORK_ITEMS_INCOMPLETE'; end if;
  if not exists(select 1 from public.decision_outcomes o where o.company_id=v_company and o.decision_fingerprint=v_decision_key) then raise exception 'DECISION_OUTCOME_REQUIRED'; end if;
  update public.business_intelligence_decisions set status='EXECUTED',executed_at=now() where id=p_decision_id and company_id=v_company and status='APPROVED';
  if not found then raise exception 'DECISION_STATE_CHANGED'; end if;
  return true;
end;
$function$;
