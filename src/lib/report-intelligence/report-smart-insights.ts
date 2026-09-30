export type ReportSignalSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ReportSignal = {
  id: string;
  severity: ReportSignalSeverity;
  title: string;
  message: string;
  evidence: string[];
  affectedRows?: number;
};

export type ReportRecommendation = {
  id: string;
  status: 'PROPOSED';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  action: string;
  why: string;
  evidence: string[];
};

export type ReportForecast = {
  status: 'AVAILABLE' | 'INSUFFICIENT_SAMPLE';
  metric: string | null;
  method: string;
  observedPeriods: number;
  nextPeriod: string | null;
  nextValue: number | null;
  direction: 'up' | 'down' | 'flat' | null;
  note: string;
};

export type ReportGuidance = {
  focus: string;
  inspect: string[];
  ownerHint: string;
  boundary: string;
};

export type ReportIntelligence = {
  summary: string;
  signals: ReportSignal[];
  recommendations: ReportRecommendation[];
  forecast: ReportForecast;
  guidance: ReportGuidance;
};

type ReportInput = {
  specialty?: string | null;
  rowCount?: number | null;
  sourceAnalysis?: { datasets?: unknown[] } | null;
  renderedOutput?: Record<string, unknown>;
  canonicalRows?: Array<{ row_number?: number; data?: Record<string, unknown> | null }>;
};

function text(value: unknown): string { return String(value ?? '').trim(); }
function normalized(value: unknown): string { return text(value).toLowerCase().normalize('NFKC').replace(/[\s_\-./]+/g, ''); }
function numeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = text(value).replace(/,/g, '');
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function columnsOf(report: ReportInput): Array<Record<string, unknown>> {
  const dataset = report.sourceAnalysis?.datasets?.[0];
  if (!dataset || typeof dataset !== 'object') return [];
  const columns = (dataset as Record<string, unknown>).columns;
  return Array.isArray(columns) ? columns.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
}

function findColumn(columns: Array<Record<string, unknown>>, aliases: string[]): Record<string, unknown> | null {
  return columns.find((column) => {
    const key = normalized(column.mappedField ?? column.name);
    return aliases.some((alias) => key.includes(normalized(alias)));
  }) ?? null;
}

function makePriority(severity: ReportSignalSeverity): ReportRecommendation['priority'] {
  if (severity === 'critical') return 'urgent';
  if (severity === 'high') return 'high';
  if (severity === 'medium') return 'medium';
  return 'low';
}

function addSignal(signals: ReportSignal[], id: string, severity: ReportSignalSeverity, title: string, message: string, evidence: string[], affectedRows?: number): void {
  if (signals.some((item) => item.id === id)) return;
  signals.push({ id, severity, title, message, evidence, ...(affectedRows == null ? {} : { affectedRows }) });
}

function deriveSignals(report: ReportInput): ReportSignal[] {
  const signals: ReportSignal[] = [];
  const columns = columnsOf(report);
  const rows = report.canonicalRows ?? [];
  const renderedMetrics = report.renderedOutput?.sourceMetrics;
  const sourceMetrics = renderedMetrics && typeof renderedMetrics === 'object' ? renderedMetrics as Record<string, unknown> : {};
  const inventory = sourceMetrics.inventory && typeof sourceMetrics.inventory === 'object' ? sourceMetrics.inventory as Record<string, unknown> : {};
  const total = numeric(report.rowCount);

  for (const column of columns) {
    const nullCount = numeric(column.nullCount);
    if (nullCount != null && total != null && total > 0 && nullCount / total >= 0.2) {
      addSignal(
        signals,
        'missing:' + text(column.name ?? column.mappedField ?? 'field'),
        'medium',
        'نقص متكرر في حقل ' + text(column.name ?? column.mappedField ?? 'غير مسمى'),
        'الحقل يحتوي على ' + Math.round((nullCount / total) * 100) + '% من القيم غير المكتملة.',
        ['nullCount=' + nullCount, 'rowCount=' + total],
        nullCount,
      );
    }
    if (!column.mappedField && text(column.name)) {
      addSignal(
        signals,
        'unmapped:' + text(column.name),
        'low',
        'حقل غير معرّف دلاليًا: ' + text(column.name),
        'الحقل موجود في المصدر لكنه غير مرتبط بحقل أعمال كانونـي.',
        ['mappingConfidence=0'],
      );
    }
  }

  const specialty = text(report.specialty);
  if (specialty === 'inventory') {
    const missingPrice = numeric(inventory.missingPriceRows);
    const missingName = numeric(inventory.missingNameRows);
    const uniqueSku = numeric(inventory.uniqueSkuCount);
    const warehouses = numeric(inventory.warehouseCount);
    const unmappedFields = Array.isArray(inventory.unmappedFields) ? inventory.unmappedFields : [];
    if (missingPrice != null && missingPrice > 0) addSignal(signals, 'inventory:missing-price', 'high', 'أصناف بلا سعر', 'هناك ' + missingPrice + ' صفوف بلا سعر مثبت.', ['sourceMetrics.inventory.missingPriceRows'], missingPrice);
    if (missingName != null && missingName > 0) addSignal(signals, 'inventory:missing-name', 'medium', 'أصناف بلا اسم', 'هناك ' + missingName + ' صفوف تفتقد اسم الصنف.', ['sourceMetrics.inventory.missingNameRows'], missingName);
    if (uniqueSku != null && uniqueSku > 0) addSignal(signals, 'inventory:sku-coverage', 'info', 'هوية الأصناف قابلة للتجميع', 'يمكن تجميع المصدر إلى ' + uniqueSku + ' SKU فريدة.', ['sourceMetrics.inventory.uniqueSkuCount']);
    if (warehouses != null && warehouses > 1) addSignal(signals, 'inventory:warehouse-spread', 'info', 'المصدر موزع على مستودعات', 'تظهر البيانات عبر ' + warehouses + ' مستودعات.', ['sourceMetrics.inventory.warehouseCount']);
    if (unmappedFields.length > 0) addSignal(signals, 'inventory:unmapped-fields', 'medium', 'حقول تحتاج تعريفًا', 'توجد حقول غير مربوطة دلاليًا: ' + unmappedFields.map(String).join('، ') + '.', ['sourceMetrics.inventory.unmappedFields']);
  } else if (specialty === 'sales' || specialty === 'purchases') {
    const amount = findColumn(columns, ['total_amount', 'net_amount', 'total', 'amount', 'sales', 'purchase']);
    const person = specialty === 'sales'
      ? findColumn(columns, ['customer_name', 'customer', 'العميل'])
      : findColumn(columns, ['supplier_name', 'supplier', 'المورد']);
    const dates = findColumn(columns, ['invoice_date', 'date', 'التاريخ']);
    if (!amount) addSignal(signals, specialty + ':amount-missing', 'high', 'القيمة المالية الأساسية غير واضحة', 'لا يوجد حقل مالي موثّق بما يكفي لإصدار إجمالي آمن.', ['amountField=missing']);
    if (!dates) addSignal(signals, specialty + ':date-missing', 'medium', 'الفترة الزمنية غير مثبتة', 'لا يوجد حقل تاريخ واضح؛ لذلك لا يصح بناء اتجاه زمني من هذا المصدر وحده.', ['dateField=missing']);
    if (!person) addSignal(signals, specialty + ':party-missing', 'medium', specialty === 'sales' ? 'هوية العميل غير متاحة' : 'هوية المورد غير متاحة', specialty === 'sales' ? 'لا يمكن توزيع التركّز على العملاء دون حقل عميل.' : 'لا يمكن تقييم تركّز المشتريات دون هوية مورد.', ['partyField=missing']);
  } else if (specialty === 'receivables') {
    const balance = findColumn(columns, ['outstanding_balance', 'balance', 'receivable', 'الرصيد المستحق', 'المتبقي']);
    const age120 = findColumn(columns, ['age_over_120', 'over_120', '120']);
    if (!balance) addSignal(signals, 'receivables:balance-missing', 'high', 'الرصيد المستحق غير واضح', 'لا يوجد حقل رصيد مستحق قابل للتفسير بثقة كافية.', ['balanceField=missing']);
    if (!age120) addSignal(signals, 'receivables:aging-gap', 'medium', 'شرائح التأخر غير مكتملة', 'لا يظهر حقل واضح للفئة فوق 120 يومًا.', ['age120Field=missing']);
  }

  const keyColumn = findColumn(columns, ['sku', 'product_code', 'رقم الصنف', 'barcode']);
  const warehouseColumn = findColumn(columns, ['warehouse', 'المخزن', 'المستودع']);
  const priceColumn = findColumn(columns, ['price', 'السعر', 'selling_price', 'سعر البيع']);
  if (keyColumn && rows.length) {
    const keyName = text(keyColumn.name ?? keyColumn.mappedField);
    const warehouseName = text(warehouseColumn?.name ?? warehouseColumn?.mappedField);
    const priceName = text(priceColumn?.name ?? priceColumn?.mappedField);
    const seen = new Map<string, number>();
    const pricesBySku = new Map<string, Set<number>>();
    let duplicateCount = 0;
    for (const row of rows) {
      const value = text(row.data?.[keyName]);
      if (!value) continue;
      // Repeating a SKU across warehouses is a legitimate inventory grain.
      // Only flag a duplicate when it repeats within the same source context.
      const warehouse = warehouseName ? text(row.data?.[warehouseName]) : '';
      const scopedKey = warehouse ? value + '|' + warehouse : value;
      const next = (seen.get(scopedKey) ?? 0) + 1;
      seen.set(scopedKey, next);
      if (next === 2) duplicateCount += 1;

      if (priceName) {
        const price = numeric(row.data?.[priceName]);
        if (price != null) {
          const values = pricesBySku.get(value) ?? new Set<number>();
          values.add(price);
          pricesBySku.set(value, values);
        }
      }
    }
    if (duplicateCount > 0) {
      addSignal(
        signals,
        'source:duplicate-key',
        'high',
        'تكرار داخل نفس سياق المصدر',
        'تم العثور على ' + duplicateCount + ' مفاتيح مكررة داخل نفس السياق؛ قد تكون ازدواجية فعلية وتحتاج مطابقة مع الدليل.',
        ['keyField=' + keyName, 'scopeField=' + (warehouseName || 'none'), 'duplicateKeys=' + duplicateCount],
      );
    }

    if (specialty === 'inventory' && priceColumn) {
      const variablePriceSkuCount = [...pricesBySku.values()].filter((values) => values.size > 1).length;
      if (variablePriceSkuCount > 0) {
        addSignal(
          signals,
          'inventory:price-variation',
          'medium',
          'السعر يختلف لنفس الصنف',
          'يوجد ' + variablePriceSkuCount + ' أصناف لها أكثر من سعر داخل المصدر؛ يجب تفسير اختلاف السعر بحسب المستودع/الوحدة/السياق قبل اعتماد مقارنة سعرية.',
          ['skuField=' + keyName, 'priceField=' + priceName, 'variablePriceSkuCount=' + variablePriceSkuCount],
          variablePriceSkuCount,
        );
      }
    }
  }

  const rank: Record<ReportSignalSeverity, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
  return signals.sort((a, b) => rank[b.severity] - rank[a.severity] || a.title.localeCompare(b.title));
}

function deriveRecommendations(signals: ReportSignal[]): ReportRecommendation[] {
  return signals.filter((signal) => signal.severity !== 'info').slice(0, 8).map((signal) => {
    let action = 'افحص الدليل المرتبط بهذا الاستثناء ثم قرر الإجراء المناسب.';
    if (signal.id.includes('missing-price')) action = 'افتح صفوف المصدر التي بلا سعر وراجع التسعير قبل الاعتماد.';
    else if (signal.id.includes('missing-name')) action = 'ثبّت أسماء الأصناف وربطها بمفتاح الصنف قبل المقارنة أو التنبؤ.';
    else if (signal.id.includes('duplicate-key')) action = 'طابق السجلات المتكررة مع رقم الصنف والسياق (مثل المستودع) وحدد إن كانت حركات/أسعار صحيحة أم ازدواجية.';
    else if (signal.id.includes('price-variation')) action = 'قارن اختلاف السعر حسب المستودع والوحدة وتاريخ المصدر قبل إصدار تنبيه سعري أو قرار تسعير.';
    else if (signal.id.includes('date-missing')) action = 'ثبّت تاريخًا موحدًا للمصدر قبل بناء أي اتجاه زمني.';
    else if (signal.id.includes('amount-missing')) action = 'حدّد الحقل المالي الصحيح واربطه بالحقل الكانوني قبل إصدار إجمالي.';
    return {
      id: 'rec:' + signal.id,
      status: 'PROPOSED' as const,
      priority: makePriority(signal.severity),
      title: 'راجع: ' + signal.title,
      action,
      why: signal.message,
      evidence: signal.evidence,
    };
  });
}

function parseDate(value: unknown): Date | null {
  const raw = text(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function deriveForecast(report: ReportInput): ReportForecast {
  const rows = report.canonicalRows ?? [];
  const columns = columnsOf(report);
  const dateColumn = findColumn(columns, ['invoice_date', 'date', 'due_date', 'التاريخ']);
  const valueColumn = findColumn(columns, ['total_amount', 'net_amount', 'total', 'amount', 'sales', 'purchase', 'balance']);
  const dateKey = text(dateColumn?.name);
  const valueKey = text(valueColumn?.name);
  if (!dateKey || !valueKey || rows.length < 12) {
    return { status: 'INSUFFICIENT_SAMPLE', metric: valueKey || null, method: 'deterministic-monthly-trend', observedPeriods: 0, nextPeriod: null, nextValue: null, direction: null, note: 'لا توجد سلسلة زمنية كافية؛ لن يتم اختراع توقع.' };
  }
  const byMonth = new Map<string, number>();
  for (const row of rows) {
    const date = parseDate(row.data?.[dateKey]);
    const value = numeric(row.data?.[valueKey]);
    if (!date || value == null) continue;
    const month = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    byMonth.set(month, (byMonth.get(month) ?? 0) + value);
  }
  const points = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (points.length < 6) {
    return { status: 'INSUFFICIENT_SAMPLE', metric: valueKey, method: 'deterministic-monthly-trend', observedPeriods: points.length, nextPeriod: null, nextValue: null, direction: null, note: 'السلسلة تحتوي على ' + points.length + ' فترات فقط؛ الحد الأدنى المتوقع 6.' };
  }
  const recent = points.slice(-12);
  const n = recent.length;
  const xs = recent.map((_, index) => index + 1);
  const ys = recent.map(([, value]) => value);
  const meanX = xs.reduce((sum, value) => sum + value, 0) / n;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / n;
  const numerator = xs.reduce((sum, x, index) => sum + (x - meanX) * (ys[index] - meanY), 0);
  const denominator = xs.reduce((sum, x) => sum + Math.pow(x - meanX, 2), 0);
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;
  const nextValueRaw = intercept + slope * (n + 1);
  const nextValue = Number.isFinite(nextValueRaw) ? Math.max(0, nextValueRaw) : null;
  const last = ys[ys.length - 1] ?? 0;
  const direction: ReportForecast['direction'] = nextValue == null || Math.abs(nextValue - last) < Math.max(1, Math.abs(last) * 0.02) ? 'flat' : nextValue > last ? 'up' : 'down';
  const lastDate = new Date(recent[recent.length - 1][0] + '-01T00:00:00Z');
  lastDate.setUTCMonth(lastDate.getUTCMonth() + 1);
  const nextPeriod = lastDate.getUTCFullYear() + '-' + String(lastDate.getUTCMonth() + 1).padStart(2, '0');
  return { status: 'AVAILABLE', metric: valueKey, method: 'deterministic-monthly-linear-trend', observedPeriods: recent.length, nextPeriod, nextValue, direction, note: 'توقع اتجاهي مبسط من السلسلة المصدرية، وليس حقيقة محاسبية أو ضمانًا للنتيجة.' };
}

export function deriveReportIntelligence(report: ReportInput): ReportIntelligence {
  const signals = deriveSignals(report);
  const recommendations = deriveRecommendations(signals);
  const specialty = text(report.specialty);
  const summary = specialty === 'inventory'
    ? 'المصدر يصف أصنافًا/أسعارًا/مخزونًا؛ الذكاء يركز على اكتمال الهوية والسعر والتناقضات.'
    : specialty === 'sales'
      ? 'المصدر يصف المبيعات؛ الذكاء يركز على العميل والقيمة والفترة والاتجاه.'
      : specialty === 'purchases'
        ? 'المصدر يصف المشتريات؛ الذكاء يركز على المورد والقيمة والفترة والتكرار.'
        : specialty === 'receivables'
          ? 'المصدر يصف الذمم؛ الذكاء يركز على الرصيد وأعمار التأخر وهوية العميل.'
          : specialty === 'payments'
            ? 'المصدر يصف المدفوعات/السيولة؛ الذكاء يركز على التسوية والفترة والعملة.'
            : 'المصدر محلل من بنية الحقول والقيم؛ العناصر غير المثبتة تبقى معلنة كمراجعة.';

  const top = signals[0];
  const guidance: ReportGuidance = {
    focus: top ? top.title : 'لا توجد إشارة حرجة مثبتة من البيانات المتاحة.',
    inspect: signals.slice(0, 5).map((signal) => signal.message),
    ownerHint: specialty === 'inventory' ? 'مسؤول المخزون/التسعير' : specialty === 'receivables' ? 'مسؤول التحصيل' : specialty === 'sales' ? 'مسؤول المبيعات' : specialty === 'purchases' ? 'مسؤول المشتريات' : 'المسؤول التشغيلي المناسب للمصدر',
    boundary: 'الإشارة تحدد موضعًا يحتاج تدقيقًا؛ لا تتحول إلى اتهام أو قرار نهائي دون دليل إضافي.',
  };

  return { summary, signals, recommendations, forecast: deriveForecast(report), guidance };
}
