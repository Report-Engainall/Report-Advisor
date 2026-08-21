export type EntityReference = {
  field: string;
  value: string;
  normalized: string;
  sourceRow?: number;
};

export type EntityMatch = {
  entityId?: string;
  score: number;
  method: 'exact' | 'composite' | 'fuzzy' | 'unresolved';
  evidence: string[];
  reviewRequired: boolean;
};

export type IdempotencyRecord = {
  key: string;
  sourceHash: string;
  rowFingerprint: string;
};

export type ReviewRecord = {
  id: string;
  field: string;
  status: 'review' | 'quarantined' | 'approved';
  score: number;
  evidence: string[];
  createdAt: string;
};

export type AccountingReconciliation = {
  passed: boolean;
  expected: number;
  actual: number;
  difference: number;
  tolerance: number;
  issues: string[];
};

export type InventoryReconciliation = {
  passed: boolean;
  expectedQuantity: number;
  actualQuantity: number;
  difference: number;
  tolerance: number;
  issues: string[];
};

function normalize(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenJaccard(a: string, b: string): number {
  const aa = new Set(a.split(' ').filter(Boolean));
  const bb = new Set(b.split(' ').filter(Boolean));
  const union = new Set([...aa, ...bb]).size;
  if (!union) return 0;
  return [...aa].filter(token => bb.has(token)).length / union;
}

/** Resolve against existing approved company data without inventing an entity. */
export function resolveEntity(reference: Record<string, unknown>, candidates: Array<Record<string, unknown>>): EntityMatch {
  const referenceValues = Object.entries(reference).map(([field, value]) => ({ field, value: normalize(value) })).filter(x => x.value);
  if (!referenceValues.length || !candidates.length) return { score: 0, method: 'unresolved', evidence: ['no-reference-or-candidates'], reviewRequired: true };

  let best: EntityMatch = { score: 0, method: 'unresolved', evidence: [], reviewRequired: true };
  for (const candidate of candidates) {
    const exactFields = referenceValues.filter(item => normalize(candidate[item.field]) === item.value);
    const fuzzyScores = referenceValues.map(item => tokenJaccard(item.value, normalize(candidate[item.field]))).filter(score => score > 0);
    const exactScore = exactFields.length / referenceValues.length;
    const fuzzyScore = fuzzyScores.length ? fuzzyScores.reduce((a, b) => a + b, 0) / fuzzyScores.length : 0;
    const score = Math.min(0.99, exactScore * 0.7 + fuzzyScore * 0.3);
    if (score > best.score) {
      const entityId = candidate.id === undefined ? undefined : String(candidate.id);
      best = {
        entityId,
        score,
        method: exactScore === 1 ? 'exact' : exactFields.length ? 'composite' : 'fuzzy',
        evidence: [
          ...(exactFields.length ? [`exact-fields:${exactFields.map(x => x.field).join(',')}`] : []),
          ...(fuzzyScore ? [`token-similarity:${fuzzyScore.toFixed(3)}`] : []),
        ],
        reviewRequired: score < 0.9 || !entityId,
      };
    }
  }
  return best;
}

/** Deterministic fingerprint used to prevent duplicate commits across retries. */
export function buildIdempotencyKey(sourceHash: string, row: Record<string, unknown>, identityFields: string[] = []): string {
  const fields = (identityFields.length ? identityFields : Object.keys(row).sort())
    .sort()
    .map(field => `${field}=${normalize(row[field])}`)
    .join('|');
  const input = `${sourceHash}|${fields}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `di-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function reconcileAccounting(expected: number, actual: number, absoluteTolerance = 0.02, relativeTolerance = 0.0005): AccountingReconciliation {
  const difference = actual - expected;
  const tolerance = Math.max(absoluteTolerance, Math.abs(expected) * relativeTolerance);
  return { passed: Math.abs(difference) <= tolerance, expected, actual, difference, tolerance, issues: Math.abs(difference) <= tolerance ? [] : ['ACCOUNTING_RECONCILIATION_MISMATCH'] };
}

export function reconcileInventory(expectedQuantity: number, actualQuantity: number, tolerance = 0): InventoryReconciliation {
  const difference = actualQuantity - expectedQuantity;
  return { passed: Math.abs(difference) <= tolerance, expectedQuantity, actualQuantity, difference, tolerance, issues: Math.abs(difference) <= tolerance ? [] : ['INVENTORY_RECONCILIATION_MISMATCH'] };
}

export function createReviewRecord(field: string, score: number, evidence: string[], status: ReviewRecord['status'] = score < 0.6 ? 'quarantined' : 'review'): ReviewRecord {
  const id = buildIdempotencyKey(`${field}:${score.toFixed(6)}`, { field, evidence: [...evidence].sort() });
  return { id, field, status, score, evidence: [...new Set(evidence)], createdAt: new Date().toISOString() };
}
