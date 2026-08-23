import { detectHeaderRow, rowsFromDetectedHeader } from '../src/lib/file-engine/header-detection.ts';

const rows = [
  ['تقرير المخزون', '', '', ''],
  ['تم التحديث', '2026-08-23', '', ''],
  ['رقم الصنف', 'اسم الصنف', 'السعر', 'الكمية'],
  ['A-100', 'سكر', '1200', '25'],
  ['A-101', 'أرز', '1500', '18'],
];

const candidate = detectHeaderRow(rows);
if (!candidate || candidate.rowIndex !== 2) {
  throw new Error(`Expected header row 2, got ${candidate?.rowIndex ?? 'none'}`);
}

const parsed = rowsFromDetectedHeader(rows, candidate);
if (parsed.length !== 2 || parsed[0]['رقم الصنف'] !== 'A-100' || parsed[1]['الكمية'] !== '18') {
  throw new Error('Detected header rows were not converted correctly');
}

const simple = detectHeaderRow([
  ['SKU', 'Name', 'Price'],
  ['A-1', 'Item', '10'],
]);
if (!simple || simple.rowIndex !== 0) throw new Error('First-row header detection failed');

console.log('Header detection contract: PASS');
