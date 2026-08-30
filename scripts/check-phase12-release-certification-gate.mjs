import fs from 'node:fs';

const files = ['vercel.json','package.json','scripts/check-production-release-blockers.mjs','scripts/check-production-certification-contract.mjs'];
for (const file of files) if (!fs.existsSync(file)) throw new Error(`Missing release surface: ${file}`);
const vercel = fs.readFileSync('vercel.json','utf8');
const pkg = fs.readFileSync('package.json','utf8');
const blockers = fs.readFileSync('scripts/check-production-release-blockers.mjs','utf8');
const cert = fs.readFileSync('scripts/check-production-certification-contract.mjs','utf8');

if (!vercel.includes('"destination": "/index.html"')) throw new Error('Release gate missing SPA fallback');
for (const token of ['build','lint','typecheck']) if (!pkg.includes(token)) throw new Error(`Release gate missing repository check: ${token}`);
for (const token of ['artifact-integrity','idempotencyKey','requiresApproval','MISSING_TENANT']) if (!blockers.includes(token)) throw new Error(`Release blocker coverage missing ${token}`);
for (const token of ['exact','SHA','evidence']) if (!cert.toLowerCase().includes(token.toLowerCase())) throw new Error(`Certification binding missing ${token}`);

// A release gate must never certify deployment merely from source text.
if (/PRODUCTION CERTIFIED\s*=\s*YES/i.test(cert)) throw new Error('Release gate rejects fabricated production certification');

// Test-of-test: a comment-only destination must not satisfy the executable rewrite contract.
const decoy = vercel.replace(/"destination": "/, '// "destination": "');
if (decoy.includes('"destination": "/index.html"')) throw new Error('Test-of-test accepted a comment-decoy as executable rewrite evidence');

console.log('Phase 12 release certification gate: PASS (repository-level; deployment evidence remains external)');
