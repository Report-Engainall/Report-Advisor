import { tableFromJSON, type Table } from 'apache-arrow';
import { mean, median, linearRegression } from 'simple-statistics';

export type KernelRow = Record<string, unknown>;

export type EvidenceRef = {
  rowNumber?: number | null;
  field?: string | null;
  value?: unknown;
  sourceHash?: string | null;
  reportJobId?: string | null;
};

export type MetricDefinition = {
  id: string;
  label: string;
  unit: string;
  formula: string;
  requiredFields: string[];
  calculate: (rows: KernelRow[]) => number | null;
};

export type MetricResult = MetricDefinition & {
  value: number | null;
  state: 'CALCULATED' | 'INSUFFICIENT_DATA';
  evidence: EvidenceRef[];
};

export type DataContract = {
  id: string;
  requiredFields: string[];
  minimumRows: number;
  uniqueKey?: string[];
  numericFields?: string[];
};

export type DataQualityAssessment = {
  state: 'TRUSTED' | 'REVIEW' | 'BLOCKED';
  score: number;
  rows: number;
  missingRequiredFields: string[];
  duplicateKeyCount: number;
  numericCoverage: Record<string, number>;
  reasons: string[];
};

export type UnknownGap = {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  requiredFor: string;
  missingFields: string[];
  action: string;
  state: 'GAP_DETECTED' | 'INSUFFICIENT_SAMPLE' | 'PENDING_EVIDENCE';
};

export type ReconciliationFinding = {
  key: string;
  leftValue: number | string | null;
  rightValue: number | string | null;
  delta: number | null;
  relativeDelta: number | null;
  state: 'MATCH' | 'MISMATCH' | 'MISSING_LEFT' | 'MISSING_RIGHT';
  evidence: EvidenceRef[];
};

export type ScenarioInput = {
  demandMultiplier?: number;
  stockDelta?: number;
  costMultiplier?: number;
  sellingPriceMultiplier?: number;
};

export type ScenarioResult = {
  state: 'READY' | 'INSUFFICIENT_DATA';
  baseline: {
    stock: number | null;
    demand: number | null;
    coverage: number | null;
    margin: number | null;
  };
  scenario: {
    stock: number | null;
    demand: number | null;
    coverage: number | null;
    margin: number | null;
  };
  delta: {
    coverage: number | null;
    margin: number | null;
  };
  changedDrivers: string[];
  proofBoundary: string;
};

export type OntologyNode = {
  id: string;
  kind: 'entity' | 'metric' | 'action' | 'evidence';
  label: string;
  relation?: string;
  confidence: number;
};

export type ProvenanceGraph = {
  nodes: OntologyNode[];
  edges: Array<{ from: string; to: string; label: string }>;
};

export type LearningSignal = {
  id: string;
  feedback: 'ACCEPT' | 'REJECT' | 'EDIT';
  scope: string;
  lesson: string;
  persistedLocally: boolean;
};

const n = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = String(value ?? '').replace(/[٬،,]/g, '').trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalized = (value: string) => value.toLowerCase().normalize('NFKC').replace(/[\s_\-./]+/g, '');

export const CALCULATION_REGISTRY: MetricDefinition[] = [
  {
    id: 'inventory.coverage',
    label: 'تغطية المخزون',
    unit: 'x',
    formula: 'currentStock ÷ salesQty',
    requiredFields: ['currentStock', 'salesQty'],
    calculate: rows => {
      const stock = rows.map(r => n(r.currentStock)).filter((v): v is number => v != null);
      const sales = rows.map(r => n(r.salesQty)).filter((v): v is number => v != null && v > 0);
      if (!stock.length || !sales.length) return null;
      return stock.reduce((a,b)=>a+b,0) / Math.max(0.000001, sales.reduce((a,b)=>a+b,0));
    },
  },
  {
    id: 'inventory.stockout-risk',
    label: 'معدل نفاد المخزون المقدر',
    unit: 'days',
    formula: 'currentStock ÷ dailySalesRate',
    requiredFields: ['currentStock', 'dailySalesRate'],
    calculate: rows => {
      const pairs = rows.map(r => [n(r.currentStock), n(r.dailySalesRate)] as const)
        .filter((pair): pair is [number, number] => pair[0] != null && pair[1] != null && pair[1] > 0);
      if (!pairs.length) return null;
      return mean(pairs.map(([stock, rate]) => stock / rate));
    },
  },
  {
    id: 'sales.growth',
    label: 'نمو المبيعات',
    unit: '%',
    formula: '(latest - previous) ÷ |previous| × 100',
    requiredFields: ['salesAmount', 'date'],
    calculate: rows => {
      const points = rows.map(r => ({ date: String(r.date ?? ''), value: n(r.salesAmount) }))
        .filter((x): x is {date:string;value:number} => Boolean(x.date) && x.value != null)
        .sort((a,b)=>a.date.localeCompare(b.date));
      if (points.length < 2) return null;
      const previous = points[points.length - 2].value;
      const latest = points[points.length - 1].value;
      return previous === 0 ? null : ((latest - previous) / Math.abs(previous)) * 100;
    },
  },
  {
    id: 'receivables.collection-ratio',
    label: 'نسبة التحصيل',
    unit: '%',
    formula: 'paidAmount ÷ (paidAmount + balance) × 100',
    requiredFields: ['paidAmount', 'balance'],
    calculate: rows => {
      const paid = rows.map(r => n(r.paidAmount)).filter((v): v is number => v != null).reduce((a,b)=>a+b,0);
      const balance = rows.map(r => n(r.balance)).filter((v): v is number => v != null).reduce((a,b)=>a+b,0);
      return paid + balance > 0 ? (paid / (paid + balance)) * 100 : null;
    },
  },
  {
    id: 'profit.margin',
    label: 'هامش الربح',
    unit: '%',
    formula: 'profit ÷ netAmount × 100',
    requiredFields: ['profit', 'netAmount'],
    calculate: rows => {
      const profit = rows.map(r => n(r.profit)).filter((v): v is number => v != null).reduce((a,b)=>a+b,0);
      const revenue = rows.map(r => n(r.netAmount)).filter((v): v is number => v != null).reduce((a,b)=>a+b,0);
      return revenue !== 0 ? (profit / revenue) * 100 : null;
    },
  },
];

export function normalizeMetricField(row: KernelRow, field: string): unknown {
  if (Object.prototype.hasOwnProperty.call(row, field)) return row[field];
  const target = normalized(field);
  const hit = Object.keys(row).find(key => normalized(key) === target);
  return hit ? row[hit] : undefined;
}

export function canonicalRows(rows: KernelRow[]): KernelRow[] {
  return rows.map(row => {
    const next: KernelRow = { ...row };
    for (const field of ['currentStock','salesQty','dailySalesRate','salesAmount','date','paidAmount','balance','profit','netAmount','productCode','warehouse','customerCode','supplierCode']) {
      const value = normalizeMetricField(row, field);
      if (value !== undefined && next[field] === undefined) next[field] = value;
    }
    return next;
  });
}

export function assessDataQuality(rows: KernelRow[], contract: DataContract): DataQualityAssessment {
  const data = canonicalRows(rows);
  const available = new Set(data.flatMap(Object.keys));
  const missingRequiredFields = contract.requiredFields.filter(field => !available.has(field));
  const numericCoverage: Record<string, number> = {};
  for (const field of contract.numericFields ?? []) {
    const present = data.filter(row => n(row[field]) != null).length;
    numericCoverage[field] = data.length ? Math.round((present / data.length) * 100) : 0;
  }

  const duplicateKeyCount = contract.uniqueKey?.length
    ? (() => {
        const seen = new Set<string>();
        let duplicates = 0;
        for (const row of data) {
          const key = contract.uniqueKey!.map(field => String(row[field] ?? '∅')).join('¦');
          if (seen.has(key)) duplicates += 1;
          else seen.add(key);
        }
        return duplicates;
      })()
    : 0;

  const reasons: string[] = [];
  if (data.length < contract.minimumRows) reasons.push('العينة أقل من الحد الأدنى المطلوب.');
  if (missingRequiredFields.length) reasons.push('حقول القرار الأساسية غير موجودة.');
  if (duplicateKeyCount) reasons.push('تم اكتشاف مفاتيح مكررة قد تغيّر مستوى التجميع.');
  for (const [field, coverage] of Object.entries(numericCoverage)) if (coverage < 90) reasons.push('تغطية الحقل ' + field + ' أقل من 90%.');

  const score = Math.max(0, Math.min(100, 100 - (missingRequiredFields.length * 20) - (duplicateKeyCount ? 10 : 0) - reasons.filter(r => r.includes('تغطية الحقل')).length * 8 - (data.length < contract.minimumRows ? 20 : 0)));
  return {
    state: missingRequiredFields.length ? 'BLOCKED' : (score < 80 ? 'REVIEW' : 'TRUSTED'),
    score,
    rows: data.length,
    missingRequiredFields,
    duplicateKeyCount,
    numericCoverage,
    reasons,
  };
}

export function calculateRegisteredMetrics(rows: KernelRow[], ids?: string[]): MetricResult[] {
  const canonical = canonicalRows(rows);
  return CALCULATION_REGISTRY
    .filter(metric => !ids?.length || ids.includes(metric.id))
    .map(metric => {
      const value = metric.calculate(canonical);
      return {
        ...metric,
        value,
        state: value == null ? 'INSUFFICIENT_DATA' : 'CALCULATED',
        evidence: value == null ? [] : [{ rowNumber: canonical.length ? 1 : null }],
      };
    });
}

export function deriveUnknownGaps(rows: KernelRow[], context: { recommendation?: string; outcomeRequired?: boolean }): UnknownGap[] {
  const data = canonicalRows(rows);
  const fields = new Set(data.flatMap(Object.keys));
  const gaps: UnknownGap[] = [];
  const needsReorder = /إعادة.?الطلب|reorder|شراء|purchase/i.test(context.recommendation ?? '');
  if (needsReorder && !fields.has('leadTimeDays')) {
    gaps.push({
      id: 'gap:inventory:lead-time',
      title: 'مهلة التوريد غير معروفة',
      severity: 'high',
      requiredFor: 'اعتماد كمية إعادة الطلب',
      missingFields: ['leadTimeDays'],
      action: 'أدخل مهلة التوريد أو اربط مصدر المشتريات قبل اعتماد كمية شراء.',
      state: 'GAP_DETECTED',
    });
  }
  if (needsReorder && !fields.has('currentStock')) {
    gaps.push({
      id: 'gap:inventory:stock',
      title: 'الرصيد الحالي غير مثبت',
      severity: 'high',
      requiredFor: 'قرار إعادة الطلب',
      missingFields: ['currentStock'],
      action: 'ثبت رصيد المخزون من مصدره قبل أي قرار شراء.',
      state: 'GAP_DETECTED',
    });
  }
  if (context.outcomeRequired) {
    gaps.push({
      id: 'gap:outcome:actual',
      title: 'لا توجد نتيجة تنفيذية لاحقة',
      severity: 'medium',
      requiredFor: 'تعلم التوصية',
      missingFields: ['outcome'],
      action: 'سجل نتيجة ما بعد التنفيذ ثم أعد تشغيل القرار لقياس أثره.',
      state: 'PENDING_EVIDENCE',
    });
  }
  return gaps;
}

function firstNumber(rows: KernelRow[], field: string): number | null {
  const values = rows.map(r => n(normalizeMetricField(r, field))).filter((v): v is number => v != null);
  return values.length ? values.reduce((a,b)=>a+b,0) : null;
}

export function runWhatIfScenario(rows: KernelRow[], input: ScenarioInput): ScenarioResult {
  const data = canonicalRows(rows);
  const baselineStock = firstNumber(data, 'currentStock');
  const baselineDemand = firstNumber(data, 'salesQty') ?? firstNumber(data, 'dailySalesRate');
  const baselineCost = firstNumber(data, 'cost');
  const baselineRevenue = firstNumber(data, 'netAmount') ?? firstNumber(data, 'salesAmount');
  const baselineProfit = firstNumber(data, 'profit');

  const canCoverage = baselineStock != null && baselineDemand != null && baselineDemand > 0;
  const demandMultiplier = input.demandMultiplier ?? 1;
  const stockDelta = input.stockDelta ?? 0;
  const costMultiplier = input.costMultiplier ?? 1;
  const priceMultiplier = input.sellingPriceMultiplier ?? 1;

  const scenarioStock = baselineStock == null ? null : baselineStock + stockDelta;
  const scenarioDemand = baselineDemand == null ? null : baselineDemand * demandMultiplier;
  const baselineCoverage = canCoverage ? baselineStock! / baselineDemand! : null;
  const scenarioCoverage = scenarioStock != null && scenarioDemand != null && scenarioDemand > 0 ? scenarioStock / scenarioDemand : null;

  const baselineMargin = baselineRevenue != null && baselineProfit != null && baselineRevenue !== 0 ? baselineProfit / baselineRevenue * 100 : null;
  const scenarioCost = baselineCost == null ? null : baselineCost * costMultiplier;
  const scenarioRevenue = baselineRevenue == null ? null : baselineRevenue * priceMultiplier;
  const scenarioProfit = scenarioRevenue == null || scenarioCost == null ? baselineProfit : scenarioRevenue - scenarioCost;
  const scenarioMargin = scenarioRevenue != null && scenarioProfit != null && scenarioRevenue !== 0 ? scenarioProfit / scenarioRevenue * 100 : baselineMargin;

  const changedDrivers = [
    demandMultiplier !== 1 ? 'الطلب × ' + demandMultiplier.toFixed(2) : null,
    stockDelta !== 0 ? 'تعديل الرصيد ' + stockDelta.toLocaleString('ar-YE') : null,
    costMultiplier !== 1 ? 'التكلفة × ' + costMultiplier.toFixed(2) : null,
    priceMultiplier !== 1 ? 'سعر البيع × ' + priceMultiplier.toFixed(2) : null,
  ].filter((v): v is string => Boolean(v));

  return {
    state: canCoverage || baselineMargin != null ? 'READY' : 'INSUFFICIENT_DATA',
    baseline: { stock: baselineStock, demand: baselineDemand, coverage: baselineCoverage, margin: baselineMargin },
    scenario: { stock: scenarioStock, demand: scenarioDemand, coverage: scenarioCoverage, margin: scenarioMargin },
    delta: {
      coverage: baselineCoverage != null && scenarioCoverage != null ? scenarioCoverage - baselineCoverage : null,
      margin: baselineMargin != null && scenarioMargin != null ? scenarioMargin - baselineMargin : null,
    },
    changedDrivers,
    proofBoundary: changedDrivers.length
      ? 'سيناريو حسابي فقط. لا يُكتب إلى سجلات الأعمال ولا يُعد نتيجة فعلية أو قرارًا معتمدًا.'
      : 'الخط الأساسي مطابق للمصدر؛ حرّك متغيرًا لبناء سيناريو.',
  };
}

export function reconcileRows(
  leftRows: KernelRow[],
  rightRows: KernelRow[],
  options: { key: string; metric: string; tolerance?: number },
): ReconciliationFinding[] {
  const tolerance = options.tolerance ?? 0.005;
  const left = new Map(canonicalRows(leftRows).map(row => [String(row[options.key] ?? ''), row]));
  const right = new Map(canonicalRows(rightRows).map(row => [String(row[options.key] ?? ''), row]));
  const keys = [...new Set([...left.keys(), ...right.keys()].filter(Boolean))];
  return keys.map(key => {
    const lv = left.get(key);
    const rv = right.get(key);
    if (!lv) return { key, leftValue: null, rightValue: n(rv?.[options.metric]) ?? null, delta: null, relativeDelta: null, state:'MISSING_LEFT', evidence:[] };
    if (!rv) return { key, leftValue: n(lv[options.metric]) ?? null, rightValue: null, delta: null, relativeDelta: null, state:'MISSING_RIGHT', evidence:[] };
    const l = n(lv[options.metric]); const r = n(rv[options.metric]);
    if (l == null || r == null) return { key, leftValue: l, rightValue: r, delta: null, relativeDelta: null, state:'MISMATCH', evidence:[] };
    const delta = r - l;
    const relativeDelta = l === 0 ? null : delta / Math.abs(l);
    return {
      key, leftValue:l, rightValue:r, delta, relativeDelta,
      state: relativeDelta == null ? (Math.abs(delta) <= tolerance ? 'MATCH' : 'MISMATCH') : (Math.abs(relativeDelta) <= tolerance ? 'MATCH' : 'MISMATCH'),
      evidence: [],
    };
  });
}

export function buildProvenanceGraph(context: { sourceHash?: string|null; reportJobId?: string|null; archetypeId?: string|null; signal?: string|null; recommendation?: string|null }): ProvenanceGraph {
  const sourceId = 'source:' + (context.sourceHash ?? 'unknown');
  const reportId = 'report:' + (context.reportJobId ?? 'unknown');
  const signalId = 'signal:' + (context.signal ?? 'none');
  const recId = 'recommendation:' + (context.recommendation ?? 'none');
  const nodes: OntologyNode[] = [
    { id: sourceId, kind:'evidence', label:'المصدر الأصلي', confidence:100 },
    { id: reportId, kind:'evidence', label:'وظيفة التقرير ' + (context.archetypeId ?? 'عام'), confidence:90 },
    { id: signalId, kind:'metric', label:context.signal ?? 'لا توجد إشارة', confidence:85 },
    { id: recId, kind:'action', label:context.recommendation ?? 'لا توجد توصية', confidence:80 },
  ];
  return {
    nodes,
    edges: [
      { from: sourceId, to: reportId, label:'استخرج من' },
      { from: reportId, to: signalId, label:'أنتج الإشارة' },
      { from: signalId, to: recId, label:'ولّد التوصية' },
    ],
  };
}

export function buildBusinessOntology(rows: KernelRow[]): OntologyNode[] {
  const data = canonicalRows(rows);
  const fields = new Set(data.flatMap(Object.keys));
  const definitions: Array<[string,string,string]> = [
    ['productCode','entity','الصنف'],
    ['customerCode','entity','العميل'],
    ['supplierCode','entity','المورد'],
    ['warehouse','entity','المستودع'],
    ['currentStock','metric','الرصيد الحالي'],
    ['salesQty','metric','المبيعات'],
    ['netAmount','metric','صافي القيمة'],
    ['profit','metric','الربح'],
  ];
  return definitions.filter(([field]) => fields.has(field)).map(([field,kind,label]) => ({
    id:'ontology:' + field,
    kind:kind as OntologyNode['kind'],
    label,
    relation:'مرتبط بالمصدر',
    confidence:95,
  }));
}

export function toArrowTable(rows: KernelRow[]): Table<any> {
  return tableFromJSON(canonicalRows(rows));
}

export function buildLearningSignal(input: { scope: string; feedback: 'ACCEPT'|'REJECT'|'EDIT'; lesson: string }): LearningSignal {
  const record: LearningSignal = {
    id:'learning:' + input.scope + ':' + Date.now(),
    feedback: input.feedback,
    scope: input.scope,
    lesson: input.lesson,
    persistedLocally:false,
  };
  if (typeof window === 'undefined') return record;
  try {
    const key = 'aghbari.active-learning.v1';
    const current = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    const next = Array.isArray(current) ? [...current.slice(-49), record] : [record];
    window.localStorage.setItem(key, JSON.stringify(next));
    return { ...record, persistedLocally:true };
  } catch {
    return record;
  }
}

export function getLearningSignals(): LearningSignal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem('aghbari.active-learning.v1') ?? '[]');
    return Array.isArray(raw) ? raw as LearningSignal[] : [];
  } catch {
    return [];
  }
}

export function buildAIBoundary(): { computation: string; truth: string; llm: string; rule: string } {
  return {
    computation:'الحساب والتنظيف والجودة والتسوية والتنبؤات المشروطة عبر محركات حتمية قابلة للإعادة.',
    truth:'المصدر + البصمة + لقطات الدليل هي مرجع الحقيقة؛ لا يسمح للمحادثة بإنشاء قيمة بديلة.',
    llm:'يُستخدم النموذج اللغوي عند توفره للشرح، التخطيط، وتوليد أسئلة متابعة فقط.',
    rule:'LLM = تفسير وتخطيط؛ وليس مصدر حساب أو حقيقة أو اعتماد قرار.',
  };
}

export function summarizeNumericStability(rows: KernelRow[], field: string): { mean: number|null; median: number|null; trendSlope: number|null } {
  const values = canonicalRows(rows).map(row => n(row[field])).filter((v): v is number => v != null);
  if (!values.length) return { mean:null, median:null, trendSlope:null };
  const points = values.map((value,index)=>[index,value] as [number,number]);
  const regression = linearRegression(points);
  return { mean:mean(values), median:median(values), trendSlope:regression.m };
}

export async function optimizeSimpleAllocation(input: { objective: number[]; lower: number[]; upper: number[]; demand: number[]; capacity: number }): Promise<number[] | null> {
  try {
    const GLPK = typeof window === 'undefined'
      ? (await import('glpk.js/node')).default
      : (await import('glpk.js')).default;
    const glpk = await GLPK();
    const vars = input.objective.map((coef, index) => ({ name:'x' + index, coef }));
    const subjectTo = [{
      name:'capacity',
      vars: input.demand.map((coef,index)=>({ name:'x' + index, coef })),
      bnds:{ type:glpk.GLP_UP, ub:input.capacity, lb:0 },
    }];
    const result = await glpk.solve({
      name:'aghbari_allocation',
      objective:{ direction:glpk.GLP_MAX, name:'objective', vars },
      subjectTo,
      bounds: input.objective.map((_, index)=>({ name:'x' + index, type:glpk.GLP_DB, lb:input.lower[index] ?? 0, ub:input.upper[index] ?? Number.POSITIVE_INFINITY })),
    });
    return result.result.status === glpk.GLP_OPT ? input.objective.map((_, index)=>Number(result.result.vars['x' + index] ?? 0)) : null;
  } catch {
    return null;
  }
}
