-- Durable universal source-analysis read model.
-- Keeps extracted structure, OCR text, visual metadata and mapping evidence
-- available after navigation/reload without forcing canonical business writes.

CREATE TABLE IF NOT EXISTS public.source_analysis_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  import_job_id uuid REFERENCES public.import_jobs(id) ON DELETE SET NULL,
  source_hash text NOT NULL,
  source_path text NOT NULL,
  source_format text NOT NULL,
  analysis_status text NOT NULL CHECK (analysis_status IN ('analyzed','completed','failed','skipped')),
  entity_type text NOT NULL,
  quality_score numeric,
  row_count integer NOT NULL DEFAULT 0,
  column_count integer NOT NULL DEFAULT 0,
  datasets jsonb NOT NULL DEFAULT '[]'::jsonb,
  canonical_text text NOT NULL DEFAULT '',
  visual_assets jsonb NOT NULL DEFAULT '[]'::jsonb,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS source_analysis_snapshots_company_created_idx
  ON public.source_analysis_snapshots(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS source_analysis_snapshots_company_hash_idx
  ON public.source_analysis_snapshots(company_id, source_hash);

ALTER TABLE public.source_analysis_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS source_analysis_snapshots_select ON public.source_analysis_snapshots;
DROP POLICY IF EXISTS source_analysis_snapshots_insert ON public.source_analysis_snapshots;
CREATE POLICY source_analysis_snapshots_select
  ON public.source_analysis_snapshots FOR SELECT TO authenticated
  USING ((SELECT current_company_id()) = company_id);
CREATE POLICY source_analysis_snapshots_insert
  ON public.source_analysis_snapshots FOR INSERT TO authenticated
  WITH CHECK ((SELECT current_company_id()) = company_id);

REVOKE ALL ON public.source_analysis_snapshots FROM anon;
GRANT SELECT, INSERT ON public.source_analysis_snapshots TO authenticated;
