-- Restore-parity compatibility resolver required by the live client_ui_settings policy.
-- Canonical source remains public.current_company_id(); this wrapper introduces no
-- client-supplied tenant authority and keeps one tenant-resolution implementation.
-- Timestamped before 20260925184000_restore_client_ui_settings_schema_parity.sql
-- so a clean restore can create the resolver before the policy references it.

create or replace function public.current_customer_company_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_catalog
as $function$
  select public.current_company_id();
$function$;

revoke all on function public.current_customer_company_id() from public;
grant execute on function public.current_customer_company_id() to authenticated, service_role;

comment on function public.current_customer_company_id() is
  'Compatibility tenant resolver for restored client UI settings; delegates exclusively to canonical current_company_id().';
