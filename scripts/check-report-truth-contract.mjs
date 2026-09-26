import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const migrationsDir = path.join(root, 'supabase', 'migrations');

function readTree(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...readTree(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = readTree(srcDir);
const source = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const migrationFiles = fs.existsSync(migrationsDir)
  ? fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
  : [];
const migrations = migrationFiles.map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf8')).join('\n');

for (const marker of ['normalize_import_key', 'current_company_id']) {
  if (!source.includes(marker) && !migrations.includes(marker)) {
    throw new Error(`Report truth contract missing canonical marker: ${marker}`);
  }
}

if (/SELECT\s+\*\s+FROM\s+auth\.users/i.test(source)) {
  throw new Error('Report truth contract forbids direct auth.users reporting reads');
}

const canonicalTenantRls = migrationFiles.find((f) => f.includes('tenant_rls_global_hardening'));
if (!canonicalTenantRls) throw new Error('Report truth contract requires the canonical global tenant RLS hardening migration');

const securityMigrationFiles = migrationFiles.filter((f) => f >= canonicalTenantRls);
const securityMigrations = securityMigrationFiles.map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf8')).join('\n');
const policyStatements = securityMigrations.match(/CREATE\s+POLICY\b[\s\S]*?;/gi) ?? [];
for (const statement of policyStatements) {
  if (/USING\s*\(\s*true\s*\)/i.test(statement) && !/synonym_dictionary/i.test(statement)) {
    throw new Error('Report truth contract detected permissive RLS policy');
  }
}
if (!/company_id\s*=\s*public\.current_company_id\(\)/i.test(securityMigrations)) throw new Error('Report truth contract requires tenant-scoped RLS predicates');
if (!/WITH CHECK\s*\(\s*company_id\s*=\s*public\.current_company_id\(\)\s*\)/i.test(securityMigrations)) throw new Error('Report truth contract requires tenant-scoped write checks');

// Inspect only application reporting surfaces. The guard itself is intentionally
// outside this set so its own detection regexes cannot self-trigger.
const reportFiles = files.filter((f) => /report|dashboard|analytics|summary/i.test(path.basename(f)));
const reportSource = reportFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

// Match only a single numeric-coercion expression. The previous [^\n]* pattern
// could span unrelated expressions on a long source line and falsely combine
// Number(...) with a later, legitimate Map/lookup fallback such as get(...) || 0.
const silentNumberFallback = /(?:Number|parseFloat|parseInt)\(\s*[^()\n]{0,240}\s*\)\s*\|\|\s*0\b/g;
for (const match of reportSource.matchAll(silentNumberFallback)) {
  throw new Error(`Report truth contract forbids silent invalid-number coercion to zero: ${match[0]}`);
}

// Missing KPI/metric values must not be rendered as zero. Keep this expression
// local to the property access so unrelated fallbacks elsewhere on the line do
// not contaminate the match.
const missingMetricFallback = /\b(?:kpis|metrics|summary|totals|result|value)\??\.[A-Za-z_$][\w$]*\s*\|\|\s*0\b/g;
for (const match of reportSource.matchAll(missingMetricFallback)) {
  throw new Error(`Report truth contract forbids missing KPI/metric values from being rendered as zero: ${match[0]}`);
}

if (/(Number|parseFloat|parseInt)\([^\n]*\).*NaN|NaN.*(Number|parseFloat|parseInt)\(/s.test(reportSource) && !/Number\.isFinite/.test(reportSource)) {
  throw new Error('Report truth contract requires finite-number guarding');
}


// Canonical dashboard adapter must fail closed on malformed authoritative payloads.
// These guards prevent a future refactor from silently mapping a bad response to
// an empty result or substituting the current day for a missing authoritative as-of.
const dataQualityCore = fs.readFileSync(path.join(srcDir, 'lib', 'data-quality-snapshot-core.ts'), 'utf8');
for (const token of [
  "typeof entity.total !== 'number' || !Number.isInteger(entity.total)",
  "typeof entity.issues !== 'number' || !Number.isInteger(entity.issues)",
  "typeof issue.count !== 'number' || !Number.isInteger(issue.count)",
  "DATA_QUALITY_EMPTY_SNAPSHOT_INCONSISTENT",
]) {
  if (!dataQualityCore.includes(token)) throw new Error(`Report truth contract missing data-quality invariant: ${token}`);
}

const profitabilityCanonical = fs.readFileSync(path.join(srcDir, 'lib', 'dashboard-canonical.ts'), 'utf8');
for (const token of [
  'REPORT_DATA_INVALID: profitability.reasons must contain only strings',
  "REPORT_DATA_INVALID: profitability.invoice_count must be a non-negative integer or null",
  "REPORT_DATA_INVALID: profitability.bad_invoice_rows must be a non-negative integer or null",
  "REPORT_DATA_INVALID: profitability.bad_sale_item_rows must be a non-negative integer or null",
  "REPORT_DATA_INVALID: profitability.currency_mismatch_rows must be a non-negative integer or null",
]) if (!profitabilityCanonical.includes(token)) throw new Error('Report truth contract missing profitability invariant: ' + token);
const querySource = fs.readFileSync(path.join(srcDir, 'lib', 'queries.ts'), 'utf8');
for (const token of [
  "function importCountOrNull(value: unknown, field: string): number | null",
  "function importProgressOrNull(value: unknown): number | null",
  "IMPORT_DATA_INVALID: unsupported import status",
  "IMPORT_DATA_INVALID: progress must be an integer from 0 to 100 or null",
]) {
  if (!querySource.includes(token)) throw new Error(`Report truth contract missing import invariant: ${token}`);
}

const dashboardCanonical = fs.readFileSync(path.join(srcDir, 'lib', 'dashboard-canonical.ts'), 'utf8');
for (const token of [
  "function requiredArray<T>(value: unknown, field: string)",
  "function validateRFMRows(rows: unknown[]): RFMSnapshotRow[]",
  "function validateABCRows(rows: unknown[]): ABCSnapshotRow[]",
  "function validateAgingRows(rows: unknown[]): AgingSnapshotRow[]",
  "REPORT_DATA_INVALID: rfm.rows[' + index + '] shape is invalid",
  "REPORT_DATA_INVALID: abc.rows[' + index + '] shape is invalid",
  "REPORT_DATA_INVALID: aging.rows[' + index + '] shape is invalid",

  "function validateDashboardRows(row: Record<string, unknown>): void",
  "validateDashboardRows(row);",
  "function requiredAsOf(value: unknown, field: string)",
  "throw new Error('REPORT_DATA_INVALID: ' + field + ' as-of must be YYYY-MM-DD')",
  "const parsed = new Date(value + 'T00:00:00.000Z')",
  "function nonNegativeIntegerOrNull(value: unknown, field: string): number|null",
  "requiredArray<MonthlyTrend>(row.trend, 'trend')",
  "requiredArray<TopEntity>(row.topCustomers, 'topCustomers')",
  "requiredArray<TopEntity>(row.topProducts, 'topProducts')",
  "requiredArray<CategoryBreakdown>(row.categories, 'categories')",
  "requiredArray<AgingBucket>(agingRow.rows, 'aging.rows')",
  "REPORT_DATA_INVALID: aging.rows[' + index + '] shape is invalid",
  "unknownRows:nonNegativeIntegerOrNull(agingRow.unknownRows, 'aging.unknownRows')",
  "unknownRows: nonNegativeIntegerOrNull(row.unknownRows, 'inventory.unknownRows')",
  "unknownRows: nonNegativeIntegerOrNull(row.unknownRows, 'rfm.unknownRows')",
  "unknownRows: nonNegativeIntegerOrNull(row.unknownRows, 'abc.unknownRows')",
  "unknownRows: nonNegativeIntegerOrNull(row.unknownRows, 'aging.unknownRows')",
  "function qualityCountOrNull(value: unknown, field: string): number|null",
  "dashboard months is invalid",
  "const rawQuality = row.quality;",
  "throw new Error('REPORT_DATA_INVALID: quality must be an object when provided')",
  "badInvoiceRows:qualityCountOrNull(qualityRow.badInvoiceRows, 'quality.badInvoiceRows')",
  "badSaleItemRows:qualityCountOrNull(qualityRow.badSaleItemRows, 'quality.badSaleItemRows')",
  "badPurchaseRows:qualityCountOrNull(qualityRow.badPurchaseRows, 'quality.badPurchaseRows')",
  "badInventoryRows:qualityCountOrNull(qualityRow.badInventoryRows, 'quality.badInventoryRows')",
  "salesCurrencyMismatchRows:qualityCountOrNull(qualityRow.salesCurrencyMismatchRows, 'quality.salesCurrencyMismatchRows')",
  "purchaseCurrencyMismatchRows:qualityCountOrNull(qualityRow.purchaseCurrencyMismatchRows, 'quality.purchaseCurrencyMismatchRows')",
]) {
  if (!dashboardCanonical.includes(token)) {
    throw new Error(`Report truth contract missing fail-closed dashboard invariant: ${token}`);
  }
}
if (/asOf:\s*typeof row\.asOf\s*===\s*['"]string['"]\s*\?\s*row\.asOf\s*:\s*asOfDate\(\)/.test(dashboardCanonical)) {
  throw new Error('Report truth contract forbids replacing missing authoritative asOf with today');
}

console.log(`Report truth contract: PASS (${reportFiles.length} report candidates, ${migrationFiles.length} migrations scanned)`);
