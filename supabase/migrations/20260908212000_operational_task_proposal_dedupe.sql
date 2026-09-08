alter table public.operational_task_proposals add column if not exists task_key text;

update public.operational_task_proposals
set task_key = md5(company_id::text || '|' || role || '|' || horizon || '|' || coalesce(source_type,'') || '|' || coalesce(source_id::text,'') || '|' || lower(btrim(title)))
where task_key is null;

alter table public.operational_task_proposals alter column task_key set not null;

create unique index if not exists operational_task_proposals_task_key_uidx
  on public.operational_task_proposals(company_id, task_key);