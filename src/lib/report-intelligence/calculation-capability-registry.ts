import type { CanonicalField } from './canonical-schema';
import { matchCanonicalField } from './canonical-schema';

export type CalculationAvailability =
  | 'CALCULATED'
  | 'NOT_AVAILABLE'
  | 'INSUFFICIENT_SAMPLE'
  | 'REVIEW_REQUIRED';

export type CalculationDataType = 'count' | 'number' | 'percent' | 'ratio' | 'date' | 'boolean';

export type CalculationDefinition = {
  metricId: string;
  name: string;
  formula: string;
  requiredFields: CanonicalField[];
  optionalFields: CanonicalField[];
  supportedArchetypes: string[];
  minimumSample: number;
  dataType: CalculationDataType;
  evidenceRequirements: string[];
  confidenceRule: string;
  limitation: string;
};

export type CalculationResult = CalculationDefinition & {
  availabilityState: CalculationAvailability;
  value: number | string | boolean | null;
  unit: string | null;
  sampleSize: number;
  usableSample: number;
  sourceFields: string[];
  evidence: string[];
  confidence: number;
  details?: Record<string, unknown>;
};

type Row = {
  row_number?: number;
  data?: Record<string, unknown> | null;
};

const n = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const raw = String(value ?? '').trim().replace(/,/g, '');
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const s = (value: unknown): string => String(value ?? '').trim();

const norm = (value: unknown): string =>
  s(value).toLowerCase().normalize('NFKC').replace(/[إأآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[\s_\-./]+/g, '');

function resolveFieldKey(rows: Row[], field: CanonicalField): string | null {
  const candidates = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row.data ?? {})) {
      if (key === field || matchCanonicalField(key) === field || norm(key) === norm(field)) candidates.add(key);
    }
  }
  return candidates.values().next().value ?? null;
}

function values(rows: Row[], key: string): Array<{ value: number; row: Row }> {
  const out: Array<{ value: number; row: Row }> = [];
  for (const row of rows) {
    const value = n(row.data?.[key]);
    if (value != null) out.push({ value, row });
  }
  return out;
}

function median(items: number[]): number | null {
  if (!items.length) return null;
  const sorted = [...items].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function periodPoints(rows: Row[], dateKey: string, valueKey: string): Array<{ period: string; value: number; start: number }> {
  const buckets = new Map<string, { value: number; start: number }>();
  for (const row of rows) {
    const date = new Date(s(row.data?.[dateKey]));
    const value = n(row.data?.[valueKey]);
    if (Number.isNaN(date.getTime()) || value == null) continue;
    const period = date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0');
    const current = buckets.get(period);
    const start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
    buckets.set(period, current ? { value: current.value + value, start: current.start } : { value, start });
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, point]) => ({ period, ...point }));
}

function result(
  definition: CalculationDefinition,
  input: {
    availabilityState: CalculationAvailability;
    value?: number | string | boolean | null;
    unit?: string | null;
    sampleSize: number;
    usableSample: number;
    sourceFields?: string[];
    evidence?: string[];
    confidence?: number;
    details?: Record<string, unknown>;
  },
): CalculationResult {
  return {
    ...definition,
    availabilityState: input.availabilityState,
    value: input.value ?? null,
    unit: input.unit ?? null,
    sampleSize: input.sampleSize,
    usableSample: input.usableSample,
    sourceFields: input.sourceFields ?? [],
    evidence: input.evidence ?? [],
    confidence: input.confidence ?? 0,
    details: input.details,
  };
}

export const CALCULATION_REGISTRY: readonly CalculationDefinition[] = [
  { metricId: 'row.count', name: 'عدد السجلات', formula: 'COUNT(rows)', requiredFields: [], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 1, dataType: 'count', evidenceRequirements: ['canonicalRows'], confidenceRule: '1.0 when canonical rows exist', limitation: 'العدد يصف العينة ولا يثبت جودتها.' },
  { metricId: 'row.distinct.entities', name: 'عدد الكيانات الفريدة', formula: 'COUNT(DISTINCT entity field)', requiredFields: [], optionalFields: ['customerCode','supplierCode','productCode','accountCode'], supportedArchetypes: ['*'], minimumSample: 1, dataType: 'count', evidenceRequirements: ['entity field'], confidenceRule: 'usable rows / sample', limitation: 'اختيار البعد يتم من أول حقل كياني متاح.' },
  { metricId: 'row.duplicate.rate', name: 'معدل السجلات المتكررة', formula: 'duplicate serialized row count / row count', requiredFields: [], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 1, dataType: 'percent', evidenceRequirements: ['canonical row payload'], confidenceRule: '1.0 when every row has a data object', limitation: 'التكرار هنا تطابق كامل للحمولة الصفية وليس تكرارًا تجاريًا مثبتًا.' },
  { metricId: 'data.completeness', name: 'اكتمال البيانات', formula: '1 - missing required cell count / required cell count', requiredFields: [], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 1, dataType: 'percent', evidenceRequirements: ['canonical row payload'], confidenceRule: '1.0 when row payloads are readable', limitation: 'الاكتمال محسوب على الحقول الموجودة فعليًا وليس على حقول أعمال مفترضة.' },
  { metricId: 'data.numeric.outlier.rate', name: 'معدل القيم المتطرفة', formula: 'IQR outliers / usable numeric values', requiredFields: [], optionalFields: ['netAmount','quantity','currentStock','cost','unitPrice'], supportedArchetypes: ['*'], minimumSample: 5, dataType: 'percent', evidenceRequirements: ['numeric field'], confidenceRule: 'usable numeric sample >= 5', limitation: 'الشذوذ الإحصائي ليس دليل خطأ.' },
  { metricId: 'amount.sum', name: 'إجمالي القيمة', formula: 'SUM(netAmount)', requiredFields: ['netAmount'], optionalFields: ['grossAmount'], supportedArchetypes: ['*'], minimumSample: 1, dataType: 'number', evidenceRequirements: ['netAmount'], confidenceRule: 'usable numeric rows / sample', limitation: 'الإجمالي يعتمد على الحقل المالي الذي تم ربطه بالمصدر.' },
  { metricId: 'amount.average', name: 'متوسط القيمة', formula: 'AVERAGE(netAmount)', requiredFields: ['netAmount'], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 2, dataType: 'number', evidenceRequirements: ['netAmount'], confidenceRule: 'usable numeric rows / sample', limitation: 'لا يمثل متوسطًا لصفقات صالحة محاسبيًا ما لم يثبت تعريف الصف.' },
  { metricId: 'amount.median', name: 'وسيط القيمة', formula: 'MEDIAN(netAmount)', requiredFields: ['netAmount'], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 3, dataType: 'number', evidenceRequirements: ['netAmount'], confidenceRule: 'usable numeric rows / sample', limitation: 'الوسيط وصفي للعينة.' },
  { metricId: 'amount.min', name: 'أدنى قيمة', formula: 'MIN(netAmount)', requiredFields: ['netAmount'], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 1, dataType: 'number', evidenceRequirements: ['netAmount'], confidenceRule: 'usable numeric rows / sample', limitation: 'القيمة الدنيا لا تثبت شذوذًا أو خطأ.' },
  { metricId: 'amount.max', name: 'أعلى قيمة', formula: 'MAX(netAmount)', requiredFields: ['netAmount'], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 1, dataType: 'number', evidenceRequirements: ['netAmount'], confidenceRule: 'usable numeric rows / sample', limitation: 'القيمة العليا لا تثبت سببًا أو أهمية دون مقارنة.' },
  { metricId: 'trend.first.last.change', name: 'التغير بين أول وآخر فترة', formula: '(last - first) / ABS(first)', requiredFields: ['documentDate','netAmount'], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 2, dataType: 'percent', evidenceRequirements: ['documentDate','netAmount','at least two periods'], confidenceRule: 'period count >= 2', limitation: 'التغير وصفي ولا يثبت سببه.' },
  { metricId: 'trend.acceleration', name: 'تسارع/تباطؤ الاتجاه', formula: 'lastDelta - previousDelta', requiredFields: ['documentDate','netAmount'], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 3, dataType: 'number', evidenceRequirements: ['three periods'], confidenceRule: 'period count >= 3', limitation: 'التسارع لا يساوي تنبؤًا.' },
  { metricId: 'top5.share', name: 'حصة أعلى خمسة كيانات', formula: 'SUM(top5 entity values) / SUM(all entity values)', requiredFields: ['netAmount'], optionalFields: ['customerCode','supplierCode','productCode','category','warehouse','salesRep','accountCode'], supportedArchetypes: ['*'], minimumSample: 5, dataType: 'percent', evidenceRequirements: ['entity field','netAmount'], confidenceRule: 'at least 5 usable entity/value pairs', limitation: 'التركيز وصفي ولا يعني وحده اعتمادًا خطيرًا.' },
  { metricId: 'top10.share', name: 'حصة أعلى عشرة كيانات', formula: 'SUM(top10 entity values) / SUM(all entity values)', requiredFields: ['netAmount'], optionalFields: ['customerCode','supplierCode','productCode','category','warehouse','salesRep','accountCode'], supportedArchetypes: ['*'], minimumSample: 10, dataType: 'percent', evidenceRequirements: ['entity field','netAmount'], confidenceRule: 'at least 10 usable entity/value pairs', limitation: 'التركيز وصفي ولا يثبت اعتمادًا تجاريًا غير مقبول.' },
  { metricId: 'inventory.total.stock', name: 'إجمالي الرصيد الحالي', formula: 'SUM(currentStock)', requiredFields: ['currentStock'], optionalFields: [], supportedArchetypes: ['inventory.*'], minimumSample: 1, dataType: 'number', evidenceRequirements: ['currentStock'], confidenceRule: 'usable stock rows / sample', limitation: 'لا يحدد وحده القيمة أو سرعة الحركة.' },
  { metricId: 'inventory.zero.stock.rows', name: 'سجلات الرصيد الصفري', formula: 'COUNT(currentStock = 0)', requiredFields: ['currentStock'], optionalFields: [], supportedArchetypes: ['inventory.*'], minimumSample: 1, dataType: 'count', evidenceRequirements: ['currentStock'], confidenceRule: 'usable stock rows / sample', limitation: 'الصفر لا يساوي بالضرورة نفادًا تشغيليًا دون طلب.' },
  { metricId: 'inventory.negative.stock.rows', name: 'سجلات الرصيد السالب', formula: 'COUNT(currentStock < 0)', requiredFields: ['currentStock'], optionalFields: [], supportedArchetypes: ['inventory.*'], minimumSample: 1, dataType: 'count', evidenceRequirements: ['currentStock'], confidenceRule: 'usable stock rows / sample', limitation: 'الرصيد السالب إشارة تحتاج مطابقة حركة/دفتر.' },
  { metricId: 'inventory.stock.value', name: 'قيمة المخزون المرجعية', formula: 'SUM(currentStock * cost)', requiredFields: ['currentStock','cost'], optionalFields: [], supportedArchetypes: ['inventory.*'], minimumSample: 1, dataType: 'number', evidenceRequirements: ['currentStock','cost'], confidenceRule: 'rows with both fields / sample', limitation: 'قيمة مرجعية وليست تقييمًا محاسبيًا نهائيًا.' },
  { metricId: 'inventory.coverage.ratio', name: 'نسبة الرصيد إلى الطلب المرجعي', formula: 'SUM(currentStock) / ABS(SUM(salesQty))', requiredFields: ['currentStock','salesQty'], optionalFields: [], supportedArchetypes: ['inventory.*'], minimumSample: 1, dataType: 'ratio', evidenceRequirements: ['currentStock','salesQty'], confidenceRule: 'rows with both fields / sample', limitation: 'ليست أيام تغطية؛ تحتاج فترة طلب معتمدة.' },
  { metricId: 'fulfillment.rate', name: 'نسبة تلبية الطلب', formula: 'SUM(fulfilledQty) / ABS(SUM(requestedQty))', requiredFields: ['requestedQty','fulfilledQty'], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 1, dataType: 'percent', evidenceRequirements: ['requestedQty','fulfilledQty'], confidenceRule: 'rows with both fields / sample', limitation: 'لا يثبت سبب عدم التلبية.' },
  { metricId: 'receivable.outstanding', name: 'المستحقات القائمة', formula: 'SUM(netAmount - paidAmount)', requiredFields: ['netAmount','paidAmount'], optionalFields: [], supportedArchetypes: ['customers.*','finance.receivables-aging'], minimumSample: 1, dataType: 'number', evidenceRequirements: ['netAmount','paidAmount'], confidenceRule: 'rows with both fields / sample', limitation: 'هذا رصيد مشتق من صافي المبلغ والمدفوع وليس إثباتًا محاسبيًا نهائيًا.' },
  { metricId: 'profit.gross.margin', name: 'الهامش الإجمالي', formula: '(SUM(netAmount)-SUM(cost)) / ABS(SUM(netAmount))', requiredFields: ['netAmount','cost'], optionalFields: [], supportedArchetypes: ['finance.*','sales.*'], minimumSample: 1, dataType: 'percent', evidenceRequirements: ['netAmount','cost'], confidenceRule: 'rows with both fields / sample', limitation: 'هامش إجمالي مشتق ولا يمثل صافي الربح.' },
  { metricId: 'forecast.linear.next', name: 'التنبؤ الخطي للفترة التالية', formula: 'linear regression over monthly values', requiredFields: ['documentDate','netAmount'], optionalFields: [], supportedArchetypes: ['*'], minimumSample: 4, dataType: 'number', evidenceRequirements: ['>=4 consistent monthly observations'], confidenceRule: 'period count >= 4 and continuous monthly spacing', limitation: 'التنبؤ غير متاح عند عدم كفاية الفترات أو عدم انتظامها، ولا يثبت المستقبل.' },
] as const;

function definition(metricId: string): CalculationDefinition {
  const found = CALCULATION_REGISTRY.find((item) => item.metricId === metricId);
  if (!found) throw new Error('CALCULATION_METRIC_NOT_REGISTERED:' + metricId);
  return found;
}

function quality(rows: Row[], usable: number, minimumSample: number): number {
  if (!rows.length) return 0;
  return Number(Math.min(1, (usable / rows.length) * Math.min(1, rows.length / Math.max(1, minimumSample))).toFixed(4));
}

function requiredKeys(rows: Row[], fields: CanonicalField[]): { missing: CanonicalField[]; keys: Record<string,string> } {
  const keys: Record<string,string> = {};
  const missing: CanonicalField[] = [];
  for (const field of fields) {
    const key = resolveFieldKey(rows, field);
    if (!key) missing.push(field);
    else keys[field] = key;
  }
  return { missing, keys };
}

function makeUnavailable(def: CalculationDefinition, rows: Row[], state: CalculationAvailability, missing: CanonicalField[]): CalculationResult {
  return result(def, {
    availabilityState: state,
    sampleSize: rows.length,
    usableSample: 0,
    sourceFields: missing,
    evidence: missing.map((field) => 'missingField=' + field),
    confidence: 0,
  });
}

function evaluate(def: CalculationDefinition, rows: Row[], archetypeId: string | undefined): CalculationResult {
  if (rows.length < def.minimumSample) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', def.requiredFields);
  const req = requiredKeys(rows, def.requiredFields);
  if (req.missing.length) return makeUnavailable(def, rows, 'NOT_AVAILABLE', req.missing);
  if (archetypeId && !def.supportedArchetypes.includes('*') && !def.supportedArchetypes.some((item) => archetypeId.startsWith(item.replace(/\*$/, '')))) {
    return result(def, { availabilityState: 'NOT_AVAILABLE', sampleSize: rows.length, usableSample: 0, evidence: ['unsupportedArchetype=' + archetypeId], confidence: 0 });
  }

  const usableRatio = (count: number) => quality(rows, count, def.minimumSample);
  const keys = req.keys;
  const baseEvidence = Object.entries(keys).map(([field, key]) => field + 'Field=' + key);
  const common = (usable: number, details?: Record<string, unknown>) => ({
    sampleSize: rows.length,
    usableSample: usable,
    sourceFields: Object.values(keys),
    evidence: [...baseEvidence, 'rows=' + rows.length, 'usableRows=' + usable],
    confidence: usableRatio(usable),
    details,
  });

  switch (def.metricId) {
    case 'row.count':
      return result(def, { availabilityState: 'CALCULATED', value: rows.length, unit: 'rows', sampleSize: rows.length, usableSample: rows.length, sourceFields: [], evidence: ['rows=' + rows.length], confidence: 1 });
    case 'row.distinct.entities': {
      const field = (['customerCode','supplierCode','productCode','accountCode'] as CanonicalField[]).map((candidate) => [candidate, resolveFieldKey(rows, candidate)] as const).find(([, key]) => key);
      if (!field) return makeUnavailable(def, rows, 'NOT_AVAILABLE', ['customerCode']);
      const distinct = new Set(rows.map((row) => s(row.data?.[field[1]!])).filter(Boolean));
      return result(def, { availabilityState: 'CALCULATED', value: distinct.size, unit: 'entities', ...common(rows.filter((row) => s(row.data?.[field[1]!])).length, { entityField: field[1] }), sourceFields: [field[1]!] });
    }
    case 'row.duplicate.rate': {
      const signatures = rows.map((row) => JSON.stringify(row.data ?? {}));
      const counts = new Map<string, number>();
      signatures.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
      const duplicateRows = signatures.reduce((total, signature) => total + Math.max(0, (counts.get(signature) ?? 1) - 1), 0);
      return result(def, { availabilityState: 'CALCULATED', value: Number((duplicateRows / rows.length * 100).toFixed(2)), unit: '%', sampleSize: rows.length, usableSample: rows.length, sourceFields: [], evidence: ['rows=' + rows.length, 'duplicateRows=' + duplicateRows], confidence: 1, details: { duplicateRows } });
    }
    case 'data.completeness': {
      let cells = 0;
      let missing = 0;
      for (const row of rows) for (const key of Object.keys(row.data ?? {})) {
        cells += 1;
        if (row.data?.[key] == null || s(row.data?.[key]) === '') missing += 1;
      }
      if (!cells) return makeUnavailable(def, rows, 'NOT_AVAILABLE', []);
      return result(def, { availabilityState: 'CALCULATED', value: Number(((1 - missing / cells) * 100).toFixed(2)), unit: '%', sampleSize: rows.length, usableSample: cells - missing, sourceFields: [], evidence: ['cells=' + cells, 'missingCells=' + missing], confidence: 1, details: { cells, missingCells: missing } });
    }
    case 'data.numeric.outlier.rate': {
      const field = (['netAmount','quantity','currentStock','cost','unitPrice'] as CanonicalField[]).map((candidate) => [candidate, resolveFieldKey(rows, candidate)] as const).find(([, key]) => key);
      if (!field) return makeUnavailable(def, rows, 'NOT_AVAILABLE', ['netAmount']);
      const usable = values(rows, field[1]!);
      if (usable.length < 5) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', [field[0]]);
      const nums = usable.map((item) => item.value).sort((a, b) => a - b);
      const q1 = nums[Math.floor((nums.length - 1) * 0.25)];
      const q3 = nums[Math.floor((nums.length - 1) * 0.75)];
      const iqr = q3 - q1;
      const low = q1 - 1.5 * iqr;
      const high = q3 + 1.5 * iqr;
      const outliers = nums.filter((value) => value < low || value > high).length;
      return result(def, { availabilityState: 'CALCULATED', value: Number((outliers / nums.length * 100).toFixed(2)), unit: '%', sampleSize: rows.length, usableSample: nums.length, sourceFields: [field[1]!], evidence: ['field=' + field[1], 'q1=' + q1, 'q3=' + q3, 'iqr=' + iqr, 'outliers=' + outliers], confidence: quality(rows, nums.length, 5), details: { field: field[1], outliers, low, high } });
    }
    case 'amount.sum':
    case 'amount.average':
    case 'amount.median':
    case 'amount.min':
    case 'amount.max': {
      const data = values(rows, keys.netAmount);
      if (!data.length) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', ['netAmount']);
      const nums = data.map((item) => item.value);
      const value =
        def.metricId === 'amount.sum' ? nums.reduce((a, b) => a + b, 0) :
        def.metricId === 'amount.average' ? nums.reduce((a, b) => a + b, 0) / nums.length :
        def.metricId === 'amount.median' ? median(nums) :
        def.metricId === 'amount.min' ? Math.min(...nums) :
        Math.max(...nums);
      return result(def, { availabilityState: 'CALCULATED', value, unit: 'source value', ...common(data.length) });
    }
    case 'trend.first.last.change':
    case 'trend.acceleration':
    case 'forecast.linear.next': {
      const points = periodPoints(rows, keys.documentDate, keys.netAmount);
      if (points.length < def.minimumSample) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', ['documentDate','netAmount']);
      const starts = points.slice(1).map((point, index) => ({ delta: point.value - points[index].value, point }));
      if (def.metricId === 'trend.first.last.change') {
        const first = points[0];
        const last = points.at(-1)!;
        if (first.value === 0) return result(def, { availabilityState: 'REVIEW_REQUIRED', value: null, unit: '%', ...common(points.length), evidence: [...baseEvidence, 'firstPeriod=' + first.period, 'lastPeriod=' + last.period, 'baselineZero=true'] });
        return result(def, { availabilityState: 'CALCULATED', value: Number(((last.value - first.value) / Math.abs(first.value) * 100).toFixed(2)), unit: '%', ...common(points.length), details: { firstPeriod: first.period, lastPeriod: last.period, firstValue: first.value, lastValue: last.value } });
      }
      if (def.metricId === 'trend.acceleration') {
        if (starts.length < 2) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', ['documentDate','netAmount']);
        const lastDelta = starts.at(-1)!.delta;
        const prevDelta = starts.at(-2)!.delta;
        return result(def, { availabilityState: 'CALCULATED', value: Number((lastDelta - prevDelta).toFixed(4)), unit: 'value change', ...common(points.length), details: { previousDelta: prevDelta, lastDelta } });
      }
      const intervals = points.slice(1).map((point, index) => point.start - points[index].start);
      const month = 30 * 86400000;
      if (intervals.some((value) => Math.abs(value - month) > 10 * 86400000)) {
        return result(def, { availabilityState: 'REVIEW_REQUIRED', value: null, unit: 'source value', ...common(points.length), evidence: [...baseEvidence, 'temporalSpacing=irregular'] });
      }
      const x = points.map((_, index) => index);
      const y = points.map((point) => point.value);
      const meanX = x.reduce((a,b)=>a+b,0) / x.length;
      const meanY = y.reduce((a,b)=>a+b,0) / y.length;
      const denominator = x.reduce((sum, item) => sum + Math.pow(item - meanX, 2), 0);
      if (denominator === 0) return result(def, { availabilityState: 'REVIEW_REQUIRED', value: null, unit: 'source value', ...common(points.length) });
      const slope = x.reduce((sum, item, index) => sum + (item - meanX) * (y[index] - meanY), 0) / denominator;
      const intercept = meanY - slope * meanX;
      const next = intercept + slope * x.length;
      return result(def, { availabilityState: 'CALCULATED', value: Number(next.toFixed(4)), unit: 'source value', ...common(points.length), details: { periods: points.map((point) => point.period), slope, intercept, observedPeriods: points.length } });
    }
    case 'top5.share':
    case 'top10.share': {
      const entityField = (['customerCode','supplierCode','productCode','category','warehouse','salesRep','accountCode'] as CanonicalField[]).map((candidate) => [candidate, resolveFieldKey(rows, candidate)] as const).find(([, key]) => key);
      if (!entityField) return makeUnavailable(def, rows, 'NOT_AVAILABLE', ['customerCode']);
      const grouped = new Map<string, number>();
      let usable = 0;
      for (const row of rows) {
        const entity = s(row.data?.[entityField[1]!]);
        const amount = n(row.data?.[keys.netAmount]);
        if (!entity || amount == null) continue;
        usable += 1;
        grouped.set(entity, (grouped.get(entity) ?? 0) + amount);
      }
      if (usable < def.minimumSample || !grouped.size) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', ['netAmount']);
      const ordered = [...grouped.values()].sort((a,b)=>Math.abs(b)-Math.abs(a));
      const take = def.metricId === 'top5.share' ? 5 : 10;
      const total = ordered.reduce((a,b)=>a+b,0);
      if (total === 0) return result(def, { availabilityState: 'REVIEW_REQUIRED', value: null, unit: '%', ...common(usable), evidence: [...baseEvidence, 'entityTotalZero=true'] });
      return result(def, { availabilityState: 'CALCULATED', value: Number((Math.abs(ordered.slice(0,take).reduce((a,b)=>a+b,0) / total) * 100).toFixed(2)), unit: '%', ...common(usable), sourceFields: [entityField[1]!, keys.netAmount], evidence: [...baseEvidence, 'entityField=' + entityField[1], 'entityCount=' + grouped.size], details: { topN: take, entities: [...grouped.entries()].sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,take) } });
    }
    case 'inventory.total.stock':
    case 'inventory.zero.stock.rows':
    case 'inventory.negative.stock.rows': {
      const data = values(rows, keys.currentStock);
      if (!data.length) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', ['currentStock']);
      const value = def.metricId === 'inventory.total.stock'
        ? data.reduce((sum, item) => sum + item.value, 0)
        : data.filter((item) => def.metricId === 'inventory.zero.stock.rows' ? item.value === 0 : item.value < 0).length;
      return result(def, { availabilityState: 'CALCULATED', value, unit: def.metricId === 'inventory.total.stock' ? 'quantity' : 'rows', ...common(data.length) });
    }
    case 'inventory.stock.value': {
      const stock = values(rows, keys.currentStock);
      let usable = 0;
      let total = 0;
      for (const row of rows) {
        const stockValue = n(row.data?.[keys.currentStock]);
        const costValue = n(row.data?.[keys.cost]);
        if (stockValue == null || costValue == null) continue;
        usable += 1;
        total += stockValue * costValue;
      }
      if (!usable) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', ['currentStock','cost']);
      return result(def, { availabilityState: 'CALCULATED', value: total, unit: 'reference value', ...common(usable), sourceFields: [keys.currentStock, keys.cost] });
    }
    case 'inventory.coverage.ratio': {
      let usable = 0;
      let stock = 0;
      let demand = 0;
      for (const row of rows) {
        const currentStock = n(row.data?.[keys.currentStock]);
        const salesQty = n(row.data?.[keys.salesQty]);
        if (currentStock == null || salesQty == null) continue;
        usable += 1;
        stock += currentStock;
        demand += salesQty;
      }
      if (!usable) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', ['currentStock','salesQty']);
      if (demand === 0) return result(def, { availabilityState: 'REVIEW_REQUIRED', value: null, unit: 'ratio', ...common(usable), evidence: [...baseEvidence, 'demandTotalZero=true'] });
      return result(def, { availabilityState: 'CALCULATED', value: Number((stock / Math.abs(demand)).toFixed(4)), unit: 'ratio', ...common(usable), sourceFields: [keys.currentStock, keys.salesQty] });
    }
    case 'fulfillment.rate': {
      let usable = 0;
      let requested = 0;
      let fulfilled = 0;
      for (const row of rows) {
        const req = n(row.data?.[keys.requestedQty]);
        const done = n(row.data?.[keys.fulfilledQty]);
        if (req == null || done == null) continue;
        usable += 1;
        requested += req;
        fulfilled += done;
      }
      if (!usable) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', ['requestedQty','fulfilledQty']);
      if (requested === 0) return result(def, { availabilityState: 'REVIEW_REQUIRED', value: null, unit: '%', ...common(usable), evidence: [...baseEvidence, 'requestedTotalZero=true'] });
      return result(def, { availabilityState: 'CALCULATED', value: Number((fulfilled / Math.abs(requested) * 100).toFixed(2)), unit: '%', ...common(usable), sourceFields: [keys.requestedQty, keys.fulfilledQty] });
    }
    case 'receivable.outstanding': {
      let usable = 0;
      let total = 0;
      for (const row of rows) {
        const amount = n(row.data?.[keys.netAmount]);
        const paid = n(row.data?.[keys.paidAmount]);
        if (amount == null || paid == null) continue;
        usable += 1;
        total += amount - paid;
      }
      if (!usable) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', ['netAmount','paidAmount']);
      return result(def, { availabilityState: 'CALCULATED', value: total, unit: 'source value', ...common(usable), sourceFields: [keys.netAmount, keys.paidAmount] });
    }
    case 'profit.gross.margin': {
      let usable = 0;
      let revenue = 0;
      let cost = 0;
      for (const row of rows) {
        const r = n(row.data?.[keys.netAmount]);
        const c = n(row.data?.[keys.cost]);
        if (r == null || c == null) continue;
        usable += 1;
        revenue += r;
        cost += c;
      }
      if (!usable) return makeUnavailable(def, rows, 'INSUFFICIENT_SAMPLE', ['netAmount','cost']);
      if (revenue === 0) return result(def, { availabilityState: 'REVIEW_REQUIRED', value: null, unit: '%', ...common(usable), evidence: [...baseEvidence, 'revenueTotalZero=true'] });
      return result(def, { availabilityState: 'CALCULATED', value: Number(((revenue - cost) / Math.abs(revenue) * 100).toFixed(2)), unit: '%', ...common(usable), sourceFields: [keys.netAmount, keys.cost], details: { revenue, cost } });
    }
    default:
      throw new Error('CALCULATION_EXECUTOR_NOT_IMPLEMENTED:' + def.metricId);
  }
}

export function runCalculationRegistry(input: {
  rows: Row[];
  archetypeId?: string;
  includeUnavailable?: boolean;
}): CalculationResult[] {
  return CALCULATION_REGISTRY
    .map((definition) => evaluate(definition, input.rows, input.archetypeId))
    .filter((item) => input.includeUnavailable || item.availabilityState === 'CALCULATED');
}
