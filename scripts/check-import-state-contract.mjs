import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'supabase', 'migrations');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.sql')) : [];
const migrationText = files.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const queriesSource = fs.readFileSync(path.join(root, 'src/lib/queries.ts'), 'utf8');

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
];
const assertAppContract = (source) => {
  const missing = appInvariants.filter((token) => !source.includes(token));
  if (missing.length) throw new Error('Import application truth contract missing: ' + missing.join(', '));
};
assertAppContract(queriesSource);

const knownBadPatterns = [
  'p_processed_rows: Math.max(0, Math.round(patch.progress))',
  'p_valid_rows: Math.max(0, Math.round(patch.progress))',
];
const regressions = knownBadPatterns.filter((token) => queriesSource.includes(token));
if (regressions.length) {
  console.error('Import progress regression detected: ' + regressions.join(', '));
  process.exit(1);
}

// Test-of-test: if the row conversion is removed, the contract must fail.
const tampered = queriesSource.replace('current.total_rows * progress / 100', 'progress');
let tamperRejected = false;
try { assertAppContract(tampered); } catch { tamperRejected = true; }
if (!tamperRejected) throw new Error('Import state test-of-test failed: weakened progress conversion was not detected');

console.log('Import lifecycle contract PASS (DB lifecycle + percentage-to-row truth + regression guard)');