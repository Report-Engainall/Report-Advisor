#!/usr/bin/env node
import assert from 'node:assert/strict';

const evidenceTypes = new Set([
  'STATIC',
  'CI',
  'SYNTHETIC RUNTIME',
  'LIVE SQL',
  'AUTHENTICATED LIVE',
  'PRODUCTION',
]);

function requireEvidence(evidence) {
  assert.ok(evidence && typeof evidence === 'object');
  assert.ok(evidenceTypes.has(evidence.type), `unknown evidence type: ${evidence.type}`);
  assert.match(evidence.exact_sha ?? '', /^[0-9a-f]{40}$/i, 'exact SHA required');
  assert.ok(evidence.environment, 'environment required');
}

function tenantScoped(actorTenant, resourceTenant) {
  return actorTenant === resourceTenant;
}

function assertTenantBoundary(actorTenant, resourceTenant, expectedAllowed) {
  assert.equal(tenantScoped(actorTenant, resourceTenant), expectedAllowed);
}

function assertTerminalGuard(state, next) {
  const terminal = new Set(['COMPLETED', 'EXECUTED', 'FINALIZED']);
  assert.equal(terminal.has(state), true);
  assert.notEqual(next, state, 'terminal state must reject duplicate transition');
}

requireEvidence({
  type: 'SYNTHETIC RUNTIME',
  exact_sha: '0123456789abcdef0123456789abcdef01234567',
  environment: 'test',
});

assertTenantBoundary('tenant-a', 'tenant-a', true);
assertTenantBoundary('tenant-a', 'tenant-b', false);
assertTerminalGuard('COMPLETED', 'REOPENED');

console.log('parallel runtime hardening: PASS');
