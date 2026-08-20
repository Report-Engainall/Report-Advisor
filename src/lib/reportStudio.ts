export type ReportVisualization = 'table' | 'bar' | 'line' | 'area' | 'pie' | 'kpi';
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';

export interface ReportFilter { field: string; operator: FilterOperator; value: unknown; }
export interface ReportColumn { field: string; label: string; visible: boolean; aggregate?: 'sum' | 'avg' | 'min' | 'max' | 'count'; }
export interface ReportSort { field: string; direction: 'asc' | 'desc'; }
export interface ReportDefinition {
  id: string;
  name: string;
  metricIds: string[];
  columns: ReportColumn[];
  filters: ReportFilter[];
  grouping: string[];
  sorting: ReportSort[];
  visualization: ReportVisualization;
  calculatedMetrics: Array<{ id: string; expression: string; metricIds: string[] }>;
  schedule?: { frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'; timezone: string; enabled: boolean };
  scope: 'USER' | 'ORGANIZATION' | 'SYSTEM';
  version: number;
}

export interface ReportValidation { ok: boolean; errors: string[]; warnings: string[]; }

const unsafe = /(insert|update|delete|drop|alter|truncate|;|--|\/\*)/i;

export function validateReportDefinition(definition: ReportDefinition): ReportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!definition.id || !definition.name.trim()) errors.push('معرّف واسم التقرير مطلوبان.');
  if (definition.metricIds.length === 0 && definition.columns.length === 0) errors.push('يجب أن يحتوي التقرير على مقياس أو عمود.');
  for (const calc of definition.calculatedMetrics) {
    if (unsafe.test(calc.expression)) errors.push(`حساب غير آمن: ${calc.id}`);
    if (calc.metricIds.length === 0) warnings.push(`الحساب ${calc.id} لا يعلن مقاييسه المصدرية.`);
  }
  for (const filter of definition.filters) if (!filter.field) errors.push('كل مرشح يجب أن يحدد حقلًا.');
  if (definition.schedule?.enabled && !definition.schedule.timezone) errors.push('المنطقة الزمنية مطلوبة للجدولة.');
  return { ok: errors.length === 0, errors, warnings };
}

export function cloneReportVersion(definition: ReportDefinition): ReportDefinition {
  return { ...structuredClone(definition), version: definition.version + 1 };
}
