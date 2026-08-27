import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = readFileSync(resolve('src/lib/free-toolbox/grouped-report.ts'), 'utf8');
const required = [
  'type MissingState={stock:boolean;requested:boolean;sales:boolean;demand:boolean}',
  'else state.stock=true',
  'if(state?.stock)x.stockUnits=Number.NaN',
  'Number.isFinite(x.stockUnits)&&Number.isFinite(x.dailyDemand)',
];
for (const marker of required) {
  if (!file.includes(marker)) throw new Error(`Grouped report NULL-truth regression missing: ${marker}`);
}
if (/stockUnits\+=Number\.isFinite\(r\.stockUnits\).*:0/.test(file)) {
  throw new Error('Grouped report must not coerce missing stock to zero');
}
console.log('GROUPED_REPORT_NULL_TRUTH=PASS');
