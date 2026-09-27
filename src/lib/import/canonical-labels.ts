export const specialtyLabel = (specialty: string | null | undefined): string => ({
  sales: 'المبيعات',
  purchases: 'المشتريات',
  inventory: 'المخزون',
  customers: 'العملاء',
  suppliers: 'الموردون',
  products: 'المنتجات',
  payments: 'المدفوعات',
  other: 'مصدر عام',
}[String(specialty ?? '').toLowerCase()] ?? 'غير محدد');

export const entityLabel = (entityType: string | null | undefined): string => ({
  products: 'الأصناف والمنتجات',
  customers: 'العملاء',
  sales_invoices: 'فواتير المبيعات',
  purchase_invoices: 'فواتير المشتريات',
  suppliers: 'الموردون',
  inventory_balances: 'أرصدة المخزون',
  payments: 'المدفوعات',
  'generic:source-data': 'سجل مصدر عام',
}[String(entityType ?? '').toLowerCase()] ?? 'غير محدد');
