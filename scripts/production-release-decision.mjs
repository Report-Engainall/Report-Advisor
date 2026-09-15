import fs from 'node:fs';

export function evaluateRelease(raw){
  const results=Array.isArray(raw?.results)?raw.results:Object.values(raw ?? {});
  const failures=[];
  const expectedIds=new Set(['excel-standard','excel-aliases','excel-missing-columns','csv-reordered','pdf-text','pdf-ocr-ar','unknown-report','exchange-statement','multi-currency','duplicate-transactions','large-file','corrupt-data']);
  if(results.length!==expectedIds.size) failures.push({id:'__artifact__',reason:`scenario-count:${results.length}/${expectedIds.size}`});
  const seen=new Set();
  for(const result of results){
    const id=result?.scenario_id;
    if(!expectedIds.has(id)){failures.push({id:id??'unknown',reason:'unknown-scenario'});continue;}
    seen.add(id);
    if(result?.actual_status==='failed'||!['committed_and_rendered','reviewed','rejected_or_reviewed'].includes(result?.actual_status)) failures.push({id,reason:`non-terminal:${result?.actual_status??'missing'}`});
    if(result?.exact_head==null||result.exact_head==='UNKNOWN') failures.push({id,reason:'missing-exact-head'});
    if(!result?.tenant) failures.push({id,reason:'missing-tenant'});
    if(!result?.execution_start||!result?.execution_end) failures.push({id,reason:'missing-runtime-window'});
    if(!result?.before_state||!result?.after_state) failures.push({id,reason:'missing-db-before-after'});
  }
  for(const id of expectedIds) if(!seen.has(id)) failures.push({id,reason:'missing-result'});
  return {release:failures.length===0?'approved':'blocked',failures,scenarioCount:expectedIds.size,observedScenarioCount:results.length};
}

if(process.argv[1]?.endsWith('production-release-decision.mjs')){
  const inputPath=process.argv[2] ?? 'release-evidence/production-regression-results.json';
  if(!fs.existsSync(inputPath)){
    console.error(`BLOCKED: production regression evidence missing: ${inputPath}`);
    process.exit(2);
  }
  const raw=JSON.parse(fs.readFileSync(inputPath,'utf8'));
  const decision=evaluateRelease(raw);
  fs.mkdirSync('release-evidence',{recursive:true});
  fs.writeFileSync('release-evidence/certification-decision.json',JSON.stringify(decision,null,2)+'\n');
  console.log(JSON.stringify(decision,null,2));
  if(decision.release!=='approved') process.exit(1);
}
