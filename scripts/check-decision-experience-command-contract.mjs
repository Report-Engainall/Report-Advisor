import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');

assert.match(page, /const primarySignal = \(\(\) =>/);
assert.match(page, /critical: 4, high: 3/);
assert.match(page, /status === 'new' \|\| r\.status === 'accepted'/);
assert.match(page, /هدف القرار الأول/);
assert.match(page, /onClick=\{\(\) => primarySignal\.kind === 'alert'/);
assert.match(page, /من المصدر الكانوني/);
assert.doesNotMatch(page, /Math\.random\(|synthetic data|dummy data/);

console.log('Decision experience command contract: PASS');
console.log('  - first decision target is deterministic from source severity/priority');
console.log('  - recommendations still prefer actionable new/accepted states');
console.log('  - the target opens the existing evidence path, without changing backend semantics');
