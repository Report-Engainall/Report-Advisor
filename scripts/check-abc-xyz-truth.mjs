import fs from 'node:fs';

const source = fs.readFileSync('src/lib/free-toolbox/abc-xyz.ts', 'utf8');
const required = [
  "export type ABC='A'|'B'|'C'",
  "export type XYZ='X'|'Y'|'Z'",
  'Number.isFinite',
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`ABC/XYZ truth contract missing: ${token}`);
}
if (source.includes('annualValue:number|undefined') || source.includes('annualValue?:number')) {
  throw new Error('ABC/XYZ must not silently treat missing annual value as zero');
}
if (!source.includes('total=sorted.reduce')) throw new Error('ABC/XYZ cumulative value calculation missing');
if (!source.includes('Math.max(0,x.annualValue)')) throw new Error('negative annual value normalization contract missing');
console.log('ABC/XYZ truth regression: PASS');
