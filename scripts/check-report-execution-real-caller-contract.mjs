import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const durableEntrypoint = path.join(root, 'lib/report-execution/durable-execution-entrypoint.ts');
const productionHits = [];
const legacyHits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) continue;
    if (full === durableEntrypoint) continue;
    const rel = path.relative(process.cwd(), full).replaceAll(path.sep, '/');
    if (/(^|\/)(test|tests|__tests__|scripts)(\/|\.)/.test(rel)) continue;
    const text = fs.readFileSync(full, 'utf8');
    if (text.includes('enqueueDurableReportExecution')) productionHits.push(rel);
    if (text.includes('new ReportExecutionCoordinator') || text.includes('.enqueue(') && text.includes('ReportExecutionCoordinator')) legacyHits.push(rel);
  }
}

walk(root);

assert.ok(
  productionHits.length > 0,
  'No production caller reaches enqueueDurableReportExecution; #372 remains OPEN until a real business trigger is wired.'
);
assert.equal(
  legacyHits.length,
  0,
  `Legacy in-memory ReportExecutionCoordinator production usage detected: ${legacyHits.join(', ')}`
);

console.log(`Real durable report caller contract: PASS (${productionHits.join(', ')})`);
