-- W2.1 security closure: tenant-scope metric governance and audit.
-- BUSINESS_METRICS remains global calculation-definition SSOT; persisted governance
-- is tenant-scoped so authenticated consumers cannot read another company's
-- governance/evidence metadata.

ALTER TABLE public.metric_governance
  ADD COLUMN IF NOT EXISTS company_id uuid;

ALTER TABLE public.metric_governance_audit
  ADD COLUMN IF NOT EXISTS company_id uuid;

CREATE INDEX IF NOT EXISTS idx_metric_governance_company_metric_version
  ON public.metric_governance(company_id, metric_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_metric_governance_audit_company_metric
  ON public.metric_governance_audit(company_id, metric_id, created_at DESC);

DROP POLICY IF EXISTS metric_governance_authenticated_read ON public.metric_governance;
CREATE POLICY metric_governance_authenticated_tenant_read
  ON public.metric_governance
  FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());

DROP POLICY IF EXISTS metric_governance_audit_authenticated_read ON public.metric_governance_audit;
CREATE POLICY metric_governance_audit_authenticated_tenant_read
  ON public.metric_governance_audit
  FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());

CREATE OR REPLACE FUNCTION private.metric_governance_transition(
  p_metric_id text,
  p_version integer,
  p_to_status text,
  p_reason text
)
RETURNS public.metric_governance
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  v_company uuid := public.current_company_id();
  v_row public.metric_governance;
  v_from_status text;
  v_previous_version integer;
BEGIN
  IF auth.uid() IS NULL OR v_company IS NULL THEN
    RAISE EXCEPTION 'authenticated tenant actor required';
  END IF;
  IF p_to_status NOT IN ('DRAFT','REVIEWED','CERTIFIED','DEPRECATED') THEN
    RAISE EXCEPTION 'invalid certification status';
  END IF;
  IF NULLIF(trim(p_reason), '') IS NULL THEN
    RAISE EXCEPTION 'transition reason required';
  END IF;

  SELECT *
    INTO v_row
    FROM public.metric_governance
   WHERE company_id = v_company
     AND metric_id = p_metric_id
     AND version = p_version
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'metric version not found in current tenant: % v%', p_metric_id, p_version;
  END IF;

  v_from_status := v_row.certification_status;

  IF v_from_status='CERTIFIED' AND p_to_status NOT IN ('CERTIFIED','DEPRECATED') THEN
    RAISE EXCEPTION 'certified metric may only remain certified or be deprecated';
  END IF;
  IF v_from_status='DEPRECATED' AND p_to_status <> 'DEPRECATED' THEN
    RAISE EXCEPTION 'deprecated metric cannot be reactivated';
  END IF;
  IF v_from_status='DRAFT' AND p_to_status NOT IN ('DRAFT','REVIEWED') THEN
    RAISE EXCEPTION 'draft metric must be reviewed before certification';
  END IF;
  IF v_from_status='REVIEWED' AND p_to_status NOT IN ('REVIEWED','CERTIFIED','DEPRECATED') THEN
    RAISE EXCEPTION 'reviewed metric has an invalid transition';
  END IF;

  SELECT max(version)
    INTO v_previous_version
    FROM public.metric_governance
   WHERE company_id = v_company
     AND metric_id = p_metric_id
     AND version < p_version;

  UPDATE public.metric_governance
     SET certification_status = p_to_status,
         deprecated_at = CASE WHEN p_to_status='DEPRECATED' THEN now() ELSE deprecated_at END,
         updated_at = now()
   WHERE id = v_row.id
   RETURNING * INTO v_row;

  INSERT INTO public.metric_governance_audit(
    metric_governance_id, company_id, metric_id, from_status, to_status,
    actor_id, reason, previous_version
  )
  VALUES (
    v_row.id, v_company, v_row.metric_id, v_from_status, p_to_status,
    auth.uid(), p_reason, v_previous_version
  );

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION private.metric_governance_transition(text,integer,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.metric_governance_transition(text,integer,text,text) FROM anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.metric_governance_transition(text,integer,text,text) TO authenticated;

COMMENT ON COLUMN public.metric_governance.company_id IS
  'Canonical tenant boundary resolved through current_company_id(); calculation definitions remain global in BUSINESS_METRICS.';
COMMENT ON COLUMN public.metric_governance_audit.company_id IS
  'Tenant boundary copied from the governed metric version for audit isolation.';
