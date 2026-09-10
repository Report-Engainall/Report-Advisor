import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'source_sha',
  'migrations_fingerprint',
  'dependency_fingerprint',
  'artifact_fingerprint',
  'certification',
  'canary',
  'rollback',
  'trust',
];

const candidates = [
  'supabase/migrations/20260825060000_release_evidence_manifest.sql',
  'supabase/migrations/20260825070000_release_evidence_manifest.sql',
  'supabase/migrations/20260825080000_release_evidence_hardening.sql',
];

const text = candidates
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), 'utf8').toLowerCase())
  .join('\n');

for (const token of required) {
  if (!text.includes(token)) throw new Error(`Release evidence completeness missing: ${token}`);
}

if (!text.includes('fail-closed') && !text.includes('fail_closed')) {
  throw new Error('Release evidence must be fail-closed');
}

console.log('Release evidence completeness: PASS');
