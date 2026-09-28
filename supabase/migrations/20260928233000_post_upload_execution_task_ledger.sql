-- Canonical post-upload orchestration ledger.
begin;

create table if not exists public.report_execution_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  report_execution_job_id uuid not null references public.report_execution_jobs(id) on delete cascade,
  task_key text not null,
  stage text not null,
  ordinal integer not null,
  label text not null,
  status text not null default 'queued',
  worker_id text,
  attempt integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  last_error jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, report_execution_job_id, task_key),
  constraint report_execution_tasks_stage_check check (stage in ('queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered')),
  constraint report_execution_tasks_status_check check (status in ('queued','running','completed','failed')),
  constraint report_execution_tasks_ordinal_check check (ordinal between 1 and 9),
  constraint report_execution_tasks_attempt_check check (attempt >= 0)
);

create index if not exists idx_report_execution_tasks_job_ordinal
  on public.report_execution_tasks(company_id, report_execution_job_id, ordinal);
create index if not exists idx_report_execution_tasks_status
  on public.report_execution_tasks(company_id, status, updated_at desc);

alter table public.report_execution_tasks enable row level security;
drop policy if exists report_execution_tasks_tenant_select on public.report_execution_tasks;
create policy report_execution_tasks_tenant_select
  on public.report_execution_tasks for select to authenticated
  using (company_id = public.current_company_id());

revoke all on public.report_execution_tasks from public, anon;
grant select on public.report_execution_tasks to authenticated;
grant all on public.report_execution_tasks to service_role;

create or replace function public.enqueue_report_execution_job(
  p_company_id uuid, p_job_key text, p_source_path text, p_source_hash text,
  p_evidence_keys text[] default '{}', p_max_attempts integer default 5
) returns jsonb
language plpgsql security definer set search_path to 'pg_catalog'
as $function$
declare
  existing public.report_execution_jobs%rowtype;
  inserted public.report_execution_jobs%rowtype;
  target_job public.report_execution_jobs%rowtype;
  initial_checkpoint jsonb;
begin
  if p_company_id is null then raise exception 'company_id is required'; end if;
  if p_job_key is null or btrim(p_job_key) = '' then raise exception 'job_key is required'; end if;
  if p_source_path is null or btrim(p_source_path) = '' then raise exception 'source_path is required'; end if;
  if p_source_hash is null or btrim(p_source_hash) = '' then raise exception 'source_hash is required'; end if;
  if p_max_attempts is null or p_max_attempts < 1 or p_max_attempts > 100 then raise exception 'max_attempts must be between 1 and 100'; end if;

  initial_checkpoint := jsonb_build_object('stage','queued','sourceHash',p_source_hash,'evidenceKeys',coalesce(p_evidence_keys,'{}'),'updatedAt',floor(extract(epoch from clock_timestamp()) * 1000)::bigint);

  insert into public.report_execution_jobs(company_id,job_key,source_path,source_hash,status,checkpoint,max_attempts)
  values(p_company_id,btrim(p_job_key),btrim(p_source_path),btrim(p_source_hash),'queued',initial_checkpoint,p_max_attempts)
  on conflict(company_id,job_key) do nothing returning * into inserted;

  if inserted.id is null then
    select * into existing from public.report_execution_jobs where company_id=p_company_id and job_key=btrim(p_job_key) for update;
    if not found then raise exception 'Durable job conflict was not found; refusing ambiguous enqueue result'; end if;
    if existing.source_path is null or existing.source_hash is null then raise exception 'Existing durable job is missing source identity; refusing provenance-unsafe enqueue'; end if;
    if existing.source_hash <> btrim(p_source_hash) or existing.source_path <> btrim(p_source_path) then raise exception 'Durable job key already exists with different source identity'; end if;
    target_job := existing;
  else target_job := inserted;
  end if;

  insert into public.report_execution_tasks(company_id,report_execution_job_id,task_key,stage,ordinal,label)
  values
    (target_job.company_id,target_job.id,'01-queued','queued',1,'استلام العملية'),
    (target_job.company_id,target_job.id,'02-fingerprinted','fingerprinted',2,'إثبات بصمة المصدر'),
    (target_job.company_id,target_job.id,'03-extracted','extracted',3,'استخراج المحتوى'),
    (target_job.company_id,target_job.id,'04-canonicalized','canonicalized',4,'التوحيد والمطابقة'),
    (target_job.company_id,target_job.id,'05-validated','validated',5,'التحقق والجودة'),
    (target_job.company_id,target_job.id,'06-analyzed','analyzed',6,'التحليل وفهم الأعمال'),
    (target_job.company_id,target_job.id,'07-decisioned','decisioned',7,'بناء إشارة القرار'),
    (target_job.company_id,target_job.id,'08-committed','committed',8,'تثبيت الحقيقة الكانونية'),
    (target_job.company_id,target_job.id,'09-rendered','rendered',9,'إخراج التقرير ونتائج التشغيل')
  on conflict(company_id,report_execution_job_id,task_key) do nothing;

  return jsonb_build_object('id',target_job.id,'company_id',target_job.company_id,'job_key',target_job.job_key,'source_path',target_job.source_path,'source_hash',target_job.source_hash,'status',target_job.status,'checkpoint',target_job.checkpoint,'attempt',target_job.attempt,'max_attempts',target_job.max_attempts,'lease_owner',target_job.lease_owner,'lease_token',target_job.lease_token,'lease_expires_at',target_job.lease_expires_at);
end;
$function$;

create or replace function public.start_report_execution_task(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_stage text)
returns boolean language plpgsql security definer set search_path to 'pg_catalog'
as $function$
declare v_ordinal integer; v_previous integer; affected integer;
begin
  if p_company_id is null then raise exception 'Worker company context is required'; end if;
  if p_worker_id is null or btrim(p_worker_id) = '' then raise exception 'Worker id is required'; end if;
  if p_lease_token is null then raise exception 'Worker lease token is required'; end if;
  select ordinal into v_ordinal from public.report_execution_tasks where company_id=p_company_id and report_execution_job_id=p_job_id and stage=p_stage for update;
  if v_ordinal is null then raise exception 'Execution task stage not found: %', p_stage; end if;
  if not exists (select 1 from public.report_execution_jobs where id=p_job_id and company_id=p_company_id and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at > clock_timestamp()) then raise exception 'Execution task start rejected: active worker lease is missing'; end if;
  select count(*) into v_previous from public.report_execution_tasks where company_id=p_company_id and report_execution_job_id=p_job_id and ordinal < v_ordinal and status <> 'completed';
  if v_previous > 0 then raise exception 'Execution task ordering violation before stage %', p_stage; end if;
  update public.report_execution_tasks set status='running',worker_id=p_worker_id,attempt=attempt+1,started_at=coalesce(started_at,clock_timestamp()),completed_at=null,last_error='{}'::jsonb,updated_at=clock_timestamp()
  where company_id=p_company_id and report_execution_job_id=p_job_id and stage=p_stage and status in ('queued','failed');
  get diagnostics affected=row_count; return affected=1;
end;
$function$;

create or replace function public.complete_report_execution_task(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_stage text,p_evidence jsonb default '{}'::jsonb)
returns boolean language plpgsql security definer set search_path to 'pg_catalog'
as $function$
declare affected integer;
begin
  if p_evidence is null or jsonb_typeof(p_evidence) <> 'object' then raise exception 'Task evidence must be a JSON object'; end if;
  if not exists (select 1 from public.report_execution_jobs where id=p_job_id and company_id=p_company_id and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at > clock_timestamp()) then raise exception 'Execution task completion rejected: active worker lease is missing'; end if;
  update public.report_execution_tasks set status='completed',completed_at=clock_timestamp(),evidence=p_evidence,updated_at=clock_timestamp()
  where company_id=p_company_id and report_execution_job_id=p_job_id and stage=p_stage and status='running' and worker_id=p_worker_id;
  get diagnostics affected=row_count; return affected=1;
end;
$function$;

create or replace function public.fail_report_execution_task(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_stage text,p_error jsonb)
returns boolean language plpgsql security definer set search_path to 'pg_catalog'
as $function$
declare affected integer;
begin
  if p_error is null or jsonb_typeof(p_error) <> 'object' then raise exception 'Task failure requires a JSON object'; end if;
  update public.report_execution_tasks set status='failed',last_error=p_error,updated_at=clock_timestamp()
  where company_id=p_company_id and report_execution_job_id=p_job_id and stage=p_stage and status='running' and worker_id=p_worker_id
    and exists (select 1 from public.report_execution_jobs where id=p_job_id and company_id=p_company_id and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at > clock_timestamp());
  get diagnostics affected=row_count; return affected=1;
end;
$function$;

create or replace function public.retry_report_execution_job(p_job_id uuid,p_company_id uuid)
returns boolean language plpgsql security definer set search_path to 'pg_catalog'
as $function$
declare affected integer;
begin
  update public.report_execution_jobs set status='queued',lease_owner=null,lease_token=null,lease_expires_at=null,last_error='{}'::jsonb,completed_at=null,updated_at=clock_timestamp()
  where id=p_job_id and company_id=p_company_id and status='failed' and attempt<max_attempts;
  if not found then return false; end if;
  update public.report_execution_tasks set status='queued',worker_id=null,started_at=null,completed_at=null,last_error='{}'::jsonb,updated_at=clock_timestamp()
  where report_execution_job_id=p_job_id and company_id=p_company_id and status='failed';
  get diagnostics affected=row_count; return true;
end;
$function$;

revoke all on function public.start_report_execution_task(uuid,uuid,text,uuid,text) from public,anon,authenticated;
revoke all on function public.complete_report_execution_task(uuid,uuid,text,uuid,text,jsonb) from public,anon,authenticated;
revoke all on function public.fail_report_execution_task(uuid,uuid,text,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.start_report_execution_task(uuid,uuid,text,uuid,text) to service_role;
grant execute on function public.complete_report_execution_task(uuid,uuid,text,uuid,text,jsonb) to service_role;
grant execute on function public.fail_report_execution_task(uuid,uuid,text,uuid,text,jsonb) to service_role;
revoke all on function public.retry_report_execution_job(uuid,uuid) from public,anon,authenticated;
grant execute on function public.retry_report_execution_job(uuid,uuid) to service_role;
commit;
