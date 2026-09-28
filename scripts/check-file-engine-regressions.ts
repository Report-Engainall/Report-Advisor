import {
  isPhone,
  normalizeArabicDigits,
  normalizeArabicText,
  normalizeHeader,
  parseCurrency,
  parseDate,
  parseNumber,
} from '../src/lib/file-engine/normalizer.ts';
import { cleanValue, detectColumnDataType } from '../src/lib/file-engine/data-types.ts';
import { inferPdfTableColumns, reconstructPdfTabularRows } from '../src/lib/file-engine/adapters.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`File-engine regression failed: ${message}`);
}

assert(normalizeArabicDigits('١٢٣٤٥') === '12345', 'Arabic-Indic digits must normalize');
assert(normalizeArabicText('آثارٌ  تجارية') === 'اثار تجاريه', 'Arabic text normalization must be deterministic');
assert(normalizeHeader('  رَقَمُ   الصَّنْف  ') === 'رقم الصنف', 'header normalization must remove diacritics and spacing');

assert(parseNumber('١٬٢٣٤٫٥٠') === 1234.5, 'Arabic thousands/decimal separators');
assert(parseNumber('1,234.50') === 1234.5, 'Western thousands/decimal separators');
assert(parseNumber('1.234,50') === 1234.5, 'European thousands/decimal separators');
assert(parseNumber('1,23') === 1.23, 'short comma decimal');
assert(parseCurrency('١٬٢٥٠ ريال') === 1250, 'currency symbols/text must not corrupt value');
assert(parseNumber('١٢٣') === 123, 'Arabic numeric string');
assert(parseNumber('not-a-number') === null, 'invalid numeric input must be null');

assert(parseDate('١٥/٠٨/٢٠٢٦') === '2026-08-15', 'Arabic date digits');
assert(parseDate('2026-8-5') === '2026-08-05', 'ISO date padding');
assert(isPhone('٧٧١٢٣٤٥٦٧٨'), 'Arabic phone digits');

assert(detectColumnDataType(['١٠', '٢٠', '٣٠'], 'الكمية') === 'integer', 'Arabic quantity detection');
assert(detectColumnDataType(['١٬٢٥٠ ريال', '٢٬٥٠٠ ريال'], 'السعر') === 'currency', 'Arabic currency detection');
assert(cleanValue('١٬٢٥٠ ريال', 'currency') === 1250, 'currency cleaning must use canonical parser');
assert(cleanValue('١٢٫٥', 'decimal') === 12.5, 'decimal cleaning must preserve Arabic decimal separator');
assert(cleanValue('١٢٣', 'integer') === 123, 'integer cleaning must normalize Arabic digits');

const pdfItem = (str: string, x: number, y: number) => ({
  str,
  transform: [1, 0, 0, 1, x, y],
  width: str.length * 4,
});

const pdfHeader = [
  pdfItem('اجمالي الفاتورة', 100, 700),
  pdfItem('اسم العميل', 300, 700),
  pdfItem('التاريخ', 500, 700),
  pdfItem('رقم الفاتورة', 650, 700),
];
const pdfPageOne = [
  ...pdfHeader,
  pdfItem('2,270,000.00', 100, 680),
  pdfItem('امين ابو طالب', 300, 680),
  pdfItem('02/06/2026', 500, 680),
  pdfItem('191', 650, 680),
  pdfItem('810,900.00', 100, 660),
  pdfItem('صادق عبدﷲ', 300, 660),
  pdfItem('02/06/2026', 500, 660),
  pdfItem('624', 650, 660),
];
const pdfPageTwo = [
  ...pdfHeader.map(item => ({ ...item, transform: [1, 0, 0, 1, item.transform[4], 700] })),
  pdfItem('348,300.00', 100, 680),
  pdfItem('بكر كامل', 300, 680),
  pdfItem('03/06/2026', 500, 680),
  pdfItem('2998', 650, 680),
  pdfItem('52,800.00', 100, 660),
  pdfItem('ماجد العامري', 300, 660),
  pdfItem('04/06/2026', 500, 660),
  pdfItem('631', 650, 660),
];
const pdfColumns = inferPdfTableColumns(pdfPageOne);
assert(pdfColumns.length === 4, 'PDF table header must discover all business columns');
const pdfRows = [
  ...reconstructPdfTabularRows(pdfPageOne, pdfColumns),
  ...reconstructPdfTabularRows(pdfPageTwo, pdfColumns),
];
assert(pdfRows.length === 4, 'multi-page PDF table reconstruction must preserve all rows');
assert(pdfRows[0].invoice_number === '191', 'PDF row reconstruction must preserve invoice number');
assert(pdfRows[0].customer_name === 'امين ابو طالب', 'PDF row reconstruction must preserve customer name');
assert(pdfRows[2].total === '348,300.00', 'PDF row reconstruction must preserve total on continuation pages');
assert(pdfRows[3].invoice_date === '04/06/2026', 'PDF row reconstruction must preserve continuation-page dates');

console.log('File-engine behavioral regressions: PASS');
