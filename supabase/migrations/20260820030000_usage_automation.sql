-- Tenant-scoped usage metering and execution ledger.
CREATE TABLE IF NOT EXISTS tenant_usage_daily (
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  processed_rows bigint NOT NULL DEFAULT 0 CHECK (processed_rows >= 0),
  document_pages integer NOT NULL DEFAULT 0 CHECK (document_pages >= 0),
  ocr_pages integer NOT NULL DEFAULT 0 CHECK (ocr_pages >= 0),
  ai_requests integer NOT NULL DEFAULT 0 CHECK (ai_requests >= 0),
  api_requests integer NOT NULL DEFAULT 0 CHECK (api_requests >= 0),
  storage_bytes bigint NOT NULL DEFAULT 0 CHECK (storage_bytes >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, usage_date)
);

CREATE TABLE IF NOT EXISTS report_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  report_id uuid NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,
  schedule_id uuid REFERENCES report_schedules(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','failed','cancelled')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz,
  row_count integer,
  output_uri text,
  error_code text,
  error_message text
);
CREATE INDEX IF NOT EXISTS idx_report_runs_company_requested ON report_runs(company_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_runs_queue ON report_runs(status, requested_at) WHERE status = 'queued';

CREATE TABLE IF NOT EXISTS automation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  source text NOT NULL DEFAULT 'decision_engine',
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','running','completed','rejected','failed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  title text NOT NULL,
  rationale text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_automation_actions_company_status ON automation_actions(company_id, status, priority, created_at DESC);

ALTER TABLE tenant_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_usage_daily_select ON tenant_usage_daily FOR SELECT TO authenticated USING (public.has_company_access(company_id));
CREATE POLICY report_runs_select ON report_runs FOR SELECT TO authenticated USING (public.has_company_access(company_id));
CREATE POLICY report_runs_insert ON report_runs FOR INSERT TO authenticated WITH CHECK (
  public.has_company_access(company_id) AND EXISTS (
    SELECT 1 FROM report_definitions r WHERE r.id = report_id AND r.company_id = report_runs.company_id
  )
);
CREATE POLICY automation_actions_select ON automation_actions FOR SELECT TO authenticated USING (public.has_company_access(company_id));
CREATE POLICY automation_actions_insert ON automation_actions FOR INSERT TO authenticated WITH CHECK (public.has_company_access(company_id) AND (created_by IS NULL OR created_by = auth.uid()));
CREATE POLICY automation_actions_update ON automation_actions FOR UPDATE TO authenticated USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id));

CREATE OR REPLACE FUNCTION public.increment_usage(
  p_company_id uuid,
  p_usage_date date,
  p_processed_rows bigint DEFAULT 0,
  p_document_pages integer DEFAULT 0,
  p_ocr_pages integer DEFAULT 0,
  p_ai_requests integer DEFAULT 0,
  p_api_requests integer DEFAULT 0,
  p_storage_bytes bigint DEFAULT 0
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  IF NOT public.has_company_access(p_company_id) THEN
    RAISE EXCEPTION 'tenant_access_denied';
  END IF;
  INSERT INTO tenant_usage_daily(company_id, usage_date, processed_rows, document_pages, ocr_pages, ai_requests, api_requests, storage_bytes)
  VALUES (p_company_id, p_usage_date, p_processed_rows, p_document_pages, p_ocr_pages, p_ai_requests, p_api_requests, p_storage_bytes)
  ON CONFLICT (company_id, usage_date) DO UPDATE SET
    processed_rows = tenant_usage_daily.processed_rows + EXCLUDED.processed_rows,
    document_pages = tenant_usage_daily.document_pages + EXCLUDED.document_pages,
    ocr_pages = tenant_usage_daily.ocr_pages + EXCLUDED.ocr_pages,
    ai_requests = tenant_usage_daily.ai_requests + EXCLUDED.ai_requests,
    api_requests = tenant_usage_daily.api_requests + EXCLUDED.api_requests,
    storage_bytes = tenant_usage_daily.storage_bytes + EXCLUDED.storage_bytes,
    updated_at = now();
END;
$$;

COMMENT ON TABLE tenant_usage_daily IS 'Tenant-scoped metering ledger; workers should increment usage only through the guarded RPC.';
COMMENT ON TABLE report_runs IS 'Auditable report execution ledger. A worker must preserve company_id from the authorized schedule.';
COMMENT ON TABLE automation_actions IS 'Explainable decision-to-action queue. External side effects require explicit approval unless a future policy permits automation.';
