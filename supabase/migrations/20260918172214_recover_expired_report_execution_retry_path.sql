-- Forward-only worker lifecycle correction.
-- Expired leased/processing jobs must either re-queue while attempt budget remains
-- or become terminal dead_letter when the attempt budget is exhausted.
begin;

create or replace function public.recover_expired_report_execution_jobs(
  p_company_id uuid,
  p_limit integer default 100
)
returns integer
language plpgsql
security definer
set search_path to 'public', 'pg_catalog'
as $function$
declare
  affected integer;
begin
  if p_company_id is null then
    raise exception 'Worker company context is required';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 1000 then
    raise exception 'Recovery limit must be between 1 and 1000';
  end if;

  with expired as (
    select id
    from public.report_execution_jobs
    where company_id = p_company_id
      and status in ('leased', 'processing')
      and lease_expires_at is not null
      and lease_expires_at <= now()
    order by lease_expires_at, created_at
    for update skip locked
    limit p_limit
  )
  update public.report_execution_jobs as job
  set
    status = case
      when job.attempt >= job.max_attempts then 'dead_letter'
      else 'queued'
    end,
    lease_owner = null,
    lease_token = null,
    lease_expires_at = null,
    last_error = (
      case
        when jsonb_typeof(job.last_error) = 'object' then job.last_error
        else '{}'::jsonb
      end
    ) || jsonb_build_object(
      'code',
      case
        when job.attempt >= job.max_attempts
          then 'worker_attempts_exhausted_after_lease_expiry'
        else 'worker_lease_expired_retry'
      end,
      'previous_status', job.status,
      'attempt', job.attempt,
      'max_attempts', job.max_attempts,
      'recovered_at', clock_timestamp()
    ),
    completed_at = null,
    updated_at = clock_timestamp()
  from expired
  where job.id = expired.id;

  get diagnostics affected = row_count;
  return affected;
end;
$function$;

revoke all on function public.recover_expired_report_execution_jobs(uuid, integer)
  from public, anon, authenticated;
grant execute on function public.recover_expired_report_execution_jobs(uuid, integer)
  to service_role;
alter function public.recover_expired_report_execution_jobs(uuid, integer)
  set search_path = public, pg_catalog;

commit;