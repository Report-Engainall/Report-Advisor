-- Decision integrity hardening: a runtime decision cannot enter PROPOSED without
-- an actual evidence object. Empty evidence is not a valid decision basis.
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
SET search_path TO ''
AS $function$
DECLARE
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_company IS NULL OR v_user IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;
  IF p_decision_key IS NULL OR btrim(p_decision_key)='' THEN
    RAISE EXCEPTION 'DECISION_KEY_REQUIRED';
  END IF;
  IF p_decision_type IS NULL OR btrim(p_decision_type)='' THEN
    RAISE EXCEPTION 'DECISION_TYPE_REQUIRED';
  END IF;
  IF p_confidence IS NULL OR p_confidence < 0 OR p_confidence > 1 THEN
    RAISE EXCEPTION 'DECISION_CONFIDENCE_OUT_OF_RANGE';
  END IF;
  IF p_evidence IS NULL OR jsonb_typeof(p_evidence) <> 'object' OR p_evidence = '{}'::jsonb THEN
    RAISE EXCEPTION 'DECISION_EVIDENCE_REQUIRED';
  END IF;

  INSERT INTO public.business_intelligence_decisions(
    company_id, decision_key, decision_type, status, confidence, expected_impact, evidence
  )
  VALUES(
    v_company, p_decision_key, p_decision_type, 'PROPOSED', p_confidence, p_expected_impact, p_evidence
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;
