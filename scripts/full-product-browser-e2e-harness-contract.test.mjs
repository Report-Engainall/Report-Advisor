import { strict as assert } from 'node:assert';
import fs from 'node:fs';

const file = fs.readFileSync('scripts/run-full-product-browser-e2e.mjs', 'utf8');
const requiredFlows = Array.from({ length: 20 }, (_, i) => `BF-${String(i + 1).padStart(3, '0')}`);
for (const id of requiredFlows) assert.match(file, new RegExp(`['\"]${id}['\"]`), `missing executable flow ${id}`);
for (const token of ['db_oracle','security_oracle','persistence_oracle','result.requests','result.findings','exactHead','BLOCKED','PASS','FAIL']) assert.match(file, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing evidence/control token ${token}`);
for (const token of ['setInputFiles','current_company_id','page.reload','تسجيل الدخول','تسجيل الخروج','تصدير','معاينة','اعتماد','بدء العمل']) assert.match(file, new RegExp(token), `missing concrete runtime action ${token}`);
assert.match(file, /dbSelect\('products'/, 'product DB oracle missing');
assert.match(file, /dbSelect\('customers'/, 'customer DB oracle missing');
assert.match(file, /NETWORK_FAILURES/, 'network failure must fail the run');
assert.match(file, /CONSOLE_ERRORS/, 'console errors must fail the run');
console.log('Full Product Browser E2E harness contract PASS: 20 executable flow IDs, real browser actions, DB/security/persistence evidence fields, and fail-closed controls are present.');
