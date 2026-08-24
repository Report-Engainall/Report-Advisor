-- Phase H: continuous trust, canaries and approval-bound autonomous remediation.
CREATE TABLE IF NOT EXISTS trust_canary_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  run_key text NOT NULL, environment text NOT NULL CHECK (environment IN ('development','staging','production')),
  started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
  status text NOT NULL CHECK (status IN ('running','passed','failed','blocked')) DEFAULT 'running',
  isolation_passed boolean, storage_passed boolean, realtime_passed boolean, retrieval_passed boolean,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb, UNIQUE(company_id, run_key)
);
CREATE INDEX IF NOT EXISTS idx_trust_canary_latest ON trust_canary_runs(company_id, environment, started_at DESC);

CREATE TABLE IF NOT EXISTS remediation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action_key text NOT NULL, incident_key text, action_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('PROPOSED','APPROVAL_REQUIRED','APPROVED','EXECUTING','SUCCEEDED','FAILED','CANCELLED')),
  idempotency_key text NOT NULL, requested_by uuid, approved_by uuid, requested_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz, completed_at timestamptz, attempt_count integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb, result jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(company_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_remediation_pending ON remediation_actions(company_id, status, requested_at DESC);

CREATE TABLE IF NOT EXISTS intelligence_safety_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  control_key text NOT NULL, control_version integer NOT NULL DEFAULT 1,
  enabled boolean NOT NULL DEFAULT true, threshold numeric NOT NULL, current_value numeric,
  tightened boolean NOT NULL DEFAULT false, reason text, evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(company_id, control_key)
);

CREATE TABLE IF NOT EXISTS service_liveness_probes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  service text NOT NULL, probe_key text NOT NULL, observed_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('pass','fail','degraded','blocked')), latency_ms numeric,
  replay_detected boolean NOT NULL DEFAULT false, evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(company_id, probe_key)
);
CREATE INDEX IF NOT EXISTS idx_liveness_latest ON service_liveness_probes(company_id, service, observed_at DESC);

CREATE TABLE IF NOT EXISTS trust_regression_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  incident_key text NOT NULL, regression_key text NOT NULL, linked_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('OPEN','VERIFIED','FAILED','WAIVED')) DEFAULT 'OPEN',
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb, UNIQUE(company_id, incident_key, regression_key)
);

ALTER TABLE trust_canary_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE remediation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_safety_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_liveness_probes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_regression_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE trust_canary_runs, remediation_actions, intelligence_safety_controls, service_liveness_probes, trust_regression_links FROM anon;

CREATE POLICY trust_canary_tenant ON trust_canary_runs FOR ALL TO authenticated USING (company_id = public.current_company_id()) WITH CHECK (company_id = public.current_company_id());
CREATE POLICY remediation_tenant ON remediation_actions FOR ALL TO authenticated USING (company_id = public.current_company_id()) WITH CHECK (company_id = public.current_company_id());
CREATE POLICY intelligence_safety_tenant ON intelligence_safety_controls FOR ALL TO authenticated USING (company_id = public.current_company_id()) WITH CHECK (company_id = public.current_company_id());
CREATE POLICY liveness_tenant ON service_liveness_probes FOR ALL TO authenticated USING (company_id = public.current_company_id()) WITH CHECK (company_id = public.current_company_id());
CREATE POLICY regression_links_tenant ON trust_regression_links FOR ALL TO authenticated USING (company_id = public.current_company_id()) WITH CHECK (company_id = public.current_company_id());

CREATE OR REPLACE FUNCTION public.is_continuous_trust_healthy()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM trust_certifications c
    WHERE c.company_id = public.current_company_id() AND c.status='valid' AND c.blocker_count=0 AND c.expires_at>now()
  ) AND NOT EXISTS (
    SELECT 1 FROM trust_canary_runs t
    WHERE t.company_id=public.current_company_id() AND t.status IN ('failed','blocked')
      AND t.started_at > now() - interval '24 hours'
  ) AND NOT EXISTS (
    SELECT 1 FROM service_liveness_probes p
    WHERE p.company_id=public.current_company_id() AND p.status IN ('fail','blocked')
      AND p.observed_at > now() - interval '1 hour'
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_continuous_trust_healthy() TO authenticated;

CREATE OR REPLACE FUNCTION public.approve_remediation(p_action_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE remediation_actions
     SET status='APPROVED', approved_by=auth.uid(), approved_at=now()
   WHERE id=p_action_id AND company_id=public.current_company_id() AND status='APPROVAL_REQUIRED';
  RETURN FOUND;
END;
$$;
GRANT EXECUTE ON FUNCTION public.approve_remediation(uuid) TO authenticated;
