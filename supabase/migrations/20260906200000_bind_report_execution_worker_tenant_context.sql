-- Worker RPCs execute as service_role, so they cannot rely on current_company_id()
-- from an end-user JWT. Bind every lifecycle mutation to an explicit company_id
-- supplied by the trusted worker and keep the RPCs service_role-only.

create or replace function public.claim_report_execution_job(p_job_id uuid,p_company_id uuid,p_lease_owner text,p_lease_seconds integer default 300)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer;
begin
  if p_company_id is null then raise exception 'Worker company context is required'; end if;
  if p_lease_owner is null or btrim(p_lease_owner)='' then raise exception 'Worker lease owner is required'; end if;
  if p_lease_seconds<30 then raise exception 'Worker lease must be at least 30 seconds'; end if;
  update public.report_execution_jobs set status='leased',lease_owner=p_lease_owner,lease_token=gen_random_uuid(),lease_expires_at=now()+make_interval(secs=>p_lease_seconds),attempt=attempt+1,updated_at=now()
   where id=p_job_id and company_id=p_company_id and status in ('queued','leased','processing') and (lease_expires_at is null or lease_expires_at<=now()) and attempt<max_attempts;
  get diagnostics affected=row_count; return affected=1;
end;$function$;

create or replace function public.heartbeat_report_execution_job(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_lease_seconds integer default 300)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer;
begin
  if p_company_id is null then raise exception 'Worker company context is required'; end if;
  if p_lease_seconds<30 then raise exception 'Worker lease must be at least 30 seconds'; end if;
  update public.report_execution_jobs set lease_expires_at=now()+make_interval(secs=>p_lease_seconds),updated_at=now()
   where id=p_job_id and company_id=p_company_id and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at is not null and lease_expires_at>now();
  get diagnostics affected=row_count; return affected=1;
end;$function$;

create or replace function public.advance_report_execution_checkpoint(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_checkpoint jsonb)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer; old_stage text; new_stage text; old_hash text; new_hash text; old_pos integer; new_pos integer;
begin
  if p_company_id is null then raise exception 'Worker company context is required'; end if;
  if p_checkpoint is null or jsonb_typeof(p_checkpoint)<>'object' then raise exception 'Checkpoint must be a JSON object'; end if;
  new_stage=p_checkpoint->>'stage'; new_hash=p_checkpoint->>'sourceHash';
  if new_stage is null or new_stage not in ('queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered') then raise exception 'Checkpoint stage is invalid'; end if;
  if new_hash is null or btrim(new_hash)='' then raise exception 'Checkpoint source hash is required'; end if;
  if jsonb_typeof(p_checkpoint->'evidenceKeys') is distinct from 'array' then raise exception 'Checkpoint evidenceKeys must be an array'; end if;
  select checkpoint->>'stage',checkpoint->>'sourceHash' into old_stage,old_hash from public.report_execution_jobs where id=p_job_id and company_id=p_company_id and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at is not null and lease_expires_at>now() for update;
  if not found then return false; end if;
  if old_hash is not null and btrim(old_hash)<>'' and old_hash<>new_hash then raise exception 'Checkpoint source hash cannot change during a run'; end if;
  if old_stage is null then
    if new_stage <> 'queued' then raise exception 'Initial checkpoint stage must be queued'; end if;
  else
    old_pos=array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],old_stage);
    new_pos=array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'],new_stage);
    if old_pos is null or new_pos<>old_pos+1 then raise exception 'Invalid checkpoint transition: % -> %',old_stage,new_stage; end if;
  end if;
  update public.report_execution_jobs set checkpoint=p_checkpoint,status='processing',updated_at=now() where id=p_job_id and company_id=p_company_id and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at is not null and lease_expires_at>now();
  get diagnostics affected=row_count; return affected=1;
end;$function$;

create or replace function public.complete_report_execution_job(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_evidence jsonb default '{}'::jsonb)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer;
begin
  if p_company_id is null then raise exception 'Worker company context is required'; end if;
  if p_evidence is null or jsonb_typeof(p_evidence)<>'object' then raise exception 'Completion evidence must be a JSON object'; end if;
  update public.report_execution_jobs set status='completed',evidence=p_evidence,lease_owner=null,lease_token=null,lease_expires_at=null,completed_at=now(),updated_at=now()
   where id=p_job_id and company_id=p_company_id and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at is not null and lease_expires_at>now() and checkpoint->>'stage'='rendered';
  get diagnostics affected=row_count; return affected=1;
end;$function$;

create or replace function public.fail_report_execution_job(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_error jsonb)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer;
begin
  if p_company_id is null then raise exception 'Worker company context is required'; end if;
  if p_error is null or jsonb_typeof(p_error)<>'object' then raise exception 'Failure transition requires a structured error payload'; end if;
  update public.report_execution_jobs set status=case when attempt>=max_attempts then 'dead_letter' else 'failed' end,last_error=p_error,lease_owner=null,lease_token=null,lease_expires_at=null,completed_at=null,updated_at=now()
   where id=p_job_id and company_id=p_company_id and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at is not null and lease_expires_at>now();
  get diagnostics affected=row_count; return affected=1;
end;$function$;

create or replace function public.retry_report_execution_job(p_job_id uuid,p_company_id uuid)
returns boolean language plpgsql security definer set search_path to 'pg_catalog' as $function$
declare affected integer;
begin
  if p_company_id is null then raise exception 'Worker company context is required'; end if;
  update public.report_execution_jobs set status='queued',lease_owner=null,lease_token=null,lease_expires_at=null,last_error='{}'::jsonb,completed_at=null,updated_at=now()
   where id=p_job_id and company_id=p_company_id and status='failed' and attempt<max_attempts;
  get diagnostics affected=row_count; return affected=1;
end;$function$;

-- Remove the legacy signatures that depended on current_company_id().
drop function if exists public.claim_report_execution_job(uuid,text,integer);
drop function if exists public.heartbeat_report_execution_job(uuid,text,uuid,integer);
drop function if exists public.advance_report_execution_checkpoint(uuid,text,uuid,jsonb);
drop function if exists public.complete_report_execution_job(uuid,text,uuid,jsonb);
drop function if exists public.fail_report_execution_job(uuid,text,uuid,jsonb);
drop function if exists public.retry_report_execution_job(uuid);

revoke all on function public.claim_report_execution_job(uuid,uuid,text,integer) from public,anon,authenticated;
revoke all on function public.heartbeat_report_execution_job(uuid,uuid,text,uuid,integer) from public,anon,authenticated;
revoke all on function public.advance_report_execution_checkpoint(uuid,uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.complete_report_execution_job(uuid,uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.fail_report_execution_job(uuid,uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.retry_report_execution_job(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_report_execution_job(uuid,uuid,text,integer) to service_role;
grant execute on function public.heartbeat_report_execution_job(uuid,uuid,text,uuid,integer) to service_role;
grant execute on function public.advance_report_execution_checkpoint(uuid,uuid,text,uuid,jsonb) to service_role;
grant execute on function public.complete_report_execution_job(uuid,uuid,text,uuid,jsonb) to service_role;
grant execute on function public.fail_report_execution_job(uuid,uuid,text,uuid,jsonb) to service_role;
grant execute on function public.retry_report_execution_job(uuid,uuid) to service_role;
