import fs from 'node:fs';
import path from 'node:path';
import {baseline,compareScenarioResult} from './production-regression-baseline.mjs';

export function evaluateRelease(results){
  const failures=[];
  for(const id of Object.keys(baseline)){
    const result=results?.[id];
    if(!result){
      failures.push({id,reason:'missing-result'});
      continue;
    }
    const check=compareScenarioResult(id,result);
    if(!check.ok) failures.push({id,reason:'regression'});
  }
  return{
    release:failures.length===0?'approved':'blocked',
    failures,
    scenarioCount:Object.keys(baseline).length
  };
}

if(process.argv[1]?.endsWith('production-release-decision.mjs')){
  const inputPath=process.argv[2] ?? path.join(process.cwd(),'release-evidence','production-regression-results.json');
  if(!fs.existsSync(inputPath)) throw new Error(`Production regression evidence is required: ${inputPath}`);
  const results=JSON.parse(fs.readFileSync(inputPath,'utf8'));
  if(!results || typeof results!=='object' || Array.isArray(results)) throw new Error('Production regression evidence must be a JSON object');
  const decision=evaluateRelease(results);
  process.stdout.write(JSON.stringify(decision)+'\n');
  if(decision.release!=='approved') process.exitCode=1;
}
