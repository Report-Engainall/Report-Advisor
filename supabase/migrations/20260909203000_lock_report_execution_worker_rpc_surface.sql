-- Forward-only security boundary for the durable report-execution RPC surface.
-- These SECURITY DEFINER worker functions are server-side execution primitives.
-- They must never be callable by anon/authenticated clients with an arbitrary company_id.
-- Only the trusted Supabase service_role may execute them.

do $$
declare
  fn record;
begin
  for fn in
    select n.nspname as schema_name, p.proname as function_name,
           pg_get_function_identity_arguments(p.oid) as identity_args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'enqueue_report_execution_job',
        'claim_report_execution_job',
        'heartbeat_report_execution_job',
        'advance_report_execution_checkpoint',
        'complete_report_execution_job',
        'fail_report_execution_job',
        'recover_expired_report_execution_jobs',
        'retry_report_execution_job'
      )
  loop
    execute format(
      'revoke execute on function %I.%I(%s) from public, authenticated',
      fn.schema_name, fn.function_name, fn.identity_args
    );
    execute format(
      'grant execute on function %I.%I(%s) to service_role',
      fn.schema_name, fn.function_name, fn.identity_args
    );
  end loop;
end
$$;
