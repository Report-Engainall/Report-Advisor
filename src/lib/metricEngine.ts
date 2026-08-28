import { getSemanticMetric, type SemanticMetricRegistryEntry } from './semantic-metric-registry.ts';
import type { MetricStatus } from './semanticMetrics.ts';
import type { ReportFact } from './free-toolbox/report-facts';

export interface MetricEvaluation {
  key: string;
  metricId: string;
  metricVersion: number;
  definition: SemanticMetricRegistryEntry;
  value: number | null;
  status: MetricStatus;
  confidence: number;
  updatedAt?: string | null;
  sourceRows?: number;
  timeSemantic: SemanticMetricRegistryEntry['timeSemantic'];
  warnings: string[];
  fact: ReportFact;
}

export interface MetricInput {
  key: string;
  value: number | null | undefined;
  confidence?: number;
  status?: MetricStatus;
  updatedAt?: string | null;
  sourceRows?: number;
  warnings?: string[];
  timeSemantic?: SemanticMetricRegistryEntry['timeSemantic'];
}

export function evaluateMetric(input: MetricInput): MetricEvaluation {
  const definition = getSemanticMetric(input.key);
  if (!definition) throw new Error(`Unknown metric: ${input.key}`);

  const warnings = [...(input.warnings ?? [])];
  if (input.timeSemantic && input.timeSemantic !== definition.timeSemantic) {
    throw new Error(`Time semantic mismatch for ${definition.metricId}: expected ${definition.timeSemantic}, received ${input.timeSemantic}`);
  }

  const numeric = input.value != null && Number.isFinite(Number(input.value)) ? Number(input.value) : null;
  let status = input.status ?? definition.status;
  let confidence = Math.max(0, Math.min(1, input.confidence ?? (numeric == null ? 0 : 1)));

  if (numeric == null) {
    status = 'UNAVAILABLE';
    confidence = 0;
    warnings.push('القيمة غير متاحة أو غير رقمية.');
  } else if (input.sourceRows !== undefined && input.sourceRows <= 0) {
    status = 'INSUFFICIENT_DATA';
    confidence = 0;
    warnings.push('لا توجد صفوف مصدر كافية لإثبات المؤشر.');
  } else if (confidence < 0.7 && status !== 'FORECAST' && status !== 'ESTIMATED') {
    warnings.push('الثقة أقل من حد العرض الموثوق.');
  }

  const fact: ReportFact = {
    key: input.key,
    value: numeric,
    unit: definition.unit,
    confidence,
    source: status === 'FORECAST' ? 'forecast' : status === 'ESTIMATED' ? 'derived' : 'derived',
    evidence: definition.evidence,
  };

  return {
    key: input.key,
    metricId: definition.metricId,
    metricVersion: definition.version,
    definition,
    value: numeric,
    status,
    confidence,
    updatedAt: input.updatedAt,
    sourceRows: input.sourceRows,
    timeSemantic: definition.timeSemantic,
    warnings,
    fact,
  };
}

export function evaluateMetricBatch(inputs: MetricInput[]): MetricEvaluation[] {
  return inputs.map(evaluateMetric);
}

export function metricCanDriveDecision(metric: MetricEvaluation): boolean {
  return metric.value !== null && metric.confidence >= 0.7 && metric.status !== 'UNAVAILABLE' && metric.status !== 'INSUFFICIENT_DATA';
}

export function metricDisplayValue(metric: MetricEvaluation): string {
  if (metric.value === null) return 'غير متوفر';
  return new Intl.NumberFormat('ar', { maximumFractionDigits: 2 }).format(metric.value);
}
