import { BUSINESS_ALERT_RULES, evaluateRule, priorityLabel, type AlertSeverity } from './businessAlerts';
import { evaluateMetric, metricCanDriveDecision } from './metricEngine';

export interface DecisionSignal { key: string; label: string; value: number; unit: string; source?: string; confidence?: number; status?: 'CONFIRMED' | 'CALCULATED' | 'ESTIMATED' | 'FORECAST' | 'INSUFFICIENT_DATA' | 'UNAVAILABLE'; }
export interface DecisionRecommendation { id: string; title: string; action: string; severity: AlertSeverity; reason: string; confidence: number; signals: DecisionSignal[]; blocked?: boolean; blockedReason?: string; }

export function buildDecisions(signals: DecisionSignal[]): DecisionRecommendation[] {
  const byKey = new Map(signals.map(s => [s.key, s]));
  const results: DecisionRecommendation[] = [];
  for (const rule of BUSINESS_ALERT_RULES) {
    const signal = byKey.get(rule.metric);
    if (!signal || !evaluateRule(rule, signal.value)) continue;

    const metric = evaluateMetric({
      key: signal.key,
      value: signal.value,
      confidence: signal.confidence,
      status: signal.status,
    });
    const ruleConfidence = rule.severity === 'critical' ? 0.95 : rule.severity === 'warning' ? 0.88 : 0.8;
    const confidence = Math.min(ruleConfidence, metric.confidence);
    const blocked = !metricCanDriveDecision(metric);

    results.push({
      id: rule.key,
      title: rule.title,
      action: priorityLabel(rule.severity),
      severity: rule.severity,
      reason: `${rule.description} القيمة الحالية: ${signal.value}${signal.unit}`,
      confidence,
      signals: [signal],
      blocked,
      blockedReason: blocked ? 'جودة المؤشر أو البيانات غير كافية لاتخاذ إجراء آلي.' : undefined,
    });
  }
  return results.sort((a, b) => b.confidence - a.confidence);
}

export function decisionStatus(confidence: number) {
  if (confidence >= 0.9) return 'إجراء موصى به';
  if (confidence >= 0.75) return 'مراجعة مطلوبة';
  return 'للمعلومية';
}
