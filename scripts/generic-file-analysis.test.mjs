import assert from 'node:assert/strict';
import { parseFile } from '../src/lib/file-engine/adapters.ts';
import { detectFormat } from '../src/lib/file-engine/detector.ts';
import { buildGenericFileIntelligence } from '../src/lib/file-engine/generic-intelligence.ts';
import { buildUniversalReportIntelligence } from '../src/lib/universal-report-intelligence.ts';
import { composeIntelligenceLayers } from '../src/lib/report-intelligence/compose-intelligence-layers.ts';
import * as XLSX from 'xlsx';

function buffer(value) {
  return new TextEncoder().encode(value).buffer;
}

async function main() {
  const unknownText = 'نص عام في ملف غير معروف\nيوجد تأخير ويجب المراجعة\nالإجمالي 1200 ريال';
  const detectedUnknown = detectFormat({ name: 'business.log', size: unknownText.length, type: 'text/plain' }, buffer(unknownText));
  assert.equal(detectedUnknown.format, 'txt', 'unknown readable text should use generic text fallback');
  assert.equal(detectedUnknown.category, 'text', 'generic fallback category');
  assert.ok(detectedUnknown.warnings.some((warning) => warning.includes('مسار النص العام')), 'generic fallback warning');

  const cases = [
    { format: 'txt', name: 'risk.txt', source: 'توجد مشكلة في المخزون\nيجب مراجعة الكميات المتأخرة\nالإجمالي 1200 ريال', expectedRows: 3 },
    { format: 'xml', name: 'sales.xml', source: '<root><row><product>صنف 1</product><total>100</total></row><row><product>صنف 2</product><total>200</total></row></root>', expectedRows: 2 },
    { format: 'yaml', name: 'sales.yaml', source: '- product: صنف 1\n  total: 100\n- product: صنف 2\n  total: 200', expectedRows: 2 },
    { format: 'rtf', name: 'note.rtf', source: '{\\rtf1\\ansi خطر تأخير\\par يجب المراجعة\\par}', expectedRows: 2 },
  ];
  for (const item of cases) {
    const datasets = await parseFile(buffer(item.source), item.name, item.format);
    assert.equal(datasets.length, 1, item.format + ' should produce one dataset');
    assert.equal(datasets[0].rowCount, item.expectedRows, item.format + ' row count');
    const intelligence = buildGenericFileIntelligence(datasets[0], item.format);
    assert.ok(intelligence.summary.length > 20, item.format + ' summary');
    assert.ok(intelligence.guidance.boundary.includes('لا يحول'), item.format + ' evidence boundary');
  }
  // Real XLSX regression: customer portfolio + eight monthly measures.
  // The report should map the observed semantics, summarize the table and expose
  // evidence-backed customer-status, monthly-trend and reconciliation signals.
  const monthlyNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس'];
  const portfolioRows = [
    {
      'اسم العميل': 'عميل مستمر',
      'يناير': 100, 'فبراير': 120, 'مارس': 110, 'أبريل': 130,
      'مايو': 140, 'يونيو': 150, 'يوليو': 160, 'أغسطس': 180,
      'الإجمالي الكلي': 1090, 'حالة الزبون': 'مستمر',
      'تصنيف الأهمية (ABC)': 'الفئة أ (كبار العملاء)',
      'مؤشر المخاطر والفرص': 'منتظم مستمر', 'عدد أشهر التعامل': 8,
      'متوسط الشهر الفعلي': 136.25, 'الشهر الأعلى شراءً': 'أغسطس',
      'نسبة النمو (يوليو-أغسطس)': 0.125,
    },
    {
      'اسم العميل': 'عميل منقطع مهم',
      'يناير': 20, 'فبراير': 0, 'مارس': 0, 'أبريل': 30,
      'مايو': 0, 'يونيو': 0, 'يوليو': 0, 'أغسطس': 0,
      'الإجمالي الكلي': 65, 'حالة الزبون': 'منقطع',
      'تصنيف الأهمية (ABC)': 'الفئة أ (كبار العملاء)',
      'مؤشر المخاطر والفرص': 'خطر انقطاع (VIP)', 'عدد أشهر التعامل': 2,
      'متوسط الشهر الفعلي': 25, 'الشهر الأعلى شراءً': 'أبريل',
      'نسبة النمو (يوليو-أغسطس)': -1,
    },
    {
      'اسم العميل': 'عميل آخر',
      'يناير': 10, 'فبراير': 20, 'مارس': 30, 'أبريل': 40,
      'مايو': 50, 'يونيو': 60, 'يوليو': 70, 'أغسطس': 80,
      'الإجمالي الكلي': 360, 'حالة الزبون': 'مستمر',
      'تصنيف الأهمية (ABC)': 'الفئة ب', 'مؤشر المخاطر والفرص': 'نشاط معتاد',
      'عدد أشهر التعامل': 8, 'متوسط الشهر الفعلي': 45,
      'الشهر الأعلى شراءً': 'أغسطس', 'نسبة النمو (يوليو-أغسطس)': 0.1429,
    },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(portfolioRows), 'ملخص العملاء');
  const bytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const xlsxBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const parsedPortfolio = await parseFile(xlsxBuffer, 'customer-portfolio.xlsx', 'xlsx');
  assert.equal(parsedPortfolio.length, 1, 'customer portfolio workbook should parse as one dataset');
  assert.equal(parsedPortfolio[0].rowCount, 3, 'all customer records must be preserved');
  assert.equal(parsedPortfolio[0].columnCount, 17, 'all original workbook columns must be preserved');
  assert.equal(parsedPortfolio[0].columns.filter(column => column.mappedField).length, 17, 'Arabic customer portfolio fields should receive semantic mappings');
  assert.equal(parsedPortfolio[0].columns.reduce((sum, column) => sum + column.qualityIssues.length, 0), 0, 'unknown semantics alone must not be counted as data-quality defects');
  assert.equal(parsedPortfolio[0].columns.find(column => column.name === 'حالة الزبون')?.mappedField, 'customer_status');
  assert.equal(parsedPortfolio[0].columns.find(column => column.name === 'أغسطس')?.mappedField, 'monthly_sales_aug');
  const portfolioIntelligence = buildGenericFileIntelligence(parsedPortfolio[0], 'xlsx');
  assert.ok(portfolioIntelligence.summary.includes('٣') || portfolioIntelligence.summary.includes('3'), 'structured Excel summary must report source row count');
  assert.ok(portfolioIntelligence.signals.some(signal => signal.id === 'generic:table:source-status'), 'source-disconnected status should create a specific evidence-backed signal');
  assert.ok(portfolioIntelligence.recommendations.some(item => item.id === 'generic:table:reconcile-totals'), 'monthly-to-total mismatch must produce a reconciliation recommendation');
  assert.ok(portfolioIntelligence.recommendations.some(item => item.id === 'generic:table:review-monthly-change'), 'monthly source values must be compared across periods');
  assert.ok(portfolioIntelligence.guidance.inspect.some(item => item.includes('عميل مستمر') || item.includes('عميل منقطع مهم')), 'top customer rows should appear as evidence');

  const sourceBoundPreview = {
    ...portfolioIntelligence,
    businessQuestion: 'سؤال محفظة العملاء من نفس الصفوف المصدرية',
    summary: 'تحليل محفظة العملاء مع دليل الحالات الشهرية',
  };
  const universalPortfolio = buildUniversalReportIntelligence({
    specialty: 'sales',
    archetypeHintId: 'customers.activity',
    previewIntelligence: sourceBoundPreview,
    rowCount: parsedPortfolio[0].rowCount,
    sourceAnalysis: { datasets: [parsedPortfolio[0]] },
    canonicalRows: parsedPortfolio[0].rows.map((data, index) => ({ row_number: index + 1, data })),
    sourcePath: 'customer-portfolio.xlsx',
    sourceHash: 'test-source-hash',
  });
  assert.strictEqual(universalPortfolio.intelligence, sourceBoundPreview, 'decision chain must reuse the source-bound portfolio analysis object');
  assert.equal(universalPortfolio.intelligence.businessQuestion, 'سؤال محفظة العملاء من نفس الصفوف المصدرية');
  assert.equal(universalPortfolio.archetype?.id, 'customers.activity', 'customer portfolio shape must not be labeled as invoice detail');
  assert.equal(universalPortfolio.archetypeState, 'REVIEW_REQUIRED', 'shape hints must not be presented as canonical archetype proof');
  assert.ok(!universalPortfolio.stages.some(stage => stage.evidence.some(item => item.includes('dateField=missing'))), 'stale generic date-missing evidence must not override the source-bound analysis');

  const sharedId = portfolioIntelligence.signals[0]?.id;
  assert.ok(sharedId, 'general layer should have at least one source-derived signal');
  const specialistEvidence = 'specialist-proof=customer-activity';
  const generalEvidence = 'general-proof=raw-source-content';
  const specialistLayer = {
    ...sourceBoundPreview,
    businessQuestion: 'السؤال المتخصص يجب أن يبقى ظاهرًا',
    summary: 'التحليل المتخصص',
    signals: [
      ...sourceBoundPreview.signals.map(signal => signal.id === sharedId
        ? { ...signal, title: 'الإشارة المتخصصة', evidence: [specialistEvidence] }
        : signal),
      {
        id: 'specialty:customer-activity:source-bound',
        severity: 'medium',
        title: 'إشارة متخصصة مستقلة',
        message: 'تظهر فقط في الطبقة المتخصصة',
        evidence: ['specialtyRow=2'],
        soWhat: 'مراجعة خاصة بالشكل المكتشف',
        impact: 'لا يثبت أثرًا ماليًا',
        ownerHint: 'مراجع التقرير',
        priority: 'P2',
        priorityReason: ['specialtySupported=true'],
      },
    ],
    recommendations: [
      ...sourceBoundPreview.recommendations,
      { ...sourceBoundPreview.recommendations[0], id: 'specialty:customer-activity:review', title: 'توصية متخصصة' },
    ],
  };
  const generalWithProof = {
    ...portfolioIntelligence,
    signals: portfolioIntelligence.signals.map(signal => signal.id === sharedId
      ? { ...signal, evidence: [...signal.evidence, generalEvidence] }
      : signal),
  };
  const composed = composeIntelligenceLayers(generalWithProof, specialistLayer);
  const sharedMergedSignal = composed.signals.find(signal => signal.id === sharedId);
  assert.ok(sharedMergedSignal, 'merged result must preserve overlapping source signal');
  assert.equal(sharedMergedSignal.title, 'الإشارة المتخصصة', 'specialist interpretation wins for a shared stable ID');
  assert.ok(sharedMergedSignal.evidence.includes(generalEvidence), 'general evidence must survive composition');
  assert.ok(sharedMergedSignal.evidence.includes(specialistEvidence), 'specialist evidence must survive composition');
  assert.ok(composed.signals.some(signal => signal.id === 'generic:table:source-status'), 'general-only signals must survive when specialty is present');
  assert.ok(composed.signals.some(signal => signal.id === 'specialty:customer-activity:source-bound'), 'specialist-only signals must survive composition');
  assert.ok(composed.recommendations.some(item => item.id === 'generic:table:reconcile-totals'), 'general recommendations must remain available');
  assert.ok(composed.recommendations.some(item => item.id === 'specialty:customer-activity:review'), 'specialist recommendations must be added, not substituted');
  assert.equal(composed.businessQuestion, 'السؤال المتخصص يجب أن يبقى ظاهرًا', 'specialist business question remains primary');


  console.log('GENERIC FILE ANALYSIS PASS');
  console.log('STRUCTURED XLSX CUSTOMER PORTFOLIO PASS rows=3 columns=17 mapped=17 status/trend/reconciliation');
}

await main();