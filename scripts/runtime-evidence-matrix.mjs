import fs from 'node:fs';
import path from 'node:path';

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

export function discoverRepositoryRpcSurface(root = process.cwd()) {
  const migrationDir = path.join(root, 'supabase', 'migrations');
  if (!fs.existsSync(migrationDir)) return [];
  const names = new Set();
  for (const file of fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort()) {
    const text = fs.readFileSync(path.join(migrationDir, file), 'utf8');
    for (const match of text.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:(?:public)\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gi) {
      names.add(match[1]);
    }
  }
  return [...names].sort().map((rpc) => ({
    rpc,
    acceptsTenantParameter: 'UNKNOWN',
    tenantSource: 'signature discovered from repository migrations; tenant behavior requires runtime verification',
  }));
}

// No hand-written RPC aliases: every entry is derived from the repository's SQL function surface.
export const RPC_MATRIX = Object.freeze(discoverRepositoryRpcSurface());

export function buildClientTenantAttackCases() {
  return [
    { authenticatedTenant: 'A', requestedTenant: 'B', surfaces: ['request_body', 'query_parameter', 'rpc_argument', 'filter', 'url_parameter'] },
    { authenticatedTenant: 'B', requestedTenant: 'A', surfaces: ['request_body', 'query_parameter', 'rpc_argument', 'filter', 'url_parameter'] },
  ];
}

export const INFERENCE_SURFACES = ['COUNT', 'SUM', 'SEARCH', 'FILTER', 'AUTOCOMPLETE', 'AGGREGATE', 'REPORT', 'DASHBOARD', 'EXPORT', 'RECOMMENDATION'];
