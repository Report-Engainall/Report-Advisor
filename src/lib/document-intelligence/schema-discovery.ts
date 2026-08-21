export type PrimitiveKind = 'empty' | 'string' | 'number' | 'date' | 'boolean' | 'mixed';

export type CandidateMeaning = {
  field: string;
  score: number;
  evidence: string[];
};

export type ColumnProfile = {
  index: number;
  originalHeader?: string;
  normalizedHeader: string;
  primitiveKind: PrimitiveKind;
  nonEmptyRatio: number;
  uniqueRatio: number;
  numericRatio: number;
  dateRatio: number;
  averageLength: number;
  min?: number;
  max?: number;
  patterns: string[];
  candidates: CandidateMeaning[];
  confidence: number;
};

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const LATIN_DIGITS = '0123456789';

export function normalizeHeader(value: unknown): string {
  let s = String(value ?? '').trim().toLowerCase();
  s = s.replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  s = s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  s = s.replace(/[ـ]/g, '');
  for (let i = 0; i < 10; i++) {
    s = s.replace(new RegExp(ARABIC_DIGITS[i], 'g'), LATIN_DIGITS[i]);
    s = s.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), LATIN_DIGITS[i]);
  }
  return s.replace(/[\s_\-./]+/g, ' ').trim();
}

function numberValue(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const s = normalizeHeader(v).replace(/,/g, '').replace(/٪/g, '%');
  if (!s || !/^-?\d+(\.\d+)?%?$/.test(s)) return undefined;
  const n = Number(s.replace('%', ''));
  return Number.isFinite(n) ? n : undefined;
}

function dateLike(v: unknown): boolean {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return true;
  const s = String(v ?? '').trim();
  if (!s) return false;
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(s)) return true;
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(s)) return true;
  return false;
}

function tokenScore(header: string, dictionary: Record<string, string[]>): CandidateMeaning[] {
  const results: CandidateMeaning[] = [];
  for (const [field, terms] of Object.entries(dictionary)) {
    const hits = terms.filter(t => header.includes(normalizeHeader(t)));
    if (hits.length) results.push({ field, score: Math.min(0.9, 0.55 + hits.length * 0.15), evidence: [`header:${hits.join(',')}`] });
  }
  return results;
}

export const DEFAULT_SEMANTIC_DICTIONARY: Record<string, string[]> = {
  product_code: ['sku', 'item code', 'product code', 'code', 'رقم الصنف', 'كود الصنف', 'رمز الصنف', 'الصنف'],
  product_name: ['product name', 'item name', 'product', 'item', 'description', 'اسم الصنف', 'اسم المنتج', 'المنتج'],
  barcode: ['barcode', 'bar code', 'باركود', 'الباركود'],
  quantity: ['qty', 'quantity', 'count', 'units', 'كمية', 'الكمية', 'عدد'],
  unit: ['unit', 'uom', 'وحدة', 'الوحدة'],
  unit_price: ['unit price', 'price', 'selling price', 'السعر', 'سعر الوحدة', 'سعر البيع'],
  discount: ['discount', 'خصم', 'الخصم'],
  tax: ['tax', 'vat', 'ضريبة', 'الضريبة'],
  total_amount: ['total', 'amount', 'net amount', 'الإجمالي', 'المجموع', 'صافي'],
  invoice_number: ['invoice', 'invoice no', 'invoice number', 'فاتورة', 'رقم الفاتورة'],
  invoice_date: ['invoice date', 'date', 'التاريخ', 'تاريخ الفاتورة'],
  customer_id: ['customer', 'customer id', 'عميل', 'العميل', 'رقم العميل'],
  supplier_id: ['supplier', 'vendor', 'مورد', 'المورد', 'رقم المورد'],
  warehouse_id: ['warehouse', 'store', 'مستودع', 'المستودع', 'المخزن']
};

export function profileColumns(rows: unknown[][], headers: unknown[] = [], dictionary = DEFAULT_SEMANTIC_DICTIONARY): ColumnProfile[] {
  const width = Math.max(headers.length, ...rows.map(r => r.length), 0);
  return Array.from({ length: width }, (_, index) => {
    const values = rows.map(r => r[index]).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
    const numeric = values.map(numberValue).filter((v): v is number => v !== undefined);
    const dates = values.filter(dateLike);
    const unique = new Set(values.map(v => normalizeHeader(v))).size;
    const lengths = values.map(v => String(v).length);
    const header = headers[index] === undefined ? undefined : String(headers[index]);
    const normalizedHeader = normalizeHeader(header ?? '');
    const patterns: string[] = [];
    if (numeric.length / Math.max(values.length, 1) > 0.8) patterns.push('numeric');
    if (dates.length / Math.max(values.length, 1) > 0.8) patterns.push('date');
    if (values.length && unique / values.length < 0.2) patterns.push('low-cardinality');
    if (values.some(v => /\b[A-Z]{2,}\-?\d{2,}\b/i.test(String(v)))) patterns.push('identifier-like');

    const candidates = tokenScore(normalizedHeader, dictionary);
    if (numeric.length / Math.max(values.length, 1) > 0.85) {
      if (/(qty|quantity|كمية|عدد)/.test(normalizedHeader)) candidates.push({ field: 'quantity', score: 0.92, evidence: ['numeric-profile'] });
      if (/(price|amount|السعر|المبلغ|اجمالي|total)/.test(normalizedHeader)) candidates.push({ field: 'unit_price', score: 0.88, evidence: ['numeric-profile'] });
    }
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0]?.score ?? 0;
    return {
      index,
      originalHeader: header,
      normalizedHeader,
      primitiveKind: numeric.length === values.length && values.length ? 'number' : dates.length === values.length && values.length ? 'date' : values.length ? 'string' : 'empty',
      nonEmptyRatio: values.length / Math.max(rows.length, 1),
      uniqueRatio: values.length ? unique / values.length : 0,
      numericRatio: numeric.length / Math.max(values.length, 1),
      dateRatio: dates.length / Math.max(values.length, 1),
      averageLength: lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0,
      min: numeric.length ? Math.min(...numeric) : undefined,
      max: numeric.length ? Math.max(...numeric) : undefined,
      patterns,
      candidates: candidates.slice(0, 5),
      confidence: best
    };
  });
}
