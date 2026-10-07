import assert from 'node:assert/strict';
import { parseFile } from '../src/lib/file-engine/adapters.ts';
import { detectFormat } from '../src/lib/file-engine/detector.ts';
import { buildGenericFileIntelligence } from '../src/lib/file-engine/generic-intelligence.ts';

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
  console.log('GENERIC FILE ANALYSIS PASS');
}

await main();