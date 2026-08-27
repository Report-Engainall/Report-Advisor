import fs from 'node:fs';
import assert from 'node:assert/strict';

const page=fs.readFileSync('src/pages/InventoryIntelligencePage.tsx','utf8');
const canonical=fs.readFileSync('src/lib/free-toolbox/inventory-intelligence-canonical.ts','utf8');
const app=fs.readFileSync('src/App.tsx','utf8');
const sidebar=fs.readFileSync('src/components/Sidebar.tsx','utf8');

for(const token of ['fetchInventoryIntelligenceSource','applyReportMode','عرض تفصيلي','عرض تجميعي']) assert.ok(page.includes(token),`missing UI contract: ${token}`);
for(const token of ['alternative_item_group_members','inventory_balances','products','resolveCurrentCompanyId']) assert.ok(canonical.includes(token),`missing canonical source contract: ${token}`);
assert.ok(!page.includes('supabase.from('),'page must not contain direct database reads');
assert.ok(app.includes('/reports/inventory-intelligence'),'missing inventory intelligence route');
assert.ok(sidebar.includes('ذكاء المخزون والمجموعات'),'missing sidebar entry');
console.log('inventory intelligence UI contract: PASS');
