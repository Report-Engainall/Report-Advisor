import fs from 'node:fs';

const migration = fs.readFileSync(
  'supabase/migrations/20260907200000_add_canonical_text_provenance_tenant_fk_indexes.sql',
  'utf8',
);

const required = [
  'canonical_text_provenance_company_file_idx',
  'canonical_text_provenance_company_folder_idx',
  '(company_id, file_id)',
  '(company_id, folder_id)',
  'where file_id is not null',
  'where folder_id is not null',
];

for (const token of required) {
  if (!migration.toLowerCase().includes(token.toLowerCase())) {
    throw new Error(`Missing canonical provenance index contract token: ${token}`);
  }
}

console.log('canonical-text-provenance-index-contract: PASS');
