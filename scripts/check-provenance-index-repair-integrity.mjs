import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/20260907200000_add_canonical_text_provenance_tenant_fk_indexes.sql', 'utf8');
const expected = [
  'create index if not exists canonical_text_provenance_company_file_idx',
  'on public.canonical_text_provenance (company_id, file_id)',
  'where file_id is not null',
  'create index if not exists canonical_text_provenance_company_folder_idx',
  'on public.canonical_text_provenance (company_id, folder_id)',
  'where folder_id is not null',
];
for (const token of expected) assert.ok(sql.includes(token), `missing: ${token}`);
assert.equal((sql.match(/create index if not exists/g) ?? []).length, 2);
console.log('provenance index repair integrity: PASS');
