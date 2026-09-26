export type SourceDomain =
  | 'inventory-report'
  | 'sales-invoice'
  | 'customer-master'
  | 'product-master'
  | 'payment-report'
  | 'source-data';

export const SOURCE_DOMAIN_LABELS: Record<SourceDomain, string> = {
  'inventory-report': 'تقرير مخزون',
  'sales-invoice': 'فواتير مبيعات',
  'customer-master': 'بيانات عملاء',
  'product-master': 'بيانات أصناف',
  'payment-report': 'تقرير تحصيل/مدفوعات',
  'source-data': 'مصدر عام',
};

export function inferSourceDomain(mappings: Array<{ mappedField: string | null }>): SourceDomain {
  const fields = new Set(
    mappings
      .map(mapping => mapping.mappedField)
      .filter((field): field is string => Boolean(field)),
  );
  const hasAny = (...names: string[]) => names.some(name => fields.has(name));

  if (hasAny('stock_balance', 'received_quantity', 'posted_net_sales', 'unposted_net_sales', 'net_sales', 'warehouse')) return 'inventory-report';
  if (hasAny('invoice_number', 'invoice_date') && hasAny('total', 'subtotal')) return 'sales-invoice';
  if (hasAny('customer_name', 'customer_id', 'credit_limit', 'payment_terms_days') && hasAny('phone', 'email', 'segment')) return 'customer-master';
  if (fields.has('sku') && fields.has('name') && hasAny('cost_price', 'selling_price', 'min_stock', 'reorder_point')) return 'product-master';
  if (hasAny('paid_amount', 'payment_date', 'payment_method')) return 'payment-report';
  return 'source-data';
}

export function sourceDomainLabel(domain: string | null | undefined): string {
  if (!domain) return SOURCE_DOMAIN_LABELS['source-data'];
  if (domain in SOURCE_DOMAIN_LABELS) return SOURCE_DOMAIN_LABELS[domain as SourceDomain];
  if (domain.startsWith('generic:')) {
    const known = domain.slice('generic:'.length);
    if (known in SOURCE_DOMAIN_LABELS) return SOURCE_DOMAIN_LABELS[known as SourceDomain];
  }
  return domain;
}
