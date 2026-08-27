import fs from 'node:fs';

const page = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const canonical = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');

const failures = [];

if (!canonical.includes('value:number|null')) {
  failures.push('InventoryReportRow must expose canonical value');
}

const valueColumn = /key:'value'[^}]*render:\(r:InventoryReportRow\)=>formatCurrency\(([^)]*)\)/s.exec(page);
if (!valueColumn) {
  failures.push('Inventory report value column is missing');
} else if (!/r\.value/.test(valueColumn[1])) {
  failures.push('Inventory report value column must render canonical r.value; client-side quantity*unit_cost is forbidden');
}

if (/r\.quantity\s*\*\s*r\.unit_cost/.test(page)) {
  failures.push('Inventory report contains forbidden client-side inventory valuation');
}

if (failures.length) {
  console.error('INVENTORY_REPORT_TRUTH: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('INVENTORY_REPORT_TRUTH: PASS');
