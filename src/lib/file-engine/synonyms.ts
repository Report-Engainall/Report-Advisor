import { normalizeColumnName } from './normalizer.ts';
import type { SynonymEntry } from './types.ts';

let synonymCache: Map<string, { canonical: string; confidence: number }> | null = null;

const BUILTIN_SYNONYMS: Array<[string, string, number]> = [
  ['sku', 'sku', 96],
  ['البيان', 'description', 96], ['رقمه', 'document_no', 96], ['المستند', 'document_no', 96], ['الرصيد', 'balance', 98], ['دائن', 'credit', 98], ['مدين', 'debit', 98], ['الإجمالي', 'total', 98],
  ['رقمه', 'document_no', 96], ['العمله', 'currency', 98], ['حالت', 'status', 96],
  ['كافهالعملاتتفصيلي الرصيد', 'balance', 96], ['كافة العملات تفصيلي الرصيد', 'balance', 96], ['دائن > :', 'credit', 96], ['مدين', 'debit', 98],
  ['المستوى', 'level', 98], ['اسم المستوى', 'level_name', 98], ['المخزن', 'warehouse', 98],
  ['نسبة الربح', 'margin_percent', 96], ['نسبة\r\nالربح', 'margin_percent', 96], ['هامش الربح', 'margin', 96],
  ['العملة', 'currency', 98], ['الحد الأدني للتسعيرة', 'min_price', 96], ['الحد الأدنى للتسعيرة', 'min_price', 96], ['الحد الأعلى للتسعيرة', 'max_price', 96],
  ['الكمية المتوفرة', 'available_quantity', 98], ['الكمية\r\nالمتوفرة', 'available_quantity', 98], ['متوسط التكلفه YER', 'average_cost', 96], ['متوسط التكلفة YER', 'average_cost', 96],
  ['آخر سعر توريد YER', 'last_supply_price', 96], ['آخر سعر شراء YER', 'last_purchase_price', 96], ['ملاحظات', 'notes', 98],
  ['المستوى', 'level', 98], ['اسم المستوى', 'level_name', 98], ['المخزن', 'warehouse', 98], ['نسبة الربح', 'profit_margin_pct', 98], ['نسبة\r\nالربح', 'profit_margin_pct', 98], ['هامش الربح', 'profit_margin', 98],
  ['العملة', 'currency', 98], ['السعر', 'selling_price', 98], ['الحد الأدني للتسعيرة', 'min_price', 98], ['الحد الأدنى للتسعيرة', 'min_price', 98], ['الحد الأعلى للتسعيرة', 'max_price', 98], ['الكمية\r\nالمتوفرة', 'quantity', 98], ['الكمية المتوفرة', 'quantity', 98],
  ['متوسط التكلفه YER', 'average_cost', 98], ['متوسط التكلفة YER', 'average_cost', 98], ['آخر سعر توريد YER', 'last_supply_price', 98], ['آخر سعر شراء YER', 'last_purchase_price', 98], ['ملاحظات', 'notes', 98], ['رقم الباركود', 'barcode', 98], ['المستوى', 'level', 92], ['اسم المستوى', 'level_name', 92], ['المخزن', 'warehouse', 96], ['نسبة الربح', 'profit_margin', 96], ['هامش الربح', 'profit_margin', 96], ['الحد الأدني للتسعيرة', 'min_price', 92], ['الحد الأعلى للتسعيرة', 'max_price', 92], ['الكمية المتوفرة', 'quantity', 96], ['متوسط التكلفه YER', 'average_cost', 96], ['متوسط التكلفة YER', 'average_cost', 96], ['آخر سعر توريد YER', 'last_supply_price', 92], ['آخر سعر شراء YER', 'last_purchase_price', 92], 
  ['م', 'row_number', 96], ['رقم المجموعة', 'group_id', 98], ['رقم الصنف', 'sku', 98], ['اسم الصنف', 'name', 98], ['الاسم الأجنبي', 'foreign_name', 98], ['الوحدة', 'unit', 98], ['رقم الباركود', 'barcode', 98], ['العبوه', 'package', 98], ['العبوة', 'package', 98], ['وحدة رئيسية', 'main_unit', 98], ['نوع الصنف', 'product_type', 98], ['التكلفة الأولية', 'cost_price', 98], ['المجموعات الفرعية', 'subcategory', 98], ['item code', 'sku', 96], ['product code', 'sku', 96], ['item id', 'sku', 92], ['رقم الصنف', 'sku', 98], ['كود الصنف', 'sku', 98], ['رمز الصنف', 'sku', 96], ['رقم الباركود', 'barcode', 98], ['رقم المجموعة', 'category', 98], ['المجموعات الفرعية', 'category', 90], ['نوع الصنف', 'item_type', 94], ['وحدة رئيسية', 'base_unit', 94], ['العبوه', 'pack_size', 94], ['التكلفة الأولية', 'cost_price', 98], ['الاسم الأجنبي', 'foreign_name', 90], ['م', 'row_index', 94],
  ['الباركود', 'barcode', 96], ['barcode', 'barcode', 96], ['باركود', 'barcode', 96], ['name', 'name', 96], ['item name', 'name', 98], ['product name', 'name', 98], ['اسم الصنف', 'name', 98], ['اسم المنتج', 'name', 98],
  ['description', 'description', 94], ['الوصف', 'description', 96], ['price', 'price', 96], ['sale price', 'selling_price', 98], ['selling price', 'selling_price', 98], ['selling_price', 'selling_price', 98], ['السعر', 'price', 98], ['سعر البيع', 'selling_price', 98],
  ['cost', 'cost', 94], ['cost price', 'cost_price', 98], ['cost_price', 'cost_price', 98], ['التكلفة', 'cost', 96], ['quantity', 'quantity', 96], ['qty', 'quantity', 96], ['stock', 'quantity', 94], ['available quantity', 'quantity', 96], ['الكمية', 'quantity', 98], ['المخزون', 'quantity', 96],
  ['unit', 'unit', 96], ['الوحدة', 'unit', 98], ['category', 'category', 94], ['الفئة', 'category', 96], ['التصنيف', 'category', 96], ['status', 'status', 94], ['الحالة', 'status', 96],
  ['min stock', 'min_stock', 98], ['minimum stock', 'min_stock', 96], ['min_stock', 'min_stock', 98], ['reorder point', 'reorder_point', 98], ['reorder_point', 'reorder_point', 98], ['is active', 'is_active', 98], ['is_active', 'is_active', 98], ['active', 'is_active', 92], ['نشط', 'is_active', 98],
  ['customer number', 'code', 98], ['customer code', 'code', 98], ['code', 'code', 98], ['رقم العميل', 'code', 98], ['كود العميل', 'code', 98], ['customer id', 'customer_id', 96], ['customer name', 'customer_name', 98], ['اسم العميل', 'customer_name', 98], ['phone', 'phone', 96], ['mobile', 'phone', 96], ['هاتف', 'phone', 96], ['جوال', 'phone', 96],
  ['email', 'email', 96], ['supplier_id', 'supplier_id', 98], ['supplier_name', 'supplier_name', 98], ['رقم المورد', 'supplier_id', 98], ['كود المورد', 'supplier_id', 98], ['اسم المورد', 'supplier_name', 98], ['إجمالي المبلغ المستحق', 'outstanding_balance', 98], ['المبلغ المستحق', 'outstanding_balance', 96], ['المبلغ بالعملة المحلية', 'local_amount', 98], ['المبلغ', 'local_amount', 94], ['0 - 30', 'age_0_30', 98], ['31 - 60', 'age_31_60', 98], ['61 - 90', 'age_61_90', 98], ['91 - 120', 'age_91_120', 98], ['> 120', 'age_over_120', 98], ['>120', 'age_over_120', 98], ['supplier_id', 'supplier_id', 98], ['supplier_name', 'supplier_name', 98], ['purchase_amount', 'purchase_amount', 98], ['sales_rep', 'sales_rep', 94], ['المبلغ', 'purchase_amount', 98], ['المندوب', 'sales_rep', 94], ['customer_id', 'customer_id', 98], ['customer_name', 'customer_name', 98], ['currency', 'currency', 98], ['local_amount', 'local_amount', 98], ['outstanding_balance', 'outstanding_balance', 98], ['age_0_30', 'age_0_30', 98], ['age_31_60', 'age_31_60', 98], ['age_61_90', 'age_61_90', 98], ['age_91_120', 'age_91_120', 98], ['age_over_120', 'age_over_120', 98], ['البريد الإلكتروني', 'email', 98], ['segment', 'segment', 98], ['customer segment', 'segment', 98], ['شريحة العميل', 'segment', 98], ['credit limit', 'credit_limit', 98], ['credit_limit', 'credit_limit', 98], ['حد ائتماني', 'credit_limit', 98], ['payment terms days', 'payment_terms_days', 98], ['payment_terms_days', 'payment_terms_days', 98], ['payment terms', 'payment_terms_days', 90], ['أيام شروط الدفع', 'payment_terms_days', 98],
  ['رقم الفاتورة', 'invoice_number', 98], ['تاريخ الفاتورة', 'invoice_date', 98], ['نوع الفاتورة', 'invoice_type', 94], ['العملة', 'currency', 96], ['مبلغ الفاتورة', 'invoice_amount', 94], ['الخصم', 'discount', 94], ['الأعباء', 'charges', 90], ['اﻷعباء', 'charges', 90], ['الضريبة', 'tax_amount', 98], ['اجمالي الفاتورة', 'total', 98], ['مبلغ الصافي بالمحلي', 'net_local_amount', 92],
  ['date', 'date', 94], ['التاريخ', 'date', 96], ['invoice number', 'invoice_number', 98], ['invoice_number', 'invoice_number', 98], ['invoice date', 'invoice_date', 98], ['invoice_date', 'invoice_date', 98], ['subtotal', 'subtotal', 98], ['tax amount', 'tax_amount', 98], ['tax_amount', 'tax_amount', 98], ['paid amount', 'paid_amount', 98], ['paid_amount', 'paid_amount', 98], ['total', 'total', 94], ['الإجمالي', 'total', 96],
  ['البيان', 'description', 98], ['رقمه', 'reference', 98], ['رقم المستند', 'reference', 98], ['المستند', 'document_number', 98], ['حالته', 'status', 98], ['الرصيد', 'balance', 98], ['دائن', 'credit', 98], ['مدين', 'debit', 98], ['رصيد سابق', 'opening_balance', 98],
  ['balance', 'balance', 98], ['credit', 'credit', 98], ['debit', 'debit', 98],
  ['payment_amount', 'payment_amount', 98], ['reference', 'reference', 98], ['amount', 'payment_amount', 96], ['المبلغ', 'payment_amount', 98], ['قيمة العملية', 'payment_amount', 98], ['قيمة', 'payment_amount', 96], ['الرقم المرجعي', 'reference', 98], ['المرجع', 'reference', 98],
  ['الرصيد الحالي', 'balance', 98],
  ['الرصيد الافتتاحي', 'opening_balance', 98],
  ['الرصيد اﻹفتتاحي', 'opening_balance', 98],
  ['الحركه خلال الفترة دائن', 'period_credit', 96],
  ['الحركة خلال الفترة دائن', 'period_credit', 96],
  ['الحركه خلال الفترة مدين', 'period_debit', 96],
  ['الحركة خلال الفترة مدين', 'period_debit', 96],
  ['الرصيد الحالي دائن', 'current_credit', 96],
  ['الرصيد الحالي مدين', 'current_debit', 96],
  ['الرصيد الافتتاحي دائن', 'opening_credit', 96],
  ['الرصيد الافتتاحي مدين', 'opening_debit', 96],
  ['الاسم', 'name', 96],
  ['رقم البنك', 'bank_id', 98],
  ['رقم الحساب', 'account_number', 98],
  ['current balance', 'balance', 98],
  ['opening balance', 'opening_balance', 98],

  ['current_credit', 'current_credit', 98],
  ['current_debit', 'current_debit', 98],
  ['period_credit', 'period_credit', 98],
  ['period_debit', 'period_debit', 98],
  ['opening_credit', 'opening_credit', 98],
  ['opening_debit', 'opening_debit', 98],
  ['bank_id', 'bank_id', 98],
  ['account_number', 'account_number', 98],
  ['name', 'name', 98],
  ['currency', 'currency', 98],
  ['رقم الصنف', 'sku', 98], ['كود الصنف', 'sku', 98], ['اسم الصنف', 'product_name', 98], ['الصنف', 'product_name', 96], ['الوحدة', 'unit', 98], ['الكمية الافتتاحية', 'opening_quantity', 98], ['كمية افتتاحية', 'opening_quantity', 98], ['المخزون الافتتاحي', 'opening_quantity', 98], ['الكمية', 'quantity', 98], ['المخزون', 'quantity', 96], ['التكلفة', 'cost', 96], ['سعر التكلفة', 'cost_price', 98], ['متوسط التكلفة', 'average_cost', 98], ['قيمة المخزون', 'inventory_value', 98], ['اجمالي', 'total', 94], ['الإجمالي', 'total', 96],
  ['الـوارد', 'inbound_quantity', 98], ['الوارد', 'inbound_quantity', 98], ['تحويل غير مستلم', 'transfer_unreceived', 98], ['تحويل\r\nغير مستلم', 'transfer_unreceived', 98], ['صافي الوارد', 'net_inbound', 98], ['صافي\r\nالوارد', 'net_inbound', 98], ['صافي مبيعات مرحل', 'posted_sales', 98], ['صافي\r\nمبيعات مرحل', 'posted_sales', 98], ['صافي مبيعات لم يرحل', 'unposted_sales', 98], ['صافي مبيعات\r\nلم يرحل', 'unposted_sales', 98], ['صافي المبيعات', 'net_sales', 98], ['معدل البيع ليومي', 'daily_sales_rate', 98], ['معدل البيع\r\nليومي', 'daily_sales_rate', 98], ['معدل البيع العام', 'average_sales_rate', 98], ['معدل البيع\r\nالعام', 'average_sales_rate', 98], ['الفترةالمتوقعة لنفاد الكمية', 'stockout_days', 98], ['الفترة المتوقعة لنفاد الكمية', 'stockout_days', 98], ['الفترةالمتوقعة\r\nلنفادالكمية', 'stockout_days', 98], ['عمر المخزون', 'inventory_age', 98], ['عمر\r\nالمخزون', 'inventory_age', 98], ['عمر المخزون للفترة', 'inventory_age_period', 98], ['عمر المخزون\r\nللفترة', 'inventory_age_period', 98], ['الرصيد الإفتتاحي', 'opening_quantity', 98], ['الرصيد الافتتاحي', 'opening_quantity', 98], ['الرصيد', 'quantity', 98],
];

function createBuiltinMap(): Map<string, { canonical: string; confidence: number }> { const map = new Map<string, { canonical: string; confidence: number }>(); for (const [synonym, canonical, confidence] of BUILTIN_SYNONYMS) map.set(normalizeColumnName(synonym), { canonical, confidence }); return map; }
async function getBrowserSupabase() { if (typeof window === 'undefined') throw new Error('BROWSER_SUPABASE_UNAVAILABLE_IN_SERVER_FILE_ENGINE'); const { supabase } = await import('../supabase'); return supabase; }

export async function loadSynonyms(): Promise<Map<string, { canonical: string; confidence: number }>> { if (synonymCache) return synonymCache; const map = createBuiltinMap(); if (typeof window !== 'undefined') { const { supabase } = await import('../supabase'); const { data, error } = await supabase.from('synonym_dictionary').select('*').eq('is_active', true); if (!error && data) for (const entry of data as SynonymEntry[]) { const key = normalizeColumnName(entry.synonym); const existing = map.get(key); if (!existing || entry.confidence > existing.confidence) map.set(key, { canonical: entry.canonical_field, confidence: entry.confidence }); } } synonymCache = map; return map; }
export function clearSynonymCache(): void { synonymCache = null; }
export interface ColumnMapping { sourceColumn: string; mappedField: string | null; confidence: number; requiresReview: boolean; }
export async function mapColumns(sourceColumns: string[]): Promise<ColumnMapping[]> { const synonyms = await loadSynonyms(); return sourceColumns.map(col => { const normalized = normalizeColumnName(col); const match = synonyms.get(normalized); if (match) return { sourceColumn: col, mappedField: match.canonical, confidence: match.confidence, requiresReview: match.confidence < 80 }; const partialMatch = findPartialMatch(normalized, synonyms); return partialMatch ? { sourceColumn: col, mappedField: partialMatch.canonical, confidence: partialMatch.confidence, requiresReview: true } : { sourceColumn: col, mappedField: null, confidence: 0, requiresReview: true }; }); }
function findPartialMatch(normalized: string, synonyms: Map<string, { canonical: string; confidence: number }>): { canonical: string; confidence: number } | null { let bestMatch: { canonical: string; confidence: number } | null = null; let bestScore = 0; for (const [key, value] of synonyms) { if (normalized.includes(key) || key.includes(normalized)) { const score = Math.min(normalized.length, key.length) / Math.max(normalized.length, key.length) * value.confidence * 0.7; if (score > bestScore && score > 50) { bestScore = score; bestMatch = { canonical: value.canonical, confidence: Math.round(score) }; } } } return bestMatch; }
export async function addSynonym(canonicalField: string, synonym: string, language = 'ar', confidence = 90): Promise<void> { const supabase = await getBrowserSupabase(); const { error } = await supabase.from('synonym_dictionary').insert({ canonical_field: canonicalField, synonym, language, confidence, is_active: true }); if (error) throw error; clearSynonymCache(); }
export async function fetchAllSynonyms(): Promise<SynonymEntry[]> { const supabase = await getBrowserSupabase(); const { data, error } = await supabase.from('synonym_dictionary').select('*').order('canonical_field', { ascending: true }); if (error) throw error; return data as SynonymEntry[]; }
export async function updateSynonym(id: string, updates: Partial<SynonymEntry>): Promise<void> { const supabase = await getBrowserSupabase(); const { error } = await supabase.from('synonym_dictionary').update(updates).eq('id', id); if (error) throw error; clearSynonymCache(); }
export async function deleteSynonym(id: string): Promise<void> { const supabase = await getBrowserSupabase(); const { error } = await supabase.from('synonym_dictionary').delete().eq('id', id); if (error) throw error; clearSynonymCache(); }
