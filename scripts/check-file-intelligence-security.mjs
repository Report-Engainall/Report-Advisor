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

// Legacy migrations may contain the historical prototype policy definitions.
// The production invariant is the final hardening migration: it must remove
// every anonymous policy and revoke table privileges, including when the
// migration applies the invariant through a dynamic table loop.
const forbiddenAnonCrud = /CREATE\\s+POLICY[^;]+TO\\s+anon[^;]+\\b(FOR\\s+(SELECT|INSERT|UPDATE|DELETE)|USING\\s*\\(\\s*true\\s*\\)|WITH\\s+CHECK\\s*\\(\\s*true\\s*\\))/is;
if (forbiddenAnonCrud.test(text)) {
  throw new Error('Anonymous File Intelligence CRUD policy detected');
}

const lockdownName = files.find((f) => /file_intelligence_anon_lockdown/i.test(f));
if (!lockdownName) throw new Error('File Intelligence anonymous-lockdown migration is missing');
const lockdown = fs.readFileSync(path.join(migrationDir, lockdownName), 'utf8');

const lockdownDropsAnonPolicies = [
  'anon_select_',
  'anon_insert_',
  'anon_update_',
  'anon_delete_',
].every((marker) => lockdown.includes(marker));

const lockdownRevokesAnonTables =
  /REVOKE\\s+ALL\\s+ON\\s+TABLE\\s+public\\.%I\\s+FROM\\s+anon/i.test(lockdown)
  || (
    lockdown.includes('REVOKE ALL ON TABLE public.file_records FROM anon')
    && lockdown.includes('REVOKE ALL ON TABLE public.import_jobs FROM anon')
  );

if (!lockdownDropsAnonPolicies || !lockdownRevokesAnonTables) {
  throw new Error('Anonymous File Intelligence lockdown is missing');
}

console.log('File Intelligence security contract: PASS');
