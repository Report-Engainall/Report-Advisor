-- Reconcile client_ui_settings tenant policy with the canonical company-scoped staff tenant resolver.
-- The 20260925184000 parity migration preserves customer-portal resolver dependency for clean historical replay;
-- this forward migration establishes the live current_company_id policy for the current product boundary.

drop policy if exists ui_settings_customer_select on public.client_ui_settings;

create policy ui_settings_customer_select
  on public.client_ui_settings
  as permissive
  for select
  to authenticated
  using (organization_id = public.current_company_id());

revoke all on table public.client_ui_settings from anon;
revoke all on table public.client_ui_settings from authenticated;
grant select, insert, update on table public.client_ui_settings to authenticated;
grant all on table public.client_ui_settings to service_role;
