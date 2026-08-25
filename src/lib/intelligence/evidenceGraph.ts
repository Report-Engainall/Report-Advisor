export type EvidenceNodeType =
  | 'file'
  | 'page'
  | 'table'
  | 'row'
  | 'column'
  | 'cell'
  | 'extracted_value'
  | 'normalized_value'
  | 'entity'
  | 'canonical_record'
  | 'metric'
  | 'report'
  | 'recommendation'
  | 'action'
  | 'outcome';

export interface EvidenceNode {
  id: string;
  type: EvidenceNodeType;
  tenantId: string;
  sourceRef?: string;
  page?: number;
  table?: string;
  row?: number;
  column?: string;
  cell?: string;
  bbox?: [number, number, number, number];
  value?: unknown;
  version?: string;
  snapshotId?: string;
  actorId?: string;
  processId?: string;
  metadata?: Record<string, unknown>;
}

export interface EvidenceEdge {
  from: string;
  to: string;
  relation: 'contains' | 'derived_from' | 'normalized_from' | 'resolved_to' | 'measures' | 'reported_by' | 'supports' | 'caused' | 'resulted_in';
  ruleVersion?: string;
  transformation?: string;
}

export interface EvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

export function addNode(graph: EvidenceGraph, node: EvidenceNode): EvidenceGraph {
  if (graph.nodes.some(existing => existing.id === node.id)) return graph;
  return { ...graph, nodes: [...graph.nodes, node] };
}

export function addEdge(graph: EvidenceGraph, edge: EvidenceEdge): EvidenceGraph {
  if (graph.edges.some(existing => existing.from === edge.from && existing.to === edge.to && existing.relation === edge.relation)) return graph;
  return { ...graph, edges: [...graph.edges, edge] };
}

export function traceSources(graph: EvidenceGraph, targetId: string): EvidenceNode[] {
  const byId = new Map(graph.nodes.map(node => [node.id, node]));
  const reverse = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const parents = reverse.get(edge.to) ?? [];
    parents.push(edge.from);
    reverse.set(edge.to, parents);
  }
  const visited = new Set<string>();
  const queue = [targetId];
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const parent of reverse.get(id) ?? []) queue.push(parent);
  }
  return [...visited].map(id => byId.get(id)).filter((node): node is EvidenceNode => Boolean(node));
}

export function assertTenantClosed(graph: EvidenceGraph, tenantId: string): void {
  for (const node of graph.nodes) {
    if (node.tenantId !== tenantId) throw new Error(`Evidence graph tenant mismatch: ${node.id}`);
  }
}
