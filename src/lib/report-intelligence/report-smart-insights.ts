export type ReportSignalSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ReportSignalDriver = {
  dimension: string;
  value: string;
  contribution: number | null;
  share: number | null;
  period: string | null;
  expected: number | null;
  actual: number | null;
  why: string;
  proof: string[];
};

export type ReportSignal = {
  id: string;
  severity: ReportSignalSeverity;
  title: string;
  message: string;
  evidence: string[];
  affectedRows?: number;
  soWhat: string;
  impact: string;
  ownerHint: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  priorityReason: string[];
  drivers?: ReportSignalDriver[];
};

export type ReportRecommendation = {
  id: string;
  status: 'PROPOSED';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  action: string;
  why: string;
  evidence: string[];
  ownerHint: string;
  impact: string;
  expectedOutcome: string;
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

export type BusinessFindingKind = 'FINDING' | 'RISK' | 'OPPORTUNITY';

export type BusinessFinding = {
  id: string;
  kind: BusinessFindingKind;
  priority: 'high' | 'medium' | 'low';
  title: string;
  statement: string;
  value?: number | null;
  unit?: string | null;
  dimensionLabel?: string | null;
  dimensionValue?: string | null;
  evidence: string[];
  limitation: string;
  action: string;
};

export type AdvisorBrief = {
  health: 'HEALTHY' | 'ATTENTION' | 'REVIEW_REQUIRED';
  headline: string;
  topFinding: BusinessFinding | null;
  topRisk: BusinessFinding | null;
  topOpportunity: BusinessFinding | null;
  recommendedAction: string | null;
  ownerHint: string;
  expectedOutcome: string | null;
  measurement: string | null;
  proofRequirement: string;
};

export type ReportIntelligence = {
  businessQuestion: string;
  summary: string;
  signals: ReportSignal[];
  recommendations: ReportRecommendation[];
  forecast: ReportForecast;
  guidance: ReportGuidance;
  findings: BusinessFinding[];
  risks: BusinessFinding[];
  opportunities: BusinessFinding[];
  advisorBrief: AdvisorBrief;
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

function dataKey(column: Record<string, unknown> | null | undefined): string {
  const mapped = text(column?.mappedField);
  return mapped || text(column?.name);
}

function makePriority(severity: ReportSignalSeverity): ReportRecommendation['priority'] {
  if (severity === 'critical') return 'urgent';
  if (severity === 'high') return 'high';
  if (severity === 'medium') return 'medium';
  return 'low';
}

function addSignal(signals: ReportSignal[], id: string, severity: ReportSignalSeverity, title: string, message: string, evidence: string[], affectedRows?: number): void {
  if (signals.some((item) => item.id === id)) return;
  signals.push({ id, severity, title, message, evidence, ...(affectedRows == null ? {} : { affectedRows }), soWhat: '', impact: '', ownerHint: '', priority: 'P3', priorityReason: [] });
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

  const textColumn = findColumn(columns, ['text', 'النص']);
  if (textColumn && rows.length) {
    const textKey = dataKey(textColumn);
    const lines = rows.map((row) => text(row.data?.[textKey])).filter(Boolean);
    const pageColumn = findColumn(columns, ['page_number', 'page', 'الصفحة']);
    const pageKey = dataKey(pageColumn);
    const pages = pageKey
      ? new Set(rows.map((row) => text(row.data?.[pageKey])).filter(Boolean)).size
      : null;
    const dateHits = lines.filter((line) => /(?:19|20)\d{2}[\/-]\d{1,2}[\/-]\d{1,2}|\b\d{1,2}[\/-]\d{1,2}[\/-](?:19|20)?\d{2}\b/.test(line)).length;
    const amountHits = lines.filter((line) => /(?:\d[\d,٬.]*)\s*(?:ريال|ر\.ي|YER|USD|دولار)?\b/i.test(line)).length;
    const headingLike = lines.filter((line) => line.length <= 90 && /(?:تقرير|كشف|إجمالي|اجمالي|المبيعات|المشتريات|المخزون|العملاء|المورد|الرصيد|الفاتورة|التاريخ|report|statement|total|sales|purchase|inventory|customer|supplier|invoice)/i.test(line)).length;

    addSignal(signals, 'document:structure', 'info', 'تم حفظ بنية الوثيقة', 'تمت المحافظة على ' + lines.length + ' سطرًا مقروءًا' + (pages == null ? '' : ' عبر ' + pages + ' صفحة') + ' بدل دمج الوثيقة في نص واحد.', ['lineCount=' + lines.length, 'pageCount=' + (pages == null ? 'unknown' : pages)]);
    if (headingLike > 0) addSignal(signals, 'document:sections', 'info', 'عناوين/أقسام قابلة للفهرسة', 'ظهرت ' + headingLike + ' أسطر تحمل مؤشرات عناوين أو أقسام أعمال يمكن استخدامها في التحليل التفصيلي.', ['headingLikeLines=' + headingLike]);
    if (dateHits === 0) addSignal(signals, 'document:date-gap', 'medium', 'التاريخ غير مثبت في النص المقروء', 'لم يظهر نمط تاريخ واضح في الأسطر المقروءة؛ لا يجوز بناء اتجاه زمني من الوثيقة وحدها.', ['datePatternHits=0']);
    else addSignal(signals, 'document:date-presence', 'info', 'تواريخ ظاهرة في المصدر', 'ظهرت أنماط تاريخ في ' + dateHits + ' أسطر من الوثيقة.', ['datePatternHits=' + dateHits]);
    if (amountHits > 0) addSignal(signals, 'document:amount-presence', 'info', 'قيم رقمية قابلة للفحص', 'ظهرت قيم رقمية/مالية في ' + amountHits + ' أسطر؛ يلزم تعيين دلالتها قبل استخدامها كإجماليات.', ['numericLineHits=' + amountHits]);
  }

  // Cross-field contradictions are source-quality signals. They identify records
  // that require direct source matching before they can support a financial decision.
  const invoiceColumn = findColumn(columns, ['invoice_number', 'invoice_no', 'رقم الفاتورة', 'فاتورة']);
  const totalColumn = findColumn(columns, ['total_amount', 'net_amount', 'total', 'amount', 'الإجمالي', 'الاجمالي']);
  const paidColumn = findColumn(columns, ['paid_amount', 'paid', 'المدفوع', 'المبلغ المدفوع']);
  if (rows.length && (totalColumn || paidColumn || invoiceColumn)) {
    const totalKey = dataKey(totalColumn);
    const paidKey = dataKey(paidColumn);
    const invoiceKey = dataKey(invoiceColumn);

    let paidAboveTotal = 0;
    const invoiceTotals = new Map<string, Set<number>>();
    for (const row of rows) {
      const totalValue = totalKey ? numeric(row.data?.[totalKey]) : null;
      const paidValue = paidKey ? numeric(row.data?.[paidKey]) : null;
      if (totalValue != null && paidValue != null && paidValue > totalValue + 0.01) paidAboveTotal += 1;

      if (invoiceKey && totalValue != null) {
        const invoice = text(row.data?.[invoiceKey]);
        if (invoice) {
          const values = invoiceTotals.get(invoice) ?? new Set<number>();
          values.add(totalValue);
          invoiceTotals.set(invoice, values);
        }
      }
    }

    if (paidAboveTotal > 0) {
      addSignal(
        signals,
        'source:paid-above-total',
        'high',
        'المدفوع يتجاوز الإجمالي في سجلات',
        'هناك ' + paidAboveTotal + ' سجلًا يظهر فيه المدفوع أكبر من إجمالي السجل؛ يجب مطابقة المصدر الأصلي والقيد المحاسبي قبل اعتماد التحصيل.',
        ['totalField=' + totalKey, 'paidField=' + paidKey, 'affectedRows=' + paidAboveTotal],
        paidAboveTotal,
      );
    }

    const conflictingInvoiceTotals = [...invoiceTotals.values()].filter((values) => values.size > 1).length;
    if (conflictingInvoiceTotals > 0) {
      addSignal(
        signals,
        'source:invoice-total-conflict',
        'high',
        'نفس رقم الفاتورة يظهر بإجماليات مختلفة',
        'يوجد ' + conflictingInvoiceTotals + ' أرقام فواتير لها أكثر من إجمالي داخل المصدر؛ قد تكون حركة صحيحة أو تعارضًا يحتاج مطابقة.',
        ['invoiceField=' + invoiceKey, 'totalField=' + totalKey, 'conflictingInvoices=' + conflictingInvoiceTotals],
        conflictingInvoiceTotals,
      );
    }
  }

  const keyColumn = findColumn(columns, ['sku', 'product_code', 'رقم الصنف', 'barcode']);
  const warehouseColumn = findColumn(columns, ['warehouse', 'المخزن', 'المستودع']);
  const priceColumn = findColumn(columns, ['price', 'السعر', 'selling_price', 'سعر البيع']);
  if (keyColumn && rows.length) {
    const keyName = dataKey(keyColumn);
    const warehouseName = dataKey(warehouseColumn);
    const priceName = dataKey(priceColumn);
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
  const ownerHint = ownerForSpecialty(specialty);
  const enriched = signals.map((signal) => {
    const priority: ReportSignal['priority'] = signal.severity === 'critical' ? 'P0' : signal.severity === 'high' ? 'P1' : signal.severity === 'medium' ? 'P2' : 'P3';
    return {
      ...signal,
      drivers: signal.drivers ?? [],
      ownerHint,
      priority,
      priorityReason: [
        'الشدة: ' + signal.severity,
        signal.affectedRows == null ? 'النطاق المتأثر غير كمي من المصدر الحالي' : 'النطاق المتأثر: ' + signal.affectedRows + ' سجل',
        'قوة الدليل: ' + signal.evidence.length + ' مؤشرات مصدرية',
      ],
      soWhat: signal.affectedRows == null ? 'تحتاج هذه الإشارة مراجعة مباشرة قبل القرار.' : 'تؤثر الإشارة على ' + signal.affectedRows + ' سجلًا من المصدر.',
      impact: signal.affectedRows == null ? 'الأثر المالي غير مثبت من المصدر الحالي.' : 'الأثر المثبت حاليًا هو نطاق السجلات المتأثرة؛ لا يتم افتراض قيمة مالية.',
    };
  });
  return enriched.sort((a, b) => rank[b.severity] - rank[a.severity] || a.title.localeCompare(b.title));
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
    else if (signal.id.includes('paid-above-total')) action = 'افتح السجلات المتأثرة وطابق الإجمالي والمدفوع مع الفاتورة الأصلية والقيد المحاسبي قبل اعتماد التحصيل.';
    else if (signal.id.includes('invoice-total-conflict')) action = 'طابق أرقام الفواتير المتعارضة مع المستندات الأصلية وسبب التعديل/التجزئة قبل اعتبارها ازدواجية أو خطأ.';
    return {
      id: 'rec:' + signal.id,
      status: 'PROPOSED' as const,
      priority: makePriority(signal.severity),
      title: 'راجع: ' + signal.title,
      action,
      why: signal.message,
      evidence: signal.evidence,
      ownerHint: signal.ownerHint,
      impact: signal.impact,
      expectedOutcome: 'افحص الدليل المرتبط بهذا الاستثناء، نفّذ الإجراء بعد الاعتماد، ثم أعد القياس بنفس المصدر.',
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
  const dateKey = dataKey(dateColumn);
  const valueKey = dataKey(valueColumn);
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

function ownerForSpecialty(specialty: string): string {
  if (specialty === 'inventory') return 'مسؤول المخزون';
  if (specialty === 'sales') return 'مسؤول المبيعات';
  if (specialty === 'purchases') return 'مسؤول المشتريات';
  if (specialty === 'receivables') return 'مسؤول التحصيل';
  if (specialty === 'payments') return 'مسؤول الخزينة';
  if (specialty === 'profitability') return 'المدير المالي';
  return 'المسؤول التشغيلي المناسب للمصدر';
}

function groupSum(rows: Array<{ data?: Record<string, unknown> | null }>, dimensionKey: string, valueKey: string): Array<{ dimension: string; value: number; rows: number }> {
  const groups = new Map<string, { value: number; rows: number }>();
  for (const row of rows) {
    const dimension = text(row.data?.[dimensionKey]) || 'غير محدد';
    const value = numeric(row.data?.[valueKey]);
    if (value == null) continue;
    const current = groups.get(dimension) ?? { value: 0, rows: 0 };
    current.value += value;
    current.rows += 1;
    groups.set(dimension, current);
  }
  return [...groups.entries()]
    .map(([dimension, item]) => ({ dimension, ...item }))
    .sort((a, b) => b.value - a.value);
}

function deriveBusinessFindings(report: ReportInput): {
  findings: BusinessFinding[];
  risks: BusinessFinding[];
  opportunities: BusinessFinding[];
} {
  const rows = report.canonicalRows ?? [];
  const columns = columnsOf(report);
  const specialty = text(report.specialty);
  const findings: BusinessFinding[] = [];
  const risks: BusinessFinding[] = [];
  const opportunities: BusinessFinding[] = [];

  const amountColumn = findColumn(columns, [
    'net_amount', 'total_amount', 'total', 'amount', 'sales', 'purchase',
    'outstanding_balance', 'balance', 'local_amount', 'value',
  ]);
  const partyColumn = specialty === 'purchases'
    ? findColumn(columns, ['supplier_name', 'supplier', 'vendor', 'المورد'])
    : findColumn(columns, ['customer_name', 'customer', 'client', 'العميل']);
  const productColumn = findColumn(columns, ['product_name', 'product', 'item', 'sku', 'product_code', 'رقم الصنف', 'الصنف']);
  const dateColumn = findColumn(columns, ['invoice_date', 'date', 'transaction_date', 'التاريخ']);
  const quantityColumn = findColumn(columns, ['current_stock', 'stock', 'quantity', 'qty', 'الرصيد', 'الكمية']);
  const priceColumn = findColumn(columns, ['selling_price', 'price', 'cost', 'السعر', 'التكلفة']);
  const balanceColumn = findColumn(columns, ['outstanding_balance', 'receivable', 'balance', 'الرصيد المستحق', 'المتبقي']);

  if (!rows.length) {
    return { findings, risks, opportunities };
  }

  if ((specialty === 'sales' || specialty === 'purchases') && amountColumn) {
    const amountKey = dataKey(amountColumn);
    const amounts = rows.map((row) => numeric(row.data?.[amountKey])).filter((value): value is number => value != null);
    const total = amounts.reduce((sum, value) => sum + value, 0);

    if (total !== 0) {
      findings.push({
        id: specialty + ':total-value',
        kind: 'FINDING',
        priority: 'high',
        title: specialty === 'sales' ? 'إجمالي قيمة المبيعات في المصدر' : 'إجمالي قيمة المشتريات في المصدر',
        statement: 'القيمة المحسوبة من ' + amounts.length + ' سجلًا صالحة هي ' + total.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '.',
        value: total,
        unit: 'عملة المصدر',
        evidence: ['valueField=' + amountKey, 'usableRows=' + amounts.length],
        limitation: 'هذا إجمالي المصدر وفق الحقل المالي المختار، ولا يثبت الربحية أو التحصيل.',
        action: 'استخدم هذا الإجمالي كنقطة مرجعية، ثم انتقل إلى التوزيع على العملاء/الموردين والفترة قبل اتخاذ القرار.',
      });
    }

    if (partyColumn) {
      const partyKey = dataKey(partyColumn);
      const groups = groupSum(rows, partyKey, amountKey);
      const top = groups[0];
      if (top && total !== 0) {
        const share = Math.abs(top.value / total);
        findings.push({
          id: specialty + ':top-party',
          kind: 'FINDING',
          priority: share >= 0.5 ? 'high' : 'medium',
          title: specialty === 'sales' ? 'أعلى مساهم في قيمة المبيعات' : 'أعلى مساهم في قيمة المشتريات',
          statement: (specialty === 'sales' ? 'العميل' : 'المورد') + ' "' + top.dimension + '" يمثل ' + (share * 100).toFixed(1) + '% من القيمة المحسوبة.',
          value: top.value,
          unit: 'عملة المصدر',
          dimensionLabel: specialty === 'sales' ? 'العميل' : 'المورد',
          dimensionValue: top.dimension,
          evidence: [(specialty === 'sales' ? 'customerField=' : 'supplierField=') + partyKey, 'dimensionField=' + partyKey, 'valueField=' + amountKey, 'dimensionValue=' + top.dimension, 'dimensionValueTotal=' + top.value.toFixed(2), 'sourceTotal=' + total.toFixed(2)],
          limitation: 'التركيز الحسابي لا يثبت خطرًا تجاريًا بحد ذاته؛ يحتاج إلى تفسير حسب سياسة الشركة وتوزيع باقي القيمة.',
          action: specialty === 'sales'
            ? 'راجع هذا العميل أولًا ضمن خطة المحافظة على الإيراد ومخاطر التركّز.'
            : 'راجع هذا المورد أولًا ضمن خطة التركّز والشروط والأسعار والتوريد.',
        });
      }
    }

    if (dateColumn) {
      const dateKey = dataKey(dateColumn);
      const monthly = new Map<string, number>();
      for (const row of rows) {
        const date = parseDate(row.data?.[dateKey]);
        const value = numeric(row.data?.[amountKey]);
        if (!date || value == null) continue;
        const month = date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0');
        monthly.set(month, (monthly.get(month) ?? 0) + value);
      }
      const periods = [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b));
      if (periods.length >= 2) {
        const previous = periods[periods.length - 2][1];
        const latest = periods[periods.length - 1][1];
        const delta = latest - previous;
        const pct = previous === 0 ? null : (delta / Math.abs(previous)) * 100;
        if (partyColumn && delta !== 0) {
          const partyKey = dataKey(partyColumn);
          const byPeriod = new Map<string, Map<string, number>>();
          for (const row of rows) {
            const date = parseDate(row.data?.[dateKey]);
            const value = numeric(row.data?.[amountKey]);
            if (!date || value == null) continue;
            const month = date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0');
            const party = text(row.data?.[partyKey]) || 'غير محدد';
            const bucket = byPeriod.get(month) ?? new Map<string, number>();
            bucket.set(party, (bucket.get(party) ?? 0) + value);
            byPeriod.set(month, bucket);
          }
          const previousParties = byPeriod.get(periods[periods.length - 2][0]) ?? new Map<string, number>();
          const latestParties = byPeriod.get(periods[periods.length - 1][0]) ?? new Map<string, number>();
          const contributor = [...new Set([...previousParties.keys(), ...latestParties.keys()])]
            .map((party) => ({ party, delta: (latestParties.get(party) ?? 0) - (previousParties.get(party) ?? 0) }))
            .filter((item) => item.delta !== 0)
            .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
          if (contributor) {
            findings.push({
              id: specialty + ':change-contributor',
              kind: 'FINDING',
              priority: Math.abs(contributor.delta) >= Math.abs(delta) * 0.5 ? 'high' : 'medium',
              title: 'أكبر مساهم في تغير الفترة',
              statement: (specialty === 'sales' ? 'العميل' : 'المورد') + ' "' + contributor.party + '" يمثل أكبر تغير منفرد بمقدار ' + contributor.delta.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '.',
              value: contributor.delta,
              unit: 'فرق القيمة',
              dimensionLabel: specialty === 'sales' ? 'العميل' : 'المورد',
              dimensionValue: contributor.party,
              evidence: ['dimensionField=' + partyKey, 'previousPeriod=' + periods[periods.length - 2][0], 'latestPeriod=' + periods[periods.length - 1][0], 'partyDelta=' + contributor.delta.toFixed(2)],
              limitation: 'المساهمة في التغير تفكيك حسابي وليست إثباتًا للسبب.',
              action: 'افتح معاملات هذا الطرف ومصادر تغيره قبل اعتماد الإجراء.',
            });
          }
        }

        findings.push({
          id: specialty + ':period-change',
          kind: 'FINDING',
          priority: pct != null && Math.abs(pct) >= 20 ? 'high' : 'medium',
          title: 'تغير القيمة بين آخر فترتين',
          statement: 'تغيرت القيمة من ' + previous.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + ' إلى ' + latest.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + (pct == null ? '.' : ' بنسبة ' + pct.toFixed(1) + '%.'),
          value: delta,
          unit: 'فرق القيمة',
          dimensionLabel: 'الفترة',
          dimensionValue: periods[periods.length - 1][0],
          evidence: ['dateField=' + dateKey, 'valueField=' + amountKey, 'previousPeriod=' + periods[periods.length - 2][0], 'latestPeriod=' + periods[periods.length - 1][0]],
          limitation: 'المقارنة بين فترتين لا تثبت سبب التغير ولا تراعي الموسمية.',
          action: specialty === 'sales'
            ? 'افتح تحليل المساهمين في التغير قبل اعتماد أي قرار مبيعات.'
            : 'افتح تحليل الموردين والقيمة قبل اعتماد أي قرار مشتريات.',
        });
        if (pct != null && pct < -10) {
          risks.push({
            id: specialty + ':period-decline-risk',
            kind: 'RISK',
            priority: pct <= -20 ? 'high' : 'medium',
            title: 'انخفاض حديث يحتاج تفسيرًا',
            statement: 'القيمة في آخر فترة أقل من الفترة السابقة بنسبة ' + Math.abs(pct).toFixed(1) + '%.',
            value: delta,
            unit: '% change',
            evidence: ['previous=' + previous.toFixed(2), 'latest=' + latest.toFixed(2), 'deltaPercent=' + pct.toFixed(2)],
            limitation: 'هذا مؤشر اتجاهي وليس إثباتًا لسبب الانخفاض.',
            action: 'حلّل العملاء/الموردين والأصناف التي ساهمت في الانخفاض قبل اختيار الإجراء.',
          });
        } else if (pct != null && pct > 10) {
          opportunities.push({
            id: specialty + ':period-growth-opportunity',
            kind: 'OPPORTUNITY',
            priority: pct >= 20 ? 'high' : 'medium',
            title: 'نمو حديث يمكن متابعته',
            statement: 'القيمة في آخر فترة أعلى من الفترة السابقة بنسبة ' + pct.toFixed(1) + '%.',
            value: delta,
            unit: '% change',
            evidence: ['previous=' + previous.toFixed(2), 'latest=' + latest.toFixed(2), 'deltaPercent=' + pct.toFixed(2)],
            limitation: 'النمو بين فترتين لا يثبت الاستدامة أو السبب.',
            action: 'حدّد مصادر النمو الأعلى وراقب استمرارها في الفترة التالية.',
          });
        }
      }
    }
  }

  if (specialty === 'inventory' && quantityColumn) {
    const quantityKey = dataKey(quantityColumn);
    const priceKey = dataKey(priceColumn);
    let negative = 0;
    let zero = 0;
    let valuedRows = 0;
    let inventoryValue = 0;
    const valueByProduct = new Map<string, number>();

    for (const row of rows) {
      const quantity = numeric(row.data?.[quantityKey]);
      if (quantity == null) continue;
      if (quantity < 0) negative += 1;
      if (quantity === 0) zero += 1;
      const price = priceKey ? numeric(row.data?.[priceKey]) : null;
      if (price != null) {
        const value = quantity * price;
        inventoryValue += value;
        valuedRows += 1;
        const key = productColumn ? text(row.data?.[dataKey(productColumn)]) || 'غير محدد' : 'غير محدد';
        valueByProduct.set(key, (valueByProduct.get(key) ?? 0) + value);
      }
    }

    findings.push({
      id: 'inventory:position',
      kind: 'FINDING',
      priority: inventoryValue > 0 ? 'high' : 'medium',
      title: 'صورة المخزون المحسوبة من المصدر',
      statement: 'تمت قراءة ' + rows.length + ' سجلًا؛ ' + zero + ' بلا رصيد و' + negative + ' برصيد سالب' + (valuedRows ? '، وقيمة مرجعية محسوبة لـ' + valuedRows + ' سجلًا.' : '.'),
      value: inventoryValue || null,
      unit: inventoryValue ? 'قيمة مرجعية' : null,
      evidence: ['quantityField=' + quantityKey, ...(priceKey ? ['priceField=' + priceKey] : []), 'rows=' + rows.length, 'zeroRows=' + zero, 'negativeRows=' + negative],
      limitation: 'قيمة المخزون هنا ناتجة عن كمية × سعر الحقل المختار؛ لا تعادل تلقائيًا تكلفة المخزون المحاسبية.',
      action: negative > 0 ? 'راجع الأرصدة السالبة ومصدر الحركة قبل أي قرار شراء أو صرف.' : 'رتّب أولويات المراجعة بحسب القيمة والتركيز، ثم اربطها بالحركة والتغطية.',
    });

    if (negative > 0) {
      risks.push({
        id: 'inventory:negative-balance-risk',
        kind: 'RISK',
        priority: negative >= Math.max(5, Math.round(rows.length * 0.05)) ? 'high' : 'medium',
        title: 'أرصدة مخزون سالبة',
        statement: 'يوجد ' + negative + ' سجلًا برصيد مخزون سالب.',
        value: negative,
        unit: 'rows',
        evidence: ['quantityField=' + quantityKey, 'negativeRows=' + negative],
        limitation: 'السبب غير مستنتج من جدول الرصيد وحده.',
        action: 'طابق الأرصدة السالبة مع الحركات والمستندات قبل تعديل الرصيد.',
      });
    }

    if (productColumn && valueByProduct.size > 0 && inventoryValue !== 0) {
      const top = [...valueByProduct.entries()].sort((a, b) => b[1] - a[1])[0];
      if (top) {
        const share = Math.abs(top[1] / inventoryValue);
        opportunities.push({
          id: 'inventory:value-focus-opportunity',
          kind: 'OPPORTUNITY',
          priority: share >= 0.5 ? 'high' : 'medium',
          title: 'فرصة لتركيز مراجعة رأس المال المخزني',
          statement: 'الصنف "' + top[0] + '" يمثل ' + (share * 100).toFixed(1) + '% من القيمة المرجعية المحسوبة للمخزون.',
          value: top[1],
          unit: 'قيمة مرجعية',
          dimensionLabel: 'الصنف',
          dimensionValue: top[0],
          evidence: ['productField=' + dataKey(productColumn), 'valueShare=' + (share * 100).toFixed(2), 'productValue=' + top[1].toFixed(2), 'inventoryValue=' + inventoryValue.toFixed(2)],
          limitation: 'التركيز لا يثبت ركود الصنف أو انخفاض الطلب.',
          action: 'ابدأ المراجعة من الأصناف الأعلى قيمة ثم قارنها بالحركة والطلب.',
        });
      }
    }
  }

  if (specialty === 'receivables' && balanceColumn) {
    const balanceKey = dataKey(balanceColumn);
    const balances = rows.map((row) => numeric(row.data?.[balanceKey])).filter((value): value is number => value != null);
    const totalBalance = balances.reduce((sum, value) => sum + value, 0);
    findings.push({
      id: 'receivables:total-balance',
      kind: 'FINDING',
      priority: 'high',
      title: 'إجمالي الرصيد المستحق المحسوب',
      statement: 'إجمالي الرصيد المستحق من ' + balances.length + ' سجلًا هو ' + totalBalance.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '.',
      value: totalBalance,
      unit: 'عملة المصدر',
      evidence: ['balanceField=' + balanceKey, 'usableRows=' + balances.length],
      limitation: 'لا يحدد هذا وحده قابلية التحصيل أو التعثر.',
      action: 'قسّم الرصيد حسب العميل وأعمار الدين قبل ترتيب أولويات التحصيل.',
    });
    if (partyColumn) {
      const partyKey = dataKey(partyColumn);
      const groups = groupSum(rows, partyKey, balanceKey);
      const top = groups[0];
      if (top && totalBalance !== 0) {
        const share = Math.abs(top.value / totalBalance);
        risks.push({
          id: 'receivables:concentration-risk',
          kind: 'RISK',
          priority: share >= 0.5 ? 'high' : 'medium',
          title: 'تركيز الرصيد المستحق في عميل',
          statement: 'العميل "' + top.dimension + '" يمثل ' + (share * 100).toFixed(1) + '% من الرصيد المحسوب.',
          value: top.value,
          unit: 'عملة المصدر',
          dimensionLabel: 'العميل',
          dimensionValue: top.dimension,
          evidence: ['customerField=' + partyKey, 'balanceField=' + balanceKey, 'customerBalance=' + top.value.toFixed(2), 'totalBalance=' + totalBalance.toFixed(2)],
          limitation: 'التركيز ليس دليل تعثر دون بيانات عمر الدين أو سلوك السداد.',
          action: 'راجع العميل ضمن أولويات التحصيل مع بيانات عمر الدين وأحدث حركة سداد.',
        });
      }
    }
  }

  if (specialty === 'profitability') {
    const revenueColumn = findColumn(columns, ['revenue', 'sales', 'net_amount', 'الإيراد', 'المبيعات']);
    const costColumn = findColumn(columns, ['cost', 'cogs', 'التكلفة', 'تكلفة']);
    if (revenueColumn && costColumn) {
      const revenueKey = dataKey(revenueColumn);
      const costKey = dataKey(costColumn);
      let revenue = 0;
      let cost = 0;
      let usable = 0;
      for (const row of rows) {
        const r = numeric(row.data?.[revenueKey]);
        const k = numeric(row.data?.[costKey]);
        if (r == null || k == null) continue;
        revenue += r;
        cost += k;
        usable += 1;
      }
      const margin = revenue === 0 ? null : ((revenue - cost) / revenue) * 100;
      findings.push({
        id: 'profitability:margin',
        kind: 'FINDING',
        priority: 'high',
        title: 'الهامش المحسوب من المصدر',
        statement: margin == null ? 'تعذر حساب الهامش من القيم المتاحة.' : 'الإيراد المحسوب ' + revenue.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '، والتكلفة ' + cost.toLocaleString('ar-YE', { maximumFractionDigits: 2 }) + '، والهامش ' + margin.toFixed(1) + '%.',
        value: margin,
        unit: '% margin',
        evidence: ['revenueField=' + revenueKey, 'costField=' + costKey, 'usableRows=' + usable],
        limitation: 'الهامش يعتمد على الحقول المحددة ولا يثبت صافي الربح بعد باقي المصروفات.',
        action: 'قسّم الهامش حسب المنتج/العميل وحدد مصادر التآكل قبل اتخاذ قرار التسعير.',
      });
      if (margin != null && margin < 10) {
        risks.push({
          id: 'profitability:low-margin-risk',
          kind: 'RISK',
          priority: margin < 0 ? 'high' : 'medium',
          title: 'هامش منخفض في البيانات المتاحة',
          statement: 'الهامش المحسوب من الحقول المحددة أقل من 10%.',
          value: margin,
          unit: '% margin',
          evidence: ['margin=' + margin.toFixed(2), 'revenueField=' + revenueKey, 'costField=' + costKey],
          limitation: 'هذا ليس صافي الربح ولا يفسر السبب.',
          action: 'حلّل المنتجات/العملاء ذات الهامش الأضعف قبل تعديل الأسعار أو التكلفة.',
        });
      } else if (margin != null && margin >= 25) {
        opportunities.push({
          id: 'profitability:healthy-margin-opportunity',
          kind: 'OPPORTUNITY',
          priority: 'medium',
          title: 'مجال لمراجعة مصادر الهامش الجيد',
          statement: 'الهامش الإجمالي المحسوب من الحقول المحددة يبلغ ' + margin.toFixed(1) + '%.',
          value: margin,
          unit: '% margin',
          evidence: ['margin=' + margin.toFixed(2), 'revenueField=' + revenueKey, 'costField=' + costKey],
          limitation: 'الهامش الجيد لا يثبت جودة العميل أو المنتج على المدى الطويل.',
          action: 'قسّم مصادر الهامش الجيد وحدد ما يمكن المحافظة عليه مع استمرار المراقبة.',
        });
      }
    }
  }

  return {
    findings: findings.slice(0, 8),
    risks: risks.slice(0, 6),
    opportunities: opportunities.slice(0, 6),
  };
}

function buildAdvisorBrief(
  report: ReportInput,
  business: { findings: BusinessFinding[]; risks: BusinessFinding[]; opportunities: BusinessFinding[] },
  signals: ReportSignal[],
): AdvisorBrief {
  const specialty = text(report.specialty);
  const topFinding = business.findings[0] ?? null;
  const topRisk = business.risks[0] ?? null;
  const topOpportunity = business.opportunities[0] ?? null;
  const health: AdvisorBrief['health'] =
    topRisk?.priority === 'high' || signals.some((signal) => signal.severity === 'critical')
      ? 'REVIEW_REQUIRED'
      : topRisk || signals.some((signal) => signal.severity === 'high')
        ? 'ATTENTION'
        : 'HEALTHY';
  const recommendedAction = topRisk?.action ?? topFinding?.action ?? topOpportunity?.action ?? null;
  const headline = topRisk
    ? topRisk.statement
    : topFinding
      ? topFinding.statement
      : topOpportunity
        ? topOpportunity.statement
        : signals[0]?.message ?? 'لا توجد نتيجة أعمال كافية لبناء موجز استشاري.';

  return {
    health,
    headline,
    topFinding,
    topRisk,
    topOpportunity,
    recommendedAction,
    ownerHint: ownerForSpecialty(specialty),
    expectedOutcome: topRisk
      ? 'إزالة سبب الاستثناء أو خفض الجزء المتأثر منه بعد التحقق.'
      : topOpportunity
        ? 'الحفاظ على الاتجاه أو توسيع الأثر الذي أظهره المصدر.'
        : topFinding
          ? 'تحويل النتيجة إلى قرار قابل للقياس بعد المراجعة.'
          : null,
    measurement: topRisk
      ? 'أعد قياس المؤشر المتأثر نفسه بعد الإجراء، مع الاحتفاظ بنفس source/job lineage.'
      : topOpportunity
        ? 'قارن المؤشر نفسه في الفترة التالية أو دورة المتابعة التالية.'
        : topFinding
          ? 'سجّل قرارًا وإجراءً ثم اقرأ النتيجة الفعلية من المسار التشغيلي.'
          : null,
    proofRequirement: 'كل توصية يجب أن تبقى مرتبطة بـsourceHash + jobId + evidence قبل اعتمادها.',
  };
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

  const businessQuestion = specialty === 'sales'
    ? 'ما الذي حدث في المبيعات وأين توجد إشارات تحتاج تدخلًا؟'
    : specialty === 'receivables'
      ? 'ما حجم الذمم وأين تتركز مخاطر التحصيل؟'
      : specialty === 'inventory'
        ? 'أين توجد فجوات في هوية الصنف أو السعر أو المخزون؟'
        : specialty === 'purchases'
          ? 'أين توجد استثناءات في المشتريات والموردين والتكلفة؟'
          : specialty === 'payments'
            ? 'هل حركة التحصيل/السيولة مكتملة ويمكن تسويتها بثقة؟'
            : 'ما أهم ما تثبته بيانات المصدر، وما الذي يحتاج مراجعة قبل القرار؟';

  const top = signals[0];
  const guidance: ReportGuidance = {
    focus: top ? top.title : 'لا توجد إشارة حرجة مثبتة من البيانات المتاحة.',
    inspect: signals.slice(0, 5).map((signal) => signal.message),
    ownerHint: specialty === 'inventory' ? 'مسؤول المخزون/التسعير' : specialty === 'receivables' ? 'مسؤول التحصيل' : specialty === 'sales' ? 'مسؤول المبيعات' : specialty === 'purchases' ? 'مسؤول المشتريات' : 'المسؤول التشغيلي المناسب للمصدر',
    boundary: 'الإشارة تحدد موضعًا يحتاج تدقيقًا؛ لا تتحول إلى اتهام أو قرار نهائي دون دليل إضافي. الوثائق النصية غير المهيكلة تحتاج تعيينًا دلاليًا قبل اعتماد أرقامها كحقيقة تجارية.',
  };

  const business = deriveBusinessFindings(report);
  const advisorBrief = buildAdvisorBrief(report, business, signals);
  return {
    businessQuestion,
    summary,
    signals,
    recommendations,
    forecast: deriveForecast(report),
    guidance,
    findings: business.findings,
    risks: business.risks,
    opportunities: business.opportunities,
    advisorBrief,
  };
}
