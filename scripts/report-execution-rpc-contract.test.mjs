import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260906190100_canonicalize_report_execution_worker_contract.sql', 'utf8');
const adapter = fs.readFileSync('src/lib/report-execution/durable-worker-adapter.ts', 'utf8');

const signatures = [
  /claim_report_execution_job\(p_job_id uuid,p_lease_owner text,p_lease_seconds integer default 300\)/,
  /heartbeat_report_execution_job\(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_lease_seconds integer default 300\)/,
  /advance_report_execution_checkpoint\(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_checkpoint jsonb\)/,
  /complete_report_execution_job\(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_evidence jsonb default '\{\}'::jsonb\)/,
  /fail_report_execution_job\(p_job_id uuid,p_worker_id text,p_lease_token uuid,p_error jsonb\)/,
  /retry_report_execution_job\(p_job_id uuid\)/,
];
for (const signature of signatures) assert.match(migration, signature);

assert.doesNotMatch(adapter, /rpc\('[^']*_report_execution_job'.*p_company_id/, 'adapter must not send undeclared p_company_id');
for (const rpc of [
  "rpc('claim_report_execution_job'",
  "rpc('heartbeat_report_execution_job'",
  "rpc('advance_report_execution_checkpoint'",
  "rpc('complete_report_execution_job'",
  "rpc('fail_report_execution_job'",
  "rpc('retry_report_execution_job'",
]) assert.ok(adapter.includes(rpc), `missing ${rpc}`);

assert.match(adapter, /p_lease_token: job\.leaseToken/);
assert.match(adapter, /rpc\('retry_report_execution_job', \{ p_job_id: jobId \}\)/);

console.log('Report execution RPC contract: PASS');
