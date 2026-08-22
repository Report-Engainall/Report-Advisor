import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const migrations = files.map((file) => ({ file, text: fs.readFileSync(path.join(dir, file), 'utf8') }));
const canonical = migrations.find(({ file }) => file.includes('import_rpc_canonical_tenant'));
if (!canonical) throw new Error('Canonical tenant-aware import RPC migration is missing');

const text = canonical.text;
for (const marker of [
  'public.current_company_id()',
  'TENANT_CONTEXT_REQUIRED',
  'TENANT_CONTEXT_MISMATCH',
  'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN',
  'REVOKE ALL ON FUNCTION public.import_create_job',
  'GRANT EXECUTE ON FUNCTION public.import_create_job',
]) {
  if (!text.includes(marker)) throw new Error(`Import RPC tenant context missing: ${marker}`);
}

for (const fn of ['import_create_job', 'import_update_job_progress', 'import_finish_job', 'import_upsert_product']) {
  const start = text.indexOf(`CREATE OR REPLACE FUNCTION public.${fn}`);
  if (start < 0) throw new Error(`Canonical import RPC missing: ${fn}`);
  const next = text.indexOf('CREATE OR REPLACE FUNCTION public.', start + 1);
  const body = text.slice(start, next < 0 ? text.length : next);
  if (!body.includes('v_company_id := public.current_company_id()')) {
    throw new Error(`Canonical import RPC does not resolve tenant context: ${fn}`);
  }
  if (!body.includes('TENANT_CONTEXT_REQUIRED')) {
    throw new Error(`Canonical import RPC does not fail closed without tenant context: ${fn}`);
  }
}

const createBody = text.slice(text.indexOf('CREATE OR REPLACE FUNCTION public.import_create_job'));
if (!createBody.includes('p_company_id IS DISTINCT FROM v_company_id')) {
  throw new Error('import_create_job must reject mismatched tenant context');
}

console.log(`Import RPC tenant context: PASS (canonical=${canonical.file})`);
