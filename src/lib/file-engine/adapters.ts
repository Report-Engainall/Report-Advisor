import * as XLSX from 'xlsx';
import type { FileFormat, Dataset, ColumnProfile, ColumnStatistics } from './types';
import { normalizeRows, normalizeColumnName, normalizeArabicDigits, parseNumber } from './normalizer';
import { detectColumnDataType, cleanValue } from './data-types';
import { mapColumns } from './synonyms';
import { detectHeaderRow, rowsFromDetectedHeader } from './header-detection';
import { extractPdfTable, extractPdfVisualLines, extractPdfVisualRows, type PdfPageText } from './pdf-table';

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

const PDF_OCR_MAX_PAGES = 120;

const PDF_OCR_MAX_DIMENSION = 2200;
const PDF_OCR_SCALE = 1.5;
type PromiseConstructorWithTry = PromiseConstructor & { try?: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => Promise<unknown> };
type Uint8ArrayWithToHex = Uint8Array & { toHex?: () => string };

function ensurePdfJsRuntimeCompatibility(): void {
  const runtimeGlobal = globalThis as typeof globalThis & {
    DOMMatrix?: new (...args: unknown[]) => unknown;
    DOMMatrixReadOnly?: new (...args: unknown[]) => unknown;
    Path2D?: new (...args: unknown[]) => unknown;
    ImageData?: new (...args: unknown[]) => unknown;
  };

  if (typeof runtimeGlobal.DOMMatrix === 'undefined') {
    class ServerDOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      m11 = 1; m12 = 0; m13 = 0; m14 = 0;
      m21 = 0; m22 = 1; m23 = 0; m24 = 0;
      m31 = 0; m32 = 0; m33 = 1; m34 = 0;
      m41 = 0; m42 = 0; m43 = 0; m44 = 1;
      is2D = true;
      isIdentity = true;

      constructor(init?: unknown) {
        if (Array.isArray(init) && init.length >= 6) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init.slice(0, 6).map(Number) as [number, number, number, number, number, number];
        } else if (init && typeof init === 'object') {
          const value = init as Record<string, unknown>;
          for (const key of ['a', 'b', 'c', 'd', 'e', 'f'] as const) {
            if (Number.isFinite(Number(value[key]))) this[key] = Number(value[key]);
          }
        }
        this.syncMatrix();
      }

      private syncMatrix(): void {
        this.m11 = this.a; this.m12 = this.b; this.m21 = this.c; this.m22 = this.d; this.m41 = this.e; this.m42 = this.f;
        this.is2D = true;
        this.isIdentity = this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.e === 0 && this.f === 0;
      }

      multiply(other: ServerDOMMatrix): ServerDOMMatrix {
        return new ServerDOMMatrix([
          this.a * other.a + this.c * other.b,
          this.b * other.a + this.d * other.b,
          this.a * other.c + this.c * other.d,
          this.b * other.c + this.d * other.d,
          this.a * other.e + this.c * other.f + this.e,
          this.b * other.e + this.d * other.f + this.f,
        ]);
      }

      multiplySelf(other: ServerDOMMatrix): this {
        const next = this.multiply(other);
        Object.assign(this, next);
        this.syncMatrix();
        return this;
      }

      preMultiplySelf(other: ServerDOMMatrix): this {
        const next = other.multiply(this);
        Object.assign(this, next);
        this.syncMatrix();
        return this;
      }

      translate(tx = 0, ty = 0): ServerDOMMatrix {
        return this.multiply(new ServerDOMMatrix([1, 0, 0, 1, tx, ty]));
      }

      translateSelf(tx = 0, ty = 0): this {
        return this.multiplySelf(new ServerDOMMatrix([1, 0, 0, 1, tx, ty]));
      }

      scale(sx = 1, sy = sx): ServerDOMMatrix {
        return this.multiply(new ServerDOMMatrix([sx, 0, 0, sy, 0, 0]));
      }

      scaleSelf(sx = 1, sy = sx): this {
        return this.multiplySelf(new ServerDOMMatrix([sx, 0, 0, sy, 0, 0]));
      }

      rotate(angle = 0): ServerDOMMatrix {
        const radians = angle * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        return this.multiply(new ServerDOMMatrix([cos, sin, -sin, cos, 0, 0]));
      }

      rotateSelf(angle = 0): this {
        return this.multiplySelf(this.rotate(angle));
      }

      inverse(): ServerDOMMatrix {
        const determinant = this.a * this.d - this.b * this.c;
        if (!determinant) throw new Error('DOMMatrix_NOT_INVERTIBLE');
        return new ServerDOMMatrix([
          this.d / determinant,
          -this.b / determinant,
          -this.c / determinant,
          this.a / determinant,
          (this.c * this.f - this.d * this.e) / determinant,
          (this.b * this.e - this.a * this.f) / determinant,
        ]);
      }

      invertSelf(): this {
        const next = this.inverse();
        Object.assign(this, next);
        this.syncMatrix();
        return this;
      }

      toFloat32Array(): Float32Array {
        return new Float32Array([this.a, this.b, this.c, this.d, this.e, this.f]);
      }

      toFloat64Array(): Float64Array {
        return new Float64Array([this.a, this.b, this.c, this.d, this.e, this.f]);
      }

      toString(): string {
        return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
      }
    }

    runtimeGlobal.DOMMatrix = ServerDOMMatrix;
    runtimeGlobal.DOMMatrixReadOnly = ServerDOMMatrix;
  }

  if (typeof runtimeGlobal.Path2D === 'undefined') {
    class ServerPath2D {
      constructor(_path?: unknown) {}
      addPath(_path: unknown, _transform?: unknown): void {}
      closePath(): void {}
      moveTo(_x: number, _y: number): void {}
      lineTo(_x: number, _y: number): void {}
      bezierCurveTo(_cp1x: number, _cp1y: number, _cp2x: number, _cp2y: number, _x: number, _y: number): void {}
      quadraticCurveTo(_cpx: number, _cpy: number, _x: number, _y: number): void {}
      rect(_x: number, _y: number, _w: number, _h: number): void {}
      arc(_x: number, _y: number, _radius: number, _startAngle: number, _endAngle: number, _counterClockwise?: boolean): void {}
      arcTo(_x1: number, _y1: number, _x2: number, _y2: number, _radius: number): void {}
      ellipse(_x: number, _y: number, _radiusX: number, _radiusY: number, _rotation: number, _startAngle: number, _endAngle: number, _counterClockwise?: boolean): void {}
    }
    runtimeGlobal.Path2D = ServerPath2D;
  }

  if (typeof runtimeGlobal.ImageData === 'undefined') {
    class ServerImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      colorSpace = 'srgb';

      constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
        if (typeof dataOrWidth === 'number') {
          this.width = dataOrWidth;
          this.height = widthOrHeight;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        } else {
          this.data = dataOrWidth;
          this.width = widthOrHeight;
          this.height = height ?? Math.max(1, Math.floor(this.data.length / Math.max(1, this.width * 4)));
        }
      }
    }
    runtimeGlobal.ImageData = ServerImageData;
  }

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

async function parsePdfText(buffer: ArrayBuffer, fileName: string): Promise<Dataset[]> {
  ensurePdfJsRuntimeCompatibility();
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
  }
  const pdf: PdfDocument = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  }).promise;

  const pages: PdfPageText[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items: PdfPageText['items'] = [];
    for (const item of content.items) {
      if (!('str' in item) || typeof item.str !== 'string' || !item.str.trim()) continue;
      const transform = Array.isArray((item as { transform?: unknown }).transform)
        ? (item as { transform: number[] }).transform
        : [];
      items.push({
        text: item.str,
        x: Number.isFinite(transform[4]) ? transform[4] : 0,
        y: Number.isFinite(transform[5]) ? transform[5] : 0,
        width: Number.isFinite((item as { width?: number }).width) ? Number((item as { width?: number }).width) : Math.max(4, item.str.length * 4),
        height: Number.isFinite((item as { height?: number }).height) ? Number((item as { height?: number }).height) : 10,
      });
    }
    pages.push({ pageNumber, items });
  }

  const table = extractPdfTable(pages);
  if (table) {
    const dataset = await buildDataset(table.rows, fileName, 'pdf');
    for (const column of dataset.columns) {
      column.qualityIssues.push(`PDF_TABLE_RECONSTRUCTED:${table.confidence}%`);
    }
    dataset.qualityScore = Math.max(dataset.qualityScore, Math.min(95, table.confidence));
    return [dataset];
  }

  const visualRows = extractPdfVisualRows(pages);
  if (visualRows.length) {
    const cellCount = Math.max(1, ...visualRows.map((row) => row.cells.length));
    const rows: Row[] = visualRows.map((line) => {
      const row: Row = {
        page_number: line.pageNumber,
        line_number: line.lineNumber,
        text: line.cells.join(' | '),
      };
      for (let index = 0; index < cellCount; index += 1) {
        row[`visual_cell_${index + 1}`] = line.cells[index] ?? '';
      }
      return row;
    });
    const dataset = await buildDataset(rows, fileName, 'pdf');
    for (const column of dataset.columns) {
      column.qualityIssues.push('PDF_TABLE_STRUCTURE_NOT_CONFIRMED: النص محفوظ حسب الصفحة والسطر بدل دمج الصفحة في عبارة واحدة');
    }
    // The content was extracted losslessly, but table semantics are not proven.
    // Keep it in REVIEW rather than rejecting a real document before it can be inspected.
    dataset.qualityScore = Math.max(55, Math.min(dataset.qualityScore, 74));
    return [dataset];
  }
  return parseScannedPdfWithOcr(pdf, fileName);
}

async function parseScannedPdfWithOcr(pdf: PdfDocument, fileName: string): Promise<Dataset[]> {
  if (typeof document === 'undefined') throw new Error('PDF_SCANNED_IMAGE_ONLY_SERVER_AUTHORITY_UNAVAILABLE: scanned-PDF OCR requires an authoritative OCR-capable runtime; no business data was fabricated.');
  if (pdf.numPages > PDF_OCR_MAX_PAGES) throw new Error(`PDF_OCR_PAGE_LIMIT_EXCEEDED: ${pdf.numPages} pages exceeds the safe OCR limit of ${PDF_OCR_MAX_PAGES}. Split the document or enable an approved server OCR adapter before analysis.`);
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
      canvas.width = 1; canvas.height = 1;
    }
  } finally {
    await worker.terminate();
  }
  if (!pages.length) throw new Error('PDF_SCANNED_OCR_EMPTY: OCR produced no readable text; no business data was fabricated.');
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