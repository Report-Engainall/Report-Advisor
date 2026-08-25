import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fixtureRoot = path.join(root, 'fixtures', 'secondary-batch02');
const expectations = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'expectations.json'), 'utf8'));
const results = [];

function pass(file, reason) { return { file, status: 'PASS', reason }; }
function fail(file, reason) { return { file, status: 'FAIL', reason }; }
function skipped(file, reason) { return { file, status: 'SKIPPED', reason }; }
function csvRows(text) { return text.trim().split(/\r?\n/).map(line => line.split(',')); }
function hasArabic(text) { return /[\u0600-\u06ff]/u.test(text); }
function numeric(value) { return value !== '' && Number.isFinite(Number(value)); }

function evaluateCase(item) {
  const file = item.file;
  const expected = item.expect;
  const full = path.join(fixtureRoot, file);
  if (!fs.existsSync(full)) return fail(file, 'Fixture missing');
  const text = fs.readFileSync(full, 'utf8');
  if (!text.trim()) return fail(file, 'Fixture is empty');

  if (expected.format === 'json') {
    let data;
    try { data = JSON.parse(text); } catch { return fail(file, 'Expected valid JSON'); }
    for (const [key, value] of Object.entries(expected)) {
      if (['format', 'requiresEvidence'].includes(key)) continue;
      if (key === 'delta') {
        if (data.totals?.[0]?.delta !== value) return fail(file, `Expected totals[0].delta=${value}`);
        continue;
      }
      if (data[key] !== value) return fail(file, `Expected ${key}=${JSON.stringify(value)}, got ${JSON.stringify(data[key])}`);
    }
    if (expected.requiresEvidence && data.status === 'UNKNOWN' && data.reason?.toLowerCase().includes('evidence') !== true) return fail(file, 'UNKNOWN case must state evidence insufficiency');
    return pass(file, 'Authoritative JSON contract fields match expectations');
  }

  if (expected.format === 'csv') {
    const rows = csvRows(text);
    const header = rows[0] ?? [];
    const isHeaderless = expected.header === false;
    const dataRows = isHeaderless ? rows : rows.slice(1);
    if (expected.header === true && header.length < 2) return fail(file, 'Expected a header row');
    if (isHeaderless && header.some(cell => /^(sku|product_name|quantity|unit_price)$/i.test(cell.trim()))) return fail(file, 'Expected headerless input');
    if (expected.minRows && dataRows.length < expected.minRows) return fail(file, `Expected at least ${expected.minRows} data rows`);
    for (const token of expected.requiredTokens ?? []) if (!text.includes(token)) return fail(file, `Missing required token: ${token}`);

    if (expected.duplicateKey) {
      const index = header.indexOf(expected.duplicateKey);
      if (index < 0) return fail(file, `Duplicate key column not found: ${expected.duplicateKey}`);
      const counts = new Map(dataRows.map(row => [row[index], 0]));
      for (const row of dataRows) counts.set(row[index], (counts.get(row[index]) ?? 0) + 1);
      const duplicates = [...counts.values()].filter(count => count > 1).reduce((sum, count) => sum + count - 1, 0);
      if (duplicates !== expected.expectedDuplicateCount) return fail(file, `Expected duplicate count ${expected.expectedDuplicateCount}, got ${duplicates}`);
    }

    if (expected.missingFields) {
      const missingRows = dataRows.filter(row => row.some(cell => cell.trim() === '')).length;
      if (missingRows !== expected.expectedMissingFieldRows) return fail(file, `Expected missing-field rows ${expected.expectedMissingFieldRows}, got ${missingRows}`);
    }

    if (expected.schemaQuality === 'BAD_HEADERS' && !header.every(cell => /^field_[a-z]$/i.test(cell.trim()))) return fail(file, 'Bad-header contract not satisfied');

    const numericColumns = isHeaderless ? [2, 3] : header.reduce((indexes, name, index) => /quantity|price|amount/i.test(name) ? [...indexes, index] : indexes, []);
    if (numericColumns.length && dataRows.some(row => numericColumns.some(index => row[index] !== undefined && row[index] !== '' && !numeric(row[index])))) return fail(file, 'Normalization contract: expected numeric columns contain non-numeric values');

    if (expected.language === 'ar' && !hasArabic(text)) return fail(file, 'Expected Arabic content');
    if (expected.language === 'en' && hasArabic(text)) return fail(file, 'Expected English-only content');
    return pass(file, 'Schema/header, mapping tokens, normalization, and row-shape expectations match');
  }

  for (const token of expected.requiredTokens ?? []) if (!text.includes(token)) return fail(file, `Missing required token: ${token}`);
  if (expected.language === 'ar' && !hasArabic(text)) return fail(file, 'Expected Arabic content');
  if (expected.language === 'en' && hasArabic(text)) return fail(file, 'Expected English content without Arabic characters');
  if (expected.mergedCells && !/merged from row/i.test(text)) return fail(file, 'Merged-cell marker missing');
  if (expected.tableCount && (text.match(/^TABLE [A-Z]:/gim) ?? []).length !== expected.tableCount) return fail(file, `Expected ${expected.tableCount} tables`);
  if (expected.multiPage && (text.match(/^PAGE \d+/gim) ?? []).length !== expected.pageCount) return fail(file, `Expected ${expected.pageCount} pages`);
  if (expected.ocr && !/invoice|فاتورة/i.test(text)) return fail(file, 'OCR document marker missing');
  return pass(file, 'Document language/structure/normalization contract expectations match');
}

if (process.env.SECONDARY_BATCH04_SKIP === '1') {
  for (const item of expectations.cases) results.push(skipped(item.file, 'SECONDARY_BATCH04_SKIP=1'));
} else {
  for (const item of expectations.cases) results.push(evaluateCase(item));
}

const counts = results.reduce((a, r) => { a[r.status] += 1; return a; }, { PASS: 0, FAIL: 0, SKIPPED: 0 });
console.log(JSON.stringify({ harness: 'secondary-batch04-golden-contract', version: expectations.version, expectedCases: expectations.cases.length, counts, results }, null, 2));
if (counts.FAIL > 0) process.exitCode = 1;
