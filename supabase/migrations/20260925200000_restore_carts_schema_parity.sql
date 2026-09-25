-- Restore parity for the live public.carts relation discovered by Phase-F logical restore.
-- Source-of-truth: staging project fnqbvfuwbdpwvhcgzksl at 2026-09-25.
-- Forward-only: preserves the live relation shape, tenant FK boundaries, indexes, RLS and authenticated read policy.
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  customer_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'carts_company_id_fkey'
      and conrelid = 'public.carts'::regclass
  ) then
    alter table public.carts
      add constraint carts_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'carts_customer_id_fkey'
      and conrelid = 'public.carts'::regclass
  ) then
    alter table public.carts
      add constraint carts_customer_id_fkey
      foreign key (customer_id) references public.customers(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'carts_user_id_fkey'
      and conrelid = 'public.carts'::regclass
  ) then
    alter table public.carts
      add constraint carts_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'carts_company_id_user_id_key'
      and conrelid = 'public.carts'::regclass
  ) then
    alter table public.carts
      add constraint carts_company_id_user_id_key unique (company_id, user_id);
  end if;
end
$$;

create index if not exists idx_carts_customer_id_fk
  on public.carts(customer_id);

create index if not exists idx_carts_user_id_fk
  on public.carts(user_id);

alter table public.carts enable row level security;

drop policy if exists carts_self_select on public.carts;
create policy carts_self_select
  on public.carts
  as permissive
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and customer_id = current_customer_id()
    and company_id = current_customer_company_id()
  );

revoke all on table public.carts from anon;
revoke all on table public.carts from authenticated;
grant select on table public.carts to authenticated;
grant all on table public.carts to service_role;
