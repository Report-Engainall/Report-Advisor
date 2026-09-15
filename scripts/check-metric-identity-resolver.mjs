import { BUSINESS_METRICS } from '../src/lib/semanticMetrics.ts';
import {
  SEMANTIC_METRIC_ALIASES,
  SEMANTIC_METRIC_REGISTRY,
  getPersistedSemanticMetricId,
  getSemanticMetric,
  resolveSemanticMetricId,
  validateSemanticMetricRegistry,
} from '../src/lib/semantic-metric-registry.ts';
import { evaluateMetric } from '../src/lib/metricEngine.ts';

const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

const validationErrors = validateSemanticMetricRegistry();
assert(validationErrors.length === 0, `registry validation failed: ${validationErrors.join(' | ')}`);

const canonicalIds = new Set(SEMANTIC_METRIC_REGISTRY.map(metric => metric.metricId));
assert(canonicalIds.size === SEMANTIC_METRIC_REGISTRY.length, 'duplicate canonical metric definitions detected');
assert(SEMANTIC_METRIC_REGISTRY.length === BUSINESS_METRICS.length, 'registry cardinality drift detected');

for (const metric of BUSINESS_METRICS) {
  const canonicalId = `metric.${metric.key}`;
  assert(resolveSemanticMetricId(canonicalId) === canonicalId, `canonical ID did not resolve to itself: ${canonicalId}`);
  assert(resolveSemanticMetricId(metric.key) === canonicalId, `canonical key did not resolve: ${metric.key}`);
  assert(getSemanticMetric(canonicalId)?.metricId === canonicalId, `canonical lookup missing: ${canonicalId}`);
}

assert(resolveSemanticMetricId('metric.cash') === 'metric.cash_position', 'legacy metric.cash did not resolve to metric.cash_position');
assert(getPersistedSemanticMetricId('metric.cash') === 'metric.cash_position', 'persisted legacy metric.cash was not rebound to canonical metric.cash_position');
assert(getSemanticMetric('metric.cash')?.metricId === 'metric.cash_position', 'legacy metric.cash returned a non-canonical registry entry');
assert(evaluateMetric({ key: 'metric.cash', value: 100, sourceRows: 1 }).key === 'cash_position', 'metric evaluation did not canonicalize metric.cash');

for (const [legacyId, canonicalId] of Object.entries(SEMANTIC_METRIC_ALIASES)) {
  assert(canonicalIds.has(canonicalId), `legacy alias points to missing canonical ID: ${legacyId} -> ${canonicalId}`);
  assert(resolveSemanticMetricId(legacyId) === canonicalId, `legacy alias did not resolve canonically: ${legacyId}`);
}

for (const unknownId of ['metric.unknown', 'metric.generated', 'unknown', '']) {
  let failedClosed = false;
  try {
    resolveSemanticMetricId(unknownId);
  } catch {
    failedClosed = true;
  }
  assert(failedClosed, `unknown metric was accepted: ${JSON.stringify(unknownId)}`);
  assert(getSemanticMetric(unknownId) === undefined, `unknown metric returned a registry definition: ${JSON.stringify(unknownId)}`);
}

if (errors.length > 0) {
  console.error('Metric identity resolver contract: FAIL');
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Metric identity resolver contract: PASS (${SEMANTIC_METRIC_REGISTRY.length} canonical metrics; legacy aliases fail-closed)`);
