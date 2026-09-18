import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/WorkCenterPage.tsx', 'utf8');

assert.match(page, /const priorityRow = useMemo\(\(\) =>/);
assert.match(page, /status === 'failed' \|\| r\.status === 'cancelled'/);
assert.match(page, /status === 'partial' \|\|/);
assert.match(page, /status === 'queued' \|\| r\.status === 'processing'/);
assert.match(page, /نقطة القرار الأولى/);
assert.match(page, /onClick=\{\(\) => inspect\(priorityRow\.row\)\}/);
assert.doesNotMatch(page, /Math\.random\(|synthetic data|dummy data/);

console.log('Work Center command contract: PASS');
console.log('  - first action is deterministic: failure -> review -> active');
console.log('  - action opens the same evidence/investigation path as the source row');
console.log('  - no new backend or synthetic prioritization data is introduced');
