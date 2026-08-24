-- Phase M: final production certification must be evidence-backed and rollback-verifiable.
CREATE TABLE IF NOT EXISTS production_certification_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
 certification_key text NOT NULL, status text NOT NULL CHECK(status IN ('running','passed','blocked','failed')) DEFAULT 'running',
 tenant_isolation boolean NOT NULL DEFAULT false, storage_canary boolean NOT NULL DEFAULT false, realtime_canary boolean NOT NULL DEFAULT false,
 ai_isolation boolean NOT NULL DEFAULT false, backup_restore boolean NOT NULL DEFAULT false, migration_parity boolean NOT NULL DEFAULT false,
 artifact_integrity boolean NOT NULL DEFAULT false, rollback_verified boolean NOT NULL DEFAULT false,
 evidence jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 UNIQUE(company_id,certification_key)
);
CREATE TABLE IF NOT EXISTS production_rollback_drills (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
 drill_key text NOT NULL, target_scope text NOT NULL, status text NOT NULL CHECK(status IN ('planned','running','passed','failed')) DEFAULT 'planned',
 pre_state jsonb NOT NULL DEFAULT '{}'::jsonb, rollback_state jsonb NOT NULL DEFAULT '{}'::jsonb,
 forward_fix_state jsonb NOT NULL DEFAULT '{}'::jsonb, evidence jsonb NOT NULL DEFAULT '{}'::jsonb, executed_at timestamptz,
 UNIQUE(company_id,drill_key)
);

DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['production_certification_runs','production_rollback_drills'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON TABLE %I FROM anon',t);
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I',t||'_tenant',t);
  EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO authenticated USING(company_id=public.current_company_id()) WITH CHECK(company_id=public.current_company_id())',t||'_tenant',t);
 END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.can_release_production_certification()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS (
  SELECT 1 FROM production_certification_runs p
  WHERE p.company_id=public.current_company_id() AND p.status='passed'
    AND p.tenant_isolation AND p.storage_canary AND p.realtime_canary AND p.ai_isolation
    AND p.backup_restore AND p.migration_parity AND p.artifact_integrity AND p.rollback_verified
    AND p.created_at > now() - interval '24 hours'
 )
 AND public.is_continuous_trust_healthy('production')
 AND NOT EXISTS (
   SELECT 1 FROM control_plane_drift_events d WHERE d.company_id=public.current_company_id()
   AND d.severity='critical' AND d.status IN ('open','blocked')
 );
$$;
GRANT EXECUTE ON FUNCTION public.can_release_production_certification() TO authenticated;
