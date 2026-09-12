import type { Decision } from './intelligence/decisionEngine';
import { evaluateMetric, metricCanDriveDecision, type MetricEvaluation } from './metricEngine';
import { explainDecision, type Evidence, type DecisionEvidence } from './free-toolbox/evidence-ledger';

export interface EvidenceBackedDecision extends Decision { decisionEvidence: DecisionEvidence; blocked: boolean; blockedReason?: string; }

function evidenceMatchesClaim(claim: Decision['evidence'][number], evidence: Evidence): boolean {
  if (!evidence.sourceId) return false;
  if (evidence.field && evidence.field !== claim.metric) return false;
  if (evidence.sourceId !== claim.source) return false;
  if (typeof evidence.normalized === 'number' && Number.isFinite(claim.value)) {
    return Math.abs(evidence.normalized - claim.value) <= 0.000001;
  }
  return evidence.normalized === undefined || String(evidence.normalized) === String(claim.value);
}

export function buildEvidenceBackedDecision(decision: Decision, evidence: Evidence[]): EvidenceBackedDecision {
  const primary = decision.evidence[0];
  const metric: MetricEvaluation | null = primary ? evaluateMetric({ key: primary.metric, value: primary.value, confidence: decision.confidence }) : null;
  const usableEvidence = evidence.filter(item => Boolean(item.sourceId) && Number.isFinite(item.confidence) && (item.confidence ?? 0) >= 0.8);
  const claimsBacked = decision.evidence.length > 0 && decision.evidence.every(claim => usableEvidence.some(item => evidenceMatchesClaim(claim, item)));
  const decisionEvidence = explainDecision(decision.id, decision.action, usableEvidence);
  const metricAllowed = metric ? metricCanDriveDecision(metric) : false;
  const evidenceAllowed = claimsBacked && decisionEvidence.status === 'verified';
  const blocked = !metricAllowed || !evidenceAllowed;
  return {
    ...decision,
    decisionEvidence,
    blocked,
    blockedReason: blocked
      ? !metricAllowed
        ? 'المؤشر المرتبط بالتوصية لا يملك جودة/ثقة كافية لاتخاذ قرار.'
        : !claimsBacked
          ? 'دليل القرار لا يطابق جميع الادعاءات والمصادر والقيم المرتبطة بالقرار.'
          : 'لا توجد أدلة موثوقة وكافية لتتبع سبب التوصية إلى مصدرها.'
      : undefined,
  };
}

export function filterActionableDecisions(decisions: EvidenceBackedDecision[]): EvidenceBackedDecision[] {
  return decisions.filter(decision => !decision.blocked && decision.decisionEvidence.status === 'verified');
}
