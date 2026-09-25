-- Restore parity for the live public.cash_accounts relation discovered by Phase-F logical restore.
-- Source-of-truth: staging project fnqbvfuwbdpwvhcgzksl at 2026-09-25.
-- Forward-only: preserves the live relation shape, tenant FK boundaries, index, RLS and authenticated read policy.

create table if not exists public.cash_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  branch_id uuid not null,
  name text not null,
  currency text not null,
  opening_balance numeric not null default 0,
  received numeric not null default 0,
  spent numeric not null default 0,
  current_balance numeric generated always as ((opening_balance + received) - spent) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'cash_accounts_company_id_fkey'
      and conrelid = 'public.cash_accounts'::regclass
  ) then
    alter table public.cash_accounts
      add constraint cash_accounts_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'cash_accounts_branch_company_fkey'
      and conrelid = 'public.cash_accounts'::regclass
  ) then
    alter table public.cash_accounts
      add constraint cash_accounts_branch_company_fkey
      foreign key (company_id, branch_id)
      references public.branches(company_id, id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'cash_accounts_currency_format'
      and conrelid = 'public.cash_accounts'::regclass
  ) then
    alter table public.cash_accounts
      add constraint cash_accounts_currency_format
      check (currency = upper(btrim(currency)) and length(btrim(currency)) = 3);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'cash_accounts_nonnegative'
      and conrelid = 'public.cash_accounts'::regclass
  ) then
    alter table public.cash_accounts
      add constraint cash_accounts_nonnegative
      check (opening_balance >= 0 and received >= 0 and spent >= 0);
  end if;
end
$$;

create index if not exists idx_cash_accounts_company_branch
  on public.cash_accounts(company_id, branch_id);

alter table public.cash_accounts enable row level security;

drop policy if exists cash_accounts_tenant_select on public.cash_accounts;
create policy cash_accounts_tenant_select
  on public.cash_accounts
  as permissive
  for select
  to authenticated
  using (company_id = current_company_id());

revoke all on table public.cash_accounts from public;
revoke all on table public.cash_accounts from anon;
revoke all on table public.cash_accounts from authenticated;
grant select on table public.cash_accounts to authenticated;
grant all on table public.cash_accounts to service_role;
