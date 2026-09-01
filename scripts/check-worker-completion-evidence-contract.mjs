import fs from 'node:fs';

const source = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');
const complete = source.match(/create or replace function public\.complete_report_execution_job[\s\S]*?\$\$;/)?.[0] ?? '';
if (!/status\s*=\s*'completed'/.test(complete)) throw new Error('completion must persist completed status');
if (!/evidence\s*=\s*coalesce\(p_evidence, '\{\}'::jsonb\)/.test(complete)) throw new Error('completion must persist deterministic evidence payload');
if (!/completed_at\s*=\s*now\(\)/.test(complete)) throw new Error('completion must persist completion timestamp');
if (!/lease_owner\s*=\s*null/.test(complete) || !/lease_expires_at\s*=\s*null/.test(complete)) throw new Error('completion must release lease fields');
console.log('worker completion evidence contract: PASS');
