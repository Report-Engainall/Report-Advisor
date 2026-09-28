-- Restore-parity source for the customer-portal tenant resolver.
-- This function is a distinct authorization boundary from current_company_id().
-- It must preserve the customer portal's profile.organization_id resolution semantics.
-- Staff/company surfaces continue to use public.current_company_id() directly.
create or replace function public.current_customer_company_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_catalog
as $function$
  select p.organization_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$function$;

revoke all on function public.current_customer_company_id() from public;
grant execute on function public.current_customer_company_id() to authenticated, service_role;

comment on function public.current_customer_company_id() is
  'Canonical customer-portal tenant resolver; returns profiles.organization_id for auth.uid(). Distinct from staff/company current_company_id().';
