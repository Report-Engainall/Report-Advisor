DROP POLICY IF EXISTS canonical_import_commits_tenant_insert ON public.canonical_import_commits;
CREATE POLICY canonical_import_commits_tenant_insert ON public.canonical_import_commits
  FOR INSERT TO authenticated
  WITH CHECK (company_id = public.current_company_id());
GRANT INSERT ON public.canonical_import_commits TO authenticated;
