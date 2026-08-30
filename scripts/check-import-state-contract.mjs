import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'supabase', 'migrations');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.sql')) : [];
const migrationText = files.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const queriesSource = fs.readFileSync(path.join(root, 'src/lib/queries.ts'), 'utf8');
const compatSource = fs.readFileSync(path.join(root, 'src/lib/queries-compat.ts'), 'utf8');

const required = ['import_finish_job', 'current_company_id', 'IMPORT_TERMINAL_STATUS_REQUIRED'];
const missing = required.filter((token) => !migrationText.includes(token));
if (missing.length) {
  console.error('Import lifecycle contract missing: ' + missing.join(', '));
  process.exit(1);
}

// progress is a percentage; it must be converted against persisted total_rows.
const appInvariants = [
  'async function readImportJob',
  'current.total_rows * progress / 100',
  'p_valid_rows: current.valid_rows',
  'p_invalid_rows: current.invalid_rows',
  'p_duplicate_rows: current.duplicate_rows',
  "const TERMINAL_IMPORT_STATUSES = new Set(['completed', 'partial', 'failed', 'cancelled'])",
  'IMPORT_STATE_INSUFFICIENT_DATA',
  'data.total_rows == null ? null : Number(data.total_rows)',
  'row.total_rows == null ? null : Number(row.total_rows)',
  'row.quarantined_rows == null ? null : Number(row.quarantined_rows)',
];
const assertAppContract = (source) => {
  const missing = appInvariants.filter((token) => !source.includes(token));
  if (missing.length) throw new Error('Import application truth contract missing: ' + missing.join(', '));
};
assertAppContract(queriesSource);
assertAppContract(compatSource);

const knownBadPatterns = [
  'p_processed_rows: Math.max(0, Math.round(patch.progress))',
  'p_valid_rows: Math.max(0, Math.round(patch.progress))',
  'total_rows: Number(data.total_rows ?? 0)',
  'total_rows: row.total_rows ?? 0',
  'valid_rows: row.valid_rows ?? 0',
  'invalid_rows: row.invalid_rows ?? 0',
  'quarantined_rows: 0',
];
const regressions = knownBadPatterns.filter((token) => queriesSource.includes(token) || compatSource.includes(token));
if (regressions.length) {
  console.error('Import truth regression detected: ' + regressions.join(', '));
  process.exit(1);
}

// Test-of-test: if the row conversion is removed, the contract must fail.
const tampered = queriesSource.replace('current.total_rows * progress / 100', 'progress');
let tamperRejected = false;
try { assertAppContract(tampered); } catch { tamperRejected = true; }
if (!tamperRejected) throw new Error('Import state test-of-test failed: weakened progress conversion was not detected');

// Test-of-test: removing the incomplete-state fail-closed guard must be detected.
const weakenedNullGuard = queriesSource.replaceAll('IMPORT_STATE_INSUFFICIENT_DATA', '');
let nullGuardRejected = false;
try { assertAppContract(weakenedNullGuard); } catch { nullGuardRejected = true; }
if (!nullGuardRejected) throw new Error('Import NULL-state test-of-test failed: weakened unknown-state handling was not detected');

console.log('Import lifecycle contract PASS (DB lifecycle + percentage-to-row truth + NULL preservation + regression guard)');
