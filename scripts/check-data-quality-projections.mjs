import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const queryPath = path.join(ROOT, 'src/lib/data-quality-queries.ts');
const pagePath = path.join(ROOT, 'src/pages/EntityPages.tsx');
const querySource = fs.readFileSync(queryPath, 'utf8');
const pageSource = fs.readFileSync(pagePath, 'utf8');
const requiredProjections = {
  customers: ['name', 'phone', 'code'],
  products: ['sku', 'name', 'cost_price', 'selling_price', 'reorder_point'],
  sales_invoices: ['total', 'paid_amount', 'customer_id', 'invoice_date', 'invoice_number'],
  inventory_balances: ['quantity', 'unit_cost', 'product_id', 'warehouse_id'],
};
if (/\.select\(['"]\*['"]\)/.test(querySource)) throw new Error('Data Quality query boundary must not use select(*)');
if (/COMPANY_ID|activeCompanyId/.test(querySource)) throw new Error('Data Quality query boundary must not accept legacy tenant identifiers');
if (!querySource.includes('current_company_id') && !querySource.includes('RLS')) throw new Error('Data Quality query boundary must document/delegate tenant security to RLS/current_company_id');
if (!pageSource.includes('fetchDataQualityDatasets')) throw new Error('DataQualityPage is not wired to fetchDataQualityDatasets');
if (/import\s+\{[^}]*\bCOMPANY_ID\b[^}]*\}\s+from\s+['"]@\/lib\/supabase['"]/.test(pageSource)) throw new Error('DataQualityPage still imports COMPANY_ID');
for (const [table, fields] of Object.entries(requiredProjections)) {
  const pattern = new RegExp(`supabase\\.from\\(['"]${table}['"]\\)\\.select\\(['"]([^'"]+)['"]`);
  const match = querySource.match(pattern);
  if (!match) throw new Error(`Missing bounded projection for ${table}`);
  const actual = match[1].split(',').map((x) => x.trim()).filter(Boolean);
  for (const field of fields) if (!actual.includes(field)) throw new Error(`Projection ${table} is missing required field: ${field}`);
}
if (!querySource.includes('const MAX_QUALITY_ROWS = 500')) throw new Error('Data Quality collections require an explicit bound');
if ((querySource.match(/count:\s*'exact'/g) ?? []).length !== 4) throw new Error('Data Quality collections must request exact counts');
if ((querySource.match(/\.range\(0, MAX_QUALITY_ROWS - 1\)/g) ?? []).length !== 4) throw new Error('Data Quality collections must be bounded to the declared maximum');
if (!querySource.includes('REPORT_QUERY_LIMIT_EXCEEDED')) throw new Error('Data Quality boundary must fail closed on partial datasets');
console.log('Data Quality projection contract: PASS');
console.log('  - no select(*)');
console.log('  - no UI tenant identifier');
console.log('  - required metric fields are explicitly projected');
console.log('  - every collection is bounded and exact-count checked');
console.log('  - oversized datasets fail closed rather than producing partial quality metrics');
console.log('  - DataQualityPage uses the canonical query boundary');
