-- Forward-only reconciliation: preserve canonical evidence keys in durable
-- checkpoints and enforce the existing checkpoint transition contract.
create or replace function public.enqueue_report_execution_job(
  p_company_id uuid, p_job_key text, p_source_path text, p_source_hash text,
  p_evidence_keys text[] default '{}', p_max_attempts integer default 3
)
returns jsonb
language plpgsql security definer set search_path = public, pg_catalog
as $function$
declare v_company_id uuid := public.current_company_id(); v_job public.report_execution_jobs%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'AUTHENTICATED_USER_REQUIRED'; end if;
  if v_company_id is null or p_company_id is null or p_company_id is distinct from v_company_id then raise exception 'TENANT_CONTEXT_MISMATCH'; end if;
  if p_job_key is null or btrim(p_job_key) = '' then raise exception 'REPORT_EXECUTION_JOB_KEY_REQUIRED'; end if;
  if p_source_path is null or btrim(p_source_path) = '' then raise exception 'REPORT_EXECUTION_SOURCE_PATH_REQUIRED'; end if;
  if p_source_hash is null or p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' then raise exception 'REPORT_EXECUTION_SOURCE_HASH_INVALID'; end if;
  if coalesce(p_max_attempts, 0) < 1 then raise exception 'REPORT_EXECUTION_MAX_ATTEMPTS_INVALID'; end if;
  insert into public.report_execution_jobs(company_id,job_key,source_path,source_hash,status,checkpoint,max_attempts,evidence)
  values (
    v_company_id,p_job_key,p_source_path,p_source_hash,'queued',
    jsonb_build_object(
      'stage','queued',
      'sourceHash',p_source_hash,
      'evidenceKeys',coalesce(to_jsonb(p_evidence_keys),'[]'::jsonb),
      'updatedAt',floor(extract(epoch from clock_timestamp())*1000)::bigint
    ),
    least(p_max_attempts,20),
    jsonb_build_object('keys',coalesce(to_jsonb(p_evidence_keys),'[]'::jsonb))
  )
  on conflict(company_id,job_key) do nothing;
  select * into v_job from public.report_execution_jobs where company_id=v_company_id and job_key=p_job_key for update;
  if not found then raise exception 'REPORT_EXECUTION_JOB_NOT_FOUND'; end if;
  if v_job.source_hash is distinct from p_source_hash or v_job.source_path is distinct from p_source_path then raise exception 'REPORT_EXECUTION_JOB_SOURCE_IDENTITY_MISMATCH'; end if;
  return jsonb_build_object('id',v_job.id,'company_id',v_job.company_id,'status',v_job.status,'checkpoint',v_job.checkpoint,'attempt',v_job.attempt,'max_attempts',v_job.max_attempts,'lease_owner',v_job.lease_owner,'lease_token',v_job.lease_token,'lease_expires_at',v_job.lease_expires_at);
end;
$function$;

create or replace function public.advance_report_execution_checkpoint(
  p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_checkpoint jsonb
)
returns boolean
language plpgsql security definer set search_path = public, pg_catalog
as $function$
declare affected integer; old_stage text; new_stage text; old_hash text; new_hash text; old_pos integer; new_pos integer;
begin
  if (select auth.uid()) is null then raise exception 'AUTHENTICATED_USER_REQUIRED'; end if;
  if public.current_company_id() is distinct from p_company_id then raise exception 'TENANT_CONTEXT_MISMATCH'; end if;
  if p_checkpoint is null or jsonb_typeof(p_checkpoint) is distinct from 'object' then raise exception 'REPORT_EXECUTION_CHECKPOINT_INVALID'; end if;
  new_stage := p_checkpoint->>'stage'; new_hash := p_checkpoint->>'sourceHash';
  if new_stage is null or new_stage not in ('queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered') then raise exception 'REPORT_EXECUTION_CHECKPOINT_STAGE_INVALID'; end if;
  if new_hash is null or btrim(new_hash) = '' then raise exception 'REPORT_EXECUTION_CHECKPOINT_SOURCE_HASH_REQUIRED'; end if;
  if jsonb_typeof(p_checkpoint->'evidenceKeys') is distinct from 'array' then raise exception 'REPORT_EXECUTION_CHECKPOINT_EVIDENCE_KEYS_REQUIRED'; end if;
  select checkpoint->>'stage', checkpoint->>'sourceHash' into old_stage, old_hash
  from public.report_execution_jobs
  where id=p_job_id and company_id=p_company_id and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at>clock_timestamp()
  for update;
  if not found then return false; end if;
  if old_hash is not null and btrim(old_hash)<>'' and old_hash<>new_hash then raise exception 'REPORT_EXECUTION_CHECKPOINT_SOURCE_HASH_CHANGED'; end if;
  if old_stage is null then
    if new_stage <> 'queued' then raise exception 'REPORT_EXECUTION_CHECKPOINT_INITIAL_STAGE_INVALID'; end if;
  else
    old_pos := array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'], old_stage);
    new_pos := array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'], new_stage);
    if old_pos is null or new_pos <> old_pos + 1 then raise exception 'REPORT_EXECUTION_CHECKPOINT_TRANSITION_INVALID'; end if;
  end if;
  update public.report_execution_jobs set checkpoint=p_checkpoint,status='processing',updated_at=clock_timestamp()
  where id=p_job_id and company_id=p_company_id and status in ('leased','processing') and lease_owner=p_worker_id and lease_token=p_lease_token and lease_expires_at>clock_timestamp();
  get diagnostics affected=row_count; return affected=1;
end;
$function$;
