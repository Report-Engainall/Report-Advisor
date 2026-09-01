import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');
const functions = ['heartbeat_report_execution_job','advance_report_execution_checkpoint','complete_report_execution_job','fail_report_execution_job','retry_report_execution_job'];

for (const name of functions) {
  const body = migration.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\$\\$;`))?.[0] ?? '';
  if (!body) throw new Error(`missing lifecycle function: ${name}`);
  if (!/company_id\s*=\s*public\.current_company_id\(\)/.test(body)) throw new Error(`${name} missing current tenant boundary`);
}

console.log('worker tenant boundary contract: PASS');
