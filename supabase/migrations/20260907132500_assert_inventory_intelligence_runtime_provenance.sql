do $$
begin
  if to_regclass('public.alternative_item_groups') is null then
    raise exception 'INVENTORY_INTELLIGENCE_SCHEMA_MISSING: public.alternative_item_groups';
  end if;
  if to_regclass('public.alternative_item_group_members') is null then
    raise exception 'INVENTORY_INTELLIGENCE_SCHEMA_MISSING: public.alternative_item_group_members';
  end if;

  if not exists (
    select 1
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'alternative_item_groups'
      and a.attname = 'company_id'
      and not a.attisdropped
  ) then
    raise exception 'INVENTORY_INTELLIGENCE_SCHEMA_DRIFT: alternative_item_groups.company_id';
  end if;

  if not exists (
    select 1
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'alternative_item_group_members'
      and a.attname = 'group_id'
      and not a.attisdropped
  ) then
    raise exception 'INVENTORY_INTELLIGENCE_SCHEMA_DRIFT: alternative_item_group_members.group_id';
  end if;

  if not exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'alternative_item_groups'
      and c.relrowsecurity
  ) then
    raise exception 'INVENTORY_INTELLIGENCE_RLS_MISSING: alternative_item_groups';
  end if;

  if not exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'alternative_item_group_members'
      and c.relrowsecurity
  ) then
    raise exception 'INVENTORY_INTELLIGENCE_RLS_MISSING: alternative_item_group_members';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'alternative_item_group_members'
      and policyname = 'tenant_insert'
      and with_check ilike '%current_company_id()%'
      and with_check ilike '%alternative_item_groups%'
  ) then
    raise exception 'INVENTORY_INTELLIGENCE_RLS_DRIFT: tenant_insert';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'alternative_item_group_members'
      and policyname = 'tenant_update'
      and with_check ilike '%current_company_id()%'
      and with_check ilike '%alternative_item_groups%'
  ) then
    raise exception 'INVENTORY_INTELLIGENCE_RLS_DRIFT: tenant_update';
  end if;

  raise notice 'Inventory intelligence runtime provenance assertion: PASS';
end $$;
