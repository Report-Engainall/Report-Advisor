import { readFileSync } from 'node:fs';

const migration = readFileSync('supabase/migrations/20260908252000_import_resolution_preview_normalized_keys.sql', 'utf8');

const required = [
  'SECURITY INVOKER',
  'public.current_company_id()',
  "p_entity_type NOT IN ('products', 'customers', 'sales_invoices')",
  'jsonb_array_length(p_rows)',
  "lower(trim(e.key))",
  "regexp_replace(lower(trim(e.key)), '[^a-z0-9]+', '_', 'g')",
  "r.value ->> 'sku'",
  "r.value ->> 'invoice_number'",
  "r.value ->> 'code'",
  "r.value ->> 'name'",
  'p.company_id = v_company',
  's.company_id = v_company',
  'c.company_id = v_company',
  'REVOKE ALL ON FUNCTION public.import_resolution_preview(text, jsonb) FROM anon',
  'GRANT EXECUTE ON FUNCTION public.import_resolution_preview(text, jsonb) TO authenticated',
];

for (const token of required) {
  if (!migration.includes(token)) throw new Error(`missing contract token: ${token}`);
}

console.log('Import resolution preview contract: PASS');
