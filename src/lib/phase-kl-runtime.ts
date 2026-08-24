import { advanceCheckpoint, type ReportExecutionCheckpoint, type ReportCheckpointStage } from './report-execution/checkpoint';
import { consolidateByPrecedence, diffRows, evaluateAutonomyGate, rankPortfolio, selectBoundedScenario, type PortfolioCandidate, type RiskBudget, type RowVersion, type ScenarioOption, type SourceCandidate } from './production-intelligence';

export interface RuntimeEvidence { key: string; source?: string; quality: number; details?: Record<string, unknown>; }
export interface RuntimeState<T = unknown> {
  sourceHash: string;
  checkpoint: ReportExecutionCheckpoint;
  rows: RowVersion<T>[];
  evidence: RuntimeEvidence[];
}

export function advanceRuntime<T>(state: RuntimeState<T>, stage: ReportCheckpointStage, evidence: RuntimeEvidence[], metadata: Omit<ReportExecutionCheckpoint, 'stage'|'updatedAt'|'sourceHash'|'evidenceKeys'> = {}): RuntimeState<T> {
  const next = advanceCheckpoint(state.checkpoint, {
    stage,
    sourceHash: state.sourceHash,
    evidenceKeys: evidence.map((item) => item.key),
    ...metadata,
  });
  return { ...state, checkpoint: next, evidence: [...state.evidence, ...evidence.filter((item) => item.quality >= 0)] };
}

export function buildLineage<T>(previous: RowVersion<T>[], current: RowVersion<T>) {
  return diffRows(previous, [current])[0];
}

export function consolidateRuntime<T>(items: SourceCandidate<T>[]) {
  return consolidateByPrecedence(items);
}

export function chooseScenario(options: ScenarioOption[], budget: RiskBudget) {
  return selectBoundedScenario(options, budget);
}

export function prioritizeDecisions(candidates: PortfolioCandidate[], maxRisk: number) {
  return rankPortfolio(candidates, maxRisk);
}

export function evidenceQuality(evidence: RuntimeEvidence[]) {
  if (!evidence.length) return 0;
  return evidence.reduce((sum, item) => sum + Math.max(0, Math.min(1, item.quality)), 0) / evidence.length;
}

export function canAutonomouslyExecute(input: Parameters<typeof evaluateAutonomyGate>[0]) {
  return evaluateAutonomyGate(input);
}
