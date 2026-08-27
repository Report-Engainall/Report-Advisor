import fs from 'node:fs';

const page = fs.readFileSync('src/pages/InventoryIntelligencePage.tsx', 'utf8');
const grouped = fs.readFileSync('src/lib/free-toolbox/grouped-report.ts', 'utf8');
const failures = [];

if (!page.includes('resolveCurrentCompanyId')) failures.push('missing tenant resolution');
if (!grouped.includes('Number.isFinite')) failures.push('missing explicit numeric semantics');
if (!grouped.includes('Number.NaN')) failures.push('missing unavailable metric semantics');
if (/\.reduce\s*\(/.test(page)) failures.push('business aggregation leaked into page consumer');
if (/Math\.max\(0,/.test(page)) failures.push('page-level zero fallback detected');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('inventory intelligence truth regression: PASS');
