export const DATABASE_TABLES = [
  'companies', 'profiles', 'products', 'inventory', 'inventory_balances',
  'sales', 'sale_items', 'purchases', 'purchase_items', 'imports', 'import_rows',
  'import_jobs', 'import_job_rows', 'reports',
];

export const CHILD_TABLES = ['sale_items', 'purchase_items', 'import_rows', 'import_job_rows'];

export const OPERATIONS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
export const DIRECTIONS = ['A_TO_B', 'B_TO_A'];

export const DATABASE_ISOLATION_MATRIX = DATABASE_TABLES.flatMap((table) =>
  DIRECTIONS.flatMap((direction) => OPERATIONS.map((operation) => ({ table, direction, operation }))),
);

export const RPC_MATRIX = Object.freeze([
  { rpc: 'dashboard', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'canonical contract must be established at runtime' },
  { rpc: 'inventory', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'canonical contract must be established at runtime' },
  { rpc: 'inventory_intelligence', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'canonical contract must be established at runtime' },
  { rpc: 'reports', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'canonical contract must be established at runtime' },
  { rpc: 'forecast', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'canonical contract must be established at runtime' },
  { rpc: 'data_quality', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'canonical contract must be established at runtime' },
  { rpc: 'imports', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'canonical contract must be established at runtime' },
  { rpc: 'exports', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'canonical contract must be established at runtime' },
  { rpc: 'decision_intelligence', acceptsTenantParameter: 'UNKNOWN', tenantSource: 'canonical contract must be established at runtime' },
]);

export function buildClientTenantAttackCases() {
  return [
    { authenticatedTenant: 'A', requestedTenant: 'B', surfaces: ['request_body', 'query_parameter', 'rpc_argument', 'filter', 'url_parameter'] },
    { authenticatedTenant: 'B', requestedTenant: 'A', surfaces: ['request_body', 'query_parameter', 'rpc_argument', 'filter', 'url_parameter'] },
  ];
}

export const INFERENCE_SURFACES = ['COUNT', 'SUM', 'SEARCH', 'FILTER', 'AUTOCOMPLETE', 'AGGREGATE', 'REPORT', 'DASHBOARD', 'EXPORT', 'RECOMMENDATION'];
