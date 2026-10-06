import { matchCanonicalField, type CanonicalField } from './canonical-schema.ts';

export type KernelStage =
  | 'TRUTH' | 'QUALITY' | 'SEMANTICS' | 'CALCULATION' | 'STATISTICS'
  | 'ANOMALY' | 'CAUSAL' | 'FORECAST' | 'SCENARIO' | 'SENSITIVITY'
  | 'OPTIMIZE' | 'DECIDE' | 'ACT' | 'OUTCOME' | 'LEARN' | 'BENCHMARK'
  | 'RENDER' | 'PROVE';

export type KernelStatus = 'SUPPORTED' | 'REVIEW_REQUIRED' | 'INSUFFICIENT_SAMPLE' | 'BLOCKED';
export type KernelRow = { row_number?: number; data?: Record<string, unknown> | null };

export type KernelProvenance = {
  tenantId: string;
  reportExecutionJobId: string;
  sourceHash: string;
  evidenceSnapshotId?: string | null;
  evidencePassportId?: string | null;
};

export type KernelMetric = {
  key: string;
  value: number | null;
  unit: string | null;
  sampleSize: number;
  confidence: number;
  evidence: string[];
};

export type KernelAnomaly = {
  kind: 'SPIKE' | 'DROP' | 'PATTERN_BREAK' | 'ENTITY_OUTLIER' | 'NEGATIVE_STOCK' | 'ZERO_STOCK' | 'MIX_SHIFT';
  severity: 'low' | 'medium' | 'high';
  score: number;
  message: string;
  evidence: string[];
  limitation: string;
};

export type KernelScenario = {
  id: string;
  label: string;
  assumptions: Record<string, number>;
  baseline: Record<string, number>;
  result: Record<string, number | null>;
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  evidence: string[];
};

export type KernelSensitivity = {
  variable: string;
  direction: 'up' | 'down';
  magnitude: number;
  decisionImpact: string;
  evidence: string[];
};

export type KernelQuality = {
  dataEligible: boolean;
  analysisEligible: boolean;
  decisionEligible: boolean;
  checks: Record<string, boolean>;
  blockers: string[];
};

export type KernelTraceEntry = {
  stage: KernelStage;
  status: 'PASS' | 'REVIEW' | 'BLOCKED';
  startedAt: string;
  completedAt: string;
  evidence: string[];
  output?: string;
};

export type AghbariIntelligenceKernelResult = {
  version: '1.0.0';
  status: KernelStatus;
  provenance: KernelProvenance;
  quality: KernelQuality;
  statistics: KernelMetric[];
  anomalies: KernelAnomaly[];
  scenarios: KernelScenario[];
  sensitivity: KernelSensitivity[];
  unknowns: string[];
  blindSpot: string | null;
  trace: KernelTraceEntry[];
};

const now = () => new Date().toISOString();
const text = (value: unknown) => String(value ?? '').trim();
const normalize = (value: unknown) =>
  text(value).toLowerCase().normalize('NFKC').replace(/[إأآ]/g, 'ا').replace(/[\s_./-]+/g, '');
const number = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const raw = text(value).replace(/,/g, '');
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

function resolveKey(rows: KernelRow[], candidates: Array<string | CanonicalField>): string | null {
  const keys = new Set<string>();
  rows.forEach((row) => Object.keys(row.data ?? {}).forEach((key) => keys.add(key)));
  for (const candidate of candidates) {
    const direct = [...keys].find((key) => key === candidate);
    if (direct) return direct;
    const semantic = matchCanonicalField(candidate);
    const mapped = [...keys].find((key) => matchCanonicalField(key) === semantic && Boolean(semantic));
    if (mapped) return mapped;
    const token = normalize(candidate);
    const alias = [...keys].find((key) => normalize(key) === token);
    if (alias) return alias;
  }
  return null;
}

function numericValues(rows: KernelRow[], key: string): number[] {
  return rows.map((row) => number(row.data?.[key])).filter((value): value is number => value !== null);
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function standardDeviation(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1));
}

function correlation(a: number[], b: number[]): number | null {
  if (a.length < 3 || a.length !== b.length) return null;
  const meanA = a.reduce((s, v) => s + v, 0) / a.length;
  const meanB = b.reduce((s, v) => s + v, 0) / b.length;
  const numerator = a.reduce((s, v, i) => s + (v - meanA) * (b[i] - meanB), 0);
  const denominator = Math.sqrt(
    a.reduce((s, v) => s + (v - meanA) ** 2, 0) *
    b.reduce((s, v) => s + (v - meanB) ** 2, 0),
  );
  return denominator === 0 ? null : Number((numerator / denominator).toFixed(6));
}

function metric(key: string, values: number[], evidence: string[], unit = 'source value'): KernelMetric {
  if (!values.length) return { key, value: null, unit, sampleSize: 0, confidence: 0, evidence };
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const sd = standardDeviation(values);
  const standardError = sd == null ? null : sd / Math.sqrt(values.length);
  const confidence = Math.min(1, values.length >= 30 ? 1 : values.length / 30);
  return {
    key,
    value: Number(mean.toFixed(6)),
    unit,
    sampleSize: values.length,
    confidence: Number(confidence.toFixed(4)),
    evidence: [...evidence, 'mean=' + mean, 'median=' + (median(values) ?? 'null'), 'stdDev=' + (sd ?? 'null'), 'standardError=' + (standardError ?? 'null')],
  };
}

function iqrOutliers(values: number[]): { count: number; lower: number; upper: number } {
  if (values.length < 5) return { count: 0, lower: Number.NEGATIVE_INFINITY, upper: Number.POSITIVE_INFINITY };
  const q1 = percentile(values, 0.25) ?? 0;
  const q3 = percentile(values, 0.75) ?? 0;
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return { count: values.filter((value) => value < lower || value > upper).length, lower, upper };
}

function runScenario(
  totalStock: number,
  totalDemand: number,
  stockPct: number,
  demandPct: number,
  evidence: string[],
): KernelScenario {
  const baselineCoverage = totalDemand === 0 ? null : totalStock / Math.abs(totalDemand);
  const nextStock = totalStock * (1 + stockPct / 100);
  const nextDemand = totalDemand * (1 + demandPct / 100);
  const nextCoverage = nextDemand === 0 ? null : nextStock / Math.abs(nextDemand);
  const delta = baselineCoverage == null || nextCoverage == null ? null : nextCoverage - baselineCoverage;
  const risk = nextCoverage != null && nextCoverage < 1 ? 'high' : nextCoverage != null && nextCoverage < 2 ? 'medium' : 'low';
  return {
    id: 'inventory.coverage.what_if',
    label: 'حساسية تغطية المخزون للطلب والرصيد',
    assumptions: { stockPct, demandPct },
    baseline: { stock: totalStock, demand: totalDemand, coverage: baselineCoverage ?? 0 },
    result: { stock: nextStock, demand: nextDemand, coverage: nextCoverage, coverageDelta: delta },
    risk,
    confidence: baselineCoverage == null ? 0 : 0.95,
    evidence: [...evidence, 'scenario_is_non_mutating=true', 'deltaCoverage=' + (delta ?? 'null')],
  };
}

export function pointInTimeRows(rows: KernelRow[], asOf: string, availableAtCandidates: string[] = ['availableAt','createdAt','created_at','date','documentDate']): KernelRow[] {
  const cutoff = new Date(asOf).getTime();
  if (!Number.isFinite(cutoff)) throw new Error('INVALID_POINT_IN_TIME');
  const key = resolveKey(rows, availableAtCandidates);
  if (!key) return rows;
  return rows.filter((row) => {
    const value = row.data?.[key];
    const timestamp = new Date(text(value)).getTime();
    return !Number.isFinite(timestamp) || timestamp <= cutoff;
  });
}

export function runAghbariIntelligenceKernel(input: {
  rows: KernelRow[];
  specialty?: string | null;
  qualityScore?: number | null;
  canonicalRowsComplete?: boolean;
  evidenceReady?: boolean;
  provenance: KernelProvenance;
}): AghbariIntelligenceKernelResult {
  const started = now();
  const rows = input.rows;
  const blockers: string[] = [];
  const checks = {
    rowsReadable: rows.length > 0 && rows.every((row) => Boolean(row.data && typeof row.data === 'object')),
    evidenceBound: Boolean(input.provenance.sourceHash && input.provenance.reportExecutionJobId && (input.provenance.evidenceSnapshotId || input.provenance.evidencePassportId)),
    sourceCoverage: input.canonicalRowsComplete !== false,
    qualityThreshold: Number(input.qualityScore ?? 0) >= 85,
  };
  if (!checks.rowsReadable) blockers.push('NO_CANONICAL_ROWS');
  if (!checks.evidenceBound) blockers.push('EVIDENCE_BOUNDARY_MISSING');
  if (!checks.sourceCoverage) blockers.push('CANONICAL_SOURCE_PARTIAL');
  if (!checks.qualityThreshold) blockers.push('SOURCE_QUALITY_BELOW_85');

  const quality: KernelQuality = {
    dataEligible: checks.rowsReadable && checks.evidenceBound,
    analysisEligible: checks.rowsReadable && checks.sourceCoverage && checks.qualityThreshold,
    decisionEligible: checks.rowsReadable && checks.sourceCoverage && checks.qualityThreshold && checks.evidenceBound,
    checks,
    blockers,
  };

  const trace: KernelTraceEntry[] = [];
  const pushTrace = (stage: KernelStage, status: KernelTraceEntry['status'], evidence: string[], output?: string, stageStart = started) =>
    trace.push({ stage, status, startedAt: stageStart, completedAt: now(), evidence, output });

  pushTrace('TRUTH', quality.dataEligible ? 'PASS' : 'BLOCKED', [
    'sourceHash=' + input.provenance.sourceHash,
    'reportExecutionJobId=' + input.provenance.reportExecutionJobId,
    'rows=' + rows.length,
  ], quality.dataEligible ? 'SOURCE_BOUND_TRUTH' : 'TRUTH_BLOCKED');

  pushTrace('QUALITY', quality.analysisEligible ? 'PASS' : 'REVIEW', Object.entries(checks).map(([key, value]) => key + '=' + value), quality.analysisEligible ? 'ANALYSIS_ELIGIBLE' : blockers.join(','));

  if (!quality.analysisEligible) {
    pushTrace('PROVE', 'BLOCKED', blockers, 'NO_INTELLIGENCE_ISSUED');
    return {
      version: '1.0.0', status: 'BLOCKED', provenance: input.provenance, quality,
      statistics: [], anomalies: [], scenarios: [], sensitivity: [],
      unknowns: blockers, blindSpot: blockers[0] ?? 'UNKNOWN', trace,
    };
  }

  const specialty = normalize(input.specialty);
  const stockKey = resolveKey(rows, ['currentStock', 'quantity', 'balance', 'الرصيد']);
  const demandKey = resolveKey(rows, ['salesQty', 'quantitySold', 'صافي المبيعات', 'netSales']);
  const valueKey = resolveKey(rows, ['netAmount', 'total', 'amount', 'الإجمالي']);
  const entityKey = resolveKey(rows, ['productCode','customerCode','supplierCode','productName','customerName']);
  const dateKey = resolveKey(rows, ['documentDate','date','التاريخ']);

  const statistics: KernelMetric[] = [
    { key: 'row.count', value: rows.length, unit: 'rows', sampleSize: rows.length, confidence: 1, evidence: ['rows=' + rows.length] },
  ];
  if (stockKey) {
    const stock = numericValues(rows, stockKey);
    statistics.push(metric('stock.mean', stock, ['field=' + stockKey]));
    statistics.push({ key: 'stock.p90', value: percentile(stock, 0.9), unit: 'quantity', sampleSize: stock.length, confidence: stock.length >= 5 ? 1 : 0, evidence: ['field=' + stockKey] });
  }
  if (demandKey) {
    const demand = numericValues(rows, demandKey);
    statistics.push(metric('demand.mean', demand, ['field=' + demandKey]));
    statistics.push({ key: 'demand.p90', value: percentile(demand, 0.9), unit: 'quantity', sampleSize: demand.length, confidence: demand.length >= 5 ? 1 : 0, evidence: ['field=' + demandKey] });
  }
  if (stockKey && demandKey) {
    const paired = rows.map((row) => ({ a: number(row.data?.[stockKey]), b: number(row.data?.[demandKey]) })).filter((item): item is { a: number; b: number } => item.a !== null && item.b !== null);
    statistics.push({ key: 'stock.demand.correlation', value: correlation(paired.map((x) => x.a), paired.map((x) => x.b)), unit: 'correlation', sampleSize: paired.length, confidence: paired.length >= 30 ? 1 : paired.length / 30, evidence: ['stockField=' + stockKey, 'demandField=' + demandKey] });
  }

  const anomalies: KernelAnomaly[] = [];
  if (stockKey) {
    const values = numericValues(rows, stockKey);
    const negative = values.filter((value) => value < 0).length;
    const zero = values.filter((value) => value === 0).length;
    const outliers = iqrOutliers(values);
    if (negative > 0) anomalies.push({ kind: 'NEGATIVE_STOCK', severity: negative >= Math.max(3, rows.length * 0.05) ? 'high' : 'medium', score: Math.min(100, 60 + negative), message: 'يوجد رصيد مخزون سالب يحتاج مطابقة حركة المخزون قبل القرار.', evidence: ['field=' + stockKey, 'negativeRows=' + negative, 'rows=' + rows.length], limitation: 'الرقم لا يثبت وحده مصدر الرصيد السالب.' });
    if (zero > 0) anomalies.push({ kind: 'ZERO_STOCK', severity: zero >= rows.length * 0.3 ? 'high' : 'medium', score: Math.min(100, 40 + zero / Math.max(1, rows.length) * 60), message: 'يوجد رصيد صفري؛ لا يُعامل كنفاد تجاري دون دليل على الطلب.', evidence: ['field=' + stockKey, 'zeroRows=' + zero], limitation: 'الصفر قد يكون صحيحًا أو غير نشط.' });
    if (outliers.count > 0) anomalies.push({ kind: 'ENTITY_OUTLIER', severity: outliers.count >= rows.length * 0.1 ? 'medium' : 'low', score: Math.min(100, 50 + outliers.count), message: 'توجد قيم مخزون متطرفة إحصائيًا بالنسبة للعينة.', evidence: ['field=' + stockKey, 'outlierRows=' + outliers.count, 'lower=' + outliers.lower, 'upper=' + outliers.upper], limitation: 'الشذوذ الإحصائي ليس دليل خطأ تشغيلي.' });
  }
  if (valueKey && entityKey) {
    const grouped = new Map<string, number>();
    rows.forEach((row) => {
      const entity = text(row.data?.[entityKey]);
      const value = number(row.data?.[valueKey]);
      if (entity && value !== null) grouped.set(entity, (grouped.get(entity) ?? 0) + Math.abs(value));
    });
    const total = [...grouped.values()].reduce((s, v) => s + v, 0);
    const top = [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const share = total === 0 ? 0 : top.reduce((s, [, v]) => s + v, 0) / total;
    if (share >= 0.8) anomalies.push({ kind: 'MIX_SHIFT', severity: 'medium', score: Math.min(100, 60 + share * 40), message: 'القيمة مركزة بدرجة عالية في عدد محدود من الكيانات.', evidence: ['entityField=' + entityKey, 'valueField=' + valueKey, 'top5Share=' + share], limitation: 'التركيز لا يثبت اعتمادًا خطيرًا من دون سياق الأعمال.' });
  }

  const scenarios: KernelScenario[] = [];
  if (specialty === 'inventory' && stockKey && demandKey) {
    const totalStock = numericValues(rows, stockKey).reduce((s, v) => s + v, 0);
    const totalDemand = numericValues(rows, demandKey).reduce((s, v) => s + v, 0);
    scenarios.push(runScenario(totalStock, totalDemand, 0, 15, [
      'source=canonicalRows',
      'stockField=' + stockKey,
      'demandField=' + demandKey,
      'assumption=demand+15%',
    ]));
  }

  const sensitivity: KernelSensitivity[] = [];
  const scenario = scenarios[0];
  if (scenario) {
    const baseCoverage = Number(scenario.baseline.coverage);
    const demandCoverage = Number(scenario.result.coverage ?? baseCoverage);
    sensitivity.push({ variable: 'demandPct', direction: 'up', magnitude: Math.abs(demandCoverage - baseCoverage), decisionImpact: demandCoverage < 1 ? 'ينقل القرار نحو مراجعة التغطية والطلب.' : 'لا يغيّر عتبة التغطية الأساسية.', evidence: scenario.evidence });
    sensitivity.push({ variable: 'stockPct', direction: 'up', magnitude: Math.abs(baseCoverage * 0.1), decisionImpact: 'رفع الرصيد 10% يحسن التغطية خطيًا مع ثبات الطلب في هذا السيناريو.', evidence: scenario.evidence });
  }

  const unknowns: string[] = [];
  if (!valueKey) unknowns.push('القيمة المالية غير متاحة من المصدر؛ لا يجوز اشتقاق قيمة مخزون مالية.');
  if (!dateKey) unknowns.push('لا يوجد تاريخ صالح للسلسلة؛ التنبؤ الزمني غير مؤهل.');
  else if (rows.length < 4) unknowns.push('العينة أصغر من الحد الأدنى للتنبؤ.');
  if (!input.qualityScore || input.qualityScore < 95) unknowns.push('جودة المصدر أقل من 95؛ يجب تخفيض الثقة قبل قرار حساس.');
  if (!input.evidenceReady) unknowns.push('الدليل غير مربوط بصورة Evidence Snapshot/Passport مكتملة.');

  const blindSpot = unknowns[0] ?? null;
  pushTrace('SEMANTICS', 'PASS', ['specialty=' + specialty, 'stockField=' + (stockKey ?? 'missing'), 'demandField=' + (demandKey ?? 'missing')], 'SEMANTIC_FIELDS_RESOLVED');
  pushTrace('STATISTICS', statistics.every((item) => item.sampleSize > 0) ? 'PASS' : 'REVIEW', statistics.map((item) => item.key + '=' + (item.value ?? 'null')), 'STATISTICS_READY');
  pushTrace('ANOMALY', anomalies.length ? 'REVIEW' : 'PASS', anomalies.flatMap((item) => item.evidence), anomalies.length + ' anomalies');
  pushTrace('FORECAST', dateKey && rows.length >= 4 ? 'PASS' : 'REVIEW', [dateKey ? 'dateField=' + dateKey : 'dateField=missing', 'sample=' + rows.length], dateKey && rows.length >= 4 ? 'FORECAST_ELIGIBLE' : 'FORECAST_NOT_ISSUED');
  pushTrace('SCENARIO', scenarios.length ? 'PASS' : 'REVIEW', scenarios.flatMap((item) => item.evidence), scenarios.length ? 'SCENARIO_EXECUTED' : 'SCENARIO_NOT_APPLICABLE');
  pushTrace('SENSITIVITY', sensitivity.length ? 'PASS' : 'REVIEW', sensitivity.flatMap((item) => item.evidence), sensitivity.length ? 'SENSITIVITY_EXECUTED' : 'SENSITIVITY_NOT_APPLICABLE');
  pushTrace('DECIDE', quality.decisionEligible ? 'PASS' : 'REVIEW', [...quality.blockers, ...(blindSpot ? ['blindSpot=' + blindSpot] : [])], quality.decisionEligible ? 'DECISION_ELIGIBLE_WITH_LIMITATIONS' : 'DECISION_BLOCKED');
  pushTrace('PROVE', 'PASS', ['traceEntries=' + trace.length, 'sourceHash=' + input.provenance.sourceHash], 'KERNEL_PROVENANCE_BOUND');

  const status: KernelStatus =
    !quality.decisionEligible ? 'REVIEW_REQUIRED'
      : anomalies.some((item) => item.severity === 'high') ? 'REVIEW_REQUIRED'
      : scenarios.length || statistics.length ? 'SUPPORTED'
      : 'INSUFFICIENT_SAMPLE';

  return { version: '1.0.0', status, provenance: input.provenance, quality, statistics, anomalies, scenarios, sensitivity, unknowns, blindSpot, trace };
}
