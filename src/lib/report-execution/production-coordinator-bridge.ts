import type { ReportExecutionCheckpoint, ReportExecutionStage } from './checkpoint';
import {
  consolidateRuntime,
  chooseScenario,
  prioritizeDecisions,
  canAutonomouslyExecute,
  type RuntimeEvidence,
} from '../phase-kl-runtime';
import { diffRows, type AutonomyGateInput, type PortfolioCandidate, type RiskBudget, type RowVersion, type ScenarioOption, type SourceCandidate } from '../production-intelligence';

export interface ProductionLifecycleInput<T = unknown> {
  jobId: string;
  companyId: string;
  sourceSnapshotId?: string;
  sourceHash: string;
  previousRows: RowVersion<T>[];
  currentRows: RowVersion<T>[];
  sourceCandidates: SourceCandidate<T>[];
  scenarioOptions: ScenarioOption[];
  riskBudget: RiskBudget;
  portfolioCandidates: PortfolioCandidate[];
  autonomy: AutonomyGateInput;
  evidence: RuntimeEvidence[];
}

export interface ProductionLifecycleResult<T = unknown> {
  jobId: string;
  companyId: string;
  sourceHash: string;
  lineage: ReturnType<typeof diffRows<T>>;
  consolidation: ReturnType<typeof consolidateRuntime<T>>;
  scenario: ReturnType<typeof chooseScenario>;
  portfolio: ReturnType<typeof prioritizeDecisions>;
  autonomy: ReturnType<typeof canAutonomouslyExecute>;
}

/**
 * Pure integration bridge. Durable persistence/leases remain owned by the
 * worker store. Domain engines supply evidence, scenarios and candidates;
 * this bridge never invents business values or silently enables autonomy.
 */
export function runProductionLifecycle<T>(input: ProductionLifecycleInput<T>): ProductionLifecycleResult<T> {
  if (!input.companyId || !input.jobId || !input.sourceHash) throw new Error('Production lifecycle requires tenant, job and source identity');
  if (!input.currentRows.length) throw new Error('Production lifecycle requires authoritative current rows');
  if (!input.evidence.length) throw new Error('Production lifecycle requires runtime evidence');

  const lineage = diffRows(input.previousRows, input.currentRows);
  const consolidation = consolidateRuntime(input.sourceCandidates);
  const scenario = chooseScenario(input.scenarioOptions, input.riskBudget);
  const portfolio = prioritizeDecisions(input.portfolioCandidates, input.riskBudget.maxRisk);
  const autonomy = canAutonomouslyExecute(input.autonomy);

  return { jobId: input.jobId, companyId: input.companyId, sourceHash: input.sourceHash, lineage, consolidation, scenario, portfolio, autonomy };
}

export function assertProductionCheckpoint(checkpoint: ReportExecutionCheckpoint): void {
  const stages: ReportExecutionStage[] = ['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'];
  if (!stages.includes(checkpoint.stage)) throw new Error(`Invalid production stage: ${checkpoint.stage}`);
  if (!checkpoint.jobId || !checkpoint.sourceHash) throw new Error('Checkpoint requires jobId and sourceHash');
}
