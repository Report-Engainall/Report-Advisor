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
import { detectHeaderRow, rowsFromDetectedHeader } from '../src/lib/file-engine/header-detection.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`File-engine regression failed: ${message}`);
}

assert(normalizeArabicDigits('١٢٣٤٥') === '12345', 'Arabic-Indic digits must normalize');
assert(normalizeArabicText('آثارٌ  تجارية') === 'اثار تجاريه', 'Arabic text normalization must be deterministic');
assert(normalizeHeader('  رَقَمُ   الصَّنْف  ') === 'رقم الصنف', 'header normalization must remove diacritics and spacing');
assert(normalizeHeader('اﻹجمالي') === 'الاجمالي', 'Arabic presentation forms must normalize before synonym mapping');

assert(parseNumber('١٬٢٣٤٫٥٠') === 1234.5, 'Arabic thousands/decimal separators');
assert(parseNumber('1,234.50') === 1234.5, 'Western thousands/decimal separators');
assert(parseNumber('1.234,50') === 1234.5, 'European thousands/decimal separators');
assert(parseNumber('1,23') === 1.23, 'short comma decimal');
assert(parseNumber('2,275,00') === 2275, 'legacy comma-decimal values must normalize without 100x inflation');
assert(parseNumber('٣٬٢٥٠٬٠٠') === 3250, 'Arabic grouped decimal separators must normalize');
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

const headerMatrix = [
  ['الرصيد', 'دائن', 'التاريخ 2026-'],
  ['10', '2,275,00', '08-16'],
  ['الرصيد', 'دائن', 'التاريخ 2026-'],
  ['11', '3,250,00', '08-17'],
];
const headerCandidate = detectHeaderRow(headerMatrix);
assert(headerCandidate !== null, 'header detector must identify the business header');
const reconstructedRows = rowsFromDetectedHeader(headerMatrix, headerCandidate!);
assert(reconstructedRows.length === 2, 'repeated PDF page headers must be suppressed');
assert(reconstructedRows[0]?.['التاريخ'] === '2026-08-16', 'date year fragment must be reconstructed only from explicit header context');
assert(reconstructedRows[1]?.['التاريخ'] === '2026-08-17', 'second date must use the same explicit header year');

console.log('File-engine behavioral regressions: PASS');
