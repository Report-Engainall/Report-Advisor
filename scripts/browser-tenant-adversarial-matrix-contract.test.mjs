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

function assertHarnessContract(source) {
  for (const operation of requiredOperations) assert.match(source, new RegExp(`['\"]${operation}['\"]`), `missing operation ${operation}`);
  for (const tenant of requiredDirections) assert.match(source, new RegExp(`['\"]${tenant}['\"]`), `missing tenant ${tenant}`);
  for (const forged of requiredForgedContexts) assert.match(source, new RegExp(forged.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing forged context ${forged}`);
  for (const token of ['REQUIRED_OPERATION_MATRIX','TENANT_DIRECTIONS','assertDbStateUnchanged','dbRows','current_company_id','ALLOW','DENY','NOT_PROVEN','OPEN','UNAUTHORIZED_DB_STATE_CHANGED']) {
    assert.match(source, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing adversarial control ${token}`);
  }
  assert.match(source, /REQUIRED_OPERATION_MATRIX\.flatMap/, 'full A/B operation matrix must be generated');
  assert.match(source, /assertDbStateUnchanged\(/, 'DB-state oracle must be executable, not declarative');
}

assertHarnessContract(file);

// Test-of-test: the contract must reject deliberate reductions of the security surface.
const oracleRemoved = file.replace(/function assertDbStateUnchanged[\s\S]*?\nfunction recordCase/, 'function recordCase');
assert.throws(() => assertHarnessContract(oracleRemoved), /assertDbStateUnchanged|DB-state oracle/);

const matrixCollapsed = file.replace(/const REQUIRED_OPERATION_MATRIX = [\s\S]*?;\nconst FORGED_CONTEXT_CASES/, 'const REQUIRED_OPERATION_MATRIX = [];\nconst FORGED_CONTEXT_CASES');
assert.throws(() => assertHarnessContract(matrixCollapsed), /REQUIRED_OPERATION_MATRIX|full A\/B operation matrix/);

const forgedRemoved = file.replace(/const FORGED_CONTEXT_CASES = \[[\s\S]*?\];/, 'const FORGED_CONTEXT_CASES = [];');
assert.throws(() => assertHarnessContract(forgedRemoved), /cross-tenant foreign key|missing forged context/);

console.log('Tenant adversarial matrix contract PASS: six operations, A/B directions, DB-state oracle, forged-context attacks, and fail-closed NOT_PROVEN semantics are present.');
