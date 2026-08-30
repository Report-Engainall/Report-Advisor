import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const files = [
  'vercel.json',
  'package.json',
  'scripts/check-production-release-blockers.mjs',
  'scripts/check-production-certification-contract.mjs',
];
for (const file of files) if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing release surface: ${file}`);

const vercelSource = read('vercel.json');
const pkg = JSON.parse(read('package.json'));
const blockers = read('scripts/check-production-release-blockers.mjs');
const cert = read('scripts/check-production-certification-contract.mjs');

const assertSpaFallback = (config) => {
  const rewrites = Array.isArray(config.rewrites) ? config.rewrites : [];
  if (!rewrites.some((rewrite) => rewrite && rewrite.destination === '/index.html')) {
    throw new Error('Release gate missing SPA fallback');
  }
};

let vercel;
try {
  vercel = JSON.parse(vercelSource);
} catch (error) {
  throw new Error(`Release gate invalid vercel.json: ${error.message}`);
}
assertSpaFallback(vercel);

for (const token of ['build', 'lint', 'typecheck']) {
  if (typeof pkg.scripts?.[token] !== 'string' || !pkg.scripts[token].trim()) {
    throw new Error(`Release gate missing package script: ${token}`);
  }
}
for (const token of ['artifact-integrity', 'idempotencyKey', 'requiresApproval', 'MISSING_TENANT']) if (!blockers.includes(token)) throw new Error(`Release blocker coverage missing ${token}`);

// Bind Phase 12 to the canonical evidence declaration rather than arbitrary
// source text, comments, or dead code.
const evidenceKeysMatch = cert.match(
  /PRODUCTION_CERTIFICATION_EVIDENCE_KEYS\s*:[^=]+?=\s*\[([\s\S]*?)\];/,
);
if (!evidenceKeysMatch) throw new Error('Certification binding missing canonical evidence declaration');
const canonicalEvidenceKeys = [...evidenceKeysMatch[1].matchAll(/['\"]([a-z_]+)['\"]/g)].map((match) => match[1]);
for (const key of ['tenant', 'backup', 'rollback', 'artifact', 'security']) {
  if (!canonicalEvidenceKeys.includes(key)) throw new Error(`Certification binding missing canonical evidence invariant: ${key}`);
}

if (/PRODUCTION CERTIFIED\s*=\s*YES/i.test(cert)) throw new Error('Release gate rejects fabricated production certification');

// Test-of-test: invoke the same SPA validator against a comment-only decoy.
const decoyConfig = { rewrites: [{ source: '/(.*)', destination: '// "destination": "/index.html"' }] };
let decoyRejected = false;
try {
  assertSpaFallback(decoyConfig);
} catch {
  decoyRejected = true;
}
if (!decoyRejected) throw new Error('Test-of-test accepted a comment-decoy as executable rewrite evidence');

console.log('Phase 12 release certification gate: PASS (repository-level; deployment evidence remains external)');
