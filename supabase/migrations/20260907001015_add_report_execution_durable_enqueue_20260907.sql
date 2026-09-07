begin;

create or replace function public.enqueue_report_execution_job(
  p_company_id uuid,
  p_job_key text,
  p_source_path text,
  p_source_hash text,
  p_evidence_keys text[] default '{}',
  p_max_attempts integer default 5
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  existing public.report_execution_jobs%rowtype;
  inserted public.report_execution_jobs%rowtype;
  initial_checkpoint jsonb;
begin
  if p_company_id is null then raise exception 'company_id is required'; end if;
  if p_job_key is null or btrim(p_job_key) = '' then raise exception 'job_key is required'; end if;
  if p_source_path is null or btrim(p_source_path) = '' then raise exception 'source_path is required'; end if;
  if p_source_hash is null or btrim(p_source_hash) = '' then raise exception 'source_hash is required'; end if;
  if p_max_attempts < 1 or p_max_attempts > 100 then raise exception 'max_attempts must be between 1 and 100'; end if;

  initial_checkpoint := jsonb_build_object(
    'stage', 'queued',
    'sourceHash', p_source_hash,
    'evidenceKeys', coalesce(p_evidence_keys, '{}'),
    'updatedAt', floor(extract(epoch from clock_timestamp()) * 1000)::bigint
  );

  insert into public.report_execution_jobs (
    company_id, job_key, source_path, source_hash, status, checkpoint, max_attempts
  ) values (
    p_company_id, btrim(p_job_key), btrim(p_source_path), btrim(p_source_hash), 'queued', initial_checkpoint, p_max_attempts
  )
  on conflict (company_id, job_key) do nothing
  returning * into inserted;

  if inserted.id is null then
    select * into existing
    from public.report_execution_jobs
    where company_id = p_company_id and job_key = btrim(p_job_key)
    for update;

    if existing.source_hash <> btrim(p_source_hash) or existing.source_path <> btrim(p_source_path) then
      raise exception 'Durable job key already exists with different source identity';
    end if;
    return jsonb_build_object(
      'id', existing.id,
      'company_id', existing.company_id,
      'job_key', existing.job_key,
      'source_path', existing.source_path,
      'source_hash', existing.source_hash,
      'status', existing.status,
      'checkpoint', existing.checkpoint,
      'attempt', existing.attempt,
      'max_attempts', existing.max_attempts,
      'lease_owner', existing.lease_owner,
      'lease_token', existing.lease_token,
      'lease_expires_at', existing.lease_expires_at
    );
  end if;

  return jsonb_build_object(
    'id', inserted.id,
    'company_id', inserted.company_id,
    'job_key', inserted.job_key,
    'source_path', inserted.source_path,
    'source_hash', inserted.source_hash,
    'status', inserted.status,
    'checkpoint', inserted.checkpoint,
    'attempt', inserted.attempt,
    'max_attempts', inserted.max_attempts,
    'lease_owner', inserted.lease_owner,
    'lease_token', inserted.lease_token,
    'lease_expires_at', inserted.lease_expires_at
  );
end;
$$;

revoke all on function public.enqueue_report_execution_job(uuid,text,text,text,text[],integer) from public;
revoke all on function public.enqueue_report_execution_job(uuid,text,text,text,text[],integer) from anon;
revoke all on function public.enqueue_report_execution_job(uuid,text,text,text,text[],integer) from authenticated;
grant execute on function public.enqueue_report_execution_job(uuid,text,text,text,text[],integer) to service_role;

commit;
