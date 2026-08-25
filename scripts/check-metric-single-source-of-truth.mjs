import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20260825010000_metric_single_source_of_truth.sql'), 'utf8');
const semantic = fs.readFileSync(path.join(root, 'src/lib/semanticMetrics.ts'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'src/lib/metricEngine.ts'), 'utf8');

for (const token of [
  'CREATE TABLE IF NOT EXISTS metric_definitions',
  'metric_id text PRIMARY KEY',
  'formula text NOT NULL',
  'source_tables text[] NOT NULL',
  'allowed_dimensions text[] NOT NULL',
  'time_semantics text NOT NULL',
  'freshness_requirement_minutes',
  'version integer NOT NULL',
  'get_canonical_metric_snapshot',
  "'status',CASE WHEN rows_count > 0 THEN 'CONFIRMED' ELSE 'UNKNOWN' END",
  "'value',CASE WHEN rows_count > 0 THEN ar_value ELSE NULL END",
  'GRANT EXECUTE ON FUNCTION get_canonical_metric_snapshot',
]) assert.ok(migration.includes(token), `metric migration missing: ${token}`);

for (const key of ['net_sales', 'gross_profit', 'receivables', 'payables', 'inventory_value', 'cash_position']) {
  assert.ok(semantic.includes(`key:'${key}'`), `semantic metric missing: ${key}`);
}

assert.ok(engine.includes('metricCanDriveDecision'), 'decision gate must use metric quality');
assert.ok(engine.includes('value !== null'), 'metrics with no value must not drive decisions');

console.log(JSON.stringify({
  contract: 'metric-single-source-of-truth',
  canonicalSqlFunction: 'get_canonical_metric_snapshot',
  registry: 'metric_definitions',
  unknownSemantics: 'NULL + UNKNOWN, never fabricated zero',
  status: 'PASS',
}));
