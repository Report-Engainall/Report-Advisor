import fs from 'node:fs';

const checks = [
  ['scripts/check-execution-index-integrity.mjs', 'Execution index integrity'],
  ['scripts/check-worker-index-contract.mjs', 'Worker index contract'],
  ['scripts/check-release-boundary-contract.mjs', 'Release boundary contract'],
  ['scripts/check-closure-track-contract.mjs', 'Closure track contract'],
  ['scripts/check-no-certification-overclaim.mjs', 'Certification overclaim guard'],
];
for (const [file, label] of checks) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${label}: ${file}`);
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('process.exit(1)')) throw new Error(`${label} has no fail-closed exit`);
  if (!source.includes('PASS:')) throw new Error(`${label} has no PASS assertion`);
}
console.log(`PASS: execution guard self-test (${checks.length}/${checks.length})`);
