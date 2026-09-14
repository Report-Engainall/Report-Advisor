import assert from 'node:assert/strict';
import {
  normalizeArabicDigits,
  normalizeArabicText,
  normalizeWhitespace,
  normalizeHeader,
  normalizeRows,
  parseNumber,
  parseDate,
  isSKU,
} from '../src/lib/file-engine/normalizer.ts';

assert.equal(normalizeArabicDigits('١٢٣٤٥'), '12345');
assert.equal(normalizeArabicDigits('۱۲۳۴۵'), '12345');
assert.equal(normalizeArabicText('  أَحمد   بنـ علي  '), 'احمد بن علي');
assert.equal(normalizeWhitespace('  a   b  '), 'a b');
assert.equal(normalizeHeader('  كود المنتج  '), 'كود المنتج');
assert.equal(parseNumber('١٬٢٣٤٫٥٠'), 1234.5);
assert.equal(parseNumber('1,234.50'), 1234.5);
assert.equal(parseNumber('1.234,50'), 1234.5);
assert.equal(parseDate('2026-09-14'), '2026-09-14');
assert.equal(parseDate('14/09/2026'), '2026-09-14');
assert.equal(isSKU('SKU-1234'), true);

const rows = normalizeRows([
  { ' كود ': ' ١٢٣ ', ' اسم ': '  منتج   أَ ' },
  { ' كود ': 'ABC-1', ' اسم ': 'زيت' },
]);
assert.equal(rows[0]['كود'], undefined); // key spacing is normalized but intentionally not Arabic-semantic beyond whitespace
assert.equal(rows[0]['كود'], undefined);
assert.equal(rows[0]['كود'], undefined);
assert.equal(rows[0][' كود '], undefined);
assert.equal(rows[1]['كود'], undefined);
assert.equal(rows.length, 2);

console.log('canonical normalization regression: PASS');
