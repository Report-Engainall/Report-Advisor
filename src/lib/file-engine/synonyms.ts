import { supabase, COMPANY_ID } from '../supabase';
import { normalizeColumnName } from './normalizer';
import type { SynonymEntry } from './types';

let synonymCache: Map<string, { canonical: string; confidence: number }> | null = null;

export async function loadSynonyms(): Promise<Map<string, { canonical: string; confidence: number }>> {
  if (synonymCache) return synonymCache;

  const { data, error } = await supabase
    .from('synonym_dictionary')
    .select('*')
    .eq('is_active', true);

  if (error || !data) {
    synonymCache = new Map();
    return synonymCache;
  }

  const map = new Map<string, { canonical: string; confidence: number }>();
  for (const entry of data as SynonymEntry[]) {
    const key = normalizeColumnName(entry.synonym);
    const existing = map.get(key);
    if (!existing || entry.confidence > existing.confidence) {
      map.set(key, { canonical: entry.canonical_field, confidence: entry.confidence });
    }
  }

  synonymCache = map;
  return map;
}

export function clearSynonymCache(): void {
  synonymCache = null;
}

export interface ColumnMapping {
  sourceColumn: string;
  mappedField: string | null;
  confidence: number;
  requiresReview: boolean;
}

export async function mapColumns(sourceColumns: string[]): Promise<ColumnMapping[]> {
  const synonyms = await loadSynonyms();
  const results: ColumnMapping[] = [];

  for (const col of sourceColumns) {
    const normalized = normalizeColumnName(col);
    const match = synonyms.get(normalized);

    if (match) {
      results.push({
        sourceColumn: col,
        mappedField: match.canonical,
        confidence: match.confidence,
        requiresReview: match.confidence < 80,
      });
    } else {
      const partialMatch = findPartialMatch(normalized, synonyms);
      if (partialMatch) {
        results.push({
          sourceColumn: col,
          mappedField: partialMatch.canonical,
          confidence: partialMatch.confidence,
          requiresReview: true,
        });
      } else {
        results.push({
          sourceColumn: col,
          mappedField: null,
          confidence: 0,
          requiresReview: true,
        });
      }
    }
  }

  return results;
}

function findPartialMatch(
  normalized: string,
  synonyms: Map<string, { canonical: string; confidence: number }>
): { canonical: string; confidence: number } | null {
  let bestMatch: { canonical: string; confidence: number } | null = null;
  let bestScore = 0;

  for (const [key, value] of synonyms) {
    if (normalized.includes(key) || key.includes(normalized)) {
      const score = Math.min(normalized.length, key.length) / Math.max(normalized.length, key.length) * value.confidence * 0.7;
      if (score > bestScore && score > 50) {
        bestScore = score;
        bestMatch = { canonical: value.canonical, confidence: Math.round(score) };
      }
    }
  }

  return bestMatch;
}

export async function addSynonym(canonicalField: string, synonym: string, language = 'ar', confidence = 90): Promise<void> {
  await supabase.from('synonym_dictionary').insert({
    company_id: COMPANY_ID,
    canonical_field: canonicalField,
    synonym: synonym,
    language,
    confidence,
    is_active: true,
  });
  clearSynonymCache();
}

export async function fetchAllSynonyms(): Promise<SynonymEntry[]> {
  const { data, error } = await supabase
    .from('synonym_dictionary')
    .select('*')
    .order('canonical_field', { ascending: true });
  if (error) return [];
  return data as SynonymEntry[];
}

export async function updateSynonym(id: string, updates: Partial<SynonymEntry>): Promise<void> {
  await supabase.from('synonym_dictionary').update(updates).eq('id', id);
  clearSynonymCache();
}

export async function deleteSynonym(id: string): Promise<void> {
  await supabase.from('synonym_dictionary').delete().eq('id', id);
  clearSynonymCache();
}
