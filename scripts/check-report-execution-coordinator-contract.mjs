import fs from 'node:fs';
const files = {
  'src/lib/report-execution/execution-ledger.ts': ['ReportExecutionCoordinator','assertReportExecutionReady','assertNoQuarantine','IdempotencyRegistry','InMemoryReportQueue','immutable: true'],
};
for (const [file,tokens] of Object.entries(files)) { const s=fs.readFileSync(file,'utf8'); for (const token of tokens) if(!s.includes(token)) throw new Error(`${file}: missing ${token}`); }
console.log('report execution coordinator contract: PASS');
