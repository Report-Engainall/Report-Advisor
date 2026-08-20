import fs from 'node:fs';
import assert from 'node:assert/strict';

const master = fs.readFileSync('docs/MASTER_PRODUCT_REFERENCE.md', 'utf8');
const required = [
  '## 31. Execution coverage snapshot',
  'Overall engineering implementation coverage: ~75%',
  'Production acceptance coverage: ~58%',
  '## 32. Immediate execution priorities',
  '## 33. Continuous development rule',
  'single-reference policy',
];
for (const token of required) assert.ok(master.includes(token), `master execution status missing: ${token}`);
assert.match(master, /Never trade correctness for apparent progress percentage/);
console.log('Master execution status contract: PASS');
