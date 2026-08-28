import fs from 'node:fs';
import path from 'node:path';

// Runtime evidence matrix is derived from the canonical tenant-RLS migration surface.
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

function readFiles(root, roots, extensions) {
  const files = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (extensions.has(path.extname(entry.name))) files.push(full);
    }
  }
  for (const relative of roots) walk(path.join(root, relative));
  return files;
}

export function discoverRepositoryRpcSurface(root = process.cwd()) {
  const migrationDir = path.join(root, 'supabase', 'migrations');
  if (!fs.existsSync(migrationDir)) return [];
  const definitions = new Map();
  const sqlFiles = fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort();
  for (const file of sqlFiles) {
    const text = fs.readFileSync(path.join(migrationDir, file), 'utf8');
    for (const match of text.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:(?:public)\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/gi)) {
      definitions.set(match[1], { rpc: match[1], signature: match[2].replace(/\s+/g, ' ').trim(), migration: file, source: text });
    }
  }

  const applicationFiles = readFiles(root, ['src', 'services'], new Set(['.ts', '.tsx', '.js', '.mjs', '.py']));
  const appSources = applicationFiles.map((file) => ({ file, text: fs.readFileSync(file, 'utf8') }));
  const appText = appSources.map(({ text }) => text).join('\n');
  const sqlText = sqlFiles.map((file) => fs.readFileSync(path.join(migrationDir, file), 'utf8')).join('\n');

  return [...definitions.values()].sort((a, b) => a.rpc.localeCompare(b.rpc)).map(({ rpc, signature, migration, source }) => {
    const consumerFiles = appSources.filter(({ text }) => new RegExp(`\\.rpc\\(\\s*['"]${rpc}['"]`).test(text)).map(({ file }) => path.relative(root, file).replaceAll(path.sep, '/'));
    const applicationRpc = consumerFiles.length > 0;
    const triggerFunction = new RegExp(`EXECUTE\\s+FUNCTION\\s+(?:(?:public)\\.)?${rpc}\\s*\\(`, 'i').test(sqlText);
    const calledBySql = new RegExp(`\\b${rpc}\\s*\\(`, 'i').test(sqlText.replace(new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+(?:(?:public)\\.)?${rpc}\\s*\\(`, 'i'), ''));
    const classification = applicationRpc ? 'APPLICATION RPC' : triggerFunction ? 'TRIGGER' : calledBySql ? 'INTERNAL FUNCTION' : /^(pg_|uuid_|set_|get_|normalize_|calculate_|validate_)/i.test(rpc) ? 'UTILITY FUNCTION' : 'UNKNOWN';
    return {
      rpc,
      signature,
      securityMode: /SECURITY\\s+DEFINER/i.test(source) ? 'SECURITY DEFINER' : 'INVOKER/UNSPECIFIED',
      caller: classification,
      classification,
      consumers: consumerFiles,
      tenantSource: /company_id|tenant_id|current_company|auth\.uid/i.test(source) ? 'tenant-sensitive surface; runtime proof required' : 'not statically established',
      applicationTrustBoundary: applicationRpc,
      acceptsTenantParameter: /(?:company_id|tenant_id|tenant|p_company_id|p_tenant_id)/i.test(signature),
      expectedDenial: applicationRpc ? 'cross-tenant input must be denied or produce zero unauthorized data' : 'NOT APPLICABLE UNTIL CLASSIFIED AS APPLICATION RPC',
      migration,
    };
  });
}

export const RPC_MATRIX = Object.freeze(discoverRepositoryRpcSurface());

export function buildClientTenantAttackCases() {
  return [
    { authenticatedTenant: 'A', requestedTenant: 'B', surfaces: ['request_body', 'query_parameter', 'rpc_argument', 'filter', 'url_parameter'] },
    { authenticatedTenant: 'B', requestedTenant: 'A', surfaces: ['request_body', 'query_parameter', 'rpc_argument', 'filter', 'url_parameter'] },
  ];
}

export const INFERENCE_SURFACES = ['COUNT', 'SUM', 'AVG', 'SEARCH', 'FILTER', 'SORT', 'AUTOCOMPLETE', 'AGGREGATE', 'REPORT', 'DASHBOARD', 'EXPORT', 'FORECAST', 'RECOMMENDATION', 'DECISION'];
