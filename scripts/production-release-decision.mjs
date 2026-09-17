import fs from 'node:fs';
import { scenarios } from './production-scenario-matrix.mjs';

const EXPECTED_IDS=new Set(scenarios.map(({id})=>id));
const EXPECTED_SCENARIO_COUNT=scenarios.length;
const TERMINAL_STATUSES=new Set(['committed_and_rendered','reviewed','rejected_or_reviewed']);
const SHA_RE=/^[0-9a-f]{40}$/i;
const NONEMPTY_OBJECT=value=>value && typeof value==='object' && !Array.isArray(value) && Object.keys(value).length>0;
const NONEMPTY_ARRAY=value=>Array.isArray(value) && value.length>0;

export function evaluateRelease(raw,{currentExactHead}={}){
  const results=Array.isArray(raw?.results)?raw.results:Object.values(raw ?? {});
  const failures=[];
  const suppliedHead=String(raw?.exact_head??'').trim().toLowerCase();
  const actualHead=String(currentExactHead??'').trim().toLowerCase();
  if(!SHA_RE.test(actualHead)) failures.push({id:'__artifact__',reason:'missing-or-invalid-current-exact-head'});
  if(!SHA_RE.test(suppliedHead)) failures.push({id:'__artifact__',reason:'missing-or-invalid-artifact-exact-head'});
  if(SHA_RE.test(actualHead)&&SHA_RE.test(suppliedHead)&&suppliedHead!==actualHead) failures.push({id:'__artifact__',reason:`artifact-exact-head-mismatch:${suppliedHead}`});
  const seen=new Set();
  for(const result of results){
    const id=result?.scenario_id;
    if(!EXPECTED_IDS.has(id)){failures.push({id:id??'unknown',reason:'unknown-scenario'});continue;}
    if(seen.has(id)){failures.push({id,reason:'duplicate-scenario-id'});continue;}
    seen.add(id);
    if(!TERMINAL_STATUSES.has(result?.actual_status)||result?.actual_status==='failed') failures.push({id,reason:`non-terminal:${result?.actual_status??'missing'}`});
    const exactHead=String(result?.exact_head??'').trim().toLowerCase();
    if(!SHA_RE.test(exactHead)) failures.push({id,reason:'missing-or-invalid-exact-head'});
    else if(SHA_RE.test(actualHead)&&exactHead!==actualHead) failures.push({id,reason:`exact-head-mismatch:${exactHead}`});
    if(!String(result?.tenant??'').trim()) failures.push({id,reason:'missing-tenant'});
    if(!result?.execution_start||!result?.execution_end) failures.push({id,reason:'missing-runtime-window'});
    if(!NONEMPTY_OBJECT(result?.before_state)||!NONEMPTY_OBJECT(result?.after_state)) failures.push({id,reason:'missing-db-before-after'});
    if(!String(result?.job_id??'').trim()) failures.push({id,reason:'missing-job-id'});
    if(!NONEMPTY_ARRAY(result?.evidence_references)) failures.push({id,reason:'missing-evidence-references'});
  }
  if(results.length!==EXPECTED_SCENARIO_COUNT) failures.push({id:'__artifact__',reason:`scenario-count:${results.length}/${EXPECTED_SCENARIO_COUNT}`});
  for(const id of EXPECTED_IDS) if(!seen.has(id)) failures.push({id,reason:'missing-result'});
  return {release:failures.length===0?'approved':'blocked',failures,scenarioCount:EXPECTED_SCENARIO_COUNT,observedScenarioCount:results.length,exact_head:actualHead||null};
}

if(process.argv[1]?.endsWith('production-release-decision.mjs')){
  const inputPath=process.argv[2] ?? 'release-evidence/production-regression-results.json';
  if(!fs.existsSync(inputPath)){
    console.error(`BLOCKED: production regression evidence missing: ${inputPath}`);
    process.exit(2);
  }
  const raw=JSON.parse(fs.readFileSync(inputPath,'utf8'));
  const currentExactHead=process.env.CERTIFICATION_EXACT_HEAD?.trim()||process.env.GITHUB_SHA?.trim()||null;
  let resolvedHead=currentExactHead;
  if(!resolvedHead){
    const {execFileSync}=await import('node:child_process');
    resolvedHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  }
  const decision=evaluateRelease(raw,{currentExactHead:resolvedHead});
  fs.mkdirSync('release-evidence',{recursive:true});
  fs.writeFileSync('release-evidence/certification-decision.json',JSON.stringify(decision,null,2)+'\n');
  console.log(JSON.stringify(decision,null,2));
  if(decision.release!=='approved') process.exit(1);
}
