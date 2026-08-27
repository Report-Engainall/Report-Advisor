import fs from 'node:fs';

const source = fs.readFileSync('src/lib/free-toolbox/decision-priority.ts', 'utf8');
const failures = [];

if (!/financialExposure\?:number\|null/.test(source)) {
  failures.push('financialExposure must explicitly support unknown/null');
}
if (/financialExposure\?\?50/.test(source)) {
  failures.push('financialExposure must not default to fabricated business value 50');
}
if (!/financialExposure!==null&&x\.financialExposure!==undefined/.test(source)) {
  failures.push('unknown financialExposure must be excluded from the weighted score rather than converted to a number');
}
if (!/Number\.isFinite\(x\.financialExposure\)/.test(source)) {
  failures.push('non-finite financialExposure must not enter decision scoring');
}
if (!/components\.reduce\(\(sum,\[w,v\]\)=>sum\+w\*v,0\)\/weight/.test(source)) {
  failures.push('decision score must normalize over known components when financial exposure is unavailable');
}

if (failures.length) {
  console.error('DECISION_PRIORITY_TRUTH: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('DECISION_PRIORITY_TRUTH: PASS');
