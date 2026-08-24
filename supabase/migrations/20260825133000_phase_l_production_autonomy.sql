-- Phase L: connect production intelligence to executive evidence and controlled autonomy.
CREATE TABLE IF NOT EXISTS control_plane_health_snapshots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
 snapshot_key text NOT NULL, health_score numeric NOT NULL CHECK (health_score BETWEEN 0 AND 1),
 trust_healthy boolean NOT NULL DEFAULT false, critical_drift_count integer NOT NULL DEFAULT 0 CHECK (critical_drift_count >= 0),
 stale_job_count integer NOT NULL DEFAULT 0 CHECK (stale_job_count >= 0), blocked_decision_count integer NOT NULL DEFAULT 0 CHECK (blocked_decision_count >= 0),
 evidence jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(company_id,snapshot_key)
);
CREATE INDEX IF NOT EXISTS idx_control_plane_health_latest ON control_plane_health_snapshots(company_id,created_at DESC);

CREATE TABLE IF NOT EXISTS executive_evidence_graph (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
 graph_key text NOT NULL, node_type text NOT NULL CHECK (node_type IN ('source','metric','finding','decision','scenario','outcome','risk','recommendation')),
 node_key text NOT NULL, parent_key text, weight numeric NOT NULL DEFAULT 0, confidence numeric NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
 evidence jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(company_id,graph_key,node_type,node_key)
);
CREATE INDEX IF NOT EXISTS idx_executive_graph_nodes ON executive_evidence_graph(company_id,graph_key,node_type,node_key);

CREATE TABLE IF NOT EXISTS autonomy_certification_evidence (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
 certification_id uuid NOT NULL REFERENCES autonomy_certification_runs(id) ON DELETE CASCADE,
 gate_key text NOT NULL, passed boolean NOT NULL, measured_value numeric, threshold_value numeric,
 evidence jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(company_id,certification_id,gate_key)
);

DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['control_plane_health_snapshots','executive_evidence_graph','autonomy_certification_evidence'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON TABLE %I FROM anon',t);
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I',t||'_tenant',t);
  EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO authenticated USING(company_id=public.current_company_id()) WITH CHECK(company_id=public.current_company_id())',t||'_tenant',t);
 END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.can_run_phase_l_autonomy(p_domain_key text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS (
   SELECT 1 FROM autonomy_domain_controls c
   WHERE c.company_id=public.current_company_id() AND c.domain_key=p_domain_key
     AND c.enabled AND c.trust_state='eligible' AND c.rollback_enabled
 )
 AND public.is_continuous_trust_healthy('production')
 AND NOT EXISTS (
   SELECT 1 FROM control_plane_drift_events d
   WHERE d.company_id=public.current_company_id() AND d.severity IN ('high','critical') AND d.status IN ('open','blocked')
 )
 AND COALESCE((SELECT health_score FROM control_plane_health_snapshots h WHERE h.company_id=public.current_company_id() ORDER BY created_at DESC LIMIT 1),0) >= 0.90;
$$;
GRANT EXECUTE ON FUNCTION public.can_run_phase_l_autonomy(text) TO authenticated;
