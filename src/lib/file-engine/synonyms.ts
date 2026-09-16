import { supabase } from '../supabase';
import { normalizeColumnName } from './normalizer';
import type { SynonymEntry } from './types';

let synonymCache: Map<string, { canonical: string; confidence: number }> | null = null;

const BUILTIN_SYNONYMS: Array<[string, string, number]> = [
  ['sku', 'sku', 96], ['item code', 'sku', 96], ['product code', 'sku', 96], ['item id', 'sku', 92], ['رقم الصنف', 'sku', 98], ['كود الصنف', 'sku', 98], ['رمز الصنف', 'sku', 96],
  ['الباركود', 'barcode', 96], ['barcode', 'barcode', 96], ['باركود', 'barcode', 96], ['name', 'name', 96], ['item name', 'name', 98], ['product name', 'name', 98], ['اسم الصنف', 'name', 98], ['اسم المنتج', 'name', 98],
  ['description', 'description', 94], ['الوصف', 'description', 96], ['price', 'price', 96], ['sale price', 'price', 96], ['selling price', 'price', 96], ['السعر', 'price', 98], ['سعر البيع', 'price', 98],
  ['cost', 'cost', 94], ['التكلفة', 'cost', 96], ['quantity', 'quantity', 96], ['qty', 'quantity', 96], ['stock', 'quantity', 94], ['available quantity', 'quantity', 96], ['الكمية', 'quantity', 98], ['المخزون', 'quantity', 96],
  ['unit', 'unit', 96], ['الوحدة', 'unit', 98], ['category', 'category', 94], ['الفئة', 'category', 96], ['التصنيف', 'category', 96], ['status', 'status', 94], ['الحالة', 'status', 96],
  ['customer number', 'customer_number', 98], ['customer id', 'customer_number', 96], ['رقم العميل', 'customer_number', 98], ['customer name', 'customer_name', 98], ['اسم العميل', 'customer_name', 98], ['phone', 'phone', 96], ['mobile', 'phone', 96], ['هاتف', 'phone', 96], ['جوال', 'phone', 96],
  ['email', 'email', 96], ['البريد الإلكتروني', 'email', 98], ['date', 'date', 94], ['التاريخ', 'date', 96], ['total', 'total', 94], ['الإجمالي', 'total', 96],
];

function createBuiltinMap(): Map<string, { canonical: string; confidence: number }> { const map = new Map<string, { canonical: string; confidence: number }>(); for (const [synonym, canonical, confidence] of BUILTIN_SYNONYMS) map.set(normalizeColumnName(synonym), { canonical, confidence }); return map; }
export async function loadSynonyms(): Promise<Map<string, { canonical: string; confidence: number }>> { if (synonymCache) return synonymCache; const map = createBuiltinMap(); const { data, error } = await supabase.from('synonym_dictionary').select('*').eq('is_active', true); if (!error && data) for (const entry of data as SynonymEntry[]) { const key = normalizeColumnName(entry.synonym); const existing = map.get(key); if (!existing || entry.confidence > existing.confidence) map.set(key, { canonical: entry.canonical_field, confidence: entry.confidence }); } synonymCache = map; return map; }
export function clearSynonymCache(): void { synonymCache = null; }
export interface ColumnMapping { sourceColumn: string; mappedField: string | null; confidence: number; requiresReview: boolean; }
export async function mapColumns(sourceColumns: string[]): Promise<ColumnMapping[]> { const synonyms = await loadSynonyms(); return sourceColumns.map(col => { const normalized = normalizeColumnName(col); const match = synonyms.get(normalized); if (match) return { sourceColumn: col, mappedField: match.canonical, confidence: match.confidence, requiresReview: match.confidence < 80 }; const partialMatch = findPartialMatch(normalized, synonyms); return partialMatch ? { sourceColumn: col, mappedField: partialMatch.canonical, confidence: partialMatch.confidence, requiresReview: true } : { sourceColumn: col, mappedField: null, confidence: 0, requiresReview: true }; }); }
function findPartialMatch(normalized: string, synonyms: Map<string, { canonical: string; confidence: number }>): { canonical: string; confidence: number } | null { let bestMatch: { canonical: string; confidence: number } | null = null; let bestScore = 0; for (const [key, value] of synonyms) { if (normalized.includes(key) || key.includes(normalized)) { const score = Math.min(normalized.length, key.length) / Math.max(normalized.length, key.length) * value.confidence * 0.7; if (score > bestScore && score > 50) { bestScore = score; bestMatch = { canonical: value.canonical, confidence: Math.round(score) }; } } } return bestMatch; }
export async function addSynonym(canonicalField: string, synonym: string, language = 'ar', confidence = 90): Promise<void> { const { error } = await supabase.from('synonym_dictionary').insert({ canonical_field: canonicalField, synonym, language, confidence, is_active: true }); if (error) throw error; clearSynonymCache(); }
export async function fetchAllSynonyms(): Promise<SynonymEntry[]> { const { data, error } = await supabase.from('synonym_dictionary').select('*').order('canonical_field', { ascending: true }); if (error) throw error; return data as SynonymEntry[]; }
export async function updateSynonym(id: string, updates: Partial<SynonymEntry>): Promise<void> { const { error } = await supabase.from('synonym_dictionary').update(updates).eq('id', id); if (error) throw error; clearSynonymCache(); }
export async function deleteSynonym(id: string): Promise<void> { const { error } = await supabase.from('synonym_dictionary').delete().eq('id', id); if (error) throw error; clearSynonymCache(); }
