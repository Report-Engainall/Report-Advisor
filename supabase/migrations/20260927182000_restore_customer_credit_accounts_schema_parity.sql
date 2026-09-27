-- Restore-parity guard for the canonical customer credit account schema.
-- This table is present in the authenticated staging runtime but must also exist
-- in a clean migration replay before logical backup/restore can load its data.
create table if not exists public.customer_credit_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  customer_id uuid not null,
  currency text not null default 'SAR',
  credit_limit numeric not null default 0,
  outstanding_balance numeric not null default 0,
  available_credit numeric,
  updated_at timestamptz not null default now(),
  constraint customer_credit_accounts_company_id_fkey
    foreign key (company_id) references public.companies(id) on delete restrict,
  constraint customer_credit_accounts_customer_id_fkey
    foreign key (customer_id) references public.customers(id) on delete cascade,
  constraint customer_credit_accounts_customer_id_key unique (customer_id),
  constraint customer_credit_accounts_credit_limit_check
    check (credit_limit >= 0),
  constraint customer_credit_accounts_outstanding_balance_check
    check (outstanding_balance >= 0),
  constraint customer_credit_accounts_currency_check
    check (currency ~ '^[A-Z]{3}$')
);

create index if not exists idx_customer_credit_accounts_company_id_fk
  on public.customer_credit_accounts(company_id);

alter table public.customer_credit_accounts enable row level security;

revoke all on table public.customer_credit_accounts from public, anon, authenticated;
grant select on table public.customer_credit_accounts to authenticated;
grant all on table public.customer_credit_accounts to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_credit_accounts'
      and policyname = 'credit_customer_select'
  ) then
    create policy credit_customer_select
      on public.customer_credit_accounts
      for select
      to authenticated
      using (
        customer_id = public.current_customer_id()
        and company_id = public.current_customer_company_id()
      );
  end if;
end;
$$;