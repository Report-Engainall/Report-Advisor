import assert from 'node:assert/strict';
import { mutationTargetId, assertMutationTargetIdentity, assertMutationResponseIdentity } from './p0-2-mutation-identity.mjs';

const fixture = { table: 'sale_items', operation: 'UPDATE', own: { id: 'A' }, foreign: { id: 'B' }, restore: { id: 'A' } };
const target = mutationTargetId(fixture);
assert.equal(target, 'A');
assert.equal(assertMutationTargetIdentity(fixture, target, target), 'A');
assert.equal(assertMutationResponseIdentity(fixture, target, [{ id: target }]), 'A');
assert.throws(() => assertMutationTargetIdentity(fixture, 'B', 'B'), /mutation target identity mismatch/);
assert.throws(() => assertMutationResponseIdentity(fixture, target, [{ id: 'B' }]), /mutation response identity mismatch/);
const divergent = { table: 'sale_items', operation: 'UPDATE', own: { id: 'A' }, foreign: { id: 'B' }, restore: { id: 'B' } };
assert.throws(() => mutationTargetId(divergent), /mutation target identity diverges/);
const cycleFixture = { table: 'sale_items', operation: 'DELETE', own: { id: 'X' }, foreign: { id: 'Y' }, restore: { id: 'X' } };
assert.equal(mutationTargetId(cycleFixture), 'X');
cycleFixture.own.id = 'Z';
assert.throws(() => mutationTargetId(cycleFixture), /mutation target identity changed after cycle initialization/);
console.log('PASS F11 identity invariant: immutable target identity across snapshot/mutation/observation/restore/comparison; adversarial A→B is rejected.');
