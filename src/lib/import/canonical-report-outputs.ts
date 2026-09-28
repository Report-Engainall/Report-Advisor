import type { CanonicalImportEntityType } from './canonical-truth-boundary';
import type { CanonicalImportSpecialty } from './canonical-source-understanding';

export interface CanonicalReportOutput {
  key: string;
  path: string;
  label: string;
  stage: string;
  description: string;
}

export const CANONICAL_REPORT_OUTPUTS: Record<CanonicalImportSpecialty, CanonicalReportOutput[]> = {
  sales: [{ key: 'sales', path: '/reports/sales', label: 'تقرير المبيعات', stage: 'SPECIALTY REPORT', description: 'المبيعات والفواتير والعملاء والمنتجات من الحقيقة الكانونية الحالية.' }],
  purchases: [{ key: 'purchases', path: '/reports/purchases', label: 'تقرير المشتريات', stage: 'SPECIALTY REPORT', description: 'المشتريات والموردون والتدفقات الداخلة من الحقيقة الكانونية الحالية.' }],
  inventory: [
    { key: 'inventory', path: '/reports/inventory', label: 'تقرير المخزون', stage: 'SPECIALTY REPORT', description: 'الكميات والتكلفة والقيمة وحالات النقص من اللقطة الكانونية.' },
    { key: 'inventory-intelligence', path: '/reports/inventory-intelligence', label: 'ذكاء المخزون', stage: 'INTELLIGENCE OUTPUT', description: 'الأولوية التشغيلية ومخاطر المخزون بعد اجتياز بوابات الحقيقة.' },
  ],
  customers: [{ key: 'customer-rfm', path: '/analytics/rfm', label: 'تحليل RFM للعملاء', stage: 'ANALYTICS OUTPUT', description: 'تحليل سلوك العملاء من الصورة الكانونية الحالية.' }],
  suppliers: [{ key: 'supplier-analytics', path: '/analytics', label: 'تحليلات الموردين', stage: 'ANALYTICS OUTPUT', description: 'تحليلات الموردين المتاحة من الحقيقة الكانونية الحالية.' }],
  products: [{ key: 'product-abc', path: '/analytics/abc', label: 'تحليل ABC للأصناف', stage: 'ANALYTICS OUTPUT', description: 'تصنيف الأصناف حسب مساهمتها في القيمة من البيانات الكانونية.' }],
  payments: [{ key: 'payment-liquidity', path: '/analytics/liquidity', label: 'تحليل السيولة والمدفوعات', stage: 'ANALYTICS OUTPUT', description: 'قراءة السيولة والمدفوعات وفق البيانات الكانونية المتاحة.' }],
  other: [{ key: 'executive', path: '/reports/executive', label: 'التقرير التنفيذي', stage: 'DECISION OUTPUT', description: 'المصدر العام يدخل إلى التقرير التنفيذي مع حدود الدليل الواضحة.' }],
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

export function resolveCanonicalReportOutputs(
  specialty: string | null | undefined,
  entityType: CanonicalImportEntityType | string | null | undefined,
): CanonicalReportOutput[] {
  const normalizedSpecialty = String(specialty ?? '').toLowerCase() as CanonicalImportSpecialty;
  const normalizedEntity = String(entityType ?? '') as CanonicalImportEntityType;
  const resolved = ENTITY_TO_SPECIALTY[normalizedEntity] ?? (normalizedSpecialty in CANONICAL_REPORT_OUTPUTS ? normalizedSpecialty : 'other');
  return CANONICAL_REPORT_OUTPUTS[resolved];
}
