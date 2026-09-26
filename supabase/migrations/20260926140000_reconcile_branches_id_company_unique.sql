-- Restore prerequisite for composite foreign keys that bind tenant + branch identity.
-- The current staging schema already contains this constraint; this migration
-- makes the prerequisite explicit in the repository so logical restore replays
-- it before cash_accounts is restored.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.branches'::regclass
      and conname = 'branches_id_company_unique'
  ) then
    if exists (
      select 1
      from public.branches
      group by id, company_id
      having count(*) > 1
    ) then
      raise exception 'BRANCH_ID_COMPANY_DUPLICATES: cannot create branches_id_company_unique safely';
    end if;

    alter table public.branches
      add constraint branches_id_company_unique unique (id, company_id);
  end if;
end
$$;