-- Forward-only reconciliation for environments that already applied the schema-parity migration.
-- The canonical tenant boundary is public.current_company_id(); the legacy customer resolver
-- is not part of the repository migration chain and must not remain a live dependency.
drop policy if exists ui_settings_customer_select on public.client_ui_settings;

create policy ui_settings_customer_select
  on public.client_ui_settings
  as permissive
  for select
  to authenticated
  using (organization_id = public.current_company_id());
