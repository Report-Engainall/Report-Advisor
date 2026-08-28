import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/exact-head-verification.yml', 'utf8');

const required = [
  'pull_request:',
  'github.event.pull_request.head.sha',
  'ref: ${{ github.event.pull_request.head.sha || github.sha }}',
  'git rev-parse HEAD',
  'test "$actual_sha" = "$exact_head_sha"',
  'EXACT_HEAD_SHA=',
  'MERGE_REF_SHA=',
  'BASE_SHA=',
  'HEAD_BRANCH=',
  'EVENT_NAME=',
  'npm run typecheck',
  'npm run lint',
  'npm run build',
  'npm run test:product-vertical-slice',
  'npm run test:tenant-security-contract',
  'npm run test:global-tenant-rls',
  'npm run test:migration-schema-audit',
  'npm run test:migration-dependencies',
];

const missing = required.filter((token) => !workflow.includes(token));
if (missing.length) {
  console.error('Exact-head CI contract FAIL');
  for (const token of missing) console.error(`- missing: ${token}`);
  process.exit(1);
}

if (workflow.includes('ref: ${{ github.sha }}')) {
  console.error('Exact-head CI contract FAIL: checkout relies on github.sha');
  process.exit(1);
}

console.log('Exact-head CI contract PASS');
console.log('PR HEAD is explicitly checked out by immutable SHA and compared to git rev-parse HEAD.');
