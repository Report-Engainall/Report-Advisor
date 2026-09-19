import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { normalizeBusinessKey, businessKeysEqual, buildBusinessKeyIndex, matchBusinessKey } from '../src/lib/file-engine/business-key.ts';

assert.equal(normalizeBusinessKey('  ab-001  '), 'AB-001');
assert.equal(normalizeBusinessKey('AB 123'), 'AB123');
assert.equal(normalizeBusinessKey('AB123'), 'AB123');
assert.equal(normalizeBusinessKey('ab 123'), 'AB123');
assert.equal(businessKeysEqual('AB 123', 'ab123'), true);

assert.equal(normalizeBusinessKey('أب ١٢٣'), 'اب123');
assert.equal(normalizeBusinessKey('٠٠١٢٣'), '00123');
assert.equal(normalizeBusinessKey('A\u200B-\u200F001'), 'A-001');
assert.equal(businessKeysEqual(' 00123 ', '٠٠١٢٣'), true);
assert.equal(businessKeysEqual('ABC-1', 'ABC-2'), false);

const rows = [{ sku: '00123', name: 'Existing' }, { sku: 'AB-001', name: 'Arabic mixed' }];
const index = buildBusinessKeyIndex(rows, row => row.sku);
assert.equal(matchBusinessKey(index, ' ٠٠١٢٣ ').row?.name, 'Existing');
assert.equal(matchBusinessKey(index, 'ab-001').row?.name, 'Arabic mixed');
assert.equal(matchBusinessKey(index, '').reason, 'missing-key');
assert.equal(matchBusinessKey(index, 'ZZ-999').reason, 'not-found');

const repositoryRoot = process.cwd();
const migrationDir = path.join(repositoryRoot, 'supabase', 'migrations');
const sqlFiles = fs.readdirSync(migrationDir).filter(file => file.endsWith('.sql')).sort();
const normalizeDbDefinitions = sqlFiles.filter(file => {
  const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
  return /CREATE(?:\s+OR\s+REPLACE)?\s+FUNCTION\s+public\.normalize_import_key\s*\(/i.test(sql);
});
assert.equal(
  normalizeDbDefinitions.length,
  1,
  'Expected exactly one DB normalize_import_key implementation, found: ' + normalizeDbDefinitions.join(', '),
);

const canonicalConsumers = [
  ['src/lib/file-engine/reconciliation.ts', /import\s*\{[^}]*normalizeBusinessKey[^}]*\}\s*from ['"]\.\/business-key\.ts['"]/s],
  ['src/lib/import/canonical-truth-boundary.ts', /import\s*\{[^}]*normalizeBusinessKey[^}]*\}\s*from ['"]\.\.\/file-engine\/business-key\.ts['"]/s],
  ['src/lib/import/canonical-production-adapter.ts', /import\s*\{[^}]*normalizeImportKey[^}]*\}\s*from ['"]\.\/canonical-truth-boundary\.ts['"]/s],
];
for (const [relativePath, contract] of canonicalConsumers) {
  const source = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
  assert.match(source, contract, 'Business identity consumer is not bound to canonical contract: ' + relativePath);
}

const prohibitedDuplicatePath = path.join(repositoryRoot, 'src/lib/product-intelligence/product-identity-normalizer.ts');
const productIdentitySource = fs.readFileSync(prohibitedDuplicatePath, 'utf8');
for (const relativePath of canonicalConsumers.map(([p]) => p)) {
  const source = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
  assert.equal(source.includes('normalizeProductIdentity'), false, 'Canonical business-identity path must not import product-name identity helper: ' + relativePath);
}
assert.equal(productIdentitySource.includes('canonicalKey'), true);

console.log('Business-key regressions: PASS (single TS contract, single DB implementation, canonical consumers bound)');
