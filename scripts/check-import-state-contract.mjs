import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'supabase', 'migrations');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.sql')) : [];
const text = files.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');

const required = [
  'import_finish_job',
  'current_company_id',
  'IMPORT_TERMINAL_STATUS_REQUIRED',
];
const missing = required.filter((token) => !text.includes(token));
if (missing.length) {
  console.error(`Import lifecycle contract missing: ${missing.join(', ')}`);
  process.exit(1);
}
console.log('Import lifecycle contract PASS');
