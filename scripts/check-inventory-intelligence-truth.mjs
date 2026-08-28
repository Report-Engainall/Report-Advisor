import fs from 'node:fs';
const page=fs.readFileSync('src/pages/InventoryIntelligencePage.tsx','utf8');
const grouped=fs.readFileSync('src/lib/free-toolbox/grouped-report.ts','utf8');
const failures=[];
for (const token of ["supabase.from('inventory_balances')","supabase.from('products')","supabase.from('alternative_item_group_members')"]) if (!page.includes(token)) failures.push('missing expected tenant-scoped source: '+token);
if (!page.includes("resolveCurrentCompanyId()")) failures.push('inventory intelligence must resolve tenant context');
if (!grouped.includes('Number.isFinite(r.stockUnits)?Math.max(0,r.stockUnits):0')) failures.push('grouping must define explicit stock numeric semantics');
if (!grouped.includes('Number.isFinite(x.dailyDemand)&&x.dailyDemand>0?x.stockUnits/x.dailyDemand:Number.NaN')) failures.push('days-of-cover must remain unavailable when demand is insufficient');
if (/stockUnits\s*=\s*stockUnits\s*\+|reduce\s*\(/.test(page)) failures.push('business aggregation must not move into the page consumer');
if (failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('inventory intelligence truth guard: PASS');
