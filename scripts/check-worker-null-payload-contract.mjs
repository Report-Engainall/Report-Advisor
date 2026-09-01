import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');

const checks = [
  ['checkpoint', /advance_report_execution_checkpoint[\s\S]*?checkpoint\s*=\s*coalesce\(p_checkpoint,\s*'\{\}'::jsonb\)/],
  ['completion evidence', /complete_report_execution_job[\s\S]*?evidence\s*=\s*coalesce\(p_evidence,\s*'\{\}'::jsonb\)/],
  ['failure error', /fail_report_execution_job[\s\S]*?last_error\s*=\s*coalesce\(p_error,\s*'\{\}'::jsonb\)/],
];

for (const [name, pattern] of checks) {
  if (!pattern.test(migration)) throw new Error(`missing deterministic null-payload fallback for ${name}`);
}

console.log(`PASS: ${checks.length}/${checks.length} worker JSON payload fallbacks are deterministic`);
