import type { ReportExecutionCheckpoint, ReportExecutionStage } from './checkpoint';
import { buildLineage, consolidateRuntime, chooseScenario, prioritizeDecisions, canAutonomouslyExecute } from '../phase-kl-runtime';

export interface ProductionLifecycleInput {
  jobId: string;
  companyId: string;
  sourceSnapshotId?: string;
  sourceHash: string;
  rows: Array<Record<string, unknown>>;
  now?: string;
}

export interface ProductionLifecycleResult {
  jobId: string;
  sourceHash: string;
  lineage: ReturnType<typeof buildLineage>[];
  consolidation: ReturnType<typeof consolidateRuntime>;
  scenario: ReturnType<typeof chooseScenario>;
  portfolio: ReturnType<typeof prioritizeDecisions>;
  autonomy: ReturnType<typeof canAutonomouslyExecute>;
}

/** Pure orchestration bridge; persistence and leases remain owned by the durable worker store. */
export function runProductionLifecycle(input: ProductionLifecycleInput): ProductionLifecycleResult {
  const lineage = input.rows.map((row, index) => buildLineage([], { key: `${input.jobId}:${index}`, hash: input.sourceHash, value: row }));
  const consolidation = consolidateRuntime(input.rows.map((row, index) => ({
    businessKey: String(row.id ?? row.sku ?? row.invoice_id ?? `${input.jobId}:${index}`),
    sourceId: input.sourceSnapshotId ?? input.sourceHash,
    precedence: 0,
    observedAt: input.now ?? new Date().toISOString(),
    value: row,
  })));
  const scenario = chooseScenario([
    { key: 'base', expectedImpact: 1, risk: 0.2, liquidityRequired: 0, serviceLevel: 1 },
    { key: 'conservative', expectedImpact: 0.9, risk: 0.1, liquidityRequired: 0, serviceLevel: 0.9 },
    { key: 'stress', expectedImpact: 0.75, risk: 0.35, liquidityRequired: 0, serviceLevel: 0.75 },
  ], { maxRisk: 0.35, protectedLiquidity: 0, minimumServiceLevel: 0.75 });
  const portfolio = prioritizeDecisions([{ key: input.jobId, materiality: 1, urgency: 1, confidence: 0.8, risk: scenario?.risk ?? 1 }], 0.35);
  const evidenceQuality = lineage.filter((x) => x?.state !== 'deleted').length / Math.max(1, lineage.length);
  const autonomy = canAutonomouslyExecute({ trustHealthy: true, evidenceQuality, confidence: portfolio[0]?.confidence ?? 0, riskBudgetValid: scenario !== null, criticalDrift: false, rollbackVerified: true, isolationVerified: true });
  return { jobId: input.jobId, sourceHash: input.sourceHash, lineage, consolidation, scenario, portfolio, autonomy };
}

export function assertProductionCheckpoint(checkpoint: ReportExecutionCheckpoint): void {
  const stages: ReportExecutionStage[] = ['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'];
  if (!stages.includes(checkpoint.stage)) throw new Error(`Invalid production stage: ${checkpoint.stage}`);
  if (!checkpoint.jobId || !checkpoint.sourceHash) throw new Error('Checkpoint requires jobId and sourceHash');
}