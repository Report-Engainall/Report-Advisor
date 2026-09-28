import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const allMigrationFiles = execFileSync('git', ['ls-files', 'supabase/migrations/*.sql'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);
const grep = execFileSync('git', ['grep', '-l', '-i', 'SECURITY DEFINER', '--', 'supabase/migrations'], { encoding: 'utf8' });
const securityDefinerMigrationFiles = grep.split('\n').filter(Boolean);
if (securityDefinerMigrationFiles.length === 0) throw new Error('No migration surface found for SECURITY DEFINER audit');

const stripSqlComments = (value) => value
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/--[^\n\r]*/g, '');

const functionName = (fn) => fn.replace(/^public\./i, '').replace(/"/g, '');
const hasServiceRoleOnlyGrant = (sql, fn) => {
  const name = functionName(fn).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const revoke = new RegExp(
    `REVOKE\\s+ALL\\s+ON\\s+FUNCTION\\s+public\\.${name}\\s*\\([^;]*?\\)\\s+FROM\\s+(?:PUBLIC|public)\\s*,\\s*anon\\s*,\\s*authenticated\\s*;`,
    'i',
  );
  const grant = new RegExp(
    `GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+public\\.${name}\\s*\\([^;]*?\\)\\s+TO\\s+service_role\\s*;`,
    'i',
  );
  return revoke.test(sql) && grant.test(sql);
};

const hasLaterServiceRoleOnlyGrant = (file, fn) => {
  const fileIndex = allMigrationFiles.indexOf(file);
  if (fileIndex < 0) return false;
  for (const laterFile of allMigrationFiles.slice(fileIndex + 1)) {
    const laterSql = stripSqlComments(readFileSync(laterFile, 'utf8'));
    if (hasServiceRoleOnlyGrant(laterSql, fn)) return true;
  }
  return false;
};

const failures = [];
for (const file of securityDefinerMigrationFiles) {
  const sql = stripSqlComments(readFileSync(file, 'utf8'));
  const starts = [...sql.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([^\s(]+)\s*\([^)]*\)/gi)]
    .map((match) => match.index ?? 0);

  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i];
    const end = starts[i + 1] ?? sql.length;
    const block = sql.slice(start, end);
    if (!/SECURITY\s+DEFINER/i.test(block)) continue;

    const fn = block.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([^\s(]+)\s*\(/i)?.[1] ?? '<unknown>';
    if (!/SET\s+search_path\s*(?:=|TO)\s*(?:''|'?(?:public|pg_catalog)'?)/i.test(block)) {
      failures.push(`${file}: ${fn} missing fixed search_path (explicit empty, public, or pg_catalog)`);
    }

    if (/current_company_id\s*\(\)|auth\.uid\s*\(\)/i.test(block)) continue;

    if (!hasServiceRoleOnlyGrant(sql, fn) && !hasLaterServiceRoleOnlyGrant(file, fn)) {
      failures.push(`${file}: ${fn} missing authenticated tenant/user binding or explicit service_role-only boundary`);
    }
  }
}

if (failures.length) {
  console.error('PHASE2_SECURITY_DEFINER_SURFACE_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PHASE2_SECURITY_DEFINER_SURFACE_PASS (${securityDefinerMigrationFiles.length} security-definer migrations scanned)`);