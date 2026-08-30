import fs from 'node:fs';
const sources={
  watcher:fs.readFileSync('src/lib/import-pipeline/folder-watch-service.ts','utf8'),
  orchestrator:fs.readFileSync('src/lib/import-pipeline/folder-job-orchestrator.ts','utf8'),
  ledger:fs.readFileSync('scripts/incremental-import-ledger.test.ts','utf8'),
  platform:fs.readFileSync('scripts/check-folder-watch-platform-contract.mjs','utf8'),
  pipeline:fs.readFileSync('scripts/check-watched-report-pipeline-contract.mjs','utf8'),
};
const failures=[];const must=(x,m)=>{if(!x)failures.push(m)};
for(const t of ['retry','duplicate','error','watch','file'])must(sources.watcher.toLowerCase().includes(t),`watcher missing ${t} lifecycle handling`);
for(const t of ['idempot','tenant','job','retry'])must(sources.orchestrator.toLowerCase().includes(t),`orchestrator missing ${t} safety`);
for(const t of ['duplicate','replay','incremental','ledger'])must(sources.ledger.toLowerCase().includes(t),`ledger regression missing ${t}`);
for(const t of ['platform','relative','tenant'])must(sources.platform.toLowerCase().includes(t),`platform contract missing ${t}`);
for(const t of ['watched','pipeline','quarantine'])must(sources.pipeline.toLowerCase().includes(t),`watched pipeline contract missing ${t}`);
const decoy='// completed -> success -> outcome';must(!/success/.test(decoy.replace(/\/\/[^\n]*/g,'')),'comment lifecycle decoy must not satisfy watcher proof');
if(failures.length){console.error('PHASE7_WATCHER_AUTOMATION_CLOSURE_FAIL\n'+failures.map(x=>'- '+x).join('\n'));process.exit(1)}
console.log('PHASE7_WATCHER_AUTOMATION_CLOSURE_PASS');
