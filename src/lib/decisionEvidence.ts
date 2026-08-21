import type { DecisionRecommendation, DecisionSignal } from './intelligence/decisionEngine';
import { evaluateMetric, metricCanDriveDecision, type MetricEvaluation } from './metricEngine';
import { explainDecision, type Evidence, type DecisionEvidence } from './free-toolbox/evidence-ledger';
export interface EvidenceBackedDecision extends DecisionRecommendation { evidence: DecisionEvidence; blocked: boolean; blockedReason?: string; }
export function buildEvidenceBackedDecision(decision: DecisionRecommendation, signals: DecisionSignal[], evidence: Evidence[]): EvidenceBackedDecision {
  const signal = signals.find(item => decision.signals.some(decisionSignal => decisionSignal.key === item.key));
  const metric: MetricEvaluation | null = signal ? evaluateMetric({ key: signal.key, value: signal.value, confidence: decision.confidence }) : null;
  const decisionEvidence = explainDecision(decision.id, decision.reason, evidence);
  const metricAllowed = metric ? metricCanDriveDecision(metric) : false;
  const evidenceAllowed = decisionEvidence.status === 'verified' || decisionEvidence.status === 'partial';
  const blocked = !metricAllowed || !evidenceAllowed;
  return { ...decision, evidence: decisionEvidence, blocked, blockedReason: blocked ? !metricAllowed ? 'المؤشر المرتبط بالتوصية لا يملك جودة/ثقة كافية لاتخاذ قرار.' : 'لا توجد أدلة كافية لتتبع سبب التوصية إلى مصدرها.' : undefined };
}
export function filterActionableDecisions(decisions: EvidenceBackedDecision[]): EvidenceBackedDecision[] { return decisions.filter(decision => !decision.blocked); }
