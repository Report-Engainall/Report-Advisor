import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const grep = execFileSync('git', ['grep', '-l', '-i', 'SECURITY DEFINER', '--', 'supabase/migrations'], { encoding: 'utf8' });
const migrationFiles = grep.split('\n').filter(Boolean);
if (migrationFiles.length === 0) throw new Error('No migration surface found for SECURITY DEFINER audit');

const stripSqlComments = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/--[^\n\r]*/g, '');

const failures = [];
for (const file of migrationFiles) {
  const text = stripSqlComments(readFileSync(file, 'utf8'));
  const starts = [...text.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([^\s(]+)/gi)].map((m) => m.index ?? 0);
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i];
    const end = starts[i + 1] ?? text.length;
    const block = text.slice(start, end);
    if (!/SECURITY\s+DEFINER/i.test(block)) continue;
    const fn = block.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([^\s(]+)/i)?.[1] ?? '<unknown>';

    if (!/SET\s+search_path\s*(?:=|TO)\s*'?public'?/i.test(block)) {
      failures.push(`${file}: ${fn} missing fixed public search_path`);
    }
    if (!/current_company_id\s*\(\)|auth\.uid\s*\(\)/i.test(block)) {
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
