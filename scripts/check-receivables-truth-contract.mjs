import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260826110000_report_receivables_snapshot.sql', 'utf8');
const adapter = fs.readFileSync('src/lib/receivables-truth.ts', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const page = fs.readFileSync('src/pages/ReceivablesReportPageCanonical.tsx', 'utf8');

for (const invariant of [
  "si.company_id = public.current_company_id()",
  "NOT IN ('cancelled', 'canceled', 'void')",
  "WHEN s.due_date IS NULL THEN 'UNDATED'",
  'OFFSET greatest(p_page, 0)',
  'LIMIT greatest(least(p_page_size, 500), 1)',
  'count(*)::bigint AS total_rows',
  'sum(outstanding)',
  'AS incomplete_rows',
  "WHEN s.total IS NULL OR s.paid_amount IS NULL THEN 'INCOMPLETE'",
  "count(*) FILTER (WHERE due_date IS NULL AND total IS NOT NULL AND paid_amount IS NOT NULL)",
]) {
  if (!migration.includes(invariant)) throw new Error(`Receivables canonical migration missing invariant: ${invariant}`);
}
if (migration.includes('AND si.total IS NOT NULL') || migration.includes('AND si.paid_amount IS NOT NULL')) {
  throw new Error('Receivables truth must retain incomplete financial rows instead of filtering them out.');
}
for (const invariant of [
  "supabase.rpc('report_receivables_snapshot'",
  'p_page_size: pageSize',
  'REPORT_QUERY_INVALID_PAGE_SIZE',
  'incompleteRows: Number(first?.incomplete_rows ?? 0)',
]) {
  if (!adapter.includes(invariant)) throw new Error(`Receivables adapter missing invariant: ${invariant}`);
}
if (!app.includes("@/pages/ReceivablesReportPageCanonical")) throw new Error('Receivables route is not migrated to canonical truth.');
for (const invariant of [
  'const [retryNonce, setRetryNonce] = useState(0);',
  '}, [page, retryNonce]);',
  'setRetryNonce((value) => value + 1)',
  'snapshot.incompleteRows > 0',
]) {
  if (!page.includes(invariant)) throw new Error(`Receivables UI regression missing invariant: ${invariant}`);
}
if (page.includes('setPage((value) => value);')) throw new Error('Receivables retry must not be a no-op state update.');
console.log('Receivables truth contract: PASS (server truth, tenant authority, pagination independence, incomplete-data semantics, real retry path)');
