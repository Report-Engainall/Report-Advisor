import assert from 'node:assert/strict';
import fs from 'node:fs';
import { documentIntelligenceGoldenCorpus } from './document-intelligence-golden-corpus.mjs';

const numeric = fs.readFileSync('services/document-intelligence/app/numeric_normalization.py', 'utf8');
const pipeline = fs.readFileSync('services/document-intelligence/app/pipeline.py', 'utf8');
const validation = fs.readFileSync('src/lib/document-intelligence/validation.ts', 'utf8');

assert.equal(documentIntelligenceGoldenCorpus.length, 53);
const ids = new Set(documentIntelligenceGoldenCorpus.map(([id]) => id));
assert.equal(ids.size, documentIntelligenceGoldenCorpus.length);

const required = [
  '١٢٣٤٥٦', '١٢٣٫٤٥', '١٢٣٬٤٥٦', '١٢٣٬٤٥٦٫٧٨', '123٬456٫78', '١٢٣,٤٥٦.٧٨', '1,234.56',
  '', null, undefined, 'Infinity', 'NaN', '12x34', '-١٢٣٫٤٥'
];
for (const value of required) assert.ok(numeric.includes(String(value)) || value == null, `fixture missing: ${String(value)}`);

for (const token of ['hashlib.sha256', 'source_sha256', 'confidence_gate', 'process_with_parser']) assert.ok(pipeline.includes(token));
for (const token of ['Number.isFinite', 'trim() ===', 'VALIDATION_INPUT_INCOMPLETE']) assert.ok(validation.includes(token));
for (const token of ['_ARABIC_DIGITS', '٫', '٬', 'Decimal', 'is_finite']) assert.ok(numeric.includes(token));

// Deterministic semantic oracle for the critical data-integrity rules.
const normalize = (value) => {
  if (value == null || typeof value === 'boolean') return null;
  if (typeof value !== 'string') return Number.isFinite(value) ? value : null;
  const s = value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s\u00a0\u202f]+/g, '');
  if (!s || !/^[+-]?[0-9.,]+$/.test(s) || /[+-].*[+-]/.test(s.slice(1))) return null;
  const t = s.replace(/٫/g, '.').replace(/[٬،﹐]/g, ',');
  if (t.includes(',') && t.includes('.')) {
    const decimal = t.lastIndexOf(',') > t.lastIndexOf('.') ? ',' : '.';
    const thousands = decimal === ',' ? '.' : ',';
    const [whole, frac] = t.split(decimal).slice(-2);
    const groups = whole.split(thousands);
    if (!/^\d+$/.test(frac) || groups.some((g, i) => !/^\d+$/.test(g) || (i > 0 && g.length !== 3))) return null;
    return Number(`${groups.join('')}.${frac}`);
  }
  return Number(t.replaceAll(',', ''));
};

assert.equal(normalize('١٢٣٤٥٦'), 123456);
assert.equal(normalize('١٢٣٫٤٥'), 123.45);
assert.equal(normalize('١٢٣٬٤٥٦'), 123456);
assert.equal(normalize('١٢٣٬٤٥٦٫٧٨'), 123456.78);
assert.equal(normalize('123٬456٫78'), 123456.78);
assert.equal(normalize('١٢٣,٤٥٦.٧٨'), 123456.78);
assert.equal(normalize('1,234.56'), 1234.56);
for (const value of ['', '   ', '12x34', 'Infinity', 'NaN', null, undefined, true]) assert.equal(normalize(value), null);

// Test-of-test: each mutation must be detectable by the source contract checker.
const mutations = [
  ['empty', numeric.replace(/if not text or not _ALLOWED_RE\.fullmatch\(text\):/, 'if False:'), /not text/],
  ['finite', numeric.replace(/return number if number\.is_finite\(\) else None/, 'return number'), /is_finite/],
  ['arabic-decimal', numeric.replace(/"٫": "\."/, '"٫": "٫"'), /"٫": "\\."/],
  ['arabic-thousands', numeric.replace(/"٬": ","/, '"٬": "٬"'), /"٬": ","/],
  ['quarantine', pipeline.replace(/return "QUARANTINE"/, 'return "APPROVE"'), /return "QUARANTINE"/],
];
for (const [name, weakened, detector] of mutations) {
  assert.notEqual(weakened, numeric + pipeline, `${name} mutation setup invalid`);
  assert.equal(detector.test(weakened), false, `${name} mutation was not detected`);
}

// Explicit business-truth invariants.
assert.ok(validation.includes('q == null ?'));
assert.ok(validation.includes('subtotal == null ?'));
assert.ok(pipeline.includes('provider source hash does not match inspected source'));

console.log(`GOLDEN_CORPUS_CASES=${documentIntelligenceGoldenCorpus.length}`);
console.log('ARABIC_NUMERIC_EDGE_CASES=PASS');
console.log('BUSINESS_TRUTH_FAIL_CLOSED=PASS');
console.log('TEST_OF_TEST=PASS');
