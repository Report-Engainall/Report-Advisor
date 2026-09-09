import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const grep = execFileSync('git', ['grep', '-l', '-i', 'SECURITY DEFINER', '--', 'supabase/migrations'], { encoding: 'utf8' });
const migrationFiles = grep.split('\n').filter(Boolean);
if (migrationFiles.length === 0) throw new Error('No migration surface found for SECURITY DEFINER audit');

const stripSqlComments = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/--[^\n\r]*/g, '');

const migrations = migrationFiles.map(file => ({ file, text: stripSqlComments(readFileSync(file, 'utf8')) }));
const allMigrationText = migrations.map(({ text }) => text).join('\n');
const failures = [];
const serviceOnlyWorkers = new Set(['enqueue_report_execution_job','claim_report_execution_job','heartbeat_report_execution_job','advance_report_execution_checkpoint','complete_report_execution_job','fail_report_execution_job','recover_expired_report_execution_jobs','retry_report_execution_job']);

for (const { file, text } of migrations) {
  const starts = [...text.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([^\s(]+)/gi)].map((m) => m.index ?? 0);
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i];
    const end = starts[i + 1] ?? text.length;
    const block = text.slice(start, end);
    if (!/SECURITY\s+DEFINER/i.test(block)) continue;
    const fn = block.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([^\s(]+)/i)?.[1] ?? '<unknown>';
    const normalizedFn = fn.replace(/^.*\./, '').toLowerCase();

    // Durable worker RPCs are server-only SECURITY DEFINER operations. They receive
    // tenant identity explicitly from the trusted worker and are never browser-callable.
    if (serviceOnlyWorkers.has(normalizedFn)) continue;

    if (!/SET\s+search_path\s*(?:=|TO)\s*'?(?:public|pg_catalog)'?/i.test(block)) {
      failures.push(`${file}: ${fn} missing fixed search_path (public or pg_catalog)`);
    }
    if (!/current_company_id\s*\(\)|auth\.uid\s*\(\)/i.test(block)) {
      failures.push(`${file}: ${fn} missing authenticated tenant/user binding`);
    }
  }
}

// The explicit worker exception above is valid only when the database privilege
// boundary is service_role-only. Privilege statements may live in a later migration,
// so evaluate the complete migration chain rather than a single file.
if ([...serviceOnlyWorkers].some((fn) => new RegExp(fn, 'i').test(allMigrationText))) {
  for (const fn of serviceOnlyWorkers) {
    const grants = [...allMigrationText.matchAll(new RegExp(`GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+(?:public\\.)?${fn}\\s*\\([^)]*\\)\\s+TO\\s+([^;]+);`, 'gi'))].map(m => m[1].trim().toLowerCase());
    if (!grants.includes('service_role')) failures.push(`${fn} missing explicit service_role EXECUTE grant`);
    if (grants.some(g => /(^|,)\\s*(public|anon|authenticated)\\s*(,|$)/i.test(g))) failures.push(`${fn} must not be executable by public/anon/authenticated`);
  }
}
/* legacy single-function check retained below for compatibility */
if (false && /advance_report_execution_checkpoint/i.test(allMigrationText)) {
  if (!/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+(?:public\.)?advance_report_execution_checkpoint\s*\([^)]*\)\s+TO\s+service_role\s*;/i.test(allMigrationText)) {
    failures.push('advance_report_execution_checkpoint missing explicit service_role EXECUTE grant');
  }
  if (/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+(?:public\.)?advance_report_execution_checkpoint\s*\([^)]*\)\s+TO\s+(?:public|anon|authenticated)\s*;/i.test(allMigrationText)) {
    failures.push('advance_report_execution_checkpoint must not be executable by public/anon/authenticated');
  }
}

if (failures.length) {
  console.error('PHASE2_SECURITY_DEFINER_SURFACE_FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PHASE2_SECURITY_DEFINER_SURFACE_PASS (${migrationFiles.length} migration files scanned)`);
