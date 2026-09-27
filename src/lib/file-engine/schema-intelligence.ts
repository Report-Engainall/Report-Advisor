import { normalizeColumnName, parseNumber } from './normalizer.ts';

export type SchemaField = 'sku' | 'barcode' | 'product_name' | 'customer_id' | 'customer_name' | 'supplier_id' | 'supplier_name' | 'supplier_code' | 'invoice_number' | 'invoice_date' | 'price' | 'quantity' | 'date' | 'unit' | 'warehouse' | 'warehouse_id' | 'purchase_amount' | 'subtotal' | 'tax_amount' | 'total' | 'paid_amount' | 'discount_amount' | 'status' | 'due_date' | 'currency' | 'payment_id' | 'payment_date' | 'payment_amount' | 'payment_method' | 'reference' | 'direction' | 'product_id' | 'unit_cost' | 'last_movement_date' | 'segment' | 'credit_limit' | 'payment_terms_days' | 'min_stock' | 'reorder_point' | 'is_active' | 'unknown';

export type SchemaEvidence = {
  field: SchemaField;
  confidence: number;
  evidence: string[];
  ambiguous: boolean;
};

const SYNONYMS: Record<Exclude<SchemaField, 'unknown'>, string[]> = {
  sku: ['sku', 'item code', 'product code', 'item number', 'رقم الصنف', 'كود الصنف', 'رمز الصنف'],
  barcode: ['barcode', 'bar code', 'باركود', 'الباركود'],
  product_name: ['product', 'product name', 'item', 'item name', 'name', 'اسم الصنف', 'اسم المنتج', 'الصنف', 'المنتج'],
  customer_id: ['customer id', 'customer number', 'client id', 'رقم العميل', 'كود العميل'],
  customer_name: ['customer', 'customer name', 'client', 'client name', 'اسم العميل', 'العميل'],
  supplier_id: ['supplier id', 'vendor id', 'رقم المورد', 'كود المورد'],
  supplier_name: ['supplier', 'supplier name', 'vendor', 'vendor name', 'اسم المورد', 'المورد'],
  supplier_code: ['supplier code', 'vendor code', 'كود المورد', 'رمز المورد'],
  invoice_number: ['invoice', 'invoice number', 'invoice no', 'purchase number', 'purchase no', 'رقم الفاتورة', 'الفاتورة', 'رقم الشراء'],
  invoice_date: ['invoice date', 'purchase date', 'تاريخ الفاتورة', 'تاريخ الشراء'],
  price: ['price', 'unit price', 'sale price', 'cost', 'السعر', 'سعر البيع', 'سعر الوحدة'],
  quantity: ['quantity', 'qty', 'count', 'stock', 'on hand', 'المخزون', 'الكمية', 'العدد'],
  date: ['date', 'transaction date', 'التاريخ'],
  unit: ['unit', 'uom', 'الوحدة', 'وحدة القياس'],
  warehouse: ['warehouse', 'store', 'المستودع', 'المخزن'],
  warehouse_id: ['warehouse id', 'store id', 'معرف المستودع'],
  purchase_amount: ['purchase amount', 'purchase value', 'قيمة الشراء', 'مبلغ الشراء'],
  unit_price: ['unit price', 'unit cost', 'سعر الوحدة', 'سعر الشراء'],
  line_total: ['line total', 'line amount', 'قيمة السطر', 'إجمالي السطر'],
  description: ['description', 'item description', 'الوصف', 'وصف الصنف'],
  subtotal: ['subtotal', 'sub total', 'المجموع الفرعي'],
  tax_amount: ['tax', 'tax amount', 'vat', 'ضريبة', 'قيمة الضريبة'],
  total: ['total', 'grand total', 'invoice total', 'purchase amount', 'الإجمالي', 'المجموع'],
  paid_amount: ['paid', 'paid amount', 'amount paid', 'المدفوع', 'المبلغ المدفوع'],
  discount_amount: ['discount', 'discount amount', 'الخصم', 'قيمة الخصم'],
  status: ['status', 'state', 'الحالة'],
  due_date: ['due date', 'تاريخ الاستحقاق'],
  currency: ['currency', 'عملة', 'العملة'],
  payment_id: ['payment id', 'رقم الدفعة', 'معرف السداد'],
  payment_date: ['payment date', 'تاريخ الدفع', 'تاريخ السداد'],
  payment_amount: ['payment amount', 'amount paid', 'payment value', 'مبلغ الدفع', 'قيمة السداد'],
  payment_method: ['payment method', 'method', 'طريقة الدفع'],
  reference: ['reference', 'ref', 'مرجع', 'رقم المرجع'],
  direction: ['direction', 'payment direction', 'in out', 'اتجاه', 'نوع الحركة'],
  product_id: ['product id', 'item id', 'معرف المنتج', 'معرف الصنف'],
  unit_cost: ['unit cost', 'cost per unit', 'تكلفة الوحدة'],
  last_movement_date: ['last movement', 'last movement date', 'آخر حركة', 'تاريخ آخر حركة'],
  segment: ['segment', 'customer segment', 'شريحة', 'قطاع'],
  credit_limit: ['credit limit', 'حد الائتمان'],
  payment_terms_days: ['payment terms', 'payment terms days', 'أيام الائتمان', 'شروط الدفع'],
  min_stock: ['min stock', 'minimum stock', 'الحد الأدنى للمخزون'],
  reorder_point: ['reorder point', 'reorder level', 'حد إعادة الطلب', 'نقطة إعادة الطلب'],
  is_active: ['is active', 'active', 'enabled', 'نشط', 'فعال'],
};

function compact(value: unknown): string {
  return normalizeColumnName(String(value ?? '')).replace(/[._:/\\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreByHeader(header: string, field: Exclude<SchemaField, 'unknown'>): { score: number; evidence: string[] } {
  const normalized = compact(header);
  const aliases = SYNONYMS[field].map(compact);
  if (!normalized) return { score: 0, evidence: [] };
  if (aliases.includes(normalized)) return { score: 100, evidence: ['exact synonym'] };
  const matched = aliases.filter(alias => normalized.includes(alias) || alias.includes(normalized));
  if (matched.length) return { score: 72, evidence: [`partial synonym: ${matched[0]}`] };
  return { score: 0, evidence: [] };
}

function valueEvidence(values: unknown[], field: Exclude<SchemaField, 'unknown'>): number {
  const sample = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '').slice(0, 200);
  if (!sample.length) return 0;
  const numericFields: SchemaField[] = ['price','quantity','purchase_amount','subtotal','tax_amount','total','paid_amount','discount_amount','payment_amount','unit_cost','credit_limit','payment_terms_days','min_stock','reorder_point'];
  if (numericFields.includes(field)) return sample.filter(v => parseNumber(v) !== null).length / sample.length * 20;
  if (field === 'barcode') return sample.filter(v => /^\d{6,18}$/.test(String(v).replace(/\s/g, ''))).length / sample.length * 25;
  if (field === 'sku') return sample.filter(v => /^[A-Za-z0-9._/-]{2,40}$/.test(String(v).trim())).length / sample.length * 15;
  return 0;
}

export function inferSchemaField(header: string, values: unknown[] = []): SchemaEvidence {
  const fields = (Object.keys(SYNONYMS) as Exclude<SchemaField, 'unknown'>[])
    .map(field => {
      const headerScore = scoreByHeader(header, field);
      const valueScore = valueEvidence(values, field);
      return { field, confidence: Math.min(100, Math.round(headerScore.score + valueScore)), evidence: [...headerScore.evidence, ...(valueScore ? ['value-shape evidence'] : [])] };
    })
    .filter(x => x.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);

  const best = fields[0];
  const second = fields[1];
  if (!best) return { field: 'unknown', confidence: 0, evidence: ['no schema evidence'], ambiguous: true };
  const ambiguous = Boolean(second && best.confidence < 90 && best.confidence - second.confidence < 15);
  return { field: best.field, confidence: best.confidence, evidence: best.evidence, ambiguous };
}

export function inferSchema(headers: string[], rows: Record<string, unknown>[] = []): SchemaEvidence[] {
  return headers.map(header => inferSchemaField(header, rows.map(row => row[header])));
}
