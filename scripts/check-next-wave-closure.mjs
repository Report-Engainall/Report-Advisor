import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const required=[
 ['runtime','scripts/check-runtime-closure-integrity.mjs'],
 ['live gates','scripts/check-live-gate-manifest-integrity.mjs'],
 ['autonomy','scripts/check-autonomy-safety-chain.mjs'],
 ['global safety','scripts/check-final-safety-invariants.mjs'],
 ['checkpoint hardening','scripts/report-execution-checkpoint-hardening.test.ts'],
 ['K-S closure','scripts/check-k-to-s-deep-closure.mjs'],
];
for(const [name,file] of required) if(!fs.existsSync(path.join(root,file))) throw new Error(`Next-wave ${name} gate missing: ${file}`);
const checkpoint=fs.readFileSync(path.join(root,'src/lib/report-execution/checkpoint.ts'),'utf8');
for(const token of ['assertValidTransition','createInitialCheckpoint','resumeFromCheckpoint']) if(!checkpoint.includes(token)) throw new Error(`Checkpoint hardening missing: ${token}`);
const ks=fs.readFileSync(path.join(root,'src/lib/k-to-s-runtime.ts'),'utf8');
for(const token of ['item.priority','item.materiality','item.risk','assertNoCrossTenantEvidence']) if(!ks.includes(token)) throw new Error(`K-S canonical field alignment missing: ${token}`);
const migration=fs.readdirSync(path.join(root,'supabase/migrations')).find(x=>x.includes('runtime_lease_hardening'));
if(!migration) throw new Error('Runtime lease hardening migration missing');
const sql=fs.readFileSync(path.join(root,'supabase/migrations',migration),'utf8');
for(const token of ['lease_expires_at > now()','current_company_id()','REVOKE ALL ON FUNCTION','dead_letter']) if(!sql.includes(token)) throw new Error(`Lease safety invariant missing: ${token}`);

// KPI truth must not silently equate activity with the customer master count.
const queries=fs.readFileSync(path.join(root,'src/lib/queries.ts'),'utf8');
if(/activeCustomers:\s*totalCustomers/.test(queries)) throw new Error('KPI truth drift: activeCustomers must be derived from transactional activity, not totalCustomers');
if(/\?\?\s*['"]غير معروف['"]/.test(queries)) throw new Error('KPI/report truth drift: missing entity names must fail closed or remain unknown, not fabricate a business label');

// Application tenant consumers must not reintroduce static tenant authority.
const sourceRoots=[path.join(root,'src')];
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.name==='node_modules')continue;if(entry.isDirectory())walk(full);else if(/\.(ts|tsx|js|jsx)$/.test(entry.name))files.push(full);}}
for(const dir of sourceRoots)walk(dir);
for(const file of files){const text=fs.readFileSync(file,'utf8');if(/\bCOMPANY_ID\b/.test(text) && !/src[\\/]lib[\\/]supabase\.ts$/.test(file)) throw new Error(`Legacy tenant authority detected: ${path.relative(root,file)}`);}
console.log('Next-wave closure: PASS');
