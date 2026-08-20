import fs from 'node:fs';
const s=fs.readFileSync('src/lib/reportStudio.ts','utf8');
for(const t of ['ReportDefinition','filters','grouping','sorting','calculatedMetrics','schedule','version','validateReportDefinition']) if(!s.includes(t)) throw new Error(`Report Studio contract missing: ${t}`);
console.log('Report Studio contract: PASS');
