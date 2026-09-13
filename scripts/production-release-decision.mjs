import fs from 'node:fs';
import {baseline,compareScenarioResult} from './production-regression-baseline.mjs';

export function evaluateRelease(results){
  const failures=[];
  for(const id of Object.keys(baseline)){
    const result=results?.[id];
    if(!result){failures.push({id,reason:'missing-result'});continue;}
    const check=compareScenarioResult(id,result);
    if(!check.ok)failures.push({id,reason:'regression'});
  }
  return {
    release:failures.length===0?'approved':'blocked',
    failures,
    scenarioCount:Object.keys(baseline).length,
    observedScenarioCount:Object.keys(results ?? {}).length
  };
}

if(process.argv[1]?.endsWith('production-release-decision.mjs')){
  const inputPath=process.argv[2] ?? 'release-evidence/production-regression-results.json';
  if(!fs.existsSync(inputPath)){
    console.error(`BLOCKED: production regression evidence missing: ${inputPath}`);
    process.exit(2);
  }
  const raw=JSON.parse(fs.readFileSync(inputPath,'utf8'));
  const results=raw?.results ?? raw;
  const decision=evaluateRelease(results);
  fs.mkdirSync('release-evidence',{recursive:true});
  fs.writeFileSync('release-evidence/certification-decision.json',JSON.stringify(decision,null,2)+'\n');
  console.log(JSON.stringify(decision,null,2));
  if(decision.release!=='approved') process.exit(1);
}
