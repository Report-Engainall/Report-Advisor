-- Prevent authenticated table writers from resurrecting terminal import jobs
-- or moving a job across tenants after creation.

CREATE OR REPLACE FUNCTION public.guard_import_job_lifecycle_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
    RAISE EXCEPTION 'IMPORT_JOB_TENANT_IMMUTABLE';
  END IF;

  IF OLD.status IN ('completed','partial','failed','cancelled')
     AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'IMPORT_JOB_TERMINAL_IMMUTABLE';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_import_jobs_lifecycle_guard ON public.import_jobs;

CREATE TRIGGER trg_import_jobs_lifecycle_guard
BEFORE UPDATE ON public.import_jobs
FOR EACH ROW
EXECUTE FUNCTION public.guard_import_job_lifecycle_update();

ALTER FUNCTION public.guard_import_job_lifecycle_update() SET search_path = public;
REVOKE ALL ON FUNCTION public.guard_import_job_lifecycle_update() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guard_import_job_lifecycle_update() TO authenticated;
