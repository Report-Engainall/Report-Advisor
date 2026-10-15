import assert from 'node:assert/strict';
import { extractPdfTable, extractPdfVisualLines, extractPdfVisualRows, type PdfPageText } from '../src/lib/file-engine/pdf-table.ts';
import { detectHeaderRow } from '../src/lib/file-engine/header-detection.ts';
import { parseFile, hasPdfTextEncodingCorruption } from '../src/lib/file-engine/adapters.ts';

const pages: PdfPageText[] = [
  {
    pageNumber: 1,
    items: [
      { text: 'رقم الصنف', x: 10, y: 700, width: 40, height: 10 },
      { text: 'السعر', x: 100, y: 700, width: 30, height: 10 },
      { text: '10101001', x: 10, y: 680, width: 45, height: 10 },
      { text: '10750', x: 100, y: 680, width: 30, height: 10 },
      { text: '10101002', x: 10, y: 660, width: 45, height: 10 },
      { text: '10850', x: 100, y: 660, width: 30, height: 10 },
    ],
  },
  {
    pageNumber: 2,
    items: [
      { text: '10101003', x: 10, y: 700, width: 45, height: 10 },
      { text: '10800', x: 100, y: 700, width: 30, height: 10 },
    ],
  },
];

assert.equal(hasPdfTextEncodingCorruption('ƕĊƹěƐĉ ƞƓžŅ ŀƗĥŏƓƐĉ ļƺŅĊĥƐĉ ƮƏƓŧƐĉ ƞĥƐĊĺ ŀƹŘņƐĉ 60336'), true);
assert.equal(hasPdfTextEncodingCorruption('رقم الصنف السعر 10101001 10750'), false);

const visualRows = extractPdfVisualRows(pages);
assert.equal(visualRows.length, 4);
assert.deepEqual(visualRows.map(({ pageNumber, lineNumber, cells }) => ({ pageNumber, lineNumber, cells })), [
  { pageNumber: 1, lineNumber: 1, cells: ['رقم الصنف', 'السعر'] },
  { pageNumber: 1, lineNumber: 2, cells: ['10101001', '10750'] },
  { pageNumber: 1, lineNumber: 3, cells: ['10101002', '10850'] },
  { pageNumber: 2, lineNumber: 1, cells: ['10101003', '10800'] },
]);

const lines = extractPdfVisualLines(pages);
assert.equal(lines.length, 4);
assert.deepEqual(lines.map(({ pageNumber, lineNumber, text }) => ({ pageNumber, lineNumber, text })), [
  { pageNumber: 1, lineNumber: 1, text: 'رقم الصنف | السعر' },
  { pageNumber: 1, lineNumber: 2, text: '10101001 | 10750' },
  { pageNumber: 1, lineNumber: 3, text: '10101002 | 10850' },
  { pageNumber: 2, lineNumber: 1, text: '10101003 | 10800' },
]);
assert.ok(!lines.some((line) => line.text.includes('10101001') && line.text.includes('10101003')));
// Regression for the uploaded receivables PDF failure: a pair of organization
// names is followed by an uneven first row. The old 35-point threshold accepted
// the titles as column headers and produced misleading numeric totals.
const suspiciousPages: PdfPageText[] = [{
  pageNumber: 1,
  items: [
    { text: 'AL-Amiry Trading & Cement Marketing - The main', x: 10, y: 700, width: 250, height: 10 },
    { text: 'العامري لتجارة المواد الغذائية - صنعاء', x: 600, y: 700, width: 220, height: 10 },
    { text: '-776777823', x: 10, y: 680, width: 65, height: 10 },
    { text: '1650000', x: 10, y: 660, width: 55, height: 10 },
    { text: '1650000', x: 600, y: 660, width: 55, height: 10 },
    { text: '1127000', x: 10, y: 640, width: 55, height: 10 },
    { text: '1127000', x: 600, y: 640, width: 55, height: 10 },
  ],
}];
const suspiciousRows = extractPdfVisualRows(suspiciousPages);
const suspiciousHeader = detectHeaderRow(suspiciousRows.map((row) => row.cells));
assert.equal(suspiciousHeader?.score, 41, 'fixture must reproduce the weak 41-point organization-name header guess');
assert.equal(extractPdfTable(suspiciousPages), null, 'low-confidence titles must not become a structured numeric table');
assert.deepEqual(suspiciousRows[0]?.cells, [
  'AL-Amiry Trading & Cement Marketing - The main',
  'العامري لتجارة المواد الغذائية - صنعاء',
], 'unconfirmed headers must remain visible as original PDF line evidence');

const confirmedTable = extractPdfTable(pages);
assert.ok(confirmedTable, 'a supported source header must still reconstruct a table');
assert.deepEqual(confirmedTable.headers, ['رقم الصنف', 'السعر']);
assert.equal(confirmedTable.rows.length, 3, 'confirmed table rows must continue across pages');
assert.ok(confirmedTable.confidence >= 55, 'confirmed tables must clear the stronger confidence gate');

const minimalPdf = new TextEncoder().encode('%PDF-1.4\n%%EOF').buffer;
try {
  await parseFile(minimalPdf, 'runtime-check.pdf', 'pdf');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  assert.ok(!/DOMMatrix is not defined/i.test(message), message);
  assert.ok(!/Path2D is not defined/i.test(message), message);
  assert.ok(!/ImageData is not defined/i.test(message), message);
}
console.log('PDF_VISUAL_LINE_FALLBACK_PASS');
