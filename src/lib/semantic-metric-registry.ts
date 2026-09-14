import { BUSINESS_METRICS, type MetricDefinition } from './semanticMetrics.ts';

export type MetricCertificationStatus = 'DRAFT' | 'REVIEWED' | 'CERTIFIED' | 'DEPRECATED';
export type MetricTimeSemantic = 'transaction' | 'posting' | 'delivery' | 'snapshot' | 'generated';

export interface SemanticMetricRegistryEntry extends MetricDefinition {
  metricId: string;
  version: number;
  owner: string;
  certificationStatus: MetricCertificationStatus;
  timeSemantic: MetricTimeSemantic;
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
  owner: metric.key.includes('inventory') || metric.key.includes('stock') ? 'inventory' : metric.key.includes('cash') || metric.key.includes('receivable') || metric.key.includes('payable') ? 'finance' : metric.key.includes('forecast') ? 'forecast' : 'core-data',
  certificationStatus: metric.status === 'UNAVAILABLE' || metric.status === 'INSUFFICIENT_DATA' ? 'DRAFT' : 'REVIEWED',
  timeSemantic: metric.key.includes('inventory') || metric.key.includes('stock') ? 'snapshot' : 'transaction',
  freshness: 'source-derived',
  consumers: ['dashboard', 'reports', 'chatbi', 'forecast', 'recommendations', 'decision-engine'],
  tests: [`metric-contract:${metric.key}`],
  evidence: metric.source,
}));

/** Explicit persisted legacy aliases. Unknown identifiers are never inferred or generated. */
export const SEMANTIC_METRIC_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  'metric.cash': 'metric.cash_position',
  cash: 'metric.cash_position',
});

export function resolveSemanticMetricId(metricId: string): string {
  if (typeof metricId !== 'string' || metricId.trim() === '') {
    throw new Error('Unknown metric: empty metric ID');
  }

  const requested = metricId.trim();
  const canonicalMetricId = SEMANTIC_METRIC_ALIASES[requested] ?? requested;
  const canonical = SEMANTIC_METRIC_REGISTRY.find(metric => metric.metricId === canonicalMetricId);
  if (!canonical) throw new Error(`Unknown metric: ${requested}`);
  return canonical.metricId;
}

export function getSemanticMetric(metricId: string): SemanticMetricRegistryEntry | undefined {
  try {
    return SEMANTIC_METRIC_REGISTRY.find(metric => metric.metricId === resolveSemanticMetricId(metricId));
  } catch {
    return undefined;
  }
}

export function requireSemanticMetric(metricId: string): SemanticMetricRegistryEntry {
  const canonicalMetricId = resolveSemanticMetricId(metricId);
  const metric = SEMANTIC_METRIC_REGISTRY.find(entry => entry.metricId === canonicalMetricId);
  if (!metric) throw new Error(`Unknown metric: ${metricId}`);
  return metric;
}

/** Returns the canonical persisted identifier; never returns an unresolved legacy identifier. */
export function getPersistedSemanticMetricId(metricId: string): string {
  return resolveSemanticMetricId(metricId);
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
    if (metric.consumers.length === 0) errors.push(`Missing consumers: ${metric.metricId}`);
    if (metric.tests.length === 0) errors.push(`Missing tests: ${metric.metricId}`);
  }

  for (const [legacyId, canonicalId] of Object.entries(SEMANTIC_METRIC_ALIASES)) {
    if (legacyId === canonicalId) errors.push(`Legacy alias points to itself: ${legacyId}`);
    if (!ids.has(canonicalId)) errors.push(`Legacy alias points to unknown canonical metric: ${legacyId} -> ${canonicalId}`);
  }

  return errors;
}
