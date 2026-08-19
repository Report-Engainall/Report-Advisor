export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface BusinessAlertRule { key: string; title: string; description: string; severity: AlertSeverity; metric: string; threshold: number; operator: '<' | '>' | '<=' | '>='; }

export const BUSINESS_ALERT_RULES: BusinessAlertRule[] = [
  { key: 'stockout_critical', title: 'نفاد مخزون وشيك', description: 'الصنف لديه تغطية مخزون أقل من الحد الحرج.', severity: 'critical', metric: 'stock_coverage_days', threshold: 3, operator: '<' },
  { key: 'stockout_warning', title: 'تغطية مخزون منخفضة', description: 'الصنف يقترب من نقطة إعادة الطلب.', severity: 'warning', metric: 'stock_coverage_days', threshold: 7, operator: '<' },
  { key: 'liquidity_pressure', title: 'ضغط سيولة', description: 'الالتزامات القريبة مرتفعة مقارنة بالتدفقات الداخلة المتوقعة.', severity: 'warning', metric: 'liquidity_coverage_ratio', threshold: 1, operator: '<' },
  { key: 'sales_drop', title: 'هبوط في المبيعات', description: 'انخفاض ملحوظ ومستمر في وتيرة المبيعات.', severity: 'warning', metric: 'sales_change_percent', threshold: -20, operator: '<' },
];

export function evaluateRule(rule: BusinessAlertRule, value: number) {
  return rule.operator === '<' ? value < rule.threshold : rule.operator === '>' ? value > rule.threshold : rule.operator === '<=' ? value <= rule.threshold : value >= rule.threshold;
}

export function priorityLabel(severity: AlertSeverity) {
  return severity === 'critical' ? 'تدخل فوري' : severity === 'warning' ? 'متابعة' : 'معلومة';
}
