import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  'supabase/migrations/20260907200000_add_canonical_text_provenance_tenant_fk_indexes.sql',
  'utf8',
);

for (const token of [
  'canonical_text_provenance_company_file_idx',
  'canonical_text_provenance_company_folder_idx',
  '(company_id, file_id)',
  '(company_id, folder_id)',
  'where file_id is not null',
  'where folder_id is not null',
]) {
  assert.ok(migration.includes(token), `missing contract token: ${token}`);
}

console.log('canonical text provenance tenant FK index contract: PASS');
