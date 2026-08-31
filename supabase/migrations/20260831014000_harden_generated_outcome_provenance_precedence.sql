-- Generated provenance must be authoritative over caller-supplied evidence metadata.
-- The caller may add contextual evidence, but cannot overwrite the work-item identity
-- or server-computed outcome delta.
CREATE OR REPLACE FUNCTION public.complete_decision_work_item(
  p_work_item_id uuid,
  p_actual_impact numeric,
  p_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_expected numeric;
  v_decision uuid;
  v_recommendation_key text;
  v_status text;
  v_assignee uuid;
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;
  IF p_evidence IS NOT NULL AND jsonb_typeof(p_evidence) <> 'object' THEN
    RAISE EXCEPTION 'OUTCOME_EVIDENCE_OBJECT_REQUIRED';
  END IF;

  SELECT w.expected_impact, w.decision_id, w.status, w.assignee_id
    INTO v_expected, v_decision, v_status, v_assignee
  FROM public.decision_work_items w
  JOIN public.business_intelligence_decisions d
    ON d.id = w.decision_id
   AND d.company_id = v_company
   AND d.status = 'APPROVED'
  WHERE w.id = p_work_item_id
    AND w.company_id = v_company
  FOR UPDATE OF w;

  IF v_decision IS NULL THEN RAISE EXCEPTION 'WORK_ITEM_NOT_FOUND_OR_DECISION_NOT_APPROVED'; END IF;
  IF v_status <> 'IN_PROGRESS' THEN RAISE EXCEPTION 'WORK_ITEM_NOT_EXECUTABLE'; END IF;
  IF v_assignee IS NOT NULL AND v_assignee <> v_user THEN RAISE EXCEPTION 'WORK_ITEM_ASSIGNEE_FORBIDDEN'; END IF;

  UPDATE public.decision_work_items
    SET status='COMPLETED', actual_impact=p_actual_impact, completed_at=now(), updated_at=now()
  WHERE id=p_work_item_id AND company_id=v_company AND status='IN_PROGRESS';
  IF NOT FOUND THEN RAISE EXCEPTION 'WORK_ITEM_STATE_CHANGED'; END IF;

  SELECT COALESCE(r.id::text, d.decision_key) INTO v_recommendation_key
  FROM public.business_intelligence_decisions d
  LEFT JOIN public.recommendations r ON r.id=d.recommendation_id AND r.company_id=v_company
  WHERE d.id=v_decision AND d.company_id=v_company;

  INSERT INTO public.recommendation_outcomes(
    company_id,recommendation_key,decision_id,expected_impact,actual_impact,status,evidence
  ) VALUES (
    v_company,v_recommendation_key,v_decision,v_expected,p_actual_impact,
    CASE WHEN p_actual_impact IS NULL OR v_expected IS NULL THEN 'insufficient'
         WHEN p_actual_impact > v_expected THEN 'positive'
         WHEN p_actual_impact = v_expected THEN 'neutral'
         ELSE 'negative' END,
    COALESCE(p_evidence,'{}'::jsonb)
      || jsonb_build_object(
        'work_item_id',p_work_item_id,
        'outcome_delta',CASE WHEN v_expected IS NULL OR p_actual_impact IS NULL THEN NULL ELSE p_actual_impact-v_expected END
      )
  )
  ON CONFLICT(company_id,recommendation_key) DO UPDATE
    SET actual_impact=EXCLUDED.actual_impact,status=EXCLUDED.status,observed_at=now(),evidence=EXCLUDED.evidence;

  IF EXISTS (
    SELECT 1 FROM public.decision_work_items w
    WHERE w.company_id=v_company AND w.decision_id=v_decision AND w.status <> 'COMPLETED'
  ) THEN
    RETURN true;
  END IF;

  UPDATE public.business_intelligence_decisions
    SET status='EXECUTED', executed_at=now()
  WHERE id=v_decision AND company_id=v_company AND status='APPROVED';
  IF NOT FOUND THEN RAISE EXCEPTION 'DECISION_STATE_CHANGED'; END IF;
  RETURN true;
END;
$$;
