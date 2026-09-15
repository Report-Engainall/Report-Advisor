import { strict as assert } from 'node:assert';
import { baseline } from './production-regression-baseline.mjs';
import { evaluateRelease } from './production-release-decision.mjs';

const HEAD='1851ba810964f89066020567258c1f47b56fabab';
const TENANT='tenant-a';
const results=Object.keys(baseline).map((id,index)=>({
  scenario_id:id,
  exact_head:HEAD,
  tenant:TENANT,
  job_id:`job-${index+1}`,
  execution_start:'2026-09-15T10:00:00.000Z',
  execution_end:'2026-09-15T10:01:00.000Z',
  actual_status:'committed_and_rendered',
  before_state:{imports:0},
  after_state:{imports:1},
  evidence_references:[`evidence:${id}`],
}));

const good={exact_head:HEAD,results};
assert.equal(evaluateRelease(good,{currentExactHead:HEAD}).release,'approved');

const wrongSha={...good,results:results.map(r=>({...r,exact_head:'ddf3aadd6735e703ea73c253245de8d57068b4c3'}))};
const wrongResult=evaluateRelease(wrongSha,{currentExactHead:HEAD});
assert.equal(wrongResult.release,'blocked');
assert.ok(wrongResult.failures.some(f=>String(f.reason).startsWith('exact-head-mismatch:')));

const wrongArtifactHead={...good,exact_head:'ddf3aadd6735e703ea73c253245de8d57068b4c3'};
const wrongArtifactResult=evaluateRelease(wrongArtifactHead,{currentExactHead:HEAD});
assert.equal(wrongArtifactResult.release,'blocked');
assert.ok(wrongArtifactResult.failures.some(f=>String(f.reason).startsWith('artifact-exact-head-mismatch:')));

const missingEvidence={...good,results:results.map((r,i)=>i===0?{...r,evidence_references:[]}:r)};
assert.equal(evaluateRelease(missingEvidence,{currentExactHead:HEAD}).release,'blocked');

const duplicateScenario={...good,results:[...results,{...results[0],job_id:'job-duplicate'}]};
assert.equal(evaluateRelease(duplicateScenario,{currentExactHead:HEAD}).release,'blocked');

console.log('Production release exact-SHA tests PASS: correct candidate accepted; stale scenario SHA, stale artifact SHA, missing evidence, and duplicate scenario identity rejected.');
