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

if (!('DOMMatrix' in globalThis)) {
  Object.defineProperty(globalThis, 'DOMMatrix', {
    configurable: true,
    value: class DOMMatrix {},
  });
}
const { parseFile } = await import('../src/lib/file-engine/adapters.ts');

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

function pdfWithText(text: string): ArrayBuffer {
  const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const stream = `BT /F1 12 Tf 40 760 Td (${escaped}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [0];
  let position = header.length;
  objects.forEach((object, index) => {
    offsets.push(position);
    const rendered = `${index + 1} 0 obj\n${object}\nendobj\n`;
    body += rendered;
    position += rendered.length;
  });
  const xrefOffset = header.length + body.length;
  const xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\n`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return new TextEncoder().encode(header + body + xref + trailer).buffer;
}

async function assertStructuredPdf(text: string, expectedInvoiceNumber: string): Promise<void> {
  const datasets = await parseFile(pdfWithText(text), 'structured-regression.pdf', 'pdf');
  assert(datasets.length === 1, 'PDF must produce one structured dataset');
  const [dataset] = datasets;
  assert(dataset.rows.length === 1, 'structured PDF must produce one business row');
  assert(dataset.rows[0]?.invoice_number === expectedInvoiceNumber, 'invoice_number must terminate before date label');
  assert(dataset.rows[0]?.invoice_date === '2026-09-15', 'date must be extracted from structured PDF');
  assert(dataset.rows[0]?.customer_name === 'Test Customer', 'customer_name must remain structured');
  assert(dataset.rows[0]?.total === 15, 'total must remain structured');
  assert(dataset.qualityScore >= 75, `structured PDF quality must stay above commit threshold, got ${dataset.qualityScore}`);
  assert(!('line_number' in dataset.rows[0]! || 'text' in dataset.rows[0]!), 'structured PDF must not fall back to generic text rows');
}

await assertStructuredPdf('Invoice Number: INV-123 Date: 2026-09-15 Customer Name: Test Customer Total: 15', 'INV-123');
await assertStructuredPdf('Invoice Number: INV-LEGACY Date 2026-09-15 Customer Name: Test Customer Total: 15', 'INV-LEGACY');

console.log('File-engine behavioral regressions: PASS');
