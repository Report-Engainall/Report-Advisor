import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260904094500_harden_analytics_currency_truth.sql', 'utf8');
const abc = fs.readFileSync('supabase/migrations/20260904095000_fix_abc_sale_items_contract.sql', 'utf8');

// Every monetary aggregate in this wave must detect transaction/company currency mismatch.
for (const fn of ['get_profitability_snapshot','get_purchase_summary','get_sales_secondary_metrics','get_rfm_snapshot','get_aging_snapshot']) {
  assert.match(migration, new RegExp(`CREATE OR REPLACE FUNCTION public\\.${fn}`));
}
assert.match(migration, /currency_mismatch_rows/);
assert.match(migration, /'CURRENCY_MISMATCH'/);
assert.match(migration, /'INSUFFICIENT_DATA'/);

// Adversarial: invalid currency must suppress monetary outputs rather than merely label them.
assert.match(migration, /'revenue',CASE WHEN q\.bad_invoice_rows=0 AND q\.currency_mismatch_rows=0/);
assert.match(migration, /IF v_mismatch>0 THEN RETURN jsonb_build_object/);

// Adversarial: ABC must follow the actual sale_items schema; sale_items has no company_id.
assert.doesNotMatch(abc, /item\.company_id/);
assert.match(abc, /JOIN public\.sales_invoices si ON si\.id=item\.invoice_id AND si\.company_id=v_company_id/);

console.log('canonical currency/ABC adversarial regression: PASS');
