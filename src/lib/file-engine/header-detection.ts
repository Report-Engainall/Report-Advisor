import { normalizeColumnName } from './normalizer.ts';

export type HeaderCandidate = {
  rowIndex: number;
  score: number;
  headers: string[];
  reasons: string[];
};

const HEADER_HINTS = [
  'sku', 'code', 'item', 'product', 'name', 'price', 'quantity', 'qty',
  'رقم', 'كود', 'صنف', 'منتج', 'اسم', 'السعر', 'الكمية', 'العدد', 'التاريخ', 'date',
];

function nonEmpty(values: unknown[]): string[] {
  return values.map(v => String(v ?? '').trim()).filter(Boolean);
}

function uniqueRatio(values: string[]): number {
  if (!values.length) return 0;
  return new Set(values.map(normalizeColumnName)).size / values.length;
}

/**
 * Detects a likely header row instead of assuming row zero is the header.
 * This is deliberately deterministic: it scores structure and known field hints,
 * never asking an LLM to decide the schema.
 */
export function detectHeaderRow(rows: unknown[][], maxRows = Math.min(rows.length, 25)): HeaderCandidate | null {
  if (!rows.length) return null;
  const candidates: HeaderCandidate[] = [];

  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    const headers = nonEmpty(rows[rowIndex] ?? []);
    if (!headers.length) continue;

    const normalized = headers.map(normalizeColumnName);
    const next = rows[rowIndex + 1] ? nonEmpty(rows[rowIndex + 1]) : [];
    const isSingleKnownHeader = headers.length === 1
      && next.length >= 1
      && HEADER_HINTS.some(hint => normalized[0]?.includes(normalizeColumnName(hint)));
    if (headers.length === 1 && !isSingleKnownHeader) continue;

    const textLike = headers.filter(v => /[^\d.,%\-+\s]/u.test(v)).length / headers.length;
    const unique = uniqueRatio(headers);
    const hints = normalized.filter(h => HEADER_HINTS.some(x => h.includes(normalizeColumnName(x)))).length;
    const nextWidth = next.length;

    let score = 0;
    const reasons: string[] = [];
    score += Math.min(headers.length, 12) * 3;
    if (textLike >= 0.6) { score += 15; reasons.push('text-like headers'); }
    if (unique >= 0.8) { score += 15; reasons.push('unique headers'); }
    if (hints) { score += Math.min(hints * 8, 24); reasons.push('canonical field hints'); }
    const minimumNextWidth = headers.length === 1 ? 1 : Math.max(2, Math.floor(headers.length * 0.7));
    if (nextWidth >= minimumNextWidth) { score += 20; reasons.push('next row matches width'); }
    if (headers.length === 1) { score += 5; reasons.push('single-field canonical header'); }
    if (rowIndex === 0) score += 5;
    if (rowIndex > 0) score -= Math.min(rowIndex, 10);

    candidates.push({ rowIndex, score, headers, reasons });
  }

  candidates.sort((a, b) => b.score - a.score || a.rowIndex - b.rowIndex);
  return candidates[0] ?? null;
}

export function rowsFromDetectedHeader(rows: unknown[][], candidate: HeaderCandidate): Record<string, unknown>[] {
  const headers = candidate.headers.map((h, i) => h || `column_${i + 1}`);
  return rows.slice(candidate.rowIndex + 1).map(row =>
    Object.fromEntries(headers.map((header, i) => [header, row?.[i] ?? '']))
  );
}
