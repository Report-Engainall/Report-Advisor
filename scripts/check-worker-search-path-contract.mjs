import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');

const functions = [
  'heartbeat_report_execution_job',
  'advance_report_execution_checkpoint',
  'complete_report_execution_job',
  'fail_report_execution_job',
  'retry_report_execution_job',
];

for (const name of functions) {
  const pattern = new RegExp(`create or replace function public\\.${name}[\\s\\S]*?set search_path = public`);
  if (!pattern.test(migration)) throw new Error(`missing fixed search_path for ${name}`);
}

console.log(`PASS: ${functions.length}/${functions.length} worker lifecycle functions pin search_path=public`);
