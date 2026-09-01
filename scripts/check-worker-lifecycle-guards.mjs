import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');

const checks = [
  ['heartbeat is tenant-scoped', /heartbeat_report_execution_job[\s\S]*?company_id\s*=\s*public\.current_company_id\(\)/],
  ['checkpoint requires the active lease owner', /advance_report_execution_checkpoint[\s\S]*?lease_owner\s*=\s*p_worker_id/],
  ['completion clears the lease', /complete_report_execution_job[\s\S]*?lease_owner\s*=\s*null[\s\S]*?lease_expires_at\s*=\s*null/],
  ['failure records an error and clears the lease', /fail_report_execution_job[\s\S]*?last_error\s*=\s*coalesce\(p_error[\s\S]*?lease_owner\s*=\s*null/],
  ['retry is tenant-scoped and attempt-bounded', /retry_report_execution_job[\s\S]*?company_id\s*=\s*public\.current_company_id\(\)[\s\S]*?attempt\s*<\s*max_attempts/],
];

const failures = checks.filter(([, pattern]) => !pattern.test(migration));
if (failures.length) {
  console.error('Worker lifecycle guard failures:');
  for (const [name] of failures) console.error(`- ${name}`);
  process.exit(1);
}

for (const [name] of checks) console.log(`PASS: ${name}`);
console.log(`Worker lifecycle guards: ${checks.length}/${checks.length} PASS`);
