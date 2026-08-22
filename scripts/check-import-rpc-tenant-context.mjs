import fs from 'node:fs';
import path from 'node:path';
const dir = path.join(process.cwd(),'supabase','migrations');
const text = fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
for (const marker of ['public.current_company_id()','TENANT_CONTEXT_REQUIRED','TENANT_CONTEXT_MISMATCH','IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN','REVOKE EXECUTE ON FUNCTION import_create_job','GRANT EXECUTE ON FUNCTION import_create_job']) {
  if (!text.includes(marker)) throw new Error(`Import RPC tenant context missing: ${marker}`);
}
if (/CREATE OR REPLACE FUNCTION import_create_job[\s\S]*?INSERT INTO import_jobs\([\s\S]*?p_company_id/i.test(text)) {
  // The legacy signature may remain; runtime must assign v_company_id instead.
  const latest = text.slice(text.lastIndexOf('CREATE OR REPLACE FUNCTION import_create_job'));
  if (!latest.includes('VALUES (v_company_id')) throw new Error('Import job RPC does not persist canonical tenant context');
}
console.log('Import RPC tenant context: PASS');
