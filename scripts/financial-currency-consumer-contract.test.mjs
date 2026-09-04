import { readFileSync } from 'node:fs';

const migration = readFileSync('supabase/migrations/20260904214500_harden_financial_export_and_cash_currency.sql', 'utf8');
const consumers = ['cash_liquidity_snapshot','get_sales_export_rows','get_purchase_export_rows','get_receivables_export_rows'];
for (const name of consumers) {
  if (!migration.includes(`function public.${name}`)) throw new Error(`FINANCIAL_CONSUMER_MISSING: ${name}`);
}
if ((migration.match(/FINANCIAL_CURRENCY_MISMATCH/g) ?? []).length < consumers.length) {
  throw new Error('FINANCIAL_CURRENCY_FAIL_CLOSED_GUARDS_INCOMPLETE');
}
if (!migration.includes('public.companies') || !migration.includes("p.currency") || !migration.includes("s.currency")) {
  throw new Error('FINANCIAL_CURRENCY_CANONICAL_COMPANY_COMPARISON_MISSING');
}
console.log(JSON.stringify({ status:'PASS', contract:'financial-currency-consumers', consumers, runtime_execution:'NOT_PROVEN' }, null, 2));
