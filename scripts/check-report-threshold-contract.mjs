import fs from 'node:fs';
const src=fs.readFileSync('src/lib/free-toolbox/report-readiness.ts','utf8');
for(const token of ['REPORT_QUALITY_THRESHOLD = 70','REPORT_READY_THRESHOLD = 80','x.dataQuality < REPORT_QUALITY_THRESHOLD','!x.hasEvidence']) if(!src.includes(token)) throw new Error(`Report threshold contract missing: ${token}`);
console.log('Report threshold contract: PASS');
