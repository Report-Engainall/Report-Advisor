import { execFileSync } from 'node:child_process';

const sql = execFileSync('git', ['grep', '-n', '-i', 'SECURITY DEFINER', '--', 'supabase/migrations'], { encoding: 'utf8' });
const migrationFiles = [...new Set(sql.split('\n').filter(Boolean).map((line) => line.split(':')[0]))];

if (migrationFiles.length === 0) throw new Error('No migration surface found for SECURITY DEFINER audit');

const { readFileSync } = await import('node:fs');
const stripSqlComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n\r]*/g, '');

const failures = [];
for (const file of migrationFiles) {
  const text = stripSqlComments(readFileSync(file, 'utf8'));
  const definitions = [...text.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([^\s(]+)[\s\S]*?SECURITY\s+DEFINER[\s\S]*?(?=\n\s*(?:CREATE|ALTER|GRANT|REVOKE|DROP)\s|\z)/gi)];
  for (const match of definitions) {
    const block = match[0];
    const fn = match[1];
    if (!/SET\s+search_path\s*=\s*'?public'?/i.test(block) && !/SET\s+search_path\s+TO\s+'?public'?/i.test(block)) {
      failures.push(`${file}: ${fn} missing fixed public search_path`);
    }
    // Privileged functions exposed to authenticated callers must bind to the
    // authenticated tenant context, not caller-supplied company identifiers.
    if (/GRANT\s+EXECUTE[\s\S]*TO\s+authenticated/i.test(block) && !/current_company_id\s*\(\)|auth\.uid\s*\(\)/i.test(block)) {
      failures.push(`${file}: ${fn} has authenticated execution without auth.uid/current_company_id binding`);
    }
  }
}

if (failures.length) {
  console.error('PHASE2_SECURITY_DEFINER_SURFACE_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PHASE2_SECURITY_DEFINER_SURFACE_PASS (${migrationFiles.length} migration files scanned)`);
