import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');

if (!/status\s*=\s*'failed'/.test(migration)) throw new Error('retry must require failed status');
if (!/attempt\s*<\s*max_attempts/.test(migration)) throw new Error('retry must enforce max attempts');
if (!/status\s*=\s*'queued'/.test(migration)) throw new Error('eligible retry must return job to queued state');
if (!/lease_owner\s*=\s*null/.test(migration) || !/lease_expires_at\s*=\s*null/.test(migration)) throw new Error('retry must clear stale lease ownership');

console.log('worker retry eligibility contract: PASS');
