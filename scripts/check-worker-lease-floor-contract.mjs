import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');

const heartbeat = migration.match(/create or replace function public\.heartbeat_report_execution_job[\s\S]*?grant execute/);
if (!heartbeat) throw new Error('heartbeat function boundary not found');
if (!/greatest\(p_lease_seconds,\s*30\)/.test(heartbeat[0])) {
  throw new Error('heartbeat must enforce a minimum 30-second lease extension');
}

console.log('PASS: heartbeat enforces the 30-second lease floor');
