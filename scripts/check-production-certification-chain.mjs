import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'scripts/check-production-certification-contract.mjs',
  'scripts/check-production-release-blockers.mjs',
  'scripts/check-phase-m-certification-contract.mjs',
  'scripts/check-evidence-provenance-chain.mjs',
  'scripts/check-evidence-lineage-contract.mjs',
  'scripts/check-phase11-e2e-performance-closure.mjs',
  'supabase/migrations/20260825150000_phase_m_certification_bundle.sql',
];

for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing certification component: ${file}`);
  }
}

const componentText = files
  .filter((file) => !file.endsWith('.sql'))
  .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
  .join('\n')
  .toLowerCase();

const checks = {
  tenant: ['tenant'],
  storage: ['storage'],
  realtime: ['realtime'],
  retrieval: ['retrieval', 'source snapshot', 'sourcesnapshotid', 'evidence lineage'],
  backup: ['backup'],
  migration: ['migration'],
  artifact: ['artifact'],
  rollback: ['rollback'],
  security: ['security'],
  continuous_trust: ['continuous_trust', 'continuous trust'],
};

for (const [name, tokens] of Object.entries(checks)) {
  if (!tokens.some((token) => componentText.includes(token.toLowerCase()))) {
    throw new Error(`Certification chain missing: ${name}`);
  }
}

for (const token of ['fail-closed', 'blocker', 'production']) {
  if (!componentText.includes(token)) {
    throw new Error(`Certification fail-closed invariant missing: ${token}`);
  }
}

// Security-grant inspection is deliberately scoped to the certification SQL migration.
// The contract test itself contains the forbidden phrase as a negative assertion, so
// scanning all component source would produce a false positive.
const certificationMigration = fs
  .readFileSync(path.join(root, 'supabase/migrations/20260825150000_phase_m_certification_bundle.sql'), 'utf8')
  .toLowerCase();
if (/grant\s+all\s+to\s+anon/i.test(certificationMigration)) {
  throw new Error('Unsafe anonymous certification grant detected');
}

console.log('Production certification chain: PASS');
