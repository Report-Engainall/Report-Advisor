import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260830240000_fix_empty_quality_truth.sql', 'utf8');
const adapter = fs.readFileSync('src/lib/data-quality-snapshot-runtime.ts', 'utf8');
const page = fs.readFileSync('src/pages/DataQualitySnapshotPage.tsx', 'utf8');

for (const pattern of [
  /status:\s*'OK'\s*\|\s*'EMPTY'/,
  /typeof data\.tenant_id !== 'string'/,
  /Number\.isFinite\(entity\.total\)/,
  /entity\.issues > entity\.total/,
  /entity\.score > 100/,
  /Number\.isFinite\(issue\.count\)/,
  /issue\.count < 0/,
  /DATA_QUALITY_EMPTY_SNAPSHOT_INCONSISTENT/,
]) {
  if (!pattern.test(adapter)) throw new Error(`Missing runtime truth invariant: ${pattern}`);
}

for (const pattern of [
  /customer_total\+product_total\+invoice_total\+balance_total=0 then 'EMPTY'/,
  /'entities',case when customer_total\+product_total\+invoice_total\+balance_total=0 then '\[\]'::jsonb/,
  /'issues',case when customer_total\+product_total\+invoice_total\+balance_total=0 then '\[\]'::jsonb/,
]) {
  if (!pattern.test(migration)) throw new Error(`Missing canonical EMPTY shape invariant: ${pattern}`);
}

for (const pattern of [
  /snapshot\.status === 'EMPTY' \? 0/,
  /Math\.max\(0, Math\.min\(100/,
]) {
  if (!pattern.test(page)) throw new Error(`Missing UI truth invariant: ${pattern}`);
}

console.log('Data Quality empty-runtime contract: PASS');
