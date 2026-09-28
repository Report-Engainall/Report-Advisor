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
import { extractPdfTableRowsFromTextItems } from '../src/lib/file-engine/adapters.ts';
import { mapColumns } from '../src/lib/file-engine/synonyms.ts';

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

const aghbariSalesReportHeaders = [
  'رقم الفاتورة',
  'التاريخ',
  'نوع الفاتورة',
  'اسم العميل',
  'مبلغ الفاتورة',
  'الخصم',
  'اﻷعباء',
  'الضريبة',
  'اجمالي الفاتورة',
  'مبلغ الصافي بالمحلي',
  'العملة',
];
const aghbariSalesReportMappings = await mapColumns(aghbariSalesReportHeaders);
const expectedAghbariSalesMappings = [
  ['invoice_number', 98],
  ['date', 96],
  ['invoice_type', 94],
  ['customer_name', 98],
  ['invoice_amount', 94],
  ['discount', 94],
  ['charges', 90],
  ['tax_amount', 98],
  ['total', 98],
  ['net_local_amount', 92],
  ['currency', 96],
];
assert(
  aghbariSalesReportMappings.length === expectedAghbariSalesMappings.length,
  'Aghbari sales report header count',
);
expectedAghbariSalesMappings.forEach(([expectedField, expectedConfidence], index) => {
  const actual = aghbariSalesReportMappings[index];
  assert(actual?.mappedField === expectedField, `Aghbari sales header #${index + 1} canonical mapping`);
  assert(actual?.confidence === expectedConfidence, `Aghbari sales header #${index + 1} confidence`);
  assert(actual?.requiresReview === false, `Aghbari sales header #${index + 1} must not require review`);
});
assert(
  aghbariSalesReportMappings.find((mapping) => mapping.sourceColumn === 'التاريخ')?.mappedField === 'date',
  'generic report date must remain date until semantic source understanding proves invoice_date',
);
console.log('Aghbari Arabic sales-report header regression: PASS');

const syntheticPdfItems = [
  { str: 'رقم الفاتورة', x: 20, y: 700, width: 60 },
  { str: 'التاريخ', x: 100, y: 700, width: 40 },
  { str: 'نوع الفاتورة', x: 160, y: 700, width: 65 },
  { str: 'اسم العميل', x: 240, y: 700, width: 65 },
  { str: 'اﻷعباء', x: 320, y: 700, width: 45 },
  { str: 'اجمالي الفاتورة', x: 380, y: 700, width: 80 },
  { str: '191', x: 30, y: 680, width: 20 },
  { str: '02/06/2026', x: 100, y: 680, width: 55 },
  { str: 'آجل', x: 175, y: 680, width: 20 },
  { str: 'امين ابو طالب', x: 240, y: 680, width: 70 },
  { str: '100', x: 330, y: 680, width: 20 },
  { str: '2,270,000.00', x: 390, y: 680, width: 60 },
  { str: '192', x: 30, y: 660, width: 20 },
  { str: '03/06/2026', x: 100, y: 660, width: 55 },
  { str: 'نقد', x: 175, y: 660, width: 20 },
  { str: 'علي عبدﷲ', x: 240, y: 660, width: 65 },
  { str: '200', x: 330, y: 660, width: 20 },
  { str: '465,000.00', x: 390, y: 660, width: 60 },
];
const pdfTableRegression = extractPdfTableRowsFromTextItems(syntheticPdfItems);
assert(pdfTableRegression.header?.anchors.length === 6, 'PDF native table header detection');
assert(
  pdfTableRegression.header?.anchors.map(anchor => anchor.header).join('|') === 'رقم الفاتورة|التاريخ|نوع الفاتورة|اسم العميل|اﻷعباء|اجمالي الفاتورة',
  'PDF header anchors must preserve adjacent columns without span overmatching',
);

assert(pdfTableRegression.rows.length === 2, 'PDF native table row reconstruction');
assert(pdfTableRegression.rows[0]?.['رقم الفاتورة'] === '191', 'PDF invoice number column reconstruction');
assert(pdfTableRegression.rows[0]?.['اجمالي الفاتورة'] === '2,270,000.00', 'PDF monetary column reconstruction');
assert(pdfTableRegression.rows[1]?.['اسم العميل'] === 'علي عبدﷲ', 'PDF customer column reconstruction');

const secondPageItems = syntheticPdfItems
  .filter((item) => item.y < 700)
  .map((item) => ({ ...item, y: item.y - 300 }));
const pdfSecondPageRegression = extractPdfTableRowsFromTextItems(secondPageItems, pdfTableRegression.header);
assert(pdfSecondPageRegression.rows.length === 2, 'PDF fallback header must reconstruct subsequent pages');
assert(pdfSecondPageRegression.rows[0]?.['رقم الفاتورة'] === '191', 'PDF subsequent-page invoice reconstruction');
assert(pdfSecondPageRegression.rows[1]?.['اجمالي الفاتورة'] === '465,000.00', 'PDF subsequent-page monetary reconstruction');

console.log('File-engine behavioral regressions: PASS');
