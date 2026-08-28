import assert from 'node:assert/strict';
import { BUSINESS_METRICS } from '../src/lib/semanticMetrics.ts';
import { SEMANTIC_METRIC_REGISTRY, getSemanticMetric, validateSemanticMetricRegistry } from '../src/lib/semantic-metric-registry.ts';
import { evaluateMetric } from '../src/lib/metricEngine.ts';

const errors = validateSemanticMetricRegistry();
assert.deepEqual(errors, [], `registry integrity errors: ${errors.join('; ')}`);
assert.equal(SEMANTIC_METRIC_REGISTRY.length, BUSINESS_METRICS.length, 'registry must cover every canonical metric');

for (const metric of BUSINESS_METRICS) {
  const governed = getSemanticMetric(metric.key);
  assert.ok(governed, `missing governed metric: ${metric.key}`);
  assert.equal(governed?.formula, metric.formula, `formula drift for ${metric.key}`);
  assert.equal(governed?.source.join('|'), metric.source.join('|'), `source drift for ${metric.key}`);
}

const first = evaluateMetric({ key: 'net_sales', value: 125000, confidence: 1, sourceRows: 20, timeSemantic: 'transaction' });
const second = evaluateMetric({ key: 'net_sales', value: 125000, confidence: 1, sourceRows: 20, timeSemantic: 'transaction' });
assert.equal(first.value, second.value, 'same input + metric version must be deterministic');
assert.equal(first.metricId, 'metric.net_sales');
assert.equal(first.metricVersion, 1);
assert.throws(() => evaluateMetric({ key: 'inventory_value', value: 100, timeSemantic: 'transaction' }), /Time semantic mismatch/);

const requiredConsumers = ['dashboard', 'reports', 'chatbi', 'forecast', 'recommendations', 'decision-engine'];
for (const metric of SEMANTIC_METRIC_REGISTRY) {
  for (const consumer of requiredConsumers) assert.ok(metric.consumers.includes(consumer), `${metric.metricId} missing consumer ${consumer}`);
  assert.ok(metric.evidence.length > 0, `${metric.metricId} missing evidence references`);
  assert.ok(metric.tests.length > 0, `${metric.metricId} missing test contract`);
}

console.log(`W2.1 semantic metric E2E contract PASS: ${BUSINESS_METRICS.length} canonical metrics, deterministic evaluation, time-semantic guard, consumer/evidence coverage`);
