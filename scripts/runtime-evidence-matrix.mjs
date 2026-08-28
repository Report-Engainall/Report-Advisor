// Runtime evidence matrix is derived from the canonical tenant-RLS migration surface.
// Keep this list aligned with supabase/migrations/20260823000000_tenant_rls_global_hardening.sql.
export const DATABASE_TABLES = [
  'branches', 'warehouses', 'categories', 'customers', 'suppliers', 'products',
  'sales_invoices', 'purchase_invoices', 'payments', 'inventory_movements',
  'inventory_balances', 'imports', 'recommendations', 'alerts', 'forecasts', 'audit_logs',
  'file_records', 'import_profiles', 'import_snapshots', 'import_jobs',
  'data_quality_reports', 'import_field_lineage',
  'companies',
  'sale_items', 'purchase_items', 'import_rows', 'import_job_rows',
];

export const CHILD_TABLES = ['sale_items', 'purchase_items', 'import_rows', 'import_job_rows'];
export const OPERATIONS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
export const DIRECTIONS = ['A_TO_B', 'B_TO_A'];

export const DATABASE_ISOLATION_MATRIX = DATABASE_TABLES.flatMap((table) =>
  DIRECTIONS.flatMap((direction) => OPERATIONS.map((operation) => ({ table, direction, operation }))),
);

// These names are retained as discovery targets only until a live/runtime RPC inventory
// is available. UNKNOWN is intentional and must never be promoted to a verified claim.
export const RPC_MATRIX = Object.freeze([
  { rpc: 'dashboard', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'runtime inventory required' },
  { rpc: 'inventory', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'runtime inventory required' },
  { rpc: 'inventory_intelligence', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'runtime inventory required' },
  { rpc: 'reports', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'runtime inventory required' },
  { rpc: 'forecast', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'runtime inventory required' },
  { rpc: 'data_quality', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'runtime inventory required' },
  { rpc: 'imports', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'runtime inventory required' },
  { rpc: 'exports', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'runtime inventory required' },
  { rpc: 'decision_intelligence', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'runtime inventory required' },
]);

export function buildClientTenantAttackCases() {
  return [
    { authenticatedTenant: 'A', requestedTenant: 'B', surfaces: ['request_body', 'query_parameter', 'rpc_argument', 'filter', 'url_parameter'] },
    { authenticatedTenant: 'B', requestedTenant: 'A', surfaces: ['request_body', 'query_parameter', 'rpc_argument', 'filter', 'url_parameter'] },
  ];
}

export const INFERENCE_SURFACES = ['COUNT', 'SUM', 'SEARCH', 'FILTER', 'AUTOCOMPLETE', 'AGGREGATE', 'REPORT', 'DASHBOARD', 'EXPORT', 'RECOMMENDATION'];
