CREATE OR REPLACE FUNCTION public.complete_decision_work_item(p_work_item_id uuid, p_actual_impact numeric, p_evidence jsonb DEFAULT '{}'::jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
declare v_company uuid:=public.current_company_id(); v_user uuid:=auth.uid(); v_expected numeric; v_decision uuid; v_status text; v_assignee uuid; v_evidence_snapshot_id text:=nullif(btrim(coalesce(p_evidence->>'evidence_snapshot_id','')),'');
begin
 if v_company is null or v_user is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
 if p_evidence is not null and jsonb_typeof(p_evidence)<>'object' then raise exception 'OUTCOME_EVIDENCE_OBJECT_REQUIRED'; end if;
 select w.expected_impact,w.decision_id,w.status,w.assignee_id into v_expected,v_decision,v_status,v_assignee from public.decision_work_items w join public.business_intelligence_decisions d on d.id=w.decision_id and d.company_id=v_company and d.status='APPROVED' where w.id=p_work_item_id and w.company_id=v_company for update of w;
 if v_decision is null then raise exception 'WORK_ITEM_NOT_FOUND_OR_DECISION_NOT_APPROVED'; end if;
 if v_status<>'IN_PROGRESS' then raise exception 'WORK_ITEM_NOT_EXECUTABLE'; end if;
 if v_assignee is not null and v_assignee<>v_user then raise exception 'WORK_ITEM_ASSIGNEE_FORBIDDEN'; end if;
 if v_evidence_snapshot_id is null then raise exception 'OUTCOME_EVIDENCE_REQUIRED'; end if;
 if not (exists(select 1 from public.kpi_evidence_snapshots s where s.id::text=v_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.business_state_snapshots s where s.id::text=v_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.import_snapshots s where s.id::text=v_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.operational_health_snapshots s where s.id::text=v_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.source_analysis_snapshots s where s.id::text=v_evidence_snapshot_id and s.company_id=v_company) or exists(select 1 from public.decision_action_receipts r where r.id::text=v_evidence_snapshot_id and r.company_id=v_company and r.status in ('SUCCEEDED','RUNNING'))) then raise exception 'OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN'; end if;
 update public.decision_work_items set status='COMPLETED',actual_impact=p_actual_impact,completed_at=now(),updated_at=now() where id=p_work_item_id and company_id=v_company and status='IN_PROGRESS';
 if not found then raise exception 'WORK_ITEM_STATE_CHANGED'; end if;
 return true;
end; $$;

CREATE OR REPLACE FUNCTION public.create_runtime_recommendation(p_category text, p_priority text, p_title text, p_description text DEFAULT NULL::text, p_evidence jsonb DEFAULT '{}'::jsonb, p_expected_impact numeric DEFAULT NULL::numeric, p_evidence_snapshot_id uuid DEFAULT NULL::uuid, p_metric_versions jsonb DEFAULT '{}'::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
DECLARE v_company uuid := public.current_company_id(); v_user uuid := auth.uid(); v_id uuid;
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_title IS NULL OR btrim(p_title) = '' THEN RAISE EXCEPTION 'RECOMMENDATION_TITLE_REQUIRED'; END IF;
  IF p_evidence_snapshot_id IS NULL THEN RAISE EXCEPTION 'RECOMMENDATION_EVIDENCE_REQUIRED'; END IF;
  IF NOT (EXISTS (SELECT 1 FROM public.kpi_evidence_snapshots s WHERE s.id = p_evidence_snapshot_id AND s.company_id = v_company) OR EXISTS (SELECT 1 FROM public.business_state_snapshots s WHERE s.id = p_evidence_snapshot_id AND s.company_id = v_company) OR EXISTS (SELECT 1 FROM public.import_snapshots s WHERE s.id = p_evidence_snapshot_id AND s.company_id = v_company) OR EXISTS (SELECT 1 FROM public.operational_health_snapshots s WHERE s.id = p_evidence_snapshot_id AND s.company_id = v_company)) THEN RAISE EXCEPTION 'RECOMMENDATION_EVIDENCE_NOT_FOUND_OR_FORBIDDEN'; END IF;
  INSERT INTO public.recommendations(company_id, category, priority, title, description, evidence, expected_impact, confidence, status, evidence_snapshot_id, metric_versions)
  VALUES(v_company, p_category, COALESCE(NULLIF(p_priority, ''), 'medium'), p_title, p_description, COALESCE(p_evidence, '{}'::jsonb), p_expected_impact, 'CALCULATED', 'new', p_evidence_snapshot_id, COALESCE(p_metric_versions, '{}'::jsonb))
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $$
  SELECT cm.company_id FROM public.company_memberships AS cm WHERE cm.user_id = auth.uid() AND cm.is_active = true AND cm.is_default = true LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.mark_alert_read(p_alert_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
declare v_company_id uuid;
begin
  v_company_id := public.current_company_id();
  if v_company_id is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  update public.alerts set is_read = true where id = p_alert_id and company_id = v_company_id;
  if not found then raise exception 'ALERT_NOT_FOUND_OR_FORBIDDEN'; end if;
end; $$;

CREATE OR REPLACE FUNCTION public.record_decision_outcome(p_decision_fingerprint text, p_evidence_snapshot_id text, p_action_id text, p_observed_at timestamptz, p_label text, p_actual_value numeric DEFAULT NULL::numeric, p_expected_value numeric DEFAULT NULL::numeric, p_impact_value numeric DEFAULT NULL::numeric, p_notes text DEFAULT NULL::text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
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
end; $$;
