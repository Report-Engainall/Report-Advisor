import assert from 'node:assert/strict';
import { evaluateFreshness, overallTrust, trustAllowsDecision } from '../src/lib/intelligence/trustModel.ts';
import { addEdge, addNode, assertTenantClosed, traceSources, type EvidenceGraph } from '../src/lib/intelligence/evidenceGraph.ts';

const now = new Date('2026-08-25T12:00:00Z');
const fresh = evaluateFreshness('2026-08-25T11:30:00Z', now);
assert.equal(fresh.state, 'FRESH');
assert.equal(fresh.permission, 'ALLOW');

const stale = evaluateFreshness('2026-08-24T00:00:00Z', now);
assert.equal(stale.state, 'STALE');
assert.equal(stale.permission, 'BLOCK');

const unknown = evaluateFreshness(null, now);
assert.equal(unknown.state, 'UNKNOWN');
assert.equal(unknown.permission, 'BLOCK');

const trust = overallTrust({ data: .96, extraction: .91, mapping: .88, entityResolution: .99, validation: 1, calculation: 1, forecast: .64, decision: .79 });
assert.ok(trust > 0.8 && trust < 0.9);
assert.equal(trustAllowsDecision({ data: .96, extraction: .91, mapping: .88, entityResolution: .99, validation: 1, calculation: 1, forecast: .95, decision: .9 }, fresh), true);
assert.equal(trustAllowsDecision({ data: .4, extraction: .9, mapping: .9, entityResolution: .9, validation: 1, calculation: 1, forecast: .9, decision: .9 }, fresh), false);
assert.equal(trustAllowsDecision({ data: .96, extraction: .91, mapping: .88, entityResolution: .99, validation: 1, calculation: 1, forecast: .95, decision: .9 }, stale), false);

let graph: EvidenceGraph = { nodes: [], edges: [] };
for (const node of [
  { id: 'f1', type: 'file', tenantId: 'tenant-a', sourceRef: 'sha256:file' },
  { id: 'p1', type: 'page', tenantId: 'tenant-a', page: 2 },
  { id: 'c1', type: 'cell', tenantId: 'tenant-a', cell: 'D17', value: '1250' },
  { id: 'm1', type: 'metric', tenantId: 'tenant-a', value: 1250 },
  { id: 'd1', type: 'recommendation', tenantId: 'tenant-a' },
] as const) graph = addNode(graph, node);
for (const edge of [
  { from: 'f1', to: 'p1', relation: 'contains' as const },
  { from: 'p1', to: 'c1', relation: 'contains' as const },
  { from: 'c1', to: 'm1', relation: 'supports' as const },
  { from: 'm1', to: 'd1', relation: 'supports' as const },
]) graph = addEdge(graph, edge);

const trace = traceSources(graph, 'd1').map(node => node.id);
assert.deepEqual(new Set(trace), new Set(['d1', 'm1', 'c1', 'p1', 'f1']));
assert.doesNotThrow(() => assertTenantClosed(graph, 'tenant-a'));
assert.throws(() => assertTenantClosed({ ...graph, nodes: [...graph.nodes, { id: 'x', type: 'file', tenantId: 'tenant-b' }] }, 'tenant-a'));

console.log('trust/evidence runtime fixtures: PASS');
