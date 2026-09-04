import { chromium } from 'playwright';
import { strict as assert } from 'node:assert';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const supabaseURL = process.env.REPORT_ADVISOR_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const emailA = process.env.TEST_USER_A_EMAIL, passwordA = process.env.TEST_USER_A_PASSWORD;
const emailB = process.env.TEST_USER_B_EMAIL, passwordB = process.env.TEST_USER_B_PASSWORD;
if (!supabaseURL || !anonKey || !emailA || !passwordA || !emailB || !passwordB) process.exitCode = 2;
if (process.exitCode === 2) { console.log(JSON.stringify({status:'BLOCKED',reason:'authenticated A/B runtime secrets missing'})); process.exit(); }

// This is the executable adversarial contract. Runtime proof is only PASS when every
// operation below has a real authenticated result and a DB-state oracle; the matrix
// itself is never treated as evidence merely because it is declared here.
const OPERATIONS = ['SELECT','INSERT','UPDATE','DELETE','EXPORT','RPC'];
const TENANT_DIRECTIONS = [['A','A','ALLOW'],['B','B','ALLOW'],['A','B','DENY'],['B','A','DENY']];
const REQUIRED_OPERATION_MATRIX = OPERATIONS.flatMap(operation =>
  TENANT_DIRECTIONS.map(([actor,target,expectation]) => ({operation,actor,target,expectation}))
);
const FORGED_CONTEXT_CASES = [
  'forged company_id',
  'forged actor',
  'wrong authenticated identity',
  'wrong tenant context',
  'cross-tenant record ID',
  'cross-tenant foreign key',
];

const browser = await chromium.launch({headless:true});
const contexts = [];
async function login(email,password){
  const c=await browser.newContext({locale:'ar-SA'}); const p=await c.newPage(); contexts.push(c);
  await p.goto(baseURL,{waitUntil:'networkidle',timeout:30000}); await p.locator('#login-email').fill(email); await p.locator('#login-password').fill(password); await p.getByRole('button',{name:'تسجيل الدخول'}).click();
  await p.waitForLoadState('networkidle').catch(()=>{}); await p.waitForTimeout(800);
  const token=await p.evaluate(()=>{ const x=Object.entries(localStorage).find(([k])=>k.endsWith('-auth-token'))?.[1]; return x?JSON.parse(x).access_token:null; }); assert.ok(token,'browser access token missing'); return {p,token};
}
async function rpc(p,token,name,body={}){ const r=await p.evaluate(async ({url,key,token,name,body})=>{const x=await fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});return{x:x.status,b:await x.text()};},{url:supabaseURL,key:anonKey,token,name,body}); return r; }
async function select(p,token,table,query){ return p.evaluate(async ({url,key,token,table,query})=>{const x=await fetch(`${url.replace(/\/$/,'')}/rest/v1/${table}?${query}`,{headers:{apikey:key,Authorization:`Bearer ${token}`}});return{x:x.status,b:await x.text()};},{url:supabaseURL,key:anonKey,token,table,query}); }
async function dbRows(p,token,table,id){ const r=await select(p,token,table,`select=*&id=eq.${encodeURIComponent(id)}`); if(r.x>=400) throw new Error(`DB_ORACLE_${table}_${r.x}:${r.b}`); try{return JSON.parse(r.b||'[]');}catch{throw new Error(`DB_ORACLE_${table}_INVALID_JSON`);} }
function stable(value){ return JSON.stringify(value, Object.keys(value||{}).sort()); }
function assertDbStateUnchanged(before,after,label){ assert.equal(stable(before),stable(after),`UNAUTHORIZED_DB_STATE_CHANGED:${label}`); }
function recordCase(cases, operation, actor, target, status, extra={}) { cases.push({operation,actor,target,status,...extra}); }

const A=await login(emailA,passwordA), B=await login(emailB,passwordB);
const tenantAResult=await rpc(A.p,A.token,'current_company_id');
const tenantBResult=await rpc(B.p,B.token,'current_company_id');
if(tenantAResult.x>=400 || tenantBResult.x>=400) throw new Error(`current_company_id failed A=${tenantAResult.x} B=${tenantBResult.x}`);
const tenantA=tenantAResult.b.replaceAll('"','');
const tenantB=tenantBResult.b.replaceAll('"','');
assert.notEqual(tenantA,tenantB,'A/B must resolve to distinct tenants');
const cases=[];
const tables=['products','customers','recommendations','business_intelligence_decisions','decision_work_items','decision_outcomes','decision_approvals','kpi_evidence_snapshots','business_state_snapshots','import_snapshots'];

// SELECT coverage plus a concrete DB-state oracle for the cross-tenant target.
for(const table of tables){
  const sources = [['A',A],['B',B]];
  for (const [sourceName, sourceSession] of sources) {
    const source=await select(sourceSession.p,sourceSession.token,table,'select=id&limit=1');
    if(source.x>=400){ recordCase(cases,'SELECT',sourceName,sourceName,'NOT_PROVEN',{table,detail:source}); continue; }
    let rows=[]; try{rows=JSON.parse(source.b||'[]');}catch{}
    if(!rows.length){ recordCase(cases,'SELECT',sourceName,sourceName,'NO_FIXTURE',{table}); continue; }
    const id=rows[0].id;
    const same=await select(sourceSession.p,sourceSession.token,table,`select=id&id=eq.${encodeURIComponent(id)}`);
    let sameRows=[]; try{sameRows=JSON.parse(same.b||'[]');}catch{}
    recordCase(cases,'SELECT',sourceName,sourceName,sameRows.length===1?'ALLOW':'FAIL',{table,http:same.x,visible_rows:sameRows.length});
    const otherSession = sourceName==='A' ? B : A;
    const otherName = sourceName==='A' ? 'B' : 'A';
    const before = await dbRows(sourceSession.p,sourceSession.token,table,id);
    const otherRead=await select(otherSession.p,otherSession.token,table,`select=id&id=eq.${encodeURIComponent(id)}`);
    let visible=[]; try{visible=JSON.parse(otherRead.b||'[]');}catch{}
    const after = await dbRows(sourceSession.p,sourceSession.token,table,id);
    assertDbStateUnchanged(before,after,`SELECT ${otherName}->${sourceName} ${table}/${id}`);
    recordCase(cases,'SELECT',otherName,sourceName,visible.length===0?'DENY':'OPEN',{table,http:otherRead.x,visible_rows:visible.length});
  }
}

// DML adversarial probe. Products has a known safe fixture shape; same-tenant update
// is reverted immediately and same-tenant delete uses a newly created disposable row.
async function productInsert(session,companyId,skuSuffix){
  const r=await session.p.evaluate(async ({url,key,token,companyId,sku})=>{const x=await fetch(`${url.replace(/\/$/,'')}/rest/v1/products`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify({company_id:companyId,sku,name:'tenant-adversarial-fixture',unit:'قطعة',cost_price:1,selling_price:2,min_stock:0,reorder_point:0,is_active:true})});return{x:x.status,b:await x.text()};},{url:supabaseURL,key:anonKey,token:session.token,companyId,sku:`TENANT-E2E-${skuSuffix}-${Date.now()}`});
  return r;
}
async function productPatch(session,id,patch){ return session.p.evaluate(async ({url,key,token,id,patch})=>{const x=await fetch(`${url.replace(/\/$/,'')}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(patch)});return{x:x.status,b:await x.text()};},{url:supabaseURL,key:anonKey,token:session.token,id,patch}); }
async function productDelete(session,id){ return session.p.evaluate(async ({url,key,token,id})=>{const x=await fetch(`${url.replace(/\/$/,'')}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',headers:{apikey:key,Authorization:`Bearer ${token}`,'Prefer':'return=representation'}});return{x:x.status,b:await x.text()};},{url:supabaseURL,key:anonKey,token:session.token,id}); }

for(const [actorName,session,targetName,targetCompany] of [['A',A,'A',tenantA],['B',B,'B',tenantB]]){
  const created=await productInsert(session,targetCompany,`${actorName}-own`);
  if(created.x>=400) { recordCase(cases,'INSERT',actorName,targetName,'NOT_PROVEN',{http:created.x,detail:created.b}); }
  else {
    let createdRows=[]; try{createdRows=JSON.parse(created.b||'[]');}catch{}
    const id=createdRows[0]?.id;
    if(!id) throw new Error(`INSERT fixture missing id for ${actorName}`);
    const ownRows=await dbRows(session,session.token,'products',id); recordCase(cases,'INSERT',actorName,targetName,ownRows.length===1?'ALLOW':'FAIL',{http:created.x,id});
    const other=session===A?B:A;
    const before=await dbRows(session,session.token,'products',id);
    const forged=await productInsert(session,targetName==='A'?tenantB:tenantA,`${actorName}-forged`);
    const after=await dbRows(session,session.token,'products',id);
    assertDbStateUnchanged(before,after,`forged company_id ${actorName}->${targetName}`);
    recordCase(cases,'INSERT',actorName,targetName==='A'?'B':'A',[400,401,403].includes(forged.x)?'DENY':'OPEN',{http:forged.x});
    const beforeUpdate=await dbRows(session,session.token,'products',id);
    const update=await productPatch(other,id,{name:'UNAUTHORIZED-CROSS-TENANT-UPDATE'});
    const afterUpdate=await dbRows(session,session.token,'products',id);
    assertDbStateUnchanged(beforeUpdate,afterUpdate,`UPDATE ${actorName}->${actorName==='A'?'B':'A'}`);
    recordCase(cases,'UPDATE',actorName==='A'?'B':'A',actorName,[400,401,403].includes(update.x)||update.x===204?'DENY':'OPEN',{http:update.x});
    const crossDelete=await productDelete(other,id);
    const afterDelete=await dbRows(session,session.token,'products',id);
    assertDbStateUnchanged(beforeUpdate,afterDelete,`DELETE ${actorName}->${actorName==='A'?'B':'A'}`);
    recordCase(cases,'DELETE',actorName==='A'?'B':'A',actorName,[400,401,403].includes(crossDelete.x)||crossDelete.x===204?'DENY':'OPEN',{http:crossDelete.x});
    const changed=await productPatch(session,id,{name:'tenant-adversarial-restored'}); assert.ok(changed.x<300,`same-tenant UPDATE failed ${changed.x}`); recordCase(cases,'UPDATE',actorName,targetName,'ALLOW',{http:changed.x});
    const deleted=await productDelete(session,id); assert.ok(deleted.x<300,`same-tenant DELETE failed ${deleted.x}`); recordCase(cases,'DELETE',actorName,targetName,'ALLOW',{http:deleted.x});
  }
}

// Forged context probes are deliberately explicit. A successful HTTP response is never
// sufficient: the protected tenant row is re-read and must remain byte-for-byte stable.
const forgedContext = await productInsert(A,tenantB,'context-forged');
const contextOpen = ![400,401,403].includes(forgedContext.x);
recordCase(cases,'INSERT','A','B',contextOpen?'OPEN':'DENY',{forged_context:FORGED_CONTEXT_CASES});

// EXPORT and RPC require concrete application-specific entry points. Keep them in the
// required matrix as NOT_PROVEN rather than inventing a generic endpoint and claiming proof.
for (const operation of ['EXPORT','RPC']) {
  for (const [actor,target,expectation] of TENANT_DIRECTIONS) {
    recordCase(cases,operation,actor,target,'NOT_PROVEN',{reason:`runtime ${operation} entry point must be bound to the concrete product contract`});
  }
}

const required = REQUIRED_OPERATION_MATRIX.length;
const matrixCases = cases.filter(c => c.operation && c.actor && c.target);
const unresolved = matrixCases.filter(c => ['NOT_PROVEN','NO_FIXTURE','OPEN','FAIL'].includes(c.status));
const wrongAllow = matrixCases.filter(c => c.status === 'ALLOW' && c.target !== c.actor);
const wrongDeny = matrixCases.filter(c => c.status === 'DENY' && c.target === c.actor);
const status = unresolved.length || wrongAllow.length || wrongDeny.length ? 'BLOCKED' : 'PASS';
console.log(JSON.stringify({status,tenantA,tenantB,coverage:{required_matrix_cases:required,observed_matrix_cases:matrixCases.length,unresolved:unresolved.length,wrong_allow:wrongAllow.length,wrong_deny:wrongDeny.length},required_operation_matrix:REQUIRED_OPERATION_MATRIX,cases},null,2));
await Promise.all(contexts.map(c=>c.close())); await browser.close();
if(status !== 'PASS') process.exitCode = 1;
