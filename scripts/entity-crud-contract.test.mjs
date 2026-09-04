import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'src/pages/EntityPages.tsx'), 'utf8');
const mutations = fs.readFileSync(path.join(root, 'src/lib/entity-mutations.ts'), 'utf8');
const migrations = fs.readdirSync(path.join(root, 'supabase/migrations')).filter(x => /entity_crud/.test(x)).map(x => fs.readFileSync(path.join(root,'supabase/migrations',x),'utf8')).join('\n');

for (const token of ['onClick={openCreate}','onSubmit={save}','createCustomer','updateCustomer','deleteCustomer','createProduct','updateProduct','deleteProduct']) assert.ok(page.includes(token) || mutations.includes(token), `missing CRUD wiring: ${token}`);
for (const token of ["from('customers').insert", "from('customers').update", "from('customers').delete", "from('products').insert", "from('products').update", "from('products').delete"]) assert.ok(mutations.includes(token), `missing persistence call: ${token}`);
for (const token of ['company_id = current_company_id()', "cm.role in ('member','manager','warehouse','accountant','system_admin')", 'with check', 'uq_customers_company_normalized_code']) assert.ok(migrations.includes(token), `missing backend contract: ${token}`);
assert.ok(!/onClick\s*=\s*\{\s*\(?.*?\)?\s*=>\s*\{\s*\}\s*\}/s.test(page), 'empty click handler reintroduced');
console.log('Entity CRUD contract PASS: visible create/edit/delete controls, persistence calls, tenant guard, role gate, uniqueness, and non-empty handlers are all statically present.');