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

  if (!/v_company_id(?:\s+[a-zA-Z_][a-zA-Z0-9_]*(?:\s*\[\])?)?\s*:=\s*public\.current_company_id\(\)/.test(body)) {
    throw new Error(`Canonical import RPC does not resolve tenant context: ${fn}`);
  }
  if (!body.includes('TENANT_CONTEXT_REQUIRED')) {
    throw new Error(`Canonical import RPC does not fail closed without tenant context: ${fn}`);
  }
}

const createStart = text.indexOf('CREATE OR REPLACE FUNCTION public.import_create_job');
const createBody = text.slice(createStart);
if (!createBody.includes('p_company_id IS DISTINCT FROM v_company_id')) {
  throw new Error('import_create_job must reject mismatched tenant context');
}

// Verify the effective (latest) product upsert definition, not only the original
// canonical migration. This prevents later migrations from silently reintroducing
// fabricated business defaults or caller/DB contract drift.
const productDefinitions = migrations
  .filter(({ text: migrationText }) => migrationText.includes('CREATE OR REPLACE FUNCTION public.import_upsert_product'));
const latestProduct = productDefinitions.at(-1);
if (!latestProduct) throw new Error('Effective import_upsert_product definition is missing');
if (!latestProduct.text.includes('p_is_active boolean')) throw new Error('Effective import_upsert_product must expose p_is_active');
if (!latestProduct.text.includes('NAME_REQUIRED')) throw new Error('Effective product insert must fail closed when name is missing');
if (!latestProduct.text.includes('UNIT_REQUIRED')) throw new Error('Effective product insert must fail closed when unit is missing');
if (!latestProduct.text.includes('COST_PRICE_REQUIRED')) throw new Error('Effective product insert must fail closed when cost price is missing');
if (!latestProduct.text.includes('SELLING_PRICE_REQUIRED')) throw new Error('Effective product insert must fail closed when selling price is missing');
if (!latestProduct.text.includes('IS_ACTIVE_REQUIRED')) throw new Error('Effective product insert must fail closed when active state is missing');
if (latestProduct.text.includes("coalesce(p_unit, 'قطعة')") || latestProduct.text.includes('coalesce(p_cost_price, 0)') || latestProduct.text.includes('coalesce(p_selling_price, 0)')) {
  throw new Error('Effective product upsert must not fabricate unit or price defaults on insert');
}

console.log(`Import RPC tenant context: PASS (canonical=${canonical.file}, effective_product=${latestProduct.file})`);
