import fs from 'node:fs';
import path from 'node:path';
import {baseline,compareScenarioResult} from './production-regression-baseline.mjs';

export function evaluateRelease(results, expectedHead){
  const failures=[];
  if(!expectedHead || !/^[0-9a-f]{40}$/i.test(expectedHead)) failures.push({id:'release-identity',reason:'exact-head-required'});
  if(!results?.metadata || results.metadata.exactHead!==expectedHead) failures.push({id:'release-identity',reason:'evidence-head-mismatch'});
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
    scenarioCount:Object.keys(baseline).length,
    exactHead:expectedHead
  };
}

if(process.argv[1]?.endsWith('production-release-decision.mjs')){
  const inputPath=process.argv[2] ?? path.join(process.cwd(),'release-evidence','production-regression-results.json');
  const expectedHead=process.argv[3] ?? process.env.RELEASE_EXACT_HEAD ?? process.env.GITHUB_SHA;
  if(!fs.existsSync(inputPath)) throw new Error(`Production regression evidence is required: ${inputPath}`);
  if(!expectedHead) throw new Error('Exact release HEAD is required');
  const results=JSON.parse(fs.readFileSync(inputPath,'utf8'));
  if(!results || typeof results!=='object' || Array.isArray(results)) throw new Error('Production regression evidence must be a JSON object');
  const decision=evaluateRelease(results,expectedHead);
  process.stdout.write(JSON.stringify(decision)+'\n');
  if(decision.release!=='approved') process.exitCode=1;
}
