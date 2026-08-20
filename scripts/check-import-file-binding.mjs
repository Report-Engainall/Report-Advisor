import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260820120000_import_job_file_binding.sql', 'utf8');
const query = fs.readFileSync('src/lib/queries.ts', 'utf8');
const page = fs.readFileSync('src/pages/ImportPageV2.tsx', 'utf8');

for (const token of [
  'bind_import_job_file_record',
  "fr.company_id = NEW.company_id",
  "fr.created_at >= now() - interval '10 minutes'",
  "fr.metadata->>'entity_type'",
]) {
  if (!migration.includes(token)) throw new Error(`Missing lineage guard: ${token}`);
}

if (!query.includes("from('file_records').insert")) throw new Error('Import UI does not persist file records.');
if (!query.includes("from('import_jobs').select")) throw new Error('Import history does not read import jobs.');
if (!query.includes('export async function updateImportRecord')) throw new Error('Legacy import API compatibility is missing.');
if (!page.includes("p_file_record_id: null")) throw new Error('Expected compatibility path is no longer visible; review the binding contract.');

console.log('Import file/job lineage contract: PASS');
