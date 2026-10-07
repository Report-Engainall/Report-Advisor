import { spawn, spawnSync } from 'node:child_process';

const root = process.cwd();
const port = 4500 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const command = process.platform === 'win32' ? (process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe') : 'npm';
const args = process.platform === 'win32' ? ['/d','/s','/c',`npm run preview -- --host 127.0.0.1 --port ${port}`] : ['run','preview','--','--host','127.0.0.1','--port',String(port)];
const child = spawn(command,args,{cwd:root,env:{...process.env,VITE_SUPABASE_URL:'',VITE_SUPABASE_ANON_KEY:''},stdio:['ignore','pipe','pipe'],windowsHide:true});
const logs=[]; child.stdout.on('data',c=>logs.push(String(c))); child.stderr.on('data',c=>logs.push(String(c)));
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));

try {
  let ready=false;
  for(let i=0;i<60;i+=1){
    try { const r=await fetch(baseUrl+'/reports/sales?demo=1'); if(r.ok){ready=true;break;} } catch {}
    await wait(250);
  }
  if(!ready) throw new Error('STUDIO_PREVIEW_SERVER_NOT_READY');
  const {chromium}=await import('playwright');
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(baseUrl+'/reports/sales?demo=1',{waitUntil:'networkidle'});
  const body=()=>page.locator('body').innerText();
  const initial=(await body()).replace(/\\s+/g,' ').trim();
  if(!initial) throw new Error('STUDIO_PREVIEW_BLANK');
  if(!initial.includes('المبيعات الموجودة داخل الـFixture')) throw new Error('SALES_DEMO_NOT_EXPOSED');
  if(!initial.includes('INTELLIGENCE CLOSURE')) throw new Error('INTELLIGENCE_CLOSURE_PANEL_MISSING');
  const closure=initial;
  if(!closure.includes('CAUSAL + VOI')) throw new Error('CAUSAL_VOI_SURFACE_MISSING');
  if(!closure.includes('KNOWLEDGE GRAPH')) throw new Error('KNOWLEDGE_GRAPH_SURFACE_MISSING');
  if(!closure.includes('CAUSAL + VOI')) throw new Error('CAUSAL_VOI_SURFACE_MISSING');
  if(!closure.includes('KNOWLEDGE GRAPH')) throw new Error('KNOWLEDGE_GRAPH_SURFACE_MISSING');
  if(errors.length) throw new Error('STUDIO_PAGEERROR:'+errors[0]);
  await browser.close();
  console.log('decision-intelligence-studio-smoke: PASS');
} finally {
  if(process.platform==='win32' && child.pid) spawnSync(process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe',['/d','/s','/c',`taskkill /PID ${child.pid} /T /F`],{stdio:'ignore'});
  else child.kill('SIGTERM');
  await wait(300);
}
