import fs from 'node:fs';
const root=process.cwd();
const file='src/lib/report-execution/durable-production-runner.ts';
if(!fs.existsSync(file)) throw new Error('Durable production runner missing');
const s=fs.readFileSync(file,'utf8');
for(const t of ['store.claim','store.saveCheckpoint','store.complete','runProductionLifecycle','sourceHash','Tenant mismatch','executeStage']) if(!s.includes(t)) throw new Error(`Durable runner contract missing: ${t}`);
console.log('Durable production runner contract: PASS');
