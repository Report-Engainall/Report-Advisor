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
    { format: 'txt', name: 'risk.txt', source: 'توجد مشكلة في المخزون\nيجب مراجعة الكميات المتأخرة\nالإجمالي 1200 ريال', expectedRows: 3, expectedEvidence: 'مشكلة في المخزون' },
    { format: 'csv', name: 'risk.csv', source: 'اسم الصنف,الحالة,الإجمالي\nصنف متأخر,تأخير,100\nصنف سليم,مكتمل,200', expectedRows: 2, expectedEvidence: 'تأخير' },
    { format: 'json', name: 'risk.json', source: '[{"name":"صنف متأخر","status":"تأخير","total":100},{"name":"صنف سليم","status":"مكتمل","total":200}]', expectedRows: 2, expectedEvidence: 'تأخير' },
    { format: 'jsonl', name: 'risk.jsonl', source: '{"name":"صنف متأخر","status":"تأخير","total":100}\n{"name":"صنف سليم","status":"مكتمل","total":200}', expectedRows: 2, expectedEvidence: 'تأخير' },
    { format: 'xml', name: 'sales.xml', source: '<root><row><product>صنف 1</product><status>تأخير</status><total>100</total></row><row><product>صنف 2</product><status>مكتمل</status><total>200</total></row></root>', expectedRows: 2, expectedEvidence: 'تأخير' },
    { format: 'yaml', name: 'sales.yaml', source: '- product: صنف 1\n  status: تأخير\n  total: 100\n- product: صنف 2\n  status: مكتمل\n  total: 200', expectedRows: 2, expectedEvidence: 'تأخير' },
    { format: 'markdown', name: 'notes.md', source: '# متابعة\nتوجد مشكلة في المخزون\nيجب مراجعة الكميات المتأخرة\nالإجمالي 1200 ريال', expectedRows: 4, expectedEvidence: 'مشكلة في المخزون' },
    { format: 'rtf', name: 'note.rtf', source: '{\\rtf1\\ansi خطر تأخير\\par يجب المراجعة\\par}', expectedRows: 2, expectedEvidence: 'تأخير' },
  ];
  for (const item of cases) {
    const datasets = await parseFile(buffer(item.source), item.name, item.format);
    assert.equal(datasets.length, 1, item.format + ' should produce one dataset');
    assert.equal(datasets[0].rowCount, item.expectedRows, item.format + ' row count');
    const intelligence = buildGenericFileIntelligence(datasets[0], item.format);
    assert.ok(intelligence.summary.length > 20, item.format + ' summary');
    assert.ok(intelligence.findings.length > 0, item.format + ' must expose source-derived findings');
    assert.ok(intelligence.guidance.boundary.includes('لا يحول'), item.format + ' evidence boundary');
    if (item.expectedEvidence) {
      assert.ok(JSON.stringify(intelligence).includes(item.expectedEvidence), item.format + ' output must retain evidence from the uploaded content');
    }
    if (['csv', 'json', 'jsonl', 'xml', 'yaml'].includes(item.format)) {
      assert.ok(!intelligence.summary.includes('ملف نشاط العملاء'), item.format + ' must not infer a customer portfolio from generic entity/status/total columns');
      assert.notEqual(intelligence.findings[0]?.title, 'ملف نشاط العملاء', item.format + ' generic table finding must remain domain-neutral');
    }
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
  assert.equal(universalPortfolio.archetype?.id, 'customers.activity', 'customer portfolio s  const generalOnlySignal = portfolioIntelligence.signals.find(signal => signal.id === 'generic:table:source-status');
  assert.ok(generalOnlySignal, 'general layer must include a source-derived status signal');
  const sharedSignal = portfolioIntelligence.signals.find(signal => signal.id !== generalOnlySignal.id);
  assert.ok(sharedSignal, 'general layer must have a second signal to test overlap');
  const sharedId = sharedSignal.id;
  const generalOnlyRecommendation = portfolioIntelligence.recommendations.find(item => item.id === 'generic:table:reconcile-totals');
  assert.ok(generalOnlyRecommendation, 'general layer must include its source-derived totals reconciliation recommendation');
  const specialistEvidence = 'specialist-proof=customer-activity';
  const generalEvidence = 'general-proof=raw-source-content';
  const specialistLayer = {
    ...sourceBoundPreview,
    businessQuestion: 'السؤال المتخصص يجب أن يبقى ظاهرًا',
    summary: 'التحليل المتخصص',
    signals: [
      { ...sharedSignal, title: 'الإشارة المتخصصة', evidence: [specialistEvidence] },
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
      { ...sourceBoundPreview.recommendations[0], id: 'specialty:customer-activity:review', title: 'توصية متخصصة' },
    ],
    findings: [],
    risks: [],
    opportunities: [],
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
  assert.ok(composed.signals.some(signal => signal.id === generalOnlySignal.id), 'general-only signals must survive when specialty is present');
  assert.ok(composed.signals.some(signal => signal.id === 'specialty:customer-activity:source-bound'), 'specialist-only signals must survive composition');
  assert.ok(composed.recommendations.some(item => item.id === generalOnlyRecommendation.id), 'general-only recommendations must remain available');
  assert.ok(composed.recommendations.some(item => item.id === 'specialty:customer-activity:review'), 'specialist recommendations must be added, not substituted');
  assert.equal(composed.businessQuestion, 'السؤال المتخصص يجب أن يبقى ظاهرًا', 'specialist business question remains primary');
em.id === 'generic:table:reconcile-totals'), 'general recommendations must remain available');
  assert.ok(composed.recommendations.some(item => item.id === 'specialty:customer-activity:review'), 'specialist recommendations must be added, not substituted');
  assert.equal(composed.businessQuestion, 'السؤال المتخصص يجب أن يبقى ظاهرًا', 'specialist business question remains primary');


  console.log('GENERIC FILE ANALYSIS PASS');
  console.log('STRUCTURED XLSX CUSTOMER PORTFOLIO PASS rows=3 columns=17 mapped=17 status/trend/reconciliation');
}

await main();