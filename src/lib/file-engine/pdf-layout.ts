import { normalizeColumnName } from './normalizer.ts';
import { HEADER_HINTS } from './header-detection.ts';

export type PdfTextItemLike = {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
};

export type PdfTableLayout = {
  headers: string[];
  centers: number[];
};

export type PdfPageTable = {
  layout: PdfTableLayout;
  rows: Record<string, string>[];
  confidence: number;
};

type PositionedToken = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Line = {
  y: number;
  tokens: PositionedToken[];
};

const SUMMARY_PATTERNS = [
  'الرصيد الافتتاحي',
  'تحويل غير مستلم',
  'صافي الوارد',
  'عدد السجلات',
  'الإجمالي',
  'اجمالي',
  'total:',
];

function normalizeForMatch(value: string): string {
  return normalizeColumnName(value)
    .replace(/\u0640/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function isSummaryLine(text: string): boolean {
  const normalized = normalizeForMatch(text);
  return SUMMARY_PATTERNS.some((pattern) => normalized.includes(normalizeForMatch(pattern)));
}

function isHeaderGroup(text: string): boolean {
  const normalized = normalizeForMatch(text);
  return HEADER_HINTS.some((hint) => normalized.includes(normalizeForMatch(hint)));
}

function toToken(item: PdfTextItemLike): PositionedToken | null {
  if (typeof item.str !== 'string' || !item.str.trim() || !Array.isArray(item.transform) || item.transform.length < 6) return null;
  const x = Number(item.transform[4]);
  const y = Number(item.transform[5]);
  const width = Number(item.width ?? 0);
  const height = Math.abs(Number(item.height ?? item.transform[3] ?? 10));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return {
    text: item.str.replace(/\s+/g, ' ').trim(),
    x,
    y,
    width: Number.isFinite(width) ? Math.max(0, width) : 0,
    height: Number.isFinite(height) && height > 0 ? height : 10,
  };
}

function groupIntoLines(items: PdfTextItemLike[]): Line[] {
  const tokens = items.map(toToken).filter((token): token is PositionedToken => Boolean(token));
  const sorted = [...tokens].sort((a, b) => b.y - a.y || b.x - a.x);
  const lines: Line[] = [];

  for (const token of sorted) {
    const tolerance = Math.max(2.5, token.height * 0.45);
    const existing = lines.find((line) => Math.abs(line.y - token.y) <= tolerance);
    if (existing) {
      existing.tokens.push(token);
      existing.y = (existing.y + token.y) / 2;
    } else {
      lines.push({ y: token.y, tokens: [token] });
    }
  }

  lines.sort((a, b) => b.y - a.y);
  for (const line of lines) line.tokens.sort((a, b) => b.x - a.x);
  return lines;
}

function mergeHeaderTokens(tokens: PositionedToken[]): PositionedToken[] {
  const ordered = [...tokens].sort((a, b) => b.x - a.x);
  const groups: PositionedToken[] = [];

  for (const token of ordered) {
    const previous = groups[groups.length - 1];
    const previousLeft = previous ? Math.min(previous.x, previous.x + previous.width) : 0;
    const tokenRight = Math.max(token.x, token.x + token.width);
    const gap = previous ? previousLeft - tokenRight : Number.POSITIVE_INFINITY;
    const mergeGap = Math.max(7, token.height * 1.8);

    if (previous && gap >= -2 && gap <= mergeGap) {
      const previousRight = Math.max(previous.x, previous.x + previous.width);
      const tokenLeft = Math.min(token.x, token.x + token.width);
      previous.x = Math.min(tokenLeft, previous.x);
      previous.width = Math.max(previousRight, Math.max(token.x, token.x + token.width)) - previous.x;
      previous.text = `${previous.text} ${token.text}`.trim();
    } else {
      groups.push({ ...token });
    }
  }

  return groups.sort((a, b) => b.x - a.x);
}

function findHeaderLayout(lines: Line[]): { lineIndex: number; layout: PdfTableLayout; score: number } | null {
  const candidates = lines.map((line, lineIndex) => {
    const groups = mergeHeaderTokens(line.tokens);
    const matching = groups.filter((group) => isHeaderGroup(group.text));
    const text = groups.map((group) => group.text).join(' ');
    const numericOnly = groups.filter((group) => /^[\d٠-٩.,%+\-\s]+$/u.test(group.text)).length;
    const score =
      Math.min(matching.length, 8) * 15 +
      Math.min(groups.length, 12) * 2 +
      (matching.length >= 3 ? 20 : 0) -
      numericOnly * 3 -
      (isSummaryLine(text) ? 40 : 0);
    return { lineIndex, groups, matching, score };
  });

  candidates.sort((a, b) => b.score - a.score || a.lineIndex - b.lineIndex);
  const best = candidates[0];
  if (!best || best.matching.length < 3 || best.groups.length < 3 || best.score < 55) return null;

  const headers = best.groups.map((group) => group.text);
  const centers = best.groups.map((group) => group.x + group.width / 2);
  return {
    lineIndex: best.lineIndex,
    layout: { headers, centers },
    score: Math.min(100, Math.round(best.score)),
  };
}

function assignRowToLayout(tokens: PositionedToken[], layout: PdfTableLayout): Record<string, string> {
  const values: string[][] = layout.headers.map(() => []);
  if (!tokens.length) return Object.fromEntries(layout.headers.map((header) => [header, '']));

  for (const token of tokens) {
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    const tokenCenter = token.x + token.width / 2;
    for (let index = 0; index < layout.centers.length; index += 1) {
      const nextDistance = Math.abs(layout.centers[index] - tokenCenter);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = index;
      }
    }
    values[nearest]?.push(token.text);
  }

  return Object.fromEntries(
    layout.headers.map((header, index) => [header, values[index]?.join(' ').trim() ?? '']),
  );
}

function rowPopulation(row: Record<string, string>): number {
  return Object.values(row).filter((value) => value.trim() !== '').length;
}

function looksLikeDataRow(row: Record<string, string>, layout: PdfTableLayout): boolean {
  const values = Object.values(row).filter(Boolean);
  if (values.length < Math.max(2, Math.ceil(layout.headers.length * 0.35))) return false;
  const text = values.join(' ');
  if (/^PAGE\s+\d+$/i.test(text) || isSummaryLine(text)) return false;
  return rowPopulation(row) >= 2;
}

export function extractPdfPageTable(items: PdfTextItemLike[], existingLayout?: PdfTableLayout): PdfPageTable | null {
  const lines = groupIntoLines(items);
  if (!lines.length) return null;

  const detected = findHeaderLayout(lines);
  const layout = detected?.layout ?? existingLayout;
  const startIndex = detected ? detected.lineIndex + 1 : 0;
  if (!layout || layout.headers.length < 3) return null;

  const rows: Record<string, string>[] = [];
  for (let index = startIndex; index < lines.length; index += 1) {
    const row = assignRowToLayout(lines[index].tokens, layout);
    if (looksLikeDataRow(row, layout)) rows.push(row);
  }

  const confidence = Math.min(
    100,
    Math.round(
      (detected?.score ?? 55) +
      Math.min(rows.length, 10) * 2 +
      (detected ? 10 : 0),
    ),
  );

  if (rows.length < 1) return null;
  return { layout, rows, confidence };
}

export function extractPdfReadingText(items: PdfTextItemLike[]): string {
  return groupIntoLines(items)
    .map((line) => line.tokens.map((token) => token.text).join(' ').trim())
    .filter(Boolean)
    .join('\n');
}
