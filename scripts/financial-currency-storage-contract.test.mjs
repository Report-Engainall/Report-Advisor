import { strict as assert } from 'node:assert';
import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260904204000_harden_financial_currency_storage.sql', 'utf8');
assert.match(migration, /sales_invoices alter column currency set not null/);
assert.match(migration, /purchase_invoices alter column currency set not null/);
assert.match(migration, /sales_invoices_currency_format/);
assert.match(migration, /purchase_invoices_currency_format/);
assert.match(migration, /currency = upper\(btrim\(currency\)\)/);
assert.match(migration, /length\(btrim\(currency\)\) = 3/);
console.log('Financial currency storage contract PASS: sales/purchase invoice currency is required and canonical-format constrained.');