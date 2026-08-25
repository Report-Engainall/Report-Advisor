import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260825010000_metric_single_source_of_truth.sql', 'utf8');

const metricIds = [
  'net_sales',
  'cost',
  'gross_profit',
  'gross_margin_pct',
  'inventory_value',
  'receivables',
  'payables',
  'cash_position',
];

for (const id of metricIds) {
  if (!migration.includes(`'${id}'`)) throw new Error(`Missing canonical metric definition: ${id}`);
}

const requiredTokens = [
  'metric_definitions',
  'formula',
  'source_tables',
  'allowed_dimensions',
  'time_semantics',
  'freshness_requirement_minutes',
  'owner',
  'version',
  'dependencies',
  'get_canonical_metric_snapshot',
  'public.current_company_id()',
  "'status'",
  "'UNKNOWN'",
];
for (const token of requiredTokens) {
  if (!migration.includes(token)) throw new Error(`Metric SSOT contract missing: ${token}`);
}

if (!migration.includes('s.company_id = c.company_id AND s.company_id = p_company_id')) {
  throw new Error('Sales metric is not visibly bound to both current tenant and requested tenant.');
}
if (!migration.includes('p.company_id = c.company_id AND p.company_id = p_company_id')) {
  throw new Error('Payables metric is not visibly tenant-bound.');
}
if (!migration.includes('ib.company_id = c.company_id AND ib.company_id = p_company_id')) {
  throw new Error('Inventory metric is not visibly tenant-bound.');
}
if (!migration.includes('p.company_id = c.company_id AND p.company_id = p_company_id')) {
  throw new Error('Payments metric is not visibly tenant-bound.');
}

if (/GRANT EXECUTE ON FUNCTION get_canonical_metric_snapshot\([^\n]*\) TO anon/i.test(migration)) {
  throw new Error('Canonical metric RPC must never be executable by anon.');
}

if (!migration.includes('REVOKE EXECUTE ON FUNCTION get_canonical_metric_snapshot(uuid,date,date) FROM anon')) {
  throw new Error('Canonical metric RPC must explicitly revoke anon execution.');
}
if (!migration.includes('GRANT EXECUTE ON FUNCTION get_canonical_metric_snapshot(uuid,date,date) TO authenticated')) {
  throw new Error('Canonical metric RPC must explicitly grant authenticated execution.');
}

const fabricatedZeroPattern = /'status',CASE WHEN[^\n]*ELSE 'CONFIRMED' END/;
if (fabricatedZeroPattern.test(migration)) {
  throw new Error('Metric status logic appears to collapse missing evidence into confirmed values.');
}

console.log('Metric SSOT contract: PASS');
console.log(`  - canonical metrics checked: ${metricIds.length}`);
console.log('  - metric definition metadata present');
console.log('  - tenant binding markers present');
console.log('  - UNKNOWN state present');
console.log('  - anon RPC execution blocked');
