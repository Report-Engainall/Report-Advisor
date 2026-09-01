import fs from 'node:fs';

const source = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');
const functions = ['heartbeat_report_execution_job','advance_report_execution_checkpoint','complete_report_execution_job','fail_report_execution_job','retry_report_execution_job'];
for (const name of functions) {
  const body = source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\$\\$;`))?.[0] ?? '';
  if (!/returns boolean/i.test(body)) throw new Error(`${name} must return boolean`);
  if (!/get diagnostics affected = row_count;/.test(body)) throw new Error(`${name} must inspect affected row count`);
  if (!/return affected > 0;/.test(body)) throw new Error(`${name} must return mutation success from affected row count`);
}
console.log('worker RPC return contract: PASS');
