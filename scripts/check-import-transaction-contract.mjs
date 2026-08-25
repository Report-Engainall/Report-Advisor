import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationDir = path.join(root, 'supabase', 'migrations');
const files = fs.existsSync(migrationDir) ? fs.readdirSync(migrationDir).filter((f) => f.endsWith('.sql')) : [];
const text = files.map((f) => fs.readFileSync(path.join(migrationDir, f), 'utf8')).join('\n');

const required = [
  /import_jobs/i,
  /import_job_rows/i,
  /(?:finalize|finish[_ ]?job|terminal|completed)/i,
  /(?:rollback|failed|cancel(?:led|lled)?)/i,
  /FOR\s+UPDATE|advisory|lock/i,
  /import_commit_batch/i,
  /any row failure rolls back the whole chunk/i,
];
for (const pattern of required) {
  if (!pattern.test(text)) throw new Error(`Import transaction contract missing: ${pattern}`);
}

const lifecycleMigration = files
  .filter((f) => /import.*(job|engine)|security.*import/i.test(f))
  .map((f) => fs.readFileSync(path.join(migrationDir, f), 'utf8'))
  .join('\n');
if (!/(?:status\s*=\s*p_status|p_status)/i.test(lifecycleMigration)) {
  throw new Error('Import transaction lifecycle does not persist terminal status');
}
if (!/failed/i.test(lifecycleMigration) || !/cancelled/i.test(lifecycleMigration)) {
  throw new Error('Import transaction lifecycle must support failed and cancelled states');
}

const canonicalCommitPath = path.join(root, 'src', 'lib', 'import', 'canonical-commit.ts');
if (fs.existsSync(canonicalCommitPath)) {
  const canonical = fs.readFileSync(canonicalCommitPath, 'utf8');
  if (!/resolveCurrentCompanyId\(\)/.test(canonical) || !/import_commit_batch/.test(canonical)) {
    throw new Error('Canonical import must resolve authoritative tenant and commit through the atomic RPC wrapper');
  }
  if (!/IMPORT_COMMIT_RESULT_MISMATCH/.test(canonical)) {
    throw new Error('Canonical import must verify the durable batch result count and IDs');
  }
}

const batchFolderPath = path.join(root, 'src', 'lib', 'import', 'batch-folder.ts');
if (fs.existsSync(batchFolderPath)) {
  const batch = fs.readFileSync(batchFolderPath, 'utf8');
  if (!/offset\+=500/.test(batch)) throw new Error('Folder import must use bounded atomic chunks');
  if (!/status:'failed'|status\s*:\s*'failed'/.test(batch) || !/updateImportRecord\(importRecordId,\{status:'failed'/.test(batch)) {
    throw new Error('Failed folder imports must persist a terminal failed state');
  }
  if (!/committed, error:message/.test(batch)) throw new Error('Failed folder imports must preserve committed progress');
}

const forbiddenDirectBulk = /supabase\.from\([^)]*(products|import_job_rows|orders)[^)]*\)\.(insert|upsert|update)\s*\(/is;
const sourceDirs = ['src/lib', 'src/services'];
for (const dir of sourceDirs) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) continue;
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
        const body = fs.readFileSync(full, 'utf8');
        if (forbiddenDirectBulk.test(body) && !/import-upsert|unified-import/i.test(full)) {
          throw new Error(`Direct bulk write outside governed import path: ${full}`);
        }
      }
    }
  }
}

console.log('Import transaction contract: PASS');
