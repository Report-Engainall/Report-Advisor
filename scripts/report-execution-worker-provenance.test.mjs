import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  'supabase/migrations/20260907193000_reconcile_report_execution_worker_provenance.sql',
  'utf8',
);
const adapter = fs.readFileSync('src/lib/report-execution/durable-worker-adapter.ts', 'utf8');

for (const signature of [
  /enqueue_report_execution_job\(p_company_id uuid,p_job_key text,p_source_path text,p_source_hash text,p_evidence_keys text\[\] default '\{\}',p_max_attempts integer default 5\)/,
  /claim_report_execution_job\(p_job_id uuid,p_company_id uuid,p_lease_owner text,p_lease_seconds integer default 300\)/,
  /heartbeat_report_execution_job\(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_lease_seconds integer default 300\)/,
  /advance_report_execution_checkpoint\(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_checkpoint jsonb\)/,
  /complete_report_execution_job\(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_evidence jsonb default '\{\}'::jsonb\)/,
  /fail_report_execution_job\(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_error jsonb\)/,
  /recover_expired_report_execution_jobs\(p_company_id uuid,p_limit integer default 100\)/,
  /retry_report_execution_job\(p_job_id uuid,p_company_id uuid\)/,
]) assert.match(migration, signature);

for (const legacy of [
  'drop function if exists public.claim_report_execution_job(uuid,text,integer)',
  'drop function if exists public.heartbeat_report_execution_job(uuid,text,uuid,integer)',
  'drop function if exists public.advance_report_execution_checkpoint(uuid,text,uuid,jsonb)',
  'drop function if exists public.complete_report_execution_job(uuid,text,uuid,jsonb)',
  'drop function if exists public.fail_report_execution_job(uuid,text,uuid,jsonb)',
  'drop function if exists public.retry_report_execution_job(uuid)',
]) assert.ok(migration.includes(legacy), `legacy worker signature not retired: ${legacy}`);

for (const rpc of [
  "rpc('enqueue_report_execution_job'",
  "rpc('claim_report_execution_job'",
  "rpc('heartbeat_report_execution_job'",
  "rpc('advance_report_execution_checkpoint'",
  "rpc('complete_report_execution_job'",
  "rpc('fail_report_execution_job'",
  "rpc('recover_expired_report_execution_jobs'",
  "rpc('retry_report_execution_job'",
]) assert.ok(adapter.includes(rpc), `adapter missing ${rpc}`);

assert.match(adapter, /p_company_id: tenant/);
assert.match(adapter, /p_lease_token: job\.leaseToken/);
assert.match(adapter, /p_company_id: tenant/);

for (const grant of [
  'grant execute on function public.enqueue_report_execution_job',
  'grant execute on function public.claim_report_execution_job',
  'grant execute on function public.heartbeat_report_execution_job',
  'grant execute on function public.advance_report_execution_checkpoint',
  'grant execute on function public.complete_report_execution_job',
  'grant execute on function public.fail_report_execution_job',
  'grant execute on function public.recover_expired_report_execution_jobs',
  'grant execute on function public.retry_report_execution_job',
]) assert.ok(migration.includes(grant), `missing service_role grant: ${grant}`);

assert.match(migration, /alter table public\.report_execution_jobs enable row level security/);
assert.match(migration, /using \(company_id = public\.current_company_id\(\)\)/);
assert.match(migration, /with check \(company_id = public\.current_company_id\(\)\)/);
assert.match(migration, /lease_token is not null/);
assert.match(migration, /sourceHash/);
assert.match(migration, /worker_attempts_exhausted_after_lease_expiry/);

console.log('Report execution worker provenance: PASS');
