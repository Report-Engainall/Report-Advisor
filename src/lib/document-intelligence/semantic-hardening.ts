import type { ColumnProfile, CandidateMeaning } from './schema-discovery';

export type RelationshipKind = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'lookup' | 'derived';

export type ColumnRelationship = {
  leftIndex: number;
  rightIndex: number;
  kind: RelationshipKind;
  strength: number;
  evidence: string[];
};

export type HeaderlessInference = {
  columnIndex: number;
  field?: string;
  score: number;
  evidence: string[];
};

export type TableClassification = {
  kind: 'transaction' | 'master' | 'summary' | 'lookup' | 'unknown';
  score: number;
  evidence: string[];
};

export type EvidenceFusion = {
  field: string;
  score: number;
  evidence: string[];
  decision: 'accept' | 'review' | 'quarantine';
};

const FIELD_HINTS: Record<string, string[]> = {
  product_code: ['product_code', 'barcode', 'sku'],
  product_name: ['product_name'],
  quantity: ['quantity'],
  unit_price: ['unit_price'],
  total_amount: ['total_amount'],
  invoice_number: ['invoice_number'],
  invoice_date: ['invoice_date'],
  customer_id: ['customer_id'],
  supplier_id: ['supplier_id'],
  warehouse_id: ['warehouse_id'],
};

function candidate(profile: ColumnProfile, field: string): CandidateMeaning | undefined {
  return profile.candidates.find(item => item.field === field);
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.8;
  const aa = new Set(a.split(/\s+/).filter(Boolean));
  const bb = new Set(b.split(/\s+/).filter(Boolean));
  const intersection = [...aa].filter(token => bb.has(token)).length;
  return intersection / Math.max(new Set([...aa, ...bb]).size, 1);
}

/** Infer semantic fields when headers are missing or unreliable. */
export function inferHeaderlessSchema(profiles: ColumnProfile[]): HeaderlessInference[] {
  return profiles.map(profile => {
    const ranked = Object.keys(FIELD_HINTS)
      .map(field => {
        const direct = candidate(profile, field)?.score ?? 0;
        const hint = FIELD_HINTS[field].some(token => similarity(profile.normalizedHeader, token) > 0.75) ? 0.18 : 0;
        let structural = 0;
        if (field === 'quantity' && profile.numericRatio > 0.85 && profile.uniqueRatio < 0.95) structural += 0.18;
        if (field === 'unit_price' && profile.numericRatio > 0.85 && (profile.min ?? 0) >= 0) structural += 0.14;
        if (field === 'product_code' && profile.patterns.includes('identifier-like')) structural += 0.22;
        if (field === 'invoice_date' && profile.dateRatio > 0.8) structural += 0.25;
        if (field === 'product_name' && profile.primitiveKind === 'string' && profile.averageLength > 3) structural += 0.12;
        return { field, score: Math.min(0.99, direct + hint + structural) };
      })
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const evidence: string[] = [];
    if (candidate(profile, best.field)) evidence.push('existing-semantic-candidate');
    if (profile.patterns.length) evidence.push(`patterns:${profile.patterns.join(',')}`);
    if (!profile.originalHeader) evidence.push('headerless');
    return { columnIndex: profile.index, field: best.score >= 0.58 ? best.field : undefined, score: best.score, evidence };
  });
}

/** Build a lightweight relationship graph from identifier-like and repeated-value columns. */
export function inferColumnRelationships(profiles: ColumnProfile[]): ColumnRelationship[] {
  const relationships: ColumnRelationship[] = [];
  for (let i = 0; i < profiles.length; i += 1) {
    for (let j = i + 1; j < profiles.length; j += 1) {
      const a = profiles[i];
      const b = profiles[j];
      const aField = a.candidates[0]?.field;
      const bField = b.candidates[0]?.field;
      if (!aField || !bField) continue;
      const identifierPair = /(_id|code|barcode)$/.test(aField) && /(_id|code|barcode)$/.test(bField);
      const sharedDomain = aField === bField || (aField.endsWith('_id') && bField.includes(aField.replace('_id', '')));
      if (!identifierPair && !sharedDomain) continue;
      const strength = Math.min(0.98, 0.45 + (a.uniqueRatio > 0.8 ? 0.15 : 0) + (b.uniqueRatio > 0.8 ? 0.15 : 0) + (a.nonEmptyRatio > 0.9 && b.nonEmptyRatio > 0.9 ? 0.15 : 0));
      const kind: RelationshipKind = a.uniqueRatio > 0.8 && b.uniqueRatio <= 0.8 ? 'one-to-many' : b.uniqueRatio > 0.8 && a.uniqueRatio <= 0.8 ? 'many-to-one' : 'lookup';
      relationships.push({ leftIndex: a.index, rightIndex: b.index, kind, strength, evidence: [`fields:${aField},${bField}`, 'cardinality-profile'] });
    }
  }
  return relationships.sort((a, b) => b.strength - a.strength);
}

/** Classify a table/page before routing it into business entities. */
export function classifyTable(profiles: ColumnProfile[]): TableClassification {
  const fields = new Set(profiles.flatMap(p => p.candidates.slice(0, 2).map(c => c.field)));
  const evidence: string[] = [];
  let transaction = 0;
  let master = 0;
  let summary = 0;
  let lookup = 0;
  if (fields.has('invoice_number')) { transaction += 0.35; evidence.push('invoice-number'); }
  if (fields.has('invoice_date')) { transaction += 0.2; evidence.push('invoice-date'); }
  if (fields.has('quantity') && fields.has('unit_price')) { transaction += 0.25; evidence.push('quantity-price-pair'); }
  if (fields.has('product_code') && fields.has('product_name')) { master += 0.35; evidence.push('product-master-pair'); }
  if (fields.has('customer_id') || fields.has('supplier_id')) { master += 0.2; lookup += 0.2; evidence.push('party-identifier'); }
  if (fields.has('total_amount') && !fields.has('quantity')) { summary += 0.3; evidence.push('aggregate-total'); }
  if (profiles.some(p => p.patterns.includes('low-cardinality'))) { lookup += 0.15; evidence.push('low-cardinality'); }
  const scores = { transaction, master, summary, lookup };
  const [kind, score] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0] ?? ['unknown', 0];
  return { kind: score >= 0.35 ? kind as TableClassification['kind'] : 'unknown', score: Math.min(score, 0.99), evidence };
}

/** Fuse semantic, structural and relationship evidence; never auto-approve weak matches. */
export function fuseEvidence(profile: ColumnProfile, inferred?: HeaderlessInference, relationshipStrength = 0): EvidenceFusion[] {
  const candidates = new Map<string, { score: number; evidence: string[] }>();
  for (const item of profile.candidates) candidates.set(item.field, { score: item.score, evidence: [...item.evidence] });
  if (inferred?.field) {
    const current = candidates.get(inferred.field) ?? { score: 0, evidence: [] };
    current.score = Math.min(0.99, Math.max(current.score, inferred.score) + 0.08 * relationshipStrength);
    current.evidence.push(...inferred.evidence);
    candidates.set(inferred.field, current);
  }
  return [...candidates.entries()]
    .map(([field, item]) => ({
      field,
      score: Math.min(0.99, item.score),
      evidence: [...new Set(item.evidence)],
      decision: item.score >= 0.85 ? 'accept' : item.score >= 0.6 ? 'review' : 'quarantine',
    }))
    .sort((a, b) => b.score - a.score);
}
