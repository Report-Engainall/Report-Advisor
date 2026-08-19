import { BUSINESS_ALERT_RULES, evaluateRule, priorityLabel, type AlertSeverity } from './businessAlerts';

export interface DecisionSignal { key: string; label: string; value: number; unit: string; source?: string; }
export interface DecisionRecommendation { id: string; title: string; action: string; severity: AlertSeverity; reason: string; confidence: number; signals: DecisionSignal[]; }

export function buildDecisions(signals: DecisionSignal[]): DecisionRecommendation[] {
  const byKey = new Map(signals.map(s => [s.key, s]));
  const results: DecisionRecommendation[] = [];
  for (const rule of BUSINESS_ALERT_RULES) {
    const signal = byKey.get(rule.metric);
    if (!signal || !evaluateRule(rule, signal.value)) continue;
    const confidence = rule.severity === 'critical' ? 0.95 : rule.severity === 'warning' ? 0.88 : 0.8;
    results.push({
      id: rule.key,
      title: rule.title,
      action: priorityLabel(rule.severity),
      severity: rule.severity,
      reason: `${rule.description} القيمة الحالية: ${signal.value}${signal.unit}`,
      confidence,
      signals: [signal],
    });
  }
  return results.sort((a, b) => b.confidence - a.confidence);
}

export function decisionStatus(confidence: number) {
  if (confidence >= 0.9) return 'إجراء موصى به';
  if (confidence >= 0.75) return 'مراجعة مطلوبة';
  return 'للمعلومية';
}
