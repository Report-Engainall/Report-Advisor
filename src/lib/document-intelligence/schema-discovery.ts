import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { z } from 'zod';
import { normalizeHeader, tokenScore } from './header-dictionary.ts';

const valueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

function dateLike(value: string): boolean {
  return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(value) || /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(value);
}

function numericLike(value: string | number | boolean | null): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string' || !value.trim()) return false;
  const n = Number(value.replace(/,/g, ''));
  return Number.isFinite(n);
}

export function discoverSchema(headers: unknown[], rows: unknown[][], dictionary: Record<string, string[]> = {}): Array<{field: string; score: number; evidence: string[]}> {
  const safeHeaders = headers.map((value) => String(value ?? ''));
  return safeHeaders.map((header, index) => {
    const values = rows.map((row) => valueSchema.safeParse(row?.[index]).success ? row?.[index] : null);
    const numeric = values.filter(numericLike);
    const dates = values.filter((value): value is string => typeof value === 'string' && dateLike(value));
    const unique = new Set(values.map(v => normalizeHeader(v))).size;
    const lengths = values.map(v => String(v).length);
    const normalizedHeader = normalizeHeader(header);
    const patterns: string[] = [];
    const numericRatio = numeric.length / Math.max(values.length, 1);
    const dateRatio = dates.length / Math.max(values.length, 1);
    if (numericRatio > 0.8) patterns.push('numeric');
    if (dateRatio > 0.8) patterns.push('date');
    if (values.length && unique / values.length < 0.2) patterns.push('low-cardinality');
    if (values.some(v => /\b[A-Z]{2,}-?\d{2,}\b/i.test(String(v)))) patterns.push('identifier-like');
    const candidates = tokenScore(normalizedHeader, dictionary);
    if (numericRatio > 0.85) {
      if (/^(qty|quantity|كمية|الكمية|عدد)$/.test(normalizedHeader)) candidates.push({ field: 'quantity', score: 0.92, evidence: ['numeric-profile', 'exact-semantic-pattern'] });
      if (/^(unit price|selling price|سعر الوحدة|سعر البيع|السعر)$/.test(normalizedHeader)) candidates.push({ field: 'unit_price', score: 0.90, evidence: ['numeric-profile', 'exact-semantic-pattern'] });
      if (/^(total amount|net amount|grand total|الإجمالي|المجموع)$/.test(normalizedHeader)) candidates.push({ field: 'total_amount', score: 0.90, evidence: ['numeric-profile', 'exact-semantic-pattern'] });
    }
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0]?.score ?? 0;
    return { field: candidates[0]?.field ?? `column_${index + 1}`, score: best, evidence: [...(candidates[0]?.evidence ?? []), ...patterns, `avg-length=${lengths.length ? Math.round(lengths.reduce((a,b)=>a+b,0)/lengths.length) : 0}`, `source-ext=${extname(header)}`] };
  });
}

export async function loadSchemaSource(filePath: string): Promise<string> {
  return readFile(filePath, 'utf8');
}
