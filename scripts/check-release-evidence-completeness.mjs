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
  .join('\n')
  .replace(/\s+/g, ' ');

for (const token of required) {
  if (!text.includes(token)) throw new Error(`Release evidence completeness missing: ${token}`);
}

const failClosedChecks = [
  /status\s+text[^;]*check\s*\(\s*status\s+in\s*\(\s*'candidate'\s*,\s*'canary'\s*,\s*'verified'\s*,\s*'blocked'\s*,\s*'rolled_back'\s*\)/i,
  /r\.status\s*=\s*'verified'/i,
  /t\.status\s*=\s*'valid'/i,
  /t\.blocker_count\s*=\s*0/i,
  /d\.status\s+in\s*\(\s*'failed'\s*,\s*'blocked'\s*\)/i,
];

for (const check of failClosedChecks) {
  if (!check.test(text)) {
    throw new Error(`Release evidence fail-closed semantic check failed: ${check}`);
  }
}

console.log('Release evidence completeness: PASS');
