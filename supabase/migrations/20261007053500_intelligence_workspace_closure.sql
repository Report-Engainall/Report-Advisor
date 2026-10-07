-- Intelligence workspace closure: durable saved views, causal/VOI evidence, and row/cell lineage.
-- All tables are tenant-bound and user-scoped where applicable.

CREATE TABLE IF NOT EXISTS public.saved_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  view_key text NOT NULL,
  name text NOT NULL,
  route text NOT NULL,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id, view_key)
);
CREATE INDEX IF NOT EXISTS idx_saved_views_user_route ON public.saved_views(company_id, user_id, route, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.intelligence_causal_hypotheses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  report_execution_job_id uuid REFERENCES public.report_execution_jobs(id) ON DELETE SET NULL,
  source_hash text NOT NULL,
  claim_key text NOT NULL,
  state text NOT NULL CHECK (state IN ('CORRELATION','EXPLANATION','CAUSAL_HYPOTHESIS','CAUSALITY_PROVEN','REVIEW_REQUIRED','UNRESOLVED')),
  evidence_supporting jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_contradicting jsonb NOT NULL DEFAULT '[]'::jsonb,
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  alternative_explanations jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  unresolved_cause boolean NOT NULL DEFAULT true,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, source_hash, claim_key)
);
CREATE INDEX IF NOT EXISTS idx_causal_hypotheses_job ON public.intelligence_causal_hypotheses(company_id, report_execution_job_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.intelligence_voi_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  report_execution_job_id uuid REFERENCES public.report_execution_jobs(id) ON DELETE SET NULL,
  source_hash text NOT NULL,
  question text NOT NULL,
  decision_key text NOT NULL,
  sensitivity numeric NOT NULL CHECK (sensitivity >= 0),
  estimated_value numeric NOT NULL CHECK (estimated_value >= 0),
  priority_score numeric NOT NULL CHECK (priority_score >= 0),
  minimum_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  state text NOT NULL CHECK (state IN ('OPEN','COLLECTING','SUFFICIENT','DEFERRED','BLOCKED')) DEFAULT 'OPEN',
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_voi_requests_priority ON public.intelligence_voi_requests(company_id, state, priority_score DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS public.report_cell_lineage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  source_version_id uuid REFERENCES public.report_source_versions(id) ON DELETE CASCADE,
  report_execution_job_id uuid REFERENCES public.report_execution_jobs(id) ON DELETE SET NULL,
  row_key text NOT NULL,
  source_locator text NOT NULL,
  source_field text NOT NULL,
  canonical_field text NOT NULL,
  transformation text,
  metric_key text,
  claim_key text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, report_execution_job_id, row_key, source_locator, canonical_field)
);
CREATE INDEX IF NOT EXISTS idx_report_cell_lineage_lookup ON public.report_cell_lineage(company_id, report_execution_job_id, row_key);
CREATE INDEX IF NOT EXISTS idx_report_cell_lineage_metric ON public.report_cell_lineage(company_id, metric_key, claim_key);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['saved_views','intelligence_causal_hypotheses','intelligence_voi_requests','report_cell_lineage'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS saved_views_owner ON public.saved_views;
CREATE POLICY saved_views_owner ON public.saved_views
  FOR ALL TO authenticated
  USING (company_id = public.current_company_id() AND user_id = auth.uid())
  WITH CHECK (company_id = public.current_company_id() AND user_id = auth.uid());

DROP POLICY IF EXISTS causal_hypotheses_tenant ON public.intelligence_causal_hypotheses;
CREATE POLICY causal_hypotheses_tenant ON public.intelligence_causal_hypotheses
  FOR ALL TO authenticated
  USING (company_id = public.current_company_id())
  WITH CHECK (company_id = public.current_company_id());

DROP POLICY IF EXISTS voi_requests_tenant ON public.intelligence_voi_requests;
CREATE POLICY voi_requests_tenant ON public.intelligence_voi_requests
  FOR ALL TO authenticated
  USING (company_id = public.current_company_id())
  WITH CHECK (company_id = public.current_company_id());

DROP POLICY IF EXISTS report_cell_lineage_tenant ON public.report_cell_lineage;
CREATE POLICY report_cell_lineage_tenant ON public.report_cell_lineage
  FOR ALL TO authenticated
  USING (company_id = public.current_company_id())
  WITH CHECK (company_id = public.current_company_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.intelligence_causal_hypotheses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.intelligence_voi_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_cell_lineage TO authenticated;
