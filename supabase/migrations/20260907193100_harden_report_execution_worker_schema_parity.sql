-- Enforce the verified Staging nullability/default contract on replay.
-- If a pre-existing table contains incomplete source identity, fail closed rather
-- than silently certifying a schema that differs from the live worker contract.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.report_execution_jobs
    WHERE source_path IS NULL OR source_hash IS NULL
  ) THEN
    RAISE EXCEPTION 'report_execution_jobs contains rows without source identity; refusing schema parity migration';
  END IF;
END
$$;

ALTER TABLE public.report_execution_jobs
  ALTER COLUMN source_path SET NOT NULL,
  ALTER COLUMN source_hash SET NOT NULL,
  ALTER COLUMN max_attempts SET DEFAULT 5;

-- Keep the verified structural contract explicit after legacy convergence.
ALTER TABLE public.report_execution_jobs
  DROP CONSTRAINT IF EXISTS report_execution_jobs_company_id_fkey;
ALTER TABLE public.report_execution_jobs
  ADD CONSTRAINT report_execution_jobs_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
