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

// Export truth: a report export must not silently inherit the current table page.
// Sales and purchases currently expose a 20-row presentation page, but their
// export labels are report-level exports. The export path therefore must load
// the complete tenant-scoped dataset through the bounded paginated loader.
const reportsPagePath = path.join(srcDir, 'pages', 'ReportsPage.tsx');
const reportsPage = fs.existsSync(reportsPagePath) ? fs.readFileSync(reportsPagePath, 'utf8') : '';
if (!reportsPage.includes("fetchAllSalesInvoices")) {
  throw new Error('Export truth contract: sales report export must use the full-dataset loader');
}
if (!reportsPage.includes("fetchAllPurchaseInvoices")) {
  throw new Error('Export truth contract: purchase report export must use the full-dataset loader');
}
if (/downloadReportArtifact\(['"]sales-report['"][\s\S]{0,1200}invoices\.map\(/.test(reportsPage)) {
  throw new Error('Export truth contract: sales export is coupled to the current paginated invoice view');
}
if (/downloadReportArtifact\(['"]purchase-report['"][\s\S]{0,1200}purchases\.map\(/.test(reportsPage)) {
  throw new Error('Export truth contract: purchase export is coupled to the current paginated purchase view');
}

console.log(`Report truth contract: PASS (${reportFiles.length} report candidates, ${migrationFiles.length} migrations scanned, export scope guarded)`);