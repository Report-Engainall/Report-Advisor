-- Forward-only provenance reconciliation for the live durable-worker claim contract.
-- The live migration ledger records this version as 20260907000931.
-- Keep the source tree replayable without rewriting an already-applied migration.

create or replace function public.claim_report_execution_job(
  p_job_id uuid,
  p_company_id uuid,
  p_lease_owner text,
  p_lease_seconds integer default 300
)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
declare
  claimed_row jsonb;
begin
  if p_company_id is null then
    raise exception 'Worker company context is required';
  end if;
  if p_lease_owner is null or btrim(p_lease_owner) = '' then
    raise exception 'Worker lease owner is required';
  end if;
  if p_lease_seconds < 30 then
    raise exception 'Worker lease must be at least 30 seconds';
  end if;

  update public.report_execution_jobs
     set status = 'dead_letter',
         lease_owner = null,
         lease_token = null,
         lease_expires_at = null,
         last_error = jsonb_build_object(
           'code', 'lease_expired_max_attempts',
           'message', 'Lease expired after the maximum attempt budget was exhausted',
           'at', now()
         ),
         updated_at = now()
   where id = p_job_id
     and company_id = p_company_id
     and status in ('leased', 'processing')
     and lease_expires_at is not null
     and lease_expires_at <= now()
     and attempt >= max_attempts;

  update public.report_execution_jobs
     set status = 'leased',
         lease_owner = p_lease_owner,
         lease_token = gen_random_uuid(),
         lease_expires_at = now() + make_interval(secs => p_lease_seconds),
         attempt = attempt + 1,
         updated_at = now()
   where id = p_job_id
     and company_id = p_company_id
     and status in ('queued', 'leased', 'processing')
     and (lease_expires_at is null or lease_expires_at <= now())
     and attempt < max_attempts
   returning jsonb_build_object(
     'id', id,
     'company_id', company_id,
     'status', status,
     'checkpoint', checkpoint,
     'attempt', attempt,
     'max_attempts', max_attempts,
     'lease_owner', lease_owner,
     'lease_token', lease_token,
     'lease_expires_at', lease_expires_at
   ) into claimed_row;

  return claimed_row;
end;
$function$;

revoke all on function public.claim_report_execution_job(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.claim_report_execution_job(uuid,uuid,text,integer) to service_role;
