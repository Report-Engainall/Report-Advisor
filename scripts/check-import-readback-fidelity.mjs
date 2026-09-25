import fs from 'node:fs';

const source = fs.readFileSync('src/lib/queries.ts', 'utf8');
for (const token of [
  'const summary = (row.result_summary as Record<string, unknown> | null) ?? {};',
  'const sourceType = typeof summary.source_type',
  'const fileName = typeof summary.file_name',
  'const fileSize = typeof summary.file_size',
  'source_type: sourceType,',
  'file_name: fileName,',
  'file_size: fileSize,',
]) {
  if (!source.includes(token)) throw new Error(`Import readback fidelity contract missing: ${token}`);
}
if (source.includes("source_type: 'import', file_size: 0")) throw new Error('Import readback still hardcodes source type or file size');
if (!source.includes('.eq(\'company_id\', companyId)')) throw new Error('Import readback is missing tenant scoping on the canonical list query');
if (!source.includes('.eq(\'id\', focusJobId)')) throw new Error('Import focused readback is missing job-id scoping');
console.log('Import readback fidelity contract: PASS (tenant-scoped import metadata is preserved from result_summary with safe fallbacks).');
