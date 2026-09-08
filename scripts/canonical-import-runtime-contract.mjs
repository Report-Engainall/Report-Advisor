import fs from 'node:fs';

const page = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
const validator = fs.readFileSync('src/lib/import/canonical-validation.ts', 'utf8');
const lifecycle = fs.readFileSync('supabase/migrations/20260830210000_harden_import_finish_lifecycle.sql', 'utf8');

const required = [
  [page, "import { validateMappedRow } from '@/lib/import/canonical-validation';", 'page uses canonical validator'],
  [page, 'validateMappedRow(entityType, data, dataset.columns)', 'validation is based on mapped canonical fields'],
  [validator, 'column.mappedField ?? column.name', 'validator resolves mapped field first'],
  [validator, "customers: ['code', 'name']", 'customer identity supports code/name namespace'],
  [page, "p_status: 'completed'", 'successful import closes through governed lifecycle RPC'],
  [page, "p_status: 'failed'", 'failed import closes through governed lifecycle RPC'],
  [page, 'let importId: string | null = null;', 'failure path retains created job id'],
  [lifecycle, "p_status NOT IN ('completed','partial','failed','cancelled')", 'DB restricts terminal lifecycle states'],
  [lifecycle, 'AND company_id = v_company_id', 'DB terminalization remains tenant scoped'],
];

const failures = required.filter(([source, token]) => !source.includes(token));
if (failures.length) {
  console.error('Canonical import runtime contract: FAIL');
  for (const [, token, description] of failures) console.error(`- ${description}: missing ${token}`);
  process.exit(1);
}

console.log('Canonical import runtime contract: PASS');
