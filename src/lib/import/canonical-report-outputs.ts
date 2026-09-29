import type { CanonicalImportEntityType } from './canonical-truth-boundary';
import type { CanonicalImportSpecialty } from './canonical-source-understanding';

export interface CanonicalReportOutput {
  key: string;
  path: string;
  label: string;
  stage: string;
  description: string;
}

const EXECUTIVE_OUTPUT: CanonicalReportOutput = {
  key: 'executive',
  path: '/reports/executive',
  label: 'التقرير التنفيذي',
  stage: 'DECISION OUTPUT',
  description: 'المصدر يدخل إلى التقرير التنفيذي مع حدود الدليل الواضحة.'
};

const withExecutive = (...outputs: CanonicalReportOutput[]): CanonicalReportOutput[] => [EXECUTIVE_OUTPUT, ...outputs];

export const CANONICAL_REPORT_OUTPUTS: Record<CanonicalImportSpecialty, CanonicalReportOutput[]> = {
  sales: withExecutive({ key: 'sales', path: '/reports/sales', label: 'تقرير المبيعات', stage: 'SPECIALTY REPORT', description: 'المبيعات والفواتير والعملاء والمنتجات من الحقيقة الكانونية الحالية.' }),
  purchases: withExecutive({ key: 'purchases', path: '/reports/purchases', label: 'تقرير المشتريات', stage: 'SPECIALTY REPORT', description: 'المشتريات والموردون والتدفقات الداخلة من الحقيقة الكانونية الحالية.' }),
  inventory: withExecutive(
    { key: 'inventory', path: '/reports/inventory', label: 'تقرير المخزون', stage: 'SPECIALTY REPORT', description: 'الكميات والتكلفة والقيمة وحالات النقص من اللقطة الكانونية.' },
    { key: 'inventory-intelligence', path: '/reports/inventory-intelligence', label: 'ذكاء المخزون', stage: 'INTELLIGENCE OUTPUT', description: 'الأولوية التشغيلية ومخاطر المخزون بعد اجتياز بوابات الحقيقة.' },
  ),
  customers: withExecutive({ key: 'customer-rfm', path: '/analytics/rfm', label: 'تحليل RFM للعملاء', stage: 'ANALYTICS OUTPUT', description: 'تحليل سلوك العملاء من الصورة الكانونية الحالية.' }),
  suppliers: withExecutive({ key: 'supplier-analytics', path: '/analytics', label: 'تحليلات الموردين', stage: 'ANALYTICS OUTPUT', description: 'تحليلات الموردين المتاحة من الحقيقة الكانونية الحالية.' }),
  products: withExecutive({ key: 'product-abc', path: '/analytics/abc', label: 'تحليل ABC للأصناف', stage: 'ANALYTICS OUTPUT', description: 'تصنيف الأصناف حسب مساهمتها في القيمة من البيانات الكانونية.' }),
  payments: withExecutive({ key: 'payment-liquidity', path: '/analytics/liquidity', label: 'تحليل السيولة والمدفوعات', stage: 'ANALYTICS OUTPUT', description: 'قراءة السيولة والمدفوعات وفق البيانات الكانونية المتاحة.' }),
  receivables: withExecutive(
    { key: 'receivables', path: '/reports/receivables', label: 'تقرير الذمم المدينة', stage: 'SPECIALTY REPORT', description: 'أرصدة الذمم وأعمار الديون وحالة التحصيل من المصدر الكانوني المرتبط.' },
    { key: 'receivables-aging', path: '/analytics/aging', label: 'تحليل أعمار الذمم', stage: 'INTELLIGENCE OUTPUT', description: 'تحليل أعمار الذمم وتوزيع الاستحقاقات دون تحويل النقص إلى أصفار.' },
  ),
  other: [EXECUTIVE_OUTPUT],
};

const ENTITY_TO_SPECIALTY: Partial<Record<CanonicalImportEntityType, CanonicalImportSpecialty>> = {
  products: 'products',
  customers: 'customers',
  sales_invoices: 'sales',
  purchase_invoices: 'purchases',
  suppliers: 'suppliers',
  inventory_balances: 'inventory',
  payments: 'payments',
};

const GENERIC_ENTITY_TO_SPECIALTY: Record<string, CanonicalImportSpecialty> = {
  'generic:sales': 'sales',
  'generic:purchases': 'purchases',
  'generic:inventory': 'inventory',
  'generic:customers': 'customers',
  'generic:suppliers': 'suppliers',
  'generic:products': 'products',
  'generic:payments': 'payments',
  'generic:receivables': 'receivables',
};

export function resolveCanonicalReportOutputs(
  specialty: string | null | undefined,
  entityType: CanonicalImportEntityType | string | null | undefined,
): CanonicalReportOutput[] {
  const normalizedSpecialty = String(specialty ?? '').toLowerCase() as CanonicalImportSpecialty;
  const normalizedEntity = String(entityType ?? '') as CanonicalImportEntityType;
  const entitySpecialty = ENTITY_TO_SPECIALTY[normalizedEntity];
  const genericEntitySpecialty = GENERIC_ENTITY_TO_SPECIALTY[normalizedEntity];
  const knownSpecialty = normalizedSpecialty in CANONICAL_REPORT_OUTPUTS ? normalizedSpecialty : null;
  const isUnknownGenericSource = normalizedEntity === 'generic:source-data';
  const resolved = isUnknownGenericSource
    ? 'other'
    : entitySpecialty ?? genericEntitySpecialty ?? knownSpecialty ?? 'other';
  return CANONICAL_REPORT_OUTPUTS[resolved];
}