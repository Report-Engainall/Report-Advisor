import assert from 'node:fs';
const page=assert.readFileSync('src/pages/InventoryIntelligencePage.tsx','utf8');
const app=assert.readFileSync('src/App.tsx','utf8');
const sidebar=assert.readFileSync('src/components/Sidebar.tsx','utf8');
for(const token of ['applyReportMode','عرض تفصيلي','عرض تجميعي','alternative_item_group_members','inventory_balances'])if(!page.includes(token))throw new Error(`missing UI contract: ${token}`);
if(!app.includes('/reports/inventory-intelligence'))throw new Error('missing inventory intelligence route');
if(!sidebar.includes('ذكاء المخزون والمجموعات'))throw new Error('missing sidebar entry');
console.log('inventory intelligence UI contract: PASS');
