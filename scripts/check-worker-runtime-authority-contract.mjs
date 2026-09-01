import fs from 'node:fs';
const authority = fs.readFileSync('supabase/migrations/20260901150000_harden_worker_runtime_authority.sql', 'utf8');
const functions = ['advance_report_execution_checkpoint','complete_report_execution_job','fail_report_execution_job','heartbeat_report_execution_job','retry_report_execution_job'];
for (const fn of functions) {
  if (!authority.includes(`REVOKE EXECUTE ON FUNCTION public.${fn}`)) throw new Error(`WORKER_AUTH_REVOKE_MISSING:${fn}`);
  if (!authority.includes(`GRANT EXECUTE ON FUNCTION public.${fn}`)) throw new Error(`WORKER_AUTH_GRANT_MISSING:${fn}`);
}
if (!authority.includes('REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.report_execution_jobs FROM authenticated;')) throw new Error('WORKER_TABLE_WRITE_REVOKE_MISSING');
console.log(`WORKER_RUNTIME_AUTHORITY_CONTRACT_PASS:${functions.length}`);
