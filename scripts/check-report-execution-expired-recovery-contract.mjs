import assert from 'node:assert/strict';
import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260918171000_recover_expired_report_execution_retry_path.sql';
const sql = fs.readFileSync(migrationPath, 'utf8');

for (const token of [
  "status in ('leased', 'processing')",
  "lease_expires_at is not null",
  "lease_expires_at <= now()",
  'for update skip locked',
  "when job.attempt >= job.max_attempts then 'dead_letter'",
  "else 'queued'",
  "'worker_lease_expired_retry'",
  "'worker_attempts_exhausted_after_lease_expiry'",
  'lease_owner = null',
  'lease_token = null',
  'lease_expires_at = null',
  'grant execute on function public.recover_expired_report_execution_jobs(uuid, integer)',
]) {
  assert.ok(sql.toLowerCase().includes(token.toLowerCase()), 'missing recovery invariant: ' + token);
}

assert.ok(!/to authenticated/i.test(sql), 'recovery RPC must not be callable by authenticated users');
assert.ok(/set search_path to 'public', 'pg_catalog'/i.test(sql), 'recovery RPC search_path must be pinned');

console.log('Report execution expired-lease recovery contract: PASS');
