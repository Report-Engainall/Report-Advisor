import fs from 'node:fs';

const source = fs.readFileSync('src/lib/import/canonical-commit.ts', 'utf8');

const requiredTokens = [
  "const payload = rows.map((row) => canonicalizeRow(entityType, { data: row.data, rowNumber: row.rowNumber }));",
  "source_data: row.data",
  "mapped_data: payload[index]",
  "target_table: entityType",
];

for (const token of requiredTokens) {
  if (!source.includes(token)) throw new Error(`canonical import lineage contract missing ${token}`);
}

if (source.includes('mapped_data: row.data')) {
  throw new Error('canonical import lineage must never label the raw source row as mapped_data');
}

const sourceIndex = source.indexOf('source_data: row.data');
const mappedIndex = source.indexOf('mapped_data: payload[index]');
if (sourceIndex < 0 || mappedIndex < 0 || sourceIndex >= mappedIndex) {
  throw new Error('canonical import lineage source/mapped ordering is invalid');
}

console.log('CANONICAL_IMPORT_LINEAGE_CONTRACT PASS');
