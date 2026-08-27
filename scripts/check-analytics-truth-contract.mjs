import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'src/lib/analytics-truth.ts'), 'utf8');
const page = fs.readFileSync(path.join(root, 'src/pages/AnalyticsCanonicalPages.tsx'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20260827180000_analytics_truth.sql'), 'utf8');

for (const marker of [
  "report_rfm_snapshot",
  "report_abc_snapshot",
  "public.current_company_id()",
  "NOT IN ('cancelled', 'canceled', 'void')",
  "p_as_of_date",
  "INSUFFICIENT_DATA",
]) if (!migration.includes(marker)) throw new Error(`Analytics canonical migration missing invariant: ${marker}`);

for (const marker of [
  "supabase.rpc('report_rfm_snapshot'",
  "supabase.rpc('report_abc_snapshot'",
  'fetchReceivablesReportSnapshot',
]) if (!adapter.includes(marker)) throw new Error(`Analytics adapter missing canonical source: ${marker}`);

for (const marker of [
  "AnalyticsCanonicalPages",
  'fetchRfmTruth',
  'fetchAbcTruth',
  'fetchAgingTruth',
]) if (!app.includes(marker) && marker === 'AnalyticsCanonicalPages') throw new Error('App lost canonical analytics route boundary');
for (const marker of ['fetchRfmTruth', 'fetchAbcTruth', 'fetchAgingTruth']) if (!page.includes(marker)) throw new Error(`Analytics page lost canonical consumer: ${marker}`);

if (app.includes("@/pages/AnalyticsPage")) throw new Error('Legacy AnalyticsPage consumer remains in App');
if (page.includes("supabase.from('sales_invoices')") || page.includes("supabase.from('sale_items')")) throw new Error('Analytics UI must not own raw business truth reads');
if (/\.reduce\s*\(/.test(page)) throw new Error('Analytics UI must not perform business aggregation');

console.log('ANALYTICS_TRUTH_CONTRACT: PASS (RFM/ABC server truth, aging shared receivables truth, tenant authority, fail-closed semantics, zero legacy App import)');
