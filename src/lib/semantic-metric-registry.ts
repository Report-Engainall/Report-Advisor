import { BUSINESS_METRICS, type MetricDefinition } from './semanticMetrics.ts';

export type MetricCertificationStatus = 'DRAFT' | 'REVIEWED' | 'CERTIFIED' | 'DEPRECATED';
export type MetricTimeSemantic = 'transaction' | 'posting' | 'delivery' | 'snapshot' | 'generated';

export interface SemanticMetricRegistryEntry extends MetricDefinition {
  metricId: string;
  version: number;
  owner: string;
  certificationStatus: MetricCertificationStatus;
  timeSemantic: MetricTimeSemantic;
  periodDimension: string;
  tenantScope: 'company_id';
  asOfSemantics: string;
  freshness: string;
  consumers: string[];
  tests: string[];
  evidence: string[];
}

/** Canonical governance metadata layered over BUSINESS_METRICS without duplicating formulas. */
export const SEMANTIC_METRIC_REGISTRY: SemanticMetricRegistryEntry[] = BUSINESS_METRICS.map(metric => ({
  ...metric,
  metricId: `metric.${metric.key}`,
  version: 1,
  owner: metric.key.includes('inventory') || metric.key.includes('stock') || metric.key.includes('reorder') || metric.key.includes('demand') ? 'inventory' : metric.key.includes('cash') || metric.key.includes('receivable') || metric.key.includes('payable') || metric.key.includes('purchases') || metric.key.includes('sales_cost') ? 'finance' : metric.key.includes('forecast') ? 'forecast' : 'core-data',
  certificationStatus: metric.status === 'UNAVAILABLE' || metric.status === 'INSUFFICIENT_DATA' ? 'DRAFT' : 'REVIEWED',
  timeSemantic: metric.key.includes('inventory') || metric.key.includes('stock') || metric.key.includes('reorder') || metric.key.includes('demand') ? 'snapshot' : metric.key.includes('forecast') ? 'generated' : 'transaction',
  periodDimension: metric.dimensions?.includes('period') ? 'period' : metric.dimensions?.includes('data_as_of') ? 'data_as_of' : 'as_of',
  tenantScope: 'company_id',
  asOfSemantics: metric.key.includes('inventory') || metric.key.includes('stock') || metric.key.includes('reorder') || metric.key.includes('demand') ? 'explicit_snapshot_as_of' : 'transaction_period_as_of',
  freshness: metric.key.includes('inventory') || metric.key.includes('stock') || metric.key.includes('reorder') || metric.key.includes('demand') ? 'source-derived:60m' : metric.key.includes('forecast') ? 'source-derived:1440m' : 'source-derived:1440m',
  consumers: ['dashboard', 'reports', 'chatbi', 'forecast', 'recommendations', 'decision-engine'],
  tests: [`metric-contract:${metric.key}`],
  evidence: metric.source,
}));

export function getSemanticMetric(metricId: string): SemanticMetricRegistryEntry | undefined {
  return SEMANTIC_METRIC_REGISTRY.find(metric => metric.metricId === metricId || metric.key === metricId);
}

export function validateSemanticMetricRegistry(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const metric of SEMANTIC_METRIC_REGISTRY) {
    if (ids.has(metric.metricId)) errors.push(`Duplicate metricId: ${metric.metricId}`);
    ids.add(metric.metricId);
    if (!metric.key || !metric.formula.trim()) errors.push(`Missing identity/formula: ${metric.metricId}`);
    if (metric.source.length === 0 || metric.evidence.length === 0) errors.push(`Missing lineage/evidence: ${metric.metricId}`);
    if (metric.version < 1) errors.push(`Invalid version: ${metric.metricId}`);
    if (!metric.periodDimension || metric.tenantScope !== 'company_id' || !metric.asOfSemantics) errors.push(`Missing period/tenant/as-of contract: ${metric.metricId}`);
    if (!metric.freshness.startsWith('source-derived:')) errors.push(`Missing freshness contract: ${metric.metricId}`);
    if (metric.consumers.length === 0) errors.push(`Missing consumers: ${metric.metricId}`);
    if (metric.tests.length === 0) errors.push(`Missing tests: ${metric.metricId}`);
  }
  return errors;
}
