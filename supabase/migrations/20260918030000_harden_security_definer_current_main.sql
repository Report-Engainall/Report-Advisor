-- Current-main forward-only security reconciliation.
-- Preserve existing decision/recommendation runtime behavior while eliminating
-- mutable search_path resolution in SECURITY DEFINER functions.
-- retry_report_execution_job also requires explicit caller authentication and
-- tenant binding before a worker retry mutation is allowed.

CREATE OR REPLACE FUNCTION public.create_decision_work_item(
  p_decision_id uuid,
  p_recommendation_id uuid,
  p_department text,
  p_assignee_id uuid,
  p_assignee_label text,
  p_title text,
  p_description text,
  p_priority text,
  p_due_at timestamptz,
  p_expected_impact numeric,
  p_evidence_refs jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_company uuid := public.current_company_id();
  v_id uuid;
BEGIN
  IF v_company IS NULL OR auth.uid() IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.business_intelligence_decisions d
    WHERE d.id = p_decision_id
      AND d.company_id = v_company
      AND d.status = 'APPROVED'
  ) THEN
    RAISE EXCEPTION 'DECISION_NOT_APPROVED';
  END IF;

  IF p_recommendation_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.recommendations r
    WHERE r.id = p_recommendation_id
      AND r.company_id = v_company
      AND r.decision_id = p_decision_id
  ) THEN
    RAISE EXCEPTION 'RECOMMENDATION_NOT_FOUND_OR_NOT_LINKED';
  END IF;

  IF p_assignee_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.company_memberships m
    WHERE m.company_id = v_company
      AND m.user_id = p_assignee_id
      AND m.is_active = true
  ) THEN
    RAISE EXCEPTION 'ASSIGNEE_NOT_ACTIVE_TENANT_MEMBER';
  END IF;

  IF p_department IS NULL OR btrim(p_department) = '' THEN
    RAISE EXCEPTION 'WORK_ITEM_DEPARTMENT_REQUIRED';
  END IF;
  IF p_title IS NULL OR btrim(p_title) = '' THEN
    RAISE EXCEPTION 'WORK_ITEM_TITLE_REQUIRED';
  END IF;
  IF p_priority NOT IN ('LOW','MEDIUM','HIGH','CRITICAL') THEN
    RAISE EXCEPTION 'INVALID_WORK_ITEM_PRIORITY';
  END IF;

  INSERT INTO public.decision_work_items(
    company_id, decision_id, recommendation_id, department, assignee_id,
    assignee_label, title, description, priority, due_at, expected_impact,
    evidence_refs
  )
  VALUES (
    v_company, p_decision_id, p_recommendation_id, p_department, p_assignee_id,
    p_assignee_label, p_title, p_description, p_priority, p_due_at,
    p_expected_impact, COALESCE(p_evidence_refs, '[]'::jsonb)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_runtime_decision(
  p_decision_key text,
  p_decision_type text,
  p_confidence numeric,
  p_expected_impact numeric,
  p_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;
  IF p_confidence IS NULL OR p_confidence < 0 OR p_confidence > 1 THEN
    RAISE EXCEPTION 'DECISION_CONFIDENCE_OUT_OF_RANGE';
  END IF;
  IF p_decision_key IS NULL OR btrim(p_decision_key) = '' THEN
    RAISE EXCEPTION 'DECISION_KEY_REQUIRED';
  END IF;

  INSERT INTO public.business_intelligence_decisions(
    company_id, decision_key, decision_type, status, confidence, expected_impact, evidence
  )
  VALUES(
    v_company, p_decision_key, p_decision_type, 'PROPOSED', p_confidence,
    p_expected_impact, COALESCE(p_evidence, '{}'::jsonb)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decide_approval(
  p_approval_id uuid,
  p_approve boolean,
  p_reason text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_decision uuid;
  v_decision_status text;
  v_status text;
  v_requested_by uuid;
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;

  SELECT decision_id
    INTO v_decision
  FROM public.decision_approvals
  WHERE id = p_approval_id
    AND company_id = v_company;

  IF v_decision IS NULL THEN
    RAISE EXCEPTION 'APPROVAL_NOT_FOUND';
  END IF;

  SELECT status
    INTO v_decision_status
  FROM public.business_intelligence_decisions
  WHERE id = v_decision
    AND company_id = v_company
  FOR UPDATE;

  IF v_decision_status IS DISTINCT FROM 'PROPOSED' THEN
    RAISE EXCEPTION 'DECISION_STATE_CHANGED';
  END IF;

  SELECT status, requested_by
    INTO v_status, v_requested_by
  FROM public.decision_approvals
  WHERE id = p_approval_id
    AND company_id = v_company
  FOR UPDATE;

  IF v_status <> 'PENDING' THEN
    RAISE EXCEPTION 'APPROVAL_NOT_PENDING';
  END IF;

  IF p_approve AND v_requested_by = v_user THEN
    RAISE EXCEPTION 'SELF_APPROVAL_FORBIDDEN';
  END IF;

  UPDATE public.decision_approvals
  SET status = CASE WHEN p_approve THEN 'APPROVED' ELSE 'REJECTED' END,
      decided_at = now(),
      decided_by = v_user,
      reason = p_reason
  WHERE id = p_approval_id
    AND company_id = v_company
    AND status = 'PENDING';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'APPROVAL_STATE_CHANGED';
  END IF;

  UPDATE public.business_intelligence_decisions
  SET status = CASE WHEN p_approve THEN 'APPROVED' ELSE 'REJECTED' END,
      approved_by = CASE WHEN p_approve THEN v_user ELSE NULL END,
      approved_at = CASE WHEN p_approve THEN now() ELSE NULL END,
      rejection_reason = CASE WHEN p_approve THEN NULL ELSE p_reason END
  WHERE id = v_decision
    AND company_id = v_company
    AND status = 'PROPOSED';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DECISION_STATE_CHANGED';
  END IF;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.link_recommendation_to_decision(
  p_recommendation_id uuid,
  p_decision_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_company_id uuid;
  v_recommendation_decision uuid;
  v_decision_recommendation uuid;
BEGIN
  v_company_id := public.current_company_id();

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;

  SELECT decision_id
    INTO v_recommendation_decision
  FROM public.recommendations
  WHERE id = p_recommendation_id
    AND company_id = v_company_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'RECOMMENDATION_NOT_FOUND_OR_FORBIDDEN';
  END IF;

  SELECT recommendation_id
    INTO v_decision_recommendation
  FROM public.business_intelligence_decisions
  WHERE id = p_decision_id
    AND company_id = v_company_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DECISION_NOT_FOUND_OR_FORBIDDEN';
  END IF;

  IF v_recommendation_decision IS NOT NULL
     AND v_recommendation_decision <> p_decision_id THEN
    RAISE EXCEPTION 'RECOMMENDATION_ALREADY_LINKED';
  END IF;

  IF v_decision_recommendation IS NOT NULL
     AND v_decision_recommendation <> p_recommendation_id THEN
    RAISE EXCEPTION 'DECISION_ALREADY_LINKED';
  END IF;

  UPDATE public.recommendations
     SET decision_id = p_decision_id
   WHERE id = p_recommendation_id
     AND company_id = v_company_id;

  UPDATE public.business_intelligence_decisions
     SET recommendation_id = p_recommendation_id
   WHERE id = p_decision_id
     AND company_id = v_company_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_decision_work_item(
  p_work_item_id uuid,
  p_title text,
  p_description text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.decision_work_items w
    WHERE w.id = p_work_item_id
      AND w.company_id = v_company
  ) THEN
    RAISE EXCEPTION 'WORK_ITEM_NOT_FOUND_OR_FORBIDDEN';
  END IF;

  INSERT INTO public.alerts(
    company_id, severity, category, title, description, entity_type, entity_id
  )
  VALUES(
    v_company, 'info', 'decision_action', p_title, p_description,
    'decision_work_item', p_work_item_id
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_recommendation_outcome(
  p_recommendation_key text,
  p_observed_at timestamptz,
  p_expected_impact numeric DEFAULT NULL::numeric,
  p_actual_impact numeric DEFAULT NULL::numeric,
  p_outcome_quality numeric DEFAULT NULL::numeric,
  p_status text DEFAULT 'insufficient'::text,
  p_decision_id uuid DEFAULT NULL::uuid,
  p_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_id uuid;
  v_evidence_snapshot_id text := NULLIF(btrim(COALESCE(p_evidence->>'evidence_snapshot_id','')), '');
  v_recommendation_id uuid;
  v_decision_from_key uuid;
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;
  IF p_recommendation_key IS NULL OR btrim(p_recommendation_key) = '' OR p_observed_at IS NULL THEN
    RAISE EXCEPTION 'OUTCOME_IDENTITY_INCOMPLETE';
  END IF;

  SELECT r.id, r.decision_id
    INTO v_recommendation_id, v_decision_from_key
  FROM public.recommendations r
  WHERE r.id::text = p_recommendation_key
    AND r.company_id = v_company;

  IF v_recommendation_id IS NULL AND NOT EXISTS (
    SELECT 1
    FROM public.business_intelligence_decisions d
    WHERE d.decision_key = p_recommendation_key
      AND d.company_id = v_company
  ) THEN
    RAISE EXCEPTION 'OUTCOME_PROVENANCE_NOT_FOUND';
  END IF;

  IF v_recommendation_id IS NULL AND p_decision_id IS NULL THEN
    RAISE EXCEPTION 'DECISION_PROVENANCE_REQUIRED';
  END IF;

  IF v_recommendation_id IS NOT NULL
     AND v_decision_from_key IS NOT NULL
     AND p_decision_id IS NULL THEN
    RAISE EXCEPTION 'DECISION_PROVENANCE_REQUIRED';
  END IF;

  IF p_decision_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.business_intelligence_decisions d
      WHERE d.id = p_decision_id
        AND d.company_id = v_company
    ) THEN
      RAISE EXCEPTION 'DECISION_NOT_FOUND_OR_FORBIDDEN';
    END IF;

    IF v_recommendation_id IS NOT NULL
       AND v_decision_from_key IS DISTINCT FROM p_decision_id THEN
      RAISE EXCEPTION 'RECOMMENDATION_DECISION_MISMATCH';
    END IF;

    IF v_recommendation_id IS NULL AND NOT EXISTS (
      SELECT 1
      FROM public.business_intelligence_decisions d
      WHERE d.id = p_decision_id
        AND d.decision_key = p_recommendation_key
        AND d.company_id = v_company
    ) THEN
      RAISE EXCEPTION 'DECISION_KEY_MISMATCH';
    END IF;
  END IF;

  IF v_evidence_snapshot_id IS NULL THEN
    RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED';
  END IF;

  IF NOT (
    EXISTS (
      SELECT 1 FROM public.kpi_evidence_snapshots s
      WHERE s.id::text = v_evidence_snapshot_id
        AND s.company_id = v_company
    )
    OR EXISTS (
      SELECT 1 FROM public.business_state_snapshots s
      WHERE s.id::text = v_evidence_snapshot_id
        AND s.company_id = v_company
    )
    OR EXISTS (
      SELECT 1 FROM public.import_snapshots s
      WHERE s.id::text = v_evidence_snapshot_id
        AND s.company_id = v_company
    )
    OR EXISTS (
      SELECT 1 FROM public.operational_health_snapshots s
      WHERE s.id::text = v_evidence_snapshot_id
        AND s.company_id = v_company
    )
    OR EXISTS (
      SELECT 1 FROM public.decision_action_receipts r
      WHERE r.id::text = v_evidence_snapshot_id
        AND r.company_id = v_company
        AND r.status IN ('SUCCEEDED','RUNNING')
    )
  ) THEN
    RAISE EXCEPTION 'OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN';
  END IF;

  IF p_status NOT IN ('positive','negative','neutral','insufficient') THEN
    RAISE EXCEPTION 'INVALID_OUTCOME_STATUS';
  END IF;

  IF p_status IN ('positive','negative','neutral')
     AND (p_expected_impact IS NULL OR p_actual_impact IS NULL) THEN
    RAISE EXCEPTION 'OUTCOME_VALUES_REQUIRED_FOR_KNOWN_STATUS';
  END IF;

  IF p_outcome_quality IS NOT NULL
     AND (p_outcome_quality < 0 OR p_outcome_quality > 1) THEN
    RAISE EXCEPTION 'OUTCOME_QUALITY_OUT_OF_RANGE';
  END IF;

  INSERT INTO public.recommendation_outcomes(
    company_id, recommendation_key, decision_id, observed_at, expected_impact,
    actual_impact, outcome_quality, status, evidence
  )
  VALUES(
    v_company, p_recommendation_key, p_decision_id, p_observed_at,
    p_expected_impact, p_actual_impact, p_outcome_quality, p_status,
    COALESCE(p_evidence, '{}'::jsonb)
  )
  ON CONFLICT(company_id,recommendation_key)
  DO UPDATE SET
    decision_id = EXCLUDED.decision_id,
    observed_at = EXCLUDED.observed_at,
    expected_impact = EXCLUDED.expected_impact,
    actual_impact = EXCLUDED.actual_impact,
    outcome_quality = EXCLUDED.outcome_quality,
    status = EXCLUDED.status,
    evidence = EXCLUDED.evidence
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.request_decision_approval(
  p_decision_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_company uuid := public.current_company_id();
  v_id uuid;
  v_user uuid := auth.uid();
  v_decision_status text;
  v_existing_status text;
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;

  SELECT d.status
    INTO v_decision_status
  FROM public.business_intelligence_decisions d
  WHERE d.id = p_decision_id
    AND d.company_id = v_company
  FOR UPDATE;

  IF v_decision_status IS DISTINCT FROM 'PROPOSED' THEN
    RAISE EXCEPTION 'DECISION_NOT_APPROVABLE';
  END IF;

  SELECT a.status
    INTO v_existing_status
  FROM public.decision_approvals a
  WHERE a.company_id = v_company
    AND a.decision_id = p_decision_id
  FOR UPDATE;

  IF v_existing_status IN ('APPROVED','REJECTED','CANCELLED') THEN
    RAISE EXCEPTION 'APPROVAL_TERMINAL_NOT_REOPENABLE';
  END IF;

  INSERT INTO public.decision_approvals(
    company_id, decision_id, status, requested_by, reason
  )
  VALUES(v_company, p_decision_id, 'PENDING', v_user, p_reason)
  ON CONFLICT (company_id, decision_id)
  DO UPDATE
    SET status = 'PENDING',
        requested_by = EXCLUDED.requested_by,
        reason = EXCLUDED.reason,
        requested_at = now(),
        decided_at = null,
        decided_by = null
  WHERE public.decision_approvals.status NOT IN ('APPROVED','REJECTED','CANCELLED')
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'APPROVAL_TERMINAL_NOT_REOPENABLE';
  END IF;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.retry_report_execution_job(
  p_job_id uuid,
  p_company_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  affected integer;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTHENTICATED_USER_REQUIRED';
  END IF;

  IF public.current_company_id() IS DISTINCT FROM p_company_id THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;

  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'Worker company context is required';
  END IF;

  UPDATE public.report_execution_jobs
     SET status='queued',
         lease_owner=null,
         lease_token=null,
         lease_expires_at=null,
         last_error='{}'::jsonb,
         completed_at=null,
         updated_at=now()
   WHERE id=p_job_id
     AND company_id=p_company_id
     AND status='failed'
     AND attempt < max_attempts;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected=1;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_decision_work_item(uuid,uuid,text,uuid,text,text,text,text,timestamptz,numeric,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_decision_work_item(uuid,uuid,text,uuid,text,text,text,text,timestamptz,numeric,jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.create_runtime_decision(text,text,numeric,numeric,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_runtime_decision(text,text,numeric,numeric,jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.decide_approval(uuid,boolean,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_approval(uuid,boolean,text) TO authenticated;

REVOKE ALL ON FUNCTION public.link_recommendation_to_decision(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_recommendation_to_decision(uuid,uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.notify_decision_work_item(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.notify_decision_work_item(uuid,text,text) TO authenticated;

REVOKE ALL ON FUNCTION public.record_recommendation_outcome(text,timestamptz,numeric,numeric,numeric,text,uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_recommendation_outcome(text,timestamptz,numeric,numeric,numeric,text,uuid,jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.request_decision_approval(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_decision_approval(uuid,text) TO authenticated;

REVOKE ALL ON FUNCTION public.retry_report_execution_job(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.retry_report_execution_job(uuid,uuid) TO service_role;
