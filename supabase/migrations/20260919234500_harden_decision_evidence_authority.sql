-- Decision evidence authority hardening.
-- PROPOSED may carry contextual evidence; APPROVED/EXECUTED must reference a trusted evidence snapshot.
-- Reuse existing decision approval/action/complete functions; no parallel execution path.

CREATE OR REPLACE FUNCTION public.decide_approval(
  p_approval_id uuid,
  p_approve boolean,
  p_reason text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $function$
DECLARE
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_decision uuid;
  v_status text;
  v_requested_by uuid;
  v_decision_status text;
  v_evidence_snapshot_id text;
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id=v_company AND cm.user_id=v_user AND cm.is_active AND cm.role IN ('owner','admin')
  ) THEN RAISE EXCEPTION 'APPROVAL_ROLE_FORBIDDEN'; END IF;

  SELECT a.decision_id,a.status,a.requested_by INTO v_decision,v_status,v_requested_by
  FROM public.decision_approvals a
  WHERE a.id=p_approval_id AND a.company_id=v_company
  FOR UPDATE;
  IF v_decision IS NULL OR v_status <> 'PENDING' THEN RAISE EXCEPTION 'APPROVAL_NOT_PENDING'; END IF;

  SELECT d.status,d.evidence->>'evidence_snapshot_id'
    INTO v_decision_status,v_evidence_snapshot_id
  FROM public.business_intelligence_decisions d
  WHERE d.id=v_decision AND d.company_id=v_company
  FOR UPDATE;

  IF v_decision_status IS DISTINCT FROM 'PROPOSED' THEN RAISE EXCEPTION 'DECISION_STATE_CHANGED'; END IF;
  IF p_approve AND v_requested_by=v_user THEN RAISE EXCEPTION 'SELF_APPROVAL_FORBIDDEN'; END IF;

  IF p_approve THEN
    IF v_evidence_snapshot_id IS NULL THEN RAISE EXCEPTION 'DECISION_EVIDENCE_SNAPSHOT_REQUIRED'; END IF;
    IF NOT (
      EXISTS(SELECT 1 FROM public.kpi_evidence_snapshots s WHERE s.id::text=v_evidence_snapshot_id AND s.company_id=v_company)
      OR EXISTS(SELECT 1 FROM public.business_state_snapshots s WHERE s.id::text=v_evidence_snapshot_id AND s.company_id=v_company)
      OR EXISTS(SELECT 1 FROM public.import_snapshots s WHERE s.id::text=v_evidence_snapshot_id AND s.company_id=v_company)
      OR EXISTS(SELECT 1 FROM public.operational_health_snapshots s WHERE s.id::text=v_evidence_snapshot_id AND s.company_id=v_company)
      OR EXISTS(SELECT 1 FROM public.source_analysis_snapshots s WHERE s.id::text=v_evidence_snapshot_id AND s.company_id=v_company)
    ) THEN RAISE EXCEPTION 'DECISION_EVIDENCE_SNAPSHOT_NOT_FOUND_OR_FORBIDDEN'; END IF;
  END IF;

  UPDATE public.decision_approvals
  SET status=CASE WHEN p_approve THEN 'APPROVED' ELSE 'REJECTED' END,
      decided_at=now(),decided_by=v_user,reason=p_reason
  WHERE id=p_approval_id AND company_id=v_company AND status='PENDING';
  IF NOT FOUND THEN RAISE EXCEPTION 'APPROVAL_STATE_CHANGED'; END IF;

  UPDATE public.business_intelligence_decisions
  SET status=CASE WHEN p_approve THEN 'APPROVED' ELSE 'REJECTED' END,
      approved_by=CASE WHEN p_approve THEN v_user ELSE NULL END,
      approved_at=CASE WHEN p_approve THEN now() ELSE NULL END,
      rejection_reason=CASE WHEN p_approve THEN NULL ELSE p_reason END
  WHERE id=v_decision AND company_id=v_company AND status='PROPOSED';
  IF NOT FOUND THEN RAISE EXCEPTION 'DECISION_STATE_CHANGED'; END IF;
  RETURN true;
END;
$function$;

DROP FUNCTION IF EXISTS public.create_decision_action_receipt(uuid,text,text,uuid);
CREATE FUNCTION public.create_decision_action_receipt(
  p_work_item_id uuid,
  p_idempotency_key text,
  p_decision_fingerprint text,
  p_evidence_snapshot_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
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
$function$;

CREATE OR REPLACE FUNCTION public.complete_decision_work_item(
  p_work_item_id uuid,p_actual_impact numeric,p_evidence jsonb DEFAULT '{}'::jsonb
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $function$
DECLARE
  v_company uuid:=public.current_company_id();
  v_user uuid:=auth.uid();
  v_expected numeric;
  v_decision uuid;
  v_recommendation_key text;
  v_status text;
  v_assignee uuid;
  v_evidence_snapshot_id text:=nullif(btrim(coalesce(p_evidence->>'evidence_snapshot_id','')),'');
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF v_evidence_snapshot_id IS NULL THEN RAISE EXCEPTION 'WORK_ITEM_EVIDENCE_REQUIRED'; END IF;
  IF NOT (
    EXISTS(SELECT 1 FROM public.kpi_evidence_snapshots s WHERE s.id::text=v_evidence_snapshot_id AND s.company_id=v_company)
    OR EXISTS(SELECT 1 FROM public.business_state_snapshots s WHERE s.id::text=v_evidence_snapshot_id AND s.company_id=v_company)
    OR EXISTS(SELECT 1 FROM public.import_snapshots s WHERE s.id::text=v_evidence_snapshot_id AND s.company_id=v_company)
    OR EXISTS(SELECT 1 FROM public.operational_health_snapshots s WHERE s.id::text=v_evidence_snapshot_id AND s.company_id=v_company)
    OR EXISTS(SELECT 1 FROM public.source_analysis_snapshots s WHERE s.id::text=v_evidence_snapshot_id AND s.company_id=v_company)
    OR EXISTS(SELECT 1 FROM public.decision_action_receipts r WHERE r.id::text=v_evidence_snapshot_id AND r.company_id=v_company AND r.status='SUCCEEDED')
  ) THEN RAISE EXCEPTION 'WORK_ITEM_EVIDENCE_NOT_FOUND_OR_FORBIDDEN'; END IF;

  SELECT w.expected_impact,w.decision_id,w.status,w.assignee_id INTO v_expected,v_decision,v_status,v_assignee
  FROM public.decision_work_items w
  JOIN public.business_intelligence_decisions d ON d.id=w.decision_id AND d.company_id=v_company AND d.status='APPROVED'
  WHERE w.id=p_work_item_id AND w.company_id=v_company
  FOR UPDATE OF w;
  IF v_decision IS NULL THEN RAISE EXCEPTION 'WORK_ITEM_NOT_FOUND_OR_DECISION_NOT_APPROVED'; END IF;
  IF v_status <> 'IN_PROGRESS' THEN RAISE EXCEPTION 'WORK_ITEM_NOT_IN_PROGRESS'; END IF;
  IF v_assignee IS NOT NULL AND v_assignee<>v_user AND NOT EXISTS(
    SELECT 1 FROM public.company_memberships m
    WHERE m.company_id=v_company AND m.user_id=v_user AND m.is_active AND lower(m.role) IN ('owner','admin','administrator')
  ) THEN RAISE EXCEPTION 'WORK_ITEM_ASSIGNEE_FORBIDDEN'; END IF;

  UPDATE public.decision_work_items
  SET status='COMPLETED',actual_impact=p_actual_impact,completed_at=now(),updated_at=now()
  WHERE id=p_work_item_id AND company_id=v_company AND status='IN_PROGRESS';
  IF NOT FOUND THEN RAISE EXCEPTION 'WORK_ITEM_STATE_CHANGED'; END IF;

  SELECT coalesce(r.id::text,d.decision_key) INTO v_recommendation_key
  FROM public.business_intelligence_decisions d
  LEFT JOIN public.recommendations r ON r.id=d.recommendation_id AND r.company_id=v_company
  WHERE d.id=v_decision AND d.company_id=v_company;

  INSERT INTO public.recommendation_outcomes(
    company_id,recommendation_key,decision_id,expected_impact,actual_impact,status,evidence
  )
  VALUES(
    v_company,v_recommendation_key,v_decision,v_expected,p_actual_impact,
    CASE WHEN p_actual_impact IS NULL OR v_expected IS NULL THEN 'insufficient'
      WHEN p_actual_impact>v_expected THEN 'positive'
      WHEN p_actual_impact=v_expected THEN 'neutral'
      ELSE 'negative' END,
    jsonb_build_object('work_item_id',p_work_item_id,'evidence_snapshot_id',v_evidence_snapshot_id,
      'outcome_delta',CASE WHEN v_expected IS NULL OR p_actual_impact IS NULL THEN NULL ELSE p_actual_impact-v_expected END)
      ||coalesce(p_evidence,'{}'::jsonb)
  )
  ON CONFLICT(company_id,recommendation_key) DO UPDATE SET
    actual_impact=excluded.actual_impact,status=excluded.status,observed_at=now(),evidence=excluded.evidence;

  UPDATE public.business_intelligence_decisions SET status='EXECUTED',executed_at=now()
  WHERE id=v_decision AND company_id=v_company AND status='APPROVED';
  IF NOT FOUND THEN RAISE EXCEPTION 'DECISION_STATE_CHANGED'; END IF;
  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.decide_approval(uuid,boolean,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.decide_approval(uuid,boolean,text) TO authenticated;
REVOKE ALL ON FUNCTION public.create_decision_action_receipt(uuid,text,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_decision_action_receipt(uuid,text,text,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.complete_decision_work_item(uuid,numeric,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.complete_decision_work_item(uuid,numeric,jsonb) TO authenticated;
