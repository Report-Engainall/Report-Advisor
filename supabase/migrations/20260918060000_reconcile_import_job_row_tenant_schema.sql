-- Reconcile legacy/staging drift for governed import-job tenant invariants.
-- Normal deployments already carry the source lineage migrations; this closes environments
-- where import_jobs exists but import_job_rows lacks its denormalized tenant key.

ALTER TABLE import_jobs
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS source_fingerprint text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_import_jobs_company_idempotency
  ON import_jobs(company_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_import_jobs_company_source_fingerprint
  ON import_jobs(company_id, source_fingerprint)
  WHERE source_fingerprint IS NOT NULL;

ALTER TABLE import_job_rows
  ADD COLUMN IF NOT EXISTS company_id uuid;

UPDATE import_job_rows r
SET company_id = j.company_id
FROM import_jobs j
WHERE r.company_id IS NULL AND r.job_id = j.id;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM import_job_rows WHERE company_id IS NULL) THEN
    RAISE EXCEPTION 'import_job_rows.company_id backfill incomplete';
  END IF;
END $$; 
ALTER TABLE import_job_rows
  ALTER COLUMN company_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_import_jobs_id_company
  ON import_jobs(id, company_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_import_job_rows_id_company
  ON import_job_rows(id, company_id);

ALTER TABLE import_job_rows
  DROP CONSTRAINT IF EXISTS import_job_rows_job_company_fk;

ALTER TABLE import_job_rows
  ADD CONSTRAINT import_job_rows_job_company_fk
  FOREIGN KEY (job_id, company_id)
  REFERENCES import_jobs(id, company_id)
  ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_import_job_rows_company_job
  ON import_job_rows(company_id, job_id);

COMMENT ON COLUMN import_job_rows.company_id IS
  'Tenant invariant copied from import_jobs and enforced by compound foreign key.';
