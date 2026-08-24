import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  '.github/workflows/master-production-verification.yml',
  'scripts/check-release-evidence-completeness.mjs',
  'scripts/check-production-certification-contract.mjs',
  'scripts/check-production-release-blockers.mjs',
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing production evidence boundary component: ${file}`);
}

const workflow = fs.readFileSync(path.join(root, required[0]), 'utf8');
const evidence = fs.readFileSync(path.join(root, required[1]), 'utf8').toLowerCase();
const certification = fs.readFileSync(path.join(root, required[2]), 'utf8').toLowerCase();
const blockers = fs.readFileSync(path.join(root, required[3]), 'utf8').toLowerCase();

for (const token of ['check-release-evidence-completeness.mjs', 'check-autonomy-safety-chain.mjs', 'check-final-safety-invariants.mjs']) {
  if (!workflow.includes(token)) throw new Error(`Master workflow is missing live boundary gate: ${token}`);
}
for (const token of ['source_sha', 'migrations_fingerprint', 'dependency_fingerprint', 'artifact_fingerprint']) {
  if (!evidence.includes(token)) throw new Error(`Release evidence identity missing: ${token}`);
}
for (const token of ['tenant', 'backup', 'rollback', 'artifact', 'security']) {
  if (!certification.includes(token)) throw new Error(`Certification evidence missing: ${token}`);
}
for (const token of ['blocker', 'production', 'fail']) {
  if (!blockers.includes(token)) throw new Error(`Production blocker contract missing: ${token}`);
}

if (!/live|staging|production/i.test(workflow)) throw new Error('Master workflow has no environment boundary marker');
console.log('Live production evidence boundary: PASS');
