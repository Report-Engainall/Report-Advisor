import { SEMANTIC_METRIC_REGISTRY, requireSemanticMetric } from './semantic-metric-registry.ts';
import type { MetricDefinition } from './semanticMetrics.ts';

export interface MetricContract extends MetricDefinition {
  version: number;
  owner: 'core-data' | 'finance' | 'inventory' | 'sales' | 'forecast' | 'decision';
  decisionSafe: boolean;
  requiredEvidence: string[];
}

export const METRIC_CONTRACTS: MetricContract[] = SEMANTIC_METRIC_REGISTRY.map(metric => ({
  ...metric,
  version: metric.version,
  owner: metric.owner as MetricContract['owner'],
  decisionSafe: metric.status !== 'UNAVAILABLE' && metric.status !== 'INSUFFICIENT_DATA',
  requiredEvidence: metric.evidence,
}));

export function getMetricContract(key: string): MetricContract | undefined {
  try {
    const canonical = requireSemanticMetric(key).metricId;
    return METRIC_CONTRACTS.find(metric => metric.metricId === canonical);
  } catch {
    return undefined;
  }
}

export function metricDependencyClosure(key: string): string[] {
  const root = getMetricContract(key);
  if (!root) return [];
  const seen = new Set<string>();
  const walk = (name: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    for (const dependency of getMetricContract(name)?.dependencies ?? []) {
      const depMetric = getMetricContract(dependency);
      if (depMetric) walk(depMetric.metricId);
    }
  };
  walk(root.metricId);
  return [...seen];
}

export function validateMetricContract(key: string): { valid: boolean; errors: string[] } {
  const metric = getMetricContract(key);
  if (!metric) return { valid: false, errors: [`Unknown metric: ${key}`] };
  const errors: string[] = [];
  if (!metric.formula.trim()) errors.push('Metric formula is empty.');
  if (metric.source.length === 0) errors.push('Metric has no source lineage.');
  if (metric.version < 1) errors.push('Metric version must be >= 1.');
  if (metric.decisionSafe && (metric.status === 'UNAVAILABLE' || metric.status === 'INSUFFICIENT_DATA')) errors.push('Decision-safe metric has an unsafe status.');
  return { valid: errors.length === 0, errors };
}