create or replace function public.get_operational_daily_plan(p_role text default null, p_horizon text default null)
returns table(
  role text,
  horizon text,
  proposed bigint,
  accepted bigint,
  awaiting_approval bigint,
  open_work bigint,
  in_progress bigint,
  completed bigint,
  overdue bigint,
  evidence_missing bigint
)
language sql
security invoker
set search_path = pg_catalog
as $$
with roles(role) as (
  values ('manager'::text),('employee'::text),('sales'::text),('warehouse'::text),('accountant'::text),('purchasing'::text)
), horizons(horizon) as (
  values ('today'::text),('tomorrow'::text)
), grid as (
  select r.role,h.horizon from roles r cross join horizons h
), proposal_stats as (
  select p.role,p.horizon,
    count(*) filter (where p.status='proposed') proposed,
    count(*) filter (where p.status='accepted') accepted,
    count(*) filter (where p.status='proposed' and p.evidence_required <> '[]'::jsonb) evidence_missing
  from public.operational_task_proposals p
  where p.company_id=public.current_company_id()
  group by p.role,p.horizon
), work_base as (
  select
    case w.department
      when 'management' then 'manager'
      when 'operations' then 'employee'
      when 'sales' then 'sales'
      when 'warehouse' then 'warehouse'
      when 'accounting' then 'accountant'
      when 'purchasing' then 'purchasing'
      else 'employee'
    end as role,
    case
      when w.due_at is null or w.due_at::date=current_date then 'today'
      when w.due_at::date=current_date+1 then 'tomorrow'
      else null
    end as horizon,
    w.status,w.due_at,w.evidence_refs
  from public.decision_work_items w
  where w.company_id=public.current_company_id()
), work_stats as (
  select role,horizon,
    count(*) filter (where status='OPEN') open_work,
    count(*) filter (where status='IN_PROGRESS') in_progress,
    count(*) filter (where status='COMPLETED') completed,
    count(*) filter (where status in ('OPEN','IN_PROGRESS') and due_at is not null and due_at < now()) overdue,
    count(*) filter (where status='IN_PROGRESS' and (evidence_refs is null or evidence_refs='[]'::jsonb)) evidence_missing
  from work_base
  where horizon is not null
  group by role,horizon
)
select g.role,g.horizon,
  coalesce(p.proposed,0),coalesce(p.accepted,0),
  coalesce(p.proposed,0) as awaiting_approval,
  coalesce(w.open_work,0),coalesce(w.in_progress,0),coalesce(w.completed,0),
  coalesce(w.overdue,0),
  greatest(coalesce(p.evidence_missing,0),coalesce(w.evidence_missing,0)) as evidence_missing
from grid g
left join proposal_stats p on p.role=g.role and p.horizon=g.horizon
left join work_stats w on w.role=g.role and w.horizon=g.horizon
where (p_role is null or g.role=p_role)
  and (p_horizon is null or g.horizon=p_horizon)
order by case g.horizon when 'today' then 0 else 1 end, g.role;
$$;

revoke all on function public.get_operational_daily_plan(text,text) from public,anon;
grant execute on function public.get_operational_daily_plan(text,text) to authenticated;
