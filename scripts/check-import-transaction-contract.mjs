import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationDir = path.join(root, 'supabase', 'migrations');
const files = fs.existsSync(migrationDir) ? fs.readdirSync(migrationDir).filter((f) => f.endsWith('.sql')) : [];
const text = files.map((f) => fs.readFileSync(path.join(migrationDir, f), 'utf8')).join('\n');

const required = [
  /import_jobs/i,
  /import_job_rows/i,
  /finalize/i,
  /rollback|failed|cancel/i,
  /FOR UPDATE|advisory|lock/i,
];
for (const pattern of required) {
  if (!pattern.test(text)) throw new Error(`Import transaction contract missing: ${pattern}`);
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
