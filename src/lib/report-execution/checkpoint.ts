export type ReportCheckpointStage = 'queued' | 'fingerprinted' | 'extracted' | 'canonicalized' | 'validated' | 'analyzed' | 'decisioned' | 'committed' | 'rendered';

export interface ReportExecutionCheckpoint {
  stage: ReportCheckpointStage;
  sourceHash: string;
  artifactHash?: string;
  rowCount?: number;
  evidenceKeys: string[];
  updatedAt: number;
}

const ORDER: ReportCheckpointStage[] = ['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'];

export function canAdvanceCheckpoint(from: ReportCheckpointStage, to: ReportCheckpointStage): boolean {
  return ORDER.indexOf(to) === ORDER.indexOf(from) + 1;
}

export function advanceCheckpoint(current: ReportExecutionCheckpoint, next: Omit<ReportExecutionCheckpoint, 'updatedAt'>): ReportExecutionCheckpoint {
  if (!canAdvanceCheckpoint(current.stage, next.stage)) throw new Error(`Invalid checkpoint transition: ${current.stage} -> ${next.stage}`);
  if (next.sourceHash !== current.sourceHash) throw new Error('Checkpoint source hash cannot change during a run');
  const evidenceKeys = [...new Set([...current.evidenceKeys, ...next.evidenceKeys])].sort();
  return { ...next, evidenceKeys, updatedAt: Date.now() };
}

export function resumeFromCheckpoint(checkpoint: ReportExecutionCheckpoint): ReportCheckpointStage {
  return checkpoint.stage;
}
