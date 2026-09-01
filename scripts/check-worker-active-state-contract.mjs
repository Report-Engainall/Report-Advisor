import fs from 'node:fs';

const source = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');
const active = [
  'heartbeat_report_execution_job',
  'advance_report_execution_checkpoint',
  'complete_report_execution_job',
  'fail_report_execution_job',
];
for (const name of active) {
  const body = source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\$\\$;`))?.[0] ?? '';
  if (!/status\s+in\s*\(\s*'leased'\s*,\s*'processing'\s*\)/.test(body)) throw new Error(`${name} must mutate only leased/processing jobs`);
}
const retry = source.match(/create or replace function public\.retry_report_execution_job[\s\S]*?\$\$;/)?.[0] ?? '';
if (/status\s+in\s*\(\s*'leased'\s*,\s*'processing'/.test(retry)) throw new Error('retry must not accept active worker states');
console.log('worker active-state contract: PASS');
