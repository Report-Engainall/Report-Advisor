import { deriveReportIntelligence, type ReportIntelligence, type BusinessFinding, type ReportSignal, type ReportRecommendation } from './report-smart-insights';

type RuleProfile = {
  id: string;
  number: number;
  title: string;
  adapterSpecialty: string;
  requiredFields: string[];
  capabilities: string[];
  recommendationFocus: string[];
};

type RuleReport = Parameters<typeof deriveReportIntelligence>[0];

function text(value: unknown): string {
  return String(value ?? '').trim();
}

function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = text(value).replace(/,/g, '');
  if (!raw) return null;
  const valueNum = Number(raw);
  return Number.isFinite(valueNum) ? valueNum : null;
}

function norm(value: unknown): string {
  return text(value).toLowerCase().normalize('NFKC').replace(/[\s_\-./]+/g, '');
}

function columnKey(report: RuleReport, field: string): string | null {
  const datasets = Array.isArray(report.sourceAnalysis?.datasets) ? report.sourceAnalysis.datasets : [];
  for (const dataset of datasets) {
    if (!dataset || typeof dataset !== 'object') continue;
    const columns = Array.isArray((dataset as Record<string, unknown>).columns)
      ? (dataset as Record<string, unknown>).columns as Array<Record<string, unknown>>
      : [];
    const found = columns.find((column) => norm(column.mappedField) === norm(field));
    if (found) return text(found.mappedField ?? found.name);
  }
  return null;
}

function rowsOf(report: RuleReport): Array<{ data?: Record<string, unknown> | null }> {
  return report.canonicalRows ?? [];
}

function sumBy(rows: Array<{ data?: Record<string, unknown> | null }>, key: string): number {
  return rows.reduce((total, row) => total + (num(row.data?.[key]) ?? 0), 0);
}

function groupTop(rows: Array<{ data?: Record<string, unknown> | null }>, dimensionKey: string, valueKey: string) {
  const groups = new Map<string, number>();
  for (const row of rows) {
    const dimension = text(row.data?.[dimensionKey]) || 'غير محدد';
    const value = num(row.data?.[valueKey]);
    if (value == null) continue;
    groups.set(dimension, (groups.get(dimension) ?? 0) + value);
  }
  return [...groups.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0] ?? null;
}

function dateValue(rows: Array<{ data?: Record<string, unknown> | null }>, dateKey: string, valueKey: string) {
  const monthly = new Map<string, number>();
  for (const row of rows) {
    const raw = text(row.data?.[dateKey]);
    const value = num(row.data?.[valueKey]);
    const parsed = raw ? new Date(raw) : null;
    if (!parsed || Number.isNaN(parsed.getTime()) || value == null) continue;
    const month = parsed.getUTCFullYear() + '-' + String(parsed.getUTCMonth() + 1).padStart(2, '0');
    monthly.set(month, (monthly.get(month) ?? 0) + value);
  }
  const points = [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (points.length < 2) return null;
  const previous = points[points.length - 2];
  const latest = points[points.length - 1];
  const delta = latest[1] - previous[1];
  const pct = previous[1] === 0 ? null : (delta / Math.abs(previous[1])) * 100;
  return { previous, latest, delta, pct };
}

function primaryDimension(profile: RuleProfile): string | null {
  const candidates = [
    ['customerCode', 'customer'],
    ['supplierCode', 'supplier'],
    ['productCode', 'product'],
    ['category', 'category'],
    ['brand', 'brand'],
    ['warehouse', 'warehouse'],
    ['salesRep', 'salesrep'],
    ['accountCode', 'account'],
  ] as const;
  for (const [field, label] of candidates) {
    if (profile.requiredFields.includes(field) || profile.capabilities.some((cap) => norm(cap).includes(norm(label)))) return field;
  }
  return null;
}

function addModelFinding(
  intelligence: ReportIntelligence,
  profile: RuleProfile,
  finding: BusinessFinding,
): ReportIntelligence {
  const findings = [finding, ...intelligence.findings.filter((item) => item.id !== finding.id)].slice(0, 8);
  return {
    ...intelligence,
    findings,
    advisorBrief: {
      ...intelligence.advisorBrief,
      topFinding: findings[0] ?? null,
      recommendedAction: findings[0]?.action ?? intelligence.advisorBrief.recommendedAction,
      headline: findings[0]?.statement ?? intelligence.advisorBrief.headline,
      ownerHint: intelligence.advisorBrief.ownerHint,
      expectedOutcome: findings[0] ? 'تحويل هذه النتيجة إلى قرار/إجراء قابل للقياس بعد المراجعة.' : intelligence.advisorBrief.expectedOutcome,
      measurement: findings[0] ? 'إعادة قياس المؤشر نفسه بعد الإجراء مع الحفاظ على source/job/evidence lineage.' : intelligence.advisorBrief.measurement,
      proofRequirement: intelligence.advisorBrief.proofRequirement,
    },
  };
}

function addModelRecommendation(intelligence: ReportIntelligence, profile: RuleProfile, finding: BusinessFinding): ReportIntelligence {
  const recommendation: ReportRecommendation = {
    id: 'rec:archetype:' + profile.id,
    status: 'PROPOSED',
    priority: finding.priority === 'high' ? 'high' : 'medium',
    title: 'مراجعة: ' + profile.title,
    action: finding.action || profile.recommendationFocus[0] || 'راجع النتيجة مع الدليل قبل اتخاذ القرار.',
    why: finding.statement,
    evidence: finding.evidence,
  };
  return {
    ...intelligence,
    recommendations: [
      recommendation,
      ...intelligence.recommendations.filter((item) => item.id !== recommendation.id),
    ].slice(0, 8),
  };
}

export function applyArchetypeRuleSet(
  profile: RuleProfile,
  report: RuleReport,
  base: ReportIntelligence,
): ReportIntelligence {
  const rows = rowsOf(report);
  if (!rows.length) return base;

  let intelligence = base;
  const required = new Set((profile.capabilities ?? []).map(norm));
  const has = (field: string) => Boolean(columnKey(report, field));

  const dateKey = columnKey(report, 'documentDate');
  const amountKey = columnKey(report, 'netAmount') ?? columnKey(report, 'grossAmount') ?? columnKey(report, 'targetAmount');
  const qtyKey = columnKey(report, 'quantity') ?? columnKey(report, 'salesQty');
  const dimensionKey = primaryDimension(profile);

  let modelFinding: BusinessFinding | null = null;

  if (required.has('trend') || required.has('growth') || required.has('periodcomparison') || required.has('continuity') || required.has('seasonality')) {
    if (dateKey && amountKey) {
      const trend = dateValue(rows, dateKey, amountKey);
      if (trend) {
        const pctText = trend.pct == null ? 'غير متاح كنسبة لأن الفترة السابقة تساوي صفرًا.' : ' بنسبة ' + trend.pct.toFixed(1) + '%';
        modelFinding = {
          id: 'archetype:' + profile.id + ':trend',
          kind: 'FINDING',
          priority: trend.pct != null && Math.abs(trend.pct) >= 20 ? 'high' : 'medium',
          title: profile.title + ' — التغير الزمني',
          statement: 'تحولت القيمة المحسوبة من ' + trend.previous[1].toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + ' إلى ' + trend.latest[1].toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + pctText + '.',
          value: trend.delta,
          unit: 'فرق الفترة',
          dimensionLabel: 'الفترة',
          dimensionValue: trend.latest[0],
          evidence: ['dateField=' + dateKey, 'valueField=' + amountKey, 'previousPeriod=' + trend.previous[0], 'latestPeriod=' + trend.latest[0]],
          limitation: 'هذا تفكيك وصفي للفترة ولا يثبت السبب أو الاستدامة.',
          action: profile.recommendationFocus[0] || 'راجع المحركات التي غيّرت النتيجة قبل اعتماد قرار.',
        };
      }
    }
  }

  if (!modelFinding && (required.has('concentration') || required.has('customervalue') || required.has('supplierdependency') || required.has('topsuppliershare') || required.has('productconcentration') || required.has('portfolio'))) {
    if (dimensionKey && amountKey) {
      const top = groupTop(rows, dimensionKey, amountKey);
      const total = sumBy(rows, amountKey);
      if (top && total !== 0) {
        const share = Math.abs(top[1] / total) * 100;
        const label = dimensionKey === 'customerCode' ? 'العميل' : dimensionKey === 'supplierCode' ? 'المورد' : dimensionKey === 'productCode' ? 'الصنف' : dimensionKey === 'salesRep' ? 'المندوب' : dimensionKey === 'accountCode' ? 'الحساب' : 'البعد';
        modelFinding = {
          id: 'archetype:' + profile.id + ':concentration',
          kind: share >= 50 ? 'RISK' : 'FINDING',
          priority: share >= 50 ? 'high' : 'medium',
          title: profile.title + ' — التركّز',
          statement: label + ' "' + top[0] + '" يمثل ' + share.toFixed(1) + '% من القيمة المحسوبة في هذا المصدر.',
          value: top[1],
          unit: 'قيمة المصدر',
          dimensionLabel: label,
          dimensionValue: top[0],
          evidence: ['dimensionField=' + dimensionKey, 'valueField=' + amountKey, 'dimensionValue=' + top[0], 'share=' + share.toFixed(2) + '%', 'sourceTotal=' + total.toFixed(2)],
          limitation: 'التركيز حساب وصفي؛ لا يعني وحده خطرًا أو اعتمادًا غير مقبول.',
          action: profile.recommendationFocus[0] || 'راجع البعد الأعلى تركّزًا ثم افحص السجلات المصدرية.',
        };
      }
    }
  }

  if (!modelFinding && (required.has('price') || required.has('pricevariance') || required.has('sellingprice') || required.has('marginimpactwhencostexists'))) {
    const priceKey = columnKey(report, 'unitPrice') ?? columnKey(report, 'sellingPrice') ?? columnKey(report, 'cost');
    if (priceKey) {
      const values = rows.map((row) => num(row.data?.[priceKey])).filter((value): value is number => value != null);
      if (values.length) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const spread = avg === 0 ? null : ((max - min) / Math.abs(avg)) * 100;
        modelFinding = {
          id: 'archetype:' + profile.id + ':price',
          kind: spread != null && spread >= 25 ? 'RISK' : 'FINDING',
          priority: spread != null && spread >= 25 ? 'high' : 'medium',
          title: profile.title + ' — تشتت السعر/التكلفة',
          statement: 'القيمة تتراوح بين ' + min.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + ' و' + max.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + ' بمتوسط ' + avg.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + (spread == null ? '.' : '، وتشتتها النسبي التقريبي ' + spread.toFixed(1) + '%.'),
          value: spread,
          unit: '% spread',
          evidence: ['priceField=' + priceKey, 'usableRows=' + values.length, 'min=' + min.toFixed(2), 'max=' + max.toFixed(2)],
          limitation: 'التشتت لا يثبت خطأ تسعيريًا دون تحديد السياق والوحدة والمخزن والتاريخ.',
          action: profile.recommendationFocus[0] || 'افحص اختلافات السعر حسب السياق قبل اتخاذ قرار سعري.',
        };
      }
    }
  }

  if (!modelFinding && (required.has('stockout risk') || required.has('coveragerisk') || required.has('days-weeks-cover') || required.has('stockout-risk') || required.has('stock-linkage') || required.has('coverage'))) {
    const stockKey = columnKey(report, 'currentStock');
    const salesKey = columnKey(report, 'salesQty') ?? columnKey(report, 'quantity');
    if (stockKey && salesKey) {
      const stock = sumBy(rows, stockKey);
      const demand = sumBy(rows, salesKey);
      const ratio = demand === 0 ? null : stock / Math.abs(demand);
      modelFinding = {
        id: 'archetype:' + profile.id + ':coverage',
        kind: ratio != null && ratio < 1 ? 'RISK' : 'FINDING',
        priority: ratio != null && ratio < 1 ? 'high' : 'medium',
        title: profile.title + ' — تغطية المصدر',
        statement: ratio == null ? 'تعذر حساب نسبة تغطية وصفية من الرصيد والطلب المتاحين.' : 'الرصيد الحالي يعادل ' + ratio.toFixed(2) + ' من كمية الطلب/المبيعات المستخدمة كمرجع في المصدر.',
        value: ratio,
        unit: 'stock-to-demand ratio',
        evidence: ['stockField=' + stockKey, 'demandField=' + salesKey, 'stock=' + stock.toFixed(2), 'demand=' + demand.toFixed(2)],
        limitation: 'هذه نسبة كمية وصفية وليست أيام تغطية؛ أيام التغطية تحتاج فترة زمنية وتعريفًا للطلب.',
        action: profile.recommendationFocus[0] || 'راجع المخزون مقابل الطلب قبل قرار إعادة الطلب.',
      };
    }
  }

  if (!modelFinding && (required.has('return-rate') || required.has('returns') || required.has('returnrate'))) {
    const returnKey = columnKey(report, 'returnQty');
    const baseQtyKey = columnKey(report, 'quantity') ?? columnKey(report, 'salesQty');
    if (returnKey && baseQtyKey) {
      const returned = sumBy(rows, returnKey);
      const baseQty = sumBy(rows, baseQtyKey);
      const rate = baseQty === 0 ? null : (returned / Math.abs(baseQty)) * 100;
      modelFinding = {
        id: 'archetype:' + profile.id + ':returns',
        kind: rate != null && rate >= 10 ? 'RISK' : 'FINDING',
        priority: rate != null && rate >= 10 ? 'high' : 'medium',
        title: profile.title + ' — معدل المرتجعات',
        statement: rate == null ? 'تعذر حساب معدل المرتجعات من الحقول المتاحة.' : 'المرتجعات تمثل ' + rate.toFixed(1) + '% من الكمية المرجعية المحسوبة.',
        value: rate,
        unit: '% return rate',
        evidence: ['returnField=' + returnKey, 'baseQuantityField=' + baseQtyKey, 'returned=' + returned.toFixed(2), 'baseQuantity=' + baseQty.toFixed(2)],
        limitation: 'المعدل وصفي؛ لا يحدد سبب المرتجع أو مسؤوليته دون دليل إضافي.',
        action: profile.recommendationFocus[0] || 'حدد الأصناف والعملاء الأكثر مساهمة في المرتجعات قبل الإجراء.',
      };
    }
  }

  if (!modelFinding && (required.has('discount-distribution') || required.has('discounts'))) {
    const discountKey = columnKey(report, 'discount');
    if (discountKey) {
      const totalDiscount = sumBy(rows, discountKey);
      modelFinding = {
        id: 'archetype:' + profile.id + ':discount',
        kind: 'FINDING',
        priority: 'medium',
        title: profile.title + ' — قيمة الخصومات',
        statement: 'إجمالي الخصومات المحسوب من المصدر هو ' + totalDiscount.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '.',
        value: totalDiscount,
        unit: 'عملة المصدر',
        evidence: ['discountField=' + discountKey, 'rows=' + rows.length],
        limitation: 'لا يحدد الإجمالي وحده ما إذا كان الخصم صحيحًا أو مؤثرًا على الهامش.',
        action: profile.recommendationFocus[0] || 'حلل الخصومات حسب العميل/الصنف والسياق قبل اعتماد قرار.',
      };
    }
  }

  if (!modelFinding && (required.has('gap') || required.has('pace') || required.has('targetactual') || profile.id === 'sales.target-vs-actual')) {
    const targetKey = columnKey(report, 'targetAmount');
    const actualKey = columnKey(report, 'netAmount') ?? columnKey(report, 'grossAmount');
    if (targetKey && actualKey) {
      const target = sumBy(rows, targetKey);
      const actual = sumBy(rows, actualKey);
      const gap = actual - target;
      modelFinding = {
        id: 'archetype:' + profile.id + ':target-gap',
        kind: gap < 0 ? 'RISK' : 'FINDING',
        priority: gap < 0 ? 'high' : 'medium',
        title: profile.title + ' — الفجوة',
        statement: 'الفعلي المحسوب ' + actual.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + ' مقابل مستهدف ' + target.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '؛ الفجوة ' + gap.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '.',
        value: gap,
        unit: 'actual-target',
        evidence: ['actualField=' + actualKey, 'targetField=' + targetKey],
        limitation: 'المقارنة لا تفسر سبب الفجوة.',
        action: profile.recommendationFocus[0] || 'حلل المساهمين في الفجوة ثم صحح المسار.',
      };
    }
  }

  if (!modelFinding && (required.has('delivery') || required.has('lead-time') || required.has('leadtime'))) {
    const leadKey = columnKey(report, 'leadTimeDays');
    if (leadKey) {
      const values = rows.map((row) => num(row.data?.[leadKey])).filter((value): value is number => value != null);
      if (values.length) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const max = Math.max(...values);
        modelFinding = {
          id: 'archetype:' + profile.id + ':lead-time',
          kind: max >= 30 ? 'RISK' : 'FINDING',
          priority: max >= 30 ? 'high' : 'medium',
          title: profile.title + ' — مدة التوريد',
          statement: 'متوسط مدة التوريد ' + avg.toFixed(1) + ' يوم، وأعلى مدة مرصودة ' + max.toFixed(1) + ' يوم.',
          value: avg,
          unit: 'days',
          evidence: ['leadTimeField=' + leadKey, 'usableRows=' + values.length, 'max=' + max.toFixed(2)],
          limitation: 'لا تقارن المدة وحدها بمستوى الخدمة دون تحديد معيار تعاقدي.',
          action: profile.recommendationFocus[0] || 'راجع الموردين ذوي مدد التوريد الأعلى قبل قرار شراء.',
        };
      }
    }
  }

  if (!modelFinding && (required.has('aging-buckets') || required.has('overdue-exposure') || required.has('collection-queue') || required.has('due-schedule') || required.has('obligations'))) {
    const dueKey = columnKey(report, 'dueDate');
    const valueKey = columnKey(report, 'netAmount') ?? columnKey(report, 'balance');
    if (dueKey && valueKey) {
      const parsed = rows.map((row) => {
        const due = new Date(text(row.data?.[dueKey]));
        const value = num(row.data?.[valueKey]);
        return !Number.isNaN(due.getTime()) && value != null ? { due, value } : null;
      }).filter((item): item is { due: Date; value: number } => Boolean(item));
      if (parsed.length) {
        const asOf = parsed.reduce((latest, item) => item.due > latest ? item.due : latest, parsed[0].due);
        const overdue = parsed.filter((item) => item.due < asOf);
        const overdueValue = overdue.reduce((total, item) => total + item.value, 0);
        modelFinding = {
          id: 'archetype:' + profile.id + ':aging',
          kind: overdue.length ? 'RISK' : 'FINDING',
          priority: overdue.length ? 'high' : 'medium',
          title: profile.title + ' — استحقاقات حسب آخر تاريخ في المصدر',
          statement: 'حتى آخر تاريخ استحقاق ظاهر في المصدر، يوجد ' + overdue.length + ' سجلًا أقدم بقيمة ' + overdueValue.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '.',
          value: overdueValue,
          unit: 'عملة المصدر',
          evidence: ['dueDateField=' + dueKey, 'valueField=' + valueKey, 'asOf=' + asOf.toISOString().slice(0,10), 'overdueRows=' + overdue.length],
          limitation: 'المرجع الزمني هنا هو أحدث تاريخ ظاهر في المصدر، وليس تاريخ اليوم؛ لا يثبت التعثر.',
          action: profile.recommendationFocus[0] || 'رتّب الاستحقاقات المتأخرة ثم راجع الحسابات/الموردين الأصلية.',
        };
      }
    }
  }

  if (!modelFinding && (required.has('cash-position') || required.has('inflows-outflows') || required.has('liquidity-gap') || required.has('obligations-vs-collections'))) {
    const debitKey = columnKey(report, 'debit');
    const creditKey = columnKey(report, 'credit');
    const netKey = columnKey(report, 'netAmount');
    const inflow = creditKey ? sumBy(rows, creditKey) : netKey ? Math.max(0, sumBy(rows, netKey)) : 0;
    const outflow = debitKey ? sumBy(rows, debitKey) : netKey ? Math.abs(Math.min(0, sumBy(rows, netKey))) : 0;
    if (debitKey || creditKey || netKey) {
      const net = inflow - outflow;
      modelFinding = {
        id: 'archetype:' + profile.id + ':cashflow',
        kind: net < 0 ? 'RISK' : 'FINDING',
        priority: net < 0 ? 'high' : 'medium',
        title: profile.title + ' — صافي الحركة',
        statement: 'التدفقات الداخلة المحسوبة ' + inflow.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '، والخارجة ' + outflow.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '، والصافي ' + net.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '.',
        value: net,
        unit: 'عملة المصدر',
        evidence: ['inflow=' + inflow.toFixed(2), 'outflow=' + outflow.toFixed(2), 'net=' + net.toFixed(2)],
        limitation: 'التصنيف داخلي على حقول المصدر؛ لا يثبت التدفق النقدي المحاسبي دون تعريف نوع الحركة.',
        action: profile.recommendationFocus[0] || 'راجع مصادر التدفق الداخلة والخارجة قبل قرار السيولة.',
      };
    }
  }

  if (!modelFinding && (required.has('assets-liabilities-equity-when-present') || required.has('assetsliabilitiesequitywhenpresent') || profile.id === 'finance.balance-sheet')) {
    const assetKey = columnKey(report, 'asset');
    const liabilityKey = columnKey(report, 'liability');
    const equityKey = columnKey(report, 'equity');
    if (assetKey || liabilityKey || equityKey) {
      const assets = assetKey ? sumBy(rows, assetKey) : null;
      const liabilities = liabilityKey ? sumBy(rows, liabilityKey) : null;
      const equity = equityKey ? sumBy(rows, equityKey) : null;
      modelFinding = {
        id: 'archetype:' + profile.id + ':balance-sheet',
        kind: 'FINDING',
        priority: 'high',
        title: profile.title + ' — المراكز المتاحة',
        statement: 'الأصول ' + (assets == null ? 'غير متاحة' : assets.toLocaleString('ar-YE', { maximumFractionDigits: 2 })) + '، الخصوم ' + (liabilities == null ? 'غير متاحة' : liabilities.toLocaleString('ar-YE', { maximumFractionDigits: 2 })) + '، وحقوق الملكية ' + (equity == null ? 'غير متاحة' : equity.toLocaleString('ar-YE', { maximumFractionDigits: 2 })) + '.',
        value: assets,
        unit: 'عملة المصدر',
        evidence: ['assetField=' + (assetKey ?? 'missing'), 'liabilityField=' + (liabilityKey ?? 'missing'), 'equityField=' + (equityKey ?? 'missing')],
        limitation: 'هذه مجاميع الحقول الموجودة فقط ولا تعني ميزانًا محاسبيًا متوازنًا ما لم تُستوفَ الحسابات.',
        action: profile.recommendationFocus[0] || 'راجع حسابات المركز المالي ومطابقتها قبل أي قرار.',
      };
    }
  }

  if (!modelFinding && (required.has('account-movement') || required.has('unusual-entries') || required.has('reconciliation-audit'))) {
    const accountKey = columnKey(report, 'accountCode') ?? columnKey(report, 'accountName');
    const valueKey = columnKey(report, 'netAmount') ?? columnKey(report, 'debit') ?? columnKey(report, 'credit');
    if (accountKey && valueKey) {
      const top = groupTop(rows, accountKey, valueKey);
      const total = sumBy(rows, valueKey);
      if (top) {
        modelFinding = {
          id: 'archetype:' + profile.id + ':account',
          kind: 'FINDING',
          priority: 'medium',
          title: profile.title + ' — الحساب الأعلى حركة',
          statement: 'الحساب "' + top[0] + '" يحمل أعلى حركة محسوبة بقيمة ' + top[1].toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + (total === 0 ? '.' : ' من إجمالي محسوب ' + total.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '.'),
          value: top[1],
          unit: 'عملة المصدر',
          dimensionLabel: 'الحساب',
          dimensionValue: top[0],
          evidence: ['accountField=' + accountKey, 'valueField=' + valueKey],
          limitation: 'الحركة الأعلى لا تعني شذوذًا أو خطأ دون معيار مقارنة.',
          action: profile.recommendationFocus[0] || 'افحص القيود الأعلى حركة وطابقها مع المستندات.',
        };
      }
    }
  }

  if (!modelFinding && (required.has('source-destination-flow') || required.has('transfer-optimization'))) {
    const fromKey = columnKey(report, 'fromWarehouse');
    const toKey = columnKey(report, 'toWarehouse');
    const valueKey = columnKey(report, 'quantity') ?? columnKey(report, 'salesQty');
    if (fromKey && toKey && valueKey) {
      const transferGroups = new Map<string, number>();
      for (const row of rows) {
        const from = text(row.data?.[fromKey]) || 'غير محدد';
        const to = text(row.data?.[toKey]) || 'غير محدد';
        const value = num(row.data?.[valueKey]);
        if (value != null) transferGroups.set(from + ' → ' + to, (transferGroups.get(from + ' → ' + to) ?? 0) + value);
      }
      const top = [...transferGroups.entries()].sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0];
      if (top) {
        modelFinding = {
          id: 'archetype:' + profile.id + ':transfer',
          kind: 'FINDING',
          priority: 'medium',
          title: profile.title + ' — مسار التحويل الأعلى',
          statement: 'أعلى مسار تحويل هو "' + top[0] + '" بقيمة كمية ' + top[1].toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '.',
          value: top[1],
          unit: 'كمية',
          evidence: ['fromWarehouse=' + fromKey, 'toWarehouse=' + toKey, 'quantityField=' + valueKey],
          limitation: 'الحجم الأعلى لا يثبت أن التحويل غير كفؤ دون احتياج وتوقيت ومخزون الموقعين.',
          action: profile.recommendationFocus[0] || 'راجع مسار التحويل مقابل اختلال المخزون قبل التنفيذ.',
        };
      }
    }
  }

  if (!modelFinding && required.has('mix') && dimensionKey && amountKey) {
    const top = groupTop(rows, dimensionKey, amountKey);
    if (top) {
      modelFinding = {
        id: 'archetype:' + profile.id + ':mix',
        kind: 'FINDING',
        priority: 'medium',
        title: profile.title + ' — أعلى مكوّن في المزيج',
        statement: 'المكوّن "' + top[0] + '" يحمل أكبر قيمة محسوبة في المزيج.',
        value: top[1],
        unit: 'قيمة المصدر',
        dimensionValue: top[0],
        evidence: ['dimensionField=' + dimensionKey, 'valueField=' + amountKey],
        limitation: 'هذا ترتيب وصفي ولا يثبت سبب المزيج أو جودة مكوّن بعينه.',
        action: profile.recommendationFocus[0] || 'راجع المكونات الأعلى أثرًا قبل القرار.',
      };
    }
  }

  if (!modelFinding && has('requestedQty') && has('fulfilledQty')) {
    const requestedKey = columnKey(report, 'requestedQty')!;
    const fulfilledKey = columnKey(report, 'fulfilledQty')!;
    const requested = sumBy(rows, requestedKey);
    const fulfilled = sumBy(rows, fulfilledKey);
    const rate = requested === 0 ? null : (fulfilled / Math.abs(requested)) * 100;
    modelFinding = {
      id: 'archetype:' + profile.id + ':fulfillment',
      kind: rate != null && rate < 80 ? 'RISK' : 'FINDING',
      priority: rate != null && rate < 80 ? 'high' : 'medium',
      title: profile.title + ' — نسبة تلبية الطلب',
      statement: rate == null ? 'تعذر حساب نسبة التلبية.' : 'تم تلبية ' + rate.toFixed(1) + '% من الكمية المطلوبة ضمن السجلات المتاحة.',
      value: rate,
      unit: '% fulfillment',
      evidence: ['requestedField=' + requestedKey, 'fulfilledField=' + fulfilledKey],
      limitation: 'لا يثبت سبب عدم التلبية أو الخلل التشغيلي.',
      action: profile.recommendationFocus[0] || 'افحص الطلبات غير الملباة وأسبابها قبل الإجراء.',
    };
  }

  if (!modelFinding && profile.requiredFields.every((field) => has(field))) {
    const numericField = profile.requiredFields.find((field) => ['netAmount','grossAmount','unitPrice','sellingPrice','cost','quantity','salesQty','purchaseQty','currentStock','discount','paidAmount','targetAmount','dueDate','leadTimeDays','debit','credit','asset','liability','equity','profit'].includes(field) && has(field));
    const dimensionField = primaryDimension(profile);
    if (numericField) {
      const key = columnKey(report, numericField);
      if (key) {
        const total = sumBy(rows, key);
        modelFinding = {
          id: 'archetype:' + profile.id + ':primary',
          kind: 'FINDING',
          priority: 'medium',
          title: profile.title + ' — نتيجة النموذج',
          statement: 'النموذج قرأ ' + rows.length + ' سجلًا؛ مجموع ' + numericField + ' في الحقول المتاحة هو ' + total.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '.',
          value: total,
          unit: 'قيمة المصدر',
          dimensionLabel: dimensionField ? dimensionField : null,
          dimensionValue: dimensionField && rows[0] ? text(rows[0].data?.[dimensionField]) || null : null,
          evidence: ['archetypeId=' + profile.id, 'requiredFields=' + profile.requiredFields.join(','), 'primaryMeasure=' + key, 'rowCount=' + rows.length],
          limitation: 'هذه قراءة أساسية مرتبطة بالنموذج؛ لا تتجاوز دلالة الحقول المتاحة ولا تثبت السبب.',
          action: profile.recommendationFocus[0] || 'راجع النتيجة مع الدليل قبل اعتماد القرار.',
        };
      }
    } else {
      const dimensionField = profile.requiredFields.find((field) => has(field) && ['customerCode','supplierCode','productCode','category','brand','warehouse','salesRep','accountCode'].includes(field));
      const key = dimensionField ? columnKey(report, dimensionField) : null;
      if (key) {
        const unique = new Set(rows.map((row) => text(row.data?.[key])).filter(Boolean)).size;
        modelFinding = {
          id: 'archetype:' + profile.id + ':primary',
          kind: 'FINDING',
          priority: 'medium',
          title: profile.title + ' — تغطية الكيان',
          statement: 'النموذج قرأ ' + rows.length + ' سجلًا ويغطي ' + unique + ' قيمة فريدة في ' + dimensionField + '.',
          value: unique,
          unit: 'unique entities',
          evidence: ['archetypeId=' + profile.id, 'dimensionField=' + key, 'uniqueEntities=' + unique],
          limitation: 'عدد الكيانات وحده لا يثبت جودة الأداء أو السببية.',
          action: profile.recommendationFocus[0] || 'راجع الكيانات الأعلى أثرًا مع الدليل قبل القرار.',
        };
      }
    }
  }

  if (!modelFinding && has('customerCode') && has('productCode') && profile.capabilities.some((cap) => norm(cap).includes('customerproduct') || norm(cap).includes('mix'))) {
    const customerKey = columnKey(report, 'customerCode')!;
    const productKey = columnKey(report, 'productCode')!;
    const pairs = new Map<string, number>();
    for (const row of rows) {
      const pair = text(row.data?.[customerKey]) + ' × ' + text(row.data?.[productKey]);
      if (pair.trim() !== '×') pairs.set(pair, (pairs.get(pair) ?? 0) + 1);
    }
    const top = [...pairs.entries()].sort((a,b)=>b[1]-a[1])[0];
    if (top) {
      modelFinding = {
        id: 'archetype:' + profile.id + ':customer-product',
        kind: 'FINDING',
        priority: 'medium',
        title: profile.title + ' — العلاقة الأعلى تكرارًا',
        statement: 'العلاقة "' + top[0] + '" ظهرت في ' + top[1] + ' سجلًا داخل المصدر.',
        value: top[1],
        unit: 'rows',
        evidence: ['customerField=' + customerKey, 'productField=' + productKey, 'pairCount=' + top[1]],
        limitation: 'تكرار العلاقة لا يثبت فرصة بيع إضافية دون قياس السلة والقيمة.',
        action: profile.recommendationFocus[0] || 'راجع العلاقة الأعلى تكرارًا مع قيمة المبيعات والوتيرة.',
      };
    }
  }

  if (!modelFinding) return intelligence;

  intelligence = addModelFinding(intelligence, profile, modelFinding);
  intelligence = addModelRecommendation(intelligence, profile, modelFinding);

  const modelSignal: ReportSignal = {
    id: 'model:' + profile.id,
    severity: modelFinding.kind === 'RISK' ? (modelFinding.priority === 'high' ? 'high' : 'medium') : 'info',
    title: 'النموذج ' + String(profile.number).padStart(2, '0') + ' قُرئ من المصدر',
    message: modelFinding.statement,
    evidence: modelFinding.evidence,
  };

  return {
    ...intelligence,
    signals: [modelSignal, ...intelligence.signals.filter((signal) => signal.id !== modelSignal.id)].slice(0, 20),
  };
}
