import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationDir = path.join(root, 'supabase', 'migrations');
const files = fs.existsSync(migrationDir)
  ? fs.readdirSync(migrationDir).filter((f) => f.endsWith('.sql'))
  : [];

const intelligenceFiles = files.filter((f) => /file.*intelligence|import|intelligence/i.test(f));
if (intelligenceFiles.length === 0) throw new Error('No File Intelligence migrations found');

const text = intelligenceFiles
  .map((f) => fs.readFileSync(path.join(migrationDir, f), 'utf8'))
  .join('\n');

const forbiddenAnonCrud = /CREATE\\s+POLICY[^;]+TO\\s+anon[^;]+\\b(FOR\\s+(SELECT|INSERT|UPDATE|DELETE)|USING\\s*\\(\\s*true\\s*\\)|WITH\\s+CHECK\\s*\\(\\s*true\\s*\\))/is;
if (forbiddenAnonCrud.test(text)) {
  throw new Error('Anonymous File Intelligence CRUD policy detected');
}

const lockdown = text.includes('REVOKE ALL ON TABLE public.file_records FROM anon')
  && text.includes('REVOKE ALL ON TABLE public.import_jobs FROM anon');
if (!lockdown) throw new Error('Anonymous File Intelligence lockdown is missing');

console.log('File Intelligence security contract: PASS');
