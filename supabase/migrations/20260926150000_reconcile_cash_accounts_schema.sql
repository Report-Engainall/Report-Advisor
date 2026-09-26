-- Reconcile the live finance schema with the migration-controlled contract.
-- This migration is intentionally idempotent because historical environments may
-- already contain the table while the tracked migration lineage does not.
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
  updated_at timestamptz not null default now()
);

alter table public.cash_accounts
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists company_id uuid,
  add column if not exists branch_id uuid,
  add column if not exists name text,
  add column if not exists currency text,
  add column if not exists opening_balance numeric default 0,
  add column if not exists received numeric default 0,
  add column if not exists spent numeric default 0,
  add column if not exists current_balance numeric,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.cash_accounts
set opening_balance = coalesce(opening_balance, 0),
    received = coalesce(received, 0),
    spent = coalesce(spent, 0),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now())
where opening_balance is null
   or received is null
   or spent is null
   or created_at is null
   or updated_at is null;

alter table public.cash_accounts
  alter column id set not null,
  alter column company_id set not null,
  alter column branch_id set not null,
  alter column name set not null,
  alter column currency set not null,
  alter column opening_balance set default 0,
  alter column opening_balance set not null,
  alter column received set default 0,
  alter column received set not null,
  alter column spent set default 0,
  alter column spent set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cash_accounts'::regclass
      and conname = 'cash_accounts_company_id_fkey'
  ) then
    alter table public.cash_accounts
      add constraint cash_accounts_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cash_accounts'::regclass
      and conname = 'cash_accounts_branch_company_fkey'
  ) then
    alter table public.cash_accounts
      add constraint cash_accounts_branch_company_fkey
      foreign key (company_id, branch_id)
      references public.branches(company_id, id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cash_accounts'::regclass
      and conname = 'cash_accounts_currency_format'
  ) then
    alter table public.cash_accounts
      add constraint cash_accounts_currency_format
      check (currency = upper(btrim(currency)) and length(btrim(currency)) = 3);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cash_accounts'::regclass
      and conname = 'cash_accounts_nonnegative'
  ) then
    alter table public.cash_accounts
      add constraint cash_accounts_nonnegative
      check (opening_balance >= 0 and received >= 0 and spent >= 0);
  end if;
end $$;

create index if not exists idx_cash_accounts_company_branch
  on public.cash_accounts(company_id, branch_id);

alter table public.cash_accounts enable row level security;

drop policy if exists cash_accounts_tenant_select on public.cash_accounts;
create policy cash_accounts_tenant_select
  on public.cash_accounts
  for select
  to authenticated
  using (company_id = current_company_id());

grant select on public.cash_accounts to authenticated;