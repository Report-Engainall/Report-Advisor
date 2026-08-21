import type { CandidateMeaning, ColumnProfile, PrimitiveKind } from './schema-discovery';
import { normalizeHeader } from './schema-discovery';
import { classifyConfidence, type Criticality } from './validation';

export type ColumnRelationship = {
  leftIndex: number;
  rightIndex: number;
  strength: number;
  evidence: string[];
};

export type SchemaRelationshipGraph = {
  columns: ColumnProfile[];
  relationships: ColumnRelationship[];
  components: number[][];
};

export type TableClassification = {
  kind: 'invoice' | 'inventory' | 'catalog' | 'customer' | 'supplier' | 'transaction' | 'unknown';
  score: number;
  evidence: string[];
};

export type HeaderlessInference = {
  columnIndex: number;
  field: string | undefined;
  confidence: number;
  evidence: string[];
};

export type EntityCandidate = {
  id: string;
  score: number;
  evidence: string[];
};

export type EntityResolution = {
  canonicalField: string;
  sourceValue: string;
  match: EntityCandidate | null;
  action: 'MATCH' | 'REVIEW' | 'QUARANTINE';
};

export type IdempotencyEnvelope = {
  key: string;
  sourceHash: string;
  tenantKey: string;
  entity: string;
  naturalKey: string;
};

export type ReviewDecision = {
  status: 'AUTO_APPROVE' | 'REVIEW' | 'QUARANTINE';
  reason: string;
  confidence: number;
  criticality: Criticality;
  evidence: string[];
};

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function tokenSet(value: string): Set<string> {
  return new Set(normalizeHeader(value).split(' ').filter(Boolean));
}

function jaccard(a: string, b: string): number {
  const left = tokenSet(a);
  const right = tokenSet(b);
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection++;
  return intersection / (left.size + right.size - intersection);
}

function candidateFields(profile: ColumnProfile): Set<string> {
  return new Set(profile.candidates.slice(0, 3).map(candidate => candidate.field));
}

export function buildRelationshipGraph(profiles: ColumnProfile[]): SchemaRelationshipGraph {
  const relationships: ColumnRelationship[] = [];
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const left = profiles[i];
      const right = profiles[j];
      const leftFields = candidateFields(left);
      const rightFields = candidateFields(right);
      const shared = [...leftFields].filter(field => rightFields.has(field));
      const complementary =
        (leftFields.has('product_code') && (rightFields.has('product_name') || rightFields.has('quantity') || rightFields.has('unit_price'))) ||
        (rightFields.has('product_code') && (leftFields.has('product_name') || leftFields.has('quantity') || leftFields.has('unit_price'))) ||
        (leftFields.has('invoice_number') && (rightFields.has('invoice_date') || rightFields.has('total_amount'))) ||
        (rightFields.has('invoice_number') && (leftFields.has('invoice_date') || leftFields.has('total_amount')));
      const headerSimilarity = jaccard(left.normalizedHeader, right.normalizedHeader);
      const strength = clamp(shared.length * 0.22 + (complementary ? 0.52 : 0) + headerSimilarity * 0.18);
      if (strength >= 0.35) {
        relationships.push({
          leftIndex: left.index,
          rightIndex: right.index,
          strength,
          evidence: [
            ...(shared.length ? [`shared-field:${shared.join(',')}`] : []),
            ...(complementary ? ['complementary-canonical-fields'] : []),
            ...(headerSimilarity >= 0.5 ? ['header-similarity'] : []),
          ],
        });
      }
    }
  }

  const parent = profiles.map((_, index) => index);
  const find = (value: number): number => {
    let root = value;
    while (parent[root] !== root) root = parent[root];
    while (parent[value] !== value) {
      const next = parent[value];
      parent[value] = root;
      value = next;
    }
    return root;
  };
  const union = (a: number, b: number) => {
    const left = find(a);
    const right = find(b);
    if (left !== right) parent[right] = left;
  };
  for (const relation of relationships) union(relation.leftIndex, relation.rightIndex);
  const groups = new Map<number, number[]>();
  profiles.forEach(profile => {
    const root = find(profile.index);
    const group = groups.get(root) ?? [];
    group.push(profile.index);
    groups.set(root, group);
  });

  return { columns: profiles, relationships, components: [...groups.values()] };
}

export function classifyTable(profiles: ColumnProfile[], headers: unknown[] = []): TableClassification {
  const fields = new Set(profiles.flatMap(candidateFields));
  const headerText = normalizeHeader(headers.filter(Boolean).join(' '));
  const signals: Array<[TableClassification['kind'], number, string]> = [
    ['invoice', Number(fields.has('invoice_number')) * 0.32 + Number(fields.has('invoice_date')) * 0.18 + Number(fields.has('total_amount')) * 0.25, 'invoice-fields'],
    ['inventory', Number(fields.has('product_code')) * 0.25 + Number(fields.has('quantity')) * 0.45 + Number(fields.has('warehouse_id')) * 0.20, 'inventory-fields'],
    ['catalog', Number(fields.has('product_code')) * 0.30 + Number(fields.has('product_name')) * 0.30 + Number(fields.has('unit')) * 0.18, 'catalog-fields'],
    ['customer', Number(fields.has('customer_id')) * 0.55 + Number(headerText.includes('customer') || headerText.includes('عميل')) * 0.25, 'customer-fields'],
    ['supplier', Number(fields.has('supplier_id')) * 0.55 + Number(headerText.includes('supplier') || headerText.includes('مورد')) * 0.25, 'supplier-fields'],
    ['transaction', Number(fields.has('quantity')) * 0.18 + Number(fields.has('unit_price')) * 0.22 + Number(fields.has('total_amount')) * 0.28, 'transaction-fields'],
  ];
  const best = signals.sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] < 0.35) return { kind: 'unknown', score: 0, evidence: ['insufficient-structural-evidence'] };
  return { kind: best[0], score: clamp(best[1]), evidence: [best[2]] };
}

function inferFromContent(profile: ColumnProfile): HeaderlessInference {
  const candidates = profile.candidates[0];
  if (candidates) return { columnIndex: profile.index, field: candidates.field, confidence: clamp(candidates.score * 0.78), evidence: [...candidates.evidence, 'candidate-without-header'] };
  const patterns = new Set(profile.patterns);
  if (patterns.has('identifier-like') && profile.uniqueRatio > 0.7) {
    return { columnIndex: profile.index, field: 'product_code', confidence: 0.58, evidence: ['identifier-like', 'high-uniqueness'] };
  }
  if (profile.numericRatio > 0.9 && profile.uniqueRatio < 0.45) {
    return { columnIndex: profile.index, field: 'quantity', confidence: 0.48, evidence: ['numeric', 'low-cardinality'] };
  }
  return { columnIndex: profile.index, field: undefined, confidence: 0, evidence: ['no-safe-inference'] };
}

export function inferHeaderlessSchema(profiles: ColumnProfile[], graph = buildRelationshipGraph(profiles)): HeaderlessInference[] {
  const inferred = profiles.map(inferFromContent);
  for (const item of inferred) {
    if (item.field) continue;
    const related = graph.relationships.filter(relation => relation.leftIndex === item.columnIndex || relation.rightIndex === item.columnIndex);
    const strongest = related.sort((a, b) => b.strength - a.strength)[0];
    if (!strongest) continue;
    const otherIndex = strongest.leftIndex === item.columnIndex ? strongest.rightIndex : strongest.leftIndex;
    const other = inferred.find(candidate => candidate.columnIndex === otherIndex);
    if (other?.field === 'product_code') {
      item.field = 'product_name';
      item.confidence = clamp(strongest.strength * 0.82);
      item.evidence = ['relationship-to-product-code', ...strongest.evidence];
    }
  }
  return inferred;
}

export function resolveEntity(
  canonicalField: string,
  sourceValue: unknown,
  records: Array<{ id: string; value: unknown }>,
  minimumMatch = 0.86,
): EntityResolution {
  const original = String(sourceValue ?? '').trim();
  if (!original) return { canonicalField, sourceValue: original, match: null, action: 'QUARANTINE' };
  let best: EntityCandidate | null = null;
  for (const record of records) {
    const candidate = String(record.value ?? '').trim();
    if (!candidate) continue;
    const normalizedOriginal = normalizeHeader(original);
    const normalizedCandidate = normalizeHeader(candidate);
    const exact = normalizedOriginal === normalizedCandidate ? 1 : 0;
    const similarity = exact || jaccard(normalizedOriginal, normalizedCandidate);
    const score = clamp(exact ? 1 : similarity);
    if (!best || score > best.score) {
      best = { id: record.id, score, evidence: exact ? ['normalized-exact-match'] : ['token-similarity'] };
    }
  }
  if (!best) return { canonicalField, sourceValue: original, match: null, action: 'QUARANTINE' };
  const action = best.score >= minimumMatch ? 'MATCH' : best.score >= 0.72 ? 'REVIEW' : 'QUARANTINE';
  return { canonicalField, sourceValue: original, match: best, action };
}

function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function buildIdempotencyEnvelope(input: Omit<IdempotencyEnvelope, 'key'>): IdempotencyEnvelope {
  const canonical = [input.tenantKey, input.entity, normalizeHeader(input.naturalKey), input.sourceHash].join('|');
  return { ...input, naturalKey: normalizeHeader(input.naturalKey), key: `di:${fnv1a(canonical)}` };
}

export function decideReview(input: { confidence: number; criticality: Criticality; evidence?: string[] }): ReviewDecision {
  const status = classifyConfidence(input.confidence, input.criticality);
  const reason = status === 'AUTO_APPROVE'
    ? 'Evidence exceeds the criticality-specific approval threshold.'
    : status === 'REVIEW'
      ? 'Evidence is plausible but requires human confirmation.'
      : 'Evidence is insufficient for safe production routing.';
  return { status, reason, confidence: clamp(input.confidence), criticality: input.criticality, evidence: input.evidence ?? [] };
}

export function inferPrimitiveFromValues(values: unknown[]): PrimitiveKind {
  const nonEmpty = values.filter(value => value !== null && value !== undefined && String(value).trim() !== '');
  if (!nonEmpty.length) return 'empty';
  const numeric = nonEmpty.filter(value => /^-?\d+(?:[.,]\d+)?%?$/.test(String(value).trim())).length;
  const boolean = nonEmpty.filter(value => /^(true|false|yes|no|نعم|لا)$/i.test(String(value).trim())).length;
  if (numeric === nonEmpty.length) return 'number';
  if (boolean === nonEmpty.length) return 'boolean';
  return 'string';
}
