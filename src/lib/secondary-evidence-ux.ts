export type EvidenceStatus = 'verified' | 'partial' | 'insufficient' | 'unknown' | 'blocked';
export type WorkspaceState = 'LOADING' | 'READY' | 'EMPTY' | 'ERROR' | 'UNKNOWN' | 'BLOCKED';

export interface EvidenceNode {
  kind: 'file' | 'page' | 'table' | 'row' | 'column' | 'cell' | 'extracted' | 'normalized' | 'entity' | 'canonical' | 'metric' | 'report' | 'decision' | 'action' | 'outcome';
  id: string;
  label: string;
  value?: string | number | null;
  sourceRef?: string;
  status?: EvidenceStatus;
}

export interface EvidenceTrail {
  nodes: EvidenceNode[];
  status: WorkspaceState;
  message?: string;
}

export interface TrustDimensions {
  data?: number;
  extraction?: number;
  mapping?: number;
  entityResolution?: number;
  validation?: number;
  calculation?: number;
  forecast?: number;
  decision?: number;
  overall?: number;
  explanation?: string;
}

export interface DecisionReplayModel {
  decisionId: string;
  snapshot?: string;
  metrics: Array<{ id: string; label: string; value: string | number | null; delta?: string; status?: 'changed' | 'unchanged' | 'unknown' }>;
  evidence: EvidenceNode[];
  rulesVersion?: string;
  modelVersion?: string;
  trust: TrustDimensions;
  recommendation?: string;
  approval?: string;
  action?: string;
  expectedImpact?: string;
  actualOutcome?: string;
  state: WorkspaceState;
}

export interface ReportSnapshotModel {
  reportId: string;
  snapshotId: string;
  dataAsOf?: string;
  metricVersion?: string;
  rulesVersion?: string;
  mappingVersion?: string;
  filters?: Record<string, string | number | boolean>;
  evidence?: EvidenceNode[];
  trust?: TrustDimensions;
  generatedAt?: string;
  state: WorkspaceState;
}

export interface SnapshotDiffItem {
  key: string;
  label: string;
  before: string | number | boolean | null | undefined;
  after: string | number | boolean | null | undefined;
  status: 'changed' | 'unchanged' | 'unknown';
}

export function diffScalar<T extends string | number | boolean | null | undefined>(key: string, label: string, before: T, after: T): SnapshotDiffItem {
  if (before === undefined || after === undefined) return { key, label, before, after, status: 'unknown' };
  return { key, label, before, after, status: Object.is(before, after) ? 'unchanged' : 'changed' };
}

export function diffSnapshotMetadata(before: ReportSnapshotModel, after: ReportSnapshotModel): SnapshotDiffItem[] {
  return [
    diffScalar('dataAsOf', 'Data As Of', before.dataAsOf, after.dataAsOf),
    diffScalar('metricVersion', 'Metric Version', before.metricVersion, after.metricVersion),
    diffScalar('rulesVersion', 'Rules Version', before.rulesVersion, after.rulesVersion),
    diffScalar('mappingVersion', 'Mapping Version', before.mappingVersion, after.mappingVersion),
    diffScalar('generatedAt', 'Generated Time', before.generatedAt, after.generatedAt),
  ];
}

export function formatTrust(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return 'UNKNOWN';
  return `${Math.round(Math.max(0, Math.min(100, value)))}%`;
}
