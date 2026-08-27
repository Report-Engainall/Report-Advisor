import fs from 'node:fs';

const page = fs.readFileSync('src/pages/InventoryIntelligencePage.tsx', 'utf8');
const canonical = fs.readFileSync('src/lib/free-toolbox/inventory-intelligence-canonical.ts', 'utf8');
const failures = [];

if (!page.includes("fetchInventoryIntelligenceSource")) failures.push('page is not wired to canonical inventory source');
if (/resolveCurrentCompanyId|supabase\.from\(|fetchProductDemandSeries/.test(page)) failures.push('inventory business/data reads leaked into page consumer');
if (/\.reduce\s*\(/.test(page)) failures.push('business aggregation leaked into page consumer');
if (/Math\.max\(0,/.test(page)) failures.push('page-level zero fallback detected');
if (!canonical.includes('resolveCurrentCompanyId')) failures.push('canonical source missing tenant resolution');
if (!canonical.includes(".eq('company_id', companyId)")) failures.push('canonical source missing tenant-bound reads');
if (!canonical.includes('Number.isFinite')) failures.push('canonical source missing explicit numeric validation');
if (!canonical.includes('Number.NaN')) failures.push('canonical source missing unavailable metric semantics');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('inventory intelligence truth regression: PASS');