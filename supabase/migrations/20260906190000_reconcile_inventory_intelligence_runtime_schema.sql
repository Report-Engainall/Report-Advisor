-- Reconcile inventory-intelligence migration provenance.
-- The live project recorded version 20260904211416, while the source branch
-- carried the same runtime schema under 20260905190000. Keep this migration
-- idempotent so fresh replays converge without rewriting migration history.

create table if not exists public.alternative_item_groups (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  description text,
  base_unit text not null default 'unit',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alternative_item_group_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  group_id uuid not null references public.alternative_item_groups(id) on delete cascade,
  sku text not null,
  conversion_factor numeric(18,6) not null default 1 check (conversion_factor > 0),
  created_at timestamptz not null default now(),
  unique(company_id, group_id, sku),
  unique(company_id, sku)
);

create index if not exists idx_alt_groups_company on public.alternative_item_groups(company_id, is_active);
create index if not exists idx_alt_group_members_company on public.alternative_item_group_members(company_id, group_id);
create index if not exists idx_alt_group_members_sku on public.alternative_item_group_members(company_id, sku);

-- Enforce parent/member tenant equality at the database boundary.
-- Existing mismatches must be rejected before the composite FK is installed.
do $$
begin
  if exists (
    select 1
    from public.alternative_item_group_members m
    join public.alternative_item_groups g on g.id = m.group_id
    where m.company_id <> g.company_id
  ) then
    raise exception 'Cannot install tenant-bound alternative-item FK: mismatched company_id rows exist';
  end if;
end $$;

alter table public.alternative_item_groups enable row level security;
alter table public.alternative_item_group_members enable row level security;

alter table public.alternative_item_groups
  add constraint alternative_item_groups_company_id_id_key unique (company_id, id);

alter table public.alternative_item_group_members
  drop constraint if exists alternative_item_group_members_group_id_fkey;

alter table public.alternative_item_group_members
  add constraint alternative_item_group_members_company_group_fkey
  foreign key (company_id, group_id)
  references public.alternative_item_groups(company_id, id)
  on delete cascade;

drop policy if exists "company scoped alternative groups" on public.alternative_item_groups;
drop policy if exists "company scoped alternative group members" on public.alternative_item_group_members;
drop policy if exists "tenant_select" on public.alternative_item_groups;
drop policy if exists "tenant_insert" on public.alternative_item_groups;
drop policy if exists "tenant_update" on public.alternative_item_groups;
drop policy if exists "tenant_delete" on public.alternative_item_groups;
drop policy if exists "tenant_select" on public.alternative_item_group_members;
drop policy if exists "tenant_insert" on public.alternative_item_group_members;
drop policy if exists "tenant_update" on public.alternative_item_group_members;
drop policy if exists "tenant_delete" on public.alternative_item_group_members;

create policy "tenant_select" on public.alternative_item_groups
  for select using (company_id = current_company_id());
create policy "tenant_insert" on public.alternative_item_groups
  for insert with check (company_id = current_company_id());
create policy "tenant_update" on public.alternative_item_groups
  for update using (company_id = current_company_id()) with check (company_id = current_company_id());
create policy "tenant_delete" on public.alternative_item_groups
  for delete using (company_id = current_company_id());

create policy "tenant_select" on public.alternative_item_group_members
  for select using (company_id = current_company_id());
create policy "tenant_insert" on public.alternative_item_group_members
  for insert with check (
    company_id = current_company_id()
    and exists (
      select 1 from public.alternative_item_groups g
      where g.id = alternative_item_group_members.group_id
        and g.company_id = current_company_id()
    )
  );
create policy "tenant_update" on public.alternative_item_group_members
  for update using (company_id = current_company_id()) with check (
    company_id = current_company_id()
    and exists (
      select 1 from public.alternative_item_groups g
      where g.id = alternative_item_group_members.group_id
        and g.company_id = current_company_id()
    )
  );
create policy "tenant_delete" on public.alternative_item_group_members
  for delete using (company_id = current_company_id());
