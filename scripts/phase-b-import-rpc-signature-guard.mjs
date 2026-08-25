import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const caller = fs.readFileSync(path.join(root, 'src/lib/import/canonical-commit.ts'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20260823021000_import_upsert_concurrency_safe.sql'), 'utf8');

const rpcCall = caller.match(/supabase\.rpc\('import_upsert_product',\s*\{([\s\S]*?)\}\);/);
if (!rpcCall) throw new Error('import_upsert_product caller not found');

const callKeys = [...rpcCall[1].matchAll(/p_[a-z_]+\s*:/g)].map((m) => m[0].replace(/\s*:/, ''));
const signature = migration.match(/CREATE OR REPLACE FUNCTION public\.import_upsert_product\(([^)]*)\)/s);
if (!signature) throw new Error('authoritative import_upsert_product signature not found');
const signatureKeys = [...signature[1].matchAll(/(p_[a-z_]+)\s+[a-z]+(?:\([^)]*\))?(?:\s+DEFAULT[^,]+)?/gi)].map((m) => m[1]);

const missing = callKeys.filter((key) => !signatureKeys.includes(key));
const requiredCallerKeys = ['p_company_id', 'p_sku', 'p_name', 'p_unit', 'p_cost_price', 'p_selling_price', 'p_min_stock', 'p_reorder_point'];
const missingRequired = requiredCallerKeys.filter((key) => !callKeys.includes(key));

if (missing.length || missingRequired.length) {
  console.error(JSON.stringify({ callKeys, signatureKeys, missing, missingRequired }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, callKeys, signatureKeys, note: 'Signature guard is static; live RPC deployment still requires runtime certification.' }, null, 2));
