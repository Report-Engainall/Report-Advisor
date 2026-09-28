-- Reconcile clean-restore tenant policy with live Staging parity.
-- Live Staging (fnqbvfuwbdpwvhcgzksl) reads client_ui_settings through the
-- canonical staff/company resolver current_company_id(). Keep the existing
-- customer-portal resolver separate for customer-facing tables.
drop policy if exists ui_settings_customer_select on public.client_ui_settings;

create policy ui_settings_customer_select
  on public.client_ui_settings
  as permissive
  for select
  to authenticated
  using (organization_id = public.current_company_id());

-- Preserve the live grants exactly; RLS remains the authorization boundary.
revoke all on table public.client_ui_settings from anon;
grant select, insert, update on table public.client_ui_settings to authenticated;
grant all on table public.client_ui_settings to service_role;
