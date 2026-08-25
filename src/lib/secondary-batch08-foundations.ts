/**
 * Batch 08 — isolated governance/presentation contracts.
 *
 * This module deliberately contains no persistence, metric calculations,
 * authorization, AI provider calls, or action execution. It consumes
 * authoritative values when the primary runtime supplies them and preserves
 * UNKNOWN/NOT_CONFIGURED/BLOCKED states otherwise.
 */

export type SurfaceStatus =
  | 'LIVE'
  | 'UNKNOWN'
  | 'NOT_CONFIGURED'
  | 'BLOCKED'
  | 'ERROR'
  | 'EMPTY';

export interface EvidenceGraphLink {
  sourceId?: string;
  evidenceId?: string;
  snapshotId?: string;
  lineageId?: string;
  metricId?: string;
  decisionId?: string;
  status: SurfaceStatus;
}

export interface MetricDefinitionView {
  metricId: string;
  name: string;
  formula?: string;
  source?: string;
  dimensions?: string[];
  filters?: string[];
  timeSemantics?: string;
  freshness?: string;
  owner?: string;
  version?: string;
  dependencyIds?: string[];
  evidenceIds?: string[];
  status: SurfaceStatus;
}

export interface WhyNotExplanation {
  question: string;
  reason: string;
  blockingConditions?: string[];
  missingEvidenceIds?: string[];
  alternatives?: string[];
  status: SurfaceStatus;
}

export interface DecisionSafetyView {
  decisionId?: string;
  allowed: boolean;
  blockedReason?: string;
  dataFreshness?: string;
  evidenceComplete?: boolean;
  confidence?: number;
  requiredApproval?: string;
  status: SurfaceStatus;
}

export interface AuditEventView {
  eventId: string;
  eventType: string;
  occurredAt: string;
  actorId?: string;
  targetId?: string;
  sourceId?: string;
  status: SurfaceStatus;
}

export function evidenceStatusFromIds(link: EvidenceGraphLink): SurfaceStatus {
  if (link.status !== 'LIVE') return link.status;
  return link.sourceId || link.evidenceId ? 'LIVE' : 'UNKNOWN';
}

export function safeConfidence(value: number | null | undefined): number | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(1, value));
}

export function canNavigateToEvidence(link: EvidenceGraphLink): boolean {
  return evidenceStatusFromIds(link) === 'LIVE' && Boolean(link.sourceId || link.evidenceId);
}
