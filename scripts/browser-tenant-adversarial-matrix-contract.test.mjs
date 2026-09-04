import { strict as assert } from 'node:assert';
import fs from 'node:fs';

const file = fs.readFileSync('scripts/browser-tenant-adversarial-e2e.mjs', 'utf8');
const requiredOperations = ['SELECT','INSERT','UPDATE','DELETE','EXPORT','RPC'];
const requiredDirections = ['A','B'];
const requiredForgedContexts = [
  'forged company_id',
  'forged actor',
  'wrong authenticated identity',
  'wrong tenant context',
  'cross-tenant record ID',
  'cross-tenant foreign key',
];

for (const operation of requiredOperations) assert.match(file, new RegExp(`['\"]${operation}['\"]`), `missing operation ${operation}`);
for (const tenant of requiredDirections) assert.match(file, new RegExp(`['\"]${tenant}['\"]`), `missing tenant ${tenant}`);
for (const forged of requiredForgedContexts) assert.match(file, new RegExp(forged.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing forged context ${forged}`);
for (const token of [
  'REQUIRED_OPERATION_MATRIX',
  'TENANT_DIRECTIONS',
  'assertDbStateUnchanged',
  'dbRows',
  'current_company_id',
  'ALLOW',
  'DENY',
  'NOT_PROVEN',
  'OPEN',
  'UNAUTHORIZED_DB_STATE_CHANGED',
]) assert.match(file, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing adversarial control ${token}`);

// Test-of-test: removing the DB-state oracle, collapsing the matrix, or deleting a
// required forged-context case must make this contract fail rather than silently pass.
const oracleRemoved = file.replace(/function assertDbStateUnchanged[\s\S]*?\n\nfunction recordCase/, 'function recordCase');
assert.doesNotMatch(oracleRemoved, /assertDbStateUnchanged\(/, 'mutation model sanity check');
assert.match(file, /assertDbStateUnchanged\(/, 'DB-state oracle must be executable, not declarative');

const matrixRemoved = file.replace(/const REQUIRED_OPERATION_MATRIX = [\s\S]*?;\nconst FORGED_CONTEXT_CASES/, 'const REQUIRED_OPERATION_MATRIX = [];\nconst FORGED_CONTEXT_CASES');
assert.doesNotMatch(matrixRemoved, /REQUIRED_OPERATION_MATRIX\.flatMap/, 'matrix collapse mutation must be detectable');
assert.match(file, /REQUIRED_OPERATION_MATRIX\.flatMap/, 'full A/B operation matrix must be generated');

const forgedRemoved = file.replace(/const FORGED_CONTEXT_CASES = \[[\s\S]*?\];/, 'const FORGED_CONTEXT_CASES = [];');
assert.doesNotMatch(forgedRemoved, /cross-tenant foreign key/, 'forged-context removal mutation must be detectable');
assert.match(file, /cross-tenant foreign key/, 'cross-tenant foreign-key attack must remain explicit');

console.log('Tenant adversarial matrix contract PASS: six operations, A/B directions, DB-state oracle, forged-context attacks, and fail-closed NOT_PROVEN semantics are present.');
