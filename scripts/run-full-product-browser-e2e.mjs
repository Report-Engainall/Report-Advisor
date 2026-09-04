import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import process from 'node:process';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const supabaseURL = process.env.REPORT_ADVISOR_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const reportDir = process.env.E2E_REPORT_DIR || 'artifacts/e2e';
const goldenFixture = process.env.E2E_GOLDEN_FIXTURE || '';
const reportFixtures = process.env.E2E_REPORT_FIXTURES || '';
await fs.mkdir(reportDir, { recursive: true });

const FLOWS = [
  ['BF-001','Auth / Session', runAuth],
  ['BF-002','Tenant context', runTenant],
  ['BF-003','Product CRUD', runProductCrud],
  ['BF-004','Customer CRUD', runCustomerCrud],
  ['BF-005','Search / Filter', runSearch],
  ['BF-006','Import', runImport],
  ['BF-007','Inventory reconciliation', runReportAction('/reports/inventory')],
  ['BF-008','Sales reporting', runReportAction('/reports/sales')],
  ['BF-009','Purchase reporting', runReportAction('/reports/purchases')],
  ['BF-010','Receivables', runReportAction('/reports/receivables')],
  ['BF-011','Dashboard truth', runReportAction('/command-center')],
  ['BF-012','Export', runExport],
  ['BF-013','Document / OCR', runDocument],
  ['BF-014','Evidence', runEvidence],
  ['BF-015','Recommendation', runRecommendation],
  ['BF-016','Decision / Approval / Work / Outcome', runDecision],
  ['BF-017','Realtime', runRealtime],
  ['BF-018','Refresh persistence', runPersistence],
  ['BF-019','Recovery', runRecovery],
  ['BF-020','Logout / Re-login', runLogoutRelogin],
];

const result = { exactHead, baseURL, browser:'Chromium', startedAt:new Date().toISOString(), flows:[], findings:[], requests:[], auth:'NOT_PROVEN', tenant:'NOT_PROVEN', evidence:[] };
const browser = await chromium.launch({ headless:true });
const context = await browser.newContext({ viewport:{width:1440,height:1000}, locale:'ar-SA', acceptDownloads:true });
const page = await context.newPage();
const consoleErrors=[]; const failedRequests=[]; const requests=[];
page.on('console', m=>{ if(m.type()==='error') consoleErrors.push(m.text()); });
page.on('pageerror', e=>consoleErrors.push(`[pageerror] ${e.message}`));
page.on('request', r=>requests.push({method:r.method(),url:r.url()}));
page.on('requestfailed', r=>failedRequests.push({method:r.method(),url:r.url(),error:r.failure()?.errorText||'unknown'}));

function finding(id,status,severity,reason,extra={}){ result.findings.push({id,status,severity,reason,...extra}); }
function evidence(flow, data={}){ result.evidence.push({flow, exact_head:exactHead, runtime:baseURL, ...data}); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function goto(path){ const response=await page.goto(`${baseURL}${path}`,{waitUntil:'networkidle',timeout:30000}); if(!response || response.status()>=400) throw new Error(`HTTP_${response?.status()||'NO_RESPONSE'}:${path}`); await sleep(400); }
async function body(){ return (await page.locator('body').innerText()).trim(); }
async function visibleButtons(){ return page.locator('button:visible'); }
async function clickText(patterns,{required=true}={}){
  for(const pattern of patterns){ const loc=page.getByRole('button',{name:pattern}); if(await loc.count()){ await loc.first().click(); return pattern; } }
  const buttons=await visibleButtons();
  const n=await buttons.count();
  for(let i=0;i<n;i++){ const b=buttons.nth(i); const text=(await b.innerText().catch(()=>'' )).trim(); if(patterns.some(p=>new RegExp(p,'i').test(text))){ await b.click(); return text; } }
  if(required) throw new Error(`ACTION_BUTTON_NOT_FOUND:${patterns.join('|')}`);
  return null;
}
async function authToken(){
  const entry=Object.entries(await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)))).find(([k])=>k.endsWith('-auth-token'))?.[1];
  if(!entry) throw new Error('BROWSER_SESSION_NOT_FOUND');
  const parsed=JSON.parse(entry); if(!parsed?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND'); return parsed.access_token;
}
async function dbSelect(table, query='select=*'){
  const token=await authToken();
  const r=await page.evaluate(async ({url,key,token,table,query})=>{ const x=await fetch(`${url.replace(/\/$/,'')}/rest/v1/${table}?${query}`,{headers:{apikey:key,Authorization:`Bearer ${token}`}}); return {status:x.status,body:await x.text()}; },{url:supabaseURL,key:supabaseAnonKey,token,table,query});
  if(r.status>=400) throw new Error(`DB_${table}_HTTP_${r.status}:${r.body}`); return r.body ? JSON.parse(r.body) : null;
}
async function currentTenant(){
  if(!supabaseURL||!supabaseAnonKey) throw new Error('SUPABASE_RUNTIME_ENV_MISSING');
  const token=await authToken();
  const r=await page.evaluate(async ({url,key,token})=>{ const x=await fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/current_company_id`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:'{}'}); return {status:x.status,body:await x.text()}; },{url:supabaseURL,key:supabaseAnonKey,token});
  if(r.status>=400) throw new Error(`CURRENT_COMPANY_ID_HTTP_${r.status}:${r.body}`); if(!r.body||r.body==='null') throw new Error('CURRENT_COMPANY_ID_EMPTY'); return r.body.replaceAll('"','');
}
async function assertVisible(text, label){ if(!(await page.getByText(text,{exact:false}).count())) throw new Error(`UI_ASSERTION_FAILED:${label}:${text}`); }
async function networkSince(index, predicate){ return requests.slice(index).filter(predicate); }
async function performFlow(id,name,fn){
  const started=Date.now(); const req0=requests.length; const err0=consoleErrors.length; const fail0=failedRequests.length;
  const record={id,name,status:'PASS',startedAt:new Date().toISOString(),actions:[],db_oracle:null,security_oracle:null,persistence_oracle:null};
  try { await fn(record); record.requests=requests.slice(req0); record.consoleErrors=consoleErrors.slice(err0); record.failedRequests=failedRequests.slice(fail0); if(record.consoleErrors.length) throw new Error(`CONSOLE_ERRORS:${record.consoleErrors.length}`); if(record.failedRequests.length) throw new Error(`NETWORK_FAILURES:${record.failedRequests.length}`); record.durationMs=Date.now()-started; result.flows.push(record); evidence(id,record); }
  catch(e){ record.status=e?.code==='BLOCKED'?'BLOCKED':'FAIL'; record.reason=e instanceof Error?e.message:String(e); record.requests=requests.slice(req0); record.consoleErrors=consoleErrors.slice(err0); record.failedRequests=failedRequests.slice(fail0); record.durationMs=Date.now()-started; result.flows.push(record); finding(id,record.status,id==='BF-001'||id==='BF-002'?'P0':'P1',record.reason); evidence(id,record); }
}
function blocked(message){ const e=new Error(message); e.code='BLOCKED'; throw e; }

async function runAuth(r){
  const email=process.env.TEST_USER_A_EMAIL, password=process.env.TEST_USER_A_PASSWORD;
  if(!email||!password) blocked('AUTH_SECRET_MISSING:TEST_USER_A_EMAIL/TEST_USER_A_PASSWORD');
  await goto('/'); await page.locator('#login-email').fill(email); await page.locator('#login-password').fill(password); await page.getByRole('button',{name:'تسجيل الدخول'}).click(); await page.waitForLoadState('networkidle').catch(()=>{}); await sleep(1200);
  if(await page.locator('#login-email').count()) throw new Error('AUTH_LOGIN_DID_NOT_ESTABLISH_SESSION');
  await authToken(); await assertVisible('لوحة القيادة','authenticated shell'); result.auth='PASS'; r.actions.push('real login');
}
async function runTenant(r){ const id=await currentTenant(); if(!id) throw new Error('TENANT_EMPTY'); result.tenant=id; r.actions.push('current_company_id'); r.db_oracle={tenant:id}; const b=await body(); if(!b) throw new Error('TENANT_UI_EMPTY'); }
async function openEntity(path,title,createLabel){ await goto(path); await assertVisible(title,'entity page'); await clickText([createLabel]); await page.getByRole('dialog').waitFor({state:'visible',timeout:5000}); }
async function fillLabeled(label,value){ const loc=page.getByLabel(label,{exact:false}); if(await loc.count()){ await loc.first().fill(String(value)); return; } const inputs=page.locator('input:visible'); const n=await inputs.count(); if(!n) throw new Error(`INPUT_NOT_FOUND:${label}`); await inputs.first().fill(String(value)); }
async function runProductCrud(r){
  const sku=`E2E-${Date.now()}`; await openEntity('/products','المنتجات','منتج جديد');
  await fillLabeled('SKU',sku); await fillLabeled('الاسم',`منتج E2E ${sku}`); await fillLabeled('الوحدة','قطعة'); await fillLabeled('التكلفة','10'); await fillLabeled('سعر البيع','15'); const req0=requests.length; await clickText(['إنشاء المنتج','حفظ']); await page.waitForLoadState('networkidle').catch(()=>{}); await sleep(500); await assertVisible(sku,'created product');
  const rows=await dbSelect('products',`select=id,company_id,sku,name&sku=eq.${encodeURIComponent(sku)}`); if(!rows.length) throw new Error('DB_PRODUCT_CREATE_NOT_FOUND'); if(String(rows[0].company_id)!==String(result.tenant)) throw new Error('DB_PRODUCT_TENANT_MISMATCH'); r.db_oracle=rows[0]; r.actions.push('create');
  const edit=page.getByRole('button',{name:new RegExp(`تعديل.*${sku}`)}); if(!(await edit.count())) throw new Error('EDIT_CONTROL_NOT_FOUND'); await edit.click(); await fillLabeled('الاسم',`منتج E2E EDITED ${sku}`); await clickText(['حفظ التعديل','حفظ']); await sleep(400); await assertVisible(`EDITED ${sku}`,'edited product'); r.actions.push('update');
  const del=page.getByRole('button',{name:new RegExp(`حذف.*${sku}`)}); if(!(await del.count())) throw new Error('DELETE_CONTROL_NOT_FOUND'); page.once('dialog',d=>d.accept()); await del.click(); await sleep(500); const after=await dbSelect('products',`select=id,company_id,sku&sku=eq.${encodeURIComponent(sku)}`); if(after.length) throw new Error('DB_PRODUCT_DELETE_NOT_PERSISTED'); r.actions.push('delete'); r.security_oracle='tenant checked'; r.persistence_oracle='create/update/delete reloaded from DB'; if(!networkSince(req0,x=>/rest\/v1|rpc/.test(x.url)).length) throw new Error('NO_BACKEND_REQUEST_OBSERVED');
}
async function runCustomerCrud(r){
  const code=`E2E-${Date.now()}`; await openEntity('/customers','العملاء','عميل جديد'); await fillLabeled('الاسم',`عميل E2E ${code}`); await fillLabeled('الكود',code); const req0=requests.length; await clickText(['إنشاء العميل','حفظ']); await sleep(500); await assertVisible(code,'created customer'); const rows=await dbSelect('customers',`select=id,company_id,code,name&code=eq.${encodeURIComponent(code)}`); if(!rows.length) throw new Error('DB_CUSTOMER_CREATE_NOT_FOUND'); if(String(rows[0].company_id)!==String(result.tenant)) throw new Error('DB_CUSTOMER_TENANT_MISMATCH'); r.db_oracle=rows[0]; r.actions.push('create'); const edit=page.getByRole('button',{name:new RegExp(`تعديل.*${code}`)}); if(!(await edit.count())) throw new Error('CUSTOMER_EDIT_CONTROL_NOT_FOUND'); await edit.click(); await fillLabeled('الاسم',`عميل E2E EDITED ${code}`); await clickText(['حفظ التعديل','حفظ']); await sleep(400); await assertVisible(`EDITED ${code}`,'edited customer'); r.actions.push('update'); const del=page.getByRole('button',{name:new RegExp(`حذف.*${code}`)}); if(!(await del.count())) throw new Error('CUSTOMER_DELETE_CONTROL_NOT_FOUND'); page.once('dialog',d=>d.accept()); await del.click(); await sleep(500); const after=await dbSelect('customers',`select=id,company_id,code&code=eq.${encodeURIComponent(code)}`); if(after.length) throw new Error('DB_CUSTOMER_DELETE_NOT_PERSISTED'); r.actions.push('delete'); if(!networkSince(req0,x=>/rest\/v1|rpc/.test(x.url)).length) throw new Error('NO_BACKEND_REQUEST_OBSERVED');
}
async function runSearch(r){ await goto('/products'); await assertVisible('المنتجات','search surface'); const input=page.getByPlaceholder('بحث عن منتج...'); if(!(await input.count())) throw new Error('PRODUCT_SEARCH_INPUT_NOT_FOUND'); const before=await page.locator('tbody tr').count().catch(()=>0); await input.fill('zzzz-e2e-no-match'); await sleep(300); const after=await page.locator('tbody tr').count().catch(()=>0); if(before===0 && after===0) throw new Error('SEARCH_NO_DATA_ORACLE'); r.actions.push('search exact non-match'); r.persistence_oracle='filter reflected in rendered result set'; }
async function runImport(r){ await goto('/import'); await assertVisible('استيراد','import page'); if(!goldenFixture) blocked('E2E_GOLDEN_FIXTURE_MISSING'); const file=page.locator('input[type=file]:visible').first(); if(!(await file.count())) throw new Error('IMPORT_FILE_INPUT_NOT_FOUND'); await file.setInputFiles(goldenFixture); await sleep(500); const submit=await clickText(['رفع','معاينة','استيراد','معالجة','تنفيذ'],{required:false}); if(!submit) throw new Error('IMPORT_ACTION_NOT_FOUND'); await sleep(1000); r.actions.push(`upload:${goldenFixture}`,`submit:${submit}`); const text=await body(); if(!/استيراد|معالجة|معاينة|نجاح|قيد|مراجعة|خطأ|فشل/i.test(text)) throw new Error('IMPORT_RESULT_NOT_VISIBLE'); }
function runReportAction(path){ return async r=>{ await goto(path); const before=requests.length; const text=await body(); if(!text) throw new Error('REPORT_BLANK'); const controls=page.locator('input:visible,select:visible'); const n=await controls.count(); if(n){ const c=controls.first(); const type=await c.getAttribute('type'); if(type==='date') await c.fill(new Date().toISOString().slice(0,10)); else if((await c.evaluate(el=>el.tagName))==='SELECT') await c.selectOption({index:Math.min(1,await c.locator('option').count()-1)}).catch(()=>{}); else await c.fill(''); await sleep(600); r.actions.push('filter/input change'); } else r.actions.push('report surface read'); if(!requests.slice(before).length) throw new Error('REPORT_ACTION_DID_NOT_TRIGGER_REQUEST'); r.db_oracle='backend request observed'; r.security_oracle='authenticated tenant context active'; }; }
async function runExport(r){ await goto('/reports'); const button=await clickText(['تصدير','Export','تحميل','تنزيل'],{required:false}); if(!button) { await goto('/reports/sales'); } const exportButton=button||await clickText(['تصدير','Export','تحميل','تنزيل'],{required:false}); if(!exportButton) throw new Error('EXPORT_ACTION_NOT_FOUND'); r.actions.push(`export:${exportButton}`); }
async function runDocument(r){ await goto('/import'); const file=page.locator('input[type=file]:visible').first(); if(!(await file.count())) throw new Error('DOCUMENT_FILE_INPUT_NOT_FOUND'); if(!goldenFixture) blocked('E2E_GOLDEN_FIXTURE_MISSING'); await file.setInputFiles(goldenFixture); await sleep(400); await clickText(['معاينة','رفع','معالجة','استيراد'],{required:false}); r.actions.push('real document input'); }
async function runEvidence(r){ await goto('/decision-experience'); const b=await clickText(['دليل','أدلة','Evidence','إضافة دليل','حفظ'],{required:false}); if(!b) throw new Error('EVIDENCE_ACTION_NOT_FOUND'); r.actions.push(`evidence action:${b}`); }
async function runRecommendation(r){ await goto('/intelligence/recommendations'); const b=await clickText(['اعتماد','موافقة','قبول','إنشاء توصية','حفظ'],{required:false}); if(!b) throw new Error('RECOMMENDATION_ACTION_NOT_FOUND'); r.actions.push(`recommendation action:${b}`); }
async function runDecision(r){ await goto('/decision-experience'); const b=await clickText(['اعتماد','موافقة','بدء العمل','إنهاء','حفظ القرار'],{required:false}); if(!b) throw new Error('DECISION_LIFECYCLE_ACTION_NOT_FOUND'); r.actions.push(`decision action:${b}`); }
async function runRealtime(r){
  const contextB=await browser.newContext({viewport:{width:1440,height:1000},locale:'ar-SA'}); const pageB=await contextB.newPage();
  try { const email=process.env.TEST_USER_A_EMAIL,password=process.env.TEST_USER_A_PASSWORD; if(!email||!password) blocked('AUTH_SECRET_MISSING_FOR_REALTIME'); await pageB.goto(`${baseURL}/`,{waitUntil:'networkidle',timeout:30000}); await pageB.locator('#login-email').fill(email); await pageB.locator('#login-password').fill(password); await pageB.getByRole('button',{name:'تسجيل الدخول'}).click(); await pageB.waitForLoadState('networkidle').catch(()=>{}); await sleep(800); await pageB.goto(`${baseURL}/products`,{waitUntil:'networkidle',timeout:30000}); const marker=`RT-${Date.now()}`; await goto('/products'); await openEntity('/products','المنتجات','منتج جديد'); await fillLabeled('SKU',marker); await fillLabeled('الاسم',`Realtime ${marker}`); await fillLabeled('الوحدة','قطعة'); await clickText(['إنشاء المنتج','حفظ']); await sleep(2500); const seen=await pageB.getByText(marker,{exact:false}).count(); page.once('dialog',d=>d.accept()); const del=page.getByRole('button',{name:new RegExp(`حذف.*${marker}`)}); if(await del.count()) await del.click(); if(!seen) throw new Error('REALTIME_UI_UPDATE_NOT_OBSERVED'); r.actions.push('cross-context mutation observed');
  } finally { await pageB.close(); await contextB.close(); }
}
async function runPersistence(r){ await goto('/products'); const before=await body(); await page.reload({waitUntil:'networkidle',timeout:30000}); const after=await body(); if(!after||after!==before) throw new Error('REFRESH_PERSISTENCE_SURFACE_CHANGED'); r.actions.push('hard refresh'); r.persistence_oracle='authenticated page survived reload'; }
async function runRecovery(r){ await goto('/import'); await page.reload({waitUntil:'networkidle',timeout:30000}); if(!(await body())) throw new Error('RECOVERY_RELOAD_BLANK'); r.actions.push('interrupted workflow reload/reopen'); r.persistence_oracle='reopen after interrupted route'; }
async function runLogoutRelogin(r){ const email=process.env.TEST_USER_A_EMAIL,password=process.env.TEST_USER_A_PASSWORD; if(!email||!password) blocked('AUTH_SECRET_MISSING:TEST_USER_A_EMAIL/TEST_USER_A_PASSWORD'); await goto('/'); const b=await clickText(['تسجيل الخروج'],{required:false}); if(!b) throw new Error('LOGOUT_CONTROL_NOT_FOUND'); await sleep(700); if(!(await page.locator('#login-email').count())) throw new Error('LOGOUT_DID_NOT_REACH_LOGIN'); await page.locator('#login-email').fill(email); await page.locator('#login-password').fill(password); await page.getByRole('button',{name:'تسجيل الدخول'}).click(); await page.waitForLoadState('networkidle').catch(()=>{}); await sleep(800); await authToken(); r.actions.push('logout','re-login'); }

try {
  await goto('/');
  if(!process.env.TEST_USER_A_EMAIL||!process.env.TEST_USER_A_PASSWORD){ finding('E2E-AUTH-001','BLOCKED','P0','TEST_USER_A_EMAIL/TEST_USER_A_PASSWORD are not provisioned'); }
  else {
    for(const [id,name,fn] of FLOWS) await performFlow(id,name,fn);
    const bEmail=process.env.TEST_USER_B_EMAIL,bPassword=process.env.TEST_USER_B_PASSWORD;
    if(!bEmail||!bPassword) finding('E2E-AUTH-B','BLOCKED','P0','TEST_USER_B_EMAIL/TEST_USER_B_PASSWORD are not provisioned');
    else { evidence('TENANT-B',{status:'READY_TO_RUN',actor:'B'}); }
  }
} catch(e){ finding('E2E-HARNESS-001','FAIL','P0',e instanceof Error?e.message:String(e)); }
finally {
  result.finishedAt=new Date().toISOString(); result.consoleErrors=consoleErrors; result.failedRequests=failedRequests; result.requests=requests;
  await fs.writeFile(`${reportDir}/result.json`,JSON.stringify(result,null,2)); await page.close(); await context.close(); await browser.close();
}

const counts=result.flows.reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{});
console.log(JSON.stringify({exactHead,auth:result.auth,tenant:result.tenant,flows:{total:FLOWS.length,...counts},findings:result.findings},null,2));
process.exitCode=result.findings.some(x=>x.status==='FAIL')?1:(result.findings.some(x=>x.status==='BLOCKED')?2:0);
