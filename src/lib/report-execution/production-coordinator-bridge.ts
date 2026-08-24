import type { ReportExecutionCheckpoint, ReportExecutionStage } from './checkpoint';
import { PhaseKLRuntime } from '../phase-kl-runtime';

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
  lineage: ReturnType<PhaseKLRuntime['buildRowLineage']>;
  consolidation: ReturnType<PhaseKLRuntime['consolidateChronologically']>;
  scenario: ReturnType<PhaseKLRuntime['selectBoundedScenario']>;
  portfolio: ReturnType<PhaseKLRuntime['rankDecisionPortfolio']>;
  autonomy: ReturnType<PhaseKLRuntime['evaluateAutonomy']>;
}

/**
 * Pure orchestration bridge. Persistence/leases remain owned by the durable
 * worker store; this layer only composes governed K/L decisions and evidence.
 */
export function runProductionLifecycle(input: ProductionLifecycleInput): ProductionLifecycleResult {
  const runtime = new PhaseKLRuntime();
  const lineage = runtime.buildRowLineage(input.rows, input.sourceHash);
  const consolidation = runtime.consolidateChronologically([{ sourceHash: input.sourceHash, rows: input.rows }]);
  const scenario = runtime.selectBoundedScenario({
    baseValue: Math.max(0, input.rows.length),
    alternatives: [
      { key: 'base', multiplier: 1, risk: 0.2 },
      { key: 'conservative', multiplier: 0.9, risk: 0.1 },
      { key: 'stress', multiplier: 0.75, risk: 0.35 },
    ],
    riskBudget: 0.35,
    protectedLiquidity: 0,
    minimumServiceLevel: 0.75,
  });
  const portfolio = runtime.rankDecisionPortfolio([
    { key: input.jobId, materiality: 1, urgency: 1, confidence: 0.8, risk: scenario.risk },
  ]);
  const autonomy = runtime.evaluateAutonomy({
    domain: 'report-execution',
    confidence: portfolio[0]?.confidence ?? 0,
    evidenceQuality: lineage.filter((x) => x.status !== 'quarantined').length / Math.max(1, lineage.length),
    risk: scenario.risk,
    rollbackAvailable: true,
    continuousTrustHealthy: true,
    criticalDrift: false,
  });
  return { jobId: input.jobId, sourceHash: input.sourceHash, lineage, consolidation, scenario, portfolio, autonomy };
}

export function assertProductionCheckpoint(checkpoint: ReportExecutionCheckpoint): void {
  const stages: ReportExecutionStage[] = ['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'];
  if (!stages.includes(checkpoint.stage)) throw new Error(`Invalid production stage: ${checkpoint.stage}`);
  if (!checkpoint.jobId || !checkpoint.sourceHash) throw new Error('Checkpoint requires jobId and sourceHash');
}
