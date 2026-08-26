import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260826110000_report_receivables_snapshot.sql', 'utf8');
const adapter = fs.readFileSync('src/lib/receivables-truth.ts', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

for (const invariant of [
  "si.company_id = public.current_company_id()",
  "NOT IN ('cancelled', 'canceled', 'void')",
  "WHEN s.due_date IS NULL THEN 'UNDATED'",
  'OFFSET greatest(p_page, 0)',
  'LIMIT greatest(least(p_page_size, 500), 1)',
  'count(*)::bigint AS total_rows',
  'sum(outstanding)',
]) {
  if (!migration.includes(invariant)) throw new Error(`Receivables canonical migration missing invariant: ${invariant}`);
}
if (migration.includes('coalesce(si.total, 0)') || migration.includes('coalesce(si.paid_amount, 0)')) {
  throw new Error('Receivables truth must not convert missing financial inputs to zero.');
}
for (const invariant of [
  "supabase.rpc('report_receivables_snapshot'",
  'p_page_size: pageSize',
  'REPORT_QUERY_INVALID_PAGE_SIZE',
]) {
  if (!adapter.includes(invariant)) throw new Error(`Receivables adapter missing invariant: ${invariant}`);
}
if (!app.includes("@/pages/ReceivablesReportPageCanonical")) throw new Error('Receivables route is not migrated to canonical truth.');
console.log('Receivables truth contract: PASS (tenant authority, cancelled/void exclusion, UNDATED semantics, server aggregation, bounded display pagination, no missing→zero coercion)');
