import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');
const claim = fs.readFileSync('supabase/migrations/20260901030000_report_execution_worker_claim.sql', 'utf8');

if (!/lease_owner\s*=\s*p_worker_id/.test(migration)) throw new Error('worker lifecycle must enforce lease owner identity');
if (!/lease_expires_at\s+is not null/.test(migration)) throw new Error('worker lifecycle must require an active lease');
if (!/lease_expires_at\s*<\s*now\(\)/.test(claim) && !/lease_expires_at\s*<=\s*now\(\)/.test(claim)) throw new Error('worker claim must handle expired leases');
if (!/lease_owner/.test(claim) || !/lease_expires_at/.test(claim)) throw new Error('worker claim must establish lease ownership fields');

console.log('worker claim/lease contract: PASS');
