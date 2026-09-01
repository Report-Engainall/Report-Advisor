import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'scripts/production-readiness-manifest.mjs',
  'scripts/production-readiness-manifest.test.mjs',
  'scripts/production-readiness-evidence.test.mjs',
  'scripts/production-release-decision.test.mjs',
  'scripts/check-production-evidence-failclosed.mjs',
  'scripts/check-live-production-evidence-boundary.mjs',
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Certification boundary missing: ${file}`);
}

const read = file => fs.readFileSync(path.join(root, file), 'utf8').toLowerCase();
const manifest = read('scripts/production-readiness-manifest.mjs');
const evidence = read('scripts/production-readiness-evidence.test.mjs');
const decision = read('scripts/production-release-decision.test.mjs');
const failclosed = read('scripts/check-production-evidence-failclosed.mjs');

for (const token of ['readiness', 'manifest', 'evidence']) {
  if (!manifest.includes(token)) throw new Error(`Manifest contract missing: ${token}`);
}
for (const token of ['evidence', 'production', 'approved']) {
  if (!evidence.includes(token)) throw new Error(`Evidence contract missing: ${token}`);
}
for (const token of ['blocked', 'release', 'regression']) {
  if (!decision.includes(token)) throw new Error(`Release decision contract missing: ${token}`);
}
if (!failclosed.includes('fail') || !failclosed.includes('closed')) {
  throw new Error('Production certification must remain fail-closed');
}

console.log('PRODUCTION CERTIFICATION BOUNDARY: PASS');
