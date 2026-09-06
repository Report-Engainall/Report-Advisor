import assert from 'node:assert/strict';
import fs from 'node:fs';

// 20260906200000 is later than the canonicalization migration and therefore
// is the authoritative replayed worker RPC contract.
const migration = fs.readFileSync('supabase/migrations/20260906200000_bind_report_execution_worker_tenant_context.sql', 'utf8');
const adapter = fs.readFileSync('src/lib/report-execution/durable-worker-adapter.ts', 'utf8');

const signatures = [
  /claim_report_execution_job\(p_job_id uuid,p_company_id uuid,p_lease_owner text,p_lease_seconds integer default 300\)/,
  /heartbeat_report_execution_job\(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_lease_seconds integer default 300\)/,
  /advance_report_execution_checkpoint\(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_checkpoint jsonb\)/,
  /complete_report_execution_job\(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_evidence jsonb default '\{\}'::jsonb\)/,
  /fail_report_execution_job\(p_job_id uuid,p_company_id uuid,p_worker_id text,p_lease_token uuid,p_error jsonb\)/,
  /retry_report_execution_job\(p_job_id uuid,p_company_id uuid\)/,
];
for (const signature of signatures) assert.match(migration, signature);

for (const rpc of [
  "rpc('claim_report_execution_job'",
  "rpc('heartbeat_report_execution_job'",
  "rpc('advance_report_execution_checkpoint'",
  "rpc('complete_report_execution_job'",
  "rpc('fail_report_execution_job'",
  "rpc('retry_report_execution_job'",
]) assert.ok(adapter.includes(rpc), `missing ${rpc}`);

assert.match(adapter, /p_company_id: tenant/);
assert.match(adapter, /p_lease_token: job\.leaseToken/);
assert.match(adapter, /rpc\('retry_report_execution_job', \{ p_job_id: jobId, p_company_id: tenant \}\)/);

// The older current_company_id()-bound signatures must be explicitly retired.
for (const legacy of [
  'drop function if exists public.claim_report_execution_job(uuid,text,integer)',
  'drop function if exists public.heartbeat_report_execution_job(uuid,text,uuid,integer)',
  'drop function if exists public.advance_report_execution_checkpoint(uuid,text,uuid,jsonb)',
  'drop function if exists public.complete_report_execution_job(uuid,text,uuid,jsonb)',
  'drop function if exists public.fail_report_execution_job(uuid,text,uuid,jsonb)',
  'drop function if exists public.retry_report_execution_job(uuid)',
]) assert.ok(migration.includes(legacy), `legacy RPC signature was not explicitly retired: ${legacy}`);

console.log('Report execution RPC contract: PASS (latest tenant-bound signatures + adapter alignment + legacy signature retirement)');
