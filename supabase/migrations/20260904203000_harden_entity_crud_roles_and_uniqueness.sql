-- Entity CRUD hardening: keep tenant isolation and prevent viewer-only accounts from mutating entities.
-- The staging model currently uses `member`; retain it so real runtime evidence users remain executable.
create unique index if not exists uq_customers_company_normalized_code
  on public.customers (company_id, normalize_import_key(code))
  where code is not null and btrim(code) <> '';

drop policy if exists tenant_insert on public.customers;
create policy tenant_insert on public.customers for insert to authenticated
with check (
  company_id = current_company_id()
  and exists (
    select 1 from public.company_memberships cm
    where cm.company_id = current_company_id()
      and cm.user_id = auth.uid()
      and cm.is_active = true
      and cm.role in ('member','manager','warehouse','accountant','system_admin')
  )
);

drop policy if exists tenant_update on public.customers;
create policy tenant_update on public.customers for update to authenticated
using (
  company_id = current_company_id()
  and exists (
    select 1 from public.company_memberships cm
    where cm.company_id = current_company_id()
      and cm.user_id = auth.uid()
      and cm.is_active = true
      and cm.role in ('member','manager','warehouse','accountant','system_admin')
  )
)
with check (
  company_id = current_company_id()
  and exists (
    select 1 from public.company_memberships cm
    where cm.company_id = current_company_id()
      and cm.user_id = auth.uid()
      and cm.is_active = true
      and cm.role in ('member','manager','warehouse','accountant','system_admin')
  )
);

drop policy if exists tenant_delete on public.customers;
create policy tenant_delete on public.customers for delete to authenticated
using (
  company_id = current_company_id()
  and exists (
    select 1 from public.company_memberships cm
    where cm.company_id = current_company_id()
      and cm.user_id = auth.uid()
      and cm.is_active = true
      and cm.role in ('member','manager','warehouse','accountant','system_admin')
  )
);

drop policy if exists tenant_insert on public.products;
create policy tenant_insert on public.products for insert to authenticated
with check (
  company_id = current_company_id()
  and exists (
    select 1 from public.company_memberships cm
    where cm.company_id = current_company_id()
      and cm.user_id = auth.uid()
      and cm.is_active = true
      and cm.role in ('member','manager','warehouse','accountant','system_admin')
  )
);

drop policy if exists tenant_update on public.products;
create policy tenant_update on public.products for update to authenticated
using (
  company_id = current_company_id()
  and exists (
    select 1 from public.company_memberships cm
    where cm.company_id = current_company_id()
      and cm.user_id = auth.uid()
      and cm.is_active = true
      and cm.role in ('member','manager','warehouse','accountant','system_admin')
  )
)
with check (
  company_id = current_company_id()
  and exists (
    select 1 from public.company_memberships cm
    where cm.company_id = current_company_id()
      and cm.user_id = auth.uid()
      and cm.is_active = true
      and cm.role in ('member','manager','warehouse','accountant','system_admin')
  )
);

drop policy if exists tenant_delete on public.products;
create policy tenant_delete on public.products for delete to authenticated
using (
  company_id = current_company_id()
  and exists (
    select 1 from public.company_memberships cm
    where cm.company_id = current_company_id()
      and cm.user_id = auth.uid()
      and cm.is_active = true
      and cm.role in ('member','manager','warehouse','accountant','system_admin')
  )
);