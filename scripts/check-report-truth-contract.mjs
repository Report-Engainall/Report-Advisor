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
const migrationFiles = fs.existsSync(migrationsDir) ? fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort() : [];
const migrations = migrationFiles.map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf8')).join('\n');

for (const marker of ['normalize_import_key', 'current_company_id']) {
  if (!source.includes(marker) && !migrations.includes(marker)) throw new Error(`Report truth contract missing canonical marker: ${marker}`);
}
if (/SELECT\s+\*\s+FROM\s+auth\.users/i.test(source)) throw new Error('Report truth contract forbids direct auth.users reporting reads');

const canonicalTenantRls = migrationFiles.find((f) => f.includes('tenant_rls_global_hardening'));
if (!canonicalTenantRls) throw new Error('Report truth contract requires the canonical global tenant RLS hardening migration');
const securityMigrationFiles = migrationFiles.filter((f) => f >= canonicalTenantRls);
const securityMigrations = securityMigrationFiles.map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf8')).join('\n');
const policyStatements = securityMigrations.match(/CREATE\s+POLICY\b[\s\S]*?;/gi) ?? [];
for (const statement of policyStatements) if (/USING\s*\(\s*true\s*\)/i.test(statement) && !/synonym_dictionary/i.test(statement)) throw new Error('Report truth contract detected permissive RLS policy');
if (!/company_id\s*=\s*public\.current_company_id\(\)/i.test(securityMigrations)) throw new Error('Report truth contract requires tenant-scoped RLS predicates');
if (!/WITH CHECK\s*\(\s*company_id\s*=\s*public\.current_company_id\(\)\s*\)/i.test(securityMigrations)) throw new Error('Report truth contract requires tenant-scoped write checks');

const reportsPage = path.join(srcDir, 'pages', 'ReportsPage.tsx');
const reportsPageSource = fs.existsSync(reportsPage) ? fs.readFileSync(reportsPage, 'utf8') : '';
if (!/fetchPurchaseReportSummary/.test(reportsPageSource)) throw new Error('ReportsPage must consume canonical purchase summary for business totals');
if (!/fetchInventoryReportSnapshot/.test(reportsPageSource)) throw new Error('ReportsPage must consume canonical inventory snapshot for business totals');
if (/fetchPurchaseInvoices\(0\s*,\s*20\)[\s\S]{0,1000}reduce\(/.test(reportsPageSource)) throw new Error('ReportsPage must not aggregate purchase totals from the first display page');
if (/fetchInventoryBalances\(\)[\s\S]{0,1500}reduce\(/.test(reportsPageSource)) throw new Error('ReportsPage must not aggregate inventory value in the browser');

const reportFiles = files.filter((f) => /report|dashboard|analytics|summary/i.test(path.basename(f)));
const reportSource = reportFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const silentNumberFallback = /(?:Number|parseFloat|parseInt)\(\s*[^()\n]{0,240}\s*\)\s*\|\|\s*0\b/g;
for (const match of reportSource.matchAll(silentNumberFallback)) throw new Error(`Report truth contract forbids silent invalid-number coercion to zero: ${match[0]}`);
const missingMetricFallback = /\b(?:kpis|metrics|summary|totals|result|value)\??\.[A-Za-z_$][\w$]*\s*\|\|\s*0\b/g;
for (const match of reportSource.matchAll(missingMetricFallback)) throw new Error(`Report truth contract forbids missing KPI/metric values from being rendered as zero: ${match[0]}`);
if (/(Number|parseFloat|parseInt)\([^\n]*\).*NaN|NaN.*(Number|parseFloat|parseInt)\(/s.test(reportSource) && !/Number\.isFinite/.test(reportSource)) throw new Error('Report truth contract requires finite-number guarding');

console.log(`Report truth contract: PASS (${reportFiles.length} report candidates, ${migrationFiles.length} migrations scanned)`);
