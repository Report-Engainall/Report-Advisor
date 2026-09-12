import { BUSINESS_METRICS } from '../src/lib/semanticMetrics.ts';
import {
  SEMANTIC_METRIC_REGISTRY,
  getSemanticMetric,
  validateSemanticMetricRegistry,
} from '../src/lib/semantic-metric-registry.ts';

const errors = [];
const requiredCanonicalMetrics = [
  'metric.net_sales',
  'metric.sales_cost',
  'metric.purchases',
  'metric.receivables',
  'metric.payables',
  'metric.cash',
  'metric.inventory_value',
  'metric.inventory_liquidity_velocity',
  'metric.demand',
  'metric.reorder',
  'metric.forecast',
];

const validationErrors = validateSemanticMetricRegistry();
if (validationErrors.length > 0) errors.push(`Runtime registry validation failed: ${validationErrors.join(' | ')}`);
if (SEMANTIC_METRIC_REGISTRY.length !== BUSINESS_METRICS.length) errors.push(`Registry cardinality drift: expected ${BUSINESS_METRICS.length}, got ${SEMANTIC_METRIC_REGISTRY.length}`);

const ids = new Set(SEMANTIC_METRIC_REGISTRY.map(metric => metric.metricId));
if (ids.size !== SEMANTIC_METRIC_REGISTRY.length) errors.push('Registry contains duplicate metric IDs.');

for (const metricId of requiredCanonicalMetrics) {
  const entry = getSemanticMetric(metricId);
  if (!entry) {
    errors.push(`Missing canonical financial metric: ${metricId}`);
    continue;
  }
  for (const field of ['source','formula','periodDimension','tenantScope','asOfSemantics','freshness','evidence']) {
    const value = entry[field];
    if (Array.isArray(value) ? value.length === 0 : !String(value ?? '').trim()) errors.push(`Missing ${field} lineage for metric: ${metricId}`);
  }
  if (entry.tenantScope !== 'company_id') errors.push(`Tenant scope drift for metric: ${metricId}`);
}

for (const metric of BUSINESS_METRICS) {
  const entry = getSemanticMetric(`metric.${metric.key}`);
  if (!entry) {
    errors.push(`Missing registry entry for SSOT metric: ${metric.key}`);
    continue;
  }
  if (entry.formula !== metric.formula) errors.push(`Formula drift for metric: ${metric.key}`);
  if (entry.source.length === 0 || entry.evidence.length === 0) errors.push(`Lineage/evidence missing for metric: ${metric.key}`);
}

if (errors.length > 0) {
  console.error('Semantic metric registry contract: FAIL');
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Semantic metric registry contract: PASS (${SEMANTIC_METRIC_REGISTRY.length} metrics; canonical financial lineage covered)`);
