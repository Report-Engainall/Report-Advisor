import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/InventoryIntelligencePage.tsx', 'utf8');
const adapter = fs.readFileSync('src/lib/free-toolbox/inventory-intelligence-canonical.ts', 'utf8');

assert.match(page, /fetchInventoryIntelligenceSource/);
assert.match(page, /TruthContextStrip status=\{truthStatus\}/);
assert.match(page, /truthStatus=projected\.length===0\?'INSUFFICIENT_DATA':covered\.length>0\?'CALCULATED':'INSUFFICIENT_DATA'/);
assert.match(page, /asOf="غير متاحة من المصدر"/);
assert.match(page, /asOfLabel="حداثة المصدر"/);
assert.match(page, /rangeLabel="لقطة المخزون الحالية"/);
assert.match(page, /لا يتحول نقص البيانات إلى حالة حرجة مصطنعة/);
assert.doesNotMatch(page, /supabase\.from\(/);
assert.doesNotMatch(page, /Math\.random\(|mock|synthetic|dummy/i);

assert.match(adapter, /supabase\.from\('alternative_item_group_members'\)/);
assert.match(adapter, /supabase\.from\('inventory_balances'\)/);
assert.match(adapter, /supabase\.from\('products'\)/);
assert.match(adapter, /resolveCurrentCompanyId\(\)/);

console.log('Inventory intelligence truth contract: PASS');
console.log('  - UI consumes the existing canonical adapter boundary only');
console.log('  - truth state is derived only from projected/grouped evidence');
console.log('  - source as-of remains explicitly unavailable rather than fabricated');
console.log('  - missing demand remains insufficient evidence, not zero');
