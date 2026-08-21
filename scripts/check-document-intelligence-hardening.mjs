import fs from 'node:fs';
import assert from 'node:assert/strict';

const schema = fs.readFileSync('src/lib/document-intelligence/schema-discovery.ts', 'utf8');
const hardening = fs.readFileSync('src/lib/document-intelligence/semantic-hardening.ts', 'utf8');
const index = fs.readFileSync('src/lib/document-intelligence/index.ts', 'utf8');

assert.match(hardening, /inferHeaderlessSchema/);
assert.match(hardening, /inferColumnRelationships/);
assert.match(hardening, /classifyTable/);
assert.match(hardening, /fuseEvidence/);
assert.match(hardening, /quarantine/);
assert.match(hardening, /review/);
assert.match(hardening, /one-to-many/);
assert.match(schema, /DEFAULT_SEMANTIC_DICTIONARY/);
assert.match(schema, /product_code/);
assert.match(index, /semantic-hardening/);

console.log('document intelligence hardening contract: PASS');
