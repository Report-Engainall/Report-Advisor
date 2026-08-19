-- Report Studio foundation: tenant-scoped saved report definitions and schedules.
CREATE TABLE IF NOT EXISTS report_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  report_type text NOT NULL DEFAULT 'dashboard',
  definition jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_report_definitions_company_updated ON report_definitions(company_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS report_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  report_id uuid NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,
  frequency text NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  next_run_at timestamptz,
  recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_report_schedules_company_next ON report_schedules(company_id, enabled, next_run_at);

ALTER TABLE report_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS report_definitions_select ON report_definitions;
CREATE POLICY report_definitions_select ON report_definitions FOR SELECT TO authenticated USING (public.has_company_access(company_id));
DROP POLICY IF EXISTS report_definitions_insert ON report_definitions;
CREATE POLICY report_definitions_insert ON report_definitions FOR INSERT TO authenticated WITH CHECK (public.has_company_access(company_id) AND created_by = auth.uid());
DROP POLICY IF EXISTS report_definitions_update ON report_definitions;
CREATE POLICY report_definitions_update ON report_definitions FOR UPDATE TO authenticated USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id));
DROP POLICY IF EXISTS report_definitions_delete ON report_definitions;
CREATE POLICY report_definitions_delete ON report_definitions FOR DELETE TO authenticated USING (public.has_company_access(company_id));

DROP POLICY IF EXISTS report_schedules_select ON report_schedules;
CREATE POLICY report_schedules_select ON report_schedules FOR SELECT TO authenticated USING (public.has_company_access(company_id));
DROP POLICY IF EXISTS report_schedules_insert ON report_schedules;
CREATE POLICY report_schedules_insert ON report_schedules FOR INSERT TO authenticated WITH CHECK (public.has_company_access(company_id) AND created_by = auth.uid() AND EXISTS (SELECT 1 FROM report_definitions r WHERE r.id = report_id AND r.company_id = report_schedules.company_id));
DROP POLICY IF EXISTS report_schedules_update ON report_schedules;
CREATE POLICY report_schedules_update ON report_schedules FOR UPDATE TO authenticated USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id) AND EXISTS (SELECT 1 FROM report_definitions r WHERE r.id = report_id AND r.company_id = report_schedules.company_id));
DROP POLICY IF EXISTS report_schedules_delete ON report_schedules;
CREATE POLICY report_schedules_delete ON report_schedules FOR DELETE TO authenticated USING (public.has_company_access(company_id));

COMMENT ON TABLE report_definitions IS 'Tenant-scoped Report Studio definitions. The JSON definition references semantic metrics, not raw cross-tenant data.';
COMMENT ON TABLE report_schedules IS 'Tenant-scoped scheduled reports. Workers must execute with explicit company context.';
