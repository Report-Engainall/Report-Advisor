-- Canonical import source-field preservation and row-level lineage.
-- Keeps the normalized business write authoritative while preserving the complete
-- source row for audit, reconciliation, unmapped-field analysis, and replay.

CREATE TABLE IF NOT EXISTS public.import_job_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.import_jobs(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  status text NOT NULL DEFAULT 'valid',
  source_data jsonb NOT NULL,
  mapped_data jsonb,
  target_table text NOT NULL,
  target_id uuid,
  lineage jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, row_number)
);

CREATE INDEX IF NOT EXISTS idx_import_job_rows_company_job
  ON public.import_job_rows(company_id, job_id, row_number);

CREATE INDEX IF NOT EXISTS idx_import_job_rows_target
  ON public.import_job_rows(company_id, target_table, target_id);

ALTER TABLE public.import_job_rows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS import_job_rows_select ON public.import_job_rows;
CREATE POLICY import_job_rows_select
  ON public.import_job_rows FOR SELECT TO authenticated
  USING (company_id = public.current_company_id());

DROP POLICY IF EXISTS import_job_rows_insert ON public.import_job_rows;
CREATE POLICY import_job_rows_insert
  ON public.import_job_rows FOR INSERT TO authenticated
  WITH CHECK (company_id = public.current_company_id());

DROP POLICY IF EXISTS import_job_rows_update ON public.import_job_rows;
CREATE POLICY import_job_rows_update
  ON public.import_job_rows FOR UPDATE TO authenticated
  USING (company_id = public.current_company_id())
  WITH CHECK (company_id = public.current_company_id());

DROP POLICY IF EXISTS import_job_rows_delete ON public.import_job_rows;
CREATE POLICY import_job_rows_delete
  ON public.import_job_rows FOR DELETE TO authenticated
  USING (company_id = public.current_company_id());

CREATE OR REPLACE FUNCTION public.import_commit_batch_with_lineage(
  p_company_id uuid,
  p_entity_type text,
  p_rows jsonb,
  p_source_rows jsonb,
  p_null_policy text DEFAULT 'preserve'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_result jsonb;
  v_ids jsonb;
  v_item jsonb;
  v_index integer;
  v_job_id uuid;
BEGIN
  IF v_company_id IS NULL OR v_company_id <> p_company_id THEN
    RAISE EXCEPTION 'IMPORT_TENANT_CONTEXT_REQUIRED';
  END IF;

  IF jsonb_typeof(p_rows) <> 'array' OR jsonb_typeof(p_source_rows) <> 'array' THEN
    RAISE EXCEPTION 'IMPORT_ROWS_MUST_BE_JSON_ARRAYS';
  END IF;

  IF jsonb_array_length(p_rows) <> jsonb_array_length(p_source_rows) THEN
    RAISE EXCEPTION 'IMPORT_SOURCE_ROW_COUNT_MISMATCH';
  END IF;

  v_result := public.import_commit_batch(
    p_company_id,
    p_entity_type,
    p_rows,
    p_null_policy
  );

  v_ids := COALESCE(v_result -> 'ids', '[]'::jsonb);
  IF jsonb_array_length(v_ids) <> jsonb_array_length(p_rows) THEN
    RAISE EXCEPTION 'IMPORT_COMMIT_RESULT_MISMATCH';
  END IF;

  FOR v_item, v_index IN
    SELECT value, ordinality::integer
    FROM jsonb_array_elements(p_source_rows) WITH ORDINALITY
  LOOP
    v_job_id := NULLIF(v_item ->> 'job_id', '')::uuid;
    IF v_job_id IS NULL THEN
      RAISE EXCEPTION 'IMPORT_SOURCE_JOB_REQUIRED';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.import_jobs
      WHERE id = v_job_id
        AND company_id = v_company_id
    ) THEN
      RAISE EXCEPTION 'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN';
    END IF;

    INSERT INTO public.import_job_rows (
      company_id,
      job_id,
      row_number,
      status,
      source_data,
      mapped_data,
      target_table,
      target_id,
      lineage
    )
    VALUES (
      v_company_id,
      v_job_id,
      COALESCE(NULLIF(v_item ->> 'row_number', '')::integer, v_index),
      COALESCE(NULLIF(v_item ->> 'status', ''), 'valid'),
      COALESCE(v_item -> 'source_data', v_item),
      COALESCE(v_item -> 'mapped_data', p_rows -> (v_index - 1)),
      COALESCE(NULLIF(v_item ->> 'target_table', ''), p_entity_type),
      NULLIF(v_ids ->> (v_index - 1), '')::uuid,
      COALESCE(v_item -> 'lineage', '{}'::jsonb)
    );
  END LOOP;

  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.import_commit_batch_with_lineage(uuid, text, jsonb, jsonb, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.import_commit_batch_with_lineage(uuid, text, jsonb, jsonb, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch_with_lineage(uuid, text, jsonb, jsonb, text) TO authenticated;

COMMENT ON FUNCTION public.import_commit_batch_with_lineage(uuid, text, jsonb, jsonb, text)
IS 'Canonical import plus transactional preservation of complete source rows in import_job_rows; unmapped source fields are retained for analysis and lineage.';
