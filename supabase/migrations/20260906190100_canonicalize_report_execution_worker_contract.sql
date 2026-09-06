-- Canonicalize the durable report-execution worker contract.
-- Idempotent replay converges on the live lease-token fenced contract.

create table if not exists public.report_execution_jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_key text not null,
  source_path text,
  source_hash text,
  status text not null default 'queued',
  checkpoint jsonb not null default '{}'::jsonb,
  attempt integer not null default 0,
  max_attempts integer not null default 3,
  lease_owner text,
  lease_token uuid,
  lease_expires_at timestamptz,
  last_error jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(company_id, job_key)
);

alter table public.report_execution_jobs add column if not exists lease_token uuid;
alter table public.report_execution_jobs add column if not exists checkpoint jsonb not null default '{}'::jsonb;
alter table public.report_execution_jobs add column if not exists last_error jsonb not null default '{}'::jsonb;
alter table public.report_execution_jobs add column if not exists evidence jsonb not null default '{}'::jsonb;

create index if not exists idx_report_execution_jobs_queue on public.report_execution_jobs(status, created_at);
create index if not exists idx_report_execution_jobs_company on public.report_execution_jobs(company_id, created_at desc);
create index if not exists idx_report_execution_jobs_lease on public.report_execution_jobs(status, lease_expires_at);

alter table public.report_execution_jobs drop constraint if exists report_execution_jobs_status_check;
alter table public.report_execution_jobs drop constraint if exists report_execution_jobs_status_values;
alter table public.report_execution_jobs drop constraint if exists report_execution_jobs_lease_token_integrity;
alter table public.report_execution_jobs drop constraint if exists report_execution_jobs_attempt_bounds;
alter table public.report_execution_jobs drop constraint if exists report_execution_jobs_attempt_check;
alter table public.report_execution_jobs drop constraint if exists report_execution_jobs_max_attempts_check;

alter table public.report_execution_jobs add constraint report_execution_jobs_status_check
  check (status in ('queued','leased','processing','completed','failed','dead_letter'));
alter table public.report_execution_jobs add constraint report_execution_jobs_attempt_bounds
  check (attempt >= 0 and max_attempts >= 1 and attempt <= max_attempts);
alter table public.report_execution_jobs add constraint report_execution_jobs_lease_token_integrity
  check ((status in ('leased','processing') and lease_token is not null and lease_owner is not null and lease_expires_at is not null) or status not in ('leased','processing'));

create or replace function public.claim_report_execution_job(p_job_id uuid,p_lease_owner text,p_lease_seconds integer default 300)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer;
begin
  if p_lease_owner is null or btrim(p_lease_owner)='' then raise exception 'Worker lease owner is required'; end if;
  if p_lease_seconds<30 then raise exception 'Worker lease must be at least 30 seconds'; end if;
  update public.report_execution_jobs set status='leased',lease_owner=p_lease_owner,lease_token=gen_random_uuid(),lease_expires_at=now()+make_interval(secs=>p_lease_seconds),attempt=attempt+1,updated_at=now()
   where id=p_job_id and company_id=public.current_company_id() and status in ('queued','leased','processing') and (lease_expires_at is null or lease_expires_at<=now()) and attempt<max_attempts;
  get diagnostics affected=row_count; return affected=1;
end;$function$;

create or replace function public.heartbeat_report_execution_job(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_lease_seconds integer default 300)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer;
begin
  if p_lease_seconds<30 then raise exception 'Worker lease must be at least 30 seconds'; end if;
  update public.report_execution_jobs set lease_expires_at=now()+make_interval(secs=>p_lease_seconds),updated_at=now()
   where id=p_job_id and company_id=public.current_company_id() and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at is not null and lease_expires_at>now();
  get diagnostics affected=row_count; return affected=1;
end;$function$;

create or replace function public.advance_report_execution_checkpoint(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_checkpoint jsonb)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer; old_stage text; new_stage text; old_hash text; new_hash text; old_pos integer; new_pos integer;
begin
  if p_checkpoint is null or jsonb_typeof(p_checkpoint)<>'object' then raise exception 'Checkpoint must be a JSON object'; end if;
  new_stage=p_checkpoint->>'stage'; new_hash=p_checkpoint->>'sourceHash';
  if new_stage is null or new_stage not in ('queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered') then raise exception 'Checkpoint stage is invalid'; end if;
  if new_hash is null or btrim(new_hash)='' then raise exception 'Checkpoint source hash is required'; end if;
  if jsonb_typeof(p_checkpoint->'evidenceKeys')<>'array' then raise exception 'Checkpoint evidenceKeys must be an array'; end if;
  select checkpoint->>'stage',checkpoint->>'sourceHash' into old_stage,old_hash from public.report_execution_jobs where id=p_job_id and company_id=public.current_company_id() and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at is not null and lease_expires_at>now() for update;
  if not found then return false; end if;
  if old_hash is not null and btrim(old_hash)<>'' and old_hash<>new_hash then raise exception 'Checkpoint source hash cannot change during a run'; end if;
  if old_stage is not null then
    old_pos=array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],old_stage);
    new_pos=array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],new_stage);
    if old_pos is null or new_pos<>old_pos+1 then raise exception 'Invalid checkpoint transition: % -> %',old_stage,new_stage; end if;
  end if;
  update public.report_execution_jobs set checkpoint=p_checkpoint,status='processing',updated_at=now() where id=p_job_id and company_id=public.current_company_id() and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at is not null and lease_expires_at>now();
  get diagnostics affected=row_count; return affected=1;
end;$function$;

create or replace function public.complete_report_execution_job(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_evidence jsonb default '{}'::jsonb)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer;
begin
  if p_evidence is null or jsonb_typeof(p_evidence)<>'object' then raise exception 'Completion evidence must be a JSON object'; end if;
  update public.report_execution_jobs set status='completed',evidence=p_evidence,lease_owner=null,lease_token=null,lease_expires_at=null,completed_at=now(),updated_at=now()
   where id=p_job_id and company_id=public.current_company_id() and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at is not null and lease_expires_at>now() and checkpoint->>'stage'='rendered';
  get diagnostics affected=row_count; return affected=1;
end;$function$;

create or replace function public.fail_report_execution_job(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_error jsonb)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer;
begin
  if p_error is null or jsonb_typeof(p_error)<>'object' then raise exception 'Failure transition requires a structured error payload'; end if;
  update public.report_execution_jobs set status=case when attempt>=max_attempts then 'dead_letter' else 'failed' end,last_error=p_error,lease_owner=null,lease_token=null,lease_expires_at=null,completed_at=null,updated_at=now()
   where id=p_job_id and company_id=public.current_company_id() and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at is not null and lease_expires_at>now();
  get diagnostics affected=row_count; return affected=1;
end;$function$;

create or replace function public.retry_report_execution_job(p_job_id uuid)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer;
begin
  update public.report_execution_jobs set status='queued',lease_owner=null,lease_token=null,lease_expires_at=null,last_error='{}'::jsonb,completed_at=null,updated_at=now()
   where id=p_job_id and company_id=public.current_company_id() and status='failed' and attempt<max_attempts;
  get diagnostics affected=row_count; return affected=1;
end;$function$;

revoke all on function public.claim_report_execution_job(uuid,text,integer) from public,anon,authenticated;
revoke all on function public.heartbeat_report_execution_job(uuid,text,uuid,integer) from public,anon,authenticated;
revoke all on function public.advance_report_execution_checkpoint(uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.complete_report_execution_job(uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.fail_report_execution_job(uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.retry_report_execution_job(uuid) from public,anon,authenticated;
grant execute on function public.claim_report_execution_job(uuid,text,integer) to service_role;
grant execute on function public.heartbeat_report_execution_job(uuid,text,uuid,integer) to service_role;
grant execute on function public.advance_report_execution_checkpoint(uuid,text,uuid,jsonb) to service_role;
grant execute on function public.complete_report_execution_job(uuid,text,uuid,jsonb) to service_role;
grant execute on function public.fail_report_execution_job(uuid,text,uuid,jsonb) to service_role;
grant execute on function public.retry_report_execution_job(uuid) to service_role;
