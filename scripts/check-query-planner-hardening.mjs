import assert from 'node:assert/strict';
import { planQuery } from '../src/lib/free-toolbox/queryPlanner.ts';
const a=planQuery({table:'orders',columns:['id','net_total','company_id'],companyId:'c1',filters:{status:'paid',evil:'ignored'},limit:999999});
const b=planQuery({table:'orders',columns:['company_id','net_total','id'],companyId:'c1',filters:{evil:'ignored',status:'paid'},limit:999999});
assert.equal(a.limit,5000);
assert.deepEqual(a.filters,{company_id:'c1',status:'paid'});
assert.equal(a.fingerprint,b.fingerprint);
assert.throws(()=>planQuery({table:'orders',columns:['id'],companyId:'c1',filters:{__sql:'x'}}));
console.log('query planner hardening: PASS');
