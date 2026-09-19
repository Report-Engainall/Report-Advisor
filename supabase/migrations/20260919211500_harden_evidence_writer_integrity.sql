-- Forward-only evidence integrity hardening.
-- Tenant RLS remains required for reads, but authenticated clients are read-only.
-- Authoritative writers are existing SECURITY DEFINER functions / trusted workers.
REVOKE ALL ON TABLE public.kpi_evidence_snapshots FROM authenticated;
REVOKE ALL ON TABLE public.report_row_lineage FROM authenticated;
REVOKE ALL ON TABLE public.report_source_versions FROM authenticated;

GRANT SELECT ON TABLE public.kpi_evidence_snapshots TO authenticated;
GRANT SELECT ON TABLE public.report_row_lineage TO authenticated;
GRANT SELECT ON TABLE public.report_source_versions TO authenticated;

DROP POLICY IF EXISTS kpi_evidence_tenant ON public.kpi_evidence_snapshots;
CREATE POLICY kpi_evidence_select_tenant
  ON public.kpi_evidence_snapshots
  FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());

DROP POLICY IF EXISTS report_row_lineage_tenant ON public.report_row_lineage;
CREATE POLICY report_row_lineage_select_tenant
  ON public.report_row_lineage
  FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());

DROP POLICY IF EXISTS report_source_versions_tenant ON public.report_source_versions;
CREATE POLICY report_source_versions_select_tenant
  ON public.report_source_versions
  FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());
