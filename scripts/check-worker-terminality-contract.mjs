import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');

const complete = migration.match(/create or replace function public\.complete_report_execution_job[\s\S]*?\$\$;/)?.[0] ?? '';
const fail = migration.match(/create or replace function public\.fail_report_execution_job[\s\S]*?\$\$;/)?.[0] ?? '';
if (!/status\s*=\s*'completed'/.test(complete)) throw new Error('completion transition is missing');
if (!/status\s*=\s*'failed'/.test(fail)) throw new Error('failure transition is missing');
if (/status\s+in\s*\(\s*'completed'/.test(complete) || /status\s+in\s*\(\s*'completed'/.test(fail)) throw new Error('terminal completed state must not be mutable by lifecycle RPCs');
if (!/status\s*=\s*'failed'/.test(migration)) throw new Error('failed terminal state must remain explicit');

console.log('worker terminality contract: PASS');
