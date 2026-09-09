import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const grep = execFileSync('git', ['grep', '-l', '-i', 'SECURITY DEFINER', '--', 'supabase/migrations'], { encoding: 'utf8' });
const migrationFiles = grep.split('\n').filter(Boolean);
if (migrationFiles.length === 0) throw new Error('No migration surface found for SECURITY DEFINER audit');

const stripSqlComments = (value) => value
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/--[^\n\r]*/g, '');

const failures = [];
for (const file of migrationFiles) {
  const sql = stripSqlComments(readFileSync(file, 'utf8'));
  const starts = [...sql.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([^\s(]+)/gi)]
    .map((match) => match.index ?? 0);

  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i];
    const end = starts[i + 1] ?? sql.length;
    const block = sql.slice(start, end);
    if (!/SECURITY\s+DEFINER/i.test(block)) continue;

    const fn = block.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([^\s(]+)/i)?.[1] ?? '<unknown>';
    if (!/SET\s+search_path\s*(?:=|TO)\s*'?(?:public|pg_catalog)'?/i.test(block)) {
      failures.push(`${file}: ${fn} missing fixed search_path (public or pg_catalog)`);
    }

    if (/current_company_id\s*\(\)|auth\.uid\s*\(\)/i.test(block)) continue;

    const normalizedFn = fn.replace(/^public\./i, '');
    const escapedFn = normalizedFn.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
    const serviceRoleOnly = new RegExp(
      `revoke\\\\s+all\\\\s+on\\\\s+function\\\\s+public\\\\.${escapedFn}[^;]*from\\\\s+public,anon,authenticated\\\\s*;[\\\\s\\\\S]*grant\\\\s+execute\\\\s+on\\\\s+function\\\\s+public\\\\.${escapedFn}[^;]*to\\\\s+service_role\\\\s*;`,
      'i',
    ).test(sql);

    if (!serviceRoleOnly) {
      failures.push(`${file}: ${fn} missing authenticated tenant/user binding`);
    }
  }
}

if (failures.length) {
  console.error('PHASE2_SECURITY_DEFINER_SURFACE_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PHASE2_SECURITY_DEFINER_SURFACE_PASS (${migrationFiles.length} migration files scanned)`);
