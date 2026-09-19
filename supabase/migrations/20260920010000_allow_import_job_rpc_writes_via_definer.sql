-- Allow the authenticated import pipeline to advance job state through the
-- authoritative RPCs without granting direct UPDATE on import_jobs.

revoke all on function public.import_finish_job(uuid,text,jsonb,text) from public;
revoke all on function public.import_finish_job(uuid,text,jsonb,text) from anon;
grant execute on function public.import_finish_job(uuid,text,jsonb,text) to authenticated;
alter function public.import_finish_job(uuid,text,jsonb,text)
  security definer
  set search_path = public, pg_catalog;

revoke all on function public.import_update_job_progress(uuid,integer,integer,integer,integer,text) from public;
revoke all on function public.import_update_job_progress(uuid,integer,integer,integer,integer,text) from anon;
grant execute on function public.import_update_job_progress(uuid,integer,integer,integer,integer,text) to authenticated;
alter function public.import_update_job_progress(uuid,integer,integer,integer,integer,text)
  security definer
  set search_path = public, pg_catalog;
