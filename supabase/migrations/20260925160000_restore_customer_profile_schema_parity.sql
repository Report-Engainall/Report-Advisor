-- Restore-parity source for the customer-portal tenant resolver.
-- The resolver depends on public.profiles, which is part of the customer
-- authorization boundary and must exist before the function migration that
-- consumes it. Keep this schema in the repository so fresh restores do not
-- depend on staging-only historical migrations.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.companies(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete set null,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

revoke all on table public.profiles from public;
revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant all on table public.profiles to service_role;

comment on table public.profiles is
  'Customer-portal identity profile; tenant ownership is bound through organization_id and authenticated access is fail-closed.';
