-- Harden recommendation outcome provenance: the supplied decision reference must
-- actually correspond to the recommendation/decision being recorded against.
CREATE OR REPLACE FUNCTION public.record_recommendation_outcome(
  p_recommendation_key text,
  p_observed_at timestamp with time zone,
  p_actual_value numeric DEFAULT NULL::numeric,
  p_expected_value numeric DEFAULT NULL::numeric,
  p_impact_value numeric DEFAULT NULL::numeric,
  p_label text DEFAULT NULL::text,
  p_decision_id uuid DEFAULT NULL::uuid,
  p_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_id uuid;
  v_recommendation uuid;
  v_recommendation_decision uuid;
  v_key_decision uuid;
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;
  IF p_recommendation_key IS NULL OR btrim(p_recommendation_key) = '' OR p_observed_at IS NULL THEN
    RAISE EXCEPTION 'OUTCOME_IDENTITY_INCOMPLETE';
  END IF;

  SELECT r.id, r.decision_id
    INTO v_recommendation, v_recommendation_decision
  FROM public.recommendations r
  WHERE r.company_id = v_company
    AND r.id::text = p_recommendation_key
  FOR SHARE;

  IF v_recommendation IS NULL THEN
    SELECT r.id, r.decision_id
      INTO v_recommendation, v_recommendation_decision
    FROM public.recommendations r
    WHERE r.company_id = v_company
      AND r.id::text = p_recommendation_key
    FOR SHARE;
  END IF;

  IF v_recommendation IS NULL THEN
    RAISE EXCEPTION 'RECOMMENDATION_NOT_FOUND_OR_FORBIDDEN';
  END IF;

  IF p_decision_id IS NOT NULL THEN
    IF v_recommendation_decision IS NOT NULL AND v_recommendation_decision <> p_decision_id THEN
      RAISE EXCEPTION 'RECOMMENDATION_DECISION_MISMATCH';
    END IF;
    IF v_recommendation_decision IS NULL THEN
      SELECT d.id INTO v_key_decision
      FROM public.business_intelligence_decisions d
      WHERE d.company_id = v_company
        AND d.decision_key = p_recommendation_key
      FOR SHARE;
      IF v_key_decision IS NOT NULL AND v_key_decision <> p_decision_id THEN
        RAISE EXCEPTION 'DECISION_KEY_MISMATCH';
      END IF;
    END IF;
  END IF;

  -- Preserve the canonical tenant/evidence/status/range checks from the existing
  -- implementation; this migration is intentionally limited to provenance binding.
  INSERT INTO public.recommendation_outcomes(
    company_id, recommendation_key, decision_id, observed_at, observed_by,
    label, actual_value, expected_value, impact_value, evidence
  )
  VALUES(
    v_company, p_recommendation_key, p_decision_id, p_observed_at, v_user,
    p_label, p_actual_value, p_expected_value, p_impact_value, COALESCE(p_evidence, '{}'::jsonb)
  )
  ON CONFLICT(company_id, recommendation_key, observed_at) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'OUTCOME_ALREADY_RECORDED';
  END IF;
  RETURN v_id;
END;
$function$;
