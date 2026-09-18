-- Forward-only server-boundary reconciliation for durable import enqueue.
-- Authenticated browser clients remain denied EXECUTE. The API validates the caller
-- and tenant first, then uses service_role for the internal durable enqueue boundary.
begin;

create or replace function public.enqueue_report_execution_job(
  p_company_id uuid,
  p_job_key text,
  p_source_path text,
  p_source_hash text,
  p_evidence_keys text[] default '{}',
  p_max_attempts integer default 3
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_catalog'
as $function$
declare
  v_is_service_role boolean := coalesce(auth.jwt()->>'role','') = 'service_role';
  v_company_id uuid := case
    when v_is_service_role then p_company_id
    else public.current_company_id()
  end;
  v_job public.report_execution_jobs%rowtype;
begin
  if not v_is_service_role and (select auth.uid()) is null then
    raise exception 'AUTHENTICATED_USER_REQUIRED';
  end if;

  if p_company_id is null then
    raise exception 'TENANT_CONTEXT_REQUIRED';
  end if;

  if not v_is_service_role then
    if v_company_id is null or p_company_id is distinct from v_company_id then
      raise exception 'TENANT_CONTEXT_MISMATCH';
    end if;
  end if;

  if p_job_key is null or btrim(p_job_key) = '' then
    raise exception 'REPORT_EXECUTION_JOB_KEY_REQUIRED';
  end if;

  if p_source_path is null or btrim(p_source_path) = '' then
    raise exception 'REPORT_EXECUTION_SOURCE_PATH_REQUIRED';
  end if;

  if p_source_hash is null or p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' then
    raise exception 'REPORT_EXECUTION_SOURCE_HASH_INVALID';
  end if;

  if coalesce(p_max_attempts, 0) < 1 then
    raise exception 'REPORT_EXECUTION_MAX_ATTEMPTS_INVALID';
  end if;

  insert into public.report_execution_jobs(
    company_id, job_key, source_path, source_hash, status, checkpoint, max_attempts, evidence
  )
  values (
    p_company_id,
    p_job_key,
    p_source_path,
    p_source_hash,
    'queued',
    jsonb_build_object(
      'stage','queued',
      'sourceHash',p_source_hash,
      'evidenceKeys',coalesce(to_jsonb(p_evidence_keys),'[]'::jsonb),
      'updatedAt',floor(extract(epoch from clock_timestamp())*1000)::bigint
    ),
    least(p_max_attempts,20),
    jsonb_build_object('keys',coalesce(to_jsonb(p_evidence_keys),'[]'::jsonb))
  )
  on conflict(company_id,job_key) do nothing;

  select * into v_job
  from public.report_execution_jobs
  where company_id=p_company_id and job_key=p_job_key
  for update;

  if not found then
    raise exception 'REPORT_EXECUTION_JOB_NOT_FOUND';
  end if;

  if v_job.source_hash is distinct from p_source_hash or v_job.source_path is distinct from p_source_path then
    raise exception 'REPORT_EXECUTION_JOB_SOURCE_IDENTITY_MISMATCH';
  end if;

  return jsonb_build_object(
    'id',v_job.id,
    'company_id',v_job.company_id,
    'status',v_job.status,
    'checkpoint',v_job.checkpoint,
    'attempt',v_job.attempt,
    'max_attempts',v_job.max_attempts,
    'lease_owner',v_job.lease_owner,
    'lease_token',v_job.lease_token,
    'lease_expires_at',v_job.lease_expires_at
  );
end;
$function$;

revoke execute on function public.enqueue_report_execution_job(uuid, text, text, text, text[], integer)
from public, anon, authenticated;
grant execute on function public.enqueue_report_execution_job(uuid, text, text, text, text[], integer)
to service_role;
alter function public.enqueue_report_execution_job(uuid, text, text, text, text[], integer)
  set search_path = public, pg_catalog;

commit;
