import fs from 'node:fs';

const writer = fs.readFileSync('src/lib/import/canonical-commit.ts', 'utf8');
const policy = fs.readFileSync('src/lib/file-engine/universal-intelligence.ts', 'utf8');

const requiredWriterSignals = [
  "supabase.rpc('import_commit_batch_governed'",
  'p_resolutions: resolutions',
  'p_source_rows: sourceRows',
  "p_null_policy: 'preserve'",
  'assertCanonicalBoundary',
];
for (const signal of requiredWriterSignals) {
  if (!writer.includes(signal)) throw new Error(`GOVERNED_WRITER_CONTRACT_MISSING:${signal}`);
}

const requiredPolicySignals = [
  "outcome: 'new'",
  "action: 'write_new'",
  'allowedToWrite: true',
];
for (const signal of requiredPolicySignals) {
  if (!writer.includes(signal)) throw new Error(`GOVERNED_RESOLUTION_CONTRACT_MISSING:${signal}`);
}

if (!policy.includes("outcome: 'skip_exact'")) throw new Error('UNIVERSAL_RESOLUTION_POLICY_MISSING_EXACT');
if (!policy.includes("outcome: 'candidate_duplicate'")) throw new Error('UNIVERSAL_RESOLUTION_POLICY_MISSING_DUPLICATE');
if (!policy.includes("outcome: 'conflict'")) throw new Error('UNIVERSAL_RESOLUTION_POLICY_MISSING_CONFLICT');

console.log('GOVERNED_IMPORT_WRITER_CONTRACT: PASS');
