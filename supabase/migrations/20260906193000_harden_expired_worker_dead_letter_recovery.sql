-- Harden durable worker recovery for crashed workers that exhaust attempts.
-- An expired leased/processing job at max_attempts must not remain stranded forever.

create or replace function public.recover_expired_report_execution_jobs(p_limit integer default 100)
returns integer
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
declare
  affected integer;
begin
  if p_limit is null or p_limit < 1 or p_limit > 1000 then
    raise exception 'Recovery limit must be between 1 and 1000';
  end if;

  update public.report_execution_jobs
     set status = 'dead_letter',
         lease_owner = null,
         lease_token = null,
         lease_expires_at = null,
         last_error = case
           when jsonb_typeof(last_error) = 'object' then
             last_error || jsonb_build_object(
               'code', 'worker_attempts_exhausted_after_lease_expiry',
               'recovered_at', now()
             )
           else
             jsonb_build_object(
               'code', 'worker_attempts_exhausted_after_lease_expiry',
               'recovered_at', now()
             )
         end,
         updated_at = now()
   where id in (
     select id
       from public.report_execution_jobs
      where company_id = public.current_company_id()
        and status in ('leased','processing')
        and lease_expires_at is not null
        and lease_expires_at <= now()
        and attempt >= max_attempts
      order by lease_expires_at, created_at
      for update skip locked
      limit p_limit
   );

  get diagnostics affected = row_count;
  return affected;
end;
$function$;

revoke all on function public.recover_expired_report_execution_jobs(integer) from public, anon, authenticated;
grant execute on function public.recover_expired_report_execution_jobs(integer) to service_role;
