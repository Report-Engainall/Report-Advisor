-- Enforce the verified Staging nullability/default contract on replay.
-- Validate legacy data first, then make the final nullability constraints explicit.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.report_execution_jobs
    WHERE source_path IS NULL OR source_hash IS NULL
  ) THEN
    RAISE EXCEPTION 'report_execution_jobs contains rows without source identity; refusing schema parity migration';
  END IF;

  UPDATE public.report_execution_jobs
  SET max_attempts = 5
  WHERE max_attempts IS NULL;
END
$$;

ALTER TABLE public.report_execution_jobs
  ADD CONSTRAINT report_execution_jobs_source_path_not_null_check CHECK (source_path IS NOT NULL) NOT VALID,
  ADD CONSTRAINT report_execution_jobs_source_hash_not_null_check CHECK (source_hash IS NOT NULL) NOT VALID,
  ADD CONSTRAINT report_execution_jobs_max_attempts_not_null_check CHECK (max_attempts IS NOT NULL) NOT VALID;

ALTER TABLE public.report_execution_jobs
  VALIDATE CONSTRAINT report_execution_jobs_source_path_not_null_check;
ALTER TABLE public.report_execution_jobs
  VALIDATE CONSTRAINT report_execution_jobs_source_hash_not_null_check;
ALTER TABLE public.report_execution_jobs
  VALIDATE CONSTRAINT report_execution_jobs_max_attempts_not_null_check;

ALTER TABLE public.report_execution_jobs
  ALTER COLUMN source_path SET NOT NULL,
  ALTER COLUMN source_hash SET NOT NULL,
  ALTER COLUMN max_attempts SET DEFAULT 5,
  ALTER COLUMN max_attempts SET NOT NULL;

ALTER TABLE public.report_execution_jobs
  DROP CONSTRAINT IF EXISTS report_execution_jobs_company_id_fkey;
ALTER TABLE public.report_execution_jobs
  ADD CONSTRAINT report_execution_jobs_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.report_execution_jobs
  VALIDATE CONSTRAINT report_execution_jobs_company_id_fkey;
