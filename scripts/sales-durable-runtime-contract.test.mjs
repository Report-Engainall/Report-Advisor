import fs from 'node:fs';

const runtime = fs.readFileSync('src/lib/report-execution/sales-durable-runtime.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260910090000_reconcile_missing_executive_metrics_runtime.sql', 'utf8');

for (const token of [
  'resolveReportExecutionScope',
  'loadSalesSourceSnapshot',
  'createSupabaseSalesSourceQuery',
  'report_source_versions',
  "eq('id', input.sourceSnapshotId)",
  "eq('company_id', input.request.tenantId)",
  'SALES_DURABLE_TENANT_MISMATCH',
  'SALES_DURABLE_SNAPSHOT_ID_MISMATCH',
  'SALES_DURABLE_SOURCE_HASH_MISMATCH',
  'SALES_DURABLE_SNAPSHOT_NOT_FOUND',
  'SALES_DURABLE_PERSISTED_SOURCE_HASH_MISMATCH',
  'SALES_DURABLE_PERSISTED_SCOPE_MISMATCH',
  'SALES_DURABLE_PERSISTED_SOURCE_CHANGED',
]) {
  if (!runtime.includes(token)) throw new Error(`runtime binding missing ${token}`);
}
for (const token of [
  'CREATE OR REPLACE FUNCTION get_executive_metrics',
  'SECURITY INVOKER',
  'public.current_company_id()',
  'EXECUTIVE_METRICS_TENANT_CONTEXT_REQUIRED',
  'REVOKE ALL ON FUNCTION public.get_executive_metrics(uuid,date,date) FROM PUBLIC',
  'REVOKE ALL ON FUNCTION public.get_executive_metrics(uuid,date,date) FROM anon',
  'GRANT EXECUTE ON FUNCTION public.get_executive_metrics(uuid,date,date) TO authenticated',
  's.company_id=p_company_id',
  "s.status NOT IN ('cancelled','void')",
]) {
  if (!migration.includes(token)) throw new Error(`runtime reconciliation missing ${token}`);
}
console.log('SALES_DURABLE_RUNTIME_CONTRACT PASS');
