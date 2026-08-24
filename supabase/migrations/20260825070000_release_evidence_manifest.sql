-- Phase G: reproducible release evidence and deployment verification.
CREATE TABLE IF NOT EXISTS release_evidence_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  release_key text NOT NULL,
  source_sha text NOT NULL,
  migration_fingerprint text NOT NULL,
  dependency_fingerprint text NOT NULL,
  artifact_fingerprint text NOT NULL,
  certification_id uuid REFERENCES trust_certifications(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('candidate','canary','verified','blocked','rolled_back')),
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  rollback_at timestamptz,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(company_id, release_key)
);
CREATE INDEX IF NOT EXISTS idx_release_evidence_latest ON release_evidence_manifests(company_id, created_at DESC);
ALTER TABLE release_evidence_manifests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE release_evidence_manifests FROM anon;
DROP POLICY IF EXISTS authenticated_release_evidence_tenant ON release_evidence_manifests;
CREATE POLICY authenticated_release_evidence_tenant ON release_evidence_manifests FOR ALL TO authenticated USING (company_id = public.current_company_id()) WITH CHECK (company_id = public.current_company_id());
