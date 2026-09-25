-- Evolve the tenant membership schema required by the canonical resolver.
-- These primitives already exist in staging; this keeps fresh restore lineage complete.
alter table company_memberships
  add column if not exists is_default boolean not null default false;

create index if not exists idx_company_memberships_company_active
  on public.company_memberships (company_id, is_active);

create unique index if not exists idx_company_memberships_one_default
  on public.company_memberships (user_id)
  where is_active = true and is_default = true;

create index if not exists idx_company_memberships_user_active
  on public.company_memberships (user_id, is_active, is_default);

-- The live cash account ledger was also present in staging without repository lineage.
-- It must be created before its tenant RLS policy is restored.
create or replace function public.current_company_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $
declare
  v_count integer;
  v_company_id uuid;
begin
  select count(*), min(company_id)
  into v_count, v_company_id
  from company_memberships cm
  where cm.user_id = auth.uid()
    and cm.is_active = true;

  if v_count = 1 then
    return v_company_id;
  end if;

  return null;
end;
$;

revoke all on function public.current_company_id() from public;
grant execute on function public.current_company_id() to authenticated, service_role;


create table if not exists public.cash_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  branch_id uuid not null,
  name text not null,
  currency text not null,
  opening_balance numeric not null default 0,
  received numeric not null default 0,
  spent numeric not null default 0,
  current_balance numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cash_accounts_currency_format
    check (currency = upper(btrim(currency)) and length(btrim(currency)) = 3),
  constraint cash_accounts_nonnegative
    check (opening_balance >= 0 and received >= 0 and spent >= 0)
);

alter table public.cash_accounts enable row level security;

create index if not exists idx_cash_accounts_company_branch
  on public.cash_accounts (company_id, branch_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cash_accounts_company_id_fkey'
  ) then
    alter table public.cash_accounts add constraint cash_accounts_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'cash_accounts_branch_company_fkey'
  ) then
    alter table public.cash_accounts add constraint cash_accounts_branch_company_fkey
      foreign key (company_id, branch_id) references public.branches(company_id, id);
  end if;
end
$$;

drop policy if exists cash_accounts_tenant_select on public.cash_accounts;
create policy cash_accounts_tenant_select
  on public.cash_accounts
  for select
  to authenticated
  using (company_id = current_company_id());

-- Reconcile the live commerce cart tables with the canonical migration lineage.
-- Source of truth: exact Supabase staging schema inspected on 2026-09-25.
-- The live database contained these tables, but no repository migration created them,
-- which made a logical backup restore fail on a fresh schema with relation "public.carts" missing.

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  customer_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_company_id_user_id_key unique (company_id, user_id)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null,
  product_id uuid not null,
  quantity integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_cart_id_product_id_key unique (cart_id, product_id),
  constraint cart_items_quantity_check check (quantity > 0 and quantity <= 100000)
);

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

create index if not exists idx_carts_customer_id_fk
  on public.carts (customer_id);

create index if not exists idx_carts_user_id_fk
  on public.carts (user_id);

create index if not exists idx_cart_items_product_id_fk
  on public.cart_items (product_id);
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'carts_company_id_fkey'
  ) then
    alter table public.carts
      add constraint carts_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'carts_customer_id_fkey'
  ) then
    alter table public.carts
      add constraint carts_customer_id_fkey
      foreign key (customer_id) references public.customers(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'carts_user_id_fkey'
  ) then
    alter table public.carts
      add constraint carts_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'cart_items_cart_id_fkey'
  ) then
    alter table public.cart_items
      add constraint cart_items_cart_id_fkey
      foreign key (cart_id) references public.carts(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'cart_items_product_id_fkey'
  ) then
    alter table public.cart_items
      add constraint cart_items_product_id_fkey
      foreign key (product_id) references public.products(id) on delete restrict;
  end if;
end
$$;

-- The live customer-context helper functions depend on this profile mapping table.
-- The table existed in staging but was absent from repository migration lineage.
create table if not exists public.profiles (
  id uuid primary key,
  organization_id uuid not null,
  customer_id uuid,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create index if not exists profiles_customer_idx on public.profiles (customer_id);
create index if not exists profiles_org_idx on public.profiles (organization_id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_id_fkey') then
    alter table public.profiles add constraint profiles_id_fkey
      foreign key (id) references auth.users(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_organization_id_fkey') then
    alter table public.profiles add constraint profiles_organization_id_fkey
      foreign key (organization_id) references public.companies(id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_customer_id_fkey') then
    alter table public.profiles add constraint profiles_customer_id_fkey
      foreign key (customer_id) references public.customers(id) on delete set null;
  end if;
end
$$;

revoke all on table public.profiles from public, anon, authenticated;
grant all on table public.profiles to service_role;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

-- These tenant/customer helpers exist in the live database but were missing from
-- repository migration lineage. They must exist before the cart RLS policies.
create or replace function public.current_customer_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select p.customer_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.current_customer_company_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select p.organization_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

revoke all on function public.current_customer_id() from public;
grant execute on function public.current_customer_id() to authenticated, service_role;

revoke all on function public.current_customer_company_id() from public;
grant execute on function public.current_customer_company_id() to authenticated, service_role;

drop policy if exists carts_self_select on public.carts;
create policy carts_self_select
  on public.carts
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and customer_id = current_customer_id()
    and company_id = current_customer_company_id()
  );

drop policy if exists cart_items_self_select on public.cart_items;
create policy cart_items_self_select
  on public.cart_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.user_id = (select auth.uid())
        and c.customer_id = current_customer_id()
        and c.company_id = current_customer_company_id()
    )
  );

comment on table public.carts is
  'Canonical customer cart state reconciled from the live Supabase schema.';
comment on table public.cart_items is
  'Canonical customer cart item state reconciled from the live Supabase schema.';
