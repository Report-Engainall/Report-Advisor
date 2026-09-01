import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const index = read('docs/MASTER_EXECUTION_INDEX.md');
const pkg = JSON.parse(read('package.json'));
const failures = [];
const checks = [
  ['authenticated tenant certification is tracked', /Authenticated.*tenant|Tenant.*certification/i.test(index)],
  ['storage signed-url verification is tracked', /Storage\/signed URL/i.test(index)],
  ['realtime authorization verification is tracked', /Realtime authorization/i.test(index)],
  ['AI retrieval tenant isolation is tracked', /AI retrieval.*isolation/i.test(index)],
  ['backup restore drill is tracked', /Backup.*restore/i.test(index)],
  ['staging migration dry-run is tracked', /Staging migration dry-run/i.test(index)],
  ['worker recovery drill is tracked', /worker.*dead-letter.*recovery/i.test(index)],
  ['rollback drill is tracked', /rollback.*drill/i.test(index)],
  ['release blocker checker is wired', typeof pkg.scripts?.['test:production-release-blockers'] === 'string' && exists('scripts/check-production-release-blockers.mjs')],
  ['resilience manifest checker is wired', typeof pkg.scripts?.['test:release-resilience-manifest'] === 'string' && exists('scripts/check-release-resilience-manifest.mjs')],
];
for (const [label, ok] of checks) if (!ok) failures.push(label);
if (failures.length) {
  console.error(`Connected certification contract FAILED: ${failures.length}/${checks.length}`);
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log(`Connected certification contract PASS: ${checks.length}/${checks.length}`);
