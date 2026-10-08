import type { Dataset, ColumnProfile } from './types.js';
import {
  deriveReportIntelligence,
  type BusinessFinding,
  type ReportIntelligence,
  type ReportRecommendation,
  type ReportSignal,
} from '../report-intelligence/report-smart-insights.js';

const RISK_TERMS = [
  'خطر', 'مخاطر', 'تأخير', 'متأخر', 'عجز', 'نقص', 'مشكلة', 'تنبيه', 'حرج', 'نفاد', 'فقد', 'انحراف',
  'risk', 'delay', 'delayed', 'shortage', 'issue', 'warning', 'critical', 'overdue', 'loss', 'deficit',
];
const ACTION_TERMS = [
  'يجب', 'يلزم', 'إجراء', 'توصية', 'اعتماد', 'تنفيذ', 'مراجعة', 'متابعة', 'قرار', 'الموافقة',
  'must', 'need', 'action', 'recommendation', 'approve', 'review', 'follow up', 'decision',
];
const STOP_WORDS = new Set([
  'هذا', 'هذه', 'ذلك', 'تلك', 'من', 'في', 'على', 'عن', 'إلى', 'مع', 'هو', 'هي', 'و', 'او', 'أو', 'ثم', 'كما',
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were', 'into', 'our', 'your',
]);

type NumericMetric = {
  column: ColumnProfile;
  values: number[];
  usableRows: number;
  missingRows: number;
  sum: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  cv: number | null;
  firstMean: number | null;
  lastMean: number | null;
  changePct: number | null;
};

function text(value: unknown): string { return String(value ?? '').trim(); }

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي');
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = text(value);
  if (!raw) return null;
  const cleaned = raw
    .replace(/[%٪]/g, '')
    .replace(/[,$€£¥]/g, '')
    .replace(/ر\.ي|ريال|دولار|USD|EUR|SAR|YER/gi, '')
    .replace(/٬/g, ',')
    .replace(/٫/g, '.')
    .replace(/,/g, '')
    .trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function datasetText(dataset: Dataset): string[] {
  return (dataset.rows ?? []).flatMap((row) => {
    const values = Object.values(row).filter((value) => value !== null && value !== undefined && String(value).trim() !== '');
    return [values.map(text).join(' | ')];
  }).filter(Boolean);
}

function matchingLines(lines: string[], terms: string[], limit = 5): string[] {
  return lines.filter((line) => terms.some((term) => normalize(line).includes(normalize(term)))).slice(0, limit);
}

function countMatches(lines: string[], terms: string[]): number {
  return lines.reduce((count, line) => count + terms.filter((term) => normalize(line).includes(normalize(term))).length, 0);
}

function topKeywords(lines: string[]): Array<{ word: string; count: number }> {
  const counts = new Map<string, number>();
  for (const line of lines) for (const raw of line.match(/[\p{L}\p{N}]{4,}/gu) ?? []) {
    const word = normalize(raw);
    if (!word || STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));
}

function numericEvidence(lines: string[]): string[] {
  const result: string[] = [];
  const numericRegex = /(?:[$€£¥]|ر\.?س|ريال|دولار|USD|EUR|SAR|YER)?\s*[-+]?\d[\d,\u066B\u066C.]*/gi;
  for (const line of lines) {
    const values = line.match(numericRegex) ?? [];
    if (values.length) result.push(line + ' · أرقام مرصودة: ' + values.slice(0, 5).join(', '));
    if (result.length >= 5) break;
  }
  return result;
}

function metricRole(column: ColumnProfile): 'amount' | 'quantity' | 'rate' | 'percentage' | 'balance' | 'dateLike' | 'generic' {
  const value = normalize(column.name + ' ' + (column.mappedField ?? ''));
  if (/%|نسبة|rate|margin|ratio|percentage|percent/.test(value)) return 'percentage';
  if (/سعر|price|cost|تكلف|ايراد|إيراد|مبلغ|قيمة|amount|revenue|sales|مبيعات|purchase|مشتريات|profit|ربح/.test(value)) return 'amount';
  if (/كم|qty|quantity|وحد|عدد|count|volume|حجم|رصيد|stock|مخزون|balance|units/.test(value)) return 'quantity';
  if (/معدل|rate|velocity|معدل البيع|growth|نمو|average|متوسط|مؤشر/.test(value)) return 'rate';
  if (/رصيد|balance|outstanding|متبقي|receivable|دائن|مدين/.test(value)) return 'balance';
  if (/date|تاريخ|month|شهر|year|سنة|period|فترة|وقت|time/.test(value)) return 'dateLike';
  return 'generic';
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return NaN;
  const index = (sorted.length - 1) * p;
  const low = Math.floor(index);
  const high = Math.ceil(index);
  if (low === high) return sorted[low];
  return sorted[low] + (sorted[high] - sorted[low]) * (index - low);
}

function buildNumericMetric(dataset: Dataset, column: ColumnProfile): NumericMetric | null {
  const values = dataset.rows.map((row) => toNumber(row[column.name] ?? row[column.mappedField ?? ''])).filter((v): v is number => v != null);
  if (values.length < 2) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((total, value) => total + value, 0);
  const mean = sum / values.length;
  const variance = values.reduce((total, value) => total + ((value - mean) ** 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const split = Math.max(1, Math.floor(values.length / 3));
  const first = values.slice(0, split);
  const last = values.slice(-split);
  const firstMean = first.reduce((a, b) => a + b, 0) / first.length;
  const lastMean = last.reduce((a, b) => a + b, 0) / last.length;
  const changePct = firstMean === 0 ? null : ((lastMean - firstMean) / Math.abs(firstMean)) * 100;
  return {
    column,
    values,
    usableRows: values.length,
    missingRows: Math.max(0, dataset.rowCount - values.length),
    sum,
    mean,
    median: percentile(sorted, 0.5),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stdDev,
    cv: mean === 0 ? null : Math.abs(stdDev / mean),
    firstMean,
    lastMean,
    changePct,
  };
}

function formatMetric(metric: NumericMetric, suffix = ''): string {
  return metric.mean.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + suffix;
}

function numericMetrics(dataset: Dataset): NumericMetric[] {
  return dataset.columns
    .filter((column) => ['integer', 'decimal', 'currency', 'percentage', 'unit'].includes(column.dataType) || column.statistics?.count === dataset.rowCount)
    .map((column) => buildNumericMetric(dataset, column))
    .filter((item): item is NumericMetric => Boolean(item && item.usableRows >= Math.max(3, Math.ceil(dataset.rowCount * 0.15))))
    .sort((a, b) => b.usableRows - a.usableRows || Math.abs(b.mean) - Math.abs(a.mean))
    .slice(0, 16);
}

function categoryColumns(dataset: Dataset): ColumnProfile[] {
  return dataset.columns.filter((column) => {
    if (!['category', 'text', 'sku'].includes(column.dataType)) return false;
    return column.uniqueCount > 1 && column.uniqueCount <= Math.max(30, Math.ceil(dataset.rowCount * 0.4));
  });
}

function strongestCategory(dataset: Dataset): { column: ColumnProfile; value: string; count: number; share: number } | null {
  let best: { column: ColumnProfile; value: string; count: number; share: number } | null = null;
  for (const column of categoryColumns(dataset)) {
    const counts = new Map<string, number>();
    for (const row of dataset.rows) {
      const value = text(row[column.name] ?? row[column.mappedField ?? '']);
      if (!value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!winner) continue;
    const share = winner[1] / Math.max(1, dataset.rowCount);
    if (!best || share > best.share) best = { column, value: winner[0], count: winner[1], share };
  }
  return best;
}

function numericOutlierCount(metric: NumericMetric): { count: number; lower: number; upper: number } {
  const sorted = [...metric.values].sort((a, b) => a - b);
  const q1 = percentile(sorted, 0.25);
  const q3 = percentile(sorted, 0.75);
  const iqr = q3 - q1;
  if (!Number.isFinite(iqr) || iqr === 0) return { count: 0, lower: q1, upper: q3 };
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  const count = metric.values.filter((value) => value < lower || value > upper).length;
  return { count, lower, upper };
}

function genericRecommendation(
  evidence: string[],
  context: string,
  title = 'حوّل أهم إشارة مثبتة إلى قرار أو إجراء',
  action = 'راجع الدليل المحدد، ثبّت المالك والموعد، ثم حوّل ما يثبت إلى قرار أو مهمة قابلة لإعادة القياس.',
): ReportRecommendation {
  return {
    id: 'generic:file:review',
    status: 'PROPOSED',
    priority: evidence.length >= 3 ? 'high' : evidence.length ? 'medium' : 'low',
    title,
    action,
    why: context,
    evidence,
    ownerHint: 'المسؤول التشغيلي المناسب لمحتوى الملف',
    impact: 'الأثر المالي أو التشغيلي المستقبلي غير مثبت من المصدر وحده.',
    expectedOutcome: 'تحويل الإشارة المحددة إلى قرار/إجراء له مالك وموعد ومقياس نجاح.',
    whyNow: evidence.length ? 'يوجد دليل قابل للفحص الآن، ولا نحتاج إلى اختراع سياق خارجي.' : 'المصدر يحتاج تعريفًا دلاليًا قبل تحويله إلى قرار.',
    measurement: 'أعد قياس المؤشر نفسه بعد الإجراء، بنفس تعريف الحقل ونفس مصدر التقرير.',
    risk: 'قد يكون الارتباط حسابيًا فقط؛ لا يُسمى سببًا أو خسارة قبل وجود دليل سببي مستقل.',
    blocker: 'لا يوجد تنفيذ فعلي مثبت في الملف نفسه.',
    limitation: 'الاستنتاج العام يصف ما تثبته البيانات ويصرّح بحدودها؛ لا يعتمد على اسم الملف وحده.',
  };
}

export function buildGenericFileIntelligence(dataset: Dataset, format: string): ReportIntelligence {
  const lines = datasetText(dataset);
  const allText = lines.join('\n');
  const words = allText.split(/\s+/).filter(Boolean);
  const riskLines = matchingLines(lines, RISK_TERMS);
  const actionLines = matchingLines(lines, ACTION_TERMS);
  const numbers = numericEvidence(lines);
  const keywords = topKeywords(lines);
  const riskCount = countMatches(lines, RISK_TERMS);
  const actionCount = countMatches(lines, ACTION_TERMS);
  const dateCount = (allText.match(/\b(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g) ?? []).length;

  const base = deriveReportIntelligence({
    specialty: null,
    rowCount: dataset.rowCount,
    sourceAnalysis: { datasets: [dataset] },
    canonicalRows: dataset.rows.map((data, index) => ({ row_number: index + 1, data })),
  });

  const signals: ReportSignal[] = [];
  const findings: BusinessFinding[] = [];
  const recommendations: ReportRecommendation[] = [];

  const metrics = numericMetrics(dataset);
  const metricSignals: ReportSignal[] = [];

  for (const metric of metrics.slice(0, 8)) {
    const role = metricRole(metric.column);
    const evidenceBase = [
      'field=' + metric.column.name,
      'usableRows=' + metric.usableRows,
      'sum=' + metric.sum.toFixed(2),
      'mean=' + metric.mean.toFixed(2),
      'min=' + metric.min.toFixed(2),
      'max=' + metric.max.toFixed(2),
    ];
    const outliers = numericOutlierCount(metric);

    if (outliers.count >= Math.max(2, Math.ceil(metric.usableRows * 0.05))) {
      metricSignals.push({
        id: 'generic:numeric:outliers:' + metric.column.name,
        severity: outliers.count >= Math.ceil(metric.usableRows * 0.15) ? 'high' : 'medium',
        title: 'قيم شاذة تستحق الفحص: ' + metric.column.name,
        message: 'ظهرت ' + outliers.count + ' قيم خارج نطاق التوزيع المعتاد للحقل، بين ' + metric.min.toLocaleString('ar-YE') + ' و' + metric.max.toLocaleString('ar-YE') + '.',
        evidence: [...evidenceBase, 'outlierCount=' + outliers.count, 'lowerFence=' + outliers.lower.toFixed(2), 'upperFence=' + outliers.upper.toFixed(2)],
        affectedRows: outliers.count,
        soWhat: 'هذا قد يمثل حالة حقيقية مهمة أو خطأ إدخال؛ يجب فحص الصفوف الشاذة قبل بناء قرار عليها.',
        impact: 'الأثر المالي/التشغيلي غير مثبت؛ المثبت هو وجود قيم خارج النطاق الإحصائي.',
        ownerHint: 'المسؤول عن الحقل ' + metric.column.name,
        priority: outliers.count >= Math.ceil(metric.usableRows * 0.15) ? 'P1' : 'P2',
        priorityReason: ['outlierCount=' + outliers.count, 'usableRows=' + metric.usableRows],
      });
    }

    if (metric.missingRows > 0 && metric.missingRows / Math.max(1, dataset.rowCount) >= 0.1) {
      metricSignals.push({
        id: 'generic:numeric:missing:' + metric.column.name,
        severity: metric.missingRows / Math.max(1, dataset.rowCount) >= 0.3 ? 'high' : 'medium',
        title: 'نقص واضح في الحقل: ' + metric.column.name,
        message: 'الحقل مفقود في ' + metric.missingRows + ' من ' + dataset.rowCount + ' سجلًا؛ أي ' + ((metric.missingRows / dataset.rowCount) * 100).toFixed(1) + '%.',
        evidence: [...evidenceBase, 'missingRows=' + metric.missingRows, 'missingShare=' + ((metric.missingRows / dataset.rowCount) * 100).toFixed(1) + '%'],
        affectedRows: metric.missingRows,
        soWhat: 'أي إجمالي أو اتجاه يعتمد على هذا الحقل قد يكون جزئيًا؛ يجب معرفة سبب النقص قبل اعتماد الاستنتاج.',
        impact: 'قد يخفض النقص من اكتمال القرار، ولا يُفترض أثر مالي.',
        ownerHint: 'مالك البيانات للحقل ' + metric.column.name,
        priority: metric.missingRows / Math.max(1, dataset.rowCount) >= 0.3 ? 'P1' : 'P2',
        priorityReason: ['missingRows=' + metric.missingRows],
      });
    }

    if (metric.changePct != null && Math.abs(metric.changePct) >= 15 && metric.usableRows >= 6) {
      const direction = metric.changePct > 0 ? 'ارتفاع' : 'انخفاض';
      metricSignals.push({
        id: 'generic:numeric:trend:' + metric.column.name,
        severity: Math.abs(metric.changePct) >= 35 ? 'high' : 'medium',
        title: 'اتجاه ملحوظ في ' + metric.column.name,
        message: 'متوسط الجزء الأحدث من السجلات يشير إلى ' + direction + ' بنحو ' + Math.abs(metric.changePct).toFixed(1) + '% مقارنة بالبداية.',
        evidence: [...evidenceBase, 'firstMean=' + (metric.firstMean ?? 0).toFixed(2), 'lastMean=' + (metric.lastMean ?? 0).toFixed(2), 'changePct=' + metric.changePct.toFixed(1) + '%'],
        affectedRows: metric.usableRows,
        soWhat: 'الاتجاه يستحق تفسيرًا بحسب البعد التجاري الذي يمثله الحقل، لكنه لا يثبت السبب وحده.',
        impact: 'المثبت هو التغير الحسابي؛ الأثر التجاري يحتاج ربط الحقل بسياق القرار.',
        ownerHint: 'مالك المؤشر ' + metric.column.name,
        priority: Math.abs(metric.changePct) >= 35 ? 'P1' : 'P2',
        priorityReason: ['changePct=' + metric.changePct.toFixed(1) + '%'],
      });
    }
  }

  const category = strongestCategory(dataset);
  if (category && category.share >= 0.5) {
    metricSignals.push({
      id: 'generic:category:concentration:' + category.column.name,
      severity: category.share >= 0.75 ? 'high' : 'medium',
      title: 'تركيز مرتفع في ' + category.column.name,
      message: 'القيمة "' + category.value + '" تمثل ' + (category.share * 100).toFixed(1) + '% من السجلات في هذا البعد.',
      evidence: ['field=' + category.column.name, 'dominantValue=' + category.value, 'dominantRows=' + category.count, 'share=' + (category.share * 100).toFixed(1) + '%'],
      affectedRows: category.count,
      soWhat: 'التركيز لا يعني خطرًا تلقائيًا؛ لكنه يحدد نقطة يجب فحص الاعتماد أو التوزيع حولها.',
      impact: 'الأثر غير مثبت من التركيز وحده.',
      ownerHint: 'مالك البعد ' + category.column.name,
      priority: category.share >= 0.75 ? 'P1' : 'P2',
      priorityReason: ['dominantShare=' + (category.share * 100).toFixed(1) + '%'],
    });
  }

  const riskSignal: ReportSignal | null = riskLines.length ? {
    id: 'generic:file:risk-language',
    severity: riskCount >= 5 ? 'high' : riskCount >= 2 ? 'medium' : 'low',
    title: 'إشارات مخاطر أو استثناءات داخل المحتوى',
    message: 'رُصدت ' + riskCount + ' إشارات لغوية مرتبطة بالمخاطر أو الاستثناءات ضمن ' + lines.length + ' وحدة محتوى.',
    evidence: riskLines,
    affectedRows: riskLines.length,
    soWhat: 'هذه البنود تستحق مراجعة مباشرة وربطها بالمصدر أو الإجراء؛ لكنها ليست إثباتًا سببيًا بحد ذاتها.',
    impact: 'الأثر غير مثبت ماليًا أو تشغيليًا من المحتوى وحده.',
    ownerHint: 'المسؤول عن الموضوع المذكور في الملف',
    priority: riskCount >= 5 ? 'P1' : 'P2',
    priorityReason: ['riskTerms=' + riskCount],
  } : null;

  const actionSignal: ReportSignal | null = actionLines.length ? {
    id: 'generic:file:action-language',
    severity: riskLines.length ? 'medium' : 'low',
    title: 'لغة قرار أو إجراء داخل الملف',
    message: 'رُصدت ' + actionCount + ' إشارات مرتبطة بالإجراء أو المراجعة أو الاعتماد.',
    evidence: actionLines,
    affectedRows: actionLines.length,
    soWhat: 'يوجد محتوى يمكن تحويله إلى قائمة قرارات أو إجراءات بدل بقائه نصًا ساكنًا.',
    impact: 'لم يُثبت التنفيذ الفعلي من الملف وحده.',
    ownerHint: 'المسؤول الوظيفي المرتبط بالإجراء',
    priority: riskLines.length ? 'P2' : 'P3',
    priorityReason: ['actionTerms=' + actionCount],
  } : null;

  if (riskSignal) signals.push(riskSignal);
  if (actionSignal) signals.push(actionSignal);
  signals.push(...metricSignals);

  const keywordEvidence = keywords.map((item) => item.word + ':' + item.count).join(' · ');

  const rankedSignals = [...signals].sort((a, b) => {
    const severityRank: Record<string, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
    return (severityRank[b.severity] ?? 0) - (severityRank[a.severity] ?? 0)
      || Number(b.affectedRows ?? 0) - Number(a.affectedRows ?? 0)
      || a.title.localeCompare(b.title, 'ar');
  }).slice(0, 12);

  const primary = rankedSignals[0] ?? null;

  const genericFinding: BusinessFinding = {
    id: primary ? 'generic:file:' + primary.id : 'generic:file:content-profile',
    kind: primary && ['critical', 'high'].includes(primary.severity) ? 'RISK' : primary ? 'FINDING' : 'OPPORTUNITY',
    priority: primary && ['critical', 'high'].includes(primary.severity) ? 'high' : 'medium',
    title: primary?.title ?? 'ملخص بنية الملف',
    statement: primary?.message
      ?? 'الملف من نوع ' + format + ' ويحتوي ' + dataset.rowCount.toLocaleString('ar-YE') + ' سجلًا و' + dataset.columnCount + ' حقلًا صالحًا للفحص.',
    value: primary?.affectedRows ?? null,
    unit: primary ? 'سجلات متأثرة' : null,
    evidence: primary?.evidence ?? [...numbers.slice(0, 3), ...riskLines.slice(0, 2)],
    limitation: 'التحليل العام يثبت الأنماط الحسابية/النصية التي يمكن اشتقاقها من المصدر؛ لا يثبت السبب أو الأثر المالي المستقبلي تلقائيًا.',
    action: primary?.soWhat
      ? 'افحص الدليل المحدد أعلاه، ثم ثبّت إجراءً ومالكًا وموعدًا قبل اعتماد النتيجة.'
      : 'حدّد الغرض التجاري من الملف ثم اربط الحقول والفقرات ذات الصلة بمؤشر أو قرار.',
  };

  if (primary) {
    recommendations.push(genericRecommendation(
      primary.evidence,
      primary.message,
      primary.title.startsWith('اتجاه') ? 'فسّر الاتجاه قبل اعتماد قرار تنفيذي' : primary.title,
      primary.title.startsWith('نقص واضح')
        ? 'حدّد سبب نقص البيانات وأكمل الحقول المتأثرة ثم أعد تشغيل التحليل.'
        : primary.title.startsWith('قيم شاذة')
          ? 'راجع الصفوف الشاذة مباشرة، حدّد هل هي حالات حقيقية أم أخطاء، ثم ثبّت الإجراء.'
          : primary.title.startsWith('تركيز مرتفع')
            ? 'راجع الاعتماد/التوزيع حول البعد المتركز قبل بناء خطة على متوسط المصدر.'
            : 'راجع الدليل المحدد، ثبّت المالك والموعد، ثم أعد قياس المؤشر بعد الإجراء.',
    ));
  } else {
    recommendations.push(genericRecommendation(
      [...numbers.slice(0, 4), ...(keywordEvidence ? ['الكلمات البارزة=' + keywordEvidence] : [])],
      'لم تظهر إشارة استثنائية قوية، لكن المصدر قابل للفحص وتوجد حقائق وصفية يمكن البناء عليها.',
      'ثبّت خط أساس من هذا التقرير قبل اتخاذ القرار',
      'اعتمد المؤشرات المحسوبة من المصدر كخط أساس، ثم اختر المؤشر المرتبط بالقرار وأعد قياسه في الدورة التالية.',
    ));
  }

  const numericSummary = metrics.slice(0, 4).map((metric) => {
    const role = metricRole(metric.column);
    return metric.column.name
      + ': متوسط=' + formatMetric(metric)
      + ' · مجموع=' + metric.sum.toLocaleString('ar-YE', { maximumFractionDigits: 2 })
      + ' · أدنى=' + metric.min.toLocaleString('ar-YE', { maximumFractionDigits: 2 })
      + ' · أعلى=' + metric.max.toLocaleString('ar-YE', { maximumFractionDigits: 2 })
      + (role !== 'generic' ? ' · فئة=' + role : '');
  });

  const genericQuestion = metrics.length
    ? 'ما الذي يتغير فعليًا في بيانات هذا الملف، وأين توجد نقطة تستحق قرارًا أو متابعة؟'
    : 'ماذا يثبت هذا الملف فعليًا، وما الذي يحتاج مراجعة قبل القرار؟';

  const summary = metrics.length
    ? 'تم تحليل ' + dataset.rowCount.toLocaleString('ar-YE') + ' سجلًا و' + dataset.columnCount + ' حقلًا، مع استخراج ' + metrics.length + ' مؤشرات رقمية قابلة للحساب، ثم اختبار الاتجاه والقيم الشاذة ونقص البيانات والتركيز.'
    : 'تم فحص ' + lines.length.toLocaleString('ar-YE') + ' وحدة محتوى من ' + format + ' واستخراج الإشارات النصية والأرقام والتواريخ وحدود الإثبات.';

  return {
    ...base,
    businessQuestion: genericQuestion,
    summary,
    signals: rankedSignals,
    recommendations: recommendations.slice(0, 6),
    findings: [genericFinding, ...base.findings],
    risks: primary && ['critical', 'high'].includes(primary.severity) ? [genericFinding, ...base.risks] : base.risks,
    opportunities: !primary ? [genericFinding, ...base.opportunities] : base.opportunities,
    guidance: {
      ...base.guidance,
      focus: primary?.title ?? 'خط الأساس والحقائق القابلة للحساب',
      inspect: [
        ...numericSummary,
        ...rankedSignals.slice(0, 4).map((signal) => signal.message),
        ...numbers.slice(0, 2),
        ...(keywordEvidence ? ['الكلمات البارزة: ' + keywordEvidence] : []),
      ].slice(0, 10),
      boundary: 'التحليل العام يثبت ما يمكن حسابه أو اقتباسه من المصدر. لا يحوّل الارتباط إلى سبب، ولا يخترع benchmark أو خسارة أو نتيجة مستقبلية.',
    },
    advisorBrief: {
      health: primary && ['critical', 'high'].includes(primary.severity) ? 'REVIEW_REQUIRED' : primary ? 'ATTENTION' : 'HEALTHY',
      headline: primary?.message ?? ('المصدر صالح لبناء خط أساس من ' + dataset.rowCount.toLocaleString('ar-YE') + ' سجلًا و' + metrics.length + ' مؤشرات رقمية.'),
      topFinding: genericFinding,
      topRisk: primary && ['critical', 'high'].includes(primary.severity) ? genericFinding : null,
      topOpportunity: !primary ? genericFinding : null,
      recommendedAction: recommendations[0]?.action ?? null,
      ownerHint: recommendations[0]?.ownerHint ?? 'المسؤول التشغيلي المناسب للمصدر',
      expectedOutcome: recommendations[0]?.expectedOutcome ?? 'خط أساس ومؤشر متابعة واضحان من نفس المصدر.',
      measurement: recommendations[0]?.measurement ?? 'أعد القياس على نفس الحقل بعد الإجراء.',
      proofRequirement: 'كل نتيجة هنا مرتبطة مباشرة بصفوف/حقول هذا المصدر؛ لا يُسمى الاتجاه سببًا ولا الرقم أثرًا مستقبليًا دون دليل إضافي.',
    },
  };
}
