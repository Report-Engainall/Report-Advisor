import fs from 'node:fs';

const path = 'src/lib/decision-automation/vertical-slice-runtime.ts';
const source = fs.readFileSync(path, 'utf8');

const forbidden = [
  /from\(['"]recommendations['"]\)\s*\.insert\s*\(/,
  /from\(['"]business_intelligence_decisions['"]\)\s*\.insert\s*\(/,
  /from\(['"]alerts['"]\)\s*\.insert\s*\(/,
];

const failures = forbidden.filter((pattern) => pattern.test(source));
if (failures.length) {
  console.error('Decision runtime DML boundary regression: FAIL');
  console.error('Lifecycle-sensitive decision/recommendation/alert inserts must use canonical RPCs.');
  process.exit(1);
}

for (const required of [
  "rpc('create_runtime_recommendation'",
  "rpc('create_runtime_decision'",
  "rpc('notify_decision_work_item'",
]) {
  if (!source.includes(required)) {
    console.error(`Decision runtime DML boundary regression: missing ${required}`);
    process.exit(1);
  }
}

console.log('Decision runtime DML boundary regression: PASS');
