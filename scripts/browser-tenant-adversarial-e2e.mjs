import { chromium } from 'playwright';
import { strict as assert } from 'node:assert';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const supabaseURL = process.env.REPORT_ADVISOR_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const emailA = process.env.TEST_USER_A_EMAIL, passwordA = process.env.TEST_USER_A_PASSWORD;
const emailB = process.env.TEST_USER_B_EMAIL, passwordB = process.env.TEST_USER_B_PASSWORD;
if (!supabaseURL || !anonKey || !emailA || !passwordA || !emailB || !passwordB) process.exitCode = 2;
if (process.exitCode === 2) { console.log(JSON.stringify({status:'BLOCKED',reason:'authenticated A/B runtime secrets missing'})); process.exit(); }

const browser = await chromium.launch({headless:true});
const contexts = [];
async function login(email,password){
  const c=await browser.newContext({locale:'ar-SA'}); const p=await c.newPage(); contexts.push(c);
  await p.goto(baseURL,{waitUntil:'networkidle',timeout:30000}); await p.locator('#login-email').fill(email); await p.locator('#login-password').fill(password); await p.getByRole('button',{name:'تسجيل الدخول'}).click();
  await p.waitForLoadState('networkidle').catch(()=>{}); await p.waitForTimeout(800);
  const token=await p.evaluate(()=>{ const x=Object.entries(localStorage).find(([k])=>k.endsWith('-auth-token'))?.[1]; return x?JSON.parse(x).access_token:null; }); assert.ok(token,'browser access token missing'); return {p,token};
}
async function rpc(p,token,name){ const r=await p.evaluate(async ({url,key,token,name})=>{const x=await fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:'{}'});return{x:x.status,b:await x.text()};},{url:supabaseURL,key:anonKey,token,name}); if(r.x>=400) throw new Error(`RPC_${name}_${r.x}:${r.b}`); return r.b.replaceAll('"',''); }
async function select(p,token,table,query){ return p.evaluate(async ({url,key,token,table,query})=>{const x=await fetch(`${url.replace(/\/$/,'')}/rest/v1/${table}?${query}`,{headers:{apikey:key,Authorization:`Bearer ${token}`}});return{x:x.status,b:await x.text()};},{url:supabaseURL,key:anonKey,token,table,query}); }
const A=await login(emailA,passwordA), B=await login(emailB,passwordB);
const tenantA=await rpc(A.p,A.token,'current_company_id'), tenantB=await rpc(B.p,B.token,'current_company_id'); assert.notEqual(tenantA,tenantB,'A/B must resolve to distinct tenants');
const tables=['products','customers','recommendations','business_intelligence_decisions','decision_work_items','decision_outcomes','decision_approvals','kpi_evidence_snapshots','business_state_snapshots','import_snapshots'];
const cases=[];
for(const table of tables){
  const sources = [['A',A],['B',B]];
  for (const [sourceName, sourceSession] of sources) {
    const source=await select(sourceSession.p,sourceSession.token,table,'select=id&limit=1');
    if(source.x>=400){ cases.push({table,case:`${sourceName} source lookup`,status:'NOT_PROVEN',detail:source}); continue; }
    let rows=[]; try{rows=JSON.parse(source.b||'[]');}catch{}
    if(!rows.length){ cases.push({table,case:`${sourceName} source lookup`,status:'NO_FIXTURE'}); continue; }
    const id=rows[0].id;
    const same=await select(sourceSession.p,sourceSession.token,table,`select=id&id=eq.${encodeURIComponent(id)}`);
    let sameRows=[]; try{sameRows=JSON.parse(same.b||'[]');}catch{}
    cases.push({table,case:`${sourceName} reads own record by ID`,status:sameRows.length===1?'ALLOW':'FAIL',http:same.x,visible_rows:sameRows.length});
    const otherSession = sourceName==='A' ? B : A;
    const otherName = sourceName==='A' ? 'B' : 'A';
    const otherRead=await select(otherSession.p,otherSession.token,table,`select=id&id=eq.${encodeURIComponent(id)}`);
    let visible=[]; try{visible=JSON.parse(otherRead.b||'[]');}catch{}
    cases.push({table,case:`${otherName} reads ${sourceName} record by ID`,status:visible.length===0?'REJECTED':'OPEN',http:otherRead.x,visible_rows:visible.length});
  }
}
const forged=await A.p.evaluate(async ({url,key,token,tenant})=>{const x=await fetch(`${url.replace(/\/$/,'')}/rest/v1/products`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({company_id:tenant,sku:`FORGED-${Date.now()}`,name:'forged browser tenant product',unit:'قطعة',cost_price:1,selling_price:2,min_stock:0,reorder_point:0,is_active:true})});return{x:x.status,b:await x.text()};},{url:supabaseURL,key:anonKey,token:A.token,tenant:tenantB});
cases.push({table:'products',case:'A forged company_id=B insert',status:[400,401,403].includes(forged.x)?'REJECTED':'OPEN',http:forged.x});
const incomplete = cases.filter(x => ['NO_FIXTURE','NOT_PROVEN'].includes(x.status));
const open = cases.filter(x => x.status === 'OPEN');
const failed = cases.filter(x => x.status === 'FAIL');
const rejected = cases.filter(x => x.status === 'REJECTED');
const allowed = cases.filter(x => x.status === 'ALLOW');
const requiredCrossTenantCases = tables.length * 2;
const requiredSameTenantCases = tables.length * 2;
const status = open.length || failed.length ? 'FAIL' : incomplete.length ? 'BLOCKED' : rejected.length !== requiredCrossTenantCases + 1 || allowed.length !== requiredSameTenantCases ? 'BLOCKED' : 'PASS';
console.log(JSON.stringify({status,tenantA,tenantB,coverage:{total:cases.length,required:requiredCrossTenantCases+requiredSameTenantCases+1,rejected:rejected.length,allowed:allowed.length,incomplete:incomplete.length,open:open.length,failed:failed.length},cases},null,2));
await Promise.all(contexts.map(c=>c.close())); await browser.close();
if(status !== 'PASS') process.exitCode = 1;
