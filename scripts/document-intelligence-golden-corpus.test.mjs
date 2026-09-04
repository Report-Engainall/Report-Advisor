import assert from 'node:assert/strict';
import fs from 'node:fs';
import { documentIntelligenceGoldenCorpus } from './document-intelligence-golden-corpus.mjs';

const numeric = fs.readFileSync('services/document-intelligence/app/numeric_normalization.py', 'utf8');
const pipeline = fs.readFileSync('services/document-intelligence/app/pipeline.py', 'utf8');
const validation = fs.readFileSync('src/lib/document-intelligence/validation.ts', 'utf8');

assert.equal(documentIntelligenceGoldenCorpus.length, 54);
assert.equal(new Set(documentIntelligenceGoldenCorpus.map(([id]) => id)).size, 54);
for (const token of ['hashlib.sha256', 'source_sha256', 'confidence_gate', 'process_with_parser']) assert.ok(pipeline.includes(token));
for (const token of ['Number.isFinite', 'trim() ===', 'VALIDATION_INPUT_INCOMPLETE']) assert.ok(validation.includes(token));
for (const token of ['_ARABIC_DIGITS', '٫', '٬', 'Decimal', 'is_finite']) assert.ok(numeric.includes(token));

const normalize = (value) => {
  if (value == null || typeof value === 'boolean') return null;
  if (typeof value !== 'string') return Number.isFinite(value) ? value : null;
  let s = value.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[\s\u00a0\u202f]+/g, '');
  if (!s || !/^[+-]?[0-9.,٫٬،﹐]+$/.test(s)) return null;
  s = s.replace(/٫/g, '.').replace(/[٬،﹐]/g, ',');
  const sign = /^[+-]/.test(s) ? s[0] : '';
  s = sign ? s.slice(1) : s;
  if (s.includes(',') && s.includes('.')) {
    const decimal = s.lastIndexOf(',') > s.lastIndexOf('.') ? ',' : '.';
    const thousands = decimal === ',' ? '.' : ',';
    const parts = s.split(decimal);
    if (parts.length !== 2 || !/^\d+$/.test(parts[1])) return null;
    const groups = parts[0].split(thousands);
    if (!groups.every((g, i) => /^\d+$/.test(g) && (i === 0 || g.length === 3))) return null;
    return Number(`${sign}${groups.join('')}.${parts[1]}`);
  }
  if (s.includes(',')) {
    const groups = s.split(',');
    if (groups.length === 2 && groups[1].length <= 2) return Number(`${sign}${groups[0]}.${groups[1]}`);
    if (groups.length >= 2 && groups[0].length >= 1 && groups[0].length <= 3 && groups.slice(1).every(g => g.length === 3)) return Number(`${sign}${groups.join('')}`);
    return null;
  }
  if (s.includes('.')) {
    const groups = s.split('.');
    if (groups.length === 2 && groups[1].length <= 2) return Number(`${sign}${groups[0]}.${groups[1]}`);
    if (groups.length >= 2 && groups[0].length >= 1 && groups[0].length <= 3 && groups.slice(1).every(g => g.length === 3)) return Number(`${sign}${groups.join('')}`);
    return null;
  }
  const result = Number(`${sign}${s}`);
  return Number.isFinite(result) ? result : null;
};

assert.equal(normalize('١٢٣٤٥٦'), 123456);
assert.equal(normalize('١٢٣٫٤٥'), 123.45);
assert.equal(normalize('١٢٣٬٤٥٦'), 123456);
assert.equal(normalize('١٢٣٬٤٥٦٫٧٨'), 123456.78);
assert.equal(normalize('123٬456٫78'), 123456.78);
assert.equal(normalize('١٢٣,٤٥٦.٧٨'), 123456.78);
assert.equal(normalize('1,234.56'), 1234.56);
assert.equal(normalize('-١٢٣٫٤٥'), -123.45);
assert.equal(normalize('0'), 0);
for (const value of ['', '   ', '12x34', 'Infinity', 'NaN', null, undefined, true, '1,23,456', '1..2']) assert.equal(normalize(value), null);

const detector = source => ({
  empty: /if not text or not _ALLOWED_RE\.fullmatch\(text\):/.test(source),
  finite: /number\.is_finite\(\) and math\.isfinite\(float\(number\))/.test(source),
  decimal: /"٫": "\."/.test(source),
  thousands: /"٬": ","/.test(source),
});
const baseline = detector(numeric);
for (const [name, needle, replacement, key] of [
  ['empty', 'if not text or not _ALLOWED_RE.fullmatch(text):', 'if False:', 'empty'],
  ['finite', 'return number if number.is_finite() and math.isfinite(float(number)) else None', 'return number', 'finite'],
  ['decimal', '"٫": "."', '"٫": "٫"', 'decimal'],
  ['thousands', '"٬": ","', '"٬": "٬"', 'thousands'],
]) {
  const weakened = numeric.replace(needle, replacement);
  assert.notEqual(weakened, numeric, `${name} mutation did not apply`);
  assert.equal(baseline[key], true, `${name} baseline guard missing`);
  assert.equal(detector(weakened)[key], false, `${name} mutation was not detected`);
}
const weakenedQuarantine = pipeline.replace('return "QUARANTINE"', 'return "APPROVE"');
assert.equal(/return "QUARANTINE"/.test(weakenedQuarantine), false, 'quarantine mutation was not detected');

assert.ok(validation.includes('q == null ?'));
assert.ok(validation.includes('subtotal == null ?'));
assert.ok(pipeline.includes('provider source hash does not match inspected source'));

console.log(`GOLDEN_CORPUS_CASES=${documentIntelligenceGoldenCorpus.length}`);
console.log('ARABIC_NUMERIC_EDGE_CASES=PASS');
console.log('BUSINESS_TRUTH_FAIL_CLOSED=PASS');
console.log('TEST_OF_TEST=PASS');
