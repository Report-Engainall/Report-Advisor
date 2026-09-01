import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');

for (const name of ['complete_report_execution_job', 'fail_report_execution_job', 'retry_report_execution_job']) {
  const match = migration.match(new RegExp(`create or replace function public\\.${name}[\\s\\S]*?(?=create or replace function public\\.|revoke all on function)`));
  if (!match) throw new Error(`function body not found: ${name}`);
  if (!/lease_owner\s*=\s*null/.test(match[0]) || !/lease_expires_at\s*=\s*null/.test(match[0])) {
    throw new Error(`${name} must clear lease ownership and expiry`);
  }
}

console.log('PASS: completed, failed, and retried jobs clear lease ownership and expiry');
