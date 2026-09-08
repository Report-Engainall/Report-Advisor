import fs from 'node:fs';

const source = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const findings = [];

for (const report of ['Sales', 'Purchases', 'Inventory', 'Receivables']) {
  if (!source.includes(`export${report}`)) findings.push(`${report}: export handler missing`);
}
if (!/if\(exporting\)return/.test(source)) findings.push('exports lack duplicate-click fencing');
if (!/setExporting\(true\)/.test(source) || !/finally\{setExporting\(false\);\}/.test(source)) findings.push('exports lack complete pending lifecycle');
if (!/setExportError\(null\)/.test(source) || !/catch\(e\)\{setExportError\(/.test(source)) findings.push('exports lack local rejection state');
if ((source.match(/onRetry=\{\(\)=>window\.location\.reload\(\)\}/g) ?? []).length) findings.push('destructive browser reload retry remains');
if (!/onRetry=\{load\}/.test(source)) findings.push('local retry callback missing');

if (findings.length) {
  console.error('Reports async/export closure: FAIL');
  findings.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log('Reports async/export closure: PASS');
