import fs from 'node:fs';
import path from 'node:path';
const dir=path.join(process.cwd(),'supabase','migrations');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort();
const all=files.map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
for (const marker of ['uq_products_company_normalized_sku','normalize_import_key(sku)','company_id, normalize_import_key(sku)']) {
  if(!all.includes(marker)) throw new Error(`Missing import business-key invariant: ${marker}`);
}
console.log('Import business-key invariant: PASS');
