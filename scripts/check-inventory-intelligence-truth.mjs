import fs from 'node:fs';

const page=fs.readFileSync('src/pages/InventoryIntelligencePage.tsx','utf8');
const canonical=fs.readFileSync('src/lib/free-toolbox/inventory-intelligence-canonical.ts','utf8');
const grouped=fs.readFileSync('src/lib/free-toolbox/grouped-report.ts','utf8');
const failures=[];

for (const token of ['fetchInventoryIntelligenceSource','applyReportMode','عرض تفصيلي','عرض تجميعي']) {
  if (!page.includes(token)) failures.push(`missing expected UI/canonical token: ${token}`);
}
for (const token of ["supabase.from('inventory_balances')","supabase.from('products')","supabase.from('alternative_item_group_members')","resolveCurrentCompanyId","fetchProductDemandSeries"]) {
  if (page.includes(token)) failures.push(`legacy/direct source remains in page: ${token}`);
}
for (const token of ['resolveCurrentCompanyId','alternative_item_group_members','inventory_balances','products','fetchProductDemandSeries']) {
  if (!canonical.includes(token)) failures.push(`canonical adapter missing required boundary: ${token}`);
}
if (!grouped.includes('Number.isFinite(r.stockUnits)?Math.max(0,r.stockUnits):0')) failures.push('grouping must define explicit stock numeric semantics');
if (!grouped.includes('Number.isFinite(x.dailyDemand)&&x.dailyDemand>0?x.stockUnits/x.dailyDemand:Number.NaN')) failures.push('days-of-cover must remain unavailable when demand is insufficient');
if (failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('inventory intelligence truth guard: PASS');
