import { buildIdempotencyKey } from './entity-resolution';
import type { RoutingDecision } from './routing';

export type TransactionRow = Record<string, unknown>;

export type TransactionAdapter = {
  begin: (tenantId: string) => Promise<void>;
  upsert: (destination: string, rows: TransactionRow[], idempotencyKeys: string[]) => Promise<void>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
};

export type TransactionPlan = {
  tenantId: string;
  approved: boolean;
  quarantine: TransactionRow[];
  writes: Array<{ destination: string; rows: TransactionRow[]; idempotencyKeys: string[] }>;
  reasons: string[];
};

/** Build a write plan first. This keeps parsing/routing separate from durable writes. */
export function buildTransactionPlan(
  tenantId: string,
  rows: TransactionRow[],
  decisions: RoutingDecision[],
  sourceHash: string,
): TransactionPlan {
  const reasons: string[] = [];
  const quarantine: TransactionRow[] = [];
  const writes = new Map<string, { rows: TransactionRow[]; idempotencyKeys: string[] }>();
  const blocking = decisions.filter(d => d.action === 'UNMAPPED' || d.action === 'QUARANTINE');
  if (blocking.length) reasons.push(`blocking-routes:${blocking.map(d => d.canonicalField).join(',')}`);

  for (const row of rows) {
    if (blocking.length) {
      quarantine.push(row);
      continue;
    }
    for (const decision of decisions) {
      if (decision.action !== 'AUTO_APPROVE') continue;
      const bucket = writes.get(decision.destination) ?? { rows: [], idempotencyKeys: [] };
      bucket.rows.push(row);
      bucket.idempotencyKeys.push(buildIdempotencyKey(sourceHash, row, [decision.canonicalField]));
      writes.set(decision.destination, bucket);
    }
  }

  return {
    tenantId,
    approved: blocking.length === 0 && rows.length > 0,
    quarantine,
    writes: [...writes.entries()].map(([destination, value]) => ({ destination, ...value })),
    reasons,
  };
}

/** Execute only an already-approved plan; every failure rolls the transaction back. */
export async function executeTransactionPlan(adapter: TransactionAdapter, plan: TransactionPlan): Promise<void> {
  if (!plan.approved) throw new Error(`IMPORT_PLAN_NOT_APPROVED:${plan.reasons.join('|')}`);
  await adapter.begin(plan.tenantId);
  try {
    for (const write of plan.writes) {
      await adapter.upsert(write.destination, write.rows, write.idempotencyKeys);
    }
    await adapter.commit();
  } catch (error) {
    await adapter.rollback();
    throw error;
  }
}
