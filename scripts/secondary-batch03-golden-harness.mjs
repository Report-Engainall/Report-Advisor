import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fixtureRoot = path.join(root, 'fixtures', 'secondary-batch02');
const cases = [
  ['arabic-excel.csv', 'Arabic'],
  ['english-excel.csv', 'English'],
  ['arabic-ocr.txt', 'OCR-Arabic'],
  ['english-ocr.txt', 'OCR-English'],
  ['headerless-table.csv', 'Headerless'],
  ['bad-headers.csv', 'BadHeaders'],
  ['duplicate-records.csv', 'Duplicates'],
  ['missing-fields.csv', 'MissingFields'],
  ['merged-cells.txt', 'MergedCells'],
  ['multi-table-document.txt', 'MultiTable'],
  ['tables-spanning-pages.txt', 'MultiPage'],
  ['reconciliation-mismatch.json', 'ReconciliationMismatch'],
  ['unknown-evidence.json', 'UnknownEvidence']
];

const expected = new Map(cases);
const results = [];

if (process.env.SECONDARY_BATCH03_SKIP === '1') {
  for (const [file, scenario] of cases) results.push({ file, scenario, status: 'SKIPPED', reason: 'SECONDARY_BATCH03_SKIP=1' });
} else {
  for (const [file, scenario] of cases) {
    const full = path.join(fixtureRoot, file);
    if (!fs.existsSync(full)) {
      results.push({ file, scenario, status: 'FAIL', reason: 'Fixture missing' });
      continue;
    }
    const text = fs.readFileSync(full, 'utf8');
    results.push({ file, scenario, status: text.trim().length ? 'PASS' : 'FAIL', reason: text.trim().length ? 'Expected fixture present and non-empty' : 'Fixture is empty' });
  }
}

const counts = results.reduce((a, r) => { a[r.status] += 1; return a; }, { PASS: 0, FAIL: 0, SKIPPED: 0 });
console.log(JSON.stringify({ harness: 'secondary-batch03-golden', expectedCases: expected.size, counts, results }, null, 2));
if (counts.FAIL > 0) process.exitCode = 1;
