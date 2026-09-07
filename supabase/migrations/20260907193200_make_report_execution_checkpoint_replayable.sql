-- Make checkpoint persistence safe to replay after a committed RPC response is lost.
-- Identical state is a successful no-op; a different same-position checkpoint remains invalid.
CREATE OR REPLACE FUNCTION public.advance_report_execution_checkpoint(
  p_job_id uuid,
  p_company_id uuid,
  p_worker_id text,
  p_lease_token uuid,
  p_checkpoint jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
AS $function$
declare
  affected integer;
  old_stage text;
  new_stage text;
  old_hash text;
  new_hash text;
  old_pos integer;
  new_pos integer;
  old_checkpoint jsonb;
begin
  if p_company_id is null then raise exception 'Worker company context is required'; end if;
  if p_checkpoint is null or jsonb_typeof(p_checkpoint) <> 'object' then raise exception 'Checkpoint must be a JSON object'; end if;

  new_stage := p_checkpoint->>'stage';
  new_hash := p_checkpoint->>'sourceHash';
  if new_stage is null or new_stage not in ('queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered') then
    raise exception 'Checkpoint stage is invalid';
  end if;
  if new_hash is null or btrim(new_hash) = '' then raise exception 'Checkpoint source hash is required'; end if;
  if jsonb_typeof(p_checkpoint->'evidenceKeys') is distinct from 'array' then raise exception 'Checkpoint evidenceKeys must be an array'; end if;

  select checkpoint, checkpoint->>'stage', checkpoint->>'sourceHash'
    into old_checkpoint, old_stage, old_hash
  from public.report_execution_jobs
  where id=p_job_id and company_id=p_company_id and status in ('leased','processing')
    and lease_owner=p_worker_id and lease_token=p_lease_token
    and lease_expires_at is not null and lease_expires_at>now()
  for update;
  if not found then return false; end if;

  if old_hash is not null and btrim(old_hash) <> '' and old_hash <> new_hash then
    raise exception 'Checkpoint source hash cannot change during a run';
  end if;

  if old_stage is null then
    if new_stage <> 'queued' then raise exception 'Initial checkpoint stage must be queued'; end if;
  else
    old_pos := array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'], old_stage);
    new_pos := array_position(array['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'], new_stage);
    if old_pos is null or new_pos is null then raise exception 'Invalid checkpoint position'; end if;

    -- Network/retry replay of the exact committed checkpoint is idempotent.
    if new_pos = old_pos and (p_checkpoint - 'updatedAt') = (old_checkpoint - 'updatedAt') then
      return true;
    end if;
    if new_pos <> old_pos + 1 then
      raise exception 'Invalid checkpoint transition: % -> %', old_stage, new_stage;
    end if;
  end if;

  update public.report_execution_jobs
     set checkpoint=p_checkpoint,status='processing',updated_at=now()
   where id=p_job_id and company_id=p_company_id and status in ('leased','processing')
     and lease_owner=p_worker_id and lease_token=p_lease_token
     and lease_expires_at is not null and lease_expires_at>now();
  get diagnostics affected=row_count;
  return affected=1;
end;
$function$;

REVOKE ALL ON FUNCTION public.advance_report_execution_checkpoint(uuid,uuid,text,uuid,jsonb) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.advance_report_execution_checkpoint(uuid,uuid,text,uuid,jsonb) TO service_role;
