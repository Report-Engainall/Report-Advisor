import type { Recommendation, Alert, Forecast } from './types';
import type { SourceAnalysisSnapshot } from './queries';

export type TaskRole = 'manager' | 'employee' | 'sales' | 'warehouse' | 'accountant' | 'purchasing';
export type TaskHorizon = 'today' | 'tomorrow';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface IntelligenceTask {
  id: string;
  role: TaskRole;
  horizon: TaskHorizon;
  priority: TaskPriority;
  title: string;
  reason: string;
  sourceType: 'recommendation' | 'alert' | 'forecast' | 'kpi';
  sourceId: string | null;
  expectedOutcome: string;
  evidenceRequired: string[];
  status: 'proposed';
}

const roleLabels: Record<TaskRole, string> = {
  manager: 'المدير', employee: 'الموظف', sales: 'المبيعات', warehouse: 'المخازن', accountant: 'المحاسب', purchasing: 'المشتريات',
};

function priorityFromRecommendation(priority: string): TaskPriority {
  if (priority === 'critical') return 'critical';
  if (priority === 'high') return 'high';
  if (priority === 'medium') return 'medium';
  return 'low';
}

function rolesForRecommendation(rec: Recommendation): TaskRole[] {
  const text = `${rec.category} ${rec.title} ${rec.description ?? ''}`.toLowerCase();
  const roles = new Set<TaskRole>(['manager']);
  if (/تحصيل|ذمم|عميل|receiv|collection/.test(text)) roles.add('accountant');
  if (/بيع|مبيعات|عميل|sales/.test(text)) roles.add('sales');
  if (/مخزون|صنف|بضاعة|inventory|stock/.test(text)) roles.add('warehouse');
  if (/شراء|مورد|purchase|supplier|توريد/.test(text)) roles.add('purchasing');
  if (roles.size === 1) roles.add('employee');
  return [...roles];
}

function rolesForAlert(alert: Alert): TaskRole[] {
  const text = `${alert.category} ${alert.title} ${alert.description ?? ''}`.toLowerCase();
  if (/مخزون|stock|inventory/.test(text)) return ['warehouse', 'purchasing', 'manager'];
  if (/ذمم|تحصيل|receiv|collection/.test(text)) return ['accountant', 'sales', 'manager'];
  if (/شراء|مورد|purchase|supplier/.test(text)) return ['purchasing', 'manager'];
  if (/بيع|sales/.test(text)) return ['sales', 'manager'];
  return ['employee', 'manager'];
}

function sourceAnalysisTasks(snapshot: SourceAnalysisSnapshot, indexStart: number): IntelligenceTask[] {
  const tasks: IntelligenceTask[] = [];
  const warnings = snapshot.warnings.slice(0, 3).join('، ');
  const evidence = ['source_analysis_snapshot', `SHA-256: ${snapshot.source_hash}`];
  if (snapshot.quality_score != null && snapshot.quality_score < 0.6) {
    tasks.push({ id: `source-task-${indexStart + tasks.length + 1}`, role: 'manager', horizon: 'today', priority: 'high', title: `مراجعة جودة المصدر: ${snapshot.source_path}`, reason: `جودة المصدر ${Math.round(snapshot.quality_score * 100)}%${warnings ? ` — ${warnings}` : ''}`, sourceType: 'kpi', sourceId: snapshot.id, expectedOutcome: 'تأكيد جودة المصدر أو تصحيح المشكلة قبل الاعتماد التشغيلي', evidenceRequired: evidence, status: 'proposed' });
  }
  if (snapshot.analysis_status === 'analyzed' && snapshot.row_count > 0) {
    tasks.push({ id: `source-task-${indexStart + tasks.length + 1}`, role: 'manager', horizon: 'tomorrow', priority: 'medium', title: `مراجعة تقرير عام: ${snapshot.source_path}`, reason: `المصدر قابل للتحليل لكنه لم يُثبت ككيان متخصص (${snapshot.entity_type})`, sourceType: 'kpi', sourceId: snapshot.id, expectedOutcome: 'تحديد التصنيف أو إبقاء المصدر كتقرير عام مع اعتماد الحقول اللازمة', evidenceRequired: evidence, status: 'proposed' });
  }
  if (snapshot.warnings.length > 0 && tasks.length === 0) {
    tasks.push({ id: `source-task-${indexStart + 1}`, role: 'employee', horizon: 'tomorrow', priority: 'medium', title: `معالجة ملاحظات المصدر: ${snapshot.source_path}`, reason: warnings, sourceType: 'kpi', sourceId: snapshot.id, expectedOutcome: 'تسجيل معالجة الملاحظات وإعادة التحقق من المصدر', evidenceRequired: evidence, status: 'proposed' });
  }
  return tasks;
}

export function buildDailyTaskPlan(input: {
  recommendations: Recommendation[];
  alerts: Alert[];
  forecasts: Forecast[];
  sourceSnapshots?: SourceAnalysisSnapshot[];
  today?: Date;
}): IntelligenceTask[] {
  const tasks: IntelligenceTask[] = [];
  const add = (task: Omit<IntelligenceTask, 'id' | 'status'>, index: number) => tasks.push({ ...task, id: `intel-task-${index + 1}`, status: 'proposed' });
  let index = 0;

  for (const alert of input.alerts.filter(a => !a.is_read).slice(0, 20)) {
    for (const role of rolesForAlert(alert)) {
      add({ role, horizon: alert.severity === 'critical' ? 'today' : 'tomorrow', priority: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'high' : 'medium', title: `معالجة: ${alert.title}`, reason: alert.description ?? 'تنبيه صادر من بيانات الشركة', sourceType: 'alert', sourceId: alert.id, expectedOutcome: 'إغلاق سبب التنبيه وتسجيل النتيجة الفعلية', evidenceRequired: ['مصدر التنبيه', 'الإجراء المنفذ', 'النتيجة'] }, index++);
    }
  }

  for (const rec of input.recommendations.filter(r => r.status === 'new').slice(0, 20)) {
    for (const role of rolesForRecommendation(rec)) {
      const priority = priorityFromRecommendation(rec.priority);
      add({ role, horizon: priority === 'critical' || priority === 'high' ? 'today' : 'tomorrow', priority, title: rec.title, reason: rec.description ?? 'توصية مستخرجة من بيانات الشركة', sourceType: 'recommendation', sourceId: rec.id, expectedOutcome: rec.expected_impact == null ? 'تنفيذ الإجراء وقياس النتيجة' : `تحقيق أثر متوقع بقيمة ${rec.expected_impact}`, evidenceRequired: ['التوصية', 'البيانات المؤيدة', 'النتيجة الفعلية'] }, index++);
    }
  }

  const weakForecasts = input.forecasts.filter(f => f.quality_score != null && f.quality_score < 0.6).slice(0, 10);
  for (const forecast of weakForecasts) {
    add({ role: 'manager', horizon: 'tomorrow', priority: 'medium', title: `مراجعة تنبؤ ${forecast.entity_name}`, reason: `جودة نموذج التنبؤ ${Math.round((forecast.quality_score ?? 0) * 100)}%`, sourceType: 'forecast', sourceId: forecast.id, expectedOutcome: 'تأكيد كفاية البيانات أو تخفيض الاعتماد على التنبؤ', evidenceRequired: ['نقاط البيانات', 'جودة النموذج', 'نطاق التنبؤ'] }, index++);
  }

  for (const snapshot of (input.sourceSnapshots ?? []).slice(0, 20)) {
    const generated = sourceAnalysisTasks(snapshot, index);
    tasks.push(...generated);
    index += generated.length;
  }

  return tasks.sort((a, b) => ({ critical: 0, high: 1, medium: 2, low: 3 }[a.priority] - { critical: 0, high: 1, medium: 2, low: 3 }[b.priority]));
}

export function taskRoleLabel(role: TaskRole): string { return roleLabels[role]; }
