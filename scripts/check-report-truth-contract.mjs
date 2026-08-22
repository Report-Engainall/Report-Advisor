import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const migrationsDir = path.join(root, 'supabase', 'migrations');

function readTree(dir, ext = '.ts') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...readTree(full, ext));
    else if (entry.name.endsWith(ext) || entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

const source = readTree(srcDir).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const migrations = fs.existsSync(migrationsDir)
  ? fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf8')).join('\n')
  : '';

const requiredSourceMarkers = [
  'normalize_import_key',
  'current_company_id',
];
for (const marker of requiredSourceMarkers) {
  if (!source.includes(marker) && !migrations.includes(marker)) {
    throw new Error(`Report truth contract missing canonical marker: ${marker}`);
  }
}

if (/SELECT\s+\*\s+FROM\s+auth\.users/i.test(source)) {
  throw new Error('Report truth contract forbids direct auth.users reporting reads');
}

if (/CREATE POLICY[^;]+USING\s*\(\s*true\s*\)/is.test(migrations)) {
  throw new Error('Report truth contract detected permissive RLS policy');
}

if (!/company_id\s*=\s*public\.current_company_id\(\)/i.test(migrations)) {
  throw new Error('Report truth contract requires tenant-scoped RLS predicates');
}

if (!/WITH CHECK\s*\(\s*company_id\s*=\s*public\.current_company_id\(\)\s*\)/i.test(migrations)) {
  throw new Error('Report truth contract requires tenant-scoped write checks');
}

console.log('Report truth contract: PASS (tenant scoped, fail-closed, no auth.users reporting reads)');
