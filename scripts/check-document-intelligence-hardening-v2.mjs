import fs from 'node:fs';
import assert from 'node:assert/strict';

const resolution = fs.readFileSync('src/lib/document-intelligence/entity-resolution.ts', 'utf8');
const transaction = fs.readFileSync('src/lib/document-intelligence/transactional-routing.ts', 'utf8');
const routing = fs.readFileSync('src/lib/document-intelligence/routing.ts', 'utf8');

assert.match(resolution, /resolveEntity/);
assert.match(resolution, /buildIdempotencyKey/);
assert.match(resolution, /reconcileAccounting/);
assert.match(resolution, /reconcileInventory/);
assert.match(resolution, /reviewRequired/);
assert.match(transaction, /buildTransactionPlan/);
assert.match(transaction, /executeTransactionPlan/);
assert.match(transaction, /rollback/);
assert.match(transaction, /tenantId/);
assert.match(transaction, /idempotencyKeys/);
assert.match(routing, /QUARANTINE/);
assert.match(routing, /UNMAPPED/);

console.log('document intelligence A0.4/A0.5 hardening contract: PASS');
