import assert from 'node:assert/strict';
import { parseFile } from '../src/lib/file-engine/adapters.ts';
import { detectFormat } from '../src/lib/file-engine/detector.ts';
import { buildGenericFileIntelligence } from '../src/lib/file-engine/generic-intelligence.ts';
import { buildRenderedOutput } from '../src/lib/import/canonical-production-adapter.ts';

function buffer(value) {
  return new TextEncoder().encode(value).buffer;
}

async function main() {
  const unknownText = 'نص عام في ملف غير معروف\nيوجد تأخير ويجب المراجعة\nالإجمالي 1200 ريال';
  const detectedUnknown = detectFormat({ name: 'business.log', size: unknownText.length, type: 'text/plain' }, buffer(unknownText));
  assert.equal(detectedUnknown.format, 'txt', 'unknown readable text should use generic text fallback');
  assert.equal(detectedUnknown.category, 'text', 'generic fallback category');
  assert.ok(detectedUnknown.warnings.some((warning) => warning.includes('مسار النص العام')), 'generic fallback warning');

  const tabularRows = [
    { name: 'أ', amount: 100, count: 10, category: 'أ' },
    { name: 'ب', amount: 150, count: 12, category: 'أ' },
    { name: 'ج', amount: 225, count: 18, category: 'أ' },
    { name: 'د', amount: 900, count: 5, category: 'ب' },
    { name: 'هـ', amount: 950, count: 4, category: 'ب' },
    { name: 'و', amount: 1100, count: 3, category: 'ب' },
  ];
  const tabular = {
    id: 'generic-regression',
    name: 'generic.csv',
    source: 'generic.csv',
    rowCount: tabularRows.length,
    columnCount: 4,
    qualityScore: 98,
    rows: tabularRows,
    preview: tabularRows,
    columns: [
      { name: 'name', mappedField: null, mappingConfidence: 100, dataType: 'text', nullCount: 0, uniqueCount: 6, uniqueRatio: 1, sampleValues: [], statistics: { count: 6 }, qualityIssues: [] },
      { name: 'amount', mappedField: null, mappingConfidence: 100, dataType: 'decimal', nullCount: 0, uniqueCount: 6, uniqueRatio: 1, sampleValues: [], statistics: { count: 6 }, qualityIssues: [] },
      { name: 'count', mappedField: null, mappingConfidence: 100, dataType: 'integer', nullCount: 0, uniqueCount: 6, uniqueRatio: 1, sampleValues: [], statistics: { count: 6 }, qualityIssues: [] },
      { name: 'category', mappedField: null, mappingConfidence: 100, dataType: 'category', nullCount: 0, uniqueCount: 2, uniqueRatio: 0.33, sampleValues: [], statistics: { count: 6 }, qualityIssues: [] },
    ],
  };
  const tabularIntelligence = buildGenericFileIntelligence(tabular, 'csv');
  assert.ok(tabularIntelligence.signals.length >= 1, 'generic tabular source must produce real signals');
  assert.ok(tabularIntelligence.recommendations.length >= 1, 'generic tabular source must produce an actionable recommendation');
  assert.ok(tabularIntelligence.guidance.inspect.some((item) => item.includes('amount')), 'generic intelligence must inspect numeric fields');
  assert.ok(tabularIntelligence.signals.some((signal) => signal.evidence.some((item) => item.startsWith('sample='))), 'generic signal must carry source row evidence');
  assert.ok(tabularIntelligence.advisorBrief.headline.length > 10, 'generic tabular advisor headline');

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
    assert.ok(intelligence.guidance.boundary.includes('لا يحوّل'), item.format + ' evidence boundary');
  }
  const genericCanonicalRows = [
    { rowNumber: 1, data: { stock: 12, note: 'عام', amount: 100 } },
    { rowNumber: 2, data: { stock: 8, note: 'عام', amount: 120 } },
    { rowNumber: 3, data: { stock: 6, note: 'عام', amount: 130 } },
  ];
  const genericRendered = buildRenderedOutput({
    importId: 'generic-regression',
    fileName: 'report.xlsx',
    sourceHash: 'sha256:' + '1'.repeat(64),
    entityType: 'generic:source-data',
    rows: genericCanonicalRows.map((row) => ({
      rowNumber: row.rowNumber,
      data: row.data,
      provenance: { sourceHash: 'sha256:' + '1'.repeat(64), lineageId: 'line-' + row.rowNumber },
    })),
    qualityScore: 90,
    qualityApproved: true,
  });
  assert.equal(genericRendered.sourceSpecialty, null, 'generic canonical imports must not be force-classified from a single stock-like field');
  assert.equal(genericRendered.sourceBound, true, 'generic canonical output must remain source-bound');

  console.log('GENERIC FILE ANALYSIS PASS');
}

await main();