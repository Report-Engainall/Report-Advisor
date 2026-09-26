-- Restore prerequisite for the cash_accounts composite foreign key.
-- The referenced key must match (company_id, id) in this exact order.
-- Fail closed when duplicate tenant/branch pairs exist.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.branches'::regclass
      and conname = 'branches_company_id_id_unique'
  ) then
    if exists (
      select 1
      from public.branches
      group by company_id, id
      having count(*) > 1
    ) then
      raise exception 'BRANCH_COMPANY_ID_DUPLICATES: cannot create branches_company_id_id_unique safely';
    end if;

    alter table public.branches
      add constraint branches_company_id_id_unique unique (company_id, id);
  end if;
end
$$;