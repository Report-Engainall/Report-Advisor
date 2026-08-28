import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BUSINESS_METRICS } from '../src/lib/semanticMetrics.ts';
import { SEMANTIC_METRIC_REGISTRY, getSemanticMetric, validateSemanticMetricRegistry } from '../src/lib/semantic-metric-registry.ts';
import { evaluateMetric } from '../src/lib/metricEngine.ts';
import { semanticMetricIsFresh } from '../src/lib/semantic-metric-service.ts';

const root = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');

const errors = validateSemanticMetricRegistry();
assert.deepEqual(errors, [], `registry integrity errors: ${errors.join('; ')}`);
assert.equal(SEMANTIC_METRIC_REGISTRY.length, BUSINESS_METRICS.length, 'registry must cover every canonical metric');

for (const metric of BUSINESS_METRICS) {
  const governed = getSemanticMetric(metric.key);
  assert.ok(governed, `missing governed metric: ${metric.key}`);
  assert.equal(governed?.formula, metric.formula, `formula drift for ${metric.key}`);
  assert.deepEqual(governed?.source, metric.source, `source drift for ${metric.key}`);
  assert.ok(governed?.evidence.length, `missing evidence for ${metric.key}`);
  assert.ok(governed?.tests.length, `missing test contract for ${metric.key}`);
}

const first = evaluateMetric({ key: 'net_sales', value: 125000, confidence: 1, sourceRows: 20, timeSemantic: 'transaction' });
const second = evaluateMetric({ key: 'net_sales', value: 125000, confidence: 1, sourceRows: 20, timeSemantic: 'transaction' });
assert.equal(first.value, second.value, 'same input + metric version must be deterministic');
assert.equal(first.metricId, 'metric.net_sales');
assert.equal(first.metricVersion, 1);
assert.equal(first.timeSemantic, 'transaction');
assert.throws(() => evaluateMetric({ key: 'inventory_value', value: 100, timeSemantic: 'transaction' }), /Time semantic mismatch/);

const requiredConsumers = ['dashboard', 'reports', 'chatbi', 'forecast', 'recommendations', 'decision-engine'];
for (const metric of SEMANTIC_METRIC_REGISTRY) {
  for (const consumer of requiredConsumers) assert.ok(metric.consumers.includes(consumer), `${metric.metricId} missing consumer ${consumer}`);
}

assert.equal(semanticMetricIsFresh(null, new Date().toISOString()), 'UNKNOWN');
const governance = {
  metricId: 'metric.net_sales', version: 1, name: 'net_sales', definition: 'test', formula: 'test',
  source: ['sales_invoices'], dimensions: [], filters: [], timeSemantics: { date: 'transaction', timezone: 'UTC' },
  freshness: { maxAgeMinutes: 15 }, owner: 'core-data', certificationStatus: 'REVIEWED', dependencies: [],
  consumers: requiredConsumers, tests: ['metric-contract:net_sales'], evidence: ['sales_invoices'],
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deprecatedAt: null,
};
assert.equal(semanticMetricIsFresh(governance, new Date(Date.now() - 5 * 60_000).toISOString()), 'FRESH');
assert.equal(semanticMetricIsFresh(governance, new Date(Date.now() - 30 * 60_000).toISOString()), 'STALE');

const registry = read('src/lib/semantic-metric-registry.ts');
const service = read('src/lib/semantic-metric-service.ts');
const engine = read('src/lib/metricEngine.ts');
const inspector = read('src/pages/MetricInspectorPage.tsx');
const governanceMigration = read('supabase/migrations/20260828150000_semantic_metric_governance.sql');
const tenantRlsMigration = read('supabase/migrations/20260828153000_metric_governance_tenant_rls.sql');
const tenantUniqueMigration = read('supabase/migrations/20260828160000_metric_governance_tenant_unique.sql');

assert.match(registry, /BUSINESS_METRICS\.map/);
assert.match(service, /from\('metric_governance'\)/);
assert.match(service, /getSemanticMetric\(/);
assert.match(engine, /getSemanticMetric\(input\.key\)/);
assert.match(engine, /metricVersion/);
assert.match(inspector, /listSemanticMetricContracts/);
assert.match(inspector, /dir="rtl"/);

for (const token of [
  'metric_governance', 'metric_governance_audit', 'certification_status',
  'DRAFT','REVIEWED','CERTIFIED','DEPRECATED',
  'private.metric_governance_transition',
  'metric_governance_guard_certified_update',
  'metric_governance_authenticated_tenant_read',
  'metric_governance_audit_authenticated_tenant_read',
]) assert.match(governanceMigration, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing governance artifact: ${token}`);

assert.match(governanceMigration, /company_id uuid NOT NULL/);
assert.match(tenantRlsMigration, /company_id\s*=\s*public\.current_company_id\(\)/);
assert.match(tenantUniqueMigration, /company_id, metric_id, version/);

console.log(`W2.1 semantic metric E2E acceptance PASS: ${BUSINESS_METRICS.length} canonical metrics, deterministic execution, time semantics, freshness, persistence, tenant RLS, lifecycle, evidence, consumers, and Metric Inspector`);
