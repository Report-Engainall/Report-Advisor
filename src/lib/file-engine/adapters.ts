import * as XLSX from 'xlsx';
import type { FileFormat, Dataset, ColumnProfile, ColumnStatistics } from './types.ts';
import { normalizeRows, normalizeColumnName, normalizeArabicDigits, parseNumber } from './normalizer.ts';
import { detectColumnDataType, cleanValue } from './data-types.ts';
import { mapColumns } from './synonyms.ts';
import { detectHeaderRow, rowsFromDetectedHeader } from './header-detection.ts';

type Row = Record<string, unknown>;

function generateId(): string { return Math.random().toString(36).substring(2, 9); }
function isRecord(value: unknown): value is Row { return typeof value === 'object' && value !== null && !Array.isArray(value); }

type PdfDocument = Awaited<ReturnType<typeof import('pdfjs-dist').getDocument>['promise']>;

function buildColumnProfiles(rows: Row[], columns: string[], mappings: Awaited<ReturnType<typeof mapColumns>>): ColumnProfile[] {
  return columns.map((col, idx) => {
    const mapping = mappings[idx];
    const values = rows.map((row) => row[col]).filter((value) => value !== null && value !== undefined && value !== '');
    const sample = values.slice(0, 200);
    const dataType = mapping?.mappedField ? detectColumnDataType(sample, mapping.mappedField) : detectColumnDataType(sample, col);
    const nullCount = rows.filter((row) => row[col] === null || row[col] === undefined || row[col] === '').length;
    const uniqueCount = new Set(values.map((value) => String(value))).size;
    const uniqueRatio = values.length ? uniqueCount / values.length : 0;
    const mappingConfidence = mapping?.confidence ?? 0;
    const requiresReview = mapping?.requiresReview ?? true;
    const statistics: ColumnStatistics = { count: values.length };
    if (['integer', 'decimal', 'currency', 'percentage'].includes(dataType)) {
      const nums = values.map(parseNumber).filter((n): n is number => n !== null);
      if (nums.length) {
        const sorted = [...nums].sort((a, b) => a - b);
        const sum = nums.reduce((s, n) => s + n, 0);
        statistics.min = sorted[0]; statistics.max = sorted[sorted.length - 1]; statistics.sum = sum; statistics.mean = sum / nums.length;
        statistics.median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
      }
    }
    return { name: col, mappedField: mapping?.mappedField ?? null, mappingConfidence, requiresReview,
      mappingEvidence: { sourceHeader: col, normalizedHeader: normalizeColumnName(col), matchedBy: mapping?.mappedField ? (mappingConfidence >= 80 ? 'exact' : 'partial') : 'unmapped', canonicalField: mapping?.mappedField ?? null, confidence: mappingConfidence, requiresReview },
      dataType, nullCount, uniqueCount, uniqueRatio, sampleValues: values.slice(0, 5), statistics, qualityIssues: [] };
  });
}

function materializeCanonicalFields(rows: Row[], columns: ColumnProfile[]): Row[] {
  const canonicalOwners = new Map<string, ColumnProfile>();
  for (const column of columns) { const field = column.mappedField; if (!field || column.mappingConfidence < 80) continue; const previous = canonicalOwners.get(field); if (!previous || column.mappingConfidence > previous.mappingConfidence) canonicalOwners.set(field, column); }
  return rows.map((row) => { const next: Row = { ...row }; for (const [field, column] of canonicalOwners) { if (Object.prototype.hasOwnProperty.call(next, field) && next[field] !== '' && next[field] != null) continue; const value = row[column.name]; if (value !== '' && value !== null && value !== undefined) next[field] = value; } return next; });
}

async function buildDataset(rows: Row[], name: string, source: string, sheet?: string): Promise<Dataset> {
  const normalized = normalizeRows(rows);
  if (!normalized.length) return { id: generateId(), name, source, sheet, rowCount: 0, columnCount: 0, columns: [], rows: [], preview: [], qualityScore: 0 };
  const columns = Object.keys(normalized[0]); const mappings = await mapColumns(columns); const columnProfiles = buildColumnProfiles(normalized, columns, mappings);
  for (const col of columnProfiles) { if (col.nullCount > normalized.length * 0.5) col.qualityIssues.push('أكثر من 50% من القيم فارغة'); if (col.mappingConfidence < 80 && col.mappedField) col.qualityIssues.push('تعيين منخفض الثقة — يحتاج مراجعة'); if (!col.mappedField) col.qualityIssues.push('لم يتم تعريف العمود'); }
  const cleanedRows = normalized.map((row) => Object.fromEntries(columnProfiles.map((col) => [col.name, cleanValue(row[col.name], col.dataType)])) as Row);
  const canonicalRows = materializeCanonicalFields(cleanedRows, columnProfiles);
  const qualityScore = columnProfiles.length ? Math.round(columnProfiles.reduce((s, c) => s + c.mappingConfidence, 0) / columnProfiles.length) : 0;
  return { id: generateId(), name, source, sheet, rowCount: canonicalRows.length, columnCount: columns.length, columns: columnProfiles, rows: canonicalRows, preview: canonicalRows.slice(0, 50), qualityScore };
}

function normalizeStructuredDocumentValue(value: string): string | number {
  const cleaned = normalizeArabicDigits(value.replace(/[٬،]/g, ',').replace(/٫/g, '.').replace(/\s+/g, ' ')).trim();
  const numeric = parseNumber(cleaned);
  return numeric === null ? cleaned : numeric;
}

function extractEmbeddedJson(text: string): unknown | null {
  for (const startToken of ['{', '['] as const) {
    const start = text.indexOf(startToken);
    if (start < 0) continue;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < text.length; i += 1) {
      const ch = text[i];
      if (inString) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === startToken) depth += 1;
      else if ((startToken === '{' && ch === '}') || (startToken === '[' && ch === ']')) {
        depth -= 1;
        if (depth === 0) {
          const candidate = text.slice(start, i + 1);
          try { return JSON.parse(candidate); } catch { break; }
        }
      }
    }
  }
  return null;
}

function stripControlCharacters(value: string): string {
  return Array.from(value, (character) => {
    const code = character.charCodeAt(0);
    return code <= 0x1f || code === 0x7f ? ' ' : character;
  }).join('');
}

function tryParseStructuredPdfText(text: string): Row[] | null {
  const compact = text.replace(/^PAGE\s+\d+\s*/i, '').trim();
  const candidates: unknown[] = [];
  try { candidates.push(JSON.parse(compact)); } catch { /* continue with embedded JSON and label extraction */ }
  const embedded = extractEmbeddedJson(compact);
  if (embedded !== null) candidates.push(embedded);

  const normalizeStructuredRecord = (record: Row): Row => {
    const normalizedRecord: Row = { ...record };
    for (const field of ['subtotal', 'tax_amount', 'total', 'paid_amount']) {
      const value = normalizedRecord[field];
      if (typeof value === 'string') normalizedRecord[field] = normalizeStructuredDocumentValue(value);
    }
    if (typeof normalizedRecord.invoice_date === 'string') {
      normalizedRecord.invoice_date = normalizeArabicDigits(normalizedRecord.invoice_date);
    }
    return normalizedRecord;
  };

  for (const parsed of candidates) {
    if (isRecord(parsed)) return [normalizeStructuredRecord(parsed)];
    if (Array.isArray(parsed) && parsed.length && parsed.every(isRecord)) return parsed.map(normalizeStructuredRecord);
  }

  const normalized = normalizeArabicDigits(
    stripControlCharacters(compact)
      .normalize('NFKC')
      .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
  const match = (pattern: RegExp): string | null => normalized.match(pattern)?.[1]?.trim() ?? null;
  const row: Row = {};
  const setIfPresent = (key: string, value: string | number | null): void => {
    if (value !== null && value !== '') row[key] = value;
  };

  setIfPresent('invoice_number', match(/(?:رقم\s*(?:الفاتورة|فاتورة)?|invoice\s*(?:number|no\.?)?)\s*[:：#-]?\s*(.*?)\s+(?=(?:التاريخ|date)\b)/i));
  const parsedInvoiceDate = match(/(?:التاريخ|date)\s*[:：-]?\s*(\d{4}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{1,2})/i);
  setIfPresent('invoice_date', parsedInvoiceDate?.replace(/\s*([-/])\s*/g, '$1') ?? null);
  setIfPresent('customer_name', match(/(?:العميل|اسم\s*العميل|customer\s*(?:name|customer)?)\s*[:：-]?\s*(.+?)\s+(?=(?:المجموع\s*الفرعي|المجموع|الإجمالي|subtotal|tax|total)\b)/i));
  setIfPresent('subtotal', normalizeStructuredDocumentValue(match(/(?:المجموع\s*الفرعي|subtotal)\s*[:：-]?\s*([\d٠-٩٬،.,\s]+)/i) ?? ''));
  setIfPresent('tax_amount', normalizeStructuredDocumentValue(match(/(?:الضريبة|ضريبة|tax)\s*[:：-]?\s*([\d٠-٩٬،.,\s]+)/i) ?? ''));
  setIfPresent('total', normalizeStructuredDocumentValue(match(/(?:الإجمالي|الاجمالي|\btotal\b)\s*[:：-]?\s*([\d٠-٩٬،.,\s]+)/i) ?? ''));
  setIfPresent('paid_amount', normalizeStructuredDocumentValue(match(/(?:المدفوع|المبلغ\s*المدفوع|paid)\s*[:：-]?\s*([\d٠-٩٬،.,\s]+)/i) ?? ''));
  setIfPresent('currency', match(/(?:العملة|عمله|currency)\s*[:：-]?\s*([A-Za-z]{3}|[A-Za-z]+)\b/i));

  const structuredLabelPatterns: Array<{ key: string; pattern: RegExp; numeric?: boolean }> = [
    { key: 'invoice_number', pattern: /(?:رقم\s*(?:الفاتورة|فاتورة)|invoice\s*(?:number|no\.?))/i },
    { key: 'invoice_date', pattern: /(?:التاريخ|date)/i },
    { key: 'customer_name', pattern: /(?:اسم\s*العميل|العميل|customer\s*name)/i },
    { key: 'subtotal', pattern: /(?:المجموع\s*الفرعي|subtotal)/i, numeric: true },
    { key: 'tax_amount', pattern: /(?:الضريبة|ضريبة|tax)/i, numeric: true },
    { key: 'paid_amount', pattern: /(?:المدفوع|المبلغ\s*المدفوع|paid)/i, numeric: true },
    { key: 'total', pattern: /(?:الإجمالي|الاجمالي|\btotal\b)/i, numeric: true },
    { key: 'currency', pattern: /(?:العملة|عمله|currency)/i },
  ];

  const missingRequired = ['invoice_number', 'invoice_date', 'customer_name', 'total']
    .some((key) => row[key] === null || row[key] === undefined || row[key] === '');
  if (missingRequired) {
    const matches: Array<{ key: string; start: number; end: number; numeric?: boolean }> = [];
    for (const definition of structuredLabelPatterns) {
      const found = definition.pattern.exec(normalized);
      if (found) matches.push({ key: definition.key, start: found.index, end: found.index + found[0].length, numeric: definition.numeric });
    }
    matches.sort((a, b) => a.start - b.start);
    for (let index = 0; index < matches.length; index += 1) {
      const current = matches[index];
      const next = matches[index + 1];
      const rawValue = normalized
        .slice(current.end, next?.start ?? normalized.length)
        .replace(/^[\s:：#-]+/, '')
        .trim();
      if (!rawValue || row[current.key] !== undefined) continue;
      const value = current.numeric ? rawValue.split(/\s+/)[0] ?? '' : rawValue;
      setIfPresent(current.key, current.numeric ? normalizeStructuredDocumentValue(value) : value);
    }
    if (row.total === undefined) {
      const totalMatch = normalized.match(/(?:^|\s)(?:الإجمالي|الاجمالي|\btotal\b)\s*[:：-]?\s*([\d٠-٩٬،.,\s]+)/i);
      setIfPresent('total', normalizeStructuredDocumentValue(totalMatch?.[1] ?? ''));
    }
  }

  const required = ['invoice_number', 'invoice_date', 'customer_name', 'total'];
  if (required.some((key) => row[key] === null || row[key] === undefined || row[key] === '')) return null;
  return [row];
}

export type OcrDisposition = 'REJECT' | 'REVIEW' | 'TRUSTED';
export const OCR_REJECT_THRESHOLD = 50;
export const OCR_TRUSTED_THRESHOLD = 75;

export function classifyOcrConfidence(score: number): OcrDisposition {
  if (!Number.isFinite(score) || score < OCR_REJECT_THRESHOLD) return 'REJECT';
  if (score < OCR_TRUSTED_THRESHOLD) return 'REVIEW';
  return 'TRUSTED';
}

async function buildTextDataset(
  text: string,
  fileName: string,
  sourceType: string,
  warning?: string,
  confidenceFloor?: number,
): Promise<Dataset[]> {
  const normalized = normalizeArabicDigits(
    text.replace(/\uFEFF/g, '').replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trim(),
  );
  if (!normalized) return [];

  const structured = sourceType.startsWith('pdf') ? tryParseStructuredPdfText(normalized) : null;
  if (structured) {
    const dataset = await buildDataset(structured, fileName, sourceType);
    const requiredStructuredFields = ['invoice_number', 'invoice_date', 'customer_name', 'total'];
    const structurallyVerified = requiredStructuredFields.every(
      (field) => structured[0]?.[field] !== null && structured[0]?.[field] !== undefined && structured[0]?.[field] !== '',
    );
    // Only native PDF text is structurally trusted at extraction time. OCR retains
    // its real confidence and can never be upgraded to trusted by the structured path.
    if (sourceType === 'pdf' && structurallyVerified) dataset.qualityScore = Math.max(dataset.qualityScore, 95);
    if (confidenceFloor != null) dataset.qualityScore = Math.min(dataset.qualityScore, Math.round(confidenceFloor));
    if (warning) dataset.columns.forEach((column) => column.qualityIssues.push(warning));
    return [dataset];
  }

  const rows: Row[] = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({ line_number: index + 1, text: line }));
  const dataset = await buildDataset(rows, fileName, sourceType);
  for (const column of dataset.columns) {
    column.qualityIssues.push('وثيقة نصية: لم يتم اختراع حقل أعمال؛ يلزم التعيين الدلالي قبل الكتابة');
    if (warning) column.qualityIssues.push(warning);
  }
  if (confidenceFloor != null) dataset.qualityScore = Math.min(dataset.qualityScore, Math.round(confidenceFloor));
  return [dataset];
}

export interface PdfTextPlacement {
  str: string;
  x: number;
  y: number;
  width: number;
}

interface PdfTableAnchor {
  header: string;
  centerX: number;
  left: number;
  right: number;
}

interface PdfTableHeader {
  anchors: PdfTableAnchor[];
  signature: string;
}

const PDF_TABLE_HEADER_ALIASES = [
  'رقمه',
  'العمله',
  'حالت',
  'كافهالعملاتتفصيلي الرصيد',
  'كافة العملات تفصيلي الرصيد',
  'دائن > :',
  'دائن',
  'مدين',
  'document no',
  'status',
  'debit',
  'credit',
  'رقم الفاتورة',
  'تاريخ الفاتورة',
  'التاريخ',
  'نوع الفاتورة',
  'اسم العميل',
  'العملة',
  'مبلغ الفاتورة',
  'الخصم',
  'الأعباء',
  'اﻷعباء',
  'الضريبة',
  'اجمالي الفاتورة',
  'مبلغ الصافي بالمحلي',
  'رقم العميل',
  'رقم المورد',
  'اسم المورد',
  'إجمالي المبلغ المستحق',
  'المبلغ بالعملة المحلية',
  'المبلغ',
  '0 - 30',
  '31 - 60',
  '61 - 90',
  '91 - 120',
  '> 120',
  '>120',
  'المندوب',
  'invoice number',
  'invoice date',
  'كشف حساب',
  'البيان',
  'رقمه',
  'المستند',
  'التاريخ',
  'العملة',
  'حالته',
  'الرصيد',
  'دائن',
  'مدين',
  'رصيد سابق',
  'customer name',
  'invoice type',
  'currency',
  'amount',
  'discount',
  'charges',
  'tax',
  'total',
] as const;

const PDF_TABLE_LINE_TOLERANCE = 4;
const PDF_TABLE_MIN_ANCHORS = 4;

type PdfGlyphMap = Map<number, number[]>;

function latin1Decode(bytes: Uint8Array): string {
  const chunkSize = 8192;
  let text = '';
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    let part = '';
    for (let i = 0; i < chunk.length; i += 1) part += String.fromCharCode(chunk[i]);
    text += part;
  }
  return text;
}

function latin1Encode(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i) & 0xff;
  return bytes;
}

function readU16BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readI16BE(bytes: Uint8Array, offset: number): number {
  return readU16BE(bytes, offset) - (bytes[offset] & 0x80 ? 0x10000 : 0);
}

function readU32BE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] * 0x1000000 + ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]);
}

function reverseTrueTypeCmap(fontBytes: Uint8Array): PdfGlyphMap {
  if (fontBytes.length < 12) return new Map();
  const numTables = readU16BE(fontBytes, 4);
  let cmapOffset = -1;
  for (let i = 0; i < numTables; i += 1) {
    const record = 12 + i * 16;
    if (record + 12 > fontBytes.length) break;
    const tag = String.fromCharCode(fontBytes[record], fontBytes[record + 1], fontBytes[record + 2], fontBytes[record + 3]);
    if (tag === 'cmap') {
      cmapOffset = readU32BE(fontBytes, record + 8);
      break;
    }
  }
  if (cmapOffset < 0 || cmapOffset + 4 > fontBytes.length) return new Map();

  const cmap = fontBytes.subarray(cmapOffset);
  const numSubtables = readU16BE(cmap, 2);
  const reverse: PdfGlyphMap = new Map();
  const add = (glyph: number, codePoint: number): void => {
    if (!glyph || !Number.isFinite(codePoint)) return;
    const list = reverse.get(glyph) ?? [];
    if (!list.includes(codePoint)) list.push(codePoint);
    reverse.set(glyph, list);
  };

  for (let i = 0; i < numSubtables; i += 1) {
    const record = 4 + i * 8;
    if (record + 8 > cmap.length) break;
    const subOffset = readU32BE(cmap, record + 4);
    if (subOffset < 0 || subOffset >= cmap.length) continue;
    const sub = cmap.subarray(subOffset);
    const format = readU16BE(sub, 0);

    if (format === 4 && sub.length >= 16) {
      const segCount = readU16BE(sub, 6) / 2;
      const endBase = 14;
      const startBase = endBase + segCount * 2 + 2;
      const deltaBase = startBase + segCount * 2;
      const rangeBase = deltaBase + segCount * 2;
      for (let segment = 0; segment < segCount; segment += 1) {
        const endPos = endBase + segment * 2;
        const startPos = startBase + segment * 2;
        const deltaPos = deltaBase + segment * 2;
        const rangePos = rangeBase + segment * 2;
        if (rangePos + 2 > sub.length) break;
        const end = readU16BE(sub, endPos);
        const start = readU16BE(sub, startPos);
        const delta = readI16BE(sub, deltaPos);
        const range = readU16BE(sub, rangePos);
        for (let codePoint = start; codePoint <= end && codePoint !== 0xffff; codePoint += 1) {
          let glyph = 0;
          if (range === 0) {
            glyph = (codePoint + delta) & 0xffff;
          } else {
            const glyphPos = rangePos + range + 2 * (codePoint - start);
            if (glyphPos + 2 <= sub.length) {
              glyph = readU16BE(sub, glyphPos);
              if (glyph) glyph = (glyph + delta) & 0xffff;
            }
          }
          add(glyph, codePoint);
        }
      }
    } else if (format === 12 && sub.length >= 16) {
      const groups = readU32BE(sub, 12);
      let cursor = 16;
      for (let group = 0; group < groups && cursor + 12 <= sub.length; group += 1) {
        const start = readU32BE(sub, cursor);
        const end = readU32BE(sub, cursor + 4);
        const startGlyph = readU32BE(sub, cursor + 8);
        for (let codePoint = start; codePoint <= end; codePoint += 1) add(startGlyph + (codePoint - start), codePoint);
        cursor += 12;
      }
    }
  }

  return reverse;
}

async function inflatePdfStream(bytes: Uint8Array): Promise<Uint8Array> {
  let input = bytes;
  while (input.length && (input[0] === 0x0a || input[0] === 0x0d)) input = input.subarray(1);
  const DecompressionStreamCtor = (globalThis as typeof globalThis & {
    DecompressionStream?: new (format: string) => TransformStream;
  }).DecompressionStream;
  if (DecompressionStreamCtor) {
    try {
      const stream = new Blob([input]).stream().pipeThrough(new DecompressionStreamCtor('deflate'));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch {
      // Fall through to Node's zlib for server-side/CI execution.
    }
  }
  if (typeof window === 'undefined') {
    try {
      const { inflateSync } = await import(/* @vite-ignore */ 'node:zlib');
      return new Uint8Array(inflateSync(input));
    } catch (error) {
      throw new Error(`PDF_EMBEDDED_FONT_DECOMPRESSION_FAILED:${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error('PDF_EMBEDDED_FONT_DECOMPRESSION_UNAVAILABLE'); 
}

function pdfObjectStream(raw: string, objectNumber: number): { dict: string; bytes: Uint8Array } | null {
  const objectPattern = /(\d+)\s+0\s+obj\b/g;
  let objectStart = -1;
  for (const match of raw.matchAll(objectPattern)) {
    if (Number(match[1]) === objectNumber) {
      objectStart = match.index ?? -1;
      break;
    }
  }
  if (objectStart < 0) return null;

  const streamStart = raw.indexOf('stream', objectStart);
  if (streamStart < 0) return null;
  const dict = raw.slice(objectStart, streamStart);

  let contentStart = streamStart + 6;
  if (raw[contentStart] === '\r' && raw[contentStart + 1] === '\n') contentStart += 2;
  else if (raw[contentStart] === '\n' || raw[contentStart] === '\r') contentStart += 1;

  const lengthMatch = dict.match(/\/Length\s+(\d+)\b/);
  if (lengthMatch) {
    const length = Number(lengthMatch[1]);
    if (Number.isSafeInteger(length) && length >= 0 && contentStart + length <= raw.length) {
      return {
        dict,
        bytes: latin1Encode(raw.slice(contentStart, contentStart + length)),
      };
    }
  }

  const streamEnd = raw.indexOf('endstream', contentStart);
  if (streamEnd < 0) return null;
  return {
    dict,
    bytes: latin1Encode(raw.slice(contentStart, streamEnd)),
  };
}

export async function loadEmbeddedPdfGlyphMap(buffer: ArrayBuffer): Promise<PdfGlyphMap | null> {
  const raw = latin1Decode(new Uint8Array(buffer));
  const debug = (globalThis as typeof globalThis & { __PDF_FONT_DEBUG__?: boolean }).__PDF_FONT_DEBUG__ === true;
  const references = new Set<number>();
  for (const match of raw.matchAll(/\/FontFile2\s+(\d+)\s+0\s+R/g)) references.add(Number(match[1]));
  if (debug) console.log('PDF_FONT_REFS', [...references]);
  if (!references.size) return null;

  const merged: PdfGlyphMap = new Map();
  for (const objectNumber of references) {
    const stream = pdfObjectStream(raw, objectNumber);
    if (debug) console.log('PDF_FONT_STREAM', objectNumber, stream ? { dict: stream.dict.slice(0, 180), length: stream.bytes.length, first: [...stream.bytes.slice(0, 8)] } : null);
    if (!stream || !stream.dict.includes('/FlateDecode')) continue;
    let fontBytes: Uint8Array;
    try {
      fontBytes = await inflatePdfStream(stream.bytes);
    } catch (error) {
      if (debug) console.log('PDF_FONT_INFLATE_ERROR', objectNumber, error instanceof Error ? error.message : String(error));
      continue;
    }
    const map = reverseTrueTypeCmap(fontBytes);
    if (debug) console.log('PDF_FONT_CMAP_SIZE', objectNumber, map.size, 'ttfBytes', fontBytes.length);
    for (const [glyph, codePoints] of map) {
      const existing = merged.get(glyph) ?? [];
      for (const codePoint of codePoints) if (!existing.includes(codePoint)) existing.push(codePoint);
      merged.set(glyph, existing);
    }
  }

  if (debug) console.log('PDF_FONT_MERGED_SIZE', merged.size);
  return merged.size ? merged : null;
}

function isRecoveredArabic(codePoint: number): boolean {
  return (codePoint >= 0x0600 && codePoint <= 0x06ff)
    || (codePoint >= 0x0750 && codePoint <= 0x077f)
    || (codePoint >= 0x08a0 && codePoint <= 0x08ff)
    || (codePoint >= 0xfb50 && codePoint <= 0xfdff)
    || (codePoint >= 0xfe70 && codePoint <= 0xfeff);
}

function logicalizeRecoveredArabic(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || !/[\u0600-\u06ff\uFB50-\uFDFF\uFE70-\uFEFF]/.test(trimmed)) return text;
  if (/[A-Za-z0-9]/.test(trimmed)) return text;
  const words = trimmed.split(/\\s+/)
    .reverse()
    .map(word => [...word].reverse().join(''));
  return words.join(' ').normalize('NFKC');
}

function repairEmbeddedPdfText(value: string, glyphMap: PdfGlyphMap): string {
  if (![...value].some(character => character.charCodeAt(0) >= 0x0100 && character.charCodeAt(0) <= 0x02ff)) return value;
  let changed = false;
  const repaired = [...value].map(character => {
    const codePoints = glyphMap.get(character.charCodeAt(0));
    if (!codePoints?.length) return character;
    const preferred = codePoints.find(isRecoveredArabic) ?? codePoints[0];
    if (preferred === character.charCodeAt(0)) return character;
    changed = true;
    return String.fromCodePoint(preferred);
  }).join('');
  return changed ? logicalizeRecoveredArabic(repaired) : value;
}

function pdfPlacementFromItem(item: unknown): PdfTextPlacement | null {
  if (typeof item !== 'object' || item === null) return null;
  const value = item as { str?: unknown; transform?: unknown; width?: unknown };
  if (typeof value.str !== 'string' || !value.str.trim() || !Array.isArray(value.transform)) return null;
  const transform = value.transform as unknown[];
  const x = Number(transform[4]);
  const y = Number(transform[5]);
  const width = Number(value.width);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { str: value.str.trim(), x, y, width: Number.isFinite(width) ? width : 0 };
}

function groupPdfLines(items: PdfTextPlacement[]): PdfTextPlacement[][] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const groups: Array<{ y: number; items: PdfTextPlacement[] }> = [];
  for (const item of sorted) {
    const last = groups[groups.length - 1];
    if (!last || Math.abs(last.y - item.y) > PDF_TABLE_LINE_TOLERANCE) {
      groups.push({ y: item.y, items: [item] });
      continue;
    }
    last.items.push(item);
    last.y = (last.y * (last.items.length - 1) + item.y) / last.items.length;
  }
  return groups.map(group => group.items.sort((a, b) => a.x - b.x));
}

function compactArabicHeader(value: string): string {
  return normalizeColumnName(value).replace(/(?<=[\u0600-\u06FF])\s+(?=[\u0600-\u06FF])/gu, '');
}

function reverseHeaderText(value: string): string {
  return [...value].reverse().join('');
}

function headerTextMatchesAlias(value: string, alias: string): boolean {
  const normalized = normalizeColumnName(value);
  const normalizedAlias = normalizeColumnName(alias);
  const compact = compactArabicHeader(value);
  const compactAlias = compactArabicHeader(alias);
  const reversedCompact = reverseHeaderText(compact);
  return normalized === normalizedAlias
    || normalized.includes(normalizedAlias)
    || compact === compactAlias
    || compact.includes(compactAlias)
    || reversedCompact === compactAlias
    || reversedCompact.includes(compactAlias);
}

function pdfHeaderMatch(value: string): string | null {
  return [...PDF_TABLE_HEADER_ALIASES]
    .sort((a, b) => normalizeColumnName(b).length - normalizeColumnName(a).length)
    .find(alias => headerTextMatchesAlias(value, alias)) ?? null;
}

const SORTED_PDF_TABLE_ALIASES = [...PDF_TABLE_HEADER_ALIASES].sort(
  (a, b) => compactArabicHeader(b).length - compactArabicHeader(a).length,
);

function detectPdfTableHeader(line: PdfTextPlacement[]): PdfTableHeader | null {
  const orders = [
    [...line].sort((a, b) => a.x - b.x),
    [...line].sort((a, b) => b.x - a.x),
  ];

  let best: PdfTableHeader | null = null;
  for (const sorted of orders) {
    if (sorted.length < PDF_TABLE_MIN_ANCHORS) continue;

    const fullLine = sorted.map(item => item.str).join(' ');
    const candidateAliases = SORTED_PDF_TABLE_ALIASES.filter(alias =>
      headerTextMatchesAlias(fullLine, alias),
    );
    if (candidateAliases.length < PDF_TABLE_MIN_ANCHORS) continue;

    const directAnchors: PdfTableAnchor[] = [];
    const usedDirect = new Set<number>();
    for (const alias of candidateAliases) {
      const index = sorted.findIndex((item, itemIndex) =>
        !usedDirect.has(itemIndex) && headerTextMatchesAlias(item.str, alias),
      );
      if (index < 0) continue;
      usedDirect.add(index);
      const item = sorted[index];
      directAnchors.push({
        header: alias,
        centerX: item.x + item.width / 2,
        left: item.x,
        right: item.x + item.width,
      });
    }
    if (directAnchors.length >= PDF_TABLE_MIN_ANCHORS) {
      directAnchors.sort((a, b) => a.centerX - b.centerX);
      const candidate = {
        anchors: directAnchors,
        signature: directAnchors.map(anchor => normalizeColumnName(anchor.header)).join('|'),
      };
      if (!best || candidate.anchors.length > best.anchors.length) best = candidate;
      continue;
    }

    const anchors: PdfTableAnchor[] = [];
    const used = new Set<number>();

    for (const alias of candidateAliases) {
      const compactAlias = compactArabicHeader(alias);
      let found: { start: number; end: number } | null = null;

      for (let i = 0; i < sorted.length && !found; i += 1) {
        if (used.has(i)) continue;
        for (let span = 1; span <= Math.min(24, sorted.length - i); span += 1) {
          const index = i + span - 1;
          if (used.has(index)) break;
          const candidateText = sorted.slice(i, index + 1).map(item => item.str).join(' ');
          const compactCandidate = compactArabicHeader(candidateText);
          const reversedCandidate = reverseHeaderText(compactCandidate);
          const normalizedCandidate = normalizeColumnName(candidateText);
          const normalizedAlias = normalizeColumnName(alias);
          if (
            normalizedCandidate === normalizedAlias ||
            compactCandidate === compactAlias ||
            reversedCandidate === compactAlias
          ) {
            found = { start: i, end: index };
            break;
          }
        }
      }

      if (!found) continue;
      for (let index = found.start; index <= found.end; index += 1) used.add(index);

      const first = sorted[found.start];
      const last = sorted[found.end];
      anchors.push({
        header: alias,
        centerX: (Math.min(first.x, last.x) + Math.max(first.x + first.width, last.x + last.width)) / 2,
        left: Math.min(first.x, last.x),
        right: Math.max(first.x + first.width, last.x + last.width),
      });
    }

    const unique = new Set(anchors.map(anchor => normalizeColumnName(anchor.header)));
    if (unique.size < PDF_TABLE_MIN_ANCHORS) continue;

    anchors.sort((a, b) => a.centerX - b.centerX);
    const candidate = {
      anchors,
      signature: anchors.map(anchor => normalizeColumnName(anchor.header)).join('|'),
    };
    if (!best || candidate.anchors.length > best.anchors.length) best = candidate;
  }

  return best;
}

function assignPdfRow(line: PdfTextPlacement[], header: PdfTableHeader): Row | null {
  const sortedAnchors = [...header.anchors].sort((a, b) => a.centerX - b.centerX);
  const cells = sortedAnchors.map(() => [] as string[]);
  for (const item of line) {
    const center = item.x + item.width / 2;
    let bestIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;
    sortedAnchors.forEach((anchor, index) => {
      const distance = Math.abs(anchor.centerX - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    if (bestIndex >= 0) cells[bestIndex].push(item.str);
  }
  const filled = cells.filter(cell => cell.length > 0).length;
  if (filled < Math.max(PDF_TABLE_MIN_ANCHORS, Math.ceil(sortedAnchors.length * 0.45))) return null;
  const row: Row = {};
  sortedAnchors.forEach((anchor, index) => {
    row[anchor.header] = cells[index].join(' ').trim();
  });
  const values = Object.values(row).map(value => String(value ?? '').trim()).filter(Boolean);
  const hasSignal = values.some(value => /\d/.test(normalizeArabicDigits(value)) || /\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/.test(value));
  return hasSignal ? row : null;
}

export function extractPdfTableRowsFromTextItems(
  rawItems: PdfTextPlacement[],
  fallbackHeader: PdfTableHeader | null = null,
): { rows: Row[]; header: PdfTableHeader | null } {
  const items = rawItems.filter(item => item.str.trim());
  const lines = groupPdfLines(items);
  const candidates = lines
    .map((line, index) => ({ index, header: detectPdfTableHeader(line) }))
    .filter(candidate => candidate.header)
    .sort((a, b) => (b.header?.anchors.length ?? 0) - (a.header?.anchors.length ?? 0));
  const header = candidates[0]?.header ?? fallbackHeader;
  if (!header) return { rows: [], header: null };
  const headerIndices = new Set(candidates.filter(candidate => candidate.header?.signature === header.signature).map(candidate => candidate.index));
  const rows: Row[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (headerIndices.has(index)) continue;
    const row = assignPdfRow(lines[index], header);
    if (!row) continue;
    const signature = Object.values(row).map(value => normalizeColumnName(String(value))).join('|');
    if (signature === header.signature) continue;
    rows.push(row);
  }
  return { rows, header };
}

const PDF_OCR_MAX_PAGES = 20;

const PDF_OCR_MAX_DIMENSION = 2200;
const PDF_OCR_SCALE = 1.5;
type PromiseConstructorWithTry = PromiseConstructor & { try?: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => Promise<unknown> };
type Uint8ArrayWithToHex = Uint8Array & { toHex?: () => string };

function ensurePdfJsRuntimeCompatibility(): void {
  const mathWithPrecise = Math as typeof Math & { sumPrecise?: (values: Iterable<number>) => number };
  if (typeof mathWithPrecise.sumPrecise !== 'function') {
    Object.defineProperty(Math, 'sumPrecise', {
      configurable: true,
      writable: true,
      value: (values: Iterable<number>) => {
        let total = 0;
        for (const value of values) total += Number(value) || 0;
        return total;
      },
    });
  }
  if (!('DOMMatrix' in globalThis)) Object.defineProperty(globalThis, 'DOMMatrix', { configurable: true, value: class DOMMatrix {} });
  const uint8ArrayPrototype = Uint8Array.prototype as Uint8ArrayWithToHex;
  if (typeof uint8ArrayPrototype.toHex !== 'function') {
    Object.defineProperty(Uint8Array.prototype, 'toHex', {
      configurable: true,
      writable: true,
      value: function toHex(this: Uint8Array): string {
        return Array.from(this, (byte) => byte.toString(16).padStart(2, '0')).join('');
      },
    });
  }

  const promiseConstructor = Promise as PromiseConstructorWithTry;
  if (typeof promiseConstructor.try !== 'function') {
    Object.defineProperty(Promise, 'try', {
      configurable: true,
      writable: true,
      value: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) =>
        new Promise((resolve, reject) => {
          try { resolve(fn(...args)); } catch (error) { reject(error); }
        }),
    });
  }
}

function tryParseColumnMajorReceivablesText(text: string): Row[] | null {
  const normalized = normalizeArabicDigits(
    stripControlCharacters(text.normalize('NFKC'))
      .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
  const headerIndex = normalized.indexOf('رقم العميل');
  if (headerIndex < 0) return null;
  const headerSlice = normalized.slice(headerIndex);
  const requiredMarkers = ['اسم العميل', 'العملة', 'إجمالي المبلغ المستحق', '0 - 30', '31 - 60', '61 - 90', '91 - 120'];
  if (requiredMarkers.filter(marker => headerSlice.includes(marker)).length < 5) return null;

  const tokenMatches = [...normalized.slice(0, headerIndex).matchAll(/\b[A-Za-z]{3}\b/g)];
  let currencyRun: { token: string; start: number; end: number; count: number } | null = null;
  let current: { token: string; start: number; end: number; count: number } | null = null;
  for (const match of tokenMatches) {
    const token = match[0].toUpperCase();
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (!current || current.token !== token || start - current.end > 2) {
      current = { token, start, end, count: 1 };
    } else {
      current.end = end;
      current.count += 1;
    }
    if (!currencyRun || current.count > currencyRun.count) currencyRun = { ...current };
  }
  if (!currencyRun || currencyRun.count < 3) return null;
  const rowCount = currencyRun.count;
  const currency = currencyRun.token;

  function groupedNumericRuns(segment: string): Array<{ values: string[]; start: number; end: number }> {
    const matches = [...segment.matchAll(/\b(?:\d{1,3}(?:,\d{3})+|\d{4,9}|\d{1,3}(?:\.\d+)?)(?:\.\d+)?\b/g)];
    const runs: Array<{ values: string[]; start: number; end: number }> = [];
    let run: { values: string[]; start: number; end: number } | null = null;
    for (const match of matches) {
      const raw = match[0];
      const start = match.index ?? 0;
      const end = start + raw.length;
      if (!run || start - run.end > 3) {
        run = { values: [raw], start, end };
        runs.push(run);
      } else {
        run.values.push(raw);
        run.end = end;
      }
    }
    return runs;
  }

  const beforeCurrency = normalized.slice(0, currencyRun.start);
  const idRuns = groupedNumericRuns(beforeCurrency)
    .filter(run => run.values.length >= rowCount && currencyRun.start - (run.end + headerIndex * 0) < 5000)
    .sort((a, b) => Math.abs(currencyRun!.start - a.end) - Math.abs(currencyRun!.start - b.end));
  const idRun = idRuns[0];
  if (!idRun) return null;
  const ids = idRun.values.slice(-rowCount);
  if (ids.length !== rowCount) return null;

  const afterCurrency = normalized.slice(currencyRun.end, headerIndex);
  const amountRuns = groupedNumericRuns(afterCurrency).filter(run => run.values.length >= rowCount);
  const amountRun = amountRuns[0];
  if (!amountRun) return null;
  const outstanding = amountRun.values.slice(0, rowCount).map(parseNumber);
  if (outstanding.some(value => value == null)) return null;

  return ids.map((id, index) => ({
    customer_id: Number(id),
    currency,
    outstanding_balance: outstanding[index] as number,
    local_amount: outstanding[index] as number,
  }));
}

function tryParseColumnMajorSupplierText(text: string): Row[] | null {
  const normalized = normalizeArabicDigits(
    stripControlCharacters(text.normalize('NFKC'))
      .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
  const headerIndex = normalized.indexOf('رقم المورد');
  if (headerIndex < 0) return null;
  const headerSlice = normalized.slice(headerIndex);
  const requiredMarkers = ['اسم المورد', 'العمله', 'اجمالي المبلغ المستحق', 'المبلغ'];
  if (requiredMarkers.filter(marker => headerSlice.includes(marker)).length < 3) return null;

  const tokenMatches = [...normalized.slice(0, headerIndex).matchAll(/\b[A-Za-z]{3}\b/g)];
  let currencyRun: { token: string; start: number; end: number; count: number } | null = null;
  let current: { token: string; start: number; end: number; count: number } | null = null;
  for (const match of tokenMatches) {
    const token = match[0].toUpperCase();
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (!current || current.token !== token || start - current.end > 2) {
      current = { token, start, end, count: 1 };
    } else {
      current.end = end;
      current.count += 1;
    }
    if (!currencyRun || current.count > currencyRun.count) currencyRun = { ...current };
  }
  if (!currencyRun || currencyRun.count < 3) return null;
  const rowCount = currencyRun.count;
  const currency = currencyRun.token;

  const numericTokens = (segment: string): string[] => [...segment.matchAll(/\b(?:\d{1,3}(?:,\d{3})+|\d{4,9}|\d{1,3}(?:\.\d+)?)(?:\.\d+)?\b/g)].map(match => match[0]);
  const beforeCurrency = normalized.slice(0, currencyRun.start);
  const idValues = numericTokens(beforeCurrency).slice(-rowCount);
  if (idValues.length !== rowCount) return null;

  const afterCurrency = normalized.slice(currencyRun.end, headerIndex);
  const values = numericTokens(afterCurrency);
  if (values.length < rowCount * 3) return null;
  const blockCount = Math.floor(values.length / rowCount);
  if (blockCount < 3) return null;
  const blocks = Array.from({ length: blockCount }, (_, index) => values
    .slice(index * rowCount, (index + 1) * rowCount)
    .map(parseNumber));
  const purchaseBlock = blocks[0];
  const outstandingBlockIndex = Math.max(0, blockCount - (headerSlice.includes('المندوب') ? 2 : 1));
  const outstandingBlock = blocks[outstandingBlockIndex];
  if (!purchaseBlock || !outstandingBlock || purchaseBlock.some(value => value == null) || outstandingBlock.some(value => value == null)) return null;

  const salesRepBlock = headerSlice.includes('المندوب') && blockCount >= 2
    ? blocks[blockCount - 1]
    : undefined;

  return idValues.map((id, index) => ({
    supplier_id: Number(id),
    currency,
    purchase_amount: purchaseBlock[index] as number,
    outstanding_balance: outstandingBlock[index] as number,
    ...(salesRepBlock ? { sales_rep: salesRepBlock[index] ?? null } : {}),
  }));
}

function tryParseBankStatementSummaryText(text: string): Row[] | null {
  const normalized = normalizeArabicDigits(
    stripControlCharacters(text.normalize('NFKC'))
      .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
  const markers = ['البيان', 'رقمه', 'المستند', 'التاريخ', 'العملة', 'الرصيد', 'دائن', 'مدين', 'رصيد سابق'];
  const markerCount = markers.filter(marker => normalized.includes(marker)).length;
  if (markerCount < 6) return null;

  const accountNumber = normalized.match(/(?:رقم\s*الحساب|الحساب)\s*[:：]?\s*(\d{4,})/i)?.[1] ?? null;
  const dates = [...normalized.matchAll(/\b\d{4}[-\/]\d{1,2}[-\/]\d{1,2}\b/g)].map(match => match[0]);
  const currencyMatch = normalized.includes('ريال يمني') ? 'YER' : normalized.match(/(?:ريال\s+سعودي|YER|SAR|USD|EUR)/i)?.[0] ?? null;
  const financialTokens = [...normalized.matchAll(/\b(?:\d{1,3}(?:,\d{3})+|\d{1,3})(?:\.\d+)?\b/g)].map(match => match[0]).filter(value => value.includes(',') || value === '0').slice(0, 3);
  if (financialTokens.length < 3) return null;

  const balance = parseNumber(financialTokens[0]);
  const credit = parseNumber(financialTokens[1]);
  const debit = parseNumber(financialTokens[2]);
  if (balance == null || credit == null || debit == null) return null;

  return [{
    description: accountNumber ? `كشف حساب ${accountNumber}` : 'كشف حساب',
    date: dates.at(-1) ?? null,
    currency: currencyMatch,
    balance,
    credit,
    debit,
    ...(accountNumber ? { account_number: accountNumber } : {}),
  }];
}

async function parsePdfText(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  ensurePdfJsRuntimeCompatibility();
  const pdfBytes = new Uint8Array(buffer);
  const pdfBufferForParsing = pdfBytes.slice().buffer;
  const fontBuffer = pdfBytes.slice().buffer;
  const embeddedGlyphMapPromise = pdfBytes.some(byte => byte >= 0x80) ? loadEmbeddedPdfGlyphMap(fontBuffer).catch(() => null) : Promise.resolve(null);
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
  }
  const pdf: PdfDocument = await pdfjs.getDocument({
    data: new Uint8Array(pdfBufferForParsing),
    useSystemFonts: true,
  }).promise;
  const pages: string[] = [];
  const tableRows: Row[] = [];
  let activeTableHeader: PdfTableHeader | null = null;
  let tablePageCount = 0;
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent({ disableCombineTextItems: true });
    const embeddedGlyphMap = await embeddedGlyphMapPromise;
    const placements = content.items
      .map(item => pdfPlacementFromItem(item))
      .filter((item): item is PdfTextPlacement => item !== null)
      .map(item => embeddedGlyphMap ? { ...item, str: repairEmbeddedPdfText(item.str, embeddedGlyphMap) } : item);
    const table = extractPdfTableRowsFromTextItems(placements, activeTableHeader);
    if (table.header) activeTableHeader = table.header;
    if (table.rows.length >= 1) {
      tableRows.push(...table.rows);
      tablePageCount += 1;
    }
    const text = placements.map(item => item.str).filter(Boolean).join(' ');
    if (text.trim()) pages.push(`PAGE ${pageNumber}\n${text}`);
  }
  if (tableRows.length >= 2 && tablePageCount >= 1) return [await buildDataset(tableRows, fileName, 'pdf-table')];
  if (pages.length) {
    const pageText = pages.join('\n\n');
    const supplierColumnMajor = tryParseColumnMajorSupplierText(pageText);
    if (supplierColumnMajor && supplierColumnMajor.length >= 2) return [await buildDataset(supplierColumnMajor, fileName, 'pdf-column-major-supplier')];
    const receivablesColumnMajor = tryParseColumnMajorReceivablesText(pageText);
    if (receivablesColumnMajor && receivablesColumnMajor.length >= 2) return [await buildDataset(receivablesColumnMajor, fileName, 'pdf-column-major-receivables')];
    const bankStatementSummary = tryParseBankStatementSummaryText(pageText);
    if (bankStatementSummary) return [await buildDataset(bankStatementSummary, fileName, 'pdf-bank-statement-summary')];
    const meaningfulText = pageText.replace(/PAGE\s+\d+/gi, ' ').replace(/\b\d+\s*\/\s*\d+\b/g, ' ').trim();
    if (!/[\\p{L}]/u.test(meaningfulText) || meaningfulText.length < 64) return parseScannedPdfWithOcr(pdf, fileName, buffer);
    return buildTextDataset(pageText, fileName, 'pdf');
  }
  if (typeof document === 'undefined') return parseScannedPdfWithNativeOcr(pdf, fileName, buffer);
  return parseScannedPdfWithOcr(pdf, fileName);
}

function tryParseOcrBankStatementText(text: string): Row[] | null {
  const normalized = normalizeArabicDigits(
    stripControlCharacters(text.normalize('NFKC'))
      .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, ' ')
      .replace(/\r\n?/g, '\n')
      .trim(),
  );

  const lines = normalized
    .split(/\n+/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line && !/^PAGE\s+\d+$/i.test(line));

  const rows: Row[] = [];
  const datePattern = /\b(\d{1,2}[./-]\d{1,2}[./-]20\d{2})\b/;
  const amountPattern = /([\d٠-٩]{1,3}(?:[,٬][\d٠-٩]{3})*(?:[.٫][\d٠-٩]+)?)\s*(?:ريال|ريال\s*يمن|YER)\b/i;
  const referencePattern = /\b(\d{10,16})\b/;
  const numericPattern = /[\d٠-٩]{1,3}(?:[,٬][\d٠-٩]{3})*(?:[.٫][\d٠-٩]+)?/g;

  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    const amountMatch = line.match(amountPattern);
    const referenceMatch = line.match(referencePattern);
    if (!dateMatch || !amountMatch || !referenceMatch) continue;

    const paymentAmount = parseNumber(amountMatch[1]);
    if (paymentAmount == null) continue;

    const afterPayment = line.slice((amountMatch.index ?? 0) + amountMatch[0].length);
    const candidateBalances = [...afterPayment.matchAll(numericPattern)]
      .map(match => ({ raw: match[0], index: match.index ?? 0, value: parseNumber(match[0]) }))
      .filter(candidate => candidate.value != null)
      .filter(candidate => !/^\d{1,2}$/.test(candidate.raw))
      .filter(candidate => candidate.value !== paymentAmount)
      .filter(candidate => !/^20\d{2}$/.test(candidate.raw))
      .sort((a, b) => a.index - b.index);

    const balanceCandidate = candidateBalances.find(candidate =>
      candidate.raw.includes('.') || candidate.raw.includes('٬') || candidate.raw.includes(',') || (candidate.value ?? 0) > 1000,
    ) ?? candidateBalances[0];

    const reference = referenceMatch[1];
    const dateParts = dateMatch[1].split(/[./-]/).map(part => Number(part));
    if (dateParts.length !== 3) continue;
    const [day, month, year] = dateParts;
    const isoDate = String(year).padStart(4, '0') + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');

    const description = line
      .replace(dateMatch[1], ' ')
      .replace(reference, ' ')
      .replace(amountMatch[0], ' ')
      .replace(balanceCandidate?.raw ?? '', ' ')
      .replace(/\b\d{1,2}:\d{2}\b/g, ' ')
      .replace(/\b\d{1,2}\.\d{2}\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    rows.push({
      date: isoDate,
      reference,
      payment_amount: paymentAmount,
      balance: balanceCandidate?.value ?? undefined,
      currency: 'YER',
      description: description.slice(0, 1600),
      debit: /\bدفع\b/.test(line) ? paymentAmount : undefined,
      credit: /\bتحويل\s+من\b|\bإيداع\b/.test(line) ? paymentAmount : undefined,
    });
  }

  const deduplicated = rows.filter((row, index, all) =>
    index === all.findIndex(candidate => candidate.reference === row.reference && candidate.date === row.date),
  );
  return deduplicated.length >= 3 ? deduplicated : null;
}


async function parseScannedPdfWithNativeOcr(
  pdf: PdfDocument,
  fileName: string,
  sourceBuffer: ArrayBuffer,
): Promise<Dataset[]> {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const path = await import('node:path');
  const execFileAsync = promisify(execFile);

  const hasCommand = async (name: string): Promise<boolean> => {
    try {
      await execFileAsync('sh', ['-lc', `command -v ${name}`], { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  };

  if (!(await hasCommand('pdftoppm')) || !(await hasCommand('tesseract'))) {
    throw new Error('PDF_SCANNED_IMAGE_ONLY_SERVER_AUTHORITY_UNAVAILABLE: native OCR runtime requires pdftoppm and tesseract.');
  }
  if (pdf.numPages > PDF_OCR_MAX_PAGES) {
    throw new Error(`PDF_OCR_PAGE_LIMIT_EXCEEDED: ${pdf.numPages} pages exceeds the safe OCR limit of ${PDF_OCR_MAX_PAGES}.`);
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aghbari-pdf-ocr-'));
  const inputPdf = path.join(tempRoot, 'source.pdf');
  const pages: string[] = [];
  const confidences: number[] = [];

  try {
    await fs.writeFile(inputPdf, new Uint8Array(sourceBuffer));
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const imagePrefix = path.join(tempRoot, `page-${pageNumber}`);
      const imagePath = `${imagePrefix}.png`;
      await execFileAsync(
        'pdftoppm',
        ['-png', '-r', '220', '-f', String(pageNumber), '-l', String(pageNumber), '-singlefile', inputPdf, imagePrefix],
        { timeout: 60000, maxBuffer: 4 * 1024 * 1024 },
      );
      const { stdout } = await execFileAsync(
        'tesseract',
        [imagePath, 'stdout', '-l', 'ara+eng', '--psm', '6', 'tsv'],
        { timeout: 120000, maxBuffer: 16 * 1024 * 1024 },
      );

      const lines = new Map<string, string[]>();
      const pageConfidences: number[] = [];
      for (const row of String(stdout).split(/\r?\n/).slice(1)) {
        const fields = row.split('\t');
        if (fields.length < 12 || Number(fields[0]) !== 5) continue;
        const lineNumber = fields[4] || '0';
        const confidence = Number(fields[10]);
        const token = (fields[11] || '').trim();
        if (Number.isFinite(confidence) && confidence >= 0) pageConfidences.push(confidence);
        if (!token) continue;
        const bucket = lines.get(lineNumber) ?? [];
        bucket.push(token);
        lines.set(lineNumber, bucket);
      }

      for (const words of lines.values()) {
        const line = words.join(' ').trim();
        if (line) pages.push(`PAGE ${pageNumber}\n${line}`);
      }

      confidences.push(
        pageConfidences.length
          ? pageConfidences.reduce((sum, value) => sum + value, 0) / pageConfidences.length
          : 0,
      );
      await fs.rm(imagePath, { force: true }).catch(() => undefined);
    }
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => undefined);
  }

  if (!pages.length) throw new Error('PDF_SCANNED_OCR_EMPTY: OCR produced no readable text.');
  const minimumConfidence = confidences.length ? Math.min(...confidences) : 0;
  const disposition = classifyOcrConfidence(minimumConfidence);
  if (disposition === 'REJECT') {
    throw new Error(`PDF_OCR_LOW_CONFIDENCE_REJECT:${Math.round(minimumConfidence)}% (threshold < ${OCR_REJECT_THRESHOLD})`);
  }

  const ocrText = pages.join('\n\n');
  const bankRows = tryParseOcrBankStatementText(ocrText);
  if (bankRows) {
    const dataset = await buildDataset(bankRows, fileName, 'pdf-ocr-bank-statement');
    dataset.qualityScore = Math.min(dataset.qualityScore, Math.round(minimumConfidence));
    dataset.columns.forEach(column => {
      column.qualityIssues.push(
        disposition === 'REVIEW'
          ? `OCR_REVIEW_REQUIRED:${Math.round(minimumConfidence)}%`
          : `OCR_TRUSTED:${Math.round(minimumConfidence)}%`,
      );
    });
    return [dataset];
  }

  const warning = disposition === 'REVIEW'
    ? `OCR_REVIEW_REQUIRED:${Math.round(minimumConfidence)}%`
    : `OCR_TRUSTED:${Math.round(minimumConfidence)}%`;
  return buildTextDataset(ocrText, fileName, 'pdf-ocr', warning, minimumConfidence);
}

async function parseScannedPdfWithBrowserOcr(pdf: PdfDocument, fileName: string): Promise<Dataset[]> {
  if (pdf.numPages > PDF_OCR_MAX_PAGES) throw new Error(`PDF_OCR_PAGE_LIMIT_EXCEEDED: ${pdf.numPages} pages exceeds the safe OCR limit of ${PDF_OCR_MAX_PAGES}.`);
  const tesseract = await import('tesseract.js');
  const worker = await tesseract.createWorker('ara+eng');
  const pages: string[] = [];
  const confidences: number[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: PDF_OCR_SCALE });
      const scale = Math.min(1, PDF_OCR_MAX_DIMENSION / Math.max(baseViewport.width, baseViewport.height));
      const viewport = scale < 1 ? page.getViewport({ scale: PDF_OCR_SCALE * scale }) : baseViewport;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      const context = canvas.getContext('2d');
      if (!context) throw new Error(`PDF_OCR_CANVAS_UNAVAILABLE: page ${pageNumber}`);
      await page.render({ canvasContext: context, viewport, canvas }).promise;
      const result = await worker.recognize(canvas);
      const text = typeof result?.data?.text === 'string' ? result.data.text.trim() : '';
      const confidence = Number(result?.data?.confidence ?? 0);
      confidences.push(confidence);
      if (text) pages.push(`PAGE ${pageNumber}\n${text}`);
      canvas.width = 1;
      canvas.height = 1;
    }
  } finally {
    await worker.terminate();
  }
  if (!pages.length) throw new Error('PDF_SCANNED_OCR_EMPTY: OCR produced no readable text.');
  const minimumConfidence = confidences.length ? Math.min(...confidences) : 0;
  const disposition = classifyOcrConfidence(minimumConfidence);
  if (disposition === 'REJECT') {
    throw new Error(`PDF_OCR_LOW_CONFIDENCE_REJECT:${Math.round(minimumConfidence)}% (threshold < ${OCR_REJECT_THRESHOLD})`);
  }
  const warning = disposition === 'REVIEW'
    ? `OCR_REVIEW_REQUIRED:${Math.round(minimumConfidence)}%`
    : `OCR_TRUSTED:${Math.round(minimumConfidence)}%`;
  return buildTextDataset(pages.join('\n\n'), fileName, 'pdf-ocr', warning, minimumConfidence);
}

async function parseScannedPdfWithOcr(
  pdf: PdfDocument,
  fileName: string,
  sourceBuffer: ArrayBuffer,
): Promise<Dataset[]> {
  if (typeof document === 'undefined') {
    return parseScannedPdfWithNativeOcr(pdf, fileName, sourceBuffer);
  }
  return parseScannedPdfWithBrowserOcr(pdf, fileName);
}

async function parseDocxText(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const mammoth = await import('mammoth'); const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return buildTextDataset(result.value, fileName, 'docx', result.messages.length ? `DOCX_EXTRACTION_WARNINGS:${result.messages.length}` : undefined);
}

async function parseImageText(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  const tesseract: any = await import('tesseract.js');
  const worker = await tesseract.createWorker('ara+eng');
  try {
    const image = new Blob([buffer], { type: 'application/octet-stream' });
    const { data } = await worker.recognize(image);
    const confidence = Number(data?.confidence ?? 0);
    const disposition = classifyOcrConfidence(confidence);
    if (disposition === 'REJECT') {
      throw new Error(`OCR_LOW_CONFIDENCE_REJECT:${Math.round(confidence)}% (threshold < ${OCR_REJECT_THRESHOLD})`);
    }
    const warning = disposition === 'REVIEW'
      ? `OCR_REVIEW_REQUIRED:${Math.round(confidence)}%`
      : `OCR_TRUSTED:${Math.round(confidence)}%`;
    return buildTextDataset(data.text, fileName, 'image', warning, confidence);
  } finally {
    await worker.terminate();
  }
}

export async function parseSpreadsheet(buffer: ArrayBuffer, fileName: string, _format: FileFormat): Promise<Dataset[]> {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true }); const datasets: Dataset[] = [];
  for (const sheetName of wb.SheetNames) { const matrix = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], { header: 1, defval: '', raw: true }); const candidate = detectHeaderRow(matrix); if (!candidate) continue; const rows = rowsFromDetectedHeader(matrix, candidate) as Row[]; if (rows.length) datasets.push(await buildDataset(rows, `${fileName} — ${sheetName}`, fileName, sheetName)); }
  return datasets;
}

export async function parseCSV(buffer: ArrayBuffer, fileName: string, delimiter?: string): Promise<Dataset[]> { const rows = parseCSVText(decodeBuffer(buffer), delimiter); return rows.length ? [await buildDataset(rows, fileName, fileName)] : []; }
function decodeBuffer(buffer: ArrayBuffer): string { const bytes = new Uint8Array(buffer); const start = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0; return new TextDecoder('utf-8').decode(bytes.slice(start)); }
function parseCSVText(text: string, delimiter?: string): Row[] { const lines = text.split(/\r?\n/).filter((line) => line.trim()); if (!lines.length) return []; const delim = delimiter ?? detectDelimiter(lines[0]); const matrix = lines.map((line) => parseCSVLine(line, delim)); const candidate = detectHeaderRow(matrix); if (!candidate) return []; return rowsFromDetectedHeader(matrix, candidate) as Row[]; }
function detectDelimiter(line: string): string { const candidates = [',', ';', '\t', '|']; const scored = candidates.map((delimiter) => ({ delimiter, fields: parseCSVLine(line, delimiter).length })).sort((a, b) => b.fields - a.fields); return scored[0]?.fields && scored[0].fields > 1 ? scored[0].delimiter : ','; }
function parseCSVLine(line: string, delimiter: string): string[] { const result: string[] = []; let current = ''; let quoted = false; for (let i = 0; i < line.length; i += 1) { const ch = line[i]; if (ch === '"') { if (quoted && line[i + 1] === '"') { current += '"'; i += 1; } else quoted = !quoted; } else if (ch === delimiter && !quoted) { result.push(current.trim()); current = ''; } else current += ch; } result.push(current.trim()); return result; }

export async function parseJSON(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> { return parseJSONData(JSON.parse(decodeBuffer(buffer)), fileName); }
export async function parseJSONL(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> { const rows = decodeBuffer(buffer).split(/\r?\n/).filter(Boolean).map((line) => { const value: unknown = JSON.parse(line); if (!isRecord(value)) throw new Error('JSONL contains a non-object row'); return value; }); return rows.length ? [await buildDataset(rows, fileName, fileName)] : []; }
async function parseJSONData(data: unknown, fileName: string, path = ''): Promise<Dataset[]> { if (Array.isArray(data)) { if (!data.length) return []; if (!data.every(isRecord)) throw new Error('JSON dataset contains non-object rows'); return [await buildDataset(data, path || fileName, fileName)]; } if (!isRecord(data)) return []; const datasets: Dataset[] = []; for (const [key, value] of Object.entries(data)) { if (Array.isArray(value) && value.length) { if (!value.every(isRecord)) throw new Error(`JSON dataset ${key} contains non-object rows`); datasets.push(await buildDataset(value, path ? `${path} → ${key}` : key, fileName, key)); } } return datasets.length ? datasets : [await buildDataset([data], path || fileName, fileName)]; }

export async function parseFile(buffer: ArrayBuffer, fileName: string, format: FileFormat): Promise<Dataset[]> {
  switch (format) {
    case 'xlsx': case 'xls': case 'xlsm': case 'ods': return parseSpreadsheet(buffer, fileName, format);
    case 'csv': return parseCSV(buffer, fileName); case 'tsv': return parseCSV(buffer, fileName, '\t'); case 'json': return parseJSON(buffer, fileName); case 'jsonl': return parseJSONL(buffer, fileName); case 'txt': case 'markdown': return parseCSV(buffer, fileName);
    case 'pdf': return parsePdfText(buffer, fileName); case 'docx': return parseDocxText(buffer, fileName);
    case 'jpg': case 'jpeg': case 'png': case 'webp': case 'tiff': case 'bmp': return parseImageText(buffer, fileName);
    case 'doc': case 'rtf': case 'xml': case 'yaml': case 'zip': throw new Error(`${format.toUpperCase()}_PARSER_UNAVAILABLE: هذا التنسيق يحتاج محولًا مخصصًا قبل الكتابة؛ لم يتم تخمين محتواه.`);
    default: throw new Error(`Unsupported parser for format: ${format}`);
  }
}