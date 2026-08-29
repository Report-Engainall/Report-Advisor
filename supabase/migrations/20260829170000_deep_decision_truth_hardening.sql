-- Deep truth hardening: make decision workflow transitions and provenance fail-closed.
-- This migration is intentionally additive and does not alter existing business data.

-- Prevent cross-tenant recommendation links from being created through the
-- nullable recommendation_id columns. The composite keys below are only used
-- for integrity checks and preserve the existing single-column FKs.
CREATE UNIQUE INDEX IF NOT EXISTS uq_recommendations_company_id_id
  ON public.recommendations(company_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_bi_decisions_company_id_id
  ON public.business_intelligence_decisions(company_id, id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='recommendations_decision_same_tenant_fk') THEN
    ALTER TABLE public.recommendations
      ADD CONSTRAINT recommendations_decision_same_tenant_fk
      FOREIGN KEY (company_id, decision_id)
      REFERENCES public.business_intelligence_decisions(company_id, id)
      ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='decisions_recommendation_same_tenant_fk') THEN
    ALTER TABLE public.business_intelligence_decisions
      ADD CONSTRAINT decisions_recommendation_same_tenant_fk
      FOREIGN KEY (company_id, recommendation_id)
      REFERENCES public.recommendations(company_id, id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Approval rows must identify who requested/decided them when the transition
-- has happened. Keep the columns nullable for legacy PENDING rows.
ALTER TABLE public.decision_approvals
  ADD CONSTRAINT decision_approval_temporal_ck
  CHECK (decided_at IS NULL OR decided_at >= requested_at) NOT VALID;

ALTER TABLE public.business_intelligence_decisions
  ADD CONSTRAINT decision_approved_temporal_ck
  CHECK (approved_at IS NULL OR approved_at >= created_at) NOT VALID;

ALTER TABLE public.decision_work_items
  ADD CONSTRAINT work_item_temporal_ck
  CHECK (
    (started_at IS NULL OR started_at >= created_at)
    AND (completed_at IS NULL OR completed_at >= created_at)
    AND (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
    AND (updated_at >= created_at)
  ) NOT VALID;

-- Approval RPC: record the authenticated actor instead of silently leaving
-- decided_by/approved_by empty.
CREATE OR REPLACE FUNCTION public.decide_approval(p_approval_id uuid, p_approve boolean, p_reason text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_company uuid := public.current_company_id();
  v_actor uuid := auth.uid();
  v_decision uuid;
  v_status text;
BEGIN
  IF v_company IS NULL OR v_actor IS NULL THEN RAISE EXCEPTION 'AUTH_CONTEXT_REQUIRED'; END IF;
  SELECT decision_id,status INTO v_decision,v_status
  FROM public.decision_approvals
  WHERE id=p_approval_id AND company_id=v_company
  FOR UPDATE;
  IF v_decision IS NULL OR v_status <> 'PENDING' THEN RAISE EXCEPTION 'APPROVAL_NOT_PENDING'; END IF;

  UPDATE public.decision_approvals
  SET status=CASE WHEN p_approve THEN 'APPROVED' ELSE 'REJECTED' END,
      decided_at=now(), decided_by=v_actor, reason=p_reason
  WHERE id=p_approval_id AND company_id=v_company;

  UPDATE public.business_intelligence_decisions
  SET status=CASE WHEN p_approve THEN 'APPROVED' ELSE 'REJECTED' END,
      approved_at=CASE WHEN p_approve THEN now() ELSE NULL END,
      approved_by=CASE WHEN p_approve THEN v_actor ELSE NULL END,
      rejection_reason=CASE WHEN p_approve THEN NULL ELSE p_reason END
  WHERE id=v_decision AND company_id=v_company;
  RETURN true;
END;
$$;

-- Completion must only happen for an approved decision and must not silently
-- rewrite an existing recommendation outcome. A second completion is rejected.
CREATE OR REPLACE FUNCTION public.complete_decision_work_item(p_work_item_id uuid, p_actual_impact numeric, p_evidence jsonb DEFAULT '{}'::jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_company uuid := public.current_company_id();
  v_actor uuid := auth.uid();
  v_expected numeric;
  v_decision uuid;
  v_recommendation_key text;
  v_decision_status text;
BEGIN
  IF v_company IS NULL OR v_actor IS NULL THEN RAISE EXCEPTION 'AUTH_CONTEXT_REQUIRED'; END IF;

  SELECT wi.expected_impact,wi.decision_id,d.status
    INTO v_expected,v_decision,v_decision_status
  FROM public.decision_work_items wi
  JOIN public.business_intelligence_decisions d
    ON d.id=wi.decision_id AND d.company_id=wi.company_id
  WHERE wi.id=p_work_item_id AND wi.company_id=v_company
  FOR UPDATE;

  IF v_decision IS NULL THEN RAISE EXCEPTION 'WORK_ITEM_NOT_FOUND'; END IF;
  IF v_decision_status <> 'APPROVED' THEN RAISE EXCEPTION 'DECISION_NOT_APPROVED'; END IF;
  IF EXISTS (SELECT 1 FROM public.decision_work_items WHERE id=p_work_item_id AND company_id=v_company AND status='COMPLETED') THEN
    RAISE EXCEPTION 'WORK_ITEM_ALREADY_COMPLETED';
  END IF;

  UPDATE public.decision_work_items
  SET status='COMPLETED', actual_impact=p_actual_impact, completed_at=now(), updated_at=now(),
      evidence_refs=COALESCE(p_evidence,'{}'::jsonb)
  WHERE id=p_work_item_id AND company_id=v_company;

  SELECT COALESCE(r.id::text, d.decision_key) INTO v_recommendation_key
  FROM public.business_intelligence_decisions d
  LEFT JOIN public.recommendations r ON r.id=d.recommendation_id AND r.company_id=v_company
  WHERE d.id=v_decision AND d.company_id=v_company;

  IF EXISTS (SELECT 1 FROM public.recommendation_outcomes
             WHERE company_id=v_company AND recommendation_key=v_recommendation_key) THEN
    RAISE EXCEPTION 'OUTCOME_ALREADY_RECORDED';
  END IF;

  INSERT INTO public.recommendation_outcomes(
    company_id,recommendation_key,decision_id,expected_impact,actual_impact,status,evidence
  ) VALUES (
    v_company,v_recommendation_key,v_decision,v_expected,p_actual_impact,
    CASE WHEN p_actual_impact IS NULL OR v_expected IS NULL THEN 'insufficient'
         WHEN p_actual_impact > v_expected THEN 'positive'
         WHEN p_actual_impact = v_expected THEN 'neutral'
         ELSE 'negative' END,
    jsonb_build_object('work_item_id',p_work_item_id,'actor_id',v_actor,
      'outcome_delta',CASE WHEN v_expected IS NULL OR p_actual_impact IS NULL THEN NULL ELSE p_actual_impact-v_expected END)
      || COALESCE(p_evidence,'{}'::jsonb)
  );

  UPDATE public.business_intelligence_decisions
  SET status='EXECUTED', executed_at=now()
  WHERE id=v_decision AND company_id=v_company AND status='APPROVED';
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decide_approval(uuid,boolean,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_decision_work_item(uuid,numeric,jsonb) TO authenticated;

-- Validate only after creation so existing production rows are not modified.
ALTER TABLE public.decision_approvals VALIDATE CONSTRAINT decision_approval_temporal_ck;
ALTER TABLE public.business_intelligence_decisions VALIDATE CONSTRAINT decision_approved_temporal_ck;
ALTER TABLE public.decision_work_items VALIDATE CONSTRAINT work_item_temporal_ck;
