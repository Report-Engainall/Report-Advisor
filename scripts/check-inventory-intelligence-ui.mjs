import assert from 'node:fs';
const page=assert.readFileSync('src/pages/InventoryIntelligencePage.tsx','utf8');
const app=assert.readFileSync('src/App.tsx','utf8');
const sidebar=assert.readFileSync('src/components/Sidebar.tsx','utf8');
const adapter=assert.readFileSync('src/lib/free-toolbox/inventory-intelligence-canonical.ts','utf8');
for(const token of ['fetchInventoryIntelligenceSource','applyReportMode','عرض تفصيلي','عرض تجميعي'])if(!page.includes(token))throw new Error(`missing UI contract: ${token}`);
for(const forbidden of ["supabase.from('alternative_item_group_members')","supabase.from('inventory_balances')","supabase.from('products')","resolveCurrentCompanyId()"]){if(page.includes(forbidden))throw new Error(`page owns canonical source access: ${forbidden}`);}
for(const token of ["supabase.from('alternative_item_group_members')","supabase.from('inventory_balances')","supabase.from('products')","resolveCurrentCompanyId()"]){if(!adapter.includes(token))throw new Error(`canonical adapter missing source boundary: ${token}`);}
if(!app.includes('/reports/inventory-intelligence'))throw new Error('missing inventory intelligence route');
if(!sidebar.includes('ذكاء المخزون والمجموعات'))throw new Error('missing sidebar entry');
console.log('inventory intelligence UI contract: PASS');
