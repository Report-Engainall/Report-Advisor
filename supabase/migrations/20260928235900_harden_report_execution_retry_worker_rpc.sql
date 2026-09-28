-- Final tenant/auth binding and worker-only privilege boundary for report execution retries.
-- Forward-only reconciliation of the live Staging function. The worker remains
-- service_role-only; auth/tenant checks are retained for defense in depth if the
-- function is ever exposed through a different execution context.

create or replace function public.retry_report_execution_job(p_job_id uuid, p_company_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
declare
  v_company_id uuid := public.current_company_id();
  v_is_service_role boolean := coalesce(auth.jwt()->>'role','') = 'service_role';
  affected integer;
begin
  if p_job_id is null or p_company_id is null then
    raise exception 'REPORT_EXECUTION_RETRY_INPUT_INVALID';
  end if;

  if not v_is_service_role and (select auth.uid()) is null then
    raise exception 'AUTHENTICATED_USER_REQUIRED';
  end if;

  if not v_is_service_role and (v_company_id is null or p_company_id is distinct from v_company_id) then
    raise exception 'TENANT_CONTEXT_MISMATCH';
  end if;

  update public.report_execution_jobs
  set status='queued',
      lease_owner=null,
      lease_token=null,
      lease_expires_at=null,
      last_error='{}'::jsonb,
      completed_at=null,
      updated_at=clock_timestamp()
  where id=p_job_id
    and company_id=p_company_id
    and status='failed'
    and attempt<max_attempts;

  if not found then
    return false;
  end if;

  update public.report_execution_tasks
  set status='queued',
      worker_id=null,
      started_at=null,
      completed_at=null,
      last_error='{}'::jsonb,
      updated_at=clock_timestamp()
  where report_execution_job_id=p_job_id
    and company_id=p_company_id
    and status='failed';

  get diagnostics affected=row_count;
  return true;
end;
$function$;

revoke all on function public.retry_report_execution_job(uuid, uuid) from public, anon, authenticated;
grant execute on function public.retry_report_execution_job(uuid, uuid) to service_role;
