import assert from 'node:assert/strict';

function backup(meta){assert(meta?.exact_sha,'EXACT_SHA_REQUIRED');assert(meta.tenant_id,'TENANT_REQUIRED');assert(meta.artifact_hash,'ARTIFACT_HASH_REQUIRED');return {...meta,status:'VERIFIED'};}
function restore(plan){assert(plan.backup_id,'BACKUP_REQUIRED');assert(plan.target,'TARGET_REQUIRED');assert(plan.mode==='NON_DESTRUCTIVE','NON_DESTRUCTIVE_REQUIRED');return {...plan,status:'READY'};}
function rollback(plan){assert(plan.deployment_id,'DEPLOYMENT_REQUIRED');assert(plan.target_sha,'TARGET_SHA_REQUIRED');assert(plan.approval_id,'APPROVAL_REQUIRED');return {...plan,status:'READY'};}
assert.equal(backup({exact_sha:'sha',tenant_id:'tenant-a',artifact_hash:'hash'}).status,'VERIFIED');
assert.equal(restore({backup_id:'b1',target:'staging',mode:'NON_DESTRUCTIVE'}).status,'READY');
assert.equal(rollback({deployment_id:'d1',target_sha:'sha',approval_id:'a1'}).status,'READY');
assert.throws(()=>backup({tenant_id:'tenant-a',artifact_hash:'h'}),/EXACT_SHA_REQUIRED/);
assert.throws(()=>restore({backup_id:'b1',target:'staging',mode:'DESTRUCTIVE'}),/NON_DESTRUCTIVE_REQUIRED/);
assert.throws(()=>rollback({deployment_id:'d1',target_sha:'sha'}),/APPROVAL_REQUIRED/);
console.log('dr recovery contract: PASS');