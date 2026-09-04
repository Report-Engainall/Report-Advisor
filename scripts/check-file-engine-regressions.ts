import {
  isPhone, normalizeArabicDigits, normalizeArabicText, normalizeHeader,
  parseCurrency, parseDate, parseNumber,
} from '../src/lib/file-engine/normalizer.ts';
import { cleanValue, detectColumnDataType } from '../src/lib/file-engine/data-types.ts';
import { ARCHIVE_RESOURCE_LIMITS, assertSafeZipResources, isUnsafeArchivePath } from '../src/lib/file-engine/archive-security.ts';
import { parseFile, parseSpreadsheet } from '../src/lib/file-engine/adapters.ts';

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

function zipWithEntries(entries: Array<{ name: string; compressed: number; expanded: number }>): ArrayBuffer {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = enc.encode(entry.name);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(18, 0, true);
    lv.setUint32(22, entry.compressed, true); lv.setUint32(26, entry.expanded, true); lv.setUint16(26, name.length, true);
    local.set(name, 30); parts.push(local);
    const c = new Uint8Array(46 + name.length); const cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint32(20, entry.compressed, true); cv.setUint32(24, entry.expanded, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); c.set(name, 46); central.push(c);
    offset += local.length;
  }
  const centralOffset = offset; const centralSize = central.reduce((n, x) => n + x.length, 0);
  const eocd = new Uint8Array(22); const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true); ev.setUint32(12, centralSize, true); ev.setUint32(16, centralOffset, true);
  const out = new Uint8Array(offset + centralSize + 22); let p = 0; for (const part of parts) { out.set(part, p); p += part.length; } for (const part of central) { out.set(part, p); p += part.length; } out.set(eocd, p); return out.buffer;
}

const normal = zipWithEntries([{ name: 'word/document.xml', compressed: 100, expanded: 1000 }]);
assert(() => assertSafeZipResources(normal, 'docx'), 'normal DOCX archive should be accepted');
assert(isUnsafeArchivePath('../evil.xml'), 'archive traversal path must be detected');
const ratioBomb = zipWithEntries([{ name: 'word/document.xml', compressed: 1, expanded: ARCHIVE_RESOURCE_LIMITS.maxCompressionRatio + 1 }]);
try { assertSafeZipResources(ratioBomb, 'docx'); throw new Error('compression-ratio bomb was accepted'); } catch (error) { assert(String(error).includes('COMPRESSION_RATIO_EXCEEDED'), 'compression-ratio bomb must fail closed'); }
const sizeBomb = zipWithEntries([{ name: 'xl/sharedStrings.xml', compressed: 1000, expanded: ARCHIVE_RESOURCE_LIMITS.maxExpandedBytes + 1 }]);
try { assertSafeZipResources(sizeBomb, 'xlsx'); throw new Error('expanded-size bomb was accepted'); } catch (error) { assert(String(error).includes('EXPANDED_SIZE_LIMIT_EXCEEDED'), 'expanded-size bomb must fail closed'); }

await assertParserRejectsArchiveBomb(ratioBomb, 'bomb.docx', 'docx');
await assertParserRejectsArchiveBomb(sizeBomb, 'bomb.xlsx', 'xlsx');

async function assertParserRejectsArchiveBomb(buffer: ArrayBuffer, name: string, format: 'docx' | 'xlsx'): Promise<void> {
  let rejected = false;
  try { if (format === 'docx') await parseFile(buffer, name, format); else await parseSpreadsheet(buffer, name, format); } catch (error) { rejected = String(error).includes('COMPRESSION_RATIO_EXCEEDED') || String(error).includes('EXPANDED_SIZE_LIMIT_EXCEEDED'); }
  assert(rejected, `${format} parser must enforce archive resource budget before library parsing`);
}

console.log('File-engine behavioral regressions: PASS');
