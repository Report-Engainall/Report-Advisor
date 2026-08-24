#!/usr/bin/env node
/** Phase F live resilience probes. Fail-closed; no synthetic PASS. */
const required = ['RESILIENCE_TARGET_ENV','RESILIENCE_HEALTH_URL','RESILIENCE_CANARY_URL','RESILIENCE_BACKUP_VERIFY_URL','RESILIENCE_ROLLBACK_DRILL_URL'];
const missing = required.filter(k => !process.env[k]?.trim());
if (missing.length) { console.error('FAIL-CLOSED: missing Phase F live configuration:'); missing.forEach(k => console.error(`- ${k}`)); process.exit(2); }
const target = process.env.RESILIENCE_TARGET_ENV.trim();
if (/^(prod|production)$/i.test(target) && process.env.RESILIENCE_ALLOW_PRODUCTION !== 'true') { console.error('FAIL-CLOSED: production requires explicit RESILIENCE_ALLOW_PRODUCTION=true'); process.exit(3); }
const checks=[];
async function probe(name,url,options={}) { try { const r=await fetch(url,{...options,headers:{Accept:'application/json',...(options.headers||{})}}); const body=await r.text(); const pass=r.ok; checks.push({name,pass,status:r.status}); console.log(`${pass?'PASS':'FAIL'} ${name}: HTTP ${r.status}`); if(!pass) console.error(body.slice(0,500)); } catch(e){ checks.push({name,pass:false,error:String(e)}); console.error(`FAIL ${name}: ${e}`); } }
await probe('operational-health',process.env.RESILIENCE_HEALTH_URL);
await probe('tenant-canary',process.env.RESILIENCE_CANARY_URL);
await probe('backup-restore-verification',process.env.RESILIENCE_BACKUP_VERIFY_URL,{method:'POST'});
await probe('rollback-forward-fix-drill',process.env.RESILIENCE_ROLLBACK_DRILL_URL,{method:'POST'});
const failed=checks.filter(c=>!c.pass);
console.log(`Phase F live result: ${checks.length-failed.length}/${checks.length} passed.`);
if(failed.length){console.error('FAIL-CLOSED: Phase F live resilience is not certified.'); process.exit(10);}
console.log('PASS: Phase F live resilience probes completed.');
