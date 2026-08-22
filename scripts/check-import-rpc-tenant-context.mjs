import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'supabase', 'migrations');
const text = fs.readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
  .join('\n');

for (const marker of [
  'public.current_company_id()',
  'TENANT_CONTEXT_REQUIRED',
  'TENANT_CONTEXT_MISMATCH',
  'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN',
]) {
  if (!text.includes(marker)) throw new Error(`Import RPC tenant context missing: ${marker}`);
}

const revokeCreate = [
  'REVOKE EXECUTE ON FUNCTION public.import_create_job',
  'REVOKE EXECUTE ON FUNCTION import_create_job',
];
const grantCreate = [
  'GRANT EXECUTE ON FUNCTION public.import_create_job',
  'GRANT EXECUTE ON FUNCTION import_create_job',
];
if (!revokeCreate.some((marker) => text.includes(marker))) {
  throw new Error('Import RPC tenant context missing: REVOKE EXECUTE ON FUNCTION import_create_job');
}
if (!grantCreate.some((marker) => text.includes(marker))) {
  throw new Error('Import RPC tenant context missing: GRANT EXECUTE ON FUNCTION import_create_job');
}

const latest = text.slice(text.lastIndexOf('CREATE OR REPLACE FUNCTION public.import_create_job'));
if (latest && !latest.includes('VALUES (')) {
  throw new Error('Import job RPC body is malformed');
}
if (latest && !latest.includes('v_company_id')) {
  throw new Error('Import job RPC does not persist canonical tenant context');
}

console.log('Import RPC tenant context: PASS');
