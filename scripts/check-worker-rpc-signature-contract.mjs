import fs from 'node:fs';

const source = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');
const signatures = [
  /heartbeat_report_execution_job\(\s*p_job_id uuid,\s*p_worker_id text,\s*p_lease_seconds integer default 300/s,
  /advance_report_execution_checkpoint\(\s*p_job_id uuid,\s*p_worker_id text,\s*p_checkpoint jsonb/s,
  /complete_report_execution_job\(\s*p_job_id uuid,\s*p_worker_id text,\s*p_evidence jsonb default '\{\}'::jsonb/s,
  /fail_report_execution_job\(\s*p_job_id uuid,\s*p_worker_id text,\s*p_error jsonb/s,
  /retry_report_execution_job\(\s*p_job_id uuid\)/s,
];
for (const pattern of signatures) if (!pattern.test(source)) throw new Error(`worker RPC signature missing: ${pattern}`);
console.log('worker RPC signature contract: PASS');
