-- Tenant hardening for persisted semantic metric governance.
ALTER TABLE public.metric_governance ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.metric_governance_audit ADD COLUMN IF NOT EXISTS company_id uuid;
CREATE INDEX IF NOT EXISTS idx_metric_governance_company_metric_version ON public.metric_governance(company_id, metric_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_metric_governance_audit_company_metric ON public.metric_governance_audit(company_id, metric_id, created_at DESC);
ALTER POLICY metric_governance_authenticated_tenant_read ON public.metric_governance TO authenticated USING (company_id = public.current_company_id());
ALTER POLICY metric_governance_audit_authenticated_tenant_read ON public.metric_governance_audit TO authenticated USING (company_id = public.current_company_id());
